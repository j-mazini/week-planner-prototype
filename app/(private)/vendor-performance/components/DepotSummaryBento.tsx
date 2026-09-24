"use client";

import { memo } from "react";
import { PerformanceBentoGrid, BentoCard } from "./PerformanceBentoGrid";

interface DepotSummaryBentoProps {
  depotName: string;
  vendorsCount: number;
  periodLabel: string;
}

export const DepotSummaryBento = memo(function DepotSummaryBento({
  depotName,
  vendorsCount,
  periodLabel,
}: DepotSummaryBentoProps) {
  return (
    <PerformanceBentoGrid>
      <BentoCard span={2} className="p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Depot</h3>
        <p className="text-xl font-semibold text-slate-800">{depotName}</p>
      </BentoCard>
      <BentoCard className="p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Vendors in depot</h3>
        <p className="text-3xl font-bold text-slate-800">{vendorsCount}</p>
      </BentoCard>
      <BentoCard span={3} className="p-5">
        <p className="text-sm text-slate-600">
          Select a vendor above to view their performance for <strong>{periodLabel}</strong>.
        </p>
      </BentoCard>
    </PerformanceBentoGrid>
  );
});
