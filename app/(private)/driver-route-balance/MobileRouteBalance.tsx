"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppContext, type DriverRouteData, type Report, type Screen } from "./state";
import Overview from "./screens/Overview";
import SpecialDeliveries from "./screens/SpecialDeliveries";
import AllStops from "./screens/AllStops";
import ShipmentDetails from "./screens/ShipmentDetails";
import AccidentReport from "./screens/AccidentReport";
import ReportIssue from "./screens/ReportIssue";
import FinishRoute from "./screens/FinishRoute";
import { fetchAllWeekPlannersForDate } from "../week-planner/services/apiService";
import type { WeekPlannerRecord } from "../week-planner/contexts/PlannerContext";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { getBearerAuthHeader } from "@/lib/auth";

const screens: Record<Screen, () => JSX.Element> = {
  overview: Overview,
  "special-deliveries": SpecialDeliveries,
  "all-stops": AllStops,
  "shipment-details": ShipmentDetails,
  "accident-report": AccidentReport,
  "report-issue": ReportIssue,
  "finish-route": FinishRoute,
};

const currentScreen = (): Screen => {
  if (typeof window === "undefined") return "overview";
  const candidate = window.location.hash.slice(2) as Screen;
  return Object.prototype.hasOwnProperty.call(screens, candidate) ? candidate : "overview";
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;

const parseNumber = (...values: unknown[]) => {
  for (const value of values) {
    const number = Number(value);
    if (value !== undefined && value !== null && value !== "" && Number.isFinite(number) && number >= 0) return number;
  }
  return 0;
};

function findStopRows(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 4 || !value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    const rows = value.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
    if (rows.some((row) => Object.keys(row).some((key) => /postcode|address|stopaddress|shipmentid/i.test(key)))) return rows;
    return value.flatMap((item) => findStopRows(item, depth + 1));
  }
  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, child]) =>
    /stops|shipments|deliveries|manifest|routeitems/i.test(key) ? findStopRows(child, depth + 1) :
      typeof child === "object" ? findStopRows(child, depth + 1) : []
  );
}

function findPostcodes(value: unknown, depth = 0): string[] {
  if (depth > 5 || !value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap((item) => findPostcodes(item, depth + 1));
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    if (/postcode|postal.?code|sub.?postcode/i.test(key)) {
      const values = Array.isArray(child) ? child : [child];
      return values.filter((item): item is string | number => typeof item === "string" || typeof item === "number").map(String);
    }
    return typeof child === "object" ? findPostcodes(child, depth + 1) : [];
  });
}

function getDriverRoutes(assignments: WeekPlannerRecord[], operationsByDate: Map<string, Record<string, unknown>[]>): DriverRouteData[] {
  return assignments.map((assignment) => {
    const raw = assignment.raw;
    const routeId = String(raw.routeId ?? asRecord(raw.route)?.routeId ?? "");
    const routeName = assignment.route.trim().toLowerCase();
    const operations = operationsByDate.get(assignment.date) ?? [];
    const operation = operations.find((item) =>
      (routeId && String(item.routeId ?? asRecord(item.route)?.routeId ?? "") === routeId) ||
      (routeName && String(item.routeName ?? asRecord(item.route)?.routeName ?? "").trim().toLowerCase() === routeName)
    ) ?? (operations.length === 1 ? operations[0] : undefined);
    const operationMetrics = asRecord(operation?.dailyMetrics) ?? {};
    const deliveryDetails = asRecord(operation?.deliveryDetails) ?? {};
    const paid = asRecord(operation?.paidStops) ?? asRecord(deliveryDetails.paidStops) ?? {};
    const unpaid = asRecord(operation?.unpaidStops) ?? asRecord(deliveryDetails.unpaidStops) ?? {};
    const stops = findStopRows(operation);
    const pickups = parseNumber(paid.pu, operation?.pickups, operation?.totalPickups);
    const paidTotal = parseNumber(operation?.totalPaidStops, operation?.paidStopsCount, paid.total) ||
      [paid.pu, paid.ok, paid.hn, paid.pd].reduce<number>((sum, value) => sum + parseNumber(value), 0);
    const unpaidTotal = parseNumber(operation?.totalUnpaidStops, operation?.unpaidStopsCount, unpaid.total);
    return {
      assignment,
      operation,
      stops,
      postcodes: [...new Set(findPostcodes(operation).map((postcode) => postcode.trim()).filter(Boolean))],
      totalStops: parseNumber(operation?.totalStops, operationMetrics.totalStops, stops.length, raw.totalStops, raw.stops),
      paidStops: paidTotal || parseNumber(paid.pu, paid.ok, paid.hn, paid.pd),
      unpaidStops: unpaidTotal || Object.values(unpaid).reduce<number>((sum, value) => sum + parseNumber(value), 0),
      deliveries: parseNumber(operation?.totalDeliveries, operation?.deliveries) || Math.max(0, paidTotal - pickups),
      pickups,
      pre12: parseNumber(operation?.pre12, operation?.totalPre12, operation?.pre12Deliveries),
    };
  });
}

function todayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export default function MobileRouteBalance({ driverName = "Driver", userId }: { driverName?: string; userId?: number }) {
  const [screen, setScreen] = useState<Screen>("overview");
  const [message, setMessage] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [routes, setRoutes] = useState<DriverRouteData[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRouteLoading(true);
      setRouteError("");
      try {
        const date = todayKey();
        const week = await fetchAllWeekPlannersForDate(date);
        const assigned = week.filter((record) => {
          if (!record.date || record.isDayOff === "true") return false;
          const raw = record.raw;
          const assignedId = Number(raw.userId ?? asRecord(raw.vendor)?.userId);
          return assignedId > 0 && userId ? assignedId === userId : record.name.trim().toLowerCase() === driverName.trim().toLowerCase();
        });
        const operationsByDate = new Map<string, Record<string, unknown>[]>();
        await Promise.all([...new Set(assigned.map((record) => record.date))].map(async (dateKey) => {
          if (!userId) return;
          const [year, month, day] = dateKey.split("-").map(Number);
          const response = await fetch(`${getApiBaseUrl()}/bff/daily-overview/${userId}/${year}/${month}/${day}`, {
            headers: { ...getBearerAuthHeader() },
            cache: "no-store",
          });
          if (!response.ok) return;
          const data: unknown = await response.json();
          const envelope = asRecord(data);
          const nested = asRecord(envelope?.data);
          const rows = Array.isArray(data) ? data :
            Array.isArray(envelope?.operations) ? envelope.operations as unknown[] :
              Array.isArray(envelope?.data) ? envelope.data as unknown[] :
                Array.isArray(nested?.operations) ? nested.operations as unknown[] : [data];
          operationsByDate.set(dateKey, rows.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row)));
        }));
        if (cancelled) return;
        const loaded = getDriverRoutes(assigned, operationsByDate);
        setRoutes(loaded);
        setRouteIndex(Math.max(0, loaded.findIndex((route) => route.assignment.date === date)));
      } catch (error) {
        if (!cancelled) setRouteError(error instanceof Error ? error.message : "Unable to load route data.");
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    };
    load();
    const changed = () => {
      setScreen(currentScreen());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", changed);
    changed();
    return () => { cancelled = true; window.removeEventListener("hashchange", changed); };
  }, [driverName, userId]);

  const navigate = useCallback((next: Screen) => {
    window.location.hash = `/${next}`;
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);
  const submit = useCallback(async (_report: Report) => {
    throw new Error("Report submission is not connected to a backend yet.");
  }, []);
  const finish = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    setMessage("Route completion is not connected to a backend yet.");
    setFinishing(false);
  }, [finishing]);

  const Page = screens[screen];
  const context = useMemo(() => ({ navigate, submit, finish, driverName, routes, routeIndex, routeLoading, routeError, selectRoute: setRouteIndex }),
    [navigate, submit, finish, driverName, routes, routeIndex, routeLoading, routeError]);

  return (
    <AppContext.Provider value={context}>
      <div className="driver-route-balance">
        <main className="mobile-app" aria-label="Route Balance" aria-busy={finishing || routeLoading}>
          <Page key={screen} />
          {routeError && <p className="driver-route-balance__feedback" role="alert">{routeError}</p>}
        </main>
        {message && <div className="notice" role="status">{message}<button aria-label="Dismiss notification" onClick={() => setMessage("")}>×</button></div>}
      </div>
    </AppContext.Provider>
  );
}
