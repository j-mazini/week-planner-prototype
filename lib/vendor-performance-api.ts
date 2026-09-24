import { hasAuthSession, getBearerAuthHeader } from "./auth";
import { getApiBaseUrl } from "./apiBaseUrl";

export interface DailyPerformanceData {
  day: number;
  dayOfWeek: number;
  route: string;
  stops: number | string;
  sporH: string;
  tw: string; // Worked hours (route hours), despite the name — see header label "HR RTE"
  rtw: string; // Route Time Window percentage (route_time_windows.percentage_ot_tw_dl)
  spr: number | string;
  /** "NN%" or "N/A" — pré-computado backend-side (PerformanceCalculationService), média do dia. */
  afd?: string;
  // Attempted Failed Deliveries
  nr?: number;
  fp?: number;
  ba?: number;
  nh?: number;
  sup?: number;
  cm?: number;
  ca?: number;
  // Successful Stops
  pu?: number;
  ok?: number;
  hn?: number;
  pd?: number;
  // Time details for TW tooltip
  workedHours?: number | string;
  departTime?: string;
  arriveTime?: string;
}

// OverviewDTO interface for daily-overview/all endpoint
export interface OverviewDTO {
  operationId: number;          // ID da operação
  operationDate: string;        // Data da operação no formato YYYY-MM-DD
  operationCostModel: number;   // ID do modelo de custo da operação
  costModelName: string;        // Nome do modelo de custo
  status: string;                // Status da operação (e.g., "Completed")
  note: string;
  userId?: number;              // ID do usuário (opcional, usado em getAllDailyOverviewList)
  fullName?: string;            // Nome completo do usuário (name + lastName, usado em getAllDailyOverviewList)
  dailyCash: {                  // Dados financeiros diários
    rate: number;              // Taxa diária
    dailyServiceCharge: number; // Cobrança de serviço diário
    extra: number;             // Valor extra
    adhocSort: number;        // Ordenação adhoc
    routeSort: number;        // Ordenação da rota
  };
  route: {                       // Dados da rota
    routeId: number;          // ID da rota
    routeName: string;        // Nome da rota
  };
  timeWindows: {                // Dados sobre pontualidade
    percentageOnTime: number; // Percentual de entregas no horário
  };
  vehicle: {
    vehicleId: number;
    vehicleModel: string;
    vehicleRegistrationPlate: string;
  };
  deliveryDetails: {            // Detalhes de entrega
    totalAfd: number;         // Total de entregas não pagas
    paidStops: {              // Paradas pagas
      pu: number;            // Paradas PU
      ok: number;            // Paradas OK
      hn: number;            // Paradas HN
      pd: number;            // Paradas PD
    };
    unpaidStops: {            // Paradas não pagas
      nr: number;            // Paradas NR
      fp: number;            // Paradas FP
      rd: number;            // Paradas RD
      ba: number;            // Paradas BA
      nh: number;            // Paradas NH
      cm: number;            // Paradas CM
      ca: number;            // Paradas CA
    };
    departTime: string;       // Hora de saída no formato HH:MM:SS
    arriveTime: string;       // Hora de chegada no formato HH:MM:SS
  };
  dailyMetrics: {               // Métricas diárias
    totalStops: number;       // Total de paradas
    sporh: number;             // Paradas por hora (Stops Per Hour)
    breakMinutes: number;     // Minutos de pausa
  };
  costModel: {                  // Modelo de custo do motorista
    costModelId: number;      // ID do modelo de custo
    costModelName: string;    // Nome do modelo de custo
    minStops: number;         // Número mínimo de paradas
    maxStops: number;         // Número máximo de paradas
    fixedPrice: number;       // Preço fixo
    pricePerStop: number;     // Preço por parada
  }[];
  is_spms: boolean;            // Indicador se existe operation-adjustment (SPMS)
  // Campos de performance pré-computados pelo backend (PerformanceCalculationService),
  // presentes quando o endpoint suporta ?metrics=performance
  sporh?: number;
  spr?: number;
  afd?: number;
  twPercentage?: number;
}

/**
 * Busca todos os overviews diários para um mês/ano específico
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Promise com array de OverviewDTO
 */
export interface VendorOverviewData {
  fullName: string;
  email?: string;
  operations: Array<{
    operationId: number;
    userId: number;
    date: string;
    dateName?: string;
    routeId: number;
    routeName: string;
    totalStops: number;
    sporh: number;
    percentageOnTime: number;
    [key: string]: unknown;
  }>;
}

export interface DailyOverviewAllResponse {
  vendors: VendorOverviewData[];
}

export const fetchDailyOverviewAll = async (
  month: number,
  year: number
): Promise<DailyOverviewAllResponse | OverviewDTO[] | unknown> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const API_BASE_URL = getApiBaseUrl();
    const url = `${API_BASE_URL}/bff/daily-overview/all/${month}/${year}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getBearerAuthHeader(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Daily overview all endpoint not found');
        return { vendors: [] };
      }
      throw new Error(`Failed to fetch daily overview all: ${response.statusText}`);
    }

    const data = await response.json();
    let result: DailyOverviewAllResponse | OverviewDTO[] | unknown;
    // Handle both array format and object with vendors property
    if (Array.isArray(data)) {
      result = data;
    } else if (data && typeof data === 'object' && 'vendors' in data) {
      result = data as DailyOverviewAllResponse;
    } else {
      result = { vendors: [] };
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'Failed to fetch' || message.includes('fetch')) {
      throw new Error('Unable to connect to the API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.');
    }
    console.error("Error fetching daily overview all:", error);
    throw error;
  }
};

/**
 * Per-vendor summary item from GET /bff/daily-overview/summary/:month/:year (or the same
 * endpoint scoped to a single vendor via ?userId=). Already computed backend-side by
 * PerformanceCalculationService — no client math needed.
 */
export interface ProcessedVendorSummary {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  avgTw?: string | number;
  avgSpr?: string | number;
  avgSporH?: string | number;
  avgAfd?: string | number;
}

/**
 * Month-wide aggregate (all vendors combined) from GET /bff/daily-overview/summary/:month/:year.
 * Computed backend-side with the same daily-then-average methodology used per vendor —
 * not a client-side average of each vendor's own average.
 */
export interface OverallPerformanceSummary {
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
  avgAfd: string;
  totalVendors: number;
}

const EMPTY_OVERALL_SUMMARY: OverallPerformanceSummary = {
  avgTw: '--:--',
  avgSpr: '--:--',
  avgSporH: '--:--',
  avgAfd: '--:--',
  totalVendors: 0,
};

export const fetchDailyOverviewSummary = async (
  month: number,
  year: number
): Promise<{ vendors: ProcessedVendorSummary[]; overall: OverallPerformanceSummary }> => {
  if (!hasAuthSession()) throw new Error("No authentication token available");
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/bff/daily-overview/summary/${month}/${year}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...getBearerAuthHeader() },
  });
  if (!res.ok) {
    if (res.status === 404) return { vendors: [], overall: EMPTY_OVERALL_SUMMARY };
    throw new Error(`Failed to fetch summary: ${res.statusText}`);
  }
  const data = await res.json();
  return {
    vendors: data?.vendors ?? [],
    overall: data?.overall ?? EMPTY_OVERALL_SUMMARY,
  };
};

/**
 * Interface para a resposta da API daily-overview/list
 */
export interface DailyOverviewListResponse {
  currentMonth: {
    name: string;
    /** Médias do mês para este vendor — pré-computadas pelo backend (PerformanceCalculationService). */
    avgTw?: string;
    avgSpr?: string;
    avgSporH?: string;
    avgAfd?: string;
    daysWorked: number;
    totalAmount: string | number;
    averagePerDay: string | number;
  };
  dailyEarnings: Array<{
    date: string;
    dateName?: string;
    amount: string | number;
    /** Agregado do dia pré-computado pelo backend (PerformanceCalculationService) — mesma
     * razão ponderada usada no resumo mensal, não uma média simples das operações do dia. */
    dailySpr?: number;
    dailySporH?: number;
    dailyTwPercentage?: number;
    dailyAfd?: number;
    operations: Array<{
      operationId: number;
      routeId: number;
      routeName: string;
      amountTotal: string | number;
      totalStops: number;
      totalPaidStops: number;
      totalUnpaidStops: number;
      paidStops: {
        pu: number;
        ok: number;
        hn: number;
        pd: number;
      };
      unpaidStops: {
        nr: number;
        fp: number;
        rd: number;
        ba: number;
        nh: number;
        cm: number;
        ca: number;
      };
      vehicle: {
        vehicleId: number;
        vehicleModel: string;
        vehicleRegistrationPlate: string;
      };
      departTime: string | null;
      arriveTime: string | null;
      workedHours: number | null;
      breakMinutes: number;
      rate: number;
      extra: number;
      adhocSort: number;
      routeSort: number;
      dailyServiceCharge: number;
      operationCostModel: number;
      costModelName: string;
      status: string;
      note: string;
      sporh: number;
      /** Pré-computados pelo backend via PerformanceCalculationService. */
      spr?: number;
      afd?: number;
      twPercentage?: number;
      percentageOnTime: number;
      /** route_time_windows.early_dl / ot_dl / late_dl — raw counts behind percentageOnTime. */
      earlyDl?: number | null;
      otDl?: number | null;
      lateDl?: number | null;
      is_spms: boolean;
    }>;
  }>;
}

/**
 * Busca lista de daily overview para um usuário específico
 * @param userId - ID do usuário
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Promise com objeto contendo currentMonth e dailyEarnings
 */
export const fetchDailyOverviewList = async (
  userId: number,
  month: number,
  year: number
): Promise<DailyOverviewListResponse | null> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const baseUrl = getApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/bff/daily-overview/list/${userId}/${month}/${year}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Daily overview list endpoint not found');
        return null;
      }
      throw new Error(`Failed to fetch daily overview list: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DailyOverviewListResponse;
  } catch (error) {
    console.error("Error fetching daily overview list:", error);
    return null;
  }
};

/**
 * Exporta os dados de daily overview para um arquivo Excel/CSV
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Promise<void>
 */
export const exportDailyOverviewAll = async (
  month: number,
  year: number
): Promise<void> => {
  try {
    if (!hasAuthSession()) {
      throw new Error("No authentication token available");
    }

    const baseUrl = getApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/bff/daily-overview/all/${month}/${year}/export`,
      {
        method: 'GET',
        headers: {
          ...getBearerAuthHeader(),
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Export endpoint not found');
      }
      throw new Error(`Failed to export daily overview: ${response.statusText}`);
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `daily-overview-${year}-${String(month).padStart(2, '0')}.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error exporting daily overview:", error);
    throw error;
  }
};



