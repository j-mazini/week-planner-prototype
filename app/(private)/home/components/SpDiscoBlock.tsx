"use client";

import React, { useMemo, useState } from "react";
import { Truck, Wifi, ExternalLink, Building2, ListFilter } from "lucide-react";
import { DiscoExcelUpload } from "./DiscoExcelUpload";
import type { DashboardDisco, DiscoDeliveryRow } from "../disco-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpDiscoBlockProps {
  discoData: DashboardDisco | null;
  onDiscoDataChange?: (data: DashboardDisco | null) => void;
}

function getFilteredDeliveries(
  deliveries: DiscoDeliveryRow[],
  opts: { slot: "AM" | "PM"; depot: string; loop: string; amRoutes: string[]; pmRoutes: string[] }
): DiscoDeliveryRow[] {
  return deliveries.filter((d) => {
    if (opts.slot === "AM" && opts.amRoutes.length && !opts.amRoutes.includes(d.route)) return false;
    if (opts.slot === "PM" && opts.pmRoutes.length && !opts.pmRoutes.includes(d.route)) return false;
    if (opts.depot && (d.depot || "").trim() !== opts.depot) return false;
    if (opts.loop && (d.loop || "").trim() !== opts.loop) return false;
    return true;
  });
}

function getRoutesWithSummary(deliveries: DiscoDeliveryRow[]): { route: string; stops: number; pre12: number; asr: number; dsr: number }[] {
  const byRoute: Record<string, { stops: number; pre12: number; asr: number; dsr: number }> = {};
  deliveries.forEach((d) => {
    const r = (d.route || "").trim();
    if (!r) return;
    if (!byRoute[r]) byRoute[r] = { stops: 0, pre12: 0, asr: 0, dsr: 0 };
    byRoute[r].stops += 1;
    if (d.pre12) byRoute[r].pre12 += 1;
    if (d.asr) byRoute[r].asr += 1;
    if (d.dsr) byRoute[r].dsr += 1;
  });
  return Object.entries(byRoute)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([route, s]) => ({ route, ...s }));
}

function getDepotSummary(deliveries: DiscoDeliveryRow[]): { depot: string; totalDeliveries: number; pre12: number; asr: number; dsr: number }[] {
  const byDepot: Record<string, { totalDeliveries: number; pre12: number; asr: number; dsr: number }> = {};
  deliveries.forEach((d) => {
    const dep = (d.depot || "").trim();
    if (!dep) return;
    if (!byDepot[dep]) byDepot[dep] = { totalDeliveries: 0, pre12: 0, asr: 0, dsr: 0 };
    byDepot[dep].totalDeliveries += 1;
    if (d.pre12) byDepot[dep].pre12 += 1;
    if (d.asr) byDepot[dep].asr += 1;
    if (d.dsr) byDepot[dep].dsr += 1;
  });
  return Object.entries(byDepot)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([depot, s]) => ({ depot, ...s }));
}

function getLoopSummary(deliveries: DiscoDeliveryRow[], depotFilter: string): { loop: string; totalDeliveries: number; pre12: number; asr: number; dsr: number }[] {
  const byLoop: Record<string, { totalDeliveries: number; pre12: number; asr: number; dsr: number }> = {};
  deliveries.forEach((d) => {
    if ((d.depot || "").trim() !== depotFilter) return;
    const lp = (d.loop || "").trim();
    if (!lp) return;
    if (!byLoop[lp]) byLoop[lp] = { totalDeliveries: 0, pre12: 0, asr: 0, dsr: 0 };
    byLoop[lp].totalDeliveries += 1;
    if (d.pre12) byLoop[lp].pre12 += 1;
    if (d.asr) byLoop[lp].asr += 1;
    if (d.dsr) byLoop[lp].dsr += 1;
  });
  return Object.entries(byLoop)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([loop, s]) => ({ loop, ...s }));
}

function RoutePre12AsrDsrLists({ deliveries, slot }: { deliveries: DiscoDeliveryRow[]; slot: "AM" | "PM" }) {
  const showPre12 = slot === "AM";
  const pre12 = showPre12 ? deliveries.filter((d) => d.pre12) : [];
  const asr = deliveries.filter((d) => d.asr);
  const dsr = deliveries.filter((d) => d.dsr);

  const block = (title: string, list: DiscoDeliveryRow[]) => (
    <div
      className={`rounded-lg border border-slate-200 overflow-hidden bg-white ${!list.length ? "disco-route-detail-list-block--header-only" : ""}`}
    >
      <h4 className="text-xs font-bold text-blue-900 px-2.5 py-2 bg-gradient-to-r from-blue-200 to-blue-100 border-b border-blue-200/30 flex items-center gap-1.5">
        <span className="opacity-70">●</span> {title}
      </h4>
      {list.length > 0 && (
        <div className="max-h-[120px] overflow-y-auto border-t border-slate-100">
          <table className="w-full text-left border-collapse text-[0.7rem]">
            <tbody>
              {list.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-blue-50/80" : "bg-blue-50/40"}>
                  <td className="font-semibold text-blue-900 py-1.5 px-2 w-[95px] border-r border-blue-200/30 bg-blue-50/20">
                    {(d.subpostcode || "").trim() || "—"}
                  </td>
                  <td className="text-slate-700 py-1.5 px-2 truncate max-w-[140px]">
                    {(d.address || "").trim() || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 flex-1 min-h-0 overflow-y-auto">
      {showPre12 && block("Pre-12", pre12)}
      {block("ASR", asr)}
      {block("DSR", dsr)}
    </div>
  );
}

export function SpDiscoBlock({ discoData, onDiscoDataChange }: SpDiscoBlockProps) {
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const [depotFilter, setDepotFilter] = useState("");
  const [loopFilter, setLoopFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    filteredDeliveries,
    uniqueDepots,
    uniqueLoops,
    summary,
    routesWithSummary,
    depotSummary,
    loopSummary,
  } = useMemo(() => {
    if (!discoData?.deliveries?.length) {
      return {
        filteredDeliveries: [] as DiscoDeliveryRow[],
        uniqueDepots: [] as string[],
        uniqueLoops: [] as string[],
        summary: { totalDeliveries: 0, totalRoutes: 0, pre12: 0, asr: 0, dsr: 0, spr: 0 },
        routesWithSummary: [] as { route: string; stops: number; pre12: number; asr: number; dsr: number }[],
        depotSummary: [] as { depot: string; totalDeliveries: number; pre12: number; asr: number; dsr: number }[],
        loopSummary: [] as { loop: string; totalDeliveries: number; pre12: number; asr: number; dsr: number }[],
      };
    }
    const amRoutes = discoData.am ?? [];
    const pmRoutes = discoData.pm ?? [];
    const filtered = getFilteredDeliveries(discoData.deliveries, {
      slot: amPm,
      depot: depotFilter,
      loop: loopFilter,
      amRoutes,
      pmRoutes,
    });
    const depots = [...new Set(filtered.map((d) => (d.depot || "").trim()).filter(Boolean))].sort();
    const loops = [...new Set(filtered.map((d) => (d.loop || "").trim()).filter(Boolean))].sort();
    const routesWithSummaryList = getRoutesWithSummary(filtered);
    const totalRoutes = routesWithSummaryList.length;
    const totalDeliveries = filtered.length;
    const pre12 = filtered.filter((d) => d.pre12).length;
    const asr = filtered.filter((d) => d.asr).length;
    const dsr = filtered.filter((d) => d.dsr).length;
    const spr = totalRoutes > 0 ? totalDeliveries / totalRoutes : 0;
    const depotSummaryList = !depotFilter ? getDepotSummary(filtered) : [];
    const loopSummaryList = depotFilter ? getLoopSummary(filtered, depotFilter) : [];

    return {
      filteredDeliveries: filtered,
      uniqueDepots: depots,
      uniqueLoops: loops,
      summary: {
        totalDeliveries: totalDeliveries,
        totalRoutes: totalRoutes,
        pre12,
        asr,
        dsr,
        spr,
      },
      routesWithSummary: routesWithSummaryList,
      depotSummary: depotSummaryList,
      loopSummary: loopSummaryList,
    };
  }, [discoData, amPm, depotFilter, loopFilter]);

  const hasDepot = !!depotFilter.trim();
  const hasLoop = !!loopFilter.trim();

  const sortedFilteredDeliveriesForTable = useMemo(
    () => [...filteredDeliveries].sort((a, b) => (a.route ?? "").localeCompare(b.route ?? "")),
    [filteredDeliveries]
  );

  return (
    <>
    <section
      className="h-full mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col min-h-0"
      aria-label="My deliveries"
    >
      <div className="bg-blue-500/5 border-b border-blue-200/20 px-4 py-2.5 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {discoData ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-left w-full hover:opacity-90 transition-opacity cursor-pointer"
              >
                <h2 className="text-base font-bold text-blue-900 mb-0.5 flex items-center gap-2 m-0">
                  <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  My deliveries
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                </h2>
                <p className="text-slate-500 text-xs mb-0 truncate max-w-full" title="These are your operations today! Click for full delivery list.">
                  These are your operations today! Click for full delivery list.
                </p>
              </button>
            ) : (
              <>
                <h2 className="text-base font-bold text-blue-900 mb-0.5 flex items-center gap-2 m-0">
                  <Truck className="w-4 h-4 text-blue-500" />
                  My deliveries
                </h2>
                <p className="text-slate-500 text-xs mb-0 truncate max-w-full" title="These are your operations today! We already organised it for you!">
                  These are your operations today! We already organised it for you!
                </p>
              </>
            )}
          </div>
          {discoData && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="rounded-lg px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[3.5rem] bg-blue-500/10 border border-blue-300/40">
                <span className="text-[0.6rem] uppercase font-semibold text-slate-500">Stops</span>
                <span className="text-base font-bold text-blue-900 leading-tight">{filteredDeliveries.length}</span>
              </div>
              <div
                className="flex flex-col rounded-md overflow-hidden border border-blue-300/40 bg-gradient-to-b from-blue-200/20 to-blue-100/10 p-0.5 min-w-[2.25rem]"
                role="group"
                aria-label="Morning or Afternoon"
              >
                <button
                  type="button"
                  onClick={() => setAmPm("AM")}
                  className={`px-1.5 py-1 text-[0.65rem] font-bold border-none cursor-pointer transition-colors min-h-7 flex items-center justify-center ${
                    amPm === "AM"
                      ? "bg-green-500/30 text-green-900 shadow-sm"
                      : "bg-black/5 text-slate-500"
                  }`}
                  aria-pressed={amPm === "AM"}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmPm("PM")}
                  className={`px-1.5 py-1 text-[0.65rem] font-bold border-none cursor-pointer transition-colors min-h-7 flex items-center justify-center ${
                    amPm === "PM"
                      ? "bg-amber-400/35 text-amber-900 shadow-sm"
                      : "bg-black/5 text-slate-500"
                  }`}
                  aria-pressed={amPm === "PM"}
                >
                  PM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 min-h-0 overflow-y-auto">
        {!discoData ? (
          <>
            <DiscoExcelUpload
              onParsed={(data) => onDiscoDataChange?.(data)}
              accept=".xlsx,.xls"
            />
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
              Upload an Excel file of deliveries (DISCO Route Data) to see the distribution by postcodes and routes.
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-blue-200/40 bg-gradient-to-br from-slate-50 to-blue-50/30 -mx-4 px-4 py-3 mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Depot filter */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-4 h-4 flex-shrink-0 text-blue-600" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Depot</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setDepotFilter(""); setLoopFilter(""); }}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                        !depotFilter
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-600"
                          : "bg-white/90 border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-800"
                      }`}
                    >
                      All
                    </button>
                    {uniqueDepots.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => { setDepotFilter(d); setLoopFilter(""); }}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                          depotFilter === d
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-600"
                            : "bg-white/90 border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-800"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Loop filter */}
                <div className="flex flex-col gap-2 min-w-0 flex-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ListFilter className="w-4 h-4 flex-shrink-0 text-cyan-600" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Loop</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLoopFilter("")}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 ${
                        !loopFilter
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/25 border border-cyan-600"
                          : "bg-white/90 border border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/70 hover:text-cyan-800"
                      }`}
                    >
                      All
                    </button>
                    {uniqueLoops.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLoopFilter(l)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 ${
                          loopFilter === l
                            ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/25 border border-cyan-600"
                            : "bg-white/90 border border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/70 hover:text-cyan-800"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                Summary
                {hasDepot && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {depotFilter}
                  </span>
                )}
                {hasLoop && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-600 text-white">
                    {loopFilter}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-4 items-start">
                <div className="flex-1 min-w-[200px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg border border-blue-200/30 p-3 shadow-sm">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">Total deliveries</span>
                    <span className="text-lg font-bold text-blue-900">{summary.totalDeliveries}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-blue-200/30 p-3 shadow-sm">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">Routes</span>
                    <span className="text-lg font-bold text-blue-900">{summary.totalRoutes}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-emerald-200/50 p-3 shadow-sm bg-emerald-50/30">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">Pre-12</span>
                    <span className="text-lg font-bold text-emerald-900">{summary.pre12}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-amber-200/50 p-3 shadow-sm bg-amber-50/30">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">ASR</span>
                    <span className="text-lg font-bold text-amber-900">{summary.asr}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-violet-200/50 p-3 shadow-sm bg-violet-50/30">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">DSR</span>
                    <span className="text-lg font-bold text-violet-900">{summary.dsr}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-blue-200/30 p-3 shadow-sm">
                    <span className="text-[0.65rem] uppercase font-semibold text-slate-500 block">SPR</span>
                    <span className="text-lg font-bold text-blue-900">
                      {summary.totalRoutes ? summary.spr.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                    <Wifi className="w-4 h-4" />
                    Network &amp; Delays
                  </div>
                  <p className="text-sm text-slate-500 m-0">No notifications yet.</p>
                </div>
              </div>
            </div>

            {/* Depot cards (when no depot selected) */}
            {!hasDepot && depotSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {depotSummary.map((item) => (
                  <div
                    key={item.depot}
                    className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col h-[380px] min-h-0 shadow-sm hover:border-blue-300/50"
                  >
                    <div className="flex justify-between items-baseline gap-2 mb-2">
                      <span className="font-bold text-blue-900 text-sm">{item.depot}</span>
                      <span className="font-bold text-white text-sm bg-blue-600 px-2.5 py-1 rounded-lg shadow">
                        {item.totalDeliveries} deliveries
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {amPm === "AM" && (
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pre-12: {item.pre12}</span>
                      )}
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">ASR: {item.asr}</span>
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">DSR: {item.dsr}</span>
                    </div>
                    <RoutePre12AsrDsrLists
                      deliveries={filteredDeliveries.filter((d) => (d.depot || "").trim() === item.depot)}
                      slot={amPm}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Loop cards (when depot selected, no loop) */}
            {hasDepot && !hasLoop && loopSummary.length > 0 && (
              <>
                <h3 className="text-base font-bold text-blue-900">Depot loops: {depotFilter}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loopSummary.map((item) => (
                    <div
                      key={item.loop}
                      className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col h-[380px] min-h-0 shadow-sm hover:border-blue-300/50"
                    >
                      <div className="flex justify-between items-baseline gap-2 mb-2">
                        <span className="font-bold text-blue-900 text-sm">{item.loop}</span>
                        <span className="font-bold text-white text-sm bg-blue-600 px-2.5 py-1 rounded-lg shadow">
                          {item.totalDeliveries} deliveries
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {amPm === "AM" && (
                          <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pre-12: {item.pre12}</span>
                        )}
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">ASR: {item.asr}</span>
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">DSR: {item.dsr}</span>
                      </div>
                      <RoutePre12AsrDsrLists
                        deliveries={filteredDeliveries.filter(
                          (d) => (d.depot || "").trim() === depotFilter && (d.loop || "").trim() === item.loop
                        )}
                        slot={amPm}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Route cards (when loop selected) */}
            {hasLoop && routesWithSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {routesWithSummary.map((item) => (
                  <div
                    key={item.route}
                    className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col h-[380px] min-h-0 shadow-sm hover:border-blue-300/50"
                  >
                    <div className="flex justify-between items-baseline gap-2 mb-2">
                      <span className="font-bold text-blue-900 text-sm">{item.route}</span>
                      <span className="font-bold text-white text-sm bg-blue-600 px-2.5 py-1 rounded-lg shadow">
                        {item.stops} stops
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {amPm === "AM" && (
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pre-12: {item.pre12}</span>
                      )}
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">ASR: {item.asr}</span>
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">DSR: {item.dsr}</span>
                    </div>
                    <RoutePre12AsrDsrLists
                      deliveries={filteredDeliveries.filter((d) => (d.route || "").trim() === item.route)}
                      slot={amPm}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* When depot selected but no loops in data, show route blocks for that depot */}
            {hasDepot && !hasLoop && loopSummary.length === 0 && routesWithSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {routesWithSummary.map((item) => (
                  <div
                    key={item.route}
                    className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col h-[380px] min-h-0 shadow-sm hover:border-blue-300/50"
                  >
                    <div className="flex justify-between items-baseline gap-2 mb-2">
                      <span className="font-bold text-blue-900 text-sm">{item.route}</span>
                      <span className="font-bold text-white text-sm bg-blue-600 px-2.5 py-1 rounded-lg shadow">
                        {item.stops} stops
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {amPm === "AM" && (
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pre-12: {item.pre12}</span>
                      )}
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">ASR: {item.asr}</span>
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">DSR: {item.dsr}</span>
                    </div>
                    <RoutePre12AsrDsrLists
                      deliveries={filteredDeliveries.filter((d) => (d.route || "").trim() === item.route)}
                      slot={amPm}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* No filters: show route blocks by default if we have routes */}
            {!hasDepot && !hasLoop && depotSummary.length === 0 && routesWithSummary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {routesWithSummary.map((item) => (
                  <div
                    key={item.route}
                    className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col h-[380px] min-h-0 shadow-sm hover:border-blue-300/50"
                  >
                    <div className="flex justify-between items-baseline gap-2 mb-2">
                      <span className="font-bold text-blue-900 text-sm">{item.route}</span>
                      <span className="font-bold text-white text-sm bg-blue-600 px-2.5 py-1 rounded-lg shadow">
                        {item.stops} stops
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {amPm === "AM" && (
                        <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pre-12: {item.pre12}</span>
                      )}
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">ASR: {item.asr}</span>
                      <span className="text-[0.7rem] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">DSR: {item.dsr}</span>
                    </div>
                    <RoutePre12AsrDsrLists
                      deliveries={filteredDeliveries.filter((d) => (d.route || "").trim() === item.route)}
                      slot={amPm}
                    />
                  </div>
                ))}
              </div>
            )}

            {onDiscoDataChange && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onDiscoDataChange(null)}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Clear data and load another file
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>

    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Full delivery list
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            {filteredDeliveries.length} delivery stops {depotFilter ? `(Depot: ${depotFilter})` : ""} {loopFilter ? `(Loop: ${loopFilter})` : ""} — {amPm} slot
          </p>
        </DialogHeader>
        <div className="px-6 pb-6 overflow-auto flex-1 min-h-0">
          {filteredDeliveries.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No deliveries to show for the current filters.</p>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-slate-700">Route</th>
                      <th className="px-3 py-2 font-semibold text-slate-700">Depot</th>
                      <th className="px-3 py-2 font-semibold text-slate-700">Loop</th>
                      <th className="px-3 py-2 font-semibold text-slate-700">Subpostcode</th>
                      <th className="px-3 py-2 font-semibold text-slate-700 min-w-[180px]">Address</th>
                      <th className="px-3 py-2 font-semibold text-slate-700 min-w-[120px]">Recipient</th>
                      <th className="px-3 py-2 font-semibold text-slate-700 text-center">Pre-12</th>
                      <th className="px-3 py-2 font-semibold text-slate-700 text-center">ASR</th>
                      <th className="px-3 py-2 font-semibold text-slate-700 text-center">DSR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredDeliveriesForTable.map((d, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-800">{d.route || "—"}</td>
                        <td className="px-3 py-2 text-slate-700">{d.depot || "—"}</td>
                        <td className="px-3 py-2 text-slate-700">{d.loop || "—"}</td>
                        <td className="px-3 py-2 text-slate-700">{d.subpostcode || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 min-w-[180px]">{d.address || "—"}</td>
                        <td className="px-3 py-2 text-slate-700 min-w-[120px]">{d.recipient || "—"}</td>
                        <td className="px-3 py-2 text-center">{d.pre12 ? "Yes" : "—"}</td>
                        <td className="px-3 py-2 text-center">{d.asr ? "Yes" : "—"}</td>
                        <td className="px-3 py-2 text-center">{d.dsr ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
