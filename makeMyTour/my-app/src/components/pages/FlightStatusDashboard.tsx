"use client";

import { useAuth } from "@/context/AuthContext";
import { useFlightTracking } from "@/hooks/useFlightTracking";
import { untrackFlight } from "@/services/flightStatus";
import { toast } from "sonner";
import FlightTrackingCard from "./FlightTrackingCard";
import { Button } from "@/components/ui/button";
import { Plane, Radio, Wifi, WifiOff, RefreshCw, Search, MapPin, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FlightStatusDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackedFlights, loading, connected, refresh } = useFlightTracking();

  const handleUntrack = async (trackedId: string) => {
    try {
      await untrackFlight(trackedId);
      refresh();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as any).response?.data?.error
        : "Failed to untrack";
      toast.error(msg || "Failed to untrack");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center py-16 bg-black/60 border border-slate-700/40 rounded-xl shadow-lg">
          <Bell className="h-16 w-16 text-sky-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-300 mb-6">Please log in to track flights and receive live status updates.</p>
          <Button onClick={() => router.push("/login")} className="bg-sky-500 hover:bg-sky-600 text-white">
            Login Now
          </Button>
        </div>
      </div>
    );
  }

  const hasFlights = trackedFlights.length > 0;
  const onTimeCount = trackedFlights.filter((t) => t.status?.status === "ON_TIME" || t.status?.status === "LANDED").length;
  const delayedCount = trackedFlights.filter((t) => t.status?.status === "DELAYED" || t.status?.status === "CANCELLED").length;
  const boardingCount = trackedFlights.filter((t) => t.status?.status === "BOARDING").length;
  const departedCount = trackedFlights.filter((t) => t.status?.status === "DEPARTED").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 text-white">
            <Radio className="h-8 w-8 text-sky-400" />
            Live Flight Status
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time tracking for your flights</p>
        </div>

        <div className="flex items-center gap-3">
          {hasFlights && (
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${connected ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {connected ? "Live" : "Disconnected"}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/flight")}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Search className="h-4 w-4 mr-1" />
            Find Flights
          </Button>
        </div>
      </div>

      {hasFlights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-black/40 border border-slate-700/40 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-400">{onTimeCount}</p>
            <p className="text-xs text-slate-400">On Time</p>
          </div>
          <div className="bg-black/40 border border-slate-700/40 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-red-400">{delayedCount}</p>
            <p className="text-xs text-slate-400">Delayed</p>
          </div>
          <div className="bg-black/40 border border-slate-700/40 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{boardingCount}</p>
            <p className="text-xs text-slate-400">Boarding</p>
          </div>
          <div className="bg-black/40 border border-slate-700/40 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{departedCount}</p>
            <p className="text-xs text-slate-400">Departed</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-black/40 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : trackedFlights.length === 0 ? (
        <div className="text-center py-16 bg-black/60 border border-slate-700/40 rounded-xl shadow-lg">
          <Plane className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Flights Tracked</h2>
          <p className="text-slate-300 mb-6">Start tracking flights to see live status updates here.</p>
          <Button onClick={() => router.push("/flight")} className="bg-sky-500 hover:bg-sky-600 text-white">
            <MapPin className="h-4 w-4 mr-1" />
            Browse Flights
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedFlights.map((tf) => (
            <FlightTrackingCard
              key={tf.id}
              data={tf}
              onUntrack={handleUntrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}
