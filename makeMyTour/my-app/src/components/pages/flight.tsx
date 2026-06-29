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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
        <h1 className="text-3xl font-extrabold flex items-center gap-2 text-white">
          <Plane className="h-8 w-8 text-sky-400" />
          Available Flights
        </h1>

        {/* Search Bar Widget (Calm & simple dark-glass style) */}
        <div className="flex flex-col sm:flex-row gap-3 bg-black/60 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-700/40 w-full md:max-w-xl">
          <div className="flex-1 flex items-center gap-2 px-2 border-b border-slate-700/40 sm:border-b-0 sm:border-r pb-2 sm:pb-0">
            <MapPin className="h-4 w-4 text-sky-400" />
            <input
              type="text"
              placeholder="From (e.g. Delhi)"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder:text-slate-400"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 px-2">
            <MapPin className="h-4 w-4 text-sky-400" />
            <input
              type="text"
              placeholder="To (e.g. Mumbai)"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse h-48 bg-black/40 border-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 font-semibold">{error}</div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-12 text-slate-300 bg-black/60 border border-slate-700/40 rounded-xl shadow-lg p-6">
          No flights match your search query. Try clearing your search parameters!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlights.map((flight) => (
            <Card key={flight.id} className="bg-black/60 backdrop-blur-md border border-slate-700/40 hover:border-sky-500/40 transition-all duration-300 text-white shadow-xl hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between text-white">
                  <span>{flight.flightName}</span>
                  <span className="text-sky-400 font-extrabold text-lg">₹{flight.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-white bg-slate-800/40 border border-slate-700/40 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">FROM</span>
                    {flight.from}
                  </div>
                  {/* Plane logo points to the right corner (natural 45-degree angle) */}
                  <Plane className="h-4 w-4 text-sky-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">TO</span>
                    {flight.to}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    <span>Dep: {flight.departureTime}</span>
                  </div>
                  <div>
                    <span>Arr: {flight.arrivalTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                  <span className="text-xs text-slate-300 font-semibold">
                    {flight.availableSeats} seats left
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => openBookingModal(flight)}
                    disabled={flight.availableSeats <= 0}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
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
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Flight Booking</DialogTitle>
          </DialogHeader>

          {!user ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <ShieldAlert className="h-12 w-12 text-sky-400" />
              <p className="font-semibold text-white">Login Required</p>
              <p className="text-sm text-slate-300">You must be logged in to book a flight.</p>
              <Button className="mt-4 bg-sky-500 hover:bg-sky-600" onClick={() => router.push("/login")}>Login Now</Button>
            </div>
          ) : bookingSuccess ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <CheckCircle className="h-12 w-12 text-sky-400 animate-bounce" />
              <p className="font-bold text-lg text-sky-400">Flight Booked Successfully!</p>
              <p className="text-sm text-slate-300">Your reservation has been confirmed.</p>
            </div>
          ) : (
            selectedFlight && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-1">
                  <p className="font-bold text-white">{selectedFlight.flightName}</p>
                  <p className="text-sm text-slate-300">Route: {selectedFlight.from} ➔ {selectedFlight.to}</p>
                  <p className="text-sm text-slate-300">Departure: {selectedFlight.departureTime}</p>
                  <p className="text-sm text-slate-300">Base Price: ₹{selectedFlight.price} per seat</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats" className="text-white">Number of Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={selectedFlight.availableSeats}
                    value={seats}
                    onChange={(e) => setSeats(Math.min(selectedFlight.availableSeats, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 font-bold text-lg text-white">
                  <span>Total Price:</span>
                  <span className="text-sky-400">₹{selectedFlight.price * seats}</span>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="ghost"
                    onClick={() => setBookingDialogOpen(false)}
                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
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
