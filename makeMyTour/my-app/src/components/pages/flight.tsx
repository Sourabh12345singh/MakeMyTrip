"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFlights } from "@/services/flight";
import { bookFlight } from "@/services/booking";
import { trackFlight, untrackFlight, getTrackedFlights } from "@/services/flightStatus";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Clock, ShieldAlert, CheckCircle, Search, MapPin, Radio, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PriceFreezeButton from "./PriceFreezeButton";
import PriceHistoryGraph from "./PriceHistoryGraph";
import SeatMapDialog from "./SeatMapDialog";

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
  
  // Tracking state
  const [trackedFlightIds, setTrackedFlightIds] = useState<Set<string>>(new Set());
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);

  // Search inputs
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  // Dynamic pricing
  const { priceMap, recentChanges } = useDynamicPricing(flights.map((f) => f.id), user?.email);
  const [priceHistoryFlight, setPriceHistoryFlight] = useState<Flight | null>(null);

  // Booking state
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState(1);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Seat selection state
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

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

  useEffect(() => {
    if (!user?.email) return;
    getTrackedFlights(user.email).then((res) => {
      const ids = new Set<string>();
      (res.data || []).forEach((tf: any) => ids.add(tf.flightId));
      setTrackedFlightIds(ids);
    }).catch(() => {});
  }, [user?.email]);

  const handleToggleTrack = async (flight: Flight) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setTrackingLoading(flight.id);
    try {
      if (trackedFlightIds.has(flight.id)) {
        const res = await getTrackedFlights(user.email);
        const tf = (res.data || []).find((t: any) => t.flightId === flight.id);
        if (tf) {
          await untrackFlight(tf.id);
          setTrackedFlightIds((prev) => { const next = new Set(prev); next.delete(flight.id); return next; });
          toast.success(`Stopped tracking ${flight.flightName}`);
        }
      } else {
        await trackFlight(user.email, flight.id);
        setTrackedFlightIds((prev) => new Set(prev).add(flight.id));
        toast.success(`Now tracking ${flight.flightName}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update tracking");
    } finally {
      setTrackingLoading(null);
    }
  };

  const openBookingModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setSeats(1);
    setSelectedSeats([]);
    setBookingSuccess(false);
    setBookingDialogOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedFlight || !user) return;
    setBookingLoading(true);
    const currentPrice = priceMap[selectedFlight.id] ?? selectedFlight.price;
    try {
      await bookFlight({
        email: user.email,
        flightId: selectedFlight.id,
        seats: seats,
        price: currentPrice * seats,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : undefined,
      });
      setBookingSuccess(true);
      setTrackedFlightIds((prev) => new Set(prev).add(selectedFlight.id));
      toast.success(`Now tracking ${selectedFlight.flightName} live`);
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
          {filteredFlights.map((flight) => {
            const dynamicPrice = priceMap[flight.id] ?? flight.price;
            const change = recentChanges[flight.id];
            const priceFlashClass = change === "up"
              ? "text-red-400 transition-colors duration-300"
              : change === "down"
              ? "text-emerald-400 transition-colors duration-300"
              : "text-sky-400";
            return (
            <Card key={flight.id} className="bg-black/60 backdrop-blur-md border border-slate-700/40 hover:border-sky-500/40 transition-all duration-300 text-white shadow-xl hover:shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl font-bold text-white">{flight.flightName}</CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriceFreezeButton
                      flightId={flight.id}
                      flightName={flight.flightName}
                      currentPrice={dynamicPrice}
                      userEmail={user?.email}
                      onFreeze={() => {
                        setTrackedFlightIds((prev) => new Set(prev).add(flight.id));
                      }}
                    />
                    <span className={`${priceFlashClass} font-extrabold text-lg transition-colors duration-500`}>₹{Math.round(dynamicPrice)}</span>
                    <button
                      onClick={() => setPriceHistoryFlight(flight)}
                      className="text-slate-500 hover:text-sky-400 transition-colors"
                      title="Price history"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm bg-slate-800/30 border border-slate-700/30 p-3 rounded-lg">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider">FROM</div>
                    <div className="font-semibold text-white">{flight.from}</div>
                    <div className="text-[11px] text-slate-400">{flight.departureTime}</div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-16 h-px bg-slate-600" />
                    <Plane className="h-4 w-4 text-sky-400 -rotate-45" />
                    <div className="w-16 h-px bg-slate-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider">TO</div>
                    <div className="font-semibold text-white">{flight.to}</div>
                    <div className="text-[11px] text-slate-400">{flight.arrivalTime}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{flight.availableSeats}</span> seats left
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleTrack(flight)}
                      disabled={trackingLoading === flight.id}
                      className={`border-slate-700 font-semibold transition-colors h-8 text-xs px-3 ${
                        trackedFlightIds.has(flight.id)
                          ? "text-sky-400 border-sky-500/40 hover:bg-sky-500/10"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Radio className={`h-3.5 w-3.5 mr-1.5 ${trackedFlightIds.has(flight.id) ? "animate-pulse" : ""}`} />
                      {trackedFlightIds.has(flight.id) ? "Tracking" : "Track"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openBookingModal(flight)}
                      disabled={flight.availableSeats <= 0}
                      className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold transition-all h-8 text-xs px-4 shadow-lg shadow-sky-500/20"
                    >
                      {flight.availableSeats <= 0 ? "Sold Out" : "Book Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
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
            selectedFlight && (() => {
              const modalPrice = priceMap[selectedFlight.id] ?? selectedFlight.price;
              return (
              <div className="space-y-4 py-4">
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-1">
                  <p className="font-bold text-white">{selectedFlight.flightName}</p>
                  <p className="text-sm text-slate-300">Route: {selectedFlight.from} ➔ {selectedFlight.to}</p>
                  <p className="text-sm text-slate-300">Departure: {selectedFlight.departureTime}</p>
                  <p className="text-sm text-slate-300">Current Price: <span className="text-sky-400 font-bold">₹{Math.round(modalPrice)}</span> per seat</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats" className="text-white">Number of Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={selectedFlight.availableSeats}
                    value={seats}
                    onChange={(e) => {
                      setSeats(Math.min(selectedFlight.availableSeats, Math.max(1, parseInt(e.target.value) || 1)));
                      setSelectedSeats([]);
                    }}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setSeatMapOpen(true)}
                    className="w-full border-slate-600 text-sky-400 hover:text-sky-300 hover:border-sky-500"
                  >
                    {selectedSeats.length > 0
                      ? `Selected Seats: ${selectedSeats.join(", ")}`
                      : "Select Your Seats"}
                  </Button>
                </div>

                <div className="flex justify-between items-center pt-2 font-bold text-lg text-white">
                  <span>Total Price:</span>
                  <span className="text-sky-400">₹{Math.round((priceMap[selectedFlight.id] ?? selectedFlight.price) * seats)}</span>
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
            );
            })()
          )}
        </DialogContent>
      </Dialog>

      {/* Seat Map Dialog */}
      {selectedFlight && (
        <SeatMapDialog
          open={seatMapOpen}
          onOpenChange={setSeatMapOpen}
          flightId={selectedFlight.id}
          flightName={selectedFlight.flightName}
          basePrice={priceMap[selectedFlight.id] ?? selectedFlight.price}
          maxSeats={seats}
          userEmail={user?.email}
          onConfirm={(seatsArray) => setSelectedSeats(seatsArray)}
        />
      )}

      {/* Price History Dialog */}
      {priceHistoryFlight && (
        <PriceHistoryGraph
          flightId={priceHistoryFlight.id}
          flightName={priceHistoryFlight.flightName}
          open={!!priceHistoryFlight}
          onOpenChange={(open) => { if (!open) setPriceHistoryFlight(null); }}
        />
      )}
    </div>
  );
}
