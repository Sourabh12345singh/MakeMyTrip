"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getBookings } from "@/services/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plane, Hotel, Calendar, CreditCard } from "lucide-react";

interface Booking {
  type: string;       // "Flight" or "Hotel"
  bookingId: string;  
  date: string;
  quantity: number;
  totalPrice: number;
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchUserBookings();
      }
    }
  }, [user, authLoading]);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      if (user) {
        const response = await getBookings(user.email);
        setBookings(response.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load booking history.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && loading)) {
    return <div className="text-center py-20">Loading your bookings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <Briefcase className="h-8 w-8 text-sky-400" />
        My Bookings
      </h1>

      {error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
          <Briefcase className="h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-semibold">No bookings found</h2>
          <p className="text-muted-foreground text-sm max-w-sm">You haven&apos;t booked any flights or hotels yet. Start planning your next trip now!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <Card key={idx} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${booking.type === "Flight" ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"}`}>
                    {booking.type === "Flight" ? <Plane className="h-6 w-6" /> : <Hotel className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{booking.type} Booking</h3>
                      <Badge variant={booking.type === "Flight" ? "default" : "secondary"}>
                        {booking.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">ID: {booking.bookingId}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Date booked: {booking.date}</span>
                      </div>
                      <div>
                        <span>Quantity: {booking.quantity} {booking.type === "Flight" ? "seat(s)" : "room(s)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                  <span className="text-xs text-muted-foreground sm:block flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Total Paid
                  </span>
                  <span className="font-extrabold text-xl text-emerald-600">₹{booking.totalPrice}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
