/**
 * Mock data for the Supervisor Home visual-only build — not wired to the
 * real API yet. Open items before it reads real data:
 * - no backend endpoint returns a 7-day vendor performance ranking scoped
 *   to one deposit yet (/bff/daily-overview returns per-user/day rows);
 * - deposit/supervisor resolution would reuse lib/daily-supervisor-check.ts.
 *
 * Everything here summarizes the previous business day — routes, sort,
 * performance — except `dayFinalized`/`routeBalance`/`gamePlan`, which
 * reflect today's in-progress operation.
 *
 * A supervisor sees their own deposit. An admin sees every deposit and can
 * narrow to one, so the data is keyed by deposit and `aggregateDeposits`
 * rolls the selection up.
 */
import { initialDeposits, type DepositKey } from "@/app/(private)/daily-game-plan/mockDailyGamePlanData";
import type { DailySeries, SupervisorHomeSummary, VendorPerformanceEntry } from "./types";

/** The day's lifecycle in Route Balance, in order. `routeBalance.stage` indexes this. */
export const OPERATION_STAGES = ["Routes imported", "Balanced", "Sent to drivers", "Finalized"] as const;

export const DEPOSIT_KEYS: DepositKey[] = ["BAOP", "LCY", "MSE", "LSE"];

function previousBusinessDayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  if (d.getDay() === 0) d.setDate(d.getDate() - 2); // Sunday -> Friday
  if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Saturday -> Friday
  return d.toISOString().slice(0, 10);
}

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue"];
const DATE = previousBusinessDayIso();

const series = (values: number[]): DailySeries => ({ labels: WEEK_LABELS, values });

export const mockByDeposit: Record<DepositKey, SupervisorHomeSummary> = {
  BAOP: {
    depositKey: "BAOP",
    depositLead: initialDeposits.BAOP.lead,
    date: DATE,
    dayFinalized: false,
    routeBalance: { pendingRoutes: 2, unassignedStops: 14, stage: 1, lastUpdated: "08:42" },
    // Straight from the Daily Game Plan's own dataset — the block is a smaller
    // view of that page, not a second copy of the same plan.
    gamePlan: { lead: initialDeposits.BAOP.lead, drivers: initialDeposits.BAOP.drivers },
    allocatedDrivers: 8,
    totalDrivers: 10,
    driversOff: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
    sortRatePercent: 80,
    sortRatePrevious: 75,
    stopsDelivered: 691,
    stopsDeliveredPrevious: 678,
    failures: 9,
    failuresPrevious: 11,
    stopsSeries: series([642, 664, 657, 685, 671, 678, 691]),
    failuresSeries: series([14, 9, 12, 8, 15, 11, 9]),
    sortRateSeries: series([60, 60, 80, 75, 60, 75, 80]),
    routes: [
      { routeCode: "B04", vendorName: "ADRIANO DUTRA", vrn: "YF25 OZL", sort: "Yes", stops: 142, plannedStops: 142, notReceived: 0, failedPick: 0, sporH: 17.8, timeWindowPercent: 98.6, departTime: "09:12", arriveTime: "17:04", workHours: "7:52" },
      { routeCode: "B07", vendorName: "BRUNO RIBEIRO", vrn: "LV21 UFT", sort: "No", stops: 138, plannedStops: 142, notReceived: 3, failedPick: 1, sporH: 16.2, timeWindowPercent: 94.2, departTime: "09:05", arriveTime: "17:38", workHours: "8:33" },
      { routeCode: "B11", vendorName: "MARCOS ALVES", vrn: "LV22 JHF", sort: "No", stops: 126, plannedStops: 130, notReceived: 3, failedPick: 1, sporH: 17.4, timeWindowPercent: 81.3, departTime: "10:26", arriveTime: "17:41", workHours: "7:15", note: "Late start" },
      { routeCode: "B15", vendorName: "RAFAEL SOUZA", vrn: "YF25 OZL", sort: "Yes", stops: 150, plannedStops: 150, notReceived: 0, failedPick: 0, sporH: 18.9, timeWindowPercent: 99.3, departTime: "08:58", arriveTime: "16:52", workHours: "7:54" },
      { routeCode: "B22", vendorName: "DIEGO SANTOS", vrn: "LV22 JHF", sort: "No", stops: 135, plannedStops: 136, notReceived: 1, failedPick: 0, sporH: 16.9, timeWindowPercent: 96.7, departTime: "09:18", arriveTime: "17:12", workHours: "7:54", note: "Covering B19" },
    ],
    depositAverageScore: 93.1,
    depositAverageScorePrevious: 92.4,
    topVendors: [
      { vendorName: "RAFAEL SOUZA", routeCode: "B15", score: 99.2, previousScore: 98.0, notReceived: 1, failedPick: 0, sporH: 18.4, rtw: 99.1 },
      { vendorName: "ADRIANO DUTRA", routeCode: "B04", score: 98.1, previousScore: 98.6, notReceived: 2, failedPick: 1, sporH: 17.6, rtw: 98.2 },
      { vendorName: "DIEGO SANTOS", routeCode: "B22", score: 97.4, previousScore: 95.9, notReceived: 3, failedPick: 1, sporH: 16.8, rtw: 96.9 },
    ],
    attentionVendors: [
      { vendorName: "MARCOS ALVES", routeCode: "B11", score: 87.6, previousScore: 85.2, notReceived: 7, failedPick: 2, sporH: 16.0, rtw: 84.7 },
      { vendorName: "BRUNO RIBEIRO", routeCode: "B07", score: 83.1, previousScore: 90.4, notReceived: 9, failedPick: 4, sporH: 15.1, rtw: 88.4 },
    ],
  },

  LCY: {
    depositKey: "LCY",
    depositLead: initialDeposits.LCY.lead,
    date: DATE,
    dayFinalized: true,
    finalizedAt: "08:21",
    routeBalance: { pendingRoutes: 0, unassignedStops: 0, stage: 3, lastUpdated: "08:21" },
    gamePlan: { lead: initialDeposits.LCY.lead, drivers: initialDeposits.LCY.drivers },
    allocatedDrivers: 2,
    totalDrivers: 4,
    driversOff: ["CARLOS EDUARDO"],
    sortRatePercent: 50,
    sortRatePrevious: 50,
    stopsDelivered: 268,
    stopsDeliveredPrevious: 274,
    failures: 5,
    failuresPrevious: 3,
    stopsSeries: series([259, 271, 266, 280, 263, 274, 268]),
    failuresSeries: series([4, 6, 3, 5, 7, 3, 5]),
    sortRateSeries: series([50, 50, 100, 50, 50, 50, 50]),
    routes: [
      { routeCode: "L02", vendorName: "FELIPE ARAUJO", vrn: "LV21 UFT", sort: "No", stops: 131, plannedStops: 134, notReceived: 2, failedPick: 1, sporH: 16.4, timeWindowPercent: 95.1, departTime: "09:08", arriveTime: "17:06", workHours: "7:58" },
      { routeCode: "L05", vendorName: "JOAO PEREIRA", vrn: "YF25 OZL", sort: "Yes", stops: 137, plannedStops: 139, notReceived: 1, failedPick: 1, sporH: 17.9, timeWindowPercent: 97.8, departTime: "08:52", arriveTime: "16:34", workHours: "7:42" },
    ],
    depositAverageScore: 95.4,
    depositAverageScorePrevious: 94.1,
    topVendors: [
      { vendorName: "JOAO PEREIRA", routeCode: "L05", score: 97.8, previousScore: 95.2, notReceived: 2, failedPick: 1, sporH: 17.6, rtw: 97.4 },
      { vendorName: "FELIPE ARAUJO", routeCode: "L02", score: 93.1, previousScore: 93.0, notReceived: 5, failedPick: 2, sporH: 16.1, rtw: 94.2 },
    ],
    attentionVendors: [],
  },

  MSE: {
    depositKey: "MSE",
    depositLead: initialDeposits.MSE.lead,
    date: DATE,
    dayFinalized: false,
    routeBalance: { pendingRoutes: 1, unassignedStops: 6, stage: 2, lastUpdated: "08:55" },
    gamePlan: { lead: initialDeposits.MSE.lead, drivers: initialDeposits.MSE.drivers },
    allocatedDrivers: 3,
    totalDrivers: 3,
    driversOff: [],
    sortRatePercent: 33,
    sortRatePrevious: 67,
    stopsDelivered: 402,
    stopsDeliveredPrevious: 388,
    failures: 6,
    failuresPrevious: 9,
    stopsSeries: series([371, 383, 396, 390, 377, 388, 402]),
    failuresSeries: series([8, 11, 7, 10, 12, 9, 6]),
    sortRateSeries: series([33, 67, 33, 67, 33, 67, 33]),
    routes: [
      { routeCode: "M03", vendorName: "RICARDO GOMES", vrn: "LV22 JHF", sort: "No", stops: 128, plannedStops: 130, notReceived: 2, failedPick: 0, sporH: 16.7, timeWindowPercent: 93.4, departTime: "09:14", arriveTime: "17:02", workHours: "7:48" },
      { routeCode: "M06", vendorName: "VINICIUS ROCHA", vrn: "YF25 OZL", sort: "No", stops: 134, plannedStops: 136, notReceived: 1, failedPick: 1, sporH: 17.2, timeWindowPercent: 96.2, departTime: "09:02", arriveTime: "16:56", workHours: "7:54" },
      { routeCode: "M09", vendorName: "EDUARDO MARTINS", vrn: "LV21 UFT", sort: "Yes", stops: 140, plannedStops: 142, notReceived: 1, failedPick: 1, sporH: 18.1, timeWindowPercent: 98.4, departTime: "08:49", arriveTime: "16:38", workHours: "7:49" },
    ],
    depositAverageScore: 94.2,
    depositAverageScorePrevious: 93.8,
    topVendors: [
      { vendorName: "EDUARDO MARTINS", routeCode: "M09", score: 98.4, previousScore: 97.1, notReceived: 2, failedPick: 1, sporH: 18.0, rtw: 98.4 },
      { vendorName: "VINICIUS ROCHA", routeCode: "M06", score: 95.6, previousScore: 95.9, notReceived: 4, failedPick: 1, sporH: 17.1, rtw: 96.0 },
    ],
    attentionVendors: [
      { vendorName: "RICARDO GOMES", routeCode: "M03", score: 88.7, previousScore: 88.4, notReceived: 6, failedPick: 3, sporH: 16.4, rtw: 89.1 },
    ],
  },

  LSE: {
    depositKey: "LSE",
    depositLead: initialDeposits.LSE.lead,
    date: DATE,
    dayFinalized: false,
    routeBalance: { pendingRoutes: 3, unassignedStops: 21, stage: 0, lastUpdated: "09:04" },
    gamePlan: { lead: initialDeposits.LSE.lead, drivers: initialDeposits.LSE.drivers },
    allocatedDrivers: 2,
    totalDrivers: 3,
    driversOff: ["GUSTAVO MOURA"],
    sortRatePercent: 50,
    sortRatePrevious: 50,
    stopsDelivered: 244,
    stopsDeliveredPrevious: 251,
    failures: 8,
    failuresPrevious: 6,
    stopsSeries: series([238, 246, 240, 258, 236, 251, 244]),
    failuresSeries: series([7, 5, 9, 4, 11, 6, 8]),
    sortRateSeries: series([50, 50, 50, 100, 50, 50, 50]),
    routes: [
      { routeCode: "S01", vendorName: "ANTONIO BARBOSA", vrn: "LV22 JHF", sort: "No", stops: 118, plannedStops: 124, notReceived: 4, failedPick: 2, sporH: 15.3, timeWindowPercent: 86.4, departTime: "09:41", arriveTime: "17:28", workHours: "7:47", note: "Vehicle swap" },
      { routeCode: "S04", vendorName: "SAMUEL TEIXEIRA", vrn: "YF25 OZL", sort: "Yes", stops: 126, plannedStops: 128, notReceived: 1, failedPick: 1, sporH: 16.6, timeWindowPercent: 94.9, departTime: "09:06", arriveTime: "17:00", workHours: "7:54" },
    ],
    depositAverageScore: 89.8,
    depositAverageScorePrevious: 91.2,
    topVendors: [
      { vendorName: "SAMUEL TEIXEIRA", routeCode: "S04", score: 94.6, previousScore: 93.8, notReceived: 3, failedPick: 1, sporH: 16.5, rtw: 95.2 },
    ],
    attentionVendors: [
      { vendorName: "ANTONIO BARBOSA", routeCode: "S01", score: 85.1, previousScore: 88.6, notReceived: 8, failedPick: 5, sporH: 15.2, rtw: 86.0 },
    ],
  },
};

/** @deprecated kept so anything importing the old single-deposit name keeps working. */
export const mockSupervisorHomeSummary = mockByDeposit.BAOP;

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

/** Element-wise sum of several same-length day series. */
function sumSeries(all: DailySeries[]): DailySeries {
  return {
    labels: all[0].labels,
    values: all[0].values.map((_, i) => sum(all.map((s) => s.values[i]))),
  };
}

/** Weighted by each deposit's stops, since both are per-delivery measures. */
function weightedByStops(all: SupervisorHomeSummary[], pick: (s: SupervisorHomeSummary) => number): number {
  const stops = sum(all.map((s) => s.stopsDelivered));
  if (!stops) return 0;
  return Number((sum(all.map((s) => pick(s) * s.stopsDelivered)) / stops).toFixed(1));
}

const byScore = (a: VendorPerformanceEntry, b: VendorPerformanceEntry) => b.score - a.score;

/** Rolls several deposits into the one summary the dashboard renders. */
export function aggregateDeposits(keys: DepositKey[]): SupervisorHomeSummary {
  const all = keys.map((k) => mockByDeposit[k]);
  if (all.length === 1) return all[0];

  const everyVendor = all.flatMap((s) => [...s.topVendors, ...s.attentionVendors]).sort(byScore);

  return {
    depositKey: `${all.length} deposits`,
    depositLead: "",
    date: all[0].date,
    dayFinalized: all.every((s) => s.dayFinalized),
    routeBalance: {
      pendingRoutes: sum(all.map((s) => s.routeBalance.pendingRoutes)),
      unassignedStops: sum(all.map((s) => s.routeBalance.unassignedStops)),
      // The slowest deposit is the one that still needs attention.
      stage: Math.min(...all.map((s) => s.routeBalance.stage)),
      lastUpdated: all.map((s) => s.routeBalance.lastUpdated).sort().at(-1) ?? "",
    },
    gamePlan: {
      lead: "",
      drivers: all.flatMap((s) => s.gamePlan.drivers.map((d) => ({ ...d, deposit: s.depositKey }))),
    },
    allocatedDrivers: sum(all.map((s) => s.allocatedDrivers)),
    totalDrivers: sum(all.map((s) => s.totalDrivers)),
    driversOff: all.flatMap((s) => s.driversOff),
    sortRatePercent: Math.round(weightedByStops(all, (s) => s.sortRatePercent)),
    sortRatePrevious: Math.round(weightedByStops(all, (s) => s.sortRatePrevious)),
    stopsDelivered: sum(all.map((s) => s.stopsDelivered)),
    stopsDeliveredPrevious: sum(all.map((s) => s.stopsDeliveredPrevious)),
    failures: sum(all.map((s) => s.failures)),
    failuresPrevious: sum(all.map((s) => s.failuresPrevious)),
    stopsSeries: sumSeries(all.map((s) => s.stopsSeries)),
    failuresSeries: sumSeries(all.map((s) => s.failuresSeries)),
    sortRateSeries: {
      labels: all[0].sortRateSeries.labels,
      values: all[0].sortRateSeries.values.map((_, i) =>
        Math.round(sum(all.map((s) => s.sortRateSeries.values[i])) / all.length)
      ),
    },
    routes: all.flatMap((s) => s.routes),
    depositAverageScore: weightedByStops(all, (s) => s.depositAverageScore),
    depositAverageScorePrevious: weightedByStops(all, (s) => s.depositAverageScorePrevious),
    topVendors: everyVendor.slice(0, 3),
    attentionVendors: everyVendor.slice(-2),
  };
}
