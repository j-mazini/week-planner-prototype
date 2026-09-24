/**
 * Daily Game Plan – API layer
 */
import { api } from '@/lib/api-client';
import type { FrontendOperationRecord } from './types';
import type { WeekPlannerRecord as ContextWeekPlannerRecord } from '@/app/(private)/week-planner/contexts/PlannerContext';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

export interface WeekPlannerRecord extends ContextWeekPlannerRecord {
  raw: Record<string, unknown>;
}

// Daily Game Plan DTOs
export interface DailyGamePlanDTO {
  dailyGamePlanId?: number;
  depositId?: number;
  dailyTeamSupportId?: number;
  date?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyGamePlanWithSupportDTO {
  dailyGamePlanId?: number;
  depositId?: number;
  dailyTeamSupport?: {
    dailyTeamSupportId?: number;
    userId?: number;
    fullName?: string;
    depositId?: number;
  };
  date?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyGamePlanCreateDTO {
  depositId?: number;
  dailyTeamSupportId?: number;
  date?: string;
  status?: string;
}

export interface DailyGamePlanUpdateDTO {
  depositId?: number;
  dailyTeamSupportId?: number;
  date?: string;
  status?: string;
  notes?: string;
}

export interface DailyTeamSupportLastSevenItemDTO {
  dailyTeamSupport: {
    dailyTeamSupportId: number;
    date: string;
    description?: string;
    userId?: number;
    depositId?: number;
  };
  dailyGamePlan?: {
    dailyGamePlanId?: number;
    depositId?: number;
    dailyTeamSupportId?: number;
    status?: string;
    date?: string;
    notes?: string;
  };
}

export interface StartOperationRequest {
  depositId: number;
  depositName: string;
  date: string;
  operations: Array<{
    weekPlannerId?: number;
    route: string;
    vendor: string;
    vehicle: string;
    rate?: number;
    sort?: string;
    status: string;
    notes?: string;
    departTime?: string;
    returnTime?: string;
  }>;
}

export interface StopOperationRequest {
  depositId: number;
  depositName: string;
  date: string;
  operations: Array<{
    weekPlannerId?: number;
    operationId?: number;
    route: string;
    vendor: string;
    vehicle: string;
    rate?: number;
    sort?: string;
    status: string;
    notes?: string;
    departTime?: string;
    returnTime?: string;
  }>;
}

/** Status helpers */
export const normalizeDailyGamePlanStatus = (status?: string): string => {
  if (!status) return BUSINESS_RULES.WORKING_STATUS.WORKING;
  const s = status.trim().toLowerCase();
  if (s === 'off' || s === 'inactive') return BUSINESS_RULES.WORKING_STATUS.OFF;
  if (isDailyGamePlanOpNotAllocatedStatus(status)) return BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED;
  return BUSINESS_RULES.WORKING_STATUS.WORKING;
};

export const isDailyGamePlanOpNotAllocatedStatus = (status?: string | null): boolean => {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return (
    s === 'notallocated' ||
    s === 'not_allocated' ||
    s === 'not allocated' ||
    s === 'none' ||
    s === 'null' ||
    s === 'not_started' ||
    s === 'pending'
  );
};

export type DailySupervisorCheckRecord = {
  date: string;
  depositId: number;
  depositName?: string;
  supervisorId?: number;
  supervisorName?: string;
};

/**
 * Busca o supervisor responsável por depósito em uma data.
 */
export const fetchDailySupervisorCheck = async (
  date: string
): Promise<DailySupervisorCheckRecord[]> => {
  try {
    const raw = await api.get<unknown>(`/bff/daily-team-support?date=${encodeURIComponent(date)}`);
    const arr: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : ((raw as { data?: Record<string, unknown>[] } | null | undefined)?.data || []);
    return arr
      .map((r) => ({
        date: String(r.date ?? date),
        depositId: Number(r.depositId ?? 0),
        depositName: r.depositName as string,
        supervisorId: Number(r.supervisorId ?? 0) || undefined,
        supervisorName: r.supervisorName as string,
      }))
      .filter((r) => !!r.date && r.depositId > 0);
  } catch (error) {
    console.error("Error fetching daily supervisor check:", error);
    throw error;
  }
};

/**
 * Busca os últimos 7 registros de daily_team_support por supervisor.
 */
export const fetchDailyTeamSupportLastSevenByUser = async (
  userId: number
): Promise<DailyTeamSupportLastSevenItemDTO[]> => {
  try {
    return await api.get<DailyTeamSupportLastSevenItemDTO[]>(`/bff/daily-team-support/last-7/user/${userId}`);
  } catch (error) {
    console.error("Error fetching last seven daily team support:", error);
    throw error;
  }
};

/** GET /bff/daily-game-plan/by-date/:date — planos por dia (resposta camelCase via api-client). */
export const fetchDailyGamePlansByDate = async (
  date: string
): Promise<DailyGamePlanWithSupportDTO[]> => {
  try {
    const raw = await api.get<unknown>(
      `/bff/daily-game-plan/by-date/${encodeURIComponent(date)}`
    );
    if (Array.isArray(raw)) return raw as DailyGamePlanWithSupportDTO[];
    if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      return (raw as { data: DailyGamePlanWithSupportDTO[] }).data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching daily game plans by date:", error);
    throw error;
  }
};

/**
 * Para a operação do dia e envia dados para Daily Operations Management
 */
export const stopOperation = async (
  operationsPayload: unknown[]
): Promise<void> => {
  if (!Array.isArray(operationsPayload) || operationsPayload.length === 0) return;
  try {
    await api.post("/bff/operations/from-week-planners", { data: operationsPayload });
  } catch (error) {
    console.error("Failed to stop operation:", error);
    throw error;
  }
};

/**
 * Converte FrontendOperationRecord para o formato de StartOperationRequest
 */
export const mapToStartOperationRequest = (
  depositId: number,
  depositName: string,
  date: string,
  operations: FrontendOperationRecord[]
): StartOperationRequest => {
  return {
    depositId,
    depositName,
    date,
    operations: operations.map(op => ({
      weekPlannerId: op.weekPlannerId,
      route: op.route || '',
      vendor: op.name || '',
      vehicle: op.vehicle || 'NOVEHICLE',
      rate: Number(op.rate) || 0,
      sort: op.sort || 'No',
      status: op.status || BUSINESS_RULES.WORKING_STATUS.WORKING,
      notes: op.notes || '',
      departTime: op.departTime,
      returnTime: op.returnTime,
    })),
  };
};

/**
 * Faz o bulk-approve de múltiplos week-planners
 */
export const bulkApproveWeekPlanners = async (
  weekPlannerIds: number[]
): Promise<void> => {
  if (!Array.isArray(weekPlannerIds) || weekPlannerIds.length === 0) return;
  try {
    await api.patch("/bff/week-planners/bulk-approve", weekPlannerIds);
  } catch (error) {
    console.error("Error bulk approving week planners:", error);
    throw error;
  }
};

/**
 * Daily Game Plan Operation DTO
 */
export interface DailyGamePlanOperationRouteNestedDTO {
  routeId?: number;
  routeName?: string;
  depositId?: number | null;
  depositName?: string | null;
  isFlex?: boolean;
}

export interface DailyGamePlanOperationVehicleNestedDTO {
  vehicleId?: number;
  vehicleModel?: string;
  vehicleRegistrationPlate?: string;
}

export interface DailyGamePlanOperationAdhocServiceNestedDTO {
  adhocServiceId?: number;
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
}

export interface DailyGamePlanOperationDTO {
  dailyGamePlanOperationId: number;
  userId?: number | null;
  fullName?: string | null;
  depositId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  costModelId?: number | null;
  adhocServiceId?: number | null;
  routeName?: string | null;
  paymentMode?: string | null;
  rate?: number | null;
  routeCost?: number | null;
  routeSort?: number | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  weekPlannerId?: number | null;
  date: string;
  createdBy?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  route?: DailyGamePlanOperationRouteNestedDTO;
  vehicle?: DailyGamePlanOperationVehicleNestedDTO;
  adhocService?: DailyGamePlanOperationAdhocServiceNestedDTO | null;
}

export interface DailyGamePlanOperationCreateDTO {
  userId?: number | null;
  depositId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  costModelId?: number | null;
  modelEmployeesId?: number | null;
  rate?: number | null;
  routeSort?: number | null;
  adhocServiceId?: number | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  weekPlannerId?: number | null;
  date: string;
  createdBy?: number | string | null;
}

export interface DailyOperationsManagementBulkCreateFromFinishedDTO {
  items: DailyOperationsManagementBulkCreateItemDTO[];
}

export interface DailyOperationsManagementBulkCreateItemDTO {
  dailyGamePlanOperationId: number;
  userId?: number | null;
  modelEmployeesId?: number | null;
  depositId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  rate?: number | null;
  routeCost?: number | null;
  routeSort?: number | null;
  adhocSort?: number | null;
  extra?: number | null;
  route: DailyOperationsManagementBulkItemRouteDTO;
  vehicle: DailyOperationsManagementBulkItemVehicleDTO;
  adhocService?: DailyOperationsManagementBulkItemAdhocServiceDTO | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  weekPlannerId?: number | null;
  date: string;
  createdBy?: number | null;
}

export interface DailyOperationsManagementBulkItemRouteDTO {
  routeId?: number;
  routeName?: string;
  depositId?: number | null;
  depositName?: string | null;
  isFlex?: boolean;
}

export interface DailyOperationsManagementBulkItemVehicleDTO {
  vehicleId?: number;
  vehicleModel?: string;
  vehicleRegistrationPlate?: string;
}

export interface DailyOperationsManagementBulkItemAdhocServiceDTO {
  adhocServiceId?: number;
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
}

export interface DailyGamePlanOperationUpdateDTO {
  userId?: number | null;
  modelEmployeesId?: number | null;
  depositId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  costModelId?: number | null;
  rate?: number | null;
  routeSort?: number | null;
  adhocServiceId?: number | null;
  isSort?: boolean | null;
  isDayOff?: boolean | null;
  isLate?: boolean | null;
  isVanHome?: boolean | null;
  vendorRequestId?: number | null;
  status?: string | null;
  reason?: string | null;
  notes?: string | null;
  weekPlannerId?: number | null;
  date?: string;
  createdBy?: number | string | null;
}

export interface DailyGamePlanOperationFiltersDTO {
  startDate?: string;
  endDate?: string;
  date?: string;
  userId?: number;
  depositId?: number;
  routeId?: number;
  vehicleId?: number;
  status?: string;
  isDayOff?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export const fetchDailyGamePlanOperations = async (
  filters: DailyGamePlanOperationFiltersDTO = {}
): Promise<DailyGamePlanOperationDTO[]> => {
  try {
    return await api.get<DailyGamePlanOperationDTO[]>("/bff/daily-game-plan-operations", { params: filters });
  } catch (error) {
    console.error("Error fetching daily game plan operations:", error);
    throw error;
  }
};

export const createDailyGamePlanOperation = async (
  data: DailyGamePlanOperationCreateDTO
): Promise<DailyGamePlanOperationDTO> => {
  try {
    return await api.post<DailyGamePlanOperationDTO>("/bff/daily-game-plan-operations", data);
  } catch (error) {
    console.error("Error creating daily game plan operation:", error);
    throw error;
  }
};

export const updateDailyGamePlanOperation = async (
  id: number,
  data: DailyGamePlanOperationUpdateDTO
): Promise<DailyGamePlanOperationDTO> => {
  try {
    return await api.patch<DailyGamePlanOperationDTO>(`/bff/daily-game-plan-operations/${id}`, data);
  } catch (error) {
    console.error("Error updating daily game plan operation:", error);
    throw error;
  }
};

export const deleteDailyGamePlanOperation = async (id: number): Promise<void> => {
  try {
    await api.delete(`/bff/daily-game-plan-operations/${id}`);
  } catch (error) {
    console.error("Error deleting daily game plan operation:", error);
    throw error;
  }
};

export const stopDailyGamePlanOperation = async (id: number): Promise<void> => {
  try {
    await api.post(`/bff/daily-game-plan-operations/${id}/stop`);
  } catch (error) {
    console.error("Error stopping operation:", error);
    throw error;
  }
};

export const bulkFinishDailyGamePlanOperations = async (
  payload: DailyOperationsManagementBulkCreateFromFinishedDTO
): Promise<void> => {
  try {
    await api.post('/bff/daily-operations-management/bulk', payload);
  } catch (error) {
    console.error("Error finishing operations (bulk management):", error);
    throw error;
  }
};

/** GET operações marcadas como day-off para uma data (resposta camelCase via api-client). */
export const fetchDailyGamePlanOperationsDayOff = async (
  date: string
): Promise<DailyGamePlanOperationDTO[]> => {
  return fetchDailyGamePlanOperations({ date, isDayOff: true });
};

/** PATCH /bff/daily-game-plan/:id — status do plano (start / finished, notas, etc.). */
export const updateDailyGamePlan = async (
  id: number,
  data: DailyGamePlanUpdateDTO
): Promise<DailyGamePlanWithSupportDTO> => {
  return await api.patch<DailyGamePlanWithSupportDTO>(`/bff/daily-game-plan/${id}`, data);
};

/** POST transição de estado da operação DGP (ex.: move_to_not_allocated). */
export const transitionDailyGamePlanOperation = async (
  id: number,
  action: string
): Promise<DailyGamePlanOperationDTO> => {
  return await api.post<DailyGamePlanOperationDTO>(
    `/bff/daily-game-plan-operations/${id}/transition`,
    { action }
  );
};


export const bulkCreateDailyGamePlanOperations = async (
  payload: DailyOperationsManagementBulkCreateFromFinishedDTO
): Promise<void> => {
  if (!payload.items || payload.items.length === 0) return;
  await bulkFinishDailyGamePlanOperations(payload);
};

export const bulkDayOffDailyOperationsManagement = async (
  items: Partial<DailyGamePlanOperationDTO>[]
): Promise<{ success: boolean; created: number }> => {
  try {
    const result = await api.post<{ created?: number } | undefined>("/bff/daily-operations-management/day-off/bulk", { items });
    return {
      success: true,
      created: result?.created || items.length,
    };
  } catch (error) {
    console.error("Error bulk day-off management:", error);
    throw error;
  }
};