"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CalendarDays, Loader2, Truck, User, MapPin, ExternalLink } from "lucide-react";
import { useDailyGamePlanStatus, type DailyGamePlanStatus } from "../hooks/useDailyGamePlanStatus";
import { fetchWeekPlannersByDeposit } from "@/app/(private)/week-planner/services/apiService";
import type { WeekPlannerRecord } from "@/app/(private)/week-planner/contexts/PlannerContext";
import { DailyGamePlanSkeleton } from "./DailyGamePlanSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const todayYmd = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function getStatusLabel(status: DailyGamePlanStatus): string {
  switch (status) {
    case "started":
      return "Operation started";
    case "finished":
      return "Operation finished";
    case "waiting":
      return "Waiting for supervisor";
    default:
      return "—";
  }
}

function getStatusBadgeClass(status: DailyGamePlanStatus): string {
  switch (status) {
    case "started":
      return "bg-green-100 text-green-800 border-green-200";
    case "finished":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "waiting":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

const DEPOTS_TO_HIDE = ["GDH", "GEN", "OFF"];

function isDepotHidden(depositName: string): boolean {
  const name = (depositName || "").trim().toUpperCase();
  return DEPOTS_TO_HIDE.some((key) => name === key || name.startsWith(`${key} `) || name.startsWith(`${key}-`));
}

/** React keys: API pode repetir weekPlannerId na mesma lista — índice garante unicidade. */
function weekPlannerRowKey(op: WeekPlannerRecord, index: number): string {
  return `wp-${op.weekPlannerId}-${index}`;
}

/** Regra igual Ã  do Week Planner: considera ADHOC se tiver adhocServiceId ou rota BRTE/adhoc */
function isAdhocOperation(op: WeekPlannerRecord): boolean {
  const raw = op?.raw ?? {};
  const adhocId = raw.adhocServiceId ?? (raw.adhocService && typeof raw.adhocService === "object"
    ? (raw.adhocService as Record<string, unknown>).adhocServiceId
    : null);
  if (adhocId != null && Number.isFinite(Number(adhocId)) && Number(adhocId) > 0) return true;
  const routeName = (op.route ?? "").toString().toLowerCase();
  if (routeName.includes("adhoc") || routeName.includes("ad-hoc") || routeName.includes("brte")) return true;
  const routeId = raw.routeId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId : null);
  if (routeId != null && Number(routeId) === 55) return true;
  return false;
}

function getAdhocServiceName(op: WeekPlannerRecord): string {
  const raw = (op?.raw ?? {}) as Record<string, unknown>;

  // Most common: nested adhocService object
  const adhocService = raw.adhocService;
  if (adhocService && typeof adhocService === "object") {
    const obj = adhocService as Record<string, unknown>;
    const name = obj.adhocName ?? obj.name ?? obj.adhocServiceName;
    if (typeof name === "string" && name.trim()) return name.trim();
  }

  // Alternative: flattened fields from some APIs
  const flat = raw.adhocServiceName ?? raw.adhocName;
  if (typeof flat === "string" && flat.trim()) return flat.trim();

  // Fallback to route label (older records / BRTE mapping)
  const fallback = (op.route ?? "").toString().trim();
  return fallback || "—";
}

import type { DailySupervisorCheckRecord } from "@/lib/daily-supervisor-check";

interface SpDayViewBlockProps {
  compact?: boolean;
  isSupervisor?: boolean;
  supervisorDepots?: DailySupervisorCheckRecord[];
}

/**
 * Block showing one tab per depot with the daily operation (status + list of operations).
 * GDH, GEN and OFF depots are not shown.
 * If supervisor: shows tabs only for their assigned depots.
 */
export function SpDayViewBlock({
  compact = false,
  isSupervisor = false,
  supervisorDepots = []
}: SpDayViewBlockProps) {
  const today = useMemo(() => todayYmd(), []);
  const { depositsStatus, isLoading: statusLoading, error: statusError } = useDailyGamePlanStatus(today);

  const visibleDeposits = useMemo(() => {
    let deposits = depositsStatus.filter((d) => !isDepotHidden(d.depositName));

    // If supervisor: filter to only their assigned depots
    if (isSupervisor && supervisorDepots.length > 0) {
      const supervisorDepotIds = supervisorDepots.map(d => d.depositId);
      deposits = deposits.filter((d) => supervisorDepotIds.includes(d.depositId));
    }

    return deposits;
  }, [depositsStatus, isSupervisor, supervisorDepots]);

  const sectionHeightClass = compact ? "h-auto self-start" : "h-full";
  const scrollBodyClass = compact ? "p-2 overflow-y-auto" : "p-4 flex-1 min-h-0 overflow-y-auto";
  const centerBodyClass = compact ? "p-2 flex items-center justify-center" : "p-4 flex-1 min-h-0 flex items-center justify-center";
  const headerButtonPaddingClass = compact ? "px-4 py-2" : "px-4 py-2.5";

  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);
  const [operations, setOperations] = useState<WeekPlannerRecord[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSelectedDepositId, setModalSelectedDepositId] = useState<number | null>(null);
  const [modalOperations, setModalOperations] = useState<WeekPlannerRecord[]>([]);
  const [modalOperationsLoading, setModalOperationsLoading] = useState(false);

  const selectedDeposit = useMemo(
    () => visibleDeposits.find((d) => d.depositId === selectedDepositId) ?? visibleDeposits[0] ?? null,
    [visibleDeposits, selectedDepositId]
  );

  useEffect(() => {
    if (visibleDeposits.length > 0 && selectedDepositId === null) {
      setSelectedDepositId(visibleDeposits[0].depositId);
    }
  }, [visibleDeposits, selectedDepositId]);

  useEffect(() => {
    if (!selectedDepositId || !today) {
      setOperations([]);
      return;
    }
    let cancelled = false;
    setOperationsLoading(true);
    fetchWeekPlannersByDeposit(selectedDepositId, today)
      .then((list) => {
        if (!cancelled) {
          const forToday = list.filter((wp) => (wp.date || "").split("T")[0] === today && (wp.isDayOff !== "true"));
          setOperations(forToday);
        }
      })
      .catch(() => {
        if (!cancelled) setOperations([]);
      })
      .finally(() => {
        if (!cancelled) setOperationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDepositId, today]);

  const { routeOperations, adhocOperations } = useMemo(() => {
    const routes: WeekPlannerRecord[] = [];
    const adhoc: WeekPlannerRecord[] = [];
    operations.forEach((op) => (isAdhocOperation(op) ? adhoc.push(op) : routes.push(op)));
    routes.sort((a, b) => (a.route ?? "").localeCompare(b.route ?? ""));
    adhoc.sort((a, b) => getAdhocServiceName(a).localeCompare(getAdhocServiceName(b)));
    return { routeOperations: routes, adhocOperations: adhoc };
  }, [operations]);

  const modalSelectedDeposit = useMemo(
    () => visibleDeposits.find((d) => d.depositId === modalSelectedDepositId) ?? visibleDeposits[0] ?? null,
    [visibleDeposits, modalSelectedDepositId]
  );

  const { routeOperations: modalRouteOperations, adhocOperations: modalAdhocOperations } = useMemo(() => {
    const routes: WeekPlannerRecord[] = [];
    const adhoc: WeekPlannerRecord[] = [];
    modalOperations.forEach((op) => (isAdhocOperation(op) ? adhoc.push(op) : routes.push(op)));
    routes.sort((a, b) => (a.route ?? "").localeCompare(b.route ?? ""));
    adhoc.sort((a, b) => getAdhocServiceName(a).localeCompare(getAdhocServiceName(b)));
    return { routeOperations: routes, adhocOperations: adhoc };
  }, [modalOperations]);

  useEffect(() => {
    if (!modalOpen) return;
    setModalSelectedDepositId(selectedDepositId);
  }, [modalOpen, selectedDepositId]);

  useEffect(() => {
    if (!modalOpen || !modalSelectedDepositId || !today) {
      setModalOperations([]);
      return;
    }
    let cancelled = false;
    setModalOperationsLoading(true);
    fetchWeekPlannersByDeposit(modalSelectedDepositId, today)
      .then((list) => {
        if (!cancelled) {
          const forToday = list.filter((wp) => (wp.date || "").split("T")[0] === today && (wp.isDayOff !== "true"));
          setModalOperations(forToday);
        }
      })
      .catch(() => {
        if (!cancelled) setModalOperations([]);
      })
      .finally(() => {
        if (!cancelled) setModalOperationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalOpen, modalSelectedDepositId, today]);

  if (statusLoading) {
    return (
      <section
        className={`${sectionHeightClass} min-h-0 mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col`}
        aria-label="Day view"
      >
        <div className="bg-blue-500/5 border-b border-blue-200/20 px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-blue-900 mb-0 m-0">Day view</h2>
              <p className="text-slate-500 text-xs mb-0 truncate" title="One tab per depot, with the daily operation">One tab per depot, with the daily operation</p>
            </div>
          </div>
        </div>
        <div className={scrollBodyClass}>
          <DailyGamePlanSkeleton />
        </div>
      </section>
    );
  }

  if (statusError) {
    return (
      <section
        className={`${sectionHeightClass} min-h-0 mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col`}
        aria-label="Day view"
      >
        <div className="bg-blue-500/5 border-b border-blue-200/20 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-0.5 m-0">Day view</h2>
              <p className="text-slate-500 text-sm mb-0">One tab per depot, with the daily operation</p>
            </div>
          </div>
        </div>
        <div className={centerBodyClass}>
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
            Error: {statusError}
          </div>
        </div>
      </section>
    );
  }

  if (visibleDeposits.length === 0) {
    return (
      <section
        className={`${sectionHeightClass} min-h-0 mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col`}
        aria-label="Day view"
      >
        <div className="bg-blue-500/5 border-b border-blue-200/20 px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-blue-900 mb-0 m-0">Day view</h2>
              <p className="text-slate-500 text-xs mb-0 truncate" title="One tab per depot, with the daily operation">One tab per depot, with the daily operation</p>
            </div>
          </div>
        </div>
        <div className={centerBodyClass}>
          <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            No deposits found
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className={`${sectionHeightClass} min-h-0 mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden flex flex-col`}
        aria-label="Day view"
      >
        <button
          type="button"
          onClick={() => {
            setModalSelectedDepositId(selectedDepositId);
            setModalOpen(true);
          }}
          className={`w-full bg-blue-500/5 border-b border-blue-200/20 ${headerButtonPaddingClass} flex-shrink-0 text-left hover:bg-blue-500/10 transition-colors cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-blue-900 mb-0 flex items-center gap-2 m-0">
                Day view
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden />
              </h2>
              <p className="text-slate-500 text-xs mb-0 truncate" title="One tab per depot, with the daily operation — click for full details">
                One tab per depot, with the daily operation — click for full details
              </p>
            </div>
          </div>
        </button>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Tabs: one per depot */}
          <div className="mx-4 mt-3 mb-0 rounded-xl border border-blue-200/40 bg-gradient-to-br from-slate-50 to-blue-50/30 px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Depot</span>
            </div>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5">
              {visibleDeposits.map((d) => (
                <button
                  key={d.depositId}
                  type="button"
                  onClick={() => setSelectedDepositId(d.depositId)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${selectedDepositId === d.depositId
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-600"
                      : "bg-white/90 border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-800"
                    }`}
                >
                  {d.depositName}
                </button>
              ))}
            </div>
          </div>

          {/* Content: status + operations for selected depot */}
          <div className={scrollBodyClass}>
            {selectedDeposit && (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                      selectedDeposit.status
                    )}`}
                  >
                    {getStatusLabel(selectedDeposit.status)}
                  </span>
                </div>

                {operationsLoading ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : operations.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    No operations planned for today at this depot.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Routes — estilo Week Planner (slate) */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-600" />
                        Routes
                      </h3>
                      {routeOperations.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                          No routes for today.
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="px-3 py-2 font-semibold text-slate-700">
                                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Route</span>
                                  </th>
                                  <th className="px-3 py-2 font-semibold text-slate-700">
                                    <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" /> Vendor</span>
                                  </th>
                                  <th className="px-3 py-2 font-semibold text-slate-700">
                                    <span className="inline-flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Vehicle</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {routeOperations.map((op, idx) => (
                                  <tr
                                    key={weekPlannerRowKey(op, idx)}
                                    className="border-b border-slate-100 hover:bg-slate-50/50 bg-white"
                                  >
                                    <td className="px-3 py-2 font-medium text-slate-800">{op.route || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700">{op.name || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700">{op.registrationPlate || op.vehicle || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ADHOC Services — regra de cores do Week Planner (laranja) */}
                    <div>
                      <h3 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold shadow-sm">
                          ADHOC Services
                        </span>
                      </h3>
                      {adhocOperations.length === 0 ? (
                        <div className="rounded-lg border border-orange-200 bg-orange-50/50 px-4 py-3 text-center text-sm text-orange-800">
                          No ADHOC services for today.
                        </div>
                      ) : (
                        <div className="rounded-xl border border-orange-200 overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                              <thead>
                                <tr className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-300 text-white">
                                  <th className="px-3 py-2 font-semibold">
                                    <span className="inline-flex items-center gap-1">ADHOC Service name</span>
                                  </th>
                                  <th className="px-3 py-2 font-semibold">Vendor</th>
                                  <th className="px-3 py-2 font-semibold">Vehicle</th>
                                </tr>
                              </thead>
                              <tbody>
                                {adhocOperations.map((op, idx) => (
                                  <tr
                                    key={weekPlannerRowKey(op, idx)}
                                    className="border-b border-orange-100 hover:bg-orange-50/70 bg-orange-50/30"
                                  >
                                    <td className="px-3 py-2 font-medium text-slate-800">{getAdhocServiceName(op)}</td>
                                    <td className="px-3 py-2 text-slate-700">{op.name || "—"}</td>
                                    <td className="px-3 py-2 text-slate-700">{op.registrationPlate || op.vehicle || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Full operation
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-auto flex-1 min-h-0 flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Select depot</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleDeposits.map((d) => (
                  <button
                    key={d.depositId}
                    type="button"
                    onClick={() => setModalSelectedDepositId(d.depositId)}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${modalSelectedDepositId === d.depositId
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 border border-blue-600"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/70"
                      }`}
                  >
                    {d.depositName}
                  </button>
                ))}
              </div>
            </div>
            {modalSelectedDeposit && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${getStatusBadgeClass(modalSelectedDeposit.status)}`}>
                {getStatusLabel(modalSelectedDeposit.status)}
              </span>
            )}
            {modalOperationsLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : modalOperations.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No operations planned for today at this depot.</p>
            ) : (
              <div className="space-y-6">
                {/* Routes — estilo Week Planner (slate) */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Routes</h3>
                  {modalRouteOperations.length === 0 ? (
                    <p className="text-sm text-slate-500 py-3">No routes for today.</p>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-2 font-semibold text-slate-700">Route</th>
                            <th className="px-3 py-2 font-semibold text-slate-700">Vendor</th>
                            <th className="px-3 py-2 font-semibold text-slate-700">Vehicle</th>
                            <th className="px-3 py-2 font-semibold text-slate-700">Sort</th>
                            <th className="px-3 py-2 font-semibold text-slate-700 max-w-[180px]">Notes</th>
                            <th className="px-3 py-2 font-semibold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalRouteOperations.map((op, idx) => (
                            <tr key={weekPlannerRowKey(op, idx)} className="border-b border-slate-100 hover:bg-slate-50/50 bg-white">
                              <td className="px-3 py-2 font-medium text-slate-800">{op.route || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.name || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.registrationPlate || op.vehicle || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.routeSort || op.adhocSort || "—"}</td>
                              <td className="px-3 py-2 text-slate-600 max-w-[180px] truncate" title={op.notes || ""}>{op.notes || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.status || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ADHOC Services — regra de cores do Week Planner (laranja) */}
                <div>
                  <h3 className="text-sm font-semibold text-orange-900 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold shadow-sm">
                      ADHOC Services
                    </span>
                  </h3>
                  {modalAdhocOperations.length === 0 ? (
                    <p className="text-sm text-orange-800 py-3">No ADHOC services for today.</p>
                  ) : (
                    <div className="rounded-xl border border-orange-200 overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-orange-500 to-orange-600 border-b border-orange-300 text-white">
                            <th className="px-3 py-2 font-semibold">ADHOC Service name</th>
                            <th className="px-3 py-2 font-semibold">Vendor</th>
                            <th className="px-3 py-2 font-semibold">Vehicle</th>
                            <th className="px-3 py-2 font-semibold">Sort</th>
                            <th className="px-3 py-2 font-semibold max-w-[180px]">Notes</th>
                            <th className="px-3 py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalAdhocOperations.map((op, idx) => (
                            <tr key={weekPlannerRowKey(op, idx)} className="border-b border-orange-100 hover:bg-orange-50/70 bg-orange-50/30">
                              <td className="px-3 py-2 font-medium text-slate-800">{getAdhocServiceName(op)}</td>
                              <td className="px-3 py-2 text-slate-700">{op.name || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.registrationPlate || op.vehicle || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.routeSort || op.adhocSort || "—"}</td>
                              <td className="px-3 py-2 text-slate-600 max-w-[180px] truncate" title={op.notes || ""}>{op.notes || "—"}</td>
                              <td className="px-3 py-2 text-slate-700">{op.status || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


