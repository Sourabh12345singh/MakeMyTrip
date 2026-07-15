"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { RefundData } from "@/services/refund";
import { toast } from "sonner";

const STATUS_EMOJI: Record<string, string> = {
  PROCESSED: "🔄",
  COMPLETED: "✅",
};

export function useRefundTracking(
  userEmail: string | undefined,
  onUpdate: (refund: RefundData) => void
) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!userEmail) return;

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
      onConnect: () => {
        client.subscribe(`/topic/refund/${userEmail}`, (msg) => {
          try {
            const refund: RefundData = JSON.parse(msg.body);
            const emoji = STATUS_EMOJI[refund.status];
            if (emoji) {
              toast(`${emoji} Refund ${refund.status.toLowerCase()}`, {
                description: `₹${Math.round(refund.refundAmount)} for ${refund.bookingType} booking`,
                duration: 5000,
              });
            }
            onUpdate(refund);
          } catch { /* ignore */ }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);
}
