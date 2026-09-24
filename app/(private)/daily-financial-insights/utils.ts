import type { AdhocServiceDTO } from '@/lib/adhoc-services-api';
import type { Vendor } from '@/lib/vendors';
import { InsightRow, PaymentMode, ReportDTO, RowTotals } from './types';
import { FilterState } from './types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number | null | undefined): string {
  return `£${((value || 0)).toFixed(2)}`;
}

/**
 * Formata data para API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata data para exibição
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '--';

  // extract date part if it contains time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  const datePart = dateString.split('T')[0];

  // Parse the date part (YYYY-MM-DD)
  const [year, month, day] = datePart.split('-').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return datePart; // Return as-is if parsing fails
  }

  // Create date object and format
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short'
  });
};

/**
 * Calcula totais de uma linha
 */
export const calculateRow = (row: InsightRow): RowTotals => {
  // Use pre-calculated values from ReportDTO if available
  if (row.total !== undefined && row.avgPerStop !== undefined) {
    return { total: row.total, avgPerStop: row.avgPerStop };
  }

  // Otherwise, calculate manually
  const rate = row.rate ?? 0;
  const stops = row.stops ?? 0;
  const sort = row.sort ?? 0;
  const adhoc = row.adhoc ?? 0;
  const extras = row.extras ?? 0;

  // DR e cost model 1: rate + sort + adhoc + extras
  // FSR e VSR: rate * stops + sort + adhoc + extras
  const total = (row.paymentMode === 'DR' || row.paymentMode === '1')
    ? rate + sort + adhoc + extras
    : rate * stops + sort + adhoc + extras;
  const avgPerStop = stops > 0 ? total / stops : 0;

  return { total, avgPerStop };
};

/**
 * Mapeia ReportDTO para InsightRow
 */
export const mapOperationToInsightRow = (report: ReportDTO): InsightRow => {
  const rawInvoice =
    report.invoiceId ??
    (report as ReportDTO & { invoiceId?: number | null }).invoiceId;
  // Determine payment mode from operationCostModel
  // 1 = (cost model 1), 2 = DR, 3 = FSR, 4 = VSR, 7 = Hourly, 12 = SP_VSR
  let paymentMode: PaymentMode = 'FSR'; // default
  if (report.operationCostModel === 1) {
    paymentMode = '1'; // Cost model 1
  } else if (report.operationCostModel === 2) {
    paymentMode = 'DR';
  } else if (report.operationCostModel === 3) {
    paymentMode = 'FSR';
  } else if (report.operationCostModel === 4) {
    paymentMode = 'VSR';
  } else if (report.operationCostModel === 7) {
    paymentMode = '7'; // Hourly
  } else if (report.operationCostModel === 12) {
    paymentMode = 'SP_VSR';
  } else if (report.operationCostModel === BUSINESS_RULES.COST_MODEL.OFF) {
    paymentMode = 'OFF';
  }

  // Parse numeric values from strings
  let rate = report.rate ? parseFloat(report.rate) : 0;
  const parsedStops = report.totalStops != null ? parseInt(String(report.totalStops)) : NaN;
  const stops = isNaN(parsedStops) ? null : parsedStops;
  const sort = report.routeSort ? parseFloat(report.routeSort) : null;
  const adhoc = report.adhocSort ? parseFloat(report.adhocSort) : null;
  const extras = report.extra ? parseFloat(report.extra) : null;

  // For VSR/SP_VSR/FSR, if rate is 0, try to get it from costModel
  if ((paymentMode === 'VSR' || paymentMode === 'SP_VSR' || paymentMode === 'FSR') && rate === 0 && report.costModel && report.costModel.length > 0) {
    const matchingCostModel = report.costModel.find(cm => {
      if (paymentMode === 'VSR' && cm.costModelId === 4) return true;
      if (paymentMode === 'SP_VSR' && cm.costModelId === 12) return true;
      if (paymentMode === 'FSR' && cm.costModelId === 3) return true;
      return false;
    });

    if (matchingCostModel) {
      // FSR (costModelId 3): backend uses fixedPrice per stop (total = totalStops * fixedPrice)
      if (paymentMode === 'FSR' && matchingCostModel.costModelId === 3) {
        const value = matchingCostModel.fixedPrice ?? matchingCostModel.pricePerStop ?? 0;
        if (value > 0) rate = value;
      }
      // VSR (costModelId 4): bands use pricePerStop
      else if (paymentMode === 'VSR' && (matchingCostModel.pricePerStop ?? 0) > 0) {
        rate = matchingCostModel.pricePerStop!;
      }
      // SP_VSR (costModelId 12): bands use pricePerStop
      else if (paymentMode === 'SP_VSR' && (matchingCostModel.pricePerStop ?? 0) > 0) {
        rate = matchingCostModel.pricePerStop!;
      }
    }
  }

  // If still 0 and we have dailyServiceCharge and stops, calculate rate per stop
  if ((paymentMode === 'VSR' || paymentMode === 'SP_VSR' || paymentMode === 'FSR') && rate === 0 && stops && stops > 0) {
    const dailyServiceCharge = report.dailyServiceCharge ? parseFloat(report.dailyServiceCharge) : 0;
    if (dailyServiceCharge > 0) {
      rate = dailyServiceCharge / stops;
    }
  }

  // extract date from operationDate (format: "2025-11-28T03:00:00.000Z")
  const dateStr = report.operationDate ? report.operationDate.split('T')[0] : '';

  const camel = report as ReportDTO & { adhocServiceId?: number | null };
  const nested = report.adhocService;
  const nestedAdhocId =
    nested && typeof nested === 'object' && nested.adhocServiceId != null
      ? Number(nested.adhocServiceId)
      : undefined;
  const rawAdhocServiceId =
    report.adhocServiceId ?? camel.adhocServiceId ?? nestedAdhocId;
  const adhocServiceId =
    rawAdhocServiceId != null && Number.isFinite(Number(rawAdhocServiceId))
      ? Number(rawAdhocServiceId)
      : null;

  return {
    date: dateStr,
    depot: report.depositName || '',
    vrm: report.vrn || '',
    courier: report.courierName || '',
    route: report.routeName || '',
    paymentMode,
    rate,
    stops,
    sort,
    adhoc,
    extras,
    notes: report.note || '',
    status: (report.status === 'Completed' || report.status === 'Working') ? 'Green' : undefined,
    operationId: report.operationId,
    invoiceId: rawInvoice ?? null,
    userId: report.userId,
    routeId: report.routeId,
    vehicleId: report.vehicleId,
    adhocServiceId,
    totalPaidStops: report.totalPaidStops,
    total: report.total,
    avgPerStop: report.avgPerStops,
    costModel: report.costModel,
    isSpms: report.isSpms,
  };
};

const nearlyEqualMoney = (a: number, b: number, eps = 0.005): boolean =>
  Math.abs(a - b) <= eps;

/**
 * Valor do `<select>` AD-HOC Service: id no relatório ou match por `adhocSort` ≈ `adhocVendorPayment`.
 */
export const resolveAdhocServiceSelectValue = (
  row: InsightRow,
  services: AdhocServiceDTO[] | undefined
): string => {
  const list = services ?? [];

  if (row.adhocServiceId != null && Number.isFinite(Number(row.adhocServiceId))) {
    return String(Number(row.adhocServiceId));
  }

  const adhocAmount = row.adhoc;
  if (adhocAmount != null && Number.isFinite(Number(adhocAmount)) && list.length > 0) {
    const amount = Number(adhocAmount);
    const match = list.find((s) => {
      const vp = s.adhocVendorPayment;
      if (vp == null) return false;
      const n = typeof vp === 'number' ? vp : Number(String(vp));
      return Number.isFinite(n) && nearlyEqualMoney(n, amount);
    });
    if (match) return String(match.adhocServiceId);
  }

  return '';
};

/** Texto do campo somente-leitura Adhoc Value (prefere pagamento do serviço selecionado). */
export const adhocVendorPaymentDisplay = (
  row: InsightRow,
  serviceIdStr: string,
  services: AdhocServiceDTO[] | undefined
): string => {
  if (serviceIdStr && services?.length) {
    const svc = services.find((s) => String(s.adhocServiceId) === serviceIdStr);
    if (svc?.adhocVendorPayment != null) {
      const n =
        typeof svc.adhocVendorPayment === 'number'
          ? svc.adhocVendorPayment
          : Number(String(svc.adhocVendorPayment));
      if (Number.isFinite(n)) return String(n);
    }
  }
  if (row.adhoc != null && Number.isFinite(Number(row.adhoc))) return String(row.adhoc);
  return '';
};

/** Editar/apagar via `/bff/operations/:id` só quando não há fatura ligada. */
export const canEditOrDeleteOperationRow = (row: InsightRow): boolean => {
  if (row.operationId == null || !Number.isFinite(Number(row.operationId))) return false;
  return row.invoiceId == null;
};

/**
 * Valor do `<select>` Vendor no modal: precisa ser idêntico a `vendor.fullName` de alguma option.
 */
export const resolveVendorSelectValue = (row: InsightRow, vendors: Vendor[] | undefined): string => {
  const list = vendors ?? [];
  if (row.userId != null && Number.isFinite(Number(row.userId))) {
    const byId = list.find((d) => Number(d.userId) === Number(row.userId));
    if (byId?.fullName) return byId.fullName;
  }

  const courier = (row.courier ?? '').trim();
  if (!courier) return '';

  const exact = list.find((d) => (d.fullName ?? '').trim() === courier);
  if (exact?.fullName) return exact.fullName;

  const lower = courier.toLowerCase();
  const ci = list.find((d) => (d.fullName ?? '').trim().toLowerCase() === lower);
  if (ci?.fullName) return ci.fullName;

  return courier;
};

/**
 * Calcula total de paid stops
 */
export const calculateTotalPaidStops = (row: InsightRow): number => {
  // Use pre-calculated value from ReportDTO if available
  if (row.totalPaidStops !== undefined) {
    return row.totalPaidStops;
  }

  // Otherwise, calculate manually (fallback)
  // DR e cost model 1: retorna stops
  // FSR e VSR: retorna stops + rate (não faz sentido, mas mantém compatibilidade)
  if (row.paymentMode === 'DR' || row.paymentMode === '1') {
    return row.stops || 0;
  }
  return (row.stops || 0) + (row.rate || 0);
};

/**
 * Códigos de paymentMode (forma string) usados pelo backend e UI.
 * Mantém paridade com BUSINESS_RULES.COST_MODEL mas no formato string que chega no payload.
 */
export const PAYMENT_MODE = Object.freeze({
  /** DAF — backend envia operationCostModel=1 traduzido para string '1' */
  DAF: '1',
  DR: 'DR',
  FSR: 'FSR',
  VSR: 'VSR',
  /** SP_VSR — Service Partner Variable Service Rate (costModelId 12, 4 faixas de stops) */
  SP_VSR: 'SP_VSR',
  /** Hourly Rate — costModelId 7 */
  HOURLY: '7',
  OFF: 'OFF',
} as const);

/** Modelos de custo com bandas/faixas (cost model array por operação) */
export const BANDED_PAYMENT_MODES = Object.freeze([
  PAYMENT_MODE.FSR,
  PAYMENT_MODE.VSR,
  PAYMENT_MODE.SP_VSR,
  PAYMENT_MODE.DAF,
] as const);

export const isBandedPaymentMode = (paymentMode: string | null | undefined): boolean =>
  BANDED_PAYMENT_MODES.includes(paymentMode as typeof BANDED_PAYMENT_MODES[number]);

export const isDafPaymentMode = (paymentMode: string | null | undefined): boolean =>
  paymentMode === PAYMENT_MODE.DAF;

/**
 * True quando o payment mode representa um item OFF (folga). Reconhece tanto o ID numérico
 * (COST_MODEL.OFF) quanto a string 'OFF'. Em itens OFF não há operação, então as colunas
 * financeiras devem exibir "-".
 */
export const isOffPaymentMode = (paymentMode: string | null | undefined): boolean =>
  getCostModelIdFromPaymentMode(String(paymentMode ?? '').trim()) === BUSINESS_RULES.COST_MODEL.OFF;

/**
 * Deriva o preço unitário (fixedPrice para FSR, pricePerStop para VSR/DAF) do array de
 * cost models de uma operação. Centraliza o lookup para evitar IDs mágicos espalhados.
 */
export const getFixedPriceByMode = (
  costModel: InsightRow['costModel'] | undefined,
  paymentMode: string | null | undefined,
): number | null => {
  if (!costModel || costModel.length === 0) return null;

  switch (paymentMode) {
    case PAYMENT_MODE.FSR: {
      const cm = costModel.find(c => c.costModelId === BUSINESS_RULES.COST_MODEL.FSR);
      return cm?.fixedPrice ?? null;
    }
    case PAYMENT_MODE.VSR: {
      const cm = costModel.find(c => c.costModelId === BUSINESS_RULES.COST_MODEL.VSR);
      return cm?.pricePerStop ?? null;
    }
    case PAYMENT_MODE.SP_VSR: {
      const cm = costModel.find(c => c.costModelId === BUSINESS_RULES.COST_MODEL.SP_VSR);
      return cm?.pricePerStop ?? null;
    }
    case PAYMENT_MODE.DAF: {
      const cm = costModel.find(c => c.costModelId === BUSINESS_RULES.COST_MODEL.DAF);
      return cm?.pricePerStop ?? null;
    }
    default:
      return null;
  }
};

/**
 * Mapeia payment mode para costModelId
 */
export const getCostModelIdFromPaymentMode = (paymentMode: string): number => {
  const normalized = String(paymentMode ?? '').trim().toUpperCase();

  // Numeric values coming from API/UI
  if (/^\d+$/.test(normalized)) {
    const id = Number(normalized);
    if (
      id === BUSINESS_RULES.COST_MODEL.DAF ||
      id === BUSINESS_RULES.COST_MODEL.DR ||
      id === BUSINESS_RULES.COST_MODEL.FSR ||
      id === BUSINESS_RULES.COST_MODEL.VSR ||
      id === BUSINESS_RULES.COST_MODEL.SP_VSR ||
      id === BUSINESS_RULES.COST_MODEL.HOURLY_RATE ||
      id === BUSINESS_RULES.COST_MODEL.OFF
    ) {
      return id;
    }
  }

  switch (normalized) {
    case 'DAF':
      return BUSINESS_RULES.COST_MODEL.DAF;
    case 'DR':
      return BUSINESS_RULES.COST_MODEL.DR;
    case 'FSR':
      return BUSINESS_RULES.COST_MODEL.FSR;
    case 'VSR':
      return BUSINESS_RULES.COST_MODEL.VSR;
    case 'SP_VSR':
      return BUSINESS_RULES.COST_MODEL.SP_VSR;
    case '7':
    case 'HOURLY':
    case 'HOURLY RATE':
      return BUSINESS_RULES.COST_MODEL.HOURLY_RATE;
    case 'OFF':
      return BUSINESS_RULES.COST_MODEL.OFF;
    default:
      return BUSINESS_RULES.COST_MODEL.FSR;
  }
};

/**
 * extrai loop prefix da rota (ex: 'DY1' de 'DY1A')
 */
export const extractLoopPrefix = (route: string): string => {
  if (!route) return '';
  const match = route.match(/^([A-Z]+[0-9]+)/);
  return match ? match[1] : '';
};

/**
 * Verifica se a rota é FLEX
 */
export const isFlexRoute = (route: string | null | undefined): boolean => {
  return route ? route.toUpperCase().includes('FLEX') : false;
};

/**
 * extrai loop da rota (ex: 'DY1' de 'DY1A' ou 'Flex DY1A')
 * Remove o prefixo "Flex " se existir antes de extrair o loop
 */
export const extractLoop = (route: string | null | undefined): string => {
  if (!route) return '';
  // Remove o prefixo "Flex " se existir
  const cleanedRoute = route.replace(/^Flex\s+/i, '');
  const match = cleanedRoute.match(/^([A-Z]{2}\d+)/);
  return match ? match[1] : '';
};

/**
 * Inicializa filtros com data de hoje
 */
export const getInitialFilters = (): FilterState => {
  const today = new Date();
  const dateFrom = formatDateForAPI(today);

  return {
    depot: 'All',
    loop: 'All',
    search: '',
    dateFrom,
    // dateTo vazio => modo "dia" (finalDate = dateFrom). Ao selecionar a data da direita, vira período.
    dateTo: '',
    payment: 'All'
  };
};



