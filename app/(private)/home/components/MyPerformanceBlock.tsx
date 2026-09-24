"use client";

/**
 * BAE-490 / BAE-645 — widget "My Performance" do /home.
 *
 * Antes o bloco não existia (o cliente de API `last-day-api.ts` estava no repositório
 * mas sem nenhum consumidor). Agora exibe os indicadores reais do usuário logado —
 * SPR, SPOR-H, AFD e TW — do dia mais recente com operação, usando os valores já
 * calculados pelo backend para não divergir das telas de performance.
 */

import React, { memo } from "react";
import { useRouter } from "next/navigation";
import { Activity, Loader2, ArrowRight, CalendarOff } from "lucide-react";
import { useMyPerformance, type MyPerformanceSummary } from "../hooks/useMyPerformance";

interface MetricConfig {
  key: keyof Pick<MyPerformanceSummary, "spr" | "sporh" | "afd" | "tw">;
  label: string;
  hint: string;
  /** Formata o valor bruto para exibição; recebe null quando não há dado. */
  format: (value: number | null) => string;
  accent: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "spr",
    label: "SPR",
    hint: "Stops per route",
    format: (v) => (v == null ? "--" : String(Math.round(v))),
    accent: "bg-blue-500/10 text-blue-700",
  },
  {
    key: "sporh",
    label: "SPOR-H",
    hint: "Stops per on-road hour",
    format: (v) => (v == null ? "--" : v.toFixed(1)),
    accent: "bg-violet-500/10 text-violet-700",
  },
  {
    key: "tw",
    label: "TW",
    hint: "On-time time window",
    format: (v) => (v == null ? "--" : `${v.toFixed(1)}%`),
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    key: "afd",
    label: "AFD",
    hint: "Attempted failed deliveries",
    format: (v) => (v == null ? "--" : `${Math.round(v)}%`),
    accent: "bg-amber-500/10 text-amber-700",
  },
];

/** "2026-08-09" -> "09 Aug 2026", sem conversão de fuso. */
function formatDateLabel(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(parts[1]) - 1;
  const monthName = months[monthIndex] ?? parts[1];
  return `${parts[2]} ${monthName} ${parts[0]}`;
}

function MyPerformanceBlockComponent({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { data, isLoading, isEmpty, error } = useMyPerformance();

  const subtitle = data
    ? `Last operation · ${formatDateLabel(data.date)}`
    : "Your latest operating day";

  return (
    <section
      className={`flex flex-col min-h-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden ${
        compact ? "h-auto self-start" : "h-full"
      }`}
      aria-label="My Performance"
    >
      <div
        className={`flex items-center gap-3 px-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 ${
          compact ? "py-2" : "py-3"
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center">
          <Activity className="w-5 h-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-800 m-0">My Performance</h2>
          <p className="text-slate-500 text-sm m-0 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      <div className={`flex flex-col bg-slate-50/40 overflow-auto ${compact ? "p-2" : "flex-1 min-h-0 p-5"}`}>
        {isLoading ? (
          <div className={`flex items-center justify-center text-slate-500 ${compact ? "py-4" : "flex-1 py-8"}`}>
            <Loader2 className="w-6 h-6 animate-spin" aria-label="Loading performance" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-1 text-center py-6">
            <p className="text-sm font-medium text-slate-700 m-0">Couldn&apos;t load your performance</p>
            <p className="text-xs text-slate-500 m-0">{error}</p>
          </div>
        ) : isEmpty || !data ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-6">
            <CalendarOff className="w-7 h-7 text-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-700 m-0">No recent operations</p>
            <p className="text-xs text-slate-500 m-0">
              Nothing recorded for your account in the last two weeks.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 content-start">
              {METRICS.map(({ key, label, hint, format, accent }) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${accent}`}>
                    {label}
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-2xl font-semibold text-slate-800 m-0 leading-none tabular-nums">
                      {format(data[key])}
                    </p>
                    <p className="text-[11px] text-slate-500 m-0 mt-1.5 leading-tight">{hint}</p>
                  </div>
                </div>
              ))}
            </div>

            {data.routes.length > 0 && (
              <p className="text-xs text-slate-500 mt-3 mb-0 truncate">
                {data.routes.length === 1 ? "Route" : "Routes"}: {data.routes.join(", ")}
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push("/daily-performance-insight")}
              className="mt-3 self-start inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
            >
              View full performance
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export const MyPerformanceBlock = memo(MyPerformanceBlockComponent);
