"use client";

import { TrackedFlightData } from "@/services/flightStatus";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, X, AlertTriangle, CheckCircle, Info, BookLock, type LucideIcon } from "lucide-react";

interface Props {
  data: TrackedFlightData;
  onUntrack: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  ON_TIME: {
    label: "On Time",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: CheckCircle,
  },
  DELAYED: {
    label: "Delayed",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: AlertTriangle,
  },
  BOARDING: {
    label: "Boarding",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: Info,
  },
  DEPARTED: {
    label: "Departed",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    icon: Plane,
  },
  LANDED: {
    label: "Landed",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: AlertTriangle,
  },
};

export default function FlightTrackingCard({ data, onUntrack }: Props) {
  const flight = data.flight;
  const status = data.status;
  const statusKey = status?.status || "ON_TIME";
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ON_TIME;
  const StatusIcon = cfg.icon;
  const isFromBooking = data.fromBooking === true;

  const formatTime = (iso: string | undefined) => {
    if (!iso) return "--";
    if (iso === "Landed") return "Landed";
    try {
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      }
    } catch {}
    return iso;
  };

  return (
    <div className={`rounded-xl border ${cfg.bg} backdrop-blur-md p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.bg}`}>
            <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{flight.flightName}</h3>
            <p className="text-xs text-slate-400">Flight #{flight.id?.slice(-6).toUpperCase() || flight._id?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        {isFromBooking ? (
          <div className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-1 rounded-full" title="Auto-tracked from your booking">
            <BookLock className="h-3 w-3" />
            Booked
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUntrack(data.id)}
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 bg-black/20 rounded-lg px-3 py-2">
        <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span className="text-sm font-medium">{flight.from}</span>
        <Plane className="h-3 w-3 text-sky-400 shrink-0" />
        <span className="text-sm font-medium">{flight.to}</span>
      </div>

      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} mb-3`}>
        <StatusIcon className="h-3.5 w-3.5" />
        {cfg.label}
        {status?.delayDuration && statusKey === "DELAYED" && (
          <span className="ml-1">(+{status.delayDuration})</span>
        )}
      </div>

      <div className="space-y-1.5 text-xs text-slate-300">
        <div className="flex justify-between">
          <span>Scheduled Departure:</span>
          <span className="text-white font-medium">{flight.departureTime}</span>
        </div>
        {status?.revisedDepartureTime && statusKey === "DELAYED" && (
          <div className="flex justify-between text-red-400">
            <span>Revised Departure:</span>
            <span className="font-medium">{status.revisedDepartureTime}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Estimated Arrival:</span>
          <span className={`font-medium ${statusKey === "DELAYED" ? "text-amber-400" : "text-white"}`}>
            {formatTime(status?.estimatedArrivalTime) || flight.arrivalTime}
          </span>
        </div>
        {status?.gate && (
          <div className="flex justify-between">
            <span>Gate:</span>
            <span className="text-sky-400 font-bold">{status.gate}</span>
          </div>
        )}
      </div>

      {status?.delayReason && statusKey === "DELAYED" && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300">{status.delayReason}</p>
          </div>
        </div>
      )}

      <div className="mt-3 text-[10px] text-slate-500 text-right">
        Last updated: {formatTime(status?.lastUpdated)}
      </div>
    </div>
  );
}
