import api from "@/lib/axios";

export interface FlightStatusData {
  id: string;
  flightId: string;
  status: string;
  delayDuration?: string;
  delayReason?: string;
  revisedDepartureTime?: string;
  revisedArrivalTime?: string;
  estimatedArrivalTime?: string;
  gate?: string;
  lastUpdated: string;
}

export interface TrackedFlightData {
  id: string;
  flightId: string;
  trackedSince: string;
  fromBooking?: boolean;
  flight: {
    id: string;
    _id: string;
    flightName: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    availableSeats: number;
  };
  status: FlightStatusData | null;
}

export const trackFlight = (email: string, flightId: string) =>
  api.post("/api/flights/track", { email, flightId });

export const untrackFlight = (trackedId: string) =>
  api.delete(`/api/flights/tracked/${trackedId}`);

export const getTrackedFlights = (email: string) =>
  api.get<TrackedFlightData[]>(`/api/flights/tracked?email=${encodeURIComponent(email)}`);

export const getFlightStatus = (flightId: string) =>
  api.get<FlightStatusData>(`/api/flights/${flightId}/status`);

export const subscribePush = (email: string, endpoint: string, p256dh: string, auth: string) =>
  api.post("/api/push/subscribe", { email, endpoint, p256dh, auth });

export const unsubscribePush = (endpoint: string) =>
  api.post("/api/push/unsubscribe", { endpoint });
