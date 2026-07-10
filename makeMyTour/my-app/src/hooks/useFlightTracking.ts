"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getTrackedFlights, TrackedFlightData, FlightStatusData } from "@/services/flightStatus";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const STATUS_TOAST: Record<string, { emoji: string }> = {
  DELAYED: { emoji: "⏰" },
  BOARDING: { emoji: "🛫" },
  DEPARTED: { emoji: "✈️" },
  LANDED: { emoji: "✅" },
  CANCELLED: { emoji: "❌" },
};

export function useFlightTracking() {
  const { user } = useAuth();
  const [trackedFlights, setTrackedFlights] = useState<TrackedFlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const subscriptionsRef = useRef<Record<string, { unsubscribe: () => void }>>({});
  const prevStatusRef = useRef<Record<string, string>>({});
  const flightLookupRef = useRef<Record<string, TrackedFlightData>>({});

  const fetchTracked = useCallback(async () => {
    if (!user?.email) {
      setTrackedFlights([]);
      setLoading(false);
      return;
    }
    try {
      const res = await getTrackedFlights(user.email);
      const data = res.data || [];
      const lookup: Record<string, TrackedFlightData> = {};
      data.forEach((tf) => {
        lookup[tf.flightId] = tf;
        if (tf.status?.status) {
          prevStatusRef.current[tf.flightId] = tf.status.status;
        }
      });
      flightLookupRef.current = lookup;
      setTrackedFlights(data);
    } catch (err) {
      console.error("Failed to fetch tracked flights:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchTracked();
  }, [fetchTracked]);

  useEffect(() => {
    if (!user?.email || trackedFlights.length === 0) {
      setConnected(false);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const wsUrl = baseUrl.replace(/^http/, "ws");

    const client = new Client({
      brokerURL: `${wsUrl}/ws`,
      webSocketFactory: () => {
        try {
          return new WebSocket(`${wsUrl}/ws`);
        } catch {
          console.log("Native WebSocket failed, trying SockJS...");
          return new SockJS(`${baseUrl}/ws`);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log("STOMP:", msg),
      onConnect: () => {
        console.log("STOMP connected successfully");
        setConnected(true);
        trackedFlights.forEach((tf) => {
          const topic = `/topic/flight/${tf.flightId}`;
          if (!subscriptionsRef.current[tf.flightId]) {
            const sub = client.subscribe(topic, (message) => {
              try {
                const update: FlightStatusData = JSON.parse(message.body);
                const prev = prevStatusRef.current[update.flightId];
                if (prev && prev !== update.status) {
                  const cfg = STATUS_TOAST[update.status];
                  if (cfg) {
                    const flight = flightLookupRef.current[update.flightId];
                    toast(`${cfg.emoji} ${flight?.flight?.flightName || "Flight"}`, {
                      description: buildToastDescription(update),
                      duration: 5000,
                    });
                  }
                }
                prevStatusRef.current[update.flightId] = update.status;
                setTrackedFlights((prev) =>
                  prev.map((ft) =>
                    ft.flightId === update.flightId ? { ...ft, status: update } : ft
                  )
                );
              } catch (e) {
                console.error("STOMP message parse error:", e);
              }
            });
            subscriptionsRef.current[tf.flightId] = sub;
          }
        });
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        setConnected(false);
      },
      onWebSocketClose: (evt) => {
        console.log("WebSocket closed:", evt.code, evt.reason);
        setConnected(false);
      },
    });

    console.log("Activating STOMP client...");
    client.activate();

    return () => {
      console.log("Cleaning up STOMP client");
      Object.values(subscriptionsRef.current).forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = {};
      client.deactivate();
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, trackedFlights.length]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchTracked();
  }, [fetchTracked]);

  return { trackedFlights, loading, connected, refresh };
}

function buildToastDescription(status: FlightStatusData): string {
  const parts: string[] = [status.status.replace(/_/g, " ")];
  if (status.status === "DELAYED") {
    if (status.delayDuration) parts.push(`+${status.delayDuration}`);
    if (status.delayReason) parts.push(`• ${status.delayReason}`);
    if (status.revisedDepartureTime) parts.push(`• New dep: ${status.revisedDepartureTime}`);
  }
  if (status.status === "BOARDING" && status.gate) {
    parts.push(`• Gate ${status.gate}`);
  }
  if (status.status === "LANDED") {
    parts.push(`• ${status.estimatedArrivalTime || "Arrived"}`);
  }
  return parts.join(" ");
}
