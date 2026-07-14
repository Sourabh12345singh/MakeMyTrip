import api from "@/lib/axios";

export const bookFlight = (data: {
  email: string;
  flightId: string;
  seats: number;
  price: number;
  selectedSeats?: string[];
}) => api.post("/bookings/flight", data);

export const bookHotel = (data: {
  email: string;
  hotelId: string;
  rooms: number;
  price: number;
  roomTypeId?: string;
}) => api.post("/bookings/hotel", data);

export const getBookings = (email: string) => api.get(`/bookings/${email}`);
