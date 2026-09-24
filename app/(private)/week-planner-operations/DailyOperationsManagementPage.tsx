"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { OperationsHeaderControls } from "./components/operations-management/OperationsHeaderControls";
import { OperationsFiltersBar } from "./components/operations-management/OperationsFiltersBar";
import { OperationsTable } from "./components/operations-management/OperationsTable";
import { OperationsFormModal } from "./components/operations-management/OperationsFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { BulkSubmitWarningModal } from "./components/BulkSubmitWarningModal";
import { weekPlannerOperationsStyles } from "./styles";

import { fetchVendorsFromUsers, type Vendor } from "@/lib/vendors";
import { fetchRoutes, type Route } from "@/lib/api/routes";
import { fetchVehicles, type Vehicle } from "@/lib/vehicles";
import { fetchCostModels, type CostModel } from "@/lib/api/cost-models";
import {
  fetchVendorTypes,
  type VendorType,
  fetchCostModelEmployeesByUserId,
} from "@/lib/vendors-api";
import { fetchAdhocServices, type AdhocServiceDTO } from "@/lib/adhoc-services-api";
import { fetchDeposits, type DepositDTO } from "@/lib/api/deposits";
import { fetchServicePartners, type ServicePartnerDTO } from "@/lib/service-partners-api";
import { ADHOC_OPERATION_CREATE_DEFAULTS } from "@/lib/adhoc-operation-defaults";
import { useNalcRoute } from "@/hooks/useRoutes";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

import type { FrontendOperationRecord } from "./types/operations-management";
import type { DailyOperationsManagementDTO } from "./services/apiService";
import {
  fetchDailyOperationsManagementByDate,
  createDailyOperationsManagement,
  createDailyOperationsManagementDayOff,
  updateDailyOperationsManagement,
  deleteDailyOperationsManagement,
  postOperationsBulk,
} from "./services/apiService";
import type {
  DailyOperationsManagementCreateDTO,
  DailyOperationsManagementUpdateDTO,
  OperationsBulkCreateItemDTO,
} from "./services/apiService";

import {
  TABLE_HEADERS,
  TABLE_HEADERS_SUBMITTED,
  TABLE_HEADERS_ADHOC,
  TABLE_HEADERS_NOT_ALLOCATED,
} from "./types/operations-management";

import {
  extraToNumeric10_2,
  buildPaymentModeOptions,
  getCleanCostModelName,
  getFixedPriceRateForCostModelOnDate,
  normalizeDate,
  normalizeSortSelectValue,
  toOptionalRate,
  mapFrontendOperationRecordToOperationsBulkPart,
  validateBulkOperationsVehicleRules,
} from "./utils/operationsManagementMappers";

import { getUserIdFromToken } from "@/lib/auth";
import { RateBandsModal } from "./components/operations-management/RateBandsModal";
import {
  buildRateDetailsModalData,
  isBandedDailyRateCostModelId,
  type RateDetailsModalData,
} from "./utils/rateDetailsModalData";

/** Normalizes API/UI status for comparisons (e.g. "Not Allocated", "NOTALLOCATED" → "notallocated"). */
function normalizeStatusKey(status: string | null | undefined): string {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/** Linha com AD-HOC service (id ou nome) para a sub-tabela por depósito. */
function domRowHasAdhocService(row: FrontendOperationRecord): boolean {
  const rawId = row.adhocServiceId;
  if (rawId != null && String(rawId).trim() !== "") {
    const n = Number(rawId);
    if (Number.isFinite(n) && n > 0) return true;
  }
  const label = String(row["AD-HOC Service"] ?? "").trim();
  if (!label) return false;
  const lower = label.toLowerCase();
  if (lower === "null" || lower === "undefined") return false;
  return true;
}

/** Linha no bloco Submitted: prioridade a `isSubmitted` na API; fallback a `status` legado. */
function isDomRowSubmitted(item: FrontendOperationRecord): boolean {
  if (item.isSubmitted === true) return true;
  return normalizeStatusKey(item.Status) === "submitted";
}

const getStatusLabel = (
  isDayOff: boolean,
  status?: string | null,
  isSubmittedFlag?: boolean | null
): string => {
  if (isSubmittedFlag === true) return "Submitted";
  const k = normalizeStatusKey(status);
  if (k === "off") return "Off";
  if (k === "submitted") return "Submitted";
  if (k === "notallocated") return "NotAllocated";
  if (isDayOff) return "Off";
  return "Working";
};

/** Filtro local do bloco Submitted: folga vs sem alocação (depósito 7) vs rotas/outros depósitos. */
function matchesSubmittedKind(row: FrontendOperationRecord, kind: string): boolean {
  if (kind === "all") return true;
  const isDayOff = Boolean(row.isDayOff);
  const depId =
    row.depositId != null && Number.isFinite(Number(row.depositId)) ? Number(row.depositId) : NaN;
  if (kind === "dayoff") return isDayOff;
  if (kind === "notallocated") {
    const st = normalizeStatusKey(row.Status);
    return !isDayOff && (st === "notallocated" || depId === 7);
  }
  if (kind === "routes") return !isDayOff && depId !== 7;
  return true;
}

const PAGE_DEFAULT_SELECTED_DATE = () => new Date().toISOString().slice(0, 10);
const DAY_OFF_VEHICLE_ID = 37;

function buildPaymentModeLabel(costModels: CostModel[], costModelId: number | null | undefined): string {
  if (!costModelId || !Number.isFinite(costModelId)) return "";
  const cm = costModels.find((x) => x.costModelId === costModelId);
  if (!cm) return `Cost Model ${costModelId}`;
  return (
    getCleanCostModelName(cm.name) ||
    getCleanCostModelName(cm.description) ||
    cm.name ||
    cm.description ||
    `Cost Model ${costModelId}`
  );
}


function pickBetterFrontendRow(a: FrontendOperationRecord, b: FrontendOperationRecord): FrontendOperationRecord {
  const score = (r: FrontendOperationRecord) => {
    const hasDom =
      r.dailyOperationsManagementId != null && Number.isFinite(Number(r.dailyOperationsManagementId));
    if (hasDom && !r.isSyntheticNotAllocated) return 4;
    if (hasDom) return 3;
    if (!r.isSyntheticNotAllocated) return 2;
    return 1;
  };
  return score(b) > score(a) ? b : a;
}

/**
 * Removes only true duplicates after merging API + synthetic rows.
 * Important: do NOT collapse by vendor+date, because multiple records for the same vendor/day
 * must be treated as independent entries.
 */
function dedupeMergedFrontendOperationRows(rows: FrontendOperationRecord[]): FrontendOperationRecord[] {
  const byDomOnly = new Map<string, FrontendOperationRecord>();
  const byVendorDateSpecialBucket = new Map<string, FrontendOperationRecord>();
  const fallback = new Map<string, FrontendOperationRecord>();

  for (const row of rows) {
    const normalizedStatus = normalizeStatusKey(row.Status);
    const isSpecialBucketStatus = normalizedStatus === "off" || normalizedStatus === "notallocated";
    const rowVendorId =
      row.userId != null && Number.isFinite(Number(row.userId)) ? Number(row.userId) : null;
    const rowDate = normalizeDate(row.Date);

    // Defensive UI dedupe for legacy duplicated OFF/NotAllocated rows on same vendor/day.
    // Keep Off and NotAllocated separated (different buckets).
    if (isSpecialBucketStatus && rowVendorId != null && rowVendorId > 0 && rowDate) {
      const specialBucketKey = `special-bucket:${normalizedStatus}:${rowDate}|${rowVendorId}`;
      const existing = byVendorDateSpecialBucket.get(specialBucketKey);
      if (!existing) byVendorDateSpecialBucket.set(specialBucketKey, row);
      else byVendorDateSpecialBucket.set(specialBucketKey, pickBetterFrontendRow(existing, row));
      continue;
    }

    const domId = row.dailyOperationsManagementId;
    if (domId != null && Number.isFinite(Number(domId))) {
      const key = `dom:${Number(domId)}`;
      const existing = byDomOnly.get(key);
      if (!existing) byDomOnly.set(key, row);
      else byDomOnly.set(key, pickBetterFrontendRow(existing, row));
      continue;
    }

    // Keep synthetic/fallback rows stable without collapsing real vendor/day records.
    const fallbackKey = [
      normalizeDate(row.Date),
      String(row.userId ?? ""),
      String(row.Route ?? ""),
      String(row.Vehicle ?? ""),
      String(row.Status ?? ""),
      String(row.Name ?? ""),
    ].join("|");
    const existing = fallback.get(fallbackKey);
    if (!existing) fallback.set(fallbackKey, row);
    else fallback.set(fallbackKey, pickBetterFrontendRow(existing, row));
  }

  return [...byDomOnly.values(), ...byVendorDateSpecialBucket.values(), ...fallback.values()];
}

/** Evita linhas duplicadas se a API devolver o mesmo `dailyOperationsManagementId` mais de uma vez. */
function dedupeDailyOpsById(items: DailyOperationsManagementDTO[]): DailyOperationsManagementDTO[] {
  const byId = new Map<number, DailyOperationsManagementDTO>();
  const withoutId: DailyOperationsManagementDTO[] = [];
  for (const it of items) {
    const id = it.dailyOperationsManagementId;
    if (id != null && Number.isFinite(Number(id))) {
      byId.set(Number(id), it);
    } else {
      withoutId.push(it);
    }
  }
  return [...Array.from(byId.values()), ...withoutId];
}

/**
 * PATCH para estado NotAllocated (retirar da rota / delete lógico).
 * Mesmo conjunto de campos que `notAllocatedPayload` na troca de vendor e que o create NotAllocated usa na API.
 */
function getNotAllocatedDomPatch(nalcRouteId: number): DailyOperationsManagementUpdateDTO {
  return {
    depositId: BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT,
    routeId: nalcRouteId, // NALC — rota padrão para itens NotAllocated
    vehicleId: BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER,
    costModelId: 9,
    rate: null,
    routeCost: 0,
    routeSort: 0,
    adhocSort: 0,
    extra: 0,
    adhocServiceId: null,
    isSort: false,
    isDayOff: false,
    isLate: false,
    isVanHome: false,
    vendorRequestId: null,
    status: "NotAllocated",
    reason: null,
    notes: null,
    daily_game_plan_operationId: null,
  };
}

/**
 * NotAllocated automático para o vendor que deixa o registo (troca de vendor).
 * Não reutiliza rate, extras, ad-hoc, notas, etc. do registo anterior — só estado NotAllocated fixo.
 */
function buildNotAllocatedPayloadForReplacedVendor(
  date: string,
  userId: number,
  nalcRouteId: number
): DailyOperationsManagementCreateDTO {
  return {
    ...getNotAllocatedDomPatch(nalcRouteId),
    date,
    userId: userId,
    createdBy: null,
  };
}

/** Linhas com `dailyOperationsManagementId` real, mesmo vendor e data (para decidir DELETE vs NotAllocated). */
function countRealDomRowsForVendorOnDate(
  rows: FrontendOperationRecord[],
  userId: number | undefined,
  dateYmd: string
): number {
  if (userId == null || !Number.isFinite(Number(userId))) return 0;
  const d = normalizeDate(dateYmd);
  return rows.filter((x) => {
    if (x.dailyOperationsManagementId == null || !Number.isFinite(Number(x.dailyOperationsManagementId))) {
      return false;
    }
    if (x.userId == null || Number(x.userId) !== Number(userId)) return false;
    return normalizeDate(String(x.Date)) === d;
  }).length;
}

function resolveVendorIdForDomItem(item: FrontendOperationRecord, vendors: Vendor[]): number | undefined {
  if (item.userId != null && Number.isFinite(Number(item.userId))) {
    return Number(item.userId);
  }
  const d = vendors.find((x) => x.fullName === item.Name);
  if (d?.userId != null && Number.isFinite(Number(d.userId))) {
    return Number(d.userId);
  }
  return d?.userId != null && Number.isFinite(Number(d.userId)) ? Number(d.userId) : undefined;
}

export default function DailyOperationsManagementPage() {
  // Map header names to actual field names in FrontendOperationRecord
  const headerToFieldMap: Record<string, keyof FrontendOperationRecord> = {
    'Vendor': 'Name',      // AD-HOC table uses "Vendor" header but field is "Name"
    'Extra': 'Extras',     // AD-HOC table uses "Extra" but field is "Extras"
    'Sort Value': 'routeSort',
    // Default mappings (header name matches field name)
  };

  const [selectedDate, setSelectedDate] = useState<string>(PAGE_DEFAULT_SELECTED_DATE);

  const { data: nalcRoute } = useNalcRoute();
  const nalcRouteId = nalcRoute?.routeId ?? BUSINESS_RULES.ROUTE.NOT_ALLOCATED;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVendorType, setFilterVendorType] = useState<string>("all");
  const [filterServicePartnerId, setFilterServicePartnerId] = useState<string>("");

  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [submittedFilterVendorType, setSubmittedFilterVendorType] = useState<string>("all");
  const [submittedKindFilter, setSubmittedKindFilter] = useState<string>("all");

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'Route', direction: 'asc' });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);

  const [dailyOps, setDailyOps] = useState<DailyOperationsManagementDTO[]>([]);
  const [operationsData, setOperationsData] = useState<FrontendOperationRecord[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState<number | null>(null);
  const [isDayOffCategoryMode, setIsDayOffCategoryMode] = useState(false);
  const [isAdhocCategoryMode, setIsAdhocCategoryMode] = useState(false);
  const [isOffEditMode, setIsOffEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FrontendOperationRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkSubmitWarningMessage, setBulkSubmitWarningMessage] = useState<string | null>(null);
  const [validatedKeys, setValidatedKeys] = useState<Set<string>>(new Set());
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
  const submitInFlightRef = useRef(false);
  /** Track if we automatically linked an existing record (OFF/NotAllocated) during "Add New" flow. */
  const isAutoLinkedRef = useRef(false);
  /** Preserva routeSort ao mudar Sort → No para repor ao voltar a Yes (edição / default do vendor). */
  const routeSortSnapshotBeforeNoRef = useRef<string>("");

  const loadCostModelEmployees = useCallback(async (userId: number) => {
    return fetchCostModelEmployeesByUserId(userId);
  }, []);

  const [showRateDetailsModal, setShowRateDetailsModal] = useState(false);
  const [rateDetailsLoading, setRateDetailsLoading] = useState(false);
  const [rateDetailsError, setRateDetailsError] = useState<string | null>(null);
  const [rateDetailsData, setRateDetailsData] = useState<RateDetailsModalData | null>(null);

  const [formData, setFormData] = useState<FrontendOperationRecord>({
    Date: selectedDate,
    Route: "",
    Name: "",
    "Payment Mode": "",
    Rate: "",
    Sort: "Yes",
    SortLate: false,
    routeSort: "",
    "AD-HOC Sort": "",
    "AD-HOC Service": "",
    Extras: "",
    Notes: "",
    Vehicle: "",
    "Vendor type": "",
    Status: "Working",
    "Deposit Name": "",
    dailyOperationsManagementId: null,
  });

  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      const depositIdA = Number(a.depositId ?? 0);
      const depositIdB = Number(b.depositId ?? 0);
      if (depositIdA !== depositIdB) return depositIdA - depositIdB;
      return String(a.routeName ?? "").localeCompare(String(b.routeName ?? ""));
    });
  }, [routes]);

  const mapDailyToFrontend = useCallback(
    (d: DailyOperationsManagementDTO): FrontendOperationRecord => {
      const canonicalVendorId =
        d.userId != null && Number.isFinite(Number(d.userId))
          ? Number(d.userId)
          : undefined;
      const vendor =
        canonicalVendorId != null
          ? vendors.find((x) => x.userId === canonicalVendorId || x.userId === canonicalVendorId)
          : undefined;
      const isOff = Boolean(d.isDayOff) || normalizeStatusKey(d.status) === "off";

      const route =
        !isOff && d.route?.routeId != null ? routes.find((x) => x.routeId === d.route?.routeId) : undefined;
      const vehicle =
        !isOff && d.vehicle?.vehicleId != null && d.vehicle?.vehicleId !== 55
          ? vehicles.find((x) => x.vehicleId === d.vehicle?.vehicleId)
          : undefined;
      const costModelId = d.costModelId ?? undefined;

      const routeDepositId =
        d.route?.depositId != null && Number.isFinite(Number(d.route.depositId))
          ? Number(d.route.depositId)
          : null;
      const directDepositId =
        d.depositId != null && Number.isFinite(Number(d.depositId)) ? Number(d.depositId) : null;
      // Preferir depositId do registo (API): rotas DHOC/flex podem ter route.depositId doutro hub;
      // o agrupamento na UI deve seguir o depósito da linha em dailyOperationsManagement.
      const effectiveDepositId = directDepositId ?? routeDepositId;
      const deposit =
        effectiveDepositId != null ? deposits.find((x) => x.depositId === effectiveDepositId) : undefined;
      const vendorType =
        vendor?.vendorTypeId != null
          ? vendorTypes.find((x) => x.vendorTypeId === Number(vendor.vendorTypeId))
          : d.vendorTypeId != null
            ? vendorTypes.find((x) => x.vendorTypeId === Number(d.vendorTypeId))
            : undefined;
      const dRaw = d as unknown as Record<string, unknown>;
      const adhocServiceRaw =
        d.adhocService && typeof d.adhocService === "object"
          ? (d.adhocService as unknown as Record<string, unknown>)
          : {};
      const resolvedAdhocServiceId = (() => {
        if (d.adhocServiceId != null && Number.isFinite(Number(d.adhocServiceId))) {
          return Number(d.adhocServiceId);
        }
        if (dRaw.adhoc_service_id != null && Number.isFinite(Number(dRaw.adhoc_service_id))) {
          return Number(dRaw.adhoc_service_id);
        }
        if (adhocServiceRaw.adhocServiceId != null || adhocServiceRaw.adhoc_service_id != null) {
          const n = Number(adhocServiceRaw.adhocServiceId ?? adhocServiceRaw.adhoc_service_id);
          return Number.isFinite(n) ? n : undefined;
        }
        return undefined;
      })();

      const adhocService =
        resolvedAdhocServiceId != null
          ? adhocServices.find((s) => s.adhocServiceId === resolvedAdhocServiceId)
          : undefined;

      const adhocServiceLabel =
        adhocService?.adhocName ??
        (d.adhocService && typeof d.adhocService === "object"
          ? String(d.adhocService.adhocName ?? "").trim()
          : "");

      // Sort: mesma ideia do Daily Game Plan (mapWeekPlannerToFrontend / mapFrontendToWeekPlanner).
      const routeSortRaw = d.routeSort;
      const isLateTrue = d.isLate === true;
      const isSortTrue = d.isSort === true;

      let sortDisplay: "Yes" | "No" = "No";
      let sortLate = false;

      if (isLateTrue) {
        sortDisplay = "Yes";
        sortLate = true;
      } else if (isSortTrue) {
        sortDisplay = "Yes";
      } else if (routeSortRaw !== null && routeSortRaw !== undefined && String(routeSortRaw).trim() !== "" && String(routeSortRaw) !== "0" && String(routeSortRaw) !== "0.00") {
        const sortStr = String(routeSortRaw).toLowerCase();
        const sortNum =
          typeof routeSortRaw === "number" ? routeSortRaw : Number(routeSortRaw);
        if (sortStr === "late" || sortStr === "later" || sortNum === 1) {
          sortDisplay = "Yes";
          sortLate = true;
        } else if (!Number.isNaN(sortNum) && sortNum > 0) {
          sortDisplay = "Yes";
        } else if (!Number.isNaN(sortNum)) {
          sortDisplay = "No";
        } else {
          sortDisplay = sortStr === "yes" || sortStr === "1" || sortStr === "true" ? "Yes" : "No";
        }
      }

      const rawSubmitted =
        d.isSubmitted === true ||
        d.isSubmit === true ||
        normalizeStatusKey(d.status) === "submitted";

      const resolvedRate = (() => {
        const isBandedRateModel = isBandedDailyRateCostModelId(Number(costModelId));
        if (isBandedRateModel) {
          const n = Number(d.rate);
          // DAF/VSR: do not show 0.00 as a fixed rate in the table.
          if (d.rate == null || String(d.rate).trim() === "" || Number.isNaN(n) || n === 0) return "";
          return d.rate;
        }
        // Keep API rate when present; fallback to fixed price for DR/FSR models.
        if (d.rate !== null && d.rate !== undefined && String(d.rate).trim() !== "") {
          return d.rate;
        }
        if (!vendor || (costModelId !== 2 && costModelId !== 3)) return "";
        return getFixedPriceRateForCostModelOnDate(vendor.costModels, costModelId, normalizeDate(d.date)) ?? "";
      })();

      const resolvedAdhocSort = (() => {
        const vendorPayment = d.adhocService?.adhocVendorPayment;
        const hasVendorPayment = vendorPayment != null && String(vendorPayment).trim() !== "";
        const hasAdhocService =
          resolvedAdhocServiceId != null ||
          (d.adhocService != null && typeof d.adhocService === "object");
        const rawAdhocSort = d.adhocSort;
        const hasAdhocSortValue = rawAdhocSort != null && String(rawAdhocSort).trim() !== "";
        const adhocSortNumber =
          hasAdhocSortValue && Number.isFinite(Number(rawAdhocSort)) ? Number(rawAdhocSort) : null;

        // BAOP payloads often send adhocSort=0.00 for AD-HOC rows; in that case, prefer service vendor payment.
        if (hasAdhocService && hasVendorPayment && (adhocSortNumber == null || adhocSortNumber === 0)) {
          return vendorPayment;
        }
        if (hasAdhocSortValue) {
          return rawAdhocSort;
        }
        if (hasVendorPayment) {
          return vendorPayment;
        }
        return "";
      })();

      return {
        dailyOperationsManagementId: d.dailyOperationsManagementId,
        userId: canonicalVendorId,
        modelEmployeesId: d.modelEmployeesId ?? null,
        Date: normalizeDate(d.date),
        Route: isOff ? "OFF" : String(route?.routeName ?? d.route?.routeName ?? ""),
        Name: vendor?.fullName ?? d.fullname ?? "",
        "Payment Mode": buildPaymentModeLabel(costModels, costModelId ?? null),
        paymentModeId: costModelId,
        Rate: resolvedRate,
        Sort: normalizeSortSelectValue(sortDisplay),
        SortLate: sortLate,
        routeSort: routeSortRaw ?? "",
        "AD-HOC Sort": resolvedAdhocSort,
        "AD-HOC Service": adhocServiceLabel,
        adhocServiceId: resolvedAdhocServiceId,
        Extras: d.extra ?? "",
        Notes: d.notes ?? "",
        Vehicle:
          vehicle?.registrationPlates ??
          ((d.vehicle as { vehicleRegistrationPlate?: string | null } | null | undefined)?.vehicleRegistrationPlate ?? null) ??
          d.vehicle?.vehicleregistrationPlate ??
          ((d as unknown as { vehicleRegistrationPlate?: string | null }).vehicleRegistrationPlate ?? null) ??
          ((d as unknown as { vehicleregistrationPlate?: string | null }).vehicleregistrationPlate ?? null) ??
          "NOVEHICLE",
        vehicleFuelType: vehicle?.fuel_type ? String(vehicle.fuel_type) : undefined,
        "Vendor type": vendorType?.nameType ?? "",
        Status: getStatusLabel(Boolean(d.isDayOff), d.status, rawSubmitted),
        depositId: effectiveDepositId ?? undefined,
        "Deposit Name": deposit?.depositName ?? "",
        // Reutiliza o campo `operationId` para que a UI consiga tratar registros "submetidos"
        // quando a API preencher `daily_game_plan_operationId` ou `dailyGamePlanOperationId`.
        operationId: d.dailyGamePlanOperationId ?? d.daily_game_plan_operationId ?? undefined,
        isDayOff: Boolean(d.isDayOff),
        isSubmitted: rawSubmitted,
        servicePartnerId: d.servicePartnerId ?? null,
        "Service Partner": d.servicePartnerId != null ? String(d.servicePartnerId) : "",
      };
    },
    [vendors, routes, vehicles, costModels, vendorTypes, adhocServices, deposits]
  );

  const getDailyValidationKey = useCallback((item: FrontendOperationRecord): string => {
    if (item.isSyntheticNotAllocated && item.userId != null && item.userId > 0) {
      return `synthetic-notalloc:${item.userId}`;
    }
    if (item.dailyOperationsManagementId && Number.isFinite(item.dailyOperationsManagementId)) {
      return `dom:${item.dailyOperationsManagementId}`;
    }
    // Fallback caso não exista ID (evita quebrar a UI)
    return `fallback:${String(item.Date)}|${String(item.Route)}|${String(item.Name)}|${String(item.Vehicle)}`;
  }, []);

  const handleToggleDailyItemValidated = useCallback((item: FrontendOperationRecord, checked: boolean) => {
    const key = getDailyValidationKey(item);
    setValidatedKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }, [getDailyValidationKey]);

  const toggleBlockCollapsed = useCallback((blockKey: string) => {
    setCollapsedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockKey)) next.delete(blockKey);
      else next.add(blockKey);
      return next;
    });
  }, []);

  const isEligibleForValidation = useCallback((item: FrontendOperationRecord): boolean => {
    // Only submitted records are blocked; Off and NotAllocated can be selected/validated.
    return !isDomRowSubmitted(item);
  }, []);

  const handleToggleSelectAllInBlock = useCallback(
    (itemsInBlock: FrontendOperationRecord[], shouldSelect: boolean) => {
      if (!itemsInBlock || itemsInBlock.length === 0) return;

      const eligibleItems = itemsInBlock.filter((it) => isEligibleForValidation(it));
      if (eligibleItems.length === 0) return;

      setValidatedKeys((prev) => {
        const next = new Set(prev);
        for (const item of eligibleItems) {
          const key = getDailyValidationKey(item);
          if (shouldSelect) next.add(key);
          else next.delete(key);
        }
        return next;
      });
    },
    [getDailyValidationKey, isEligibleForValidation]
  );

  const isBandedCostModelRow = useCallback((item: FrontendOperationRecord) => {
    const id = Number(item.paymentModeId ?? item["Payment Mode"]);
    const modeLabel = getCleanCostModelName(String(item["Payment Mode"] ?? ""));
    if (modeLabel === "DR" || modeLabel === "FSR") return false;
    if (modeLabel === "DAF" || modeLabel === "VSR" || modeLabel === "SP_VSR") return true;
    return isBandedDailyRateCostModelId(id);
  }, []);

  const handleOpenRateDetails = useCallback(
    async (item: FrontendOperationRecord) => {
      setShowRateDetailsModal(true);
      setRateDetailsLoading(true);
      setRateDetailsError(null);
      setRateDetailsData(null);
      try {
        const data = await buildRateDetailsModalData(item, loadCostModelEmployees);
        setRateDetailsData(data);
      } catch (err: unknown) {
        setRateDetailsError(err instanceof Error ? err.message : "Failed to load cost model band details.");
      } finally {
        setRateDetailsLoading(false);
      }
    },
    [loadCostModelEmployees]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorsData, routesData, vehiclesData, costModelsData, vendorTypesData, adhocServicesData, depositsData, servicePartnersData] = await Promise.all(
        [
          fetchVendorsFromUsers(),
          fetchRoutes(),
          fetchVehicles(),
          fetchCostModels(),
          fetchVendorTypes(),
          fetchAdhocServices(),
          fetchDeposits().catch(() => []),
          fetchServicePartners().catch(() => []),
        ]
      );

      setVendors(vendorsData);
      setRoutes(routesData);
      setVehicles(vehiclesData);
      setCostModels(costModelsData);
      setVendorTypes(vendorTypesData);
      setAdhocServices(adhocServicesData);
      setDeposits(depositsData);
      setServicePartners(servicePartnersData);

      // Uma única listagem por data já inclui Working, Off e NotAllocated; o merge de 3 pedidos
      // podia duplicar linhas na UI se houvesse inconsistência de IDs entre respostas.
      const daily = await fetchDailyOperationsManagementByDate(selectedDate);
      setDailyOps(dedupeDailyOpsById(daily));
      // Não zerar validatedKeys aqui: o useEffect de pruning abaixo remove
      // automaticamente chaves inválidas sem apagar as que continuam existindo.
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load daily operations.");
      setDailyOps([]);
      setOperationsData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const mapped = dailyOps.map((d) => mapDailyToFrontend(d));
    setOperationsData(mapped);
  }, [dailyOps, mapDailyToFrontend]);

  const operationsDataWithNotAllocated = useMemo(() => {
    return dedupeMergedFrontendOperationRows(operationsData);
  }, [operationsData]);

  // Pruning reativo: remove chaves de validatedKeys que não existem mais nos dados atuais.
  // Garante persistência de seleção após delete/edit, e reset natural ao trocar de data
  // (dados completamente novos → nenhuma chave antiga sobrevive).
  useEffect(() => {
    setValidatedKeys((prev) => {
      if (prev.size === 0) return prev;
      const existingKeys = new Set(operationsDataWithNotAllocated.map(getDailyValidationKey));
      const pruned = new Set([...prev].filter((k) => existingKeys.has(k)));
      if (pruned.size === prev.size) return prev; // sem mudança — evita re-render desnecessário
      return pruned;
    });
  }, [operationsDataWithNotAllocated, getDailyValidationKey]);

  useEffect(() => {
    setSubmittedSearchTerm("");
    setSubmittedFilterVendorType("all");
    setSubmittedKindFilter("all");
  }, [selectedDate]);

  const handleBatchSubmit = useCallback(async () => {
    if (isBatchSubmitting) return;
    const selected = operationsDataWithNotAllocated.filter((x) => validatedKeys.has(getDailyValidationKey(x)));

    if (selected.length === 0) {
      alert("Select at least one record using the checkbox before clicking Submit.");
      return;
    }

    try {
      setIsBatchSubmitting(true);

      const createdBy = getUserIdFromToken();
      const bulkItems: OperationsBulkCreateItemDTO[] = [];
      const mapErrors: string[] = [];
      for (const item of selected) {
        const { part, error } = mapFrontendOperationRecordToOperationsBulkPart(
          item,
          vendors,
          routes,
          vehicles,
          costModels,
          createdBy
        );
        if (error) mapErrors.push(error);
        else if (part) bulkItems.push(part);
      }

      if (mapErrors.length > 0) {
        alert(mapErrors.join("\n"));
        return;
      }

      if (bulkItems.length === 0) {
        alert("No valid records to submit.");
        return;
      }

      const vehicleRuleError = validateBulkOperationsVehicleRules(
        bulkItems,
        operationsDataWithNotAllocated,
        selected,
        vehicles,
        vendors,
        getDailyValidationKey
      );
      if (vehicleRuleError) {
        setBulkSubmitWarningMessage(vehicleRuleError);
        return;
      }

      const result = await postOperationsBulk(bulkItems);
      if (result.failed > 0) {
        alert(
          `Bulk completed with warnings: ${result.successful} created, ${result.failed} failed (total ${result.total}).`
        );
      }

      setValidatedKeys(new Set());
      await reload();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to submit selected records.");
    } finally {
      setIsBatchSubmitting(false);
    }
  }, [
    operationsDataWithNotAllocated,
    validatedKeys,
    getDailyValidationKey,
    reload,
    isBatchSubmitting,
    vendors,
    routes,
    vehicles,
    costModels,
  ]);

  const filteredOperationsData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return operationsDataWithNotAllocated.filter((item) => {
      if (filterStatus !== "all") {
        const rowSt = normalizeStatusKey(item.Status);
        const filterSt = normalizeStatusKey(filterStatus);
        const rowIsOff = Boolean(item.isDayOff) || rowSt === "off";
        const rowIsNotAlloc = rowSt === "notallocated";

        if (filterSt === "working") {
          // Keep Not allocated + Day off blocks visible while focusing route rows on Working.
          if (!rowIsOff && !rowIsNotAlloc && rowSt !== "working") return false;
        } else if (filterSt === "off") {
          if (!rowIsOff) return false;
        } else if (filterSt === "notallocated") {
          if (!rowIsNotAlloc) return false;
        } else if (filterSt === "submitted") {
          return false;
        } else if (rowSt !== filterSt) {
          return false;
        }
      }
      if (filterVendorType !== "all") {
        if (String(item["Vendor type"] ?? "").toLowerCase() !== filterVendorType.toLowerCase()) return false;
      }
      if (filterServicePartnerId !== "") {
        const spId = item.servicePartnerId;
        if (spId == null || String(spId) !== filterServicePartnerId) return false;
      }
      if (term) {
        const name = String(item.Name ?? "").toLowerCase();
        const route = String(item.Route ?? "").toLowerCase();
        const vehicle = String(item.Vehicle ?? "").toLowerCase();
        if (!name.includes(term) && !route.includes(term) && !vehicle.includes(term)) return false;
      }
      return true;
    });
  }, [operationsDataWithNotAllocated, searchTerm, filterStatus, filterVendorType, filterServicePartnerId]);

  /** Lista principal (exclui Submitted — estes vão só para o bloco Submitted).
   * Usa isDomRowSubmitted para também excluir itens OFF com isSubmitted=true,
   * que de outro modo apareceriam duplicados no bloco "Day off" e no bloco Submitted. */
  const filteredForMain = useMemo(
    () => filteredOperationsData.filter((item) => !isDomRowSubmitted(item)),
    [filteredOperationsData]
  );

  /**
   * Todos os Submitted do dia, filtrados por pesquisa global e Vendor type.
   * O filtro de Status da barra superior não esconde este bloco (só afeta a lista principal).
   */
  const submittedRowsFromGlobalFilter = useMemo(() => {
    return operationsDataWithNotAllocated.filter((item) => {
      if (!isDomRowSubmitted(item)) return false;
      if (filterVendorType !== "all") {
        if (String(item["Vendor type"] ?? "").toLowerCase() !== filterVendorType.toLowerCase()) return false;
      }
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const name = String(item.Name ?? "").toLowerCase();
        const route = String(item.Route ?? "").toLowerCase();
        const vehicle = String(item.Vehicle ?? "").toLowerCase();
        if (!name.includes(term) && !route.includes(term) && !vehicle.includes(term)) return false;
      }
      return true;
    });
  }, [operationsDataWithNotAllocated, searchTerm, filterVendorType]);

  const hasAnyVisibleRows = filteredForMain.length > 0 || submittedRowsFromGlobalFilter.length > 0;

  const uniqueStatuses = useMemo(() => {
    const set = new Set<string>(operationsDataWithNotAllocated.map((x) => x.Status).filter(Boolean));
    // Mantém ordem estável
    return Array.from(set.values()).sort((a, b) => (a === "Off" ? -1 : 1) - (b === "Off" ? -1 : 1));
  }, [operationsDataWithNotAllocated]);

  const uniqueVendorTypes = useMemo(() => {
    const set = new Set<string>(operationsDataWithNotAllocated.map((x) => x["Vendor type"]).filter(Boolean));
    return Array.from(set.values()).filter((t) => !String(t).toUpperCase().includes("BAOP"));
  }, [operationsDataWithNotAllocated]);

  const dataByDepositSections = useMemo(() => {
    const groups = new Map<string, FrontendOperationRecord[]>();
    for (const item of filteredForMain) {
      const status = normalizeStatusKey(item.Status);
      const isBAOP =
        item.depositId === BUSINESS_RULES.DEPOSIT.BAOP_DEFAULT ||
        String(item["Deposit Name"] ?? "").trim().toUpperCase() === "BAOP";

      let key: string;
      if (isBAOP) {
        // BAOP ignora baldes globais e agrupa sempre no próprio depósito
        key = String(item.depositId ?? item["Deposit Name"] ?? "").trim();
      } else if (Boolean(item.isDayOff) || status === BUSINESS_RULES.WORKING_STATUS.OFF) {
        key = BUSINESS_RULES.WORKING_STATUS.OFF;
      } else if (status === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED) {
        key = BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;
      } else {
        key = String(item.depositId ?? item["Deposit Name"] ?? "").trim();
      }

      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }

    const mainBlocks: { key: string; label: string; rows: FrontendOperationRecord[] }[] = [];

    // Bloco Day off (usando convenção OFF)
    const offRows = groups.get(BUSINESS_RULES.WORKING_STATUS.OFF) ?? [];
    if (offRows.length) {
      mainBlocks.push({
        key: BUSINESS_RULES.WORKING_STATUS.OFF,
        label: "Day off",
        rows:offRows
      });
    }

    // Bloco Not allocated (usando convenção NOT_ALLOCATED)
    const notAllocatedRows = groups.get(BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED) ?? [];
    if (notAllocatedRows.length) {
      mainBlocks.push({
        key: BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED,
        label: "Not allocated",
        rows:notAllocatedRows
      });
    }

    // Blocos por depot (agora usando depositId como chave)
    for (const dep of deposits) {
      const depKey = String(dep.depositId ?? dep.depositName ?? "");
      const rows = groups.get(depKey) ?? [];
      if (rows.length) {
        mainBlocks.push({ key: depKey, label: dep.depositName ?? "", rows });
      }
    }

    // Qualquer outro "depósito" (chave) que exista nos dados mas não na lista de `deposits`
    groups.forEach((rows, key) => {
      if (
        !rows.length ||
        key === BUSINESS_RULES.WORKING_STATUS.OFF ||
        key === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED ||
        key === "__submitted"
      )
        return;
      const isKnownDepot = deposits.some((d) => String(d.depositId ?? d.depositName ?? "") === key);
      if (isKnownDepot) return;
      mainBlocks.push({ key, label: key, rows });
    });

    const submittedRowsSorted = [...submittedRowsFromGlobalFilter].sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, { sensitivity: "base" })
    );
    const submittedBlock =
      submittedRowsSorted.length > 0
        ? ({ key: "__submitted", label: "Submitted", rows: submittedRowsSorted } as const)
        : null;

    return { mainBlocks, submittedBlock };
  }, [filteredForMain, deposits, submittedRowsFromGlobalFilter]);

  const submittedBlockForDisplay = useMemo(() => {
    const block = dataByDepositSections.submittedBlock;
    if (!block) return null;
    let rows = [...block.rows];
    if (submittedKindFilter !== "all") {
      rows = rows.filter((r) => matchesSubmittedKind(r, submittedKindFilter));
    }
    if (submittedFilterVendorType !== "all") {
      rows = rows.filter(
        (r) =>
          String(r["Vendor type"] ?? "").toLowerCase() === submittedFilterVendorType.toLowerCase()
      );
    }
    const term = submittedSearchTerm.trim().toLowerCase();
    if (term) {
      rows = rows.filter((r) => {
        const name = String(r.Name ?? "").toLowerCase();
        const route = String(r.Route ?? "").toLowerCase();
        const vehicle = String(r.Vehicle ?? "").toLowerCase();
        const dep = String(r["Deposit Name"] ?? "").toLowerCase();
        const notes = String(r.Notes ?? "").toLowerCase();
        return (
          name.includes(term) ||
          route.includes(term) ||
          vehicle.includes(term) ||
          dep.includes(term) ||
          notes.includes(term)
        );
      });
    }
    rows.sort((a, b) =>
      String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, { sensitivity: "base" })
    );
    return { key: block.key, label: block.label, rows };
  }, [
    dataByDepositSections.submittedBlock,
    submittedSearchTerm,
    submittedFilterVendorType,
    submittedKindFilter,
  ]);

  const resetForm = useCallback(() => {
    routeSortSnapshotBeforeNoRef.current = "";
    setFormData({
      Date: selectedDate,
      Route: "",
      Name: "",
      "Payment Mode": "",
      Rate: "",
      Sort: "Yes",
      SortLate: false,
      routeSort: "",
      "AD-HOC Sort": "",
      "AD-HOC Service": "",
      Extras: "",
      Notes: "",
      Vehicle: "",
      "Vendor type": "",
      Status: "Working",
      "Deposit Name": "",
      dailyOperationsManagementId: null,
    });
    setEditingDailyId(null);
    isAutoLinkedRef.current = false;
  }, [selectedDate]);

  const handleOpenCreate = useCallback(() => {
    resetForm();
    setIsDayOffCategoryMode(false);
    setIsAdhocCategoryMode(false);
    setIsOffEditMode(false);
    isAutoLinkedRef.current = false;
    setShowModal(true);
  }, [resetForm]);

  const handleOpenCreateDayOff = useCallback(() => {
    setFormData({
      Date: selectedDate,
      Route: "OFF",
      Name: "",
      "Payment Mode": "",
      Rate: "",
      Sort: "No",
      SortLate: false,
      "AD-HOC Sort": "",
      "AD-HOC Service": "",
      Extras: "",
      Notes: "",
      Vehicle: "NOVEHICLE",
      "Vendor type": "",
      Status: "Off",
      "Deposit Name": "",
      dailyOperationsManagementId: null,
    });
    setEditingDailyId(null);
    isAutoLinkedRef.current = false;
    setIsDayOffCategoryMode(true);
    setIsAdhocCategoryMode(false);
    setIsOffEditMode(false);
    setShowModal(true);
  }, [selectedDate]);

  const handleOpenCreateAdhocService = useCallback(() => {
    setFormData({
      Date: selectedDate,
      Route: "",
      Name: "",
      "Payment Mode": "2",
      Rate: "",
      Sort: "No",
      SortLate: false,
      "AD-HOC Sort": "",
      "AD-HOC Service": "",
      adhocServiceId: "",
      Extras: "",
      Notes: "",
      Vehicle: "",
      "Vendor type": "",
      Status: "Working",
      "Deposit Name": "",
      dailyOperationsManagementId: null,
    });
    setEditingDailyId(null);
    isAutoLinkedRef.current = false;
    setIsDayOffCategoryMode(false);
    setIsAdhocCategoryMode(true);
    setIsOffEditMode(false);
    setShowModal(true);
  }, [selectedDate]);

  /** Select AD-HOC usa value=id; alinha adhocServiceId e "AD-HOC Service" (id ou nome → id). */
  const syncAdhocServiceFieldsForForm = useCallback(
    (formItem: FrontendOperationRecord) => {
      let id: number | undefined =
        formItem.adhocServiceId != null && String(formItem.adhocServiceId).trim() !== ""
          ? Number(formItem.adhocServiceId)
          : undefined;
      if (id != null && (!Number.isFinite(id) || id <= 0)) id = undefined;

      if (id == null && formItem["AD-HOC Service"]) {
        const label = String(formItem["AD-HOC Service"]).trim();
        if (label) {
          const byId = adhocServices.find((s) => String(s.adhocServiceId) === label);
          const byName =
            byId ??
            adhocServices.find((s) => String(s.adhocName ?? "").trim() === label);
          if (byName != null && Number.isFinite(Number(byName.adhocServiceId))) {
            id = Number(byName.adhocServiceId);
          }
        }
      }

      if (id != null && Number.isFinite(id) && id > 0) {
        formItem.adhocServiceId = id;
        formItem["AD-HOC Service"] = String(id);
      }
    },
    [adhocServices]
  );

  const handleEdit = useCallback(
    (item: FrontendOperationRecord) => {
      if (item.isSyntheticNotAllocated && item.userId) {
        const formItem: FrontendOperationRecord = { ...item };
        if (item.paymentModeId != null) formItem["Payment Mode"] = String(item.paymentModeId);
        syncAdhocServiceFieldsForForm(formItem);
        formItem.Date = selectedDate;
        formItem.dailyOperationsManagementId = null;
        setFormData(formItem);
        setEditingDailyId(null);
        setIsDayOffCategoryMode(false);
        setIsAdhocCategoryMode(false);
        setIsOffEditMode(false);
        setShowModal(true);
        return;
      }

      if (!item.dailyOperationsManagementId) return;

      const formItem: FrontendOperationRecord = { ...item };
      if (item.paymentModeId != null) formItem["Payment Mode"] = String(item.paymentModeId);
      syncAdhocServiceFieldsForForm(formItem);
      formItem.Date = selectedDate;

      const isOffItem = Boolean(item.isDayOff) || normalizeStatusKey(item.Status) === "off";

      setFormData(formItem);
      setEditingDailyId(item.dailyOperationsManagementId);
      isAutoLinkedRef.current = false;
      setIsDayOffCategoryMode(false);
      setIsAdhocCategoryMode(!isOffItem && domRowHasAdhocService(item));
      setIsOffEditMode(isOffItem);
      setShowModal(true);
    },
    [selectedDate, syncAdhocServiceFieldsForForm]
  );

  const handleDelete = useCallback((item: FrontendOperationRecord) => {
    if (item.isSyntheticNotAllocated) return;
    if (!item.dailyOperationsManagementId) return;
    if (normalizeStatusKey(item.Status) === "notallocated") return;
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete?.dailyOperationsManagementId) return;
    try {
      setIsDeleting(true);
      const userId = resolveVendorIdForDomItem(itemToDelete, vendors);
      const dateKey = normalizeDate(String(itemToDelete.Date ?? selectedDate));
      const sameDayCount = countRealDomRowsForVendorOnDate(operationsDataWithNotAllocated, userId, dateKey);

      // Mais do que um registo DOM para o mesmo vendor neste dia: remove a linha (DELETE).
      // Único registo: mantém regra anterior — PATCH para NotAllocated (retirar da rota sem apagar o registo).
      if (sameDayCount > 1) {
        await deleteDailyOperationsManagement(Number(itemToDelete.dailyOperationsManagementId));
      } else {
        await updateDailyOperationsManagement(itemToDelete.dailyOperationsManagementId, {
          ...getNotAllocatedDomPatch(nalcRouteId),
        });
      }
      setShowDeleteModal(false);
      setItemToDelete(null);
      await reload();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete record.");
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, reload, vendors, operationsDataWithNotAllocated, selectedDate, nalcRouteId]);

  const handleInputChange = useCallback(
    (field: string, value: string | number) => {
      setFormData((prev) => {
        if (field === "Status") {
          const status = String(value);
          if (status === "Off") {
            // Coerência: Day Off sempre usa Route=OFF e Vehicle=NOVEHICLE.
            return { ...prev, Status: "Off", Route: "OFF", Vehicle: "NOVEHICLE" };
          }
          if (status === "NotAllocated") {
            // NotAllocated é uma categoria de Off: mantém Route=OFF e Vehicle=NOVEHICLE.
            return { ...prev, Status: "NotAllocated", Route: "OFF", Vehicle: "NOVEHICLE" };
          }
          // Ao voltar para Working, restaura Route/Vehicle a partir do vendor selecionado.
          const prevVendorId =
            prev.userId != null && Number.isFinite(Number(prev.userId)) ? Number(prev.userId) : null;
          const prevNameNorm = String(prev.Name ?? "").trim().toLowerCase();
          const vendor =
            (prevVendorId != null ? vendors.find((d) => d.userId === prevVendorId) : undefined) ??
            vendors.find((d) => String(d.fullName ?? "").trim().toLowerCase() === prevNameNorm);
          if (!vendor) {
            return { ...prev, Status: "Working", Route: "", Vehicle: "" };
          }
          const routeFromVendor =
            vendor.routeId != null ? routes.find((r) => r.routeId === vendor.routeId) : undefined;
          const routeFallback = routes.find((r) => String(r.routeName ?? "").toUpperCase() !== "OFF");
          const route = routeFromVendor ?? routeFallback;

          const vehicleFromVendor =
            vendor.vehicleId != null ? vehicles.find((v) => v.vehicleId === vendor.vehicleId) : undefined;
          const vehicleFallback = vehicles.find(
            (v) => v.registrationPlates && String(v.registrationPlates).trim() !== ""
          );
          const vehicle = vehicleFromVendor ?? vehicleFallback;

          const deposit =
            route?.depositId != null
              ? deposits.find((d) => d.depositId === route.depositId)
              : vendor.depositId != null
                ? deposits.find((d) => d.depositId === vendor.depositId)
                : undefined;

          return {
            ...prev,
            Status: "Working",
            Route: route?.routeName ?? "",
            Vehicle: vehicle?.registrationPlates ?? "NOVEHICLE",
            "Deposit Name": deposit?.depositName ?? prev["Deposit Name"],
          };
        }

        if (field === "Payment Mode") {
          const nextPm = String(value);
          const vendor = vendors.find((d) => d.fullName === prev.Name);
          const cmId = Number(nextPm);
          let rate = prev.Rate;
          if (vendor && (cmId === 2 || cmId === 3)) {
            const r = getFixedPriceRateForCostModelOnDate(vendor.costModels, cmId, prev.Date);
            rate = r ?? "";
          } else {
            rate = "";
          }
          return { ...prev, [field]: nextPm, Rate: rate };
        }

        if (field === "Date") {
          // Date is controlled by selectedDate from page.
          const dateStr = selectedDate;
          const vendor = vendors.find((d) => d.fullName === prev.Name);
          const cmId = Number(prev["Payment Mode"] ?? prev.paymentModeId);
          if (vendor && (cmId === 2 || cmId === 3)) {
            const r = getFixedPriceRateForCostModelOnDate(vendor.costModels, cmId, dateStr);
            return { ...prev, Date: dateStr, Rate: r ?? "" };
          }
          return { ...prev, Date: dateStr };
        }

        if (field === "Name") {
          const vendorName = String(value);
          const vendor = vendors.find((d) => d.fullName === vendorName);

          // Se status for Off/NotAllocated, não sobrescrever Route/Vehicle
          const isOffMode = prev.Status === "Off" || prev.Status === "NotAllocated";

          if (!vendor) {
            return { ...prev, Name: vendorName };
          }

          const vendorType = vendor.vendorTypeId != null ? vendorTypes.find((t) => t.vendorTypeId === vendor.vendorTypeId) : undefined;

          if (isOffMode) {
            return {
              ...prev,
              Name: vendorName,
              "Vendor type": vendorType?.nameType ?? prev["Vendor type"],
            };
          }

          if (!isAdhocCategoryMode && (editingDailyId === null || isAutoLinkedRef.current)) {
            const dateStr = selectedDate;
            const sameDayCount = countRealDomRowsForVendorOnDate(operationsDataWithNotAllocated, vendor.userId, dateStr);
            const existingRealRow =
              sameDayCount === 1
                ? operationsDataWithNotAllocated.find(
                  (r) =>
                    r.userId === vendor.userId &&
                    normalizeDate(r.Date) === normalizeDate(dateStr) &&
                    r.dailyOperationsManagementId != null &&
                    !r.isSyntheticNotAllocated &&
                    (normalizeStatusKey(r.Status) === BUSINESS_RULES.WORKING_STATUS.OFF || !isDomRowSubmitted(r))
                )
                : undefined;

            if (existingRealRow) {
              const rowStatus = normalizeStatusKey(existingRealRow.Status);
              if (rowStatus === BUSINESS_RULES.WORKING_STATUS.OFF) {
                const confirmConversion = window.confirm(
                  `The vendor ${vendor.fullName} already has a Day Off record for this date. Do you want to convert it to a working record?`
                );
                if (!confirmConversion) {
                  return prev; // Mantém o estado anterior (não seleciona este vendor)
                }
              }
              setEditingDailyId(Number(existingRealRow.dailyOperationsManagementId));
              isAutoLinkedRef.current = true;
            } else {
              setEditingDailyId(null);
              isAutoLinkedRef.current = false;
            }
          }

          const vehicleFromVendor =
            vendor.vehicleId != null ? vehicles.find((v) => v.vehicleId === vendor.vehicleId) : undefined;
          const vehicleFallback = vehicles.find((v) => v.registrationPlates && String(v.registrationPlates).trim() !== "");
          const vehicle = vehicleFromVendor ?? vehicleFallback;

          // Edição: manter rota, depósito, sort e payment do registo; só o veículo vem do novo vendor.
          if (editingDailyId != null) {
            const routeKept =
              routes.find((r) => r.routeName === prev.Route) ??
              routes.find((r) => String(r.routeName ?? "").trim() === String(prev.Route ?? "").trim());
            const deposit =
              routeKept?.depositId != null
                ? deposits.find((d) => d.depositId === routeKept.depositId)
                : undefined;

            const cmId = Number(prev["Payment Mode"] ?? prev.paymentModeId);
            let rateForEdit = prev.Rate;
            if (cmId === 2 || cmId === 3) {
              const r = getFixedPriceRateForCostModelOnDate(vendor.costModels, cmId, prev.Date);
              rateForEdit = r ?? "";
            }

            return {
              ...prev,
              Name: vendorName,
              "Vendor type": vendorType?.nameType ?? prev["Vendor type"],
              Route: prev.Route,
              "Deposit Name": deposit?.depositName ?? prev["Deposit Name"],
              Vehicle: vehicle?.registrationPlates ?? "NOVEHICLE",
              Rate: rateForEdit,
            };
          }

          // Novo registo: rota e restantes campos a partir do vendor (comportamento anterior)
          const routeFromVendor = vendor.routeId != null ? routes.find((r) => r.routeId === vendor.routeId) : undefined;
          const routeFallback = routes.find((r) => String(r.routeName ?? "").toUpperCase() !== "OFF");
          const route = routeFromVendor ?? routeFallback;
          const deposit =
            route?.depositId != null
              ? deposits.find((d) => d.depositId === route.depositId)
              : vendor.depositId != null
                ? deposits.find((d) => d.depositId === vendor.depositId)
                : undefined;

          if (isAdhocCategoryMode) {
            return {
              ...prev,
              Name: vendorName,
              "Vendor type": vendorType?.nameType ?? prev["Vendor type"],
              "Payment Mode": "2",
              Rate: "",
              Route: route?.routeName ?? "",
              "Deposit Name": deposit?.depositName ?? prev["Deposit Name"],
              Vehicle: vehicle?.registrationPlates ?? "NOVEHICLE",
              Sort: "No",
              SortLate: false,
            };
          }

          // Sort default: propriedades do vendor (`isSort`, `isLate`), não routeSortValue numérico.
          const sort: "Yes" | "No" =
            vendor.isSort === true ? "Yes" : vendor.isSort === false ? "No" : "Yes";
          const sortLateFromVendor = vendor.isLate === true;

          const paymentModeOptionsFallback = buildPaymentModeOptions(costModels);
          const paymentModeFallbackValue = paymentModeOptionsFallback?.[0]?.value ?? prev["Payment Mode"];

          const selectedCmId =
            vendor.costModelId != null && Number.isFinite(Number(vendor.costModelId))
              ? Number(vendor.costModelId)
              : null;
          const paymentModeValue =
            selectedCmId != null ? String(selectedCmId) : paymentModeFallbackValue;
          const cmIdForRate = Number(paymentModeValue);
          const rateFromModels =
            cmIdForRate === 2 || cmIdForRate === 3
              ? getFixedPriceRateForCostModelOnDate(vendor.costModels, cmIdForRate, prev.Date) ?? ""
              : "";

          const routeSortFromVendor =
            sort === "Yes" && vendor.routeSortValue != null && Number.isFinite(Number(vendor.routeSortValue))
              ? String(vendor.routeSortValue)
              : "";

          return {
            ...prev,
            Name: vendorName,
            "Vendor type": vendorType?.nameType ?? prev["Vendor type"],
            "Payment Mode": paymentModeValue,
            Rate: rateFromModels,
            Route: route?.routeName ?? "",
            "Deposit Name": deposit?.depositName ?? prev["Deposit Name"],
            Vehicle: vehicle?.registrationPlates ?? "NOVEHICLE",
            Sort: sort,
            SortLate: sortLateFromVendor,
            routeSort: routeSortFromVendor,
          };
        }

        if (field === "SortLate") {
          const late = value === 1 || value === "1" ? true : false;
          return { ...prev, SortLate: late };
        }
        if (field === "Sort") {
          const next = String(value);
          const nextLower = next.toLowerCase();
          if (nextLower === "no") {
            const prevRs = prev.routeSort;
            if (prevRs != null && String(prevRs).trim() !== "") {
              routeSortSnapshotBeforeNoRef.current = String(prevRs);
            }
            return { ...prev, Sort: next, SortLate: false, routeSort: "" };
          }
          if (nextLower === "yes") {
            const vendor = vendors.find((d) => d.fullName === prev.Name);
            let restored = routeSortSnapshotBeforeNoRef.current.trim();
            routeSortSnapshotBeforeNoRef.current = "";
            if (
              !restored &&
              vendor?.routeSortValue != null &&
              Number.isFinite(Number(vendor.routeSortValue))
            ) {
              restored = String(vendor.routeSortValue);
            }
            return { ...prev, Sort: next, routeSort: restored };
          }
          return { ...prev, Sort: next };
        }

        if (field === "Vehicle") {
          const selectedPlate = String(value ?? "");
          const normalizePlate = (x: string) => x.trim().toUpperCase();
          const selectedVehicle = vehicles.find(
            (v) => normalizePlate(String(v.registrationPlates ?? "")) === normalizePlate(selectedPlate)
          );
          return {
            ...prev,
            Vehicle: selectedPlate,
            vehicleId: selectedVehicle?.vehicleId ?? (selectedPlate === "NOVEHICLE" ? 55 : undefined),
          };
        }

        if (field === "Service Partner") {
          const spId = value != null && String(value).trim() !== "" ? Number(value) : null;
          return {
            ...prev,
            "Service Partner": value != null ? String(value) : "",
            servicePartnerId: spId != null && Number.isFinite(spId) && spId > 0 ? spId : null,
          };
        }

        return { ...prev, [field]: value };
      });
    },
    [
      vendors,
      vendorTypes,
      routes,
      vehicles,
      deposits,
      costModels,
      editingDailyId,
      isAdhocCategoryMode,
      operationsDataWithNotAllocated,
      selectedDate,
    ]
  );

  const handleNumericChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const mapFrontendToDailyCreateDTO = useCallback((): DailyOperationsManagementCreateDTO => {
    const operationDate = selectedDate;
    const vendor = vendors.find((d) => d.fullName === formData.Name);
    if (!vendor) throw new Error(`Vendor not found: ${formData.Name}`);
    const canonicalVendorId =
      vendor.userId != null && Number.isFinite(Number(vendor.userId)) && Number(vendor.userId) > 0
        ? Number(vendor.userId)
        : null;
    if (canonicalVendorId == null) {
      throw new Error(`Invalid vendor identifier for: ${formData.Name}`);
    }

    /** NotAllocated canónico (route 159/NALC, deposit 7, vehicle 55, costModel 9, sem ad-hoc); alinhado a NOT_ALLOCATED_DOM_PATCH. */
    if (formData.Status === "NotAllocated") {
      const createdBy = getUserIdFromToken();
      return {
        date: operationDate,
        userId: canonicalVendorId,
        ...getNotAllocatedDomPatch(nalcRouteId),
        notes: formData.Notes ? String(formData.Notes) : null,
        createdBy: createdBy ?? null,
      };
    }

    const statusKey = normalizeStatusKey(formData.Status);
    const isOffFields =
      isOffEditMode ||
      isDayOffCategoryMode ||
      statusKey === "off" ||
      String(formData.Route ?? "").trim().toUpperCase() === "OFF";

    const route = !isOffFields ? routes.find((r) => r.routeName === formData.Route) : undefined;
    const deposit =
      formData["Deposit Name"] ? deposits.find((d) => d.depositName === formData["Deposit Name"]) : undefined;

    const vehicleIdFromForm =
      (formData as FrontendOperationRecord & { vehicleId?: number | string | null }).vehicleId != null &&
      Number.isFinite(Number((formData as FrontendOperationRecord & { vehicleId?: number | string | null }).vehicleId))
        ? Number((formData as FrontendOperationRecord & { vehicleId?: number | string | null }).vehicleId)
        : undefined;

    const vehicle = (() => {
      if (!formData.Vehicle || formData.Vehicle === "NOVEHICLE") return undefined;
      const normalizePlate = (x: string) => x.trim().toUpperCase();
      return vehicles.find(
        (v) => normalizePlate(String(v.registrationPlates ?? "")) === normalizePlate(String(formData.Vehicle))
      );
    })();

    const paymentModeRaw = formData["Payment Mode"] ?? formData.paymentModeId;
    let costModelId =
      paymentModeRaw != null && String(paymentModeRaw).trim() !== "" ? Number(paymentModeRaw) : null;
    const isAdhocCreate = isAdhocCategoryMode && editingDailyId == null;
    if (isAdhocCreate) {
      costModelId = ADHOC_OPERATION_CREATE_DEFAULTS.costModelId;
    } else if (isOffFields) {
      costModelId = BUSINESS_RULES.COST_MODEL.OFF;
    } else if (!isOffFields && (!costModelId || !Number.isFinite(costModelId))) {
      throw new Error("Payment Mode is required.");
    }

    const adhocServiceRaw = formData.adhocServiceId ?? formData["AD-HOC Service"];
    const adhocServiceId =
      adhocServiceRaw != null && String(adhocServiceRaw).trim() !== "" ? Number(adhocServiceRaw) : null;

    const createdBy = getUserIdFromToken();

    const effectiveSortValue = (() => {
      // Em modo Adhoc, o campo Sort fica oculto na modal.
      // Regra: Adhoc criado por este fluxo deve sair com Sort "No".
      if (isAdhocCategoryMode) {
        return "No";
      }
      return formData.Sort;
    })();

    const sortLate = Boolean(formData.SortLate);
    const sortStr = String(effectiveSortValue ?? "").trim().toLowerCase();
    const isSortYes = sortStr === "yes";

    // routeSort: allow explicit numeric override from input; otherwise use DGP logic (Yes+Late=1, Yes+OnTime=20, No=0).
    const routeSort = (() => {
      const overrideRaw = (formData as FrontendOperationRecord).routeSort;
      if (overrideRaw != null && String(overrideRaw).trim() !== "") {
        const n = Number(overrideRaw);
        if (Number.isFinite(n)) return n;
      }
      if (isAdhocCategoryMode || sortStr === "" || sortStr === "no") return 0;
      if (!isSortYes) return 0;
      return sortLate ? 1 : 20;
    })();

    const isLateFromSort = isSortYes && sortLate;
    const isSortFlag = isAdhocCreate ? ADHOC_OPERATION_CREATE_DEFAULTS.isSort : isSortYes;

    const isOffEditPatch = isOffFields && isOffEditMode && editingDailyId != null;

    const effectiveRouteId = isOffFields
      ? BUSINESS_RULES.ROUTE.DAY_OFF
      : isAdhocCategoryMode
        ? BUSINESS_RULES.ROUTE.DHOC
        : route?.routeId ?? null;

    const effectiveVehicleId = isOffFields
      ? (isOffEditPatch ? (vehicleIdFromForm ?? vehicle?.vehicleId ?? DAY_OFF_VEHICLE_ID) : DAY_OFF_VEHICLE_ID)
      : (vehicleIdFromForm ?? vehicle?.vehicleId ?? 55);

    const daily: DailyOperationsManagementCreateDTO = {
      date: operationDate,
      userId: canonicalVendorId,
      modelEmployeesId: formData.modelEmployeesId ?? null,
      depositId: isOffFields ? BUSINESS_RULES.DEPOSIT.DAY_OFF : deposit?.depositId ?? (route?.depositId ?? null),
      routeId: effectiveRouteId,
      route: { routeId: effectiveRouteId },
      vehicleId: effectiveVehicleId,
      vehicle: { vehicleId: effectiveVehicleId },
      costModelId,
      rate: isAdhocCreate ? ADHOC_OPERATION_CREATE_DEFAULTS.rate : toOptionalRate(formData.Rate),
      routeCost: 0,
      routeSort: routeSort,
      adhocSort:
        formData["AD-HOC Sort"] != null &&
          String(formData["AD-HOC Sort"]).trim() !== "" &&
          Number.isFinite(Number(formData["AD-HOC Sort"]))
          ? Number(formData["AD-HOC Sort"])
          : 0,
      extra: extraToNumeric10_2(formData.Extras) ?? 0,
      adhocServiceId,
      isSort: isSortFlag,
      isDayOff: isOffFields ? !isOffEditPatch : false,
      isLate: isLateFromSort,
      isVanHome: false,
      vendorRequestId: null,
      status:
        isOffFields
          ? BUSINESS_RULES.WORKING_STATUS.OFF
          : formData.Status === "NotAllocated"
            ? "NotAllocated"
            : "Working",
      reason: null,
      notes: formData.Notes ? String(formData.Notes) : null,
      daily_game_plan_operationId: null,
      servicePartnerId: formData.servicePartnerId != null && Number.isFinite(Number(formData.servicePartnerId)) && Number(formData.servicePartnerId) > 0
        ? Number(formData.servicePartnerId)
        : null,
      createdBy: createdBy ?? null,
    };

    return daily;
  }, [formData, vendors, routes, vehicles, deposits, selectedDate, isAdhocCategoryMode, editingDailyId, isOffEditMode, isDayOffCategoryMode, nalcRouteId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.Name || !formData.Status) {
        alert("Please fill in required fields.");
        return;
      }

      // Working: a rota do formulário resolve routeId/deposit na API. Off/NotAllocated usam payloads fixos ou endpoint day-off.
      if (formData.Status === "Working" && !String(formData.Route ?? "").trim()) {
        alert("Route is required when Status is Working.");
        return;
      }

      if (isAdhocCategoryMode && !formData.adhocServiceId && !formData["AD-HOC Service"]) {
        alert("Please select an AD-HOC Service.");
        return;
      }

      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;
      setIsSubmitting(true);
      try {
        const payload = mapFrontendToDailyCreateDTO();

        if (editingDailyId) {
          // Regra de negócio:
          // Se o usuário trocar o vendor/vendod (Name) do item editado e o vendor antigo
          // não tiver nenhum outro item no dia, criar automaticamente um NotAllocated
          // para o vendor antigo.
          const editingItem = operationsDataWithNotAllocated.find(
            (x) => x.dailyOperationsManagementId === editingDailyId,
          );
          const oldUserId = editingItem?.userId ?? undefined;
          const newUserId = payload.userId ?? undefined;
          // Só criar NotAllocated para o vendor antigo se, neste dia, ele não tiver mais nenhuma linha
          // (qualquer status: Working, Off, NotAllocated, sintético, etc.), além da que está a ser editada.
          const hasAnyOtherRowForOldVendorThatDay = operationsDataWithNotAllocated.some((x) => {
            if (x.dailyOperationsManagementId === editingDailyId) return false;
            return x.userId === oldUserId;
          });
          const shouldCreateNotAllocated =
            oldUserId != null &&
            oldUserId > 0 &&
            newUserId != null &&
            newUserId > 0 &&
            oldUserId !== newUserId &&
            !hasAnyOtherRowForOldVendorThatDay;

          const updatePayload: DailyOperationsManagementUpdateDTO = payload;
          await updateDailyOperationsManagement(editingDailyId, updatePayload);

          if (shouldCreateNotAllocated) {
            const notAllocatedPayload = buildNotAllocatedPayloadForReplacedVendor(payload.date, oldUserId, nalcRouteId);

            // Task 3.4 — Mover Detecção de Duplicatas para o Backend
            // Removemos a verificação existingNotAllocated e chamamos o POST diretamente.
            // O backend retornará 409 se já existir, que o try-catch geral tratará.
            try {
              await createDailyOperationsManagement(notAllocatedPayload);
            } catch (err) {
              console.warn('[handleSave] Failed to create NotAllocated for old vendor:', err);
              // Ignoramos se for 409 (duplicata já prevenida) para não bloquear o fluxo principal 
              // (o motorista principal já foi atualizado com sucesso no updateDailyOperationsManagement acima)
            }
          }
        } else {
          if (isDayOffCategoryMode && payload.userId != null && payload.userId > 0) {
            await createDailyOperationsManagementDayOff({
              userId: payload.userId,
              date: payload.date,
            });
          } else {
            await createDailyOperationsManagement(payload);
          }
        }

        setShowModal(false);
        resetForm();
        setIsAdhocCategoryMode(false);
        setIsOffEditMode(false);
        await reload();
      } catch (err: unknown) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to save record.");
      } finally {
        submitInFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      editingDailyId,
      mapFrontendToDailyCreateDTO,
      reload,
      resetForm,
      isDayOffCategoryMode,
      formData,
      isAdhocCategoryMode,
      operationsDataWithNotAllocated,
      nalcRouteId,
    ]
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setIsSubmitting(false);
    submitInFlightRef.current = false;
    resetForm();
    setIsDayOffCategoryMode(false);
    setIsAdhocCategoryMode(false);
    setIsOffEditMode(false);
    isAutoLinkedRef.current = false;
  }, [resetForm]);


  type DepositBlock = { key: string; label: string; rows: FrontendOperationRecord[] };

  const renderDepositBlockSection = (block: DepositBlock, opts?: { submittedTotalCount?: number }) => {
    const isSubmitted = block.key === "__submitted";
    const totalSubmitted = opts?.submittedTotalCount;
    const showSubmittedFilteredEmpty =
      isSubmitted && block.rows.length === 0 && totalSubmitted != null && totalSubmitted > 0;
    const isCollapsed = collapsedBlocks.has(block.key);
    /** Blocos típicos por depósito (exclui Day off, Not allocated e Submitted). */
    const isDepositWarehouseBlock =
      block.key !== "__submitted" &&
      block.key !== BUSINESS_RULES.WORKING_STATUS.OFF &&
      block.key !== BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;

    // Função para ordenar dados baseado em sortConfig
    const applySort = (rows: FrontendOperationRecord[]): FrontendOperationRecord[] => {
      const fieldName = headerToFieldMap[sortConfig.key] || sortConfig.key;
      return [...rows].sort((a, b) => {
        const aValue = String(a[fieldName as keyof FrontendOperationRecord] ?? "").trim();
        const bValue = String(b[fieldName as keyof FrontendOperationRecord] ?? "").trim();
        const cmp = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    };

    const mainRows = applySort(
      isDepositWarehouseBlock
        ? block.rows.filter((r) => !domRowHasAdhocService(r))
        : block.rows
    );

    const adhocRows =
      isSubmitted || !isDepositWarehouseBlock
        ? []
        : applySort(block.rows.filter(domRowHasAdhocService));
    return (
      <section key={block.key} className={weekPlannerOperationsStyles.depotBlock}>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleBlockCollapsed(block.key)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white/60 hover:bg-white transition-all"
              aria-label={isCollapsed ? "Expand block" : "Collapse block"}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <span className="text-slate-600 text-lg leading-none">{isCollapsed ? "▸" : "▾"}</span>
            </button>

            <div className="min-w-0">
              <span className="truncate">{block.label}</span>
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({block.rows.length} {block.rows.length === 1 ? "record" : "records"})
              </span>
            </div>
          </div>

          {!isCollapsed && !isSubmitted && block.key !== BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED ? (
            <button
              type="button"
              disabled={block.rows.length === 0}
              onClick={() => {
                const eligibleItems = block.rows.filter((r) => isEligibleForValidation(r));
                const allSelected =
                  eligibleItems.length > 0 &&
                  eligibleItems.every((r) => validatedKeys.has(getDailyValidationKey(r)));
                handleToggleSelectAllInBlock(block.rows, !allSelected);
              }}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-sm transition-all"
              title={block.rows.length === 0 ? "No records" : "Toggle select all"}
            >
              {(() => {
                const eligibleItems = block.rows.filter((r) => isEligibleForValidation(r));
                const allSelected =
                  eligibleItems.length > 0 &&
                  eligibleItems.every((r) => validatedKeys.has(getDailyValidationKey(r)));
                return allSelected ? "Unselect All" : "Select All";
              })()}
            </button>
          ) : null}
        </h2>

        {!isCollapsed ? (
          <>
            <OperationsTable
              headers={
                block.key === BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED
                  ? TABLE_HEADERS_NOT_ALLOCATED
                  : block.key === "__submitted"
                    ? TABLE_HEADERS_SUBMITTED
                    : TABLE_HEADERS
              }
              loading={false}
              error={null}
              showEmptyState={showSubmittedFilteredEmpty}
              selectedDate={selectedDate}
              weekPlannersCount={
                showSubmittedFilteredEmpty && totalSubmitted != null
                  ? totalSubmitted
                  : mainRows.length
              }
              data={mainRows}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEdit={(item) => {
                handleEdit(item);
              }}
              onDelete={handleDelete}
              pagination={{ currentPage: 1, totalPages: 1, totalItems: mainRows.length }}
              showPagination={false}
              onOpenRateDetails={handleOpenRateDetails}
              shouldShowRateDetailsIcon={isBandedCostModelRow}
              validatedKeys={validatedKeys}
              getItemKey={getDailyValidationKey}
              onToggleValidated={handleToggleDailyItemValidated}
              showActionsColumn={block.key !== BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED}
            />
            {adhocRows.length > 0 ? (
              <div className="mt-6 space-y-2">
                <h3 className="text-base font-semibold text-slate-700">AD-HOC</h3>
                <OperationsTable
                  headers={TABLE_HEADERS_ADHOC}
                  loading={false}
                  error={null}
                  showEmptyState={false}
                  selectedDate={selectedDate}
                  weekPlannersCount={adhocRows.length}
                  data={adhocRows}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onEdit={(item) => handleEdit(item)}
                  onDelete={handleDelete}
                  pagination={{ currentPage: 1, totalPages: 1, totalItems: adhocRows.length }}
                  showPagination={false}
                  onOpenRateDetails={handleOpenRateDetails}
                  shouldShowRateDetailsIcon={isBandedCostModelRow}
                  validatedKeys={validatedKeys}
                  getItemKey={getDailyValidationKey}
                  onToggleValidated={handleToggleDailyItemValidated}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    );
  };

  return (
    <NavbarWrapper>
      <DgpPageFrame maxWidthClassName="w-full max-w-full" containerClassName="w-full px-0">
        <div className="w-full px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
          <OperationsHeaderControls
            selectedDate={selectedDate}
            onDateChange={(d) => setSelectedDate(d)}
            onAddNew={handleOpenCreate}
            onAddAdhocService={handleOpenCreateAdhocService}
            onAddDayOff={handleOpenCreateDayOff}
            operationsData={filteredOperationsData}
          />

          <OperationsFiltersBar
            searchTerm={searchTerm}
            onSearchChange={(v) => setSearchTerm(v)}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => setFilterStatus(v)}
            filterVendorType={filterVendorType}
            onFilterVendorTypeChange={(v) => setFilterVendorType(v)}
            statusOptions={uniqueStatuses}
            vendorTypeOptions={uniqueVendorTypes}
            filterServicePartnerId={filterServicePartnerId}
            onFilterServicePartnerIdChange={setFilterServicePartnerId}
            servicePartners={servicePartners}
          />

          {error && (
            <div className={weekPlannerOperationsStyles.tableErrorContainer}>
              <p className={weekPlannerOperationsStyles.tableErrorTitle}>Error:</p>
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className={weekPlannerOperationsStyles.tableLoadingContainer}>
              <div className={weekPlannerOperationsStyles.tableLoadingSpinner} />
              <p className={weekPlannerOperationsStyles.tableLoadingText}>Loading daily operations...</p>
            </div>
          )}

          {!loading && !error && !hasAnyVisibleRows && (
            <div className={weekPlannerOperationsStyles.tableEmptyContainer}>
              <p className={weekPlannerOperationsStyles.tableEmptyTitle}>No data</p>
              <p className={weekPlannerOperationsStyles.tableEmptyText}>
                No records for the selected date ({selectedDate}).
              </p>
            </div>
          )}

          {!loading && !error && filteredForMain.length > 0 && (
            <div className="space-y-6">
              {dataByDepositSections.mainBlocks.map((block) => renderDepositBlockSection(block))}
            </div>
          )}

          {!loading && !error && hasAnyVisibleRows && (
            <div className={weekPlannerOperationsStyles.reviewButtonContainer}>
              <button
                type="button"
                onClick={handleBatchSubmit}
                disabled={isBatchSubmitting || validatedKeys.size === 0}
                className={weekPlannerOperationsStyles.reviewButtonActive}
                title="Submit selected records (bulk create operations)."
              >
                {isBatchSubmitting ? (
                  <span className={weekPlannerOperationsStyles.modalButtonSpinner} />
                ) : null}
                Submit
              </button>
            </div>
          )}

          {!loading && !error && dataByDepositSections.submittedBlock ? (
            <div className="mt-10 pt-8 border-t-2 border-slate-200">
              <div
                className={weekPlannerOperationsStyles.filtersBar}
                data-animate="fade-in-up"
              >
                <div className={weekPlannerOperationsStyles.filtersSearchGroup}>
                  <label htmlFor="submitted-search" className={weekPlannerOperationsStyles.filtersLabel}>
                    Search (Submitted)
                  </label>
                  <input
                    type="text"
                    id="submitted-search"
                    value={submittedSearchTerm}
                    onChange={(e) => setSubmittedSearchTerm(e.target.value)}
                    placeholder="Vendor, route, vehicle, deposit, notes…"
                    className={weekPlannerOperationsStyles.filtersInput}
                  />
                </div>
                <div>
                  <label htmlFor="submitted-kind" className={weekPlannerOperationsStyles.filtersLabel}>
                    Record type
                  </label>
                  <select
                    id="submitted-kind"
                    value={submittedKindFilter}
                    onChange={(e) => setSubmittedKindFilter(e.target.value)}
                    className={weekPlannerOperationsStyles.filtersSelect}
                  >
                    <option value="all">All</option>
                    <option value="dayoff">Day off</option>
                    <option value="notallocated">Not allocated</option>
                    <option value="routes">Routes</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="submitted-vendor-type" className={weekPlannerOperationsStyles.filtersLabel}>
                    Vendor type
                  </label>
                  <select
                    id="submitted-vendor-type"
                    value={submittedFilterVendorType}
                    onChange={(e) => setSubmittedFilterVendorType(e.target.value)}
                    className={weekPlannerOperationsStyles.filtersSelect}
                  >
                    <option value="all">All</option>
                    {uniqueVendorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {submittedBlockForDisplay ? (
                renderDepositBlockSection(submittedBlockForDisplay, {
                  submittedTotalCount: dataByDepositSections.submittedBlock.rows.length,
                })
              ) : null}
            </div>
          ) : null}

          <RateBandsModal
            open={showRateDetailsModal}
            onOpenChange={setShowRateDetailsModal}
            loading={rateDetailsLoading}
            error={rateDetailsError}
            data={rateDetailsData}
          />

          <OperationsFormModal
            open={showModal}
            editing={editingDailyId != null}
            omitStatusAndDeposit
            showDayOffCategory={isDayOffCategoryMode}
            showAdhocCategory={isAdhocCategoryMode}
            showOffEditCategory={isOffEditMode}
            suppressInlineAdhocFieldsInSortRow
            formData={formData}
            vendors={vendors}
            sortedRoutes={sortedRoutes}
            vehicles={vehicles}
            costModels={costModels}
            vendorTypes={vendorTypes}
            adhocServices={adhocServices}
            deposits={deposits}
            servicePartners={servicePartners}
            isSubmitting={isSubmitting}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            onChange={handleInputChange}
            onNumericChange={handleNumericChange}
          />

          <DeleteConfirmModal
            show={showDeleteModal}
            item={itemToDelete}
            logicalDeleteOnly={
              itemToDelete
                ? countRealDomRowsForVendorOnDate(
                  operationsDataWithNotAllocated,
                  resolveVendorIdForDomItem(itemToDelete, vendors),
                  normalizeDate(String(itemToDelete.Date ?? selectedDate)),
                ) <= 1
                : false
            }
            onClose={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }
            }}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />

          <BulkSubmitWarningModal
            open={bulkSubmitWarningMessage != null}
            message={bulkSubmitWarningMessage ?? ""}
            onClose={() => setBulkSubmitWarningMessage(null)}
          />
        </div>
      </DgpPageFrame>
    </NavbarWrapper>
  );
}





