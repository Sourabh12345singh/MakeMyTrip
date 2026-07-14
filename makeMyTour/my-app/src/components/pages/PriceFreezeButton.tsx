"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { freezePrice, getActiveFreezes, PriceFreezeData } from "@/services/pricing";
import { Snowflake, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  flightId: string;
  flightName: string;
  currentPrice: number;
  userEmail?: string;
  onFreeze?: () => void;
}

export default function PriceFreezeButton({ flightId, flightName, currentPrice, userEmail, onFreeze }: Props) {
  const [loading, setLoading] = useState(false);
  const [freeze, setFreeze] = useState<PriceFreezeData | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!userEmail) return;
    getActiveFreezes(userEmail).then((res) => {
      const found = (res.data || []).find((f) => f.flightId === flightId);
      if (found) setFreeze(found);
    }).catch(() => {});
  }, [userEmail, flightId]);

  useEffect(() => {
    if (!freeze?.expiresAt) return;
    const tick = () => {
      const now = new Date();
      const exp = new Date(freeze.expiresAt);
      const diff = exp.getTime() - now.getTime();
      if (diff <= 0) {
        setFreeze(null);
        setTimeLeft("");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [freeze]);

  const handleFreeze = async () => {
    if (!userEmail) {
      toast.error("Login required to freeze price");
      return;
    }
    setLoading(true);
    try {
      const res = await freezePrice(userEmail, flightId);
      setFreeze(res.data);
      toast.success(`Price frozen at ₹${currentPrice} for 24h`);
      onFreeze?.();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to freeze price");
    } finally {
      setLoading(false);
    }
  };

  if (freeze) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
        <Snowflake className="h-3 w-3" />
        <span>Frozen at ₹{Math.round(freeze.frozenPrice)}</span>
        {timeLeft && (
          <span className="flex items-center gap-0.5 text-slate-400">
            <Clock className="h-2.5 w-2.5" />
            {timeLeft}
          </span>
        )}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleFreeze}
      disabled={loading || !userEmail}
      className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 text-xs h-7"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Snowflake className="h-3 w-3 mr-1" />
      )}
      Freeze ₹{Math.round(currentPrice)}
    </Button>
  );
}
