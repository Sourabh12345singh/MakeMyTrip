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
import { Hotel, MapPin, ShieldAlert, CheckCircle, Bed, Sparkles } from "lucide-react";

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
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Hotel className="h-8 w-8 text-indigo-600" />
        Recommended Hotels
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse h-48 bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No hotels found. Add hotels through Admin panel!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>{hotel.hotelName}</span>
                  <span className="text-emerald-600 font-extrabold text-lg">₹{hotel.pricePerNight}/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>{hotel.location}</span>
                </div>

                {hotel.amenities && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.split(",").map((amenity, idx) => (
                      <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    {hotel.availableRooms} rooms left
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => openBookingModal(hotel)}
                    disabled={hotel.availableRooms <= 0}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Hotel Booking</DialogTitle>
          </DialogHeader>

          {!user ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <ShieldAlert className="h-12 w-12 text-amber-500" />
              <p className="font-semibold">Login Required</p>
              <p className="text-sm text-muted-foreground">You must be logged in to book a hotel.</p>
              <Button className="mt-4" onClick={() => window.location.href="/login"}>Login Now</Button>
            </div>
          ) : bookingSuccess ? (
            <div className="py-6 flex flex-col items-center text-center gap-2">
              <CheckCircle className="h-12 w-12 text-emerald-500 animate-bounce" />
              <p className="font-bold text-lg text-emerald-600">Hotel Booked Successfully!</p>
              <p className="text-sm text-muted-foreground">Reservation confirmed at {selectedHotel?.hotelName}.</p>
            </div>
          ) : (
            selectedHotel && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                  <p className="font-bold">{selectedHotel.hotelName}</p>
                  <p className="text-sm text-muted-foreground">Location: {selectedHotel.location}</p>
                  <p className="text-sm text-muted-foreground">Price per Night: ₹{selectedHotel.pricePerNight}</p>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    type="number"
                    id="rooms"
                    min={1}
                    max={selectedHotel.availableRooms}
                    value={rooms}
                    onChange={(e) => setRooms(Math.max(1, Math.min(selectedHotel.availableRooms, parseInt(e.target.value) || 1)))}
                  />
                  <p className="text-xs text-muted-foreground">Max available: {selectedHotel.availableRooms}</p>
                </div>

                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total Price</span>
                  <span className="text-emerald-600">₹{selectedHotel.pricePerNight * rooms}</span>
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="ghost" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleBooking} disabled={bookingLoading}>
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
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
