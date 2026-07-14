"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plane, Star, Crown, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { getSeatMap, getPreferences, savePreference } from "@/services/seatSelection";

interface Seat {
  seatNumber: string;
  type: string;
  pricePremium: number;
  booked: boolean;
}

interface SeatMapData {
  id: string;
  flightId: string;
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
}

interface SeatMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightId: string;
  flightName: string;
  basePrice: number;
  maxSeats: number;
  userEmail?: string;
  onConfirm: (selectedSeats: string[]) => void;
}

export default function SeatMapDialog({
  open, onOpenChange, flightId, flightName, basePrice, maxSeats, userEmail, onConfirm,
}: SeatMapDialogProps) {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [savedPref, setSavedPref] = useState<string | null>(null);
  const [prefLoading, setPrefLoading] = useState(false);

  const letters = useMemo(() => {
    if (!seatMap) return [];
    return Array.from({ length: seatMap.seatsPerRow }, (_, i) => String.fromCharCode(65 + i));
  }, [seatMap]);

  const rows = useMemo(() => {
    if (!seatMap) return [];
    const map: Record<number, Seat[]> = {};
    for (const seat of seatMap.seats) {
      const rowNum = parseInt(seat.seatNumber.match(/\d+/)?.[0] || "0");
      if (!map[rowNum]) map[rowNum] = [];
      map[rowNum].push(seat);
    }
    return Object.entries(map)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([, seats]) => seats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)));
  }, [seatMap]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSelectedSeats(new Set());
    getSeatMap(flightId)
      .then((res) => setSeatMap(res.data))
      .catch(() => setError("Failed to load seat map"))
      .finally(() => setLoading(false));

    if (userEmail) {
      getPreferences(userEmail).then((res) => {
        const seatPref = (res.data || []).find((p: any) => p.type === "SEAT");
        if (seatPref) setSavedPref(seatPref.value);
      }).catch(() => {});
    }
  }, [open, flightId, userEmail]);

  const handleToggleSeat = (seat: Seat) => {
    if (seat.booked) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seat.seatNumber)) {
        next.delete(seat.seatNumber);
      } else {
        if (next.size >= maxSeats) return prev;
        next.add(seat.seatNumber);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const sorted = Array.from(selectedSeats).sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
      const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
      if (aNum !== bNum) return aNum - bNum;
      return a.localeCompare(b);
    });
    onConfirm(sorted);
    onOpenChange(false);
  };

  const handleSavePref = async (value: string) => {
    if (!userEmail) return;
    setPrefLoading(true);
    try {
      await savePreference({ email: userEmail, type: "SEAT", value });
      setSavedPref(value);
    } catch { }
    setPrefLoading(false);
  };

  const totalPremium = useMemo(() => {
    if (!seatMap) return 0;
    return seatMap.seats
      .filter((s) => selectedSeats.has(s.seatNumber))
      .reduce((sum, s) => sum + s.pricePremium, 0);
  }, [selectedSeats, seatMap]);

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.has(seat.seatNumber)) return "bg-sky-500 border-sky-300 text-white shadow-lg shadow-sky-500/30";
    if (seat.booked) return "bg-red-900/50 border-red-700/50 text-red-400 cursor-not-allowed opacity-50";
    if (seat.type === "BUSINESS") return "bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30";
    if (seat.type === "PREMIUM_ECONOMY") return "bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20";
    return "bg-slate-700/30 border-slate-600/50 text-slate-200 hover:bg-slate-700/50";
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.type === "BUSINESS") return <Crown className="h-2.5 w-2.5 text-amber-300" />;
    if (seat.type === "PREMIUM_ECONOMY") return <Star className="h-2.5 w-2.5 text-amber-200" />;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-400" />
            Select Your Seats — {flightName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : seatMap ? (
          <div className="space-y-4">
            {/* Column labels */}
            <div className="flex items-center justify-center gap-1.5 pl-10">
              {letters.map((l) => (
                <div key={l} className="w-9 text-center text-[10px] font-bold text-slate-500 uppercase">{l}</div>
              ))}
            </div>

            {/* Seat grid */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-8 text-[10px] font-bold text-slate-500 text-right pr-2">1</div>
                {rows[0]?.map((seat) => {
                  const isAisle = seat.seatNumber.endsWith("C") || seat.seatNumber.endsWith("D");
                  return (
                    <button
                      key={seat.seatNumber}
                      disabled={seat.booked}
                      onClick={() => handleToggleSeat(seat)}
                      className={`w-9 h-9 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all duration-150 ${getSeatColor(seat)} ${isAisle ? "mr-3" : ""}`}
                      title={`${seat.seatNumber} (${seat.type})${seat.booked ? " — Booked" : ""}${seat.pricePremium > 0 ? ` +₹${Math.round(seat.pricePremium)}` : ""}`}
                    >
                      <div className="flex flex-col items-center leading-none">
                        {getSeatIcon(seat)}
                        <span className="mt-0.5">{seat.seatNumber.replace(/\d+/, "")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 text-[10px] font-bold text-slate-500 text-right pr-2">2</div>
                {rows[1]?.map((seat) => {
                  const isAisle = seat.seatNumber.endsWith("C") || seat.seatNumber.endsWith("D");
                  return (
                    <button
                      key={seat.seatNumber}
                      disabled={seat.booked}
                      onClick={() => handleToggleSeat(seat)}
                      className={`w-9 h-9 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all duration-150 ${getSeatColor(seat)} ${isAisle ? "mr-3" : ""}`}
                      title={`${seat.seatNumber} (${seat.type})${seat.booked ? " — Booked" : ""}${seat.pricePremium > 0 ? ` +₹${Math.round(seat.pricePremium)}` : ""}`}
                    >
                      <div className="flex flex-col items-center leading-none">
                        {getSeatIcon(seat)}
                        <span className="mt-0.5">{seat.seatNumber.replace(/\d+/, "")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Business class divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-amber-500/30" />
                <span className="text-[10px] font-bold text-amber-400 tracking-widest">BUSINESS</span>
                <div className="h-px flex-1 bg-amber-500/30" />
              </div>

              {/* Rows 3-5 */}
              {rows.slice(2, 5).map((rowSeats, ri) => (
                <div key={ri + 3} className="flex items-center gap-1.5">
                  <div className="w-8 text-[10px] font-bold text-slate-500 text-right pr-2">{ri + 3}</div>
                  {rowSeats.map((seat) => {
                    const isAisle = seat.seatNumber.endsWith("C") || seat.seatNumber.endsWith("D");
                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.booked}
                        onClick={() => handleToggleSeat(seat)}
                        className={`w-9 h-9 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all duration-150 ${getSeatColor(seat)} ${isAisle ? "mr-3" : ""}`}
                        title={`${seat.seatNumber} (${seat.type})${seat.booked ? " — Booked" : ""}${seat.pricePremium > 0 ? ` +₹${Math.round(seat.pricePremium)}` : ""}`}
                      >
                        <div className="flex flex-col items-center leading-none">
                          {getSeatIcon(seat)}
                          <span className="mt-0.5">{seat.seatNumber.replace(/\d+/, "")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Premium Economy divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-amber-500/20" />
                <span className="text-[10px] font-bold text-amber-300 tracking-widest">PREMIUM ECONOMY</span>
                <div className="h-px flex-1 bg-amber-500/20" />
              </div>

              {/* Rows 6-10 */}
              {rows.slice(5).map((rowSeats, ri) => (
                <div key={ri + 6} className="flex items-center gap-1.5">
                  <div className="w-8 text-[10px] font-bold text-slate-500 text-right pr-2">{ri + 6}</div>
                  {rowSeats.map((seat) => {
                    const isAisle = seat.seatNumber.endsWith("C") || seat.seatNumber.endsWith("D");
                    return (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.booked}
                        onClick={() => handleToggleSeat(seat)}
                        className={`w-9 h-9 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all duration-150 ${getSeatColor(seat)} ${isAisle ? "mr-3" : ""}`}
                        title={`${seat.seatNumber} (${seat.type})${seat.booked ? " — Booked" : ""}${seat.pricePremium > 0 ? ` +₹${Math.round(seat.pricePremium)}` : ""}`}
                      >
                        <div className="flex flex-col items-center leading-none">
                          {getSeatIcon(seat)}
                          <span className="mt-0.5">{seat.seatNumber.replace(/\d+/, "")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-slate-700/30 border border-slate-600/50" />
                Economy
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/30" />
                <Star className="h-2.5 w-2.5 text-amber-200" />
                Premium
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/60" />
                <Crown className="h-2.5 w-2.5 text-amber-300" />
                Business
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-900/50 border border-red-700/50" />
                Booked
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-sky-500 border border-sky-300" />
                Selected
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Selected:</span>
                <span className="font-bold text-white">
                  {selectedSeats.size === 0 ? "None" : Array.from(selectedSeats).sort().join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Seats chosen:</span>
                <span className="font-bold text-white">{selectedSeats.size} of {maxSeats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Base fare:</span>
                <span className="text-white">₹{Math.round(basePrice * selectedSeats.size)}</span>
              </div>
              {totalPremium > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Premium upgrade:</span>
                  <span className="text-amber-400">+₹{Math.round(totalPremium)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2">
                <span className="text-white">Total:</span>
                <span className="text-sky-400">₹{Math.round(basePrice * selectedSeats.size + totalPremium)}</span>
              </div>
            </div>

            {/* Preference saver */}
            {userEmail && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Save preference:</span>
                {["Window", "Aisle"].map((pref) => (
                  <Button
                    key={pref}
                    size="sm"
                    variant={savedPref === pref ? "default" : "outline"}
                    onClick={() => handleSavePref(pref)}
                    disabled={prefLoading}
                    className={`h-7 text-[11px] px-3 ${
                      savedPref === pref
                        ? "bg-sky-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-sky-500"
                    }`}
                  >
                    {pref}
                    {savedPref === pref && <CheckCircle className="h-3 w-3 ml-1" />}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300 hover:text-white hover:bg-slate-800">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedSeats.size === 0 || selectedSeats.size > maxSeats}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            {selectedSeats.size === 0 ? "Select Seats" : `Confirm ${selectedSeats.size} Seat${selectedSeats.size > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
