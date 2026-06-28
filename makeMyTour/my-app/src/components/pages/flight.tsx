"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFlights } from "@/services/flight";
import { bookFlight } from "@/services/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Clock, ShieldAlert, CheckCircle, Search, MapPin } from "lucide-react";

interface Flight {
  id: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

export default function FlightPage() {
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search inputs
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  // Booking state
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState(1);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchFlightsList = async () => {
    setLoading(true);
    try {
      const response = await getFlights();
      const normalizedFlights = (response.data || []).map((f: any) => ({
        ...f,
        id: f.id || f._id
      }));
      setFlights(normalizedFlights);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch flights. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightsList();
  }, []);

  const openBookingModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setSeats(1);
    setBookingSuccess(false);
    setBookingDialogOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedFlight || !user) return;
    setBookingLoading(true);
    try {
      await bookFlight({
        email: user.email,
        flightId: selectedFlight.id,
        seats: seats,
        price: selectedFlight.price * seats
      });
      setBookingSuccess(true);
      fetchFlightsList(); // Refresh flight list to get updated seats
      setTimeout(() => {
        setBookingDialogOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter flights list based on search parameters
  const filteredFlights = flights.filter((flight) => {
    const matchesFrom = flight.from.toLowerCase().includes(searchFrom.toLowerCase());
    const matchesTo = flight.to.toLowerCase().includes(searchTo.toLowerCase());
    return matchesFrom && matchesTo;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Plane className="h-8 w-8 text-blue-600" />
          Available Flights
        </h1>

        {/* Search Bar Widget */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl shadow-sm border w-full md:max-w-xl">
          <div className="flex-1 flex items-center gap-2 px-2 border-b sm:border-b-0 sm:border-r pb-2 sm:pb-0">
            <MapPin className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="From (e.g. Delhi)"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="To (e.g. Mumbai)"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse h-48 bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-white rounded-xl shadow-sm border p-6">
          No flights match your search query. Try clearing your search parameters!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlights.map((flight) => (
            <Card key={flight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>{flight.flightName}</span>
                  <span className="text-emerald-600 font-extrabold text-lg">₹{flight.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground block">FROM</span>
                    {flight.from}
                  </div>
                  <Plane className="h-4 w-4 text-blue-500 transform rotate-90" />
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">TO</span>
                    {flight.to}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Dep: {flight.departureTime}</span>
                  </div>
                  <div>
                    <span>Arr: {flight.arrivalTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-slate-500 font-semibold">
                    {flight.availableSeats} seats left
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => openBookingModal(flight)}
                    disabled={flight.availableSeats <= 0}
                  >
                    {flight.availableSeats <= 0 ? "Sold Out" : "Book Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Flight Booking</DialogTitle>
          </DialogHeader>

          {!user ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <ShieldAlert className="h-12 w-12 text-amber-500" />
              <p className="font-semibold">Login Required</p>
              <p className="text-sm text-muted-foreground">You must be logged in to book a flight.</p>
              <Button className="mt-4" onClick={() => window.location.href="/login"}>Login Now</Button>
            </div>
          ) : bookingSuccess ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <CheckCircle className="h-12 w-12 text-emerald-500 animate-bounce" />
              <p className="font-bold text-lg text-emerald-600">Booking Confirmed!</p>
              <p className="text-sm text-muted-foreground">Enjoy your trip with {selectedFlight?.flightName}.</p>
            </div>
          ) : (
            selectedFlight && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                  <p className="font-bold">{selectedFlight.flightName}</p>
                  <p className="text-sm text-muted-foreground">{selectedFlight.from} → {selectedFlight.to}</p>
                  <p className="text-sm text-muted-foreground">Departure: {selectedFlight.departureTime}</p>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Input
                    type="number"
                    id="seats"
                    min={1}
                    max={selectedFlight.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, Math.min(selectedFlight.availableSeats, parseInt(e.target.value) || 1)))}
                  />
                  <p className="text-xs text-muted-foreground">Max available: {selectedFlight.availableSeats}</p>
                </div>

                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total Cost</span>
                  <span className="text-emerald-600">₹{selectedFlight.price * seats}</span>
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="ghost" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleBooking} disabled={bookingLoading}>
                    {bookingLoading ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </DialogFooter>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
