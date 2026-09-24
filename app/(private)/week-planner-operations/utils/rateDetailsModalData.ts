import type { CostModelItem } from "@/lib/vendors-api";
import type { FrontendOperationRecord } from "../types/operations-management";
import { normalizeDate } from "./operationsManagementMappers";

export type RateBandDetail = {
  minStops?: number;
  maxStops?: number;
  pricePerStop?: number;
  fixedPrice?: number;
  validityStartDate?: string;
  validityEndDate?: string;
};

export type RateDetailsModalData = {
  vendorName: string;
  costModelLabel: string;
  costModelKind: "DAF" | "VSR" | "SP_VSR";
  bands: RateBandDetail[];
};

export function isBandedDailyRateCostModelId(costModelId: number): boolean {
  return costModelId === 1 || costModelId === 4 || costModelId === 12; // DAF / VSR / SP_VSR
}

function toYmd(iso: string | undefined | null): string {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

export type BuildRateDetailsOptions = {
  /** When the row has no reliable `userId` (e.g. week planner). */
  userIdOverride?: number;
};

/**
 * Resolves up to two non-electric DAF (1) or VSR (4) bands valid on the row date,
 * grouped by `validity_startDate`, sorted by `minStops`.
 */
export async function buildRateDetailsModalData(
  item: FrontendOperationRecord,
  fetchEmployees: (userId: number) => Promise<CostModelItem[]>,
  opts?: BuildRateDetailsOptions
): Promise<RateDetailsModalData> {
  const costModelId = Number(item.paymentModeId ?? item["Payment Mode"]);
  if (!isBandedDailyRateCostModelId(costModelId)) {
    throw new Error("Cost model does not have band details.");
  }

  const fromOverride =
    opts?.userIdOverride != null &&
    Number.isFinite(opts.userIdOverride) &&
    opts.userIdOverride > 0
      ? opts.userIdOverride
      : NaN;
  const fromItem =
    item.userId != null && Number.isFinite(Number(item.userId)) ? Number(item.userId) : NaN;
  const userId = Number.isFinite(fromOverride) && fromOverride > 0 ? fromOverride : fromItem;

  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error("Vendor not found for this record.");
  }

  const allCostModelEmployees = await fetchEmployees(userId);
  const nonElectricBands = allCostModelEmployees.filter((cm) => {
    if (Number(cm.costModelId) !== costModelId) return false;
    return cm.isElectric !== true;
  });

  if (nonElectricBands.length === 0) {
    throw new Error("No cost model bands found for this vendor.");
  }

  const selectedDate = normalizeDate(item.Date);
  const inRange = nonElectricBands.filter((cm) => {
    const start = toYmd(cm.validityStartDate);
    const end = toYmd(cm.validityEndDate);
    if (start && selectedDate < start) return false;
    if (end && selectedDate > end) return false;
    return true;
  });
  const pool = inRange.length > 0 ? inRange : nonElectricBands;

  const groups = new Map<string, CostModelItem[]>();
  pool.forEach((cm) => {
    const key = toYmd(cm.validityStartDate) || "__no_start__";
    const list = groups.get(key) ?? [];
    list.push(cm);
    groups.set(key, list);
  });

  const selectedGroupKey =
    Array.from(groups.keys()).sort((a, b) => {
      if (a === "__no_start__") return 1;
      if (b === "__no_start__") return -1;
      return a < b ? 1 : -1;
    })[0] ?? "";

  const selectedGroup = (groups.get(selectedGroupKey) ?? []).slice().sort((a, b) => {
    const aMin = a.minStops ?? 0;
    const bMin = b.minStops ?? 0;
    return aMin - bMin;
  });

  if (selectedGroup.length === 0) {
    throw new Error("No band details available for selected validity date.");
  }

  // Return all bands from the selected group, sorted by minStops
  const sortedBands = selectedGroup.slice().sort((a, b) => {
    const aMin = a.minStops ?? 0;
    const bMin = b.minStops ?? 0;
    return aMin - bMin;
  });

  const bands: RateBandDetail[] = sortedBands
    .map((cm) => ({
      minStops: cm.minStops ?? undefined,
      maxStops: cm.maxStops ?? undefined,
      pricePerStop: cm.pricePerStop ?? undefined,
      fixedPrice: cm.fixedPrice ?? undefined,
      validityStartDate: toYmd(cm.validityStartDate) || undefined,
      validityEndDate: toYmd(cm.validityEndDate) || undefined,
    }));

  return {
    vendorName: item.Name,
    costModelLabel: String(item["Payment Mode"] || (costModelId === 4 ? "VSR" : costModelId === 12 ? "SP_VSR" : "DAF")),
    costModelKind: costModelId === 4 ? "VSR" : costModelId === 12 ? "SP_VSR" : "DAF",
    bands,
  };
}



