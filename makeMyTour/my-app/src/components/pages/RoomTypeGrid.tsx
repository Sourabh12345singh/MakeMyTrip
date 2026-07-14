"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Bed, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { getRoomTypes, getPreferences, savePreference } from "@/services/seatSelection";

interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  pricePremium: number;
  available: number;
  total: number;
  imageSvg: string;
  amenities: string[];
}

interface RoomTypeGridProps {
  hotelId: string;
  basePrice: number;
  userEmail?: string;
  onSelect: (roomTypeId: string, roomName: string, quantity: number, premium: number) => void;
  onConfirm: () => void;
  confirmedRoomTypeId?: string;
  confirmedRoomName?: string;
  confirmedQuantity?: number;
}

export default function RoomTypeGrid({
  hotelId, basePrice, userEmail, onSelect, onConfirm, confirmedRoomTypeId, confirmedRoomName, confirmedQuantity,
}: RoomTypeGridProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(confirmedRoomTypeId || null);
  const [quantity, setQuantity] = useState(confirmedQuantity || 1);
  const [savedPref, setSavedPref] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    getRoomTypes(hotelId)
      .then((res) => {
        const types = (res.data || []).map((rt: any) => ({ ...rt, id: rt.id || rt._id }));
        setRoomTypes(types);
        if (userEmail) {
          getPreferences(userEmail).then((prefRes) => {
            const roomPref = (prefRes.data || []).find((p: any) => p.type === "ROOM_TYPE");
            if (roomPref) {
              setSavedPref(roomPref.value);
              const matched = types.find((t: RoomType) => t.name === roomPref.value);
              if (matched && !confirmedRoomTypeId) {
                setSelectedRoomTypeId(matched.id);
              }
            }
          }).catch(() => {});
        }
      })
      .catch(() => setError("Failed to load room types"))
      .finally(() => setLoading(false));
  }, [hotelId, userEmail, confirmedRoomTypeId]);

  const selectedRoom = useMemo(() => {
    return roomTypes.find((rt) => rt.id === selectedRoomTypeId) || null;
  }, [selectedRoomTypeId, roomTypes]);

  const handleSelect = (id: string) => {
    setSelectedRoomTypeId(id);
    setQuantity(1);
  };

  const handleSavePref = async () => {
    if (!userEmail || !selectedRoom) return;
    try {
      await savePreference({ email: userEmail, type: "ROOM_TYPE", value: selectedRoom.name });
      setSavedPref(selectedRoom.name);
    } catch { }
  };

  const handleConfirmSelection = () => {
    if (!selectedRoom) return;
    onSelect(selectedRoom.id, selectedRoom.name, quantity, selectedRoom.pricePremium);
    onConfirm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-8 gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (confirmedRoomTypeId && confirmedRoomName) {
    return (
      <div className="bg-slate-800/50 border border-sky-500/30 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-sky-400 shrink-0" />
        <div>
          <p className="font-bold text-white text-sm">{confirmedRoomName}</p>
          <p className="text-xs text-slate-300">
            {confirmedQuantity} room{confirmedQuantity && confirmedQuantity > 1 ? "s" : ""} selected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roomTypes.map((rt) => {
          const isSelected = selectedRoomTypeId === rt.id;
          const pct = rt.total > 0 ? Math.round((rt.available / rt.total) * 100) : 0;
          return (
            <button
              key={rt.id}
              onClick={() => handleSelect(rt.id)}
              className={`text-left bg-slate-800/50 border rounded-xl p-3 transition-all duration-200 ${
                isSelected
                  ? "border-sky-500 ring-1 ring-sky-500/30 bg-slate-800/80"
                  : "border-slate-700/40 hover:border-sky-500/40 hover:bg-slate-800/70"
              }`}
            >
              {/* SVG preview */}
              <div
                className="w-full h-24 rounded-lg mb-3 overflow-hidden bg-slate-900/50 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: rt.imageSvg }}
              />

              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 text-sky-400" />
                {rt.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{rt.description}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-300">
                  Base: <span className="text-white font-semibold">₹{Math.round(basePrice)}</span>
                </span>
                {rt.pricePremium > 0 && (
                  <>
                    <span className="text-slate-600">+</span>
                    <span className="text-xs text-amber-400 font-semibold">₹{Math.round(rt.pricePremium)}</span>
                  </>
                )}
              </div>

              {/* Availability bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>{rt.available} left</span>
                  <span>{rt.total} total</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Amenities */}
              {rt.amenities && rt.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {rt.amenities.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-[9px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                  {rt.amenities.length > 3 && (
                    <span className="text-[9px] text-slate-500">+{rt.amenities.length - 3}</span>
                  )}
                </div>
              )}

              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-sky-400 font-bold">
                  <CheckCircle className="h-3 w-3" /> Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedRoom && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">
                {selectedRoom.name} — ₹{Math.round(basePrice + selectedRoom.pricePremium)} / night
              </p>
              <p className="text-xs text-slate-400">Available: {selectedRoom.available} rooms</p>
            </div>

            {userEmail && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSavePref}
                className={`h-7 text-[10px] px-2 border-slate-600 ${
                  savedPref === selectedRoom.name ? "text-sky-400 border-sky-500" : "text-slate-300"
                }`}
              >
                {savedPref === selectedRoom.name ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Saved</>
                ) : (
                  "Save preference"
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Rooms:</span>
              <Input
                type="number"
                min={1}
                max={Math.min(selectedRoom.available, 10)}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(selectedRoom.available, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 h-8 bg-slate-900 border-slate-700 text-white text-sm text-center"
              />
            </div>
            <div className="text-sm text-slate-300 ml-auto">
              Subtotal: <span className="text-sky-400 font-bold">
                ₹{Math.round((basePrice + selectedRoom.pricePremium) * quantity)}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
            <Sparkles className="h-3 w-3 text-sky-400" />
            You save ₹{Math.round(selectedRoom.pricePremium * quantity)} in premium upgrades
          </div>

          <Button
            onClick={handleConfirmSelection}
            disabled={quantity < 1 || quantity > selectedRoom.available}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white mt-2"
          >
            {quantity > selectedRoom.available
              ? "Not enough rooms"
              : `Book ${quantity} ${selectedRoom.name}${quantity > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
