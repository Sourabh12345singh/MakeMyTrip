import api from "@/lib/axios";

export const getFlights = () => api.get("/flights");

export const getFlightById = (id: string) => api.get(`/flights/${id}`);

export const addFlight = (flightData: {
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}) => api.post("/admin/flights", flightData);

export const editFlight = (flightId: string, flightData: {
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}) => api.put(`/admin/flights/${flightId}`, flightData);

export const deleteFlight = (flightId: string) => api.delete(`/admin/flights/${flightId}`);