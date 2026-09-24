"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RateDetailsModalData } from "../../utils/rateDetailsModalData";

const LABELS = {
  title: "Cost model bands",
  loading: "Loading cost model details…",
  noData: "No data available.",
  vendor: "Vendor",
  model: "Payment mode",
  kind: "Model",
  band: "Band",
  minStops: "Min. stops",
  maxStops: "Max. stops",
  pricePerStop: "Price per stop",
  fixedPrice: "Fixed price",
  validityStart: "Validity start",
  validityEnd: "Validity end",
} as const;

function formatBandValue(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  return String(n);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  data: RateDetailsModalData | null;
};

export function RateBandsModal({ open, onOpenChange, loading, error, data }: Props) {
  const t = LABELS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[70vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-slate-600">{t.loading}</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <div className="space-y-2 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2 space-y-1">
              <p className="text-xs">
                <strong>{t.vendor}:</strong> {data.vendorName}
              </p>
              <p className="text-xs">
                <strong>{t.model}:</strong> {data.costModelLabel}
              </p>
              <p className="text-xs">
                <strong>{t.kind}:</strong> {data.costModelKind}
              </p>
            </div>
            {data.bands.map((band, idx) => (
              <div key={`band-${idx}`} className="rounded-md border border-slate-200 p-2 space-y-1">
                <p className="font-semibold text-slate-800 text-xs">
                  {t.band} {idx + 1}
                </p>
                <p className="text-xs">
                  <strong>{t.minStops}:</strong> {formatBandValue(band.minStops)}
                </p>
                <p className="text-xs">
                  <strong>{t.maxStops}:</strong> {formatBandValue(band.maxStops)}
                </p>
                <p className="text-xs">
                  <strong>{t.pricePerStop}:</strong>{" "}
                  {band.pricePerStop != null && Number.isFinite(Number(band.pricePerStop))
                    ? String(band.pricePerStop)
                    : "—"}
                </p>
                {band.fixedPrice != null && Number.isFinite(Number(band.fixedPrice)) ? (
                  <p className="text-xs">
                    <strong>{t.fixedPrice}:</strong> {String(band.fixedPrice)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">{t.noData}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
