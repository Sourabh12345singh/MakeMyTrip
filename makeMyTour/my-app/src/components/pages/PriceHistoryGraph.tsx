"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPriceHistory, PriceHistoryEntry } from "@/services/pricing";
import { TrendingUp, Loader2 } from "lucide-react";

interface Props {
  flightId: string;
  flightName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASON_COLORS: Record<string, string> = {
  DEMAND: "#f97316",
  SEASONAL: "#3b82f6",
  TIME_TO_DEPARTURE: "#a855f7",
  DEMAND_SEASONAL: "#ef4444",
};

export default function PriceHistoryGraph({ flightId, flightName, open, onOpenChange }: Props) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPriceHistory(flightId)
      .then((res) => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [flightId, open]);

  const minPrice = history.length > 0 ? Math.min(...history.map((h) => h.newPrice)) * 0.95 : 0;
  const maxPrice = history.length > 0 ? Math.max(...history.map((h) => h.newPrice)) * 1.05 : 1000;
  const range = maxPrice - minPrice || 1;

  const chartW = 500;
  const chartH = 220;
  const margin = { left: 65, right: 20, top: 10, bottom: 10 };
  const plotW = chartW - margin.left - margin.right;
  const plotH = chartH - margin.top - margin.bottom;
  const pts = history.length > 0
    ? history.map((h, i) => {
        const x = (i / (history.length - 1)) * plotW + margin.left;
        const y = chartH - margin.bottom - ((h.newPrice - minPrice) / range) * plotH;
        return { x, y, ...h };
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-sky-400" />
            Price History — {flightName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No price data yet. Prices update every 30s.</div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <div className="bg-slate-800/50 rounded-lg p-2">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const y = chartH - margin.bottom - pct * plotH;
                  const val = minPrice + pct * range;
                  return (
                    <g key={pct}>
                      <line x1={margin.left} y1={y} x2={chartW - margin.right} y2={y} stroke="#334155" strokeWidth="1" />
                      <text x={margin.left - 8} y={y + 4} textAnchor="end" className="text-[11px] font-mono" fill="#94a3b8">
                        ₹{Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Line */}
                <polyline
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Dots */}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill={REASON_COLORS[p.reason] || "#38bdf8"} stroke="#0f172a" strokeWidth="2" />
                    <title>{`₹${p.newPrice} — ${p.description}`}</title>
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400 justify-center">
              {Object.entries(REASON_COLORS).map(([key, color]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {key.replace("_", " + ")}
                </span>
              ))}
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-4 h-0.5 bg-sky-400" />
                Price trend
              </span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-400">Start</div>
                <div className="font-bold text-white">₹{Math.round(history[0]?.oldPrice || 0)}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-400">Current</div>
                <div className="font-bold text-sky-400">₹{Math.round(history[history.length - 1]?.newPrice || 0)}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-slate-400">Change</div>
                <div className={`font-bold ${history.length > 0 && history[history.length - 1]?.newPrice > history[0]?.oldPrice ? "text-red-400" : "text-emerald-400"}`}>
                  {history.length > 0
                    ? `${((history[history.length - 1].newPrice / history[0].oldPrice - 1) * 100).toFixed(1)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
