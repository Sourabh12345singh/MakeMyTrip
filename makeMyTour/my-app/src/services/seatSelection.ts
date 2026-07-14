import api from "@/lib/axios";

export const getSeatMap = (flightId: string) => api.get(`/api/seats/${flightId}`);

export const bookSeats = (data: {
  flightId: string;
  seatNumbers: string[];
}) => api.post("/api/seats/book", data);

export const getRoomTypes = (hotelId: string) => api.get(`/api/rooms/${hotelId}`);

export const bookRoomType = (data: {
  hotelId: string;
  roomTypeId: string;
  quantity: number;
}) => api.post("/api/rooms/book", data);

export const getPreferences = (email: string) => api.get(`/api/preferences/${email}`);

export const savePreference = (data: {
  email: string;
  type: string;
  value: string;
}) => api.post("/api/preferences/save", data);
