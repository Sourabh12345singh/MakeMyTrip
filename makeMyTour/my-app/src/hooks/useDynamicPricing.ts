"use client";

import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface PriceUpdate {
  flightId: string;
  oldPrice: number;
  newPrice: number;
  basePrice: number;
  reason: string;
  description: string;
  lastUpdated: string;
}

export function useDynamicPricing(flightIds: string[], userEmail?: string) {
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [recentChanges, setRecentChanges] = useState<Record<string, "up" | "down">>({});
  const prevRef = useRef<Record<string, number>>({});
  const subsRef = useRef<Record<string, { unsubscribe: () => void }>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userEmail || flightIds.length === 0) {
      setConnected(false);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);
        flightIds.forEach((fid) => {
          if (!subsRef.current[fid]) {
            const sub = client.subscribe(`/topic/price/${fid}`, (msg) => {
              try {
                const update: PriceUpdate = JSON.parse(msg.body);
                const prev = prevRef.current[update.flightId];
                if (prev !== undefined && prev !== update.newPrice) {
                  setRecentChanges((p) => ({ ...p, [update.flightId]: update.newPrice > prev ? "up" : "down" }));
                  setTimeout(() => {
                    setRecentChanges((p) => {
                      const next = { ...p };
                      delete next[update.flightId];
                      return next;
                    });
                  }, 2000);
                }
                prevRef.current[update.flightId] = update.newPrice;
                setPriceMap((p) => ({ ...p, [update.flightId]: update.newPrice }));
              } catch { /* ignore */ }
            });
            subsRef.current[fid] = sub;
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();

    return () => {
      Object.values(subsRef.current).forEach((s) => s.unsubscribe());
      subsRef.current = {};
      client.deactivate();
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, flightIds.join(",")]);

  return { priceMap, recentChanges, connected };
}
