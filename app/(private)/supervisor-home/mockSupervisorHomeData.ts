/**
 * Mock data for the Supervisor Home visual-only build — not wired to the
 * real API yet. See lib/supervisor-home-api.ts (not created) and the
 * open items tracked for this page before it reads real data:
 * - no backend endpoint returns a 7-day vendor performance ranking scoped
 *   to one deposit yet (/bff/daily-overview returns per-user/day rows);
 * - deposit/supervisor resolution would reuse lib/daily-supervisor-check.ts.
 *
 * Everything here is a summary of the previous business day — routes,
 * sort, performance — except `dayFinalized`/`routeBalance`, which reflect
 * today's in-progress operation.
 */
import type { SupervisorHomeSummary } from "./types";

function previousBusinessDayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  if (d.getDay() === 0) d.setDate(d.getDate() - 2); // Sunday -> Friday
  if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Saturday -> Friday
  return d.toISOString().slice(0, 10);
}

export const mockSupervisorHomeSummary: SupervisorHomeSummary = {
  depositKey: "BAOP",
  depositLead: "Leandro Dias",
  date: previousBusinessDayIso(),
  dayFinalized: false,
  routeBalance: { pendingRoutes: 2, unassignedStops: 14 },
  allocatedDrivers: 8,
  totalDrivers: 10,
  notAllocatedDriverNames: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  sortRatePercent: 80,
  routes: [
    { routeCode: "B04", driverName: "Adriano Dutra", sort: "Yes", status: "completed", stops: 142, plannedStops: 142, notReceived: 0, failedPick: 0 },
    { routeCode: "B07", driverName: "Bruno Ribeiro", sort: "No", status: "completed", stops: 138, plannedStops: 142, notReceived: 3, failedPick: 1 },
    { routeCode: "B11", driverName: "Marcos Alves", sort: "No", status: "incomplete", stops: 96, plannedStops: 130, notReceived: 1, failedPick: 1, note: "Late start" },
    { routeCode: "B15", driverName: "Rafael Souza", sort: "Yes", status: "completed", stops: 150, plannedStops: 150, notReceived: 0, failedPick: 0 },
    { routeCode: "B22", driverName: "Diego Santos", sort: "No", status: "completed", stops: 135, plannedStops: 136, notReceived: 1, failedPick: 0, note: "Covering B19" },
  ],
  topVendors: [
    { vendorName: "Rafael Souza", routeCode: "B15", score: 99.2, previousScore: 98.0 },
    { vendorName: "Adriano Dutra", routeCode: "B04", score: 98.1, previousScore: 98.6 },
    { vendorName: "Diego Santos", routeCode: "B22", score: 97.4, previousScore: 95.9 },
  ],
  attentionVendors: [
    { vendorName: "Bruno Ribeiro", routeCode: "B07", score: 83.1, previousScore: 90.4, flag: "4 failed picks" },
    { vendorName: "Marcos Alves", routeCode: "B11", score: 87.6, previousScore: 85.2, flag: "late start" },
  ],
};
