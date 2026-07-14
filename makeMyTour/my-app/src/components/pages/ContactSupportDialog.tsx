"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Headphones } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
}

export default function ContactSupportDialog({ open, onOpenChange, bookingId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Headphones className="h-5 w-5 text-sky-400" />
            Contact Support
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-xs text-slate-400">
            Reference booking: <span className="text-sky-400 font-mono">{bookingId}</span>
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 p-3 rounded-lg">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Phone Support</p>
                <p className="text-xs text-slate-400">+1-800-MYTRIP</p>
                <p className="text-[10px] text-slate-500">Mon-Sat, 9AM - 9PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 p-3 rounded-lg">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-xs text-slate-400">support@makemytrip.in</p>
                <p className="text-[10px] text-slate-500">Response within 24h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 p-3 rounded-lg">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Live Chat</p>
                <p className="text-xs text-slate-400">Available 24/7</p>
                <p className="text-[10px] text-slate-500">Click to start chatting</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
