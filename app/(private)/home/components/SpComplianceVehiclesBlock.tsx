"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Truck, Box, AlertOctagon, Hand, AlertTriangle, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getVendorsForCompliance, getVehiclesForCompliance } from "../compliance-api";
import type { Vendor } from "@/lib/vendors";
import type { Vehicle } from "@/lib/vehicles";

const EXPIRING_DAYS = 30;
const VEHICLES_PAGE_SIZES = [3, 5, 10, 15, 25, 50];

const COMPLIANCE_CARDS = [
  { id: "cargo", title: "Cargo", icon: Box, iconColor: "text-blue-600", dateKey: "cargoTrainingDate" as const },
  { id: "dangerous", title: "Dangerous Goods", icon: AlertOctagon, iconColor: "text-amber-600", dateKey: "dangerousGoodsTrainingDate" as const },
  { id: "manual", title: "Manual Handling", icon: Hand, iconColor: "text-sky-600", dateKey: "manualHandlingTrainingDate" as const },
];

function parseDate(s: string | undefined): Date | null {
  if (!s || !s.trim()) return null;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

function getExpiringAndExpired(vendors: Vendor[], dateKey: "cargoTrainingDate" | "dangerousGoodsTrainingDate" | "manualHandlingTrainingDate") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDays = new Date(today);
  inDays.setDate(inDays.getDate() + EXPIRING_DAYS);
  const expiring: { id: number; name: string }[] = [];
  const expired: { id: number; name: string }[] = [];
  vendors.forEach((v) => {
    const raw = v[dateKey];
    const d = parseDate(typeof raw === "string" ? raw : undefined);
    if (!d) return;
    const name = v.fullName?.trim() || `Vendor #${v.userId}`;
    const item = { id: v.userId, name };
    d.setHours(0, 0, 0, 0);
    if (d < today) expired.push(item);
    else if (d <= inDays) expiring.push(item);
  });
  return { expiring, expired };
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

export function SpComplianceVehiclesBlock() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [vehiclesPageSize, setVehiclesPageSize] = useState(3);

  useEffect(() => {
    Promise.all([getVendorsForCompliance(), getVehiclesForCompliance()])
      .then(([vendorsData, vehiclesData]) => {
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      })
      .catch((e) => {
        console.error("Error fetching compliance data:", e);
        setVendors([]);
        setVehicles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const complianceByCard = useMemo(() => {
    return COMPLIANCE_CARDS.map(({ id, dateKey }) => {
      const { expiring, expired } = getExpiringAndExpired(vendors, dateKey);
      return { id, expiring, expired };
    });
  }, [vendors]);

  const vehiclesRequiringAttention = useMemo(
    () => getVehiclesRequiringAttention(vehicles),
    [vehicles]
  );

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

  return (
    <section className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch" aria-label="Compliance and Vehicles">
      {/* Compliance */}
      <div className="rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col min-h-[320px] lg:min-h-[420px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 m-0">Compliance</h2>
            <p className="text-slate-500 text-sm m-0 mt-0.5">Expiring and expired training</p>
          </div>
        </div>
        <div className="p-4 flex-1 min-h-0 flex flex-col bg-slate-50/40">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500 flex-1">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0 content-start">
              {COMPLIANCE_CARDS.map(({ id, title, icon: Icon }) => {
                const { expiring, expired } = complianceByCard.find((c) => c.id === id) ?? { expiring: [] as { id: number; name: string }[], expired: [] as { id: number; name: string }[] };
                return (
                  <div key={id} className="rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="px-3 py-2.5 flex items-center gap-2 border-b border-slate-200 bg-slate-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${id === "cargo" ? "bg-blue-100 text-blue-600" : id === "dangerous" ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 m-0">{title}</h3>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="mb-3 rounded-lg bg-amber-50/80 border border-amber-200/50 p-2.5">
                        <h4 className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Expiring
                        </h4>
                        <ul className="list-none p-0 m-0 text-sm text-slate-600">
                          {expiring.length ? expiring.map((item) => <li key={item.id} className="py-0.5">{item.name}</li>) : <li className="text-slate-400">—</li>}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-50/80 border border-red-200/50 p-2.5">
                        <h4 className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Expired
                        </h4>
                        <ul className="list-none p-0 m-0 text-sm text-slate-600">
                          {expired.length ? expired.map((item) => <li key={item.id} className="py-0.5">{item.name}</li>) : <li className="text-slate-400">—</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vehicles */}
      <div className="rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col min-h-[320px] lg:min-h-[420px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 m-0">Vehicles requiring attention</h2>
            <p className="text-slate-500 text-sm m-0 mt-0.5">VRN, brand, depot and reason</p>
          </div>
        </div>
        <div className="p-4 flex-1 min-h-0 flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500 flex-1">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden flex-1 min-h-0 flex flex-col">
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
                        <td colSpan={4} className="px-4 py-8 text-center">
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
      </div>
    </section>
  );
}

