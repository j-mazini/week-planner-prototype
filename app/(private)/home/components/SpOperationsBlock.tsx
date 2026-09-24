"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, addDays, isAfter } from "date-fns";
import {
  CalendarCheck,
  PoundSterling,
  AlertTriangle,
  Package,
  Gauge,
  MapPin,
  Clock,
  List,
  Truck,
  TrendingUp,
  Box,
  ArrowUpCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  ListFilter,
  Route,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { SpStatusDaily } from "../sp-types";
import {
  fetchDailyOperationsReports,
  type DailyOperationsReportDTO,
} from "@/lib/daily-operations-api";
import {
  getLiquidationDamagesWithDetails,
  type LiquidationDamageWithDetails,
} from "../ld-api";
import { fetchSpStatus } from "../sp-api";
import { useDepositsWithRoutes } from "@/hooks/useDepositsWithRoutes";
import { type RouteByDepositDTO } from "@/lib/api/routes";
import { useAuth } from "@/hooks/useAuth";
import { resolveDepositIdForRestrictedUser } from "@/lib/daily-supervisor-check";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { useLastDateWithOperations, useLastDateWithStatus } from "../hooks/useLastDateWithData";

/* ─── animation variants ─── */
const stripVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  exit: { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.15 } },
};

const tabPanelVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/* ─── animated number counter ─── */
function useCountUp(target: number | undefined, duration = 900, active = true) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || target === undefined) { setDisplay(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, active]);

  return display;
}

type TabId = "lastday" | "spms" | "ld";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "lastday", label: "My Last Operations", icon: CalendarCheck },
  { id: "spms", label: "My Financial Performance", icon: PoundSterling },
  { id: "ld", label: "Liquidation Damages", icon: AlertTriangle },
];

interface SpOperationsBlockProps {
  daily: SpStatusDaily | null;
  isLoading: boolean;
  /** Called when "My Last Operations" has no data for the selected date (so Compliance/Vehicles can render compact). */
  onOperationsDataChange?: (hasData: boolean) => void;
}

function getYesterday(): Date {
  return subDays(new Date(), 1);
}

const LAST_DAY_PAGE_SIZES = [5, 10, 15, 25, 50];

/** Mapeamento rota → loop: DY1/DY2 → DY1/DY2, LL3/LL4 → LL3/LL4, MD7 → MD7 */
const LOOP_FILTER_OPTIONS = ["All", "DY1", "DY2", "LL3", "LL4", "MD7"] as const;

/** Loops por depot: DY1/DY2 = LCY, LL3/LL4 = LSE, MD7 = MSE */
const LOOP_TO_DEPOT: Record<string, string> = {
  DY1: "LCY",
  DY2: "LCY",
  LL3: "LSE",
  LL4: "LSE",
  MD7: "MSE",
};

function getLoopsForDepot(depotName: string): string[] {
  if (!depotName || depotName === "All") return [...LOOP_FILTER_OPTIONS].filter((l) => l !== "All");
  const normalized = depotName.trim().toUpperCase();
  return (Object.entries(LOOP_TO_DEPOT) as [string, string][])
    .filter(([, dep]) => dep.toUpperCase() === normalized)
    .map(([loop]) => loop);
}

function getLoopFromRoute(routeName: string): string | null {
  const r = (routeName ?? "").trim().toUpperCase();
  if (!r) return null;
  if (r === "DY1" || r.startsWith("DY1")) return "DY1";
  if (r === "DY2" || r.startsWith("DY2")) return "DY2";
  if (r === "LL3" || r.startsWith("LL3")) return "LL3";
  if (r === "LL4" || r.startsWith("LL4")) return "LL4";
  if (r === "MD7" || r.startsWith("MD7")) return "MD7";
  return null;
}

/** Loop efetivo de um report: API (loopName/loop/loop_code) ou derivado da rota */
function getEffectiveLoop(row: { loopName?: string | null; loop?: string | null; loopCode?: string | null; routeName?: string | null }): string {
  const fromApi = row.loopName ?? row.loop ?? row.loopCode ?? "";
  if (fromApi && String(fromApi).trim()) return String(fromApi).trim();
  return getLoopFromRoute(row.routeName ?? "") ?? "";
}

export function SpOperationsBlock({ daily, isLoading, onOperationsDataChange }: SpOperationsBlockProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lastday");
  const [lastDayDate, setLastDayDate] = useState<Date>(getYesterday);
  const [lastDayReports, setLastDayReports] = useState<DailyOperationsReportDTO[] | null>(null);
  const [lastDayLoading, setLastDayLoading] = useState(false);
  const [lastDayPage, setLastDayPage] = useState(1);
  const [lastDayPageSize, setLastDayPageSize] = useState(10);
  const [ldDeductions, setLdDeductions] = useState<LiquidationDamageWithDetails[]>([]);
  const [ldLoading, setLdLoading] = useState(false);
  const [ldMonth, setLdMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [ldYear, setLdYear] = useState<number>(() => new Date().getFullYear());
  const [spmsDate, setSpmsDate] = useState<Date>(getYesterday);
  const [spmsDaily, setSpmsDaily] = useState<SpStatusDaily | null>(null);
  const [spmsLoading, setSpmsLoading] = useState(false);
  const spmsFetchedDateRef = useRef<string | null>(null);

  // Filters (depot, loop, route) shared across tabs
  const [filterDepot, setFilterDepot] = useState<string>("All");
  const [filterLoop, setFilterLoop] = useState<string>("All");
  const [filterRoute, setFilterRoute] = useState<string>("All");

  // Supervisor (`BUSINESS_RULES.USER_TYPE.SUPERVISOR`): só vê o seu depot, sem abas financeiras
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [supervisorDepositId, setSupervisorDepositId] = useState<number | null>(null);
  const [supervisorDepositName, setSupervisorDepositName] = useState<string | null>(null);

  const { user } = useAuth();

  // Find last date with data for each tab
  const { date: lastDateWithOperations } = useLastDateWithOperations(30);
  const { date: lastDateWithStatus } = useLastDateWithStatus(30);

  // Initialize dates to the last date with actual data
  useEffect(() => {
    if (lastDateWithOperations) {
      setLastDayDate(lastDateWithOperations);
    }
  }, [lastDateWithOperations]);

  useEffect(() => {
    if (lastDateWithStatus) {
      setSpmsDate(lastDateWithStatus);
      spmsFetchedDateRef.current = null;
    }
  }, [lastDateWithStatus]);

  useEffect(() => {
    setIsSupervisor(user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR);
  }, [user]);

  const { data: depositsWithRoutesData } = useDepositsWithRoutes({
    enabled: activeTab === "ld" || activeTab === "spms" || isSupervisor
  });

  const depositsWithRoutes = depositsWithRoutesData ?? null;


  useEffect(() => {
    if (!isSupervisor) {
      setFilterDepot("All");
      setFilterLoop("All");
      setFilterRoute("All");
    }
  }, [activeTab, isSupervisor]);

  // Resolve depot do supervisor para a data selecionada (daily_supervisor_check)
  useEffect(() => {
    if (!isSupervisor) return;
    const dateStr = format(lastDayDate, "yyyy-MM-dd");
    resolveDepositIdForRestrictedUser(dateStr)
      .then((id) => setSupervisorDepositId(id ?? null))
      .catch(() => setSupervisorDepositId(null));
  }, [isSupervisor, lastDayDate]);

  useEffect(() => {
    if (!isSupervisor || supervisorDepositId == null || !depositsWithRoutes?.length) return;
    const dep = depositsWithRoutes.find((d) => d.depositId === supervisorDepositId);
    setSupervisorDepositName(dep?.depositName ?? null);
  }, [isSupervisor, supervisorDepositId, depositsWithRoutes]);

  useEffect(() => {
    if (isSupervisor && supervisorDepositName) setFilterDepot(supervisorDepositName);
  }, [isSupervisor, supervisorDepositName]);

  // Ao mudar o depot, se o loop selecionado não pertencer ao depot, resetar para All
  useEffect(() => {
    const depot = isSupervisor ? supervisorDepositName : filterDepot;
    if (depot && depot !== "All") {
      const allowedLoops = getLoopsForDepot(depot);
      if (filterLoop !== "All" && !allowedLoops.includes(filterLoop)) setFilterLoop("All");
    }
  }, [isSupervisor, supervisorDepositName, filterDepot, filterLoop]);

  const dataReady = !isLoading && daily !== null;

  useEffect(() => {
    if (activeTab !== "spms") return;
    const dateKey = format(spmsDate, "yyyy-MM-dd");
    if (spmsFetchedDateRef.current === dateKey) return;
    spmsFetchedDateRef.current = dateKey;
    setSpmsLoading(true);
    fetchSpStatus(spmsDate)
      .then((data) => {
        if (data?.status?.daily) setSpmsDaily(data.status.daily);
        else setSpmsDaily(null);
      })
      .catch((e) => {
        console.error("Error fetching financial status for date:", e);
        setSpmsDaily(null);
      })
      .finally(() => setSpmsLoading(false));
  }, [activeTab, spmsDate]);

  useEffect(() => {
    if (activeTab !== "ld") return;
    setLdLoading(true);
    getLiquidationDamagesWithDetails(ldMonth, ldYear)
      .then((data) => setLdDeductions(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("Error fetching liquidation damages:", e);
        setLdDeductions([]);
      })
      .finally(() => setLdLoading(false));
  }, [activeTab, ldMonth, ldYear]);

  const fmt = (n: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(Math.round(n));
  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
  const fmtDecimal = (n: number, d = 2) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);

  const loadLastDay = useCallback(async (date: Date) => {
    setLastDayLoading(true);
    setLastDayPage(1);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const data = await fetchDailyOperationsReports(dateStr, dateStr);
      setLastDayReports(data ?? []);
    } catch (e) {
      console.error("Error fetching last day operations reports:", e);
      setLastDayReports([]);
    } finally {
      setLastDayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "lastday") {
      loadLastDay(lastDayDate);
    }
  }, [activeTab, lastDayDate, loadLastDay]);

  /** Options for Last Day filters from current reports */
  const lastDayDepotOptions = useMemo(() => {
    const reports = lastDayReports ?? [];
    // BAE-649: depositName pode vir null (operação adhoc/BAOP sem depósito resolvido).
    const set = new Set(
      reports.map((r) => r.depositName).filter((name): name is string => !!name)
    );
    return ["All", ...Array.from(set).sort()];
  }, [lastDayReports]);
  const lastDayRouteOptions = useMemo(() => {
    const reports = lastDayReports ?? [];
    const set = new Set(reports.map((r) => r.routeName).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [lastDayReports]);

  /** Resumo diário com filtros depot/loop/route (loop por API ou por mapeamento rota→loop). Supervisor: só vê o seu depot. */
  const lastDayFiltered = useMemo(() => {
    const reports = lastDayReports ?? [];

    // If supervisor has no depot assigned for this date, return empty (show "No operations" message)
    if (isSupervisor && !supervisorDepositName && supervisorDepositId == null) {
      return [];
    }

    return reports.filter((row) => {
      if (isSupervisor) {
        if (supervisorDepositName) {
          if ((row.depositName ?? "").trim().toUpperCase() !== supervisorDepositName.trim().toUpperCase()) return false;
        } else if (supervisorDepositId != null) {
          if (row.depositId !== supervisorDepositId) return false;
        }
        // If supervisor has no depot at all, row should not be included (already filtered out above)
      } else if (filterDepot !== "All" && (row.depositName ?? "") !== filterDepot) return false;
      const rowLoop = getEffectiveLoop(row);
      if (filterLoop !== "All" && rowLoop.toUpperCase() !== filterLoop.toUpperCase()) return false;
      if (filterRoute !== "All" && (row.routeName ?? "") !== filterRoute) return false;
      return true;
    });
  }, [lastDayReports, filterDepot, filterLoop, filterRoute, isSupervisor, supervisorDepositName, supervisorDepositId]);
  /** Para supervisor, opções de Route apenas do depot dele */
  const lastDayRouteOptionsForSupervisor = useMemo(() => {
    const set = new Set(lastDayFiltered.map((r) => r.routeName).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [lastDayFiltered]);
  const lastDayTotal = lastDayFiltered.length;
  const lastDayTotalPages = Math.max(1, Math.ceil(lastDayTotal / lastDayPageSize));

  useEffect(() => {
    setLastDayPage(1);
  }, [lastDayDate]);

  useEffect(() => {
    if (lastDayPage > lastDayTotalPages) setLastDayPage(lastDayTotalPages);
  }, [lastDayTotalPages, lastDayPage]);

  const lastDayPaginated = useMemo(() => {
    if (lastDayFiltered.length === 0) return [];
    const sorted = [...lastDayFiltered].sort((a, b) => {
      const ra = (a.routeName ?? "").trim();
      const rb = (b.routeName ?? "").trim();
      return ra.localeCompare(rb);
    });
    const start = (lastDayPage - 1) * lastDayPageSize;
    return sorted.slice(start, start + lastDayPageSize);
  }, [lastDayFiltered, lastDayPage, lastDayPageSize]);

  const lastDayAgg = useMemo(() => {
    if (lastDayFiltered.length === 0) return null;
    const totalStops = lastDayFiltered.reduce((s, o) => {
      const v = o.totalStops;
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      return s + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const totalRoutes = lastDayFiltered.length;
    const spr = totalRoutes > 0 ? totalStops / totalRoutes : 0;
    return {
      totalStops,
      totalRoutes,
      totalAmount: undefined as number | undefined,
      totalDhlSpr: spr,
      totalDhlAvrgPerStops: undefined as number | undefined,
      totalAvrg: undefined as number | undefined,
    };
  }, [lastDayFiltered]);

  const lastdayKpisFull = [
    { icon: Package, label: "Total Stops", raw: lastDayAgg?.totalStops ?? daily?.totalStops, format: fmt, accent: "bg-blue-100    text-blue-600" },
    { icon: Gauge, label: "SPOHR", raw: lastDayAgg?.totalDhlSpr ?? daily?.totalDhlSpr, format: fmtDecimal, accent: "bg-amber-100   text-amber-600" },
    { icon: MapPin, label: "Routes", raw: lastDayAgg?.totalRoutes ?? daily?.totalRoutes, format: fmt, accent: "bg-cyan-100    text-cyan-600" },
    { icon: PoundSterling, label: "Amount", raw: lastDayAgg?.totalAmount ?? daily?.totalAmount, format: fmtCurrency, accent: "bg-emerald-100 text-emerald-600" },
    { icon: TrendingUp, label: "Avg/Stop Inc.", raw: lastDayAgg?.totalDhlAvrgPerStops ?? daily?.totalDhlAvrgPerStops, format: fmtCurrency, accent: "bg-teal-100    text-teal-600" },
    { icon: Clock, label: "Avg Paid", raw: lastDayAgg?.totalAvrg ?? daily?.totalAvrg, format: fmtCurrency, accent: "bg-indigo-100  text-indigo-600" },
  ];
  /** Supervisor não vê valores financeiros: só Total Stops, SPOHR, Routes */
  const lastdayKpis = isSupervisor
    ? lastdayKpisFull.filter((k) => k.label !== "Amount" && k.label !== "Avg/Stop Inc." && k.label !== "Avg Paid")
    : lastdayKpisFull;

  const spmsDailyData = activeTab === "spms" ? (spmsDaily ?? daily) : daily;
  const spmsKpis = [
    { icon: Box, label: "DEL", raw: undefined, format: fmt, accent: "bg-blue-100    text-blue-600" },
    { icon: ArrowUpCircle, label: "PU", raw: undefined, format: fmt, accent: "bg-emerald-100 text-emerald-600" },
    { icon: Truck, label: "HN", raw: undefined, format: fmt, accent: "bg-amber-100   text-amber-600" },
    { icon: PoundSterling, label: "Income", raw: spmsDailyData?.totalAmount, format: fmtCurrency, accent: "bg-teal-100    text-teal-600" },
    { icon: TrendingUp, label: "% vs target", raw: undefined, format: fmtDecimal, accent: "bg-indigo-100  text-indigo-600" },
  ];

  /** Map routeId → routeName for LD loop filter */
  const routeIdToName = useMemo(() => {
    const m = new Map<number, string>();
    for (const dep of depositsWithRoutes ?? []) {
      for (const r of dep.routes ?? []) {
        if (r.routeName) m.set(r.routeId, r.routeName);
      }
    }
    return m;
  }, [depositsWithRoutes]);

  /** LD filter by depot, loop (rota→loop DY1/DY2/LL3/LL4/MD7) e route */
  const ldFiltered = useMemo(() => {
    let list = ldDeductions;

    // If supervisor has no depot assigned for this month, return empty
    if (isSupervisor && !supervisorDepositName && supervisorDepositId == null) {
      return [];
    }

    // Apply supervisor depot filter
    if (isSupervisor && supervisorDepositName && depositsWithRoutes?.length) {
      const dep = depositsWithRoutes.find(
        (d) => (d.depositName ?? "").trim().toUpperCase() === supervisorDepositName.trim().toUpperCase()
      );
      if (dep) {
        const routeIds = new Set((dep.routes ?? []).map((r: RouteByDepositDTO) => r.routeId));
        list = list.filter((d) => routeIds.has(d.routeId));
      }
    } else if (filterDepot !== "All" && depositsWithRoutes?.length) {
      const dep = depositsWithRoutes.find(
        (d) => (d.depositName ?? "").trim().toUpperCase() === filterDepot.trim().toUpperCase()
      );
      if (dep) {
        const routeIds = new Set((dep.routes ?? []).map((r: RouteByDepositDTO) => r.routeId));
        list = list.filter((d) => routeIds.has(d.routeId));
      }
    }
    if (filterLoop !== "All") {
      list = list.filter((d) => {
        const routeName = routeIdToName.get(d.routeId) ?? "";
        const loop = getLoopFromRoute(routeName);
        return loop !== null && loop.toUpperCase() === filterLoop.toUpperCase();
      });
    }
    if (filterRoute !== "All") {
      const routeId = Number(filterRoute);
      if (Number.isFinite(routeId)) list = list.filter((d) => d.routeId === routeId);
    }
    return list;
  }, [ldDeductions, filterDepot, filterLoop, filterRoute, depositsWithRoutes, routeIdToName, isSupervisor, supervisorDepositName, supervisorDepositId]);

  const ldTotalAmount = useMemo(() => ldFiltered.reduce((s, d) => s + (d.amount ?? 0), 0), [ldFiltered]);
  const ldKpis = [
    { icon: List, label: "Deductions", raw: ldFiltered.length, format: fmt, accent: "bg-rose-100  text-rose-600" },
    { icon: PoundSterling, label: "Total Amount", raw: ldFiltered.length ? ldTotalAmount : undefined, format: fmtCurrency, accent: "bg-amber-100 text-amber-600" },
  ];

  /** Depot/route options for LD and SPMS from deposits API */
  const depositsDepotOptions = useMemo(() => {
    if (!depositsWithRoutes?.length) return ["All"];
    const names = depositsWithRoutes.map((d) => d.depositName ?? "").filter(Boolean);
    return ["All", ...names.sort()];
  }, [depositsWithRoutes]);
  const depositsRouteOptions = useMemo(() => {
    if (!depositsWithRoutes?.length) return [] as { value: string; label: string }[];
    const out: { value: string; label: string }[] = [];
    for (const dep of depositsWithRoutes) {
      const name = dep.depositName ?? "";
      for (const r of dep.routes ?? []) {
        const routeName = r.routeName ?? "";
        if (routeName) out.push({ value: String(r.routeId), label: `${routeName}${name ? ` (${name})` : ""}` });
      }
    }
    out.sort((a, b) => a.label.localeCompare(b.label));
    return out;
  }, [depositsWithRoutes]);

  const tabKpis: Record<TabId, typeof lastdayKpis> = { lastday: lastdayKpis, spms: spmsKpis, ld: ldKpis };

  const spmsCards = [
    { label: "Income", icon: <PoundSterling className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalAmount, format: fmtCurrency },
    { label: "Avg Income / Stop", icon: <TrendingUp className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalDhlAvrgPerStops, format: fmtCurrency },
    { label: "Avg Paid / Stop", icon: <Gauge className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalAvrg, format: fmtCurrency },
    { label: "Total Routes", icon: <MapPin className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalRoutes, format: fmt },
    { label: "Total Stops", icon: <Package className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalStops, format: fmt },
    { label: "DHL Route Cost", icon: <PoundSterling className="w-3.5 h-3.5" />, raw: spmsDailyData?.totalDhlRouteCost, format: fmtCurrency },
  ];

  const effectiveTab = isSupervisor ? "lastday" : activeTab;

  /** Notify parent when "My Last Operations" shows no data (so Compliance/Vehicles can render compact). */
  useEffect(() => {
    if (!onOperationsDataChange) return;
    const isLastDayTab = effectiveTab === "lastday";
    const hasData = !isLastDayTab || lastDayLoading || lastDayFiltered.length > 0;
    onOperationsDataChange(hasData);
  }, [onOperationsDataChange, effectiveTab, lastDayLoading, lastDayFiltered.length]);

  const kpisToShow = isSupervisor ? lastdayKpis : tabKpis[activeTab];
  /** Depot efetivo para filtrar opções de Loop (supervisor = depot dele; outros = filtro Depot) */
  const effectiveDepotForLoop = isSupervisor ? supervisorDepositName : filterDepot;
  const loopOptions = effectiveDepotForLoop && effectiveDepotForLoop !== "All"
    ? ["All", ...getLoopsForDepot(effectiveDepotForLoop)]
    : [...LOOP_FILTER_OPTIONS];

  return (
    <section className="mt-4 mb-0 rounded-[1.25rem] border border-blue-200/30 bg-white shadow-sm overflow-hidden" aria-label={isSupervisor ? "Operations (your depot)" : "Last Day Operations / Financials"}>
      {/* Tabs — ocultos para supervisor */}
      {!isSupervisor && (
        <div className="border-b border-slate-200">
          <ul className="flex flex-wrap" role="tablist">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id} role="presentation">
                <button
                  type="button" role="tab" aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id
                    ? "border-blue-500 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-blue-200/40 bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 mx-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Depot */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 flex-shrink-0 text-blue-600" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Depot</span>
            </div>
            {isSupervisor ? (
              <div className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 min-w-[8rem] font-medium">
                {supervisorDepositName ?? "—"}
              </div>
            ) : (
              <select
                value={filterDepot}
                onChange={(e) => setFilterDepot(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 min-w-[8rem] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:border-blue-300"
              >
                {(activeTab === "lastday" ? lastDayDepotOptions : depositsDepotOptions).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
          {/* Loop */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <ListFilter className="w-4 h-4 flex-shrink-0 text-cyan-600" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Loop</span>
            </div>
            <select
              value={filterLoop}
              onChange={(e) => setFilterLoop(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 min-w-[8rem] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:border-cyan-300"
            >
              {loopOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Route */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-600">
              <Route className="w-4 h-4 flex-shrink-0 text-emerald-600" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Route</span>
            </div>
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 min-w-[10rem] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 focus:border-emerald-300"
            >
              {effectiveTab === "lastday"
                ? (isSupervisor ? lastDayRouteOptionsForSupervisor : lastDayRouteOptions).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))
                : (() => {
                  return (
                    <>
                      <option value="All">All</option>
                      {depositsRouteOptions.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </>
                  );
                })()}
            </select>
          </div>

          {(effectiveTab === "lastday") && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 flex-shrink-0 text-amber-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Date</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                <button
                  type="button"
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous date"
                  onClick={() => setLastDayDate((d) => subDays(d, 1))}
                >
                  ←
                </button>
                <label className="flex-1 min-w-0 cursor-pointer">
                  <input
                    type="date"
                    value={format(lastDayDate, "yyyy-MM-dd")}
                    max={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) setLastDayDate(new Date(v + "T12:00:00"));
                    }}
                    className="w-full min-w-[7rem] px-2 py-0.5 text-sm text-slate-600 text-center bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 rounded [color-scheme:light]"
                  />
                </label>
                <button
                  type="button"
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next date"
                  onClick={() => setLastDayDate((d) => {
                    const next = addDays(d, 1);
                    return isAfter(next, new Date()) ? d : next;
                  })}
                  disabled={format(lastDayDate, "yyyy-MM-dd") >= format(new Date(), "yyyy-MM-dd")}
                >
                  →
                </button>
              </div>
            </div>
          )}
          {(effectiveTab === "lastday") && (
            <motion.div key="tw" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
              <span className="block text-xs text-slate-500 mb-1">Time window</span>
              <div className="flex gap-2 flex-wrap">
                {["All", "On Target", "Needs Improvement", "Off Target"].map((tw) => (
                  <button key={tw} type="button" className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">{tw}</button>
                ))}
              </div>
            </motion.div>
          )}
          {!isSupervisor && activeTab === "spms" && (
            <div>
              <span className="block text-xs text-slate-500 mb-1">Date</span>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                <button
                  type="button"
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous date"
                  onClick={() => setSpmsDate((d) => subDays(d, 1))}
                >
                  ←
                </button>
                <label className="flex-1 min-w-0 cursor-pointer">
                  <input
                    type="date"
                    value={format(spmsDate, "yyyy-MM-dd")}
                    max={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) setSpmsDate(new Date(v + "T12:00:00"));
                    }}
                    className="w-full min-w-[7rem] px-2 py-0.5 text-sm text-slate-600 text-center bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 rounded [color-scheme:light]"
                  />
                </label>
                <button
                  type="button"
                  className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next date"
                  onClick={() => setSpmsDate((d) => {
                    const next = addDays(d, 1);
                    return isAfter(next, new Date()) ? d : next;
                  })}
                  disabled={format(spmsDate, "yyyy-MM-dd") >= format(new Date(), "yyyy-MM-dd")}
                >
                  →
                </button>
              </div>
            </div>
          )}
          {!isSupervisor && activeTab === "ld" && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <span className="block text-xs text-slate-500 mb-1">Month</span>
                <select
                  value={ldMonth}
                  onChange={(e) => setLdMonth(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 min-w-[7rem]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString("en-GB", { month: "long" })}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-xs text-slate-500 mb-1">Year</span>
                <select
                  value={ldYear}
                  onChange={(e) => setLdYear(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 min-w-[5rem]"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="px-4 pt-4 pb-0">
        <AnimatePresence mode="wait">
          <motion.div key={effectiveTab} className="flex flex-wrap gap-3" variants={stripVariants} initial="hidden" animate="visible" exit="hidden">
            {kpisToShow.map((kpi, idx) => (
              <AnimatedKpiCard
                key={`${effectiveTab}-${idx}`}
                icon={kpi.icon}
                label={kpi.label}
                raw={kpi.raw}
                format={kpi.format as (n: number) => string}
                accent={kpi.accent}
                loading={effectiveTab === "lastday" ? lastDayLoading : activeTab === "spms" ? spmsLoading : activeTab === "ld" ? ldLoading : isLoading}
                dataReady={effectiveTab === "lastday" ? !lastDayLoading : activeTab === "spms" ? !spmsLoading : activeTab === "ld" ? !ldLoading : dataReady}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab panels */}
      <div className="px-4 pt-2 pb-0">
        <AnimatePresence mode="wait">
          {effectiveTab === "lastday" && (
            <motion.div key="lastday" variants={tabPanelVariants} initial="hidden" animate="visible" exit="exit">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Route", "Vendor", "Stops", "TW (%)", "Depart", "Arrive", "Work hours"].map((h) => (
                          <th key={h} className={`px-4 py-2 font-semibold text-slate-700 ${h !== "Route" && h !== "Vendor" ? "text-end" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lastDayLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin inline" />
                              Loading…
                            </span>
                          </td>
                        </tr>
                      ) : !lastDayReports || lastDayReports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                            No operations for the selected date.
                          </td>
                        </tr>
                      ) : (
                        lastDayPaginated.map((row) => (
                          <tr key={`${row.operationId}-${row.routeName}-${row.courierName}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-medium text-slate-800">
                              {row.routeName ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-slate-700">
                              {row.courierName ?? "—"}
                            </td>
                            <td className="px-4 py-2 text-end text-slate-700">
                              {row.totalStops != null ? String(row.totalStops) : "—"}
                            </td>
                            <td className="px-4 py-2 text-end text-slate-700">
                              {row.percentageOtTwDl != null
                                ? `${Number(row.percentageOtTwDl).toFixed(1)}%`
                                : "—"}
                            </td>
                            <td className="px-4 py-2 text-end text-slate-600 text-xs">
                              {row.departTime ? row.departTime.slice(0, 8) : "—"}
                            </td>
                            <td className="px-4 py-2 text-end text-slate-600 text-xs">
                              {row.arriveTime ? row.arriveTime.slice(0, 8) : "—"}
                            </td>
                            <td className="px-4 py-2 text-end text-slate-700">
                              {row.calculatedWorkHours ?? row.totalWorkHours ?? "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!lastDayLoading && lastDayReports && lastDayReports.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">
                        Showing {(lastDayPage - 1) * lastDayPageSize + 1}–{Math.min(lastDayPage * lastDayPageSize, lastDayTotal)} of {lastDayTotal}
                      </span>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Per page</span>
                        <select
                          value={lastDayPageSize}
                          onChange={(e) => {
                            setLastDayPageSize(Number(e.target.value));
                            setLastDayPage(1);
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800"
                        >
                          {LAST_DAY_PAGE_SIZES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setLastDayPage((p) => Math.max(1, p - 1))}
                        disabled={lastDayPage <= 1}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm text-slate-600 min-w-[4rem] text-center">
                        Page {lastDayPage} of {lastDayTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLastDayPage((p) => Math.min(lastDayTotalPages, p + 1))}
                        disabled={lastDayPage >= lastDayTotalPages}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!isSupervisor && activeTab === "spms" && (
            <motion.div key="spms" variants={tabPanelVariants} initial="hidden" animate="visible" exit="exit">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Financial summary (daily)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Income, averages and route costs from your daily status.</p>
              </div>
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={stripVariants} initial="hidden" animate="visible">
                {spmsCards.map((card, idx) => (
                  <AnimatedSfbCard key={idx} label={card.label} icon={card.icon} raw={card.raw} format={card.format as (n: number) => string} loading={spmsLoading} dataReady={!spmsLoading} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {!isSupervisor && activeTab === "ld" && (
            <motion.div key="ld" variants={tabPanelVariants} initial="hidden" animate="visible" exit="exit">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Vendor", "Vehicle", "Deduction value", "Issue description", "Schedule terms"].map((h) => (
                          <th key={h} className={`px-4 py-2 font-semibold text-slate-700 ${h === "Deduction value" ? "text-end" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ldLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin inline" />
                              Loading…
                            </span>
                          </td>
                        </tr>
                      ) : ldFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No liquidation damages for the selected month/year.
                          </td>
                        </tr>
                      ) : (
                        ldFiltered.map((d) => (
                          <tr key={d.liquidationDamageId} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-medium text-slate-800">{d.vendor ?? d.vendorName ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-700">{d.vehicle ?? d.vehicleName ?? (d.vehicleId != null ? `#${d.vehicleId}` : "—")}</td>
                            <td className="px-4 py-2 text-end font-medium text-slate-800">{fmtCurrency(d.amount ?? 0)}</td>
                            <td className="px-4 py-2 text-slate-700 max-w-[240px] truncate" title={d.description ?? ""}>{d.description ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-600 max-w-[180px] truncate" title={d.scheduleTerms ?? ""}>{d.scheduleTerms ?? "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────── Animated KPI card ───────── */
function AnimatedKpiCard({ icon: Icon, label, raw, format, accent, loading, dataReady }: {
  icon: LucideIcon; label: string; raw: number | undefined;
  format: (n: number) => string; accent: string; loading: boolean; dataReady: boolean;
}) {
  const animated = useCountUp(raw, 900, dataReady && raw !== undefined);
  const displayValue = loading ? null : raw === undefined ? "—" : format(animated);

  return (
    <motion.div
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 min-w-[160px] shadow-sm cursor-default"
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-11 h-11 rounded-lg ${accent} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400 mb-0.5" />
        ) : (
          <motion.span key={String(raw)} className="text-base font-bold text-slate-800 block truncate"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {displayValue}
          </motion.span>
        )}
        <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-slate-500 block truncate">{label}</span>
      </div>
    </motion.div>
  );
}

/* ───────── Animated SPMS card ───────── */
function AnimatedSfbCard({ label, icon, raw, format, loading, dataReady }: {
  label: string; icon?: React.ReactNode; raw: number | undefined;
  format: (n: number) => string; loading: boolean; dataReady: boolean;
}) {
  const animated = useCountUp(raw, 900, dataReady && raw !== undefined);
  const displayValue = loading ? null : raw === undefined ? "—" : format(animated);

  return (
    <motion.div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50" variants={cardVariants}
      whileHover={{ y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">{icon} {label}</span>
      {loading ? (
        <Loader2 className="mt-1 w-5 h-5 animate-spin text-slate-400" />
      ) : (
        <motion.span key={String(raw)} className="text-xl font-bold text-slate-800 block mt-0.5"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {displayValue}
        </motion.span>
      )}
    </motion.div>
  );
}



