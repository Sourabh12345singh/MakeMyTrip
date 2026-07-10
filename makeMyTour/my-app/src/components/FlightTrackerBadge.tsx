"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTrackedFlights, type TrackedFlightData } from "@/services/flightStatus";
import { Plane, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function FlightTrackerBadge() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [delayed, setDelayed] = useState(0);

  useEffect(() => {
    if (!user?.email) {
      setTotal(0);
      setDelayed(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await getTrackedFlights(user.email);
        const flights = res.data || [];
        setTotal(flights.length);
        setDelayed(flights.filter((f: TrackedFlightData) => f.status?.status === "DELAYED" || f.status?.status === "CANCELLED").length);
      } catch {
        setTotal(0);
        setDelayed(0);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [user?.email]);

  if (total === 0) return null;

  return (
    <Link href="/flight-status">
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-2.5 shadow-lg hover:shadow-xl hover:bg-slate-800/90 transition-all cursor-pointer group">
        <Plane className="h-4 w-4 text-sky-400 group-hover:animate-pulse" />
        <span className="text-sm font-semibold text-white">{total} tracked</span>
        {delayed > 0 && (
          <div className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            {delayed}
          </div>
        )}
      </div>
    </Link>
  );
}
