"use client";

import { Clock, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  status: string;
  refundPercent: number;
  refundAmount: number;
  expectedCompletionDate?: string;
}

const STEPS = ["PENDING", "PROCESSED", "COMPLETED"];

const STEP_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  PENDING:   { label: "Refund Requested",  icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10" },
  PROCESSED: { label: "Being Processed",   icon: Loader2,      color: "text-blue-400",   bg: "bg-blue-500/10" },
  COMPLETED: { label: "Refund Completed",  icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function RefundStatusTracker({ status, refundPercent, refundAmount, expectedCompletionDate }: Props) {
  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
      {/* Refund summary */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-slate-400">Refund: </span>
          <span className="font-bold text-emerald-400">₹{Math.round(refundAmount)}</span>
          <span className="text-slate-500 text-xs ml-1">({Math.round(refundPercent)}%)</span>
        </div>
        {expectedCompletionDate && status !== "COMPLETED" && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Expected: {new Date(expectedCompletionDate).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const cfg = STEP_CONFIG[step];
          const completed = i < currentIdx;
          const active = i === currentIdx;
          const Icon = cfg.icon;

          return (
            <div key={step} className="flex-1 flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 ${active ? `${cfg.bg} ${cfg.color} ring-1 ring-white/10` : completed ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/50 text-slate-500"}`}>
                <Icon className={`h-3 w-3 ${active && step === "PROCESSED" ? "animate-spin" : ""}`} />
                <span>{cfg.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < currentIdx ? "bg-emerald-500/50" : "bg-slate-700"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
