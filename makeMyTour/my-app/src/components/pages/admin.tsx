"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getFlights, addFlight, editFlight, deleteFlight } from "@/services/flight";
import { getHotels, addHotel, editHotel, deleteHotel } from "@/services/hotel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Plus, Edit, Trash2, Plane, Hotel } from "lucide-react";

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

interface HotelData {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);

  // Dialog states
  const [isFlightDialogOpen, setIsFlightDialogOpen] = useState(false);
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [editingHotel, setEditingHotel] = useState<HotelData | null>(null);

  // Flight Form states
  const [flightForm, setFlightForm] = useState({
    flightName: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  });

  // Hotel Form states
  const [hotelForm, setHotelForm] = useState({
    hotelName: "",
    location: "",
    pricePerNight: 0,
    availableRooms: 0,
    amenities: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        setTimeout(() => router.push("/"), 2000);
      } else {
        fetchFlights();
        fetchHotels();
      }
    }
  }, [user, isAdmin, authLoading]);

  const fetchFlights = async () => {
    setLoadingFlights(true);
    try {
      const res = await getFlights();
      const normalized = (res.data || []).map((f: any) => ({ ...f, id: f.id || f._id }));
      setFlights(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFlights(false);
    }
  };

  const fetchHotels = async () => {
    setLoadingHotels(true);
    try {
      const res = await getHotels();
      const normalized = (res.data || []).map((h: any) => ({ ...h, id: h.id || h._id }));
      setHotels(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHotels(false);
    }
  };

  // Flight Handlers
  const handleOpenFlightAdd = () => {
    setEditingFlight(null);
    setFlightForm({
      flightName: "",
      from: "",
      to: "",
      departureTime: "",
      arrivalTime: "",
      price: 0,
      availableSeats: 0,
    });
    setIsFlightDialogOpen(true);
  };

  const handleOpenFlightEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightForm({
      flightName: flight.flightName,
      from: flight.from,
      to: flight.to,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      price: flight.price,
      availableSeats: flight.availableSeats,
    });
    setIsFlightDialogOpen(true);
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFlight) {
        await editFlight(editingFlight.id, flightForm);
        alert("Flight updated successfully!");
      } else {
        await addFlight(flightForm);
        alert("Flight added successfully!");
      }
      setIsFlightDialogOpen(false);
      fetchFlights();
    } catch (err: any) {
      alert("Error saving flight details.");
    }
  };

  const handleFlightDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flight?")) return;
    try {
      await deleteFlight(id);
      alert("Flight deleted!");
      fetchFlights();
    } catch (e) {
      alert("Delete failed.");
    }
  };

  // Hotel Handlers
  const handleOpenHotelAdd = () => {
    setEditingHotel(null);
    setHotelForm({
      hotelName: "",
      location: "",
      pricePerNight: 0,
      availableRooms: 0,
      amenities: "",
    });
    setIsHotelDialogOpen(true);
  };

  const handleOpenHotelEdit = (hotel: HotelData) => {
    setEditingHotel(hotel);
    setHotelForm({
      hotelName: hotel.hotelName,
      location: hotel.location,
      pricePerNight: hotel.pricePerNight,
      availableRooms: hotel.availableRooms,
      amenities: hotel.amenities,
    });
    setIsHotelDialogOpen(true);
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        await editHotel(editingHotel.id, hotelForm);
        alert("Hotel updated successfully!");
      } else {
        await addHotel(hotelForm);
        alert("Hotel added successfully!");
      }
      setIsHotelDialogOpen(false);
      fetchHotels();
    } catch (e) {
      alert("Error saving hotel details.");
    }
  };

  const handleHotelDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await deleteHotel(id);
      alert("Hotel deleted!");
      fetchHotels();
    } catch (e) {
      alert("Delete failed.");
    }
  };

  if (authLoading) {
    return <div className="text-center py-20">Checking authorizations...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permissions to view this admin workspace. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Admin Control Panel</h1>

      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="flights" className="flex items-center gap-1.5">
            <Plane className="h-4 w-4" /> Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-1.5">
            <Hotel className="h-4 w-4" /> Hotels
          </TabsTrigger>
        </TabsList>

        {/* FLIGHTS TAB */}
        <TabsContent value="flights">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Flights</h2>
            <Button onClick={handleOpenFlightAdd} className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Flight
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="p-4">Flight Name</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Timing</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Seats</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingFlights ? (
                      <tr><td colSpan={6} className="text-center p-8">Loading flights...</td></tr>
                    ) : flights.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No flights found.</td></tr>
                    ) : (
                      flights.map((flight) => (
                        <tr key={flight.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-semibold">{flight.flightName}</td>
                          <td className="p-4">{flight.from} → {flight.to}</td>
                          <td className="p-4 text-xs text-muted-foreground">{flight.departureTime} - {flight.arrivalTime}</td>
                          <td className="p-4 font-bold text-emerald-600">₹{flight.price}</td>
                          <td className="p-4">{flight.availableSeats}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleOpenFlightEdit(flight)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleFlightDelete(flight.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOTELS TAB */}
        <TabsContent value="hotels">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Hotels</h2>
            <Button onClick={handleOpenHotelAdd} className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Hotel
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="p-4">Hotel Name</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Amenities</th>
                      <th className="p-4">Price/Night</th>
                      <th className="p-4">Rooms</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHotels ? (
                      <tr><td colSpan={6} className="text-center p-8">Loading hotels...</td></tr>
                    ) : hotels.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No hotels found.</td></tr>
                    ) : (
                      hotels.map((hotel) => (
                        <tr key={hotel.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-semibold">{hotel.hotelName}</td>
                          <td className="p-4">{hotel.location}</td>
                          <td className="p-4 max-w-[200px] truncate text-xs text-muted-foreground">{hotel.amenities}</td>
                          <td className="p-4 font-bold text-emerald-600">₹{hotel.pricePerNight}</td>
                          <td className="p-4">{hotel.availableRooms}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleOpenHotelEdit(hotel)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleHotelDelete(hotel.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Flight dialog form */}
      <Dialog open={isFlightDialogOpen} onOpenChange={setIsFlightDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFlight ? "Edit Flight details" : "Add New Flight"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFlightSubmit} className="space-y-4 py-2">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="flightName">Flight Name</Label>
              <Input
                id="flightName"
                placeholder="e.g. Indigo 6E-204"
                value={flightForm.flightName}
                onChange={(e) => setFlightForm({ ...flightForm, flightName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="e.g. Delhi (DEL)"
                  value={flightForm.from}
                  onChange={(e) => setFlightForm({ ...flightForm, from: e.target.value })}
                  required
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="e.g. Mumbai (BOM)"
                  value={flightForm.to}
                  onChange={(e) => setFlightForm({ ...flightForm, to: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="dep">Departure Time</Label>
                <Input
                  id="dep"
                  placeholder="e.g. 10:00 AM"
                  value={flightForm.departureTime}
                  onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                  required
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="arr">Arrival Time</Label>
                <Input
                  id="arr"
                  placeholder="e.g. 12:30 PM"
                  value={flightForm.arrivalTime}
                  onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 5000"
                  value={flightForm.price}
                  onChange={(e) => setFlightForm({ ...flightForm, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="seats">Seats Available</Label>
                <Input
                  id="seats"
                  type="number"
                  placeholder="e.g. 180"
                  value={flightForm.availableSeats}
                  onChange={(e) => setFlightForm({ ...flightForm, availableSeats: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFlightDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Flight</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hotel dialog form */}
      <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHotel ? "Edit Hotel details" : "Add New Hotel"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHotelSubmit} className="space-y-4 py-2">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input
                id="hotelName"
                placeholder="e.g. Taj Palace"
                value={hotelForm.hotelName}
                onChange={(e) => setHotelForm({ ...hotelForm, hotelName: e.target.value })}
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Mumbai"
                value={hotelForm.location}
                onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="pricePerNight">Price / Night (₹)</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  placeholder="e.g. 8000"
                  value={hotelForm.pricePerNight}
                  onChange={(e) => setHotelForm({ ...hotelForm, pricePerNight: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="rooms">Rooms Available</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="e.g. 20"
                  value={hotelForm.availableRooms}
                  onChange={(e) => setHotelForm({ ...hotelForm, availableRooms: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="e.g. Free Wifi, Pool, Spa"
                value={hotelForm.amenities}
                onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsHotelDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Hotel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
