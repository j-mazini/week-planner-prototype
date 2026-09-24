"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Truck, ShieldCheck, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getVehiclesForCompliance } from "../compliance-api";
import type { Vehicle } from "@/lib/vehicles";

const EXPIRING_DAYS = 30;
const VEHICLES_PAGE_SIZES = [3, 5, 10, 15, 25, 50];

function parseDate(s: string | undefined): Date | null {
  if (!s || !s.trim()) return null;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export interface VehicleRequiringAttention {
  vehicleId: number;
  vrn: string;
  brand: string;
  depot: string;
  reasons: string[];
}

function getVehiclesRequiringAttention(vehicles: Vehicle[]): VehicleRequiringAttention[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDays = new Date(today);
  inDays.setDate(inDays.getDate() + EXPIRING_DAYS);
  const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const out: VehicleRequiringAttention[] = [];
  vehicles.forEach((v) => {
    const id = v.vehicleId ?? (v as Record<string, unknown>).vehicleId as number | undefined;
    if (id == null) return;
    const vrn = (v.registrationPlates ?? (v as Record<string, unknown>).registrationPlates ?? "") as string;
    const manufacturer = (v.manufacturer ?? (v as Record<string, unknown>).manufacturer ?? "") as string;
    const model = (v.model ?? (v as Record<string, unknown>).model ?? "") as string;
    const brand = [manufacturer, model].filter(Boolean).join(" ").trim() || "—";
    const depositId = (v as Record<string, unknown>).depositId ?? (v as Record<string, unknown>).depotId;
    const depot = typeof depositId !== "undefined" && depositId !== null ? String(depositId) : "—";
    const reasons: string[] = [];
    for (const { key, label } of [
      { key: "mot_due", label: "MOT" },
      { key: "tax_due", label: "Tax" },
      { key: "service_due", label: "Service" },
    ]) {
      const raw = (v as Record<string, unknown>)[key];
      const d = parseDate(typeof raw === "string" ? raw : undefined);
      if (!d) continue;
      d.setHours(0, 0, 0, 0);
      const dateStr = formatDate(d);
      if (d < today) reasons.push(`${label} expired (${dateStr})`);
      else if (d <= inDays) reasons.push(`${label} due ${dateStr}`);
    }
    if (reasons.length) out.push({ vehicleId: id, vrn, brand, depot, reasons });
  });
  return out;
}

export function SpVehiclesBlock({ compact = false }: { compact?: boolean }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [vehiclesPageSize, setVehiclesPageSize] = useState(3);

  useEffect(() => {
    getVehiclesForCompliance()
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  const vehiclesRequiringAttention = useMemo(() => getVehiclesRequiringAttention(vehicles), [vehicles]);
  const vehiclesTotal = vehiclesRequiringAttention.length;
  const vehiclesTotalPages = Math.max(1, Math.ceil(vehiclesTotal / vehiclesPageSize));
  const vehiclesPaginated = useMemo(() => {
    if (vehiclesRequiringAttention.length === 0) return [];
    const start = (vehiclesPage - 1) * vehiclesPageSize;
    return vehiclesRequiringAttention.slice(start, start + vehiclesPageSize);
  }, [vehiclesRequiringAttention, vehiclesPage, vehiclesPageSize]);

  useEffect(() => {
    setVehiclesPage(1);
  }, [vehiclesRequiringAttention.length]);

  useEffect(() => {
    if (vehiclesPage > vehiclesTotalPages) setVehiclesPage(vehiclesTotalPages);
  }, [vehiclesTotalPages, vehiclesPage]);

  /** Compact when Operations has no data; otherwise more padding. */
  const isCompact = compact;
  const hasRecords = vehiclesRequiringAttention.length > 0;

  return (
    <section
      className={`flex flex-col min-h-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden ${isCompact ? "h-auto self-start" : "h-full"}`}
      aria-label="Vehicles"
    >
      <div className={`flex items-center gap-3 px-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 ${isCompact ? "py-2" : "py-3"}`}>
        <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800 m-0">Vehicles requiring attention</h2>
          <p className="text-slate-500 text-sm m-0 mt-0.5">VRN, brand, depot and reason</p>
        </div>
      </div>
      <div className={`flex flex-col overflow-auto ${isCompact ? "p-2" : "flex-1 min-h-0 p-5"}`}>
        {loading ? (
          <div className={`flex items-center justify-center text-slate-500 ${isCompact ? "py-4" : "flex-1 py-8"}`}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className={`rounded-xl border border-slate-200 overflow-hidden flex flex-col ${hasRecords && !isCompact ? "flex-1 min-h-0" : ""}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["VRN", "Brand", "Depot", "Reason"].map((h) => (
                      <th key={h} className="px-4 py-2 font-semibold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehiclesRequiringAttention.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <p className="m-0">No vehicles requiring attention.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    vehiclesPaginated.map((row) => (
                      <tr key={row.vehicleId} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-2 font-medium text-slate-800">{row.vrn || "—"}</td>
                        <td className="px-4 py-2 text-slate-700">{row.brand}</td>
                        <td className="px-4 py-2 text-slate-700">{row.depot}</td>
                        <td className="px-4 py-2 text-slate-600">{row.reasons.join("; ")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {vehiclesRequiringAttention.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Showing {(vehiclesPage - 1) * vehiclesPageSize + 1}–{Math.min(vehiclesPage * vehiclesPageSize, vehiclesTotal)} of {vehiclesTotal}
                  </span>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Per page</span>
                    <select
                      value={vehiclesPageSize}
                      onChange={(e) => {
                        setVehiclesPageSize(Number(e.target.value));
                        setVehiclesPage(1);
                      }}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800"
                    >
                      {VEHICLES_PAGE_SIZES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVehiclesPage((p) => Math.max(1, p - 1))}
                    disabled={vehiclesPage <= 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm text-slate-600 min-w-[4rem] text-center">
                    Page {vehiclesPage} of {vehiclesTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVehiclesPage((p) => Math.min(vehiclesTotalPages, p + 1))}
                    disabled={vehiclesPage >= vehiclesTotalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

