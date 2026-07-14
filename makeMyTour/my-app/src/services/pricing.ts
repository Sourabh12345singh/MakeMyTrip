import api from "@/lib/axios";

export interface PriceHistoryEntry {
  id: string;
  flightId: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  description: string;
  timestamp: string;
}

export interface PriceFreezeData {
  id: string;
  flightId: string;
  frozenPrice: number;
  expiresAt: string;
  createdAt: string;
  flightName: string;
}

export interface CurrentPriceData {
  flightId: string;
  currentPrice: number;
  basePrice: number;
  availableSeats: number;
  surgePercent: number;
}

export const getPriceHistory = (flightId: string) =>
  api.get<PriceHistoryEntry[]>(`/api/pricing/history/${flightId}`);

export const getCurrentPrice = (flightId: string) =>
  api.get<CurrentPriceData>(`/api/pricing/current/${flightId}`);

export const freezePrice = (email: string, flightId: string) =>
  api.post<PriceFreezeData>("/api/pricing/freeze", { email, flightId });

export const getActiveFreezes = (email: string) =>
  api.get<PriceFreezeData[]>(`/api/pricing/freeze/${email}`);
