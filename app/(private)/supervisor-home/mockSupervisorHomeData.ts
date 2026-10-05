/**
 * Mock data for the Supervisor Home visual-only build — not wired to the
 * real API yet. See lib/supervisor-home-api.ts (not created) and the
 * open items tracked for this page before it reads real data:
 * - no backend endpoint returns a 7-day vendor performance ranking scoped
 *   to one deposit yet (/bff/daily-overview returns per-user/day rows);
 * - deposit/supervisor resolution would reuse lib/daily-supervisor-check.ts.
 */
import type { SupervisorHomeSummary } from "./types";

export const mockSupervisorHomeSummary: SupervisorHomeSummary = {
  depositKey: "BAOP",
  depositLead: "Leandro Dias",
  date: new Date().toISOString().slice(0, 10),
  allocatedDrivers: 8,
  totalDrivers: 10,
  notAllocatedDriverNames: ["GABRIEL LIMA DA SILVA", "LUCAS FERREIRA"],
  sortRatePercent: 80,
  routes: [
    { routeCode: "B04", driverName: "Adriano Dutra", sort: "Yes", status: "on-track" },
    { routeCode: "B07", driverName: "Bruno Ribeiro", sort: "No", status: "on-track" },
    { routeCode: "B11", driverName: "Marcos Alves", sort: "No", status: "attention", note: "Início atrasado" },
    { routeCode: "B15", driverName: "Rafael Souza", sort: "Yes", status: "on-track" },
    { routeCode: "B22", driverName: "Diego Santos", sort: "No", status: "on-track", note: "Cobrindo B19" },
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
