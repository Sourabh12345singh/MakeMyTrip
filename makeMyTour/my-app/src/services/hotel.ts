import api from "@/lib/axios";

export const getHotels = () => api.get("/hotels");

export const getHotelById = (id: string) => api.get(`/hotels/${id}`);

export const addHotel = (hotelData: {
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}) => api.post("/admin/hotels", hotelData);

export const editHotel = (hotelId: string, hotelData: {
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
}) => api.put(`/admin/hotels/${hotelId}`, hotelData);

export const deleteHotel = (hotelId: string) => api.delete(`/admin/hotels/${hotelId}`);
