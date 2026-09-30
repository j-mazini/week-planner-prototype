import type { DiscoDeliveryModel } from "../types";

export interface DiscoFilterOptions {
  slot: "AM" | "PM";
  depot: string;
  loop: string;
  amRoutes: string[];
  pmRoutes: string[];
}

export interface GroupSummary {
  totalDeliveries: number;
  pre12: number;
  asr: number;
  dsr: number;
}

export function filterDeliveries(deliveries: DiscoDeliveryModel[], opts: DiscoFilterOptions): DiscoDeliveryModel[] {
  return deliveries.filter((d) => {
    if (opts.slot === "AM" && opts.amRoutes.length && !opts.amRoutes.includes(d.route)) return false;
    if (opts.slot === "PM" && opts.pmRoutes.length && !opts.pmRoutes.includes(d.route)) return false;
    if (opts.depot && d.depot !== opts.depot) return false;
    if (opts.loop && d.loop !== opts.loop) return false;
    return true;
  });
}

function summarize(rows: DiscoDeliveryModel[]): GroupSummary {
  return {
    totalDeliveries: rows.length,
    pre12: rows.filter((d) => d.pre12).length,
    asr: rows.filter((d) => d.asr).length,
    dsr: rows.filter((d) => d.dsr).length,
  };
}

function groupBy<T extends string>(deliveries: DiscoDeliveryModel[], key: (d: DiscoDeliveryModel) => T): Map<T, DiscoDeliveryModel[]> {
  const map = new Map<T, DiscoDeliveryModel[]>();
  deliveries.forEach((d) => {
    const k = key(d);
    if (!k) return;
    const list = map.get(k) ?? [];
    list.push(d);
    map.set(k, list);
  });
  return map;
}

export function getDepotSummary(deliveries: DiscoDeliveryModel[]): { depot: string; summary: GroupSummary }[] {
  const grouped = groupBy(deliveries, (d) => d.depot.trim());
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([depot, rows]) => ({ depot, summary: summarize(rows) }));
}

export function getLoopSummary(deliveries: DiscoDeliveryModel[], depotFilter: string): { loop: string; summary: GroupSummary }[] {
  const grouped = groupBy(
    deliveries.filter((d) => d.depot.trim() === depotFilter),
    (d) => d.loop.trim(),
  );
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([loop, rows]) => ({ loop, summary: summarize(rows) }));
}

export function getRouteSummary(deliveries: DiscoDeliveryModel[]): { route: string; summary: GroupSummary }[] {
  const grouped = groupBy(deliveries, (d) => d.route.trim());
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([route, rows]) => ({ route, summary: summarize(rows) }));
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort();
}
