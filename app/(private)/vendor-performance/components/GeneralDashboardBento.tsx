"use client";

import { memo } from "react";
import type { GeneralSummaryStats } from "../hooks/useGeneralSummary";
import { PerformanceBentoGrid, BentoCard } from "./PerformanceBentoGrid";

interface GeneralDashboardBentoProps {
  periodLabel: string;
  stats: GeneralSummaryStats;
  loading: boolean;
}

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="p-4 md:p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`}>
      <div className="p-5">
        <div className="h-3 w-16 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export const GeneralDashboardBento = memo(function GeneralDashboardBento({
  periodLabel,
  stats,
  loading,
}: GeneralDashboardBentoProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <SkeletonCard className="md:col-span-2" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <PerformanceBentoGrid>
      {/* Hero: period + total vendors */}
      <BentoCard span={2} className="p-5 md:p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Performance overview
        </h2>
        <p className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{periodLabel}</p>
        <p className="text-slate-600">
          <span className="font-semibold text-slate-800">{stats.totalVendors}</span> vendors with data in this period
        </p>
      </BentoCard>
      <BentoCard className="p-5 md:p-6 flex justify-center flex-col">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Total vendors</p>
        <p className="text-3xl font-bold text-slate-800 tabular-nums">{stats.totalVendors}</p>
      </BentoCard>

      <BentoCard>
        <MetricCard label="Avg TW" value={stats.avgTw} sublabel="Time window" />
      </BentoCard>
      <BentoCard>
        <MetricCard label="Avg SPR" value={stats.avgSpr} sublabel="Stops per route" />
      </BentoCard>
      <BentoCard>
        <MetricCard label="Avg SPOR-H" value={stats.avgSporH} sublabel="Stops per hour" />
      </BentoCard>
      <BentoCard>
        <MetricCard label="Avg AFD" value={stats.avgAfd} sublabel="Attempted failed deliveries" />
      </BentoCard>
    </PerformanceBentoGrid>
  );
});
