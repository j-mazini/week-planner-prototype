"use client";

import React from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PrePaymentRequestFormProps {
  value: string;
  reason: string;
  notes: string;
  submitting: boolean;
  onChangeValue: (value: string) => void;
  onChangeReason: (value: string) => void;
  onChangeNotes: (value: string) => void;
  onSubmit: () => void;
}

function PrePaymentRequestFormComponent({
  value,
  reason,
  notes,
  submitting,
  onChangeValue,
  onChangeReason,
  onChangeNotes,
  onSubmit,
}: PrePaymentRequestFormProps) {
  return (
    <div className="liquid-glass-surface rounded-2xl overflow-hidden relative group">
      {/* Glass highlight overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 p-[3%] md:p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Pre-Payment Request</h3>
            <p className="text-xs text-slate-600">Request an advance payment</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="prePaymentValue" className="text-sm font-medium text-slate-700">Amount (£)</Label>
            <Input
              id="prePaymentValue"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="e.g., 100"
              value={value}
              onChange={(e) => {
                const val = e.target.value;
                // Allow only numbers and decimal point
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  onChangeValue(val);
                }
              }}
              onKeyDown={(e) => {
                // Prevent e, E, +, - characters
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="bg-white/80 border-slate-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prePaymentReason" className="text-sm font-medium text-slate-700">Reason</Label>
            <Input
              id="prePaymentReason"
              placeholder="e.g., emergency"
              value={reason}
              onChange={(e) => onChangeReason(e.target.value)}
              className="bg-white/80 border-slate-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prePaymentNotes" className="text-sm font-medium text-slate-700">Notes</Label>
            <Textarea
              id="prePaymentNotes"
              placeholder="Details for supervisor/admin…"
              value={notes}
              onChange={(e) => onChangeNotes(e.target.value)}
              rows={3}
              className="bg-white/80 border-slate-200 focus:border-amber-400 focus:ring-amber-400 resize-none"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full md:w-auto min-w-[160px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PrePaymentRequestForm = React.memo(PrePaymentRequestFormComponent);


