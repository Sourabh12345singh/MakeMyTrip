"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getBookings } from "@/services/booking";
import { getRefunds, RefundData } from "@/services/refund";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Plane, Hotel, Calendar, CreditCard, XCircle, RefreshCw, Headphones } from "lucide-react";
import CancelBookingDialog from "./CancelBookingDialog";
import RefundStatusTracker from "./RefundStatusTracker";
import ContactSupportDialog from "./ContactSupportDialog";
import { useRefundTracking } from "@/hooks/useRefundTracking";

interface Booking {
  type: string;
  bookingId: string;
  date: string;
  quantity: number;
  totalPrice: number;
  cancelled?: boolean;
  refundId?: string;
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refunds, setRefunds] = useState<RefundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [supportTarget, setSupportTarget] = useState<Booking | null>(null);

  useRefundTracking(user?.email, (updated) => {
    setRefunds((prev) => {
      const existing = prev.findIndex((r) => r.id === updated.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchData();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bkRes, rfRes] = await Promise.all([
        getBookings(user.email),
        getRefunds(user.email),
      ]);
      setBookings(bkRes.data || []);
      setRefunds(rfRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load booking history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelled = () => {
    fetchData();
  };

  if (authLoading || (user && loading)) {
    return <div className="text-center py-20 text-slate-300">Loading your bookings...</div>;
  }

  const activeBookings = bookings.filter((b) => !b.cancelled);
  const cancelledBookings = bookings.filter((b) => b.cancelled);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          <Briefcase className="h-8 w-8 text-sky-400" />
          My Bookings
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-black/60 border border-slate-700/40 rounded-xl flex flex-col items-center justify-center p-6 space-y-4">
          <Briefcase className="h-16 w-16 text-slate-600" />
          <h2 className="text-xl font-semibold text-white">No bookings found</h2>
          <p className="text-slate-400 text-sm max-w-sm">You haven&apos;t booked any flights or hotels yet. Start planning your next trip now!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active bookings */}
          {activeBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Active Bookings</h2>
              <div className="space-y-3">
                {activeBookings.map((booking, idx) => (
                  <Card key={`active-${idx}`} className="bg-black/60 backdrop-blur-md border border-slate-700/40 text-white hover:border-sky-500/40 transition-all">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${booking.type === "Flight" ? "bg-sky-500/10 text-sky-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                            {booking.type === "Flight" ? <Plane className="h-5 w-5" /> : <Hotel className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white">{booking.type} Booking</h3>
                              <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px]">{booking.type}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">ID: {booking.bookingId}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-sky-400" />
                                <span>{booking.date}</span>
                              </div>
                              <div>
                                {booking.quantity} {booking.type === "Flight" ? "seat(s)" : "room(s)"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                              <CreditCard className="h-3 w-3" /> Total Paid
                            </span>
                            <span className="font-extrabold text-xl text-emerald-400">₹{booking.totalPrice}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCancelTarget(booking)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled bookings */}
          {cancelledBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Cancelled Bookings</h2>
              <div className="space-y-3">
                {cancelledBookings.map((booking, idx) => {
                  const refund = refunds.find((r) => r.id === booking.refundId);
                  return (
                    <Card key={`cancelled-${idx}`} className="bg-black/40 border border-slate-700/30 text-white/70">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-slate-700/30 text-slate-400">
                              {booking.type === "Flight" ? <Plane className="h-5 w-5" /> : <Hotel className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-300">{booking.type} Booking</h3>
                                <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">Cancelled</Badge>
                                <button
                                  onClick={() => setSupportTarget(booking)}
                                  className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-full transition-colors"
                                  title="Contact support"
                                >
                                  <Headphones className="h-3 w-3" />
                                  Help
                                </button>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">ID: {booking.bookingId}</p>
                              <div className="text-xs text-slate-500 mt-2">
                                <span>{booking.date} · {booking.quantity} {booking.type === "Flight" ? "seat(s)" : "room(s)"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-500">Total Paid</span>
                            <div className="font-bold text-slate-400 line-through">₹{booking.totalPrice}</div>
                          </div>
                        </div>
                        {refund && (
                          <RefundStatusTracker
                            status={refund.status}
                            refundPercent={refund.refundPercent}
                            refundAmount={refund.refundAmount}
                            expectedCompletionDate={refund.expectedCompletionDate}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel dialog */}
      {cancelTarget && user && (
        <CancelBookingDialog
          booking={cancelTarget}
          userEmail={user.email}
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
          onCancelled={handleCancelled}
        />
      )}

      {/* Support dialog */}
      {supportTarget && (
        <ContactSupportDialog
          bookingId={supportTarget.bookingId}
          open={!!supportTarget}
          onOpenChange={(open) => { if (!open) setSupportTarget(null); }}
        />
      )}
    </div>
  );
}
