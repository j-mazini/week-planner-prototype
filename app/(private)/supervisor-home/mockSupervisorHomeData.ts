/**
 * Mock data for the Supervisor Home visual-only build — not wired to the
 * real API yet. See lib/supervisor-home-api.ts (not created) and the
 * open items tracked for this page before it reads real data:
 * - no backend endpoint returns a 7-day vendor performance ranking scoped
 *   to one deposit yet (/bff/daily-overview returns per-user/day rows);
 * - deposit/supervisor resolution would reuse lib/daily-supervisor-check.ts.
 *
 * Everything here is a summary of the previous business day — routes,
 * sort, performance — except `vehiclesOut`, which reflects right now.
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
  vehiclesAsOfDate: new Date().toISOString().slice(0, 10),
  allocatedDrivers: 8,
  totalDrivers: 10,
  notAllocatedDriverNames: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  sortRatePercent: 80,
  routes: [
    { routeCode: "B04", driverName: "Adriano Dutra", sort: "Yes", status: "completed", stops: 142, failed: 0 },
    { routeCode: "B07", driverName: "Bruno Ribeiro", sort: "No", status: "completed", stops: 138, failed: 4, note: "4 failed picks" },
    { routeCode: "B11", driverName: "Marcos Alves", sort: "No", status: "incomplete", stops: 96, failed: 2, note: "Início atrasado" },
    { routeCode: "B15", driverName: "Rafael Souza", sort: "Yes", status: "completed", stops: 150, failed: 0 },
    { routeCode: "B22", driverName: "Diego Santos", sort: "No", status: "completed", stops: 135, failed: 1, note: "Cobrindo B19" },
  ],
  topVendors: [
    { vendorName: "Rafael Souza", routeCode: "B15", score: 99.2 },
    { vendorName: "Adriano Dutra", routeCode: "B04", score: 98.1 },
    { vendorName: "Diego Santos", routeCode: "B22", score: 97.4 },
  ],
  attentionVendors: [
    { vendorName: "Bruno Ribeiro", routeCode: "B07", score: 83.1, flag: "4 failed picks" },
    { vendorName: "Marcos Alves", routeCode: "B11", score: 87.6, flag: "início atrasado" },
  ],
  vehiclesOut: [{ registration: "LV21 UFT", reason: "Manutenção preventiva", since: "3 dias" }],
};
