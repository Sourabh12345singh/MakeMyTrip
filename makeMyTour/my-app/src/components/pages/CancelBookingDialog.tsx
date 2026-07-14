"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCancellationReasons, cancelBooking } from "@/services/refund";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BookingSummary {
  type: string;
  bookingId: string;
  date: string;
  quantity: number;
  totalPrice: number;
}

interface Props {
  booking: BookingSummary;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

function calcRefundPercent(bookingDate: string): number {
  const booked = new Date(bookingDate);
  const now = new Date();
  const hours = (now.getTime() - booked.getTime()) / 3600000;
  if (hours <= 24) return 50;
  if (hours <= 48) return 25;
  return 10;
}

export default function CancelBookingDialog({ booking, userEmail, open, onOpenChange, onCancelled }: Props) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelectedReason("");
    getCancellationReasons()
      .then((res) => setReasons(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const refundPct = calcRefundPercent(booking.date);
  const refundAmt = Math.round(booking.totalPrice * refundPct / 100);

  const handleConfirm = async () => {
    if (!selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }
    setSubmitting(true);
    try {
      await cancelBooking(userEmail, booking.bookingId, selectedReason);
      toast.success("Booking cancelled. Refund is being processed.");
      onCancelled();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Cancellation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Cancel {booking.type} Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Booking summary */}
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg text-sm space-y-1">
            <p className="font-semibold text-white">
              {booking.type === "Flight" ? "✈️" : "🏨"} {booking.type} Booking
            </p>
            <p className="text-slate-400 text-xs">ID: {booking.bookingId}</p>
            <p className="text-slate-400 text-xs">Booked on: {booking.date}</p>
            <p className="text-slate-400 text-xs">Quantity: {booking.quantity}</p>
            <p className="text-white font-bold mt-1">Total Paid: ₹{booking.totalPrice}</p>
          </div>

          {/* Refund calculation */}
          <div className="bg-sky-500/5 border border-sky-500/20 p-3 rounded-lg">
            <p className="text-sm font-semibold text-sky-400">Refund Policy</p>
            <p className="text-xs text-slate-300 mt-1">
              {refundPct}% of ₹{booking.totalPrice} = <span className="text-emerald-400 font-bold">₹{refundAmt}</span>
            </p>
            <div className="mt-2 space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Within 24h of booking</span>
                <span className="text-slate-300">50%</span>
              </div>
              <div className="flex justify-between">
                <span>Within 48h of booking</span>
                <span className="text-slate-300">25%</span>
              </div>
              <div className="flex justify-between">
                <span>After 48h</span>
                <span className="text-slate-300">10%</span>
              </div>
            </div>
          </div>

          {/* Reason dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Reason for cancellation</label>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading reasons...
              </div>
            ) : (
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-sky-500/50"
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || !selectedReason}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processing...</>
            ) : (
              `Cancel & Refund ₹${refundAmt}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
