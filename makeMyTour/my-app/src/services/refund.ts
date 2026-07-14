import api from "@/lib/axios";

export interface RefundData {
  id: string;
  userEmail: string;
  bookingId: string;
  bookingType: string;
  originalAmount: number;
  refundAmount: number;
  refundPercent: number;
  reason: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  expectedCompletionDate: string;
}

export const getCancellationReasons = () =>
  api.get<string[]>("/api/refunds/reasons");

export const cancelBooking = (email: string, bookingId: string, reason: string) =>
  api.post<RefundData>("/api/refunds/cancel", { email, bookingId, reason });

export const getRefunds = (email: string) =>
  api.get<RefundData[]>(`/api/refunds/${email}`);
