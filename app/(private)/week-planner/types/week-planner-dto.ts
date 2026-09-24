export interface WeekPlannerRouteNestedDTO {
  routeId?: number;
  routeName?: string;
  depositId?: number | null;
  depositName?: string | null;
  isFlex?: boolean;
}

export interface WeekPlannerCostModelNestedDTO {
  costModelId?: number;
  costModelName?: string;
}

export interface WeekPlannerVehicleNestedDTO {
  vehicleId?: number;
  vehicleModel?: string;
  vehicleRegistrationPlate?: string;
}

export interface WeekPlannerVendorTypeNestedDTO {
  vendorTypeId?: number;
  vendorTypeDescription?: string;
}

export interface WeekPlannerAdhocServiceNestedDTO {
  adhocServiceId?: number;
  adhocName?: string;
  adhocReceivedPayment?: number;
  adhocVendorPayment?: number;
  isAdhocSort?: boolean;
}

export interface WeekPlannerListDTO {
  weekPlannerId: number;
  date: string;
  userId: number;
  fullName?: string | null;
  route: WeekPlannerRouteNestedDTO;
  vehicle: WeekPlannerVehicleNestedDTO;
  adhocService?: WeekPlannerAdhocServiceNestedDTO;
  isDayOff: boolean;
  isSort: boolean;
  vendorRequestId: number | null;
  status: string;
  reason: string | null;
  notes: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WeekPlannerCreateDTO {
  date: string;
  userId: number;
  depositId?: number | null;
  routeId: number | null;
  vehicleId: number | null;
  costModelId?: number | null;
  adhocServiceId?: number | null;
  adhocSort?: number | null;
  isSort?: boolean;
  isDayOff: boolean;
  vendorRequestId?: number | null;
  status: string;
  reason?: string | null;
  notes?: string | null;
  createdBy?: number | null;
}

export interface WeekPlannerUpdateDTO {
  date?: string;
  userId?: number;
  depositId?: number | null;
  routeId?: number | null;
  vehicleId?: number | null;
  costModelId?: number | null;
  vendorTypeId?: number | null;
  adhocServiceId?: number | null;
  isSort?: boolean;
  isDayOff?: boolean;
  vendorRequestId?: number | null;
  status?: string;
  reason?: string | null;
  notes?: string | null;
  createdBy?: number | null;
}

export type WeekPlannerDetailDTO = WeekPlannerListDTO;

export interface WeekPlannerBulkCreateDTO {
  weekPlanners: WeekPlannerCreateDTO[];
}

export interface WeekPlannerFiltersDTO {
  date?: string;
  page?: number;
  limit?: number;
  search?: string; // busca por status/reason/notes
  isDayOff?: boolean;
  status?: string;
}

export interface WeekPlannerPaginatedResponseDTO {
  data: WeekPlannerListDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface WeekPlannerBooleanOptionDTO {
  value: boolean;
  label: string;
}

export interface WeekPlannerStatusOptionDTO {
  value: string;
  label: string;
}

export interface WeekPlannerTypesDTO {
  isDayOffOptions: WeekPlannerBooleanOptionDTO[];
  statuses: WeekPlannerStatusOptionDTO[];
}

export interface WeekPlannerBulkFinishDTO {
  weekPlannerIds: number[];
}

/** Apenas campos da tabela week_planner (sem JOINs) */
export interface WeekPlannerRowDTO {
  weekPlannerId: number;
  date: string;
  userId: number | null;
  depositId: number | null;
  routeId: number | null;
  vehicleId: number | null;
  adhocServiceId: number | null;
  isSort: boolean | null;
  isDayOff: boolean;
  vendorRequestId: number | null;
  status: string;
  reason: string | null;
  notes: string | null;
  createdBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WeekPlannerBulkDeleteDTO {
  weekPlannerIds: number[];
}

export interface ManagementTeamFunctionDTO {
  managementTeamFunctionId: number;
  functionName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  depositId: number | null;
  userId: number | null;
}

export interface DailyTeamSupportCreateDTO {
  date: string;
  description?: string;
  userId: number;
  depositId?: number;
  createdBy: number;
  managementTeamFunctionId?: number | null;
}

export interface DailyTeamSupportBulkItemsRequestDTO {
  items: DailyTeamSupportCreateDTO[];
}

export interface DailyTeamSupportDTO {
  dailyTeamSupportId: number;
  date: string;
  description?: string;
  userId?: number;
  fullName?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  depositId?: number | null;
  managementTeamFunctionId?: number | null;
}
