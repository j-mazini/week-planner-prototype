import type { CostModel } from "@/lib/cost-models";
import type { Vendor } from "@/lib/vendors";
import type { Route } from "@/lib/api/routes";
import type { Vehicle } from "@/lib/vehicles";
import type { VendorType, CostModelItem } from "@/lib/vendors-api";
import type { DepositDTO } from "@/lib/api/deposits";
import type { WeekPlannerRecord } from "../contexts/PlannerContext";
import type { WeekPlannerCreateDTO, WeekPlannerToOperationDTO, WeekPlannerUpdateDTO } from "../types/week-planner-dto";
import type { FrontendOperationRecord } from "../types/operations-management";
import type { OperationsBulkCreateItemDTO } from "../services/apiService";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { ADHOC_OPERATION_CREATE_DEFAULTS } from "@/lib/adhoc-operation-defaults";

/** Format decimal hours (e.g. 8.5) as "H:MM" or "HH:MM" for display in table/modal. */
export function formatDecimalHoursAsTime(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "-";
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0) return "-";
  const h = Math.floor(n);
  const m = Math.min(59, Math.max(0, Math.round((n - h) * 60)));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse and round extra to numeric(10,2) for DB storage (e.g. hours when costModelId is 7). */
export function extraToNumeric10_2(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100) / 100;
}

/** Converts Rate field to number or undefined; empty or invalid input does not produce NaN. */
export function toOptionalRate(val: unknown): number | undefined {
  if (val === null || val === undefined || String(val).trim() === "") return undefined;
  const n = typeof val === "number" ? val : parseFloat(String(val).trim());
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Valor canónico para o <select> Sort (Yes / No), alinhado ao Daily Game Plan.
 * O estado "Late" passa a ser `SortLate`; valores legados "Late" mapeiam para Yes.
 */
export function normalizeSortSelectValue(value: unknown): "Yes" | "No" {
  if (value === null || value === undefined || value === "") return "No";
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 40 || value === 20) return "Yes";
    if (value === 0) return "No";
    if (value === 1) return "Yes";
    return value > 0 ? "Yes" : "No";
  }
  const s = String(value).trim().toLowerCase();
  if (s === "yes" || s === "40" || s === "20" || s === "late" || s === "1") return "Yes";
  if (s === "no" || s === "0") return "No";
  return "No";
}

// Helper function to normalize date (remove timezone, keep only YYYY-MM-DD)
export const normalizeDate = (dateString: string): string => {
  if (!dateString) return "";
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it contains timezone info, extract only the date part
  const datePart = dateString.split("T")[0];
  return datePart || dateString;
};

/**
 * Verifica se a data (YYYY-MM-DD) está dentro de [validity_startDate, validity_endDate] (fim null = sem limite).
 */
function isReferenceDateInValidityWindow(
  referenceYmd: string,
  validityStart?: string | null,
  validityEnd?: string | null
): boolean {
  const day = normalizeDate(referenceYmd);
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const [y, m, d] = day.split("-").map(Number);
  const refLocal = new Date(y, m - 1, d);

  const toLocalDay = (iso: string) => {
    const t = new Date(iso);
    if (Number.isNaN(t.getTime())) return null;
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };

  if (validityStart) {
    const s = toLocalDay(validityStart);
    if (s && refLocal < s) return false;
  }
  if (validityEnd) {
    const e = toLocalDay(validityEnd);
    if (e && refLocal > e) return false;
  }
  return true;
}

/**
 * Para costModelId 2 ou 3 (DR/FSR), devolve fixedPrice vigente em costModel_employees para a data da operação.
 */
export function getFixedPriceRateForCostModelOnDate(
  items: CostModelItem[] | undefined,
  costModelId: number,
  dateYmd: string | undefined | null
): string | null {
  if (!items?.length || (costModelId !== 2 && costModelId !== 3)) return null;
  if (!dateYmd || !String(dateYmd).trim()) return null;
  const day = normalizeDate(String(dateYmd));
  if (!day) return null;

  const matches = items.filter(
    (cm) =>
      Number(cm.costModelId) === costModelId &&
      isReferenceDateInValidityWindow(day, cm.validityStartDate, cm.validityEndDate)
  );
  if (matches.length === 0) return null;

  const sorted = [...matches].sort((a, b) => {
    const ta = a.validityStartDate ? new Date(a.validityStartDate).getTime() : 0;
    const tb = b.validityStartDate ? new Date(b.validityStartDate).getTime() : 0;
    return tb - ta;
  });
  const pick = sorted[0];
  if (pick.fixedPrice == null || !Number.isFinite(Number(pick.fixedPrice))) return null;
  return String(pick.fixedPrice);
}

export const getCleanCostModelName = (name: string | undefined): string => {
  if (!name) return "";
  const upperName = name.toUpperCase();
  const cleanName = upperName
    .replace(/_RATE/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Extrair apenas DAF, DR, VSR, SP_VSR ou FSR.
  // SP_VSR precisa ser verificado ANTES de VSR — "SP VSR" contém "VSR" como substring,
  // então sem este check ele seria silenciosamente fundido no mesmo grupo do VSR comum.
  if (cleanName.includes("DAF")) return "DAF";
  if (cleanName.includes("DR") && !cleanName.includes("VSR") && !cleanName.includes("FSR")) return "DR";
  if (cleanName.includes("SP VSR")) return "SP_VSR";
  if (cleanName.includes("VSR")) return "VSR";
  if (cleanName.includes("FSR")) return "FSR";

  return cleanName;
};

export type PaymentModeOption = { value: string; label: string };

export const buildPaymentModeOptions = (costModels: CostModel[]): PaymentModeOption[] => {
  // Filtrar e agrupar cost models por tipo (DAF, DR, VSR, FSR)
  const filteredCostModels = costModels.filter((costModel) => {
    const name = (costModel.name || "").toUpperCase();
    const description = (costModel.description || "").toUpperCase();
    const isHourlyRate = costModel.costModelId === 7;
    return (
      isHourlyRate ||
      name.includes("DAF") ||
      name.includes("DR") ||
      name.includes("VSR") ||
      name.includes("FSR") ||
      description.includes("DAF") ||
      description.includes("DR") ||
      description.includes("VSR") ||
      description.includes("FSR")
    );
  });

  // Agrupar por tipo e pegar apenas o primeiro de cada tipo
  const seenTypes = new Set<string>();
  const uniqueCostModels = filteredCostModels.filter((costModel) => {
    const cleanName = getCleanCostModelName(costModel.name) || getCleanCostModelName(costModel.description);
    if (!cleanName) return false;
    if (seenTypes.has(cleanName)) return false;
    seenTypes.add(cleanName);
    return true;
  });

  return uniqueCostModels
    .filter((cm) => cm.costModelId !== null && cm.costModelId !== undefined)
    .map((cm) => ({
      value: String(cm.costModelId),
      label: getCleanCostModelName(cm.name) || getCleanCostModelName(cm.description) || `Cost Model ${cm.costModelId}`,
    }));
};

// Função para mapear dados do WeekPlannerRecord para o formato do frontend
export const mapWeekPlannerToFrontend = (
  weekPlanner: WeekPlannerRecord,
  costModels: CostModel[] = [],
  vehicles: Vehicle[] = [],
): FrontendOperationRecord => {
  const raw = weekPlanner.raw as Record<string, unknown> | undefined;
  const normalizePlate = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Extrair vendorType do raw data
  let vendorType = "";
  if (raw?.vendorType && typeof raw.vendorType === "object") {
    const vendorTypeObj = raw.vendorType as Record<string, unknown>;
    vendorType = String(
      vendorTypeObj.vendorTypeDescription || vendorTypeObj.vendorTypeName || vendorTypeObj.description || "",
    );
  }

  // Determinar status baseado no raw data ou padrão
  const status = raw?.status ? String(raw.status) : weekPlanner.status || "ACTIVE";
  const isDayOff = weekPlanner.isDayOff === "true";

  // Extrair vehicle do raw data (priorizar raw data sobre weekPlanner.registrationPlate)
  let vehicleValue = "";
  let vehicleFuelType: string | undefined;
  if (raw?.vehicle && typeof raw.vehicle === "object") {
    const vehicleObj = raw.vehicle as Record<string, unknown>;
    vehicleValue = String(
      vehicleObj.vehicleregistrationPlate ||
      vehicleObj.vehicleDefaultRegistrationPlate ||
      vehicleObj.registrationPlate ||
      vehicleObj.registrationPlates ||
      "",
    );
    const fuelRaw =
      vehicleObj.fuelType ??
      vehicleObj.fuelType ??
      vehicleObj.fuel ??
      vehicleObj.fuelTypeName ??
      vehicleObj.fuelTypeName;
    if (fuelRaw !== null && fuelRaw !== undefined && String(fuelRaw).trim() !== "") {
      vehicleFuelType = String(fuelRaw);
    }
  }

  // Se não encontrou no raw data, usar o registrationPlate normalizado
  if (!vehicleValue) {
    vehicleValue = weekPlanner.registrationPlate || "";
  }

  // Se ainda não tiver valor, usar 'NOVEHICLE' como padrão
  const vehicle = vehicleValue || "NOVEHICLE";

  // Fallback: se não veio fuel_type no raw, tentar casar pela lista de veículos do sistema
  // (útil para decidir cor do badge do VRN)
  if (!vehicleFuelType && vehicles.length > 0 && vehicle && vehicle.toUpperCase() !== "NOVEHICLE") {
    const normalizedPlate = normalizePlate(vehicle);
    const matched = vehicles.find((v) => normalizePlate(String(v.registrationPlates || "")) === normalizedPlate);
    if (matched?.fuelType && String(matched.fuelType).trim() !== "") {
      vehicleFuelType = String(matched.fuelType);
    }
  }

  // Mapear Payment Mode baseado no costModelId do raw data (incluir costModelId === 0, ex. FSR)
  let paymentMode = "";
  let paymentModeId: string | number | undefined;

  if (raw?.costModel && typeof raw.costModel === "object") {
    const costModelObj = raw.costModel as Record<string, unknown>;
    const hasCostModelId = costModelObj.costModelId !== null && costModelObj.costModelId !== undefined;
    const costModelId = hasCostModelId ? Number(costModelObj.costModelId) : null;
    if (costModelId !== null && !Number.isNaN(costModelId)) {
      paymentModeId = String(costModelId);
      const costModel = costModels.find((cm) => cm.costModelId === costModelId);
      if (costModel) {
        paymentMode =
          getCleanCostModelName(costModel.name) ||
          getCleanCostModelName(costModel.description) ||
          `Cost Model ${costModelId}`;
      } else {
        const nameFromApi = costModelObj.costModelName != null ? String(costModelObj.costModelName).trim() : "";
        paymentMode = nameFromApi || `Cost Model ${costModelId}`;
      }
    }
  } else if (weekPlanner.costModel) {
    // Fallback: tentar encontrar o costModelId pelo nome
    const costModel = costModels.find((cm) => {
      const name = (cm.name || "").toUpperCase();
      const description = (cm.description || "").toUpperCase();
      const costModelUpper = weekPlanner.costModel.toUpperCase();
      return name.includes(costModelUpper) || description.includes(costModelUpper);
    });
    if (costModel && costModel.costModelId) {
      paymentModeId = String(costModel.costModelId);
      paymentMode =
        getCleanCostModelName(costModel.name) ||
        getCleanCostModelName(costModel.description) ||
        `Cost Model ${costModel.costModelId}`;
    }
  }

  const userIdFromRaw = raw?.userId != null
    ? Number(raw.userId)
    : raw?.userId != null
      ? Number(raw.userId)
      : undefined;
  const depositIdFromRaw = raw?.depositId != null ? Number(raw.depositId) : undefined;
  let adhocServiceIdFromRaw: string | number | undefined;
  if (raw?.adhocServiceId != null && raw?.adhocServiceId !== undefined) {
    adhocServiceIdFromRaw = Number(raw.adhocServiceId);
  } else if (raw?.adhocService && typeof raw.adhocService === "object") {
    const adhocObj = raw.adhocService as Record<string, unknown>;
    if (adhocObj.adhocServiceId != null) {
      adhocServiceIdFromRaw = Number(adhocObj.adhocServiceId);
    }
  }

  // Name: usar weekPlanner.name ou extrair do raw (fullName, nested vendor/vendor/user)
  const resolveDisplayName = (): string => {
    if (weekPlanner.name && String(weekPlanner.name).trim()) return String(weekPlanner.name).trim();
    if (!raw) return "";
    const top =
      raw.fullName ?? raw.fullName ?? raw.vendorName ?? raw.vendorName ?? raw.courierName ?? raw.courierName ?? raw.name ?? "";
    if (top && String(top).trim()) return String(top).trim();
    const vendor = raw.vendor;
    if (vendor && typeof vendor === "object") {
      const v = vendor as Record<string, unknown>;
      const vn = v.fullName ?? v.vendorName ?? v.name ?? "";
      if (vn && String(vn).trim()) return String(vn).trim();
      const u = v.user;
      if (u && typeof u === "object") {
        const ur = u as Record<string, unknown>;
        const first = String(ur.name ?? ur.firstName ?? "").trim();
        const last = String(ur.lastName ?? "").trim();
        if (first || last) return [first, last].filter(Boolean).join(" ").trim();
      }
    }
    const user = raw.user;
    if (user && typeof user === "object") {
      const ur = user as Record<string, unknown>;
      const un = ur.fullName ?? ur.fullName ?? ur.name ?? "";
      if (un && String(un).trim()) return String(un).trim();
      const first = String(ur.name ?? ur.firstName ?? "").trim();
      const last = String(ur.lastName ?? ur.lastName ?? "").trim();
      if (first || last) return [first, last].filter(Boolean).join(" ").trim();
    }
    return "";
  };
  const displayName = resolveDisplayName();

  return {
    weekPlannerId: weekPlanner.weekPlannerId,
    operationId: weekPlanner.operationId,
    userId: Number.isFinite(userIdFromRaw) ? userIdFromRaw : undefined,
    depositId: Number.isFinite(depositIdFromRaw) ? depositIdFromRaw : undefined,
    Date: normalizeDate(weekPlanner.date),
    Route: weekPlanner.route || "",
    Name: displayName,
    "Payment Mode": paymentMode,
    paymentModeId,
    Rate: weekPlanner.rate || "",
    Sort: weekPlanner.routeSort || "",
    routeSort: (() => {
      const fromRaw = raw?.routeSort;
      if (fromRaw != null && String(fromRaw).trim() !== "") return fromRaw as number | string;
      if (weekPlanner.routeSort != null && String(weekPlanner.routeSort).trim() !== "") {
        return weekPlanner.routeSort;
      }
      return "";
    })(),
    "AD-HOC Sort": weekPlanner.adhocSort || "",
    "AD-HOC Service": raw?.adhocService && typeof raw.adhocService === "object"
      ? String((raw.adhocService as Record<string, unknown>).adhocName ?? "")
      : "",
    adhocServiceId: adhocServiceIdFromRaw,
    Extras: weekPlanner.extras || "",
    Notes: weekPlanner.notes || "",
    Vehicle: vehicle,
    vehicleFuelType,
    "Vendor type": vendorType,
    Status: isDayOff ? "Off" : status === "ACTIVE" || status === "Working" ? "Working" : "Off",
    "Deposit Name": raw?.depositName ? String(raw.depositName) : "",
  };
};

// Função para mapear dados do frontend para WeekPlannerUpdateDTO
export const mapFrontendToWeekPlannerUpdate = (
  frontend: FrontendOperationRecord,
  vendors: Vendor[],
  routes: Route[],
  vehicles: Vehicle[],
  costModels: CostModel[],
  weekPlannerRaw?: Record<string, unknown>,
  deposits: DepositDTO[] = [],
): WeekPlannerUpdateDTO => {
  const vendor = vendors.find((d) => d.fullName === frontend.Name);
  const route = routes.find((r) => r.routeName === frontend.Route);

  // Extrair costModelId do Payment Mode selecionado no formulário
  let costModelId: number | undefined;

  const findCostModelId = (paymentModeValue: string | number | undefined): number | undefined => {
    if (!paymentModeValue) return undefined;

    const paymentModeAsNumber = Number(paymentModeValue);
    if (!Number.isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
      const costModel = costModels.find((cm) => cm.costModelId === paymentModeAsNumber);
      if (costModel?.costModelId) return costModel.costModelId;
    }

    const searchValue = String(paymentModeValue).toUpperCase();
    const costModel = costModels.find((cm) => {
      const clean = getCleanCostModelName(cm.name) || getCleanCostModelName(cm.description);
      return clean.toUpperCase() === searchValue;
    });
    return costModel?.costModelId;
  };

  // Priorizar o valor do formulário (novo valor selecionado) sobre o raw data
  if (frontend.paymentModeId) {
    costModelId = findCostModelId(frontend.paymentModeId);
  } else if (frontend["Payment Mode"]) {
    costModelId = findCostModelId(frontend["Payment Mode"]);
  }

  // Se ainda não encontrou, tentar obter do raw data original
  if (!costModelId && weekPlannerRaw?.costModel && typeof weekPlannerRaw.costModel === "object") {
    const costModelObj = weekPlannerRaw.costModel as Record<string, unknown>;
    costModelId = costModelObj.costModelId ? Number(costModelObj.costModelId) : undefined;
  }

  // Find vendorTypeId based on selected vendor type name
  let vendorTypeId: number | undefined;
  if (weekPlannerRaw?.vendorType && typeof weekPlannerRaw.vendorType === "object") {
    const vendorTypeObj = weekPlannerRaw.vendorType as Record<string, unknown>;
    vendorTypeId = vendorTypeObj.vendorTypeId ? Number(vendorTypeObj.vendorTypeId) : undefined;
  }

  const isDayOff = frontend.Status === "Off";
  const status = isDayOff ? "Off" : "Working";

  // Extrair depositId baseado no Deposit Name selecionado
  let depositId: number | undefined;
  let depositName: string | undefined;
  if (frontend["Deposit Name"]) {
    depositName = frontend["Deposit Name"];
    const deposit = deposits.find((d) => d.depositName === frontend["Deposit Name"]);
    if (deposit && deposit.depositId) {
      depositId = deposit.depositId;
    }
  }
  // Fallback: tentar obter do raw data se não encontrou no formulário
  if (!depositId && weekPlannerRaw?.depositId !== null && weekPlannerRaw?.depositId !== undefined) {
    depositId = typeof weekPlannerRaw.depositId === "number"
      ? weekPlannerRaw.depositId
      : Number(weekPlannerRaw.depositId) || undefined;
  }
  // Fallback: tentar obter depositName do raw data se não encontrou no formulário
  if (!depositName && weekPlannerRaw?.depositName) {
    depositName = String(weekPlannerRaw.depositName);
  }

  // Determinar vehicleId: NOVEHICLE usa 55 como placeholder
  let vehicleIdForUpdate: number | undefined;
  if (frontend.Vehicle && frontend.Vehicle !== "NOVEHICLE") {
    const vehicleForUpdate = vehicles.find((v) => v.registrationPlates === frontend.Vehicle);
    vehicleIdForUpdate = vehicleForUpdate?.vehicleId;
  } else if (frontend.Vehicle === "NOVEHICLE") {
    vehicleIdForUpdate = 55;
  }

  return {
    date: frontend.Date,
    routeId: route?.routeId,
    userId: vendor?.userId,
    costModelId: costModelId,
    rate: toOptionalRate(frontend.Rate),
    routeCost: 0,
    routeSort:
      typeof frontend.Sort === "number" ? frontend.Sort : frontend.Sort ? parseFloat(String(frontend.Sort)) : 0,
    adhocSort:
      typeof frontend["AD-HOC Sort"] === "number"
        ? frontend["AD-HOC Sort"]
        : frontend["AD-HOC Sort"]
          ? parseFloat(String(frontend["AD-HOC Sort"]))
          : 0,
    extra: extraToNumeric10_2(frontend.Extras) ?? 0,
    notes: frontend.Notes || undefined,
    vehicleId: vehicleIdForUpdate,
    vendorTypeId: vendorTypeId,
    status,
    isDayOff: isDayOff,
    isSort: false,
    operationId: frontend.operationId || undefined,
    depositId: depositId,
    depositName: depositName,
  };
};

// Função para mapear dados do frontend para WeekPlannerCreateDTO
export const mapFrontendToWeekPlannerCreate = (
  frontend: FrontendOperationRecord,
  vendors: Vendor[],
  routes: Route[],
  vehicles: Vehicle[],
  costModels: CostModel[],
  vendorTypes: VendorType[],
): WeekPlannerCreateDTO => {
  const vendor = vendors.find((d) => d.fullName === frontend.Name);
  const route = routes.find((r) => r.routeName === frontend.Route);

  if (!vendor || vendor.userId == null) {
    throw new Error(`Vendor not found or invalid: ${frontend.Name}`);
  }

  if (!route || route.routeId == null) {
    throw new Error(`Route not found or invalid: ${frontend.Route}`);
  }

  // Buscar costModelId do Payment Mode
  let costModelId: number | undefined;
  if (frontend["Payment Mode"]) {
    const paymentModeAsNumber = Number(frontend["Payment Mode"]);
    if (!Number.isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
      const cm = costModels.find((c) => c.costModelId === paymentModeAsNumber);
      if (cm?.costModelId) costModelId = cm.costModelId;
    }
  }
  if (costModelId == null) {
    throw new Error(`Payment Mode not found or invalid: ${frontend["Payment Mode"]}`);
  }

  // Determinar vehicleId: NOVEHICLE usa 55 como placeholder
  let vehicleId: number;
  if (frontend.Vehicle && frontend.Vehicle !== "NOVEHICLE") {
    const vehicle = vehicles.find((v) => v.registrationPlates === frontend.Vehicle);
    if (!vehicle) throw new Error(`Vehicle not found: ${frontend.Vehicle}`);
    vehicleId = Number(vehicle.vehicleId) || 55;
  } else {
    vehicleId = 55;
  }

  // Buscar vendorTypeId
  let vendorTypeId: number | undefined;
  if (frontend["Vendor type"]) {
    const selected = frontend["Vendor type"].toLowerCase();
    const vendorType = vendorTypes.find((dt) => String(dt.nameType || "").toLowerCase() === selected);
    if (vendorType?.vendorTypeId) vendorTypeId = Number(vendorType.vendorTypeId);
  }

  const isDayOff = frontend.Status === "Off";
  const status = isDayOff ? "Off" : "Working";

  return {
    date: frontend.Date,
    routeId: route.routeId,
    userId: vendor.userId,
    costModelId: costModelId,
    rate: toOptionalRate(frontend.Rate),
    routeCost: 0,
    routeSort:
      typeof frontend.Sort === "number" ? frontend.Sort : frontend.Sort ? parseFloat(String(frontend.Sort)) : 0,
    adhocSort:
      typeof frontend["AD-HOC Sort"] === "number"
        ? frontend["AD-HOC Sort"]
        : frontend["AD-HOC Sort"]
          ? parseFloat(String(frontend["AD-HOC Sort"]))
          : 0,
    extra: extraToNumeric10_2(frontend.Extras) ?? 0,
    notes: frontend.Notes || undefined,
    vehicleId: vehicleId,
    vendorTypeId: vendorTypeId,
    status,
    isDayOff: isDayOff,
    isSort: false,
    operationId: frontend.operationId || undefined,
  };
};

// Função para mapear dados do frontend para WeekPlannerToOperationDTO
export const mapFrontendToOperationDTO = (
  frontend: FrontendOperationRecord,
  weekPlannerItem: WeekPlannerRecord | undefined,
  vendors: Vendor[],
  routes: Route[],
  vehicles: Vehicle[],
  costModels: CostModel[],
): WeekPlannerToOperationDTO => {
  // Resolver vendor: prioridade 1) userId (da API/week planner), 2) match por fullName
  const userIdFromFrontend =
    (frontend.userId != null && Number.isFinite(Number(frontend.userId))
      ? Number(frontend.userId)
      : frontend.userId != null && Number.isFinite(Number(frontend.userId))
        ? Number(frontend.userId)
        : undefined);
  const userIdFromRaw =
    weekPlannerItem?.raw && typeof weekPlannerItem.raw === "object"
      ? (weekPlannerItem.raw as Record<string, unknown>).userId != null
        ? Number((weekPlannerItem.raw as Record<string, unknown>).userId)
        : (weekPlannerItem.raw as Record<string, unknown>).userId != null
          ? Number((weekPlannerItem.raw as Record<string, unknown>).userId)
        : undefined
      : undefined;
  const effectiveVendorId = userIdFromFrontend ?? userIdFromRaw;

  const vendor =
    effectiveVendorId != null
      ? vendors.find((d) => d.userId === effectiveVendorId || d.userId === effectiveVendorId)
      : vendors.find((d) => d.fullName === frontend.Name);
  const route = routes.find((r) => r.routeName === frontend.Route);
  const vehicle = frontend.Vehicle && frontend.Vehicle !== "NOVEHICLE"
    ? vehicles.find((v) => v.registrationPlates === frontend.Vehicle)
    : undefined;
  // NOVEHICLE uses vehicleId 55 as placeholder
  const vehicleIdForDto = frontend.Vehicle === "NOVEHICLE" ? 55 : vehicle?.vehicleId;

  // userId para o DTO: prioridade ao da API (effectiveVendorId), depois vendor da lista local
  const userIdForDto =
    effectiveVendorId != null && Number.isFinite(effectiveVendorId)
      ? effectiveVendorId
      : vendor?.userId ?? vendor?.userId;
  if (userIdForDto == null || !Number.isFinite(userIdForDto)) {
    throw new Error(`Vendor not found or invalid: ${frontend.Name}`);
  }

  let costModelId: number | undefined;
  let costModelName: string | undefined;

  const findCostModel = (paymentModeValue: string | number | undefined): { id?: number; name?: string } => {
    if (!paymentModeValue) return {};

    const paymentModeAsNumber = Number(paymentModeValue);
    if (!Number.isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
      const costModel = costModels.find((cm) => cm.costModelId === paymentModeAsNumber);
      if (costModel) {
        return { id: costModel.costModelId, name: costModel.name || costModel.description || undefined };
      }
    }

    const searchValue = String(paymentModeValue).toUpperCase();
    const costModel = costModels.find((cm) => {
      const clean = getCleanCostModelName(cm.name) || getCleanCostModelName(cm.description);
      return clean.toUpperCase() === searchValue;
    });

    if (costModel) {
      return { id: costModel.costModelId, name: costModel.name || costModel.description || undefined };
    }

    return {};
  };

  if (frontend.paymentModeId) {
    const info = findCostModel(frontend.paymentModeId);
    costModelId = info.id;
    costModelName = info.name;
  } else if (frontend["Payment Mode"]) {
    const info = findCostModel(frontend["Payment Mode"]);
    costModelId = info.id;
    costModelName = info.name;
  }

  // Se não encontrou, tentar do raw data do week planner
  if (!costModelId && weekPlannerItem?.raw) {
    const raw = weekPlannerItem.raw as Record<string, unknown>;
    if (raw.costModel && typeof raw.costModel === "object") {
      const costModelObj = raw.costModel as Record<string, unknown>;
      costModelId = costModelObj.costModelId ? Number(costModelObj.costModelId) : undefined;
      costModelName = costModelObj.costModelName ? String(costModelObj.costModelName) : undefined;
    }
  }

  // Extrair routeCost, depositId, adhocServiceId do raw data se disponível
  let routeCost: number | undefined;
  let depositId: number | undefined;
  let depositName: string | undefined;
  let adhocServiceId: number | undefined;
  if (weekPlannerItem?.raw) {
    const raw = weekPlannerItem.raw as Record<string, unknown>;
    if (raw.routeCost !== null && raw.routeCost !== undefined) {
      routeCost = typeof raw.routeCost === "number" ? raw.routeCost : parseFloat(String(raw.routeCost)) || undefined;
    }
    if (raw.depositId != null && raw.depositId !== undefined) {
      depositId = Number(raw.depositId);
    }
    if (raw.depositName != null && raw.depositName !== undefined) {
      depositName = String(raw.depositName);
    }
    if (raw.adhocServiceId != null && raw.adhocServiceId !== undefined) {
      adhocServiceId = Number(raw.adhocServiceId);
    } else if (raw.adhocService && typeof raw.adhocService === "object") {
      const adhocObj = raw.adhocService as Record<string, unknown>;
      if (adhocObj.adhocServiceId != null) {
        adhocServiceId = Number(adhocObj.adhocServiceId);
      }
    }
  }
  if (depositId == null && frontend.depositId != null && Number.isFinite(Number(frontend.depositId))) {
    depositId = Number(frontend.depositId);
  }
  if (depositName == null && frontend["Deposit Name"]) {
    depositName = String(frontend["Deposit Name"]);
  }
  if (adhocServiceId == null && frontend.adhocServiceId != null && Number.isFinite(Number(frontend.adhocServiceId))) {
    adhocServiceId = Number(frontend.adhocServiceId);
  }

  return {
    weekPlannerId: frontend.weekPlannerId || undefined,
    date: frontend.Date,
    route: {
      routeId: route?.routeId || undefined,
      routeName: route?.routeName || frontend.Route || undefined,
    },
    userId: userIdForDto,
    costModel: {
      costModelId: costModelId,
      costModelName: costModelName,
    },
    vehicle: {
      vehicleId: vehicleIdForDto,
      vehicleModel: vehicle?.model || undefined,
    },
    rate: toOptionalRate(frontend.Rate),
    routeCost: routeCost,
    routeSort:
      typeof frontend.Sort === "number" ? frontend.Sort : frontend.Sort ? parseFloat(String(frontend.Sort)) : 0,
    adhocSort:
      typeof frontend["AD-HOC Sort"] === "number"
        ? frontend["AD-HOC Sort"]
        : frontend["AD-HOC Sort"]
          ? parseFloat(String(frontend["AD-HOC Sort"]))
          : 0,
    extra: extraToNumeric10_2(frontend.Extras) ?? 0,
    notes: frontend.Notes || undefined,
    status: frontend.Status || undefined,
    isDayOff: frontend.Status === "Off",
    depositId: depositId,
    depositName: depositName,
    adhocServiceId: adhocServiceId,
  };
};

function resolveCostModelIdForBulkItem(item: FrontendOperationRecord, costModels: CostModel[]): number | undefined {
  const raw = item.paymentModeId ?? item["Payment Mode"];
  if (raw != null && String(raw).trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      const cm = costModels.find((c) => Number(c.costModelId) === n);
      if (cm?.costModelId != null) return Number(cm.costModelId);
    }
  }
  const searchValue = String(item["Payment Mode"] ?? "").trim().toUpperCase();
  if (!searchValue) return undefined;
  const costModel = costModels.find((cm) => {
    const clean = getCleanCostModelName(cm.name) || getCleanCostModelName(cm.description);
    return clean.toUpperCase() === searchValue;
  });
  if (costModel?.costModelId != null) return Number(costModel.costModelId);
  return undefined;
}

/** userId canónico para comparar vendor (validação bulk / payload). */
export function resolveDomRowVendorIdForBulk(
  item: FrontendOperationRecord,
  vendors: Vendor[]
): number | null {
  if (item.userId != null && Number.isFinite(Number(item.userId))) {
    const id = Number(item.userId);
    if (id > 0) return id;
  }
  const itemUserId = item.userId;
  if (itemUserId != null && Number.isFinite(Number(itemUserId))) {
    const id = Number(itemUserId);
    if (id > 0) return id;
  }
  const d = vendors.find((x) => x.fullName === item.Name);
  if (d?.userId != null && Number.isFinite(d.userId) && d.userId > 0) {
    return d.userId;
  }
  if (d?.userId != null && Number.isFinite(d.userId) && d.userId > 0) {
    return d.userId;
  }
  return null;
}

/** vehicleId do payload bulk: Day off → 37; sem matrícula / NOVEHICLE → 55. */
export function resolveDomRowVehicleIdForBulk(
  item: FrontendOperationRecord,
  vehicles: Vehicle[]
): number {
  const statusLower = String(item.Status ?? "").trim().toLowerCase();
  const isOff = statusLower === "off" || item.isDayOff === true;
  const vehicle =
    item.Vehicle && item.Vehicle !== "NOVEHICLE"
      ? vehicles.find((v) => v.registrationPlates === item.Vehicle)
      : undefined;
  if (isOff) return 37;
  if (vehicle?.vehicleId != null && Number.isFinite(Number(vehicle.vehicleId))) {
    return Number(vehicle.vehicleId);
  }
  return 55;
}

/** Alinhado ao backend: 37 e 55 podem repetir no mesmo dia / no mesmo bulk. */
export const BULK_vehicleId_EXEMPT = new Set<number>([37, 55]);

function registrationPlateForVehicleId(vehicleId: number, vehicles: Vehicle[]): string | null {
  const v = vehicles.find((x) => Number(x.vehicleId) === vehicleId);
  const p = v?.registrationPlates?.trim();
  return p && p.length > 0 && p !== "NOVEHICLE" ? p : null;
}

/** Label for errors: prefer matrícula; optional row display (e.g. Vehicle column) as fallback. */
function formatVehicleLabelForBulkError(
  vehicleId: number,
  vehicles: Vehicle[],
  rowVehicleField?: string | null
): string {
  const fromList = registrationPlateForVehicleId(vehicleId, vehicles);
  if (fromList) return fromList;
  const fromRow = rowVehicleField?.trim();
  if (fromRow && fromRow !== "NOVEHICLE") return fromRow;
  return `vehicle ${vehicleId}`;
}

function vendorDisplayName(userId: number, vendors: Vendor[]): string {
  const d = vendors.find((x) => x.userId === userId || x.userId === userId);
  const n = d?.fullName?.trim();
  return n && n.length > 0 ? n : `vendor #${userId}`;
}

/**
 * Valida vehicleId por dia antes de POST /bff/operations/bulk (exceto 37/55):
 * o mesmo veículo não pode ser usado por **dois vendors diferentes** no mesmo dia;
 * o mesmo vendor pode ter o mesmo veículo em mais do que um registo.
 */
export function validateBulkOperationsVehicleRules(
  bulkItems: OperationsBulkCreateItemDTO[],
  allRowsSameDay: FrontendOperationRecord[],
  selectedRows: FrontendOperationRecord[],
  vehicles: Vehicle[],
  vendors: Vendor[],
  getRowKey: (item: FrontendOperationRecord) => string
): string | null {
  const selectedKeySet = new Set(selectedRows.map(getRowKey));

  const restricted = bulkItems.filter((p) => !BULK_vehicleId_EXEMPT.has(p.vehicleId));
  const byVid = new Map<number, Set<number>>();
  for (const p of restricted) {
    const set = byVid.get(p.vehicleId) ?? new Set<number>();
    set.add(p.userId);
    byVid.set(p.vehicleId, set);
  }
  for (const [vid, vendorSet] of byVid) {
    if (vendorSet.size > 1) {
      const plate = formatVehicleLabelForBulkError(vid, vehicles);
      const vendorNames: string[] = [...vendorSet]
        .map((id) => vendorDisplayName(id, vendors.filter((v) => vendorSet.has(v.userId))))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      return `Cannot submit: registration plate "${plate}" is shared in this selection by more than one vendor: ${vendorNames.join(
        "; "
      )}. The same vehicle may repeat only for rows of the same vendor. Placeholder entries (vehicle IDs 37 and 55) are exempt.`;
    }
  }

  for (const part of bulkItems) {
    if (BULK_vehicleId_EXEMPT.has(part.vehicleId)) continue;
    const rowsWithVehicle = allRowsSameDay.filter(
      (row) => resolveDomRowVehicleIdForBulk(row, vehicles) === part.vehicleId
    );
    const blockingOther = rowsWithVehicle.filter((row) => {
      if (selectedKeySet.has(getRowKey(row))) return false;
      const rowVendorId = resolveDomRowVendorIdForBulk(row, vendors);
      if (rowVendorId != null && rowVendorId === part.userId) return false;
      return true;
    });
    if (blockingOther.length > 0) {
      const row = blockingOther[0];
      const plate = formatVehicleLabelForBulkError(part.vehicleId, vehicles, row.Vehicle ? String(row.Vehicle) : null);
      const name = row.Name ?? "—";
      return `Cannot submit: registration plate "${plate}" is already assigned to "${name}" on this date. Change the vehicle, adjust selection, or note that the same vehicle may be shared only by the same vendor.`;
    }
  }

  return null;
}

/**
 * Mapeia uma linha da gestão diária para o payload flat de POST /bff/operations/bulk.
 * Reflete as mesmas regras que `mapFrontendToDailyCreateDTO` para Working (rota, veículo, sort, extras).
 */
export function mapFrontendOperationRecordToOperationsBulkPart(
  item: FrontendOperationRecord,
  vendors: Vendor[],
  routes: Route[],
  vehicles: Vehicle[],
  costModels: CostModel[],
  createdBy: number | null | undefined
): { part?: OperationsBulkCreateItemDTO; error?: string } {
  const statusLower = String(item.Status ?? "").trim().toLowerCase();
  if (item.isSubmitted === true || statusLower === "submitted") {
    return { error: `${item.Name || "—"}: already submitted` };
  }

  const isNotAllocated = statusLower === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED || !!item.isSyntheticNotAllocated;
  const isOff = statusLower === BUSINESS_RULES.WORKING_STATUS.OFF || !!item.isDayOff || isNotAllocated;

  const domId = item.dailyOperationsManagementId;
  const hasDomId = domId != null && Number.isFinite(Number(domId));

  // Regular records (not OFF/NALC) must have a domId to be submitted via bulk.
  // NALC can be submitted to create an OFF item even if synthetic (no domId).
  if (!hasDomId && !isNotAllocated) {
    return { error: `${item.Name || "—"}: missing dailyOperationsManagementId` };
  }


  const userId = resolveDomRowVendorIdForBulk(item, vendors);
  if (userId == null) {
    return { error: `${item.Name || "—"}: invalid vendor` };
  }

  const date = normalizeDate(item.Date);
  if (!date) {
    return { error: `${item.Name || "—"}: invalid date` };
  }

  const route = routes.find((r) => r.routeName === item.Route);
  const routeId = isOff
    ? 48
    : route?.routeId != null && Number.isFinite(Number(route.routeId)) && Number(route.routeId) > 0
      ? Number(route.routeId)
      : null;
  if (routeId == null) {
    return { error: `${item.Name || "—"}: route "${item.Route}" not found` };
  }

  const vehicleId = resolveDomRowVehicleIdForBulk(item, vehicles);

  const costModelId = isOff ? 9 : resolveCostModelIdForBulkItem(item, costModels);
  if (costModelId == null || !Number.isFinite(costModelId) || costModelId <= 0) {
    return { error: `${item.Name || "—"}: invalid Payment Mode` };
  }
  const isBandedRateModel = costModelId === 1 || costModelId === 4; // DAF / VSR

  const routeSortRaw = item.routeSort;
  const routeSort: number | null =
    routeSortRaw != null && String(routeSortRaw).trim() !== "" && Number.isFinite(Number(routeSortRaw))
      ? Number(routeSortRaw)
      : null;

  const adhocSortRaw = item["AD-HOC Sort"];
  const adhocSort =
    adhocSortRaw != null && String(adhocSortRaw).trim() !== "" && Number.isFinite(Number(adhocSortRaw))
      ? Number(adhocSortRaw)
      : 0;

  const adhocServiceRaw = item.adhocServiceId ?? item["AD-HOC Service"];
  const adhocServiceId =
    adhocServiceRaw != null && String(adhocServiceRaw).trim() !== "" && Number.isFinite(Number(adhocServiceRaw))
      ? Number(adhocServiceRaw)
      : null;

  const bulkStatus = isOff ? "OFF" : String(item.Status ?? "").trim();

  const part: OperationsBulkCreateItemDTO = {
    dailyOperationsManagementId: hasDomId ? Number(domId) : null,
    date,
    userId: userId,
    modelEmployeesId:
      item.modelEmployeesId != null && Number.isFinite(Number(item.modelEmployeesId))
        ? Number(item.modelEmployeesId)
        : null,
    routeId: routeId,
    vehicleId: vehicleId,
    costModelId: costModelId,
    rate: adhocServiceId ? ADHOC_OPERATION_CREATE_DEFAULTS.rate : (isBandedRateModel ? null : (toOptionalRate(item.Rate) ?? 0)),
    routeCost: 0,
    daily_service_charge: 0,
    routeSort: routeSort,
    adhocSort,
    extra: extraToNumeric10_2(item.Extras as string | number | undefined) ?? 0,
    adhocServiceId,
    status: bulkStatus.length > 0 ? bulkStatus : null,
    notes: item.Notes ? String(item.Notes) : null,
    depot: item["Deposit Name"] ? String(item["Deposit Name"]) : null,
    createdBy: createdBy ?? null,
  };

  return { part };
}








