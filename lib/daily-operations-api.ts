import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { api } from "./api-client";

const API_BASE_URL = getApiBaseUrl();

export interface DailyOperationsReportDTO {
  operationId: number;
  operationDate: string;
  routeName: string;
  courierName: string;
  vrn: string;
  percentageOtTwDl: number | null;
  departTime: string | null;
  arriveTime: string | null;
  totalWorkHours: number | null;
  breakMinutes: number | null;
  totalStops: number | null;
  note: string | null;
  /**
   * BAE-649: para operação adhoc/BAOP (sem rota) o backend resolve o depósito pelo campo
   * legado `operations_management.depot`, então este campo vem preenchido mesmo sem rota.
   */
  depositName: string | null;
  depositId: number | null;
  calculatedWorkHours: string | null;
  isSpms: boolean;
  loopName?: string | null;
  loop?: string | null;
  loopCode?: string | null;
  /** Route sort (Sort = y when truthy) */
  routeSort?: number | string | null;
  /**
   * Sort flag. Para operação com rota vem de `operations_management.is_sort`;
   * para adhoc vem de `adhoc_services.is_adhoc_sort`, que pode ser null
   * ("não informado" ≠ "não é sort" — ver BAE-610).
   */
  isSort?: boolean | null;
  /** Preenchido quando a operação é adhoc; nesse caso `routeName` traz o nome do serviço adhoc. */
  adhocServiceId?: number | null;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface DailyOperationsPaginatedResponseDTO {
  data: DailyOperationsReportDTO[];
  pagination: PaginationState;
}

/**
 * Busca relatórios de operações diárias do backend por range de datas
 * @param initialDate - Initial date in YYYY-MM-DD format
 * @param finalDate - Final date in YYYY-MM-DD format
 * @param depositId - Deposit ID (optional)
 * @param serviceTypeId - Service type ID (optional)
 * @param forceRefresh - Força atualização do cache (opcional)
 * @returns Promise com array de relatórios
 */
export const fetchDailyOperationsReports = async (
  initialDate: string,
  finalDate: string,
  depositId?: number,
  serviceTypeId?: number,
  forceRefresh?: boolean
): Promise<DailyOperationsReportDTO[]> => {
  try {
    const data = await api.get<DailyOperationsReportDTO[]>("/bff/reports/by-date-range", {
      params: {
        initialDate,
        finalDate,
        depositId,
        serviceTypeId,
        forceRefresh: forceRefresh ? "true" : undefined,
      },
      cache: "no-store",
    });

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching daily operations reports:", error);
    throw error;
  }
};


/**
 * Busca relatórios de operações diárias do backend por range de datas com paginação
 * @param initialDate - Initial date in YYYY-MM-DD format
 * @param finalDate - Final date in YYYY-MM-DD format
 * @param page - Número da página (padrão: 1)
 * @param pageSize - Itens por página (padrão: 10)
 * @param depositId - Deposit ID (optional)
 * @param serviceTypeId - Service type ID (optional)
 * @param forceRefresh - Força atualização do cache (opcional)
 * @param registrationPlate - Placa do veículo para busca (opcional)
 * @param routeName - Nome da rota para busca (opcional)
 * @param vendorName - Nome do vendor para busca (opcional)
 * @returns Promise com dados paginados
 */
export const fetchDailyOperationsReportsPaginated = async (
  initialDate: string,
  finalDate: string,
  page: number = 1,
  pageSize: number = 10,
  depositId?: number,
  serviceTypeId?: number,
  forceRefresh?: boolean,
  registrationPlate?: string,
  routeName?: string,
  vendorName?: string
): Promise<DailyOperationsPaginatedResponseDTO> => {
  try {
    const data = await api.get<DailyOperationsPaginatedResponseDTO | DailyOperationsReportDTO[]>("/bff/reports/daily-operations-insights", {
      params: {
        initialDate,
        finalDate,
        currentPage: page,
        totalItensPerPage: pageSize,
        depositId: depositId && depositId !== 0 ? depositId : undefined,
        serviceTypeId: serviceTypeId && serviceTypeId !== 0 ? serviceTypeId : undefined,
        forceRefresh: forceRefresh ? "true" : undefined,
        registration_plate: registrationPlate || undefined,
        route_name: routeName || undefined,
        vendorName: vendorName || undefined,
      },
      cache: "no-store",
    });

    if (!Array.isArray(data) && data.data && data.pagination) {
      return data;
    }
    
    return {
      data: Array.isArray(data) ? data : [],
      pagination: {
        currentPage: page,
        totalPages: 1,
        totalItems: Array.isArray(data) ? data.length : 0,
        itemsPerPage: pageSize
      }
    };
  } catch (error) {
    console.error("Error fetching daily operations reports:", error);
    throw error;
  }
};

/**
 * Busca todos os relatórios de operações diárias com filtros aplicados (sem paginação)
 * Faz múltiplas chamadas paginadas até obter todos os registros
 * @param initialDate - Initial date in YYYY-MM-DD format
 * @param finalDate - Final date in YYYY-MM-DD format
 * @param depositId - Deposit ID (optional)
 * @param serviceTypeId - Service type ID (optional)
 * @param forceRefresh - Força atualização do cache (opcional)
 * @param registrationPlate - Placa do veículo para busca (opcional)
 * @param routeName - Nome da rota para busca (opcional)
 * @param vendorName - Nome do vendor para busca (opcional)
 * @returns Promise com array de todos os relatórios
 */
export const fetchAllDailyOperationsReportsWithFilters = async (
  initialDate: string,
  finalDate: string,
  depositId?: number,
  serviceTypeIds?: number[],
  forceRefresh?: boolean,
  registrationPlate?: string,
  routeName?: string,
  vendorName?: string
): Promise<DailyOperationsReportDTO[]> => {
  try {
    const allReports: DailyOperationsReportDTO[] = [];
    let currentPage = 1;
    const itemsPerPage = 100;
    let hasMorePages = true;

    while (hasMorePages) {
      const data = await api.get<DailyOperationsPaginatedResponseDTO | DailyOperationsReportDTO[]>("/bff/reports/daily-operations-insights", {
        params: {
          initialDate,
          finalDate,
          currentPage,
          totalItensPerPage: itemsPerPage,
          depositId: depositId && depositId !== 0 ? depositId : undefined,
          forceRefresh: forceRefresh ? "true" : undefined,
          registration_plate: registrationPlate || undefined,
          route_name: routeName || undefined,
          vendorName: vendorName || undefined,
          // Note: Handle multiple serviceTypeIds if needed by API
        },
        cache: "no-store"
      });

      if (!Array.isArray(data) && data.data && data.pagination) {
        allReports.push(...data.data);
        hasMorePages = currentPage < data.pagination.totalPages;
        currentPage++;
      } else {
        allReports.push(...(Array.isArray(data) ? data : []));
        hasMorePages = false;
      }
    }

    return allReports;
  } catch (error) {
    console.error("Error fetching all daily operations reports:", error);
    throw error;
  }
};

/**
 * Downloads report in XLSX format by date range
 * @param initialDate - Initial date in YYYY-MM-DD format
 * @param finalDate - Final date in YYYY-MM-DD format
 * @param depositId - Deposit ID (optional)
 * @param serviceTypeId - Service type ID (optional)
 * @param reportType - Report type: 'operations' or 'financial' (default: 'operations')
 */
export const downloadDailyOperationsReport = async (
  initialDate: string,
  finalDate: string,
  depositId?: number,
  serviceTypeId?: number,
  reportType: 'operations' | 'financial' = 'operations'
): Promise<void> => {
  try {
    const params: Record<string, unknown> = {
      initialDate,
      finalDate,
      reportType,
      depositId: depositId,
      serviceTypeId: serviceTypeId,
    };

    const response = await fetch(`${API_BASE_URL}/bff/reports/download/by-date-range?${new URLSearchParams(params as Record<string, string>).toString()}`, {
      method: "GET",
      credentials: "include", // Manual fetch here to handle blob
    });

    if (!response.ok) {
      throw new Error(`Failed to download report (${response.status})`);
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `daily-operations-reports-${initialDate}-to-${finalDate}.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading daily operations report:", error);
    throw error;
  }
};


