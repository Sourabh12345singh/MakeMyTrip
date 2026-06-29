"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getHotels } from "@/services/hotel";
import { bookHotel } from "@/services/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hotel, MapPin, ShieldAlert, CheckCircle, Bed, Sparkles, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface HotelData {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

export default function HotelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search filter
  const [searchLocation, setSearchLocation] = useState("");

  // Booking state
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null);
  const [rooms, setRooms] = useState(1);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchHotelsList = async () => {
    setLoading(true);
    try {
      const response = await getHotels();
      // Normalize id and amenities
      const normalizedHotels = (response.data || []).map((h: any) => ({
        ...h,
        id: h.id || h._id
      }));
      setHotels(normalizedHotels);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch hotels. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelsList();
  }, []);

  const openBookingModal = (hotel: HotelData) => {
    setSelectedHotel(hotel);
    setRooms(1);
    setBookingSuccess(false);
    setBookingDialogOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedHotel || !user) return;
    setBookingLoading(true);
    try {
      await bookHotel({
        email: user.email,
        hotelId: selectedHotel.id,
        rooms: rooms,
        price: selectedHotel.pricePerNight * rooms
      });
      setBookingSuccess(true);
      fetchHotelsList(); // Refresh hotel list
      setTimeout(() => {
        setBookingDialogOpen(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter hotels based on search location
  const filteredHotels = hotels.filter((hotel) =>
    hotel.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-2 text-white">
          <Hotel className="h-8 w-8 text-sky-400" />
          Recommended Hotels
        </h1>

        {/* Search Input Widget (Calm & simple dark-glass style) */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-slate-700/40 w-full md:max-w-md px-4 shadow-lg">
          <Search className="h-4 w-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search by city or location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder:text-slate-400"
          />
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
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-12 text-slate-300 bg-black/60 border border-slate-700/40 rounded-xl shadow-lg p-6">
          No hotels found matching your search location.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <Card key={hotel.id} className="bg-black/60 backdrop-blur-md border border-slate-700/40 hover:border-sky-500/40 transition-all duration-300 text-white shadow-xl hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between text-white">
                  <span>{hotel.hotelName}</span>
                  <span className="text-sky-400 font-extrabold text-lg">₹{hotel.pricePerNight}/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-200">
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <span>{hotel.location}</span>
                </div>

                {hotel.amenities && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.split(",").map((amenity, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-850 border border-slate-700/60 text-sky-400 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/40">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5 text-sky-400" />
                    {hotel.availableRooms} rooms left
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => openBookingModal(hotel)}
                    disabled={hotel.availableRooms <= 0}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
                  >
                    {hotel.availableRooms <= 0 ? "No Rooms" : "Book Now"}
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
            <DialogTitle className="text-white">Confirm Hotel Booking</DialogTitle>
          </DialogHeader>

          {!user ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <ShieldAlert className="h-12 w-12 text-sky-400" />
              <p className="font-semibold text-white">Login Required</p>
              <p className="text-sm text-slate-300">You must be logged in to book a hotel.</p>
              <Button className="mt-4 bg-sky-500 hover:bg-sky-600" onClick={() => router.push("/login")}>Login Now</Button>
            </div>
          ) : bookingSuccess ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <CheckCircle className="h-12 w-12 text-sky-400 animate-bounce" />
              <p className="font-bold text-lg text-sky-400">Hotel Booked Successfully!</p>
              <p className="text-sm text-slate-300">Reservation confirmed at {selectedHotel?.hotelName}.</p>
            </div>
          ) : (
            selectedHotel && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-1">
                  <p className="font-bold text-white">{selectedHotel.hotelName}</p>
                  <p className="text-sm text-slate-300">Location: {selectedHotel.location}</p>
                  <p className="text-sm text-slate-300">Price per Night: ₹{selectedHotel.pricePerNight}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms" className="text-white">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min={1}
                    max={selectedHotel.availableRooms}
                    value={rooms}
                    onChange={(e) => setRooms(Math.min(selectedHotel.availableRooms, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 font-bold text-lg text-white">
                  <span>Total Price:</span>
                  <span className="text-sky-400">₹{selectedHotel.pricePerNight * rooms}</span>
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
