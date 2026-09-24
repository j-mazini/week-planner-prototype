export interface WeekPlannerRouteNestedDTO {
  routeId?: number;
  routeName?: string;
  depositId?: number;
  depositName?: string;
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
  adhocReceivedPayment?: number | string;
  adhocVendorPayment?: number | string;
}

export interface WeekPlannerListDTO {
  weekPlannerId: number;
  date: string;
  routeId?: number;
  route: WeekPlannerRouteNestedDTO;
  userId: number;
  fullName: string;
  costModelId?: number;
  costModel: WeekPlannerCostModelNestedDTO;
  rate?: number;
  routeCost?: number;
  routeSort?: number;
  adhocSort?: number;
  extra?: number;
  notes?: string;
  vehicleId?: number;
  vehicle: WeekPlannerVehicleNestedDTO;
  vendorTypeId?: number;
  vendorType: WeekPlannerVendorTypeNestedDTO;
  status?: string;
  isDayOff: boolean;
  operationId?: number | null;
  isSort?: boolean;
  adhocServiceId?: number;
  adhocService?: WeekPlannerAdhocServiceNestedDTO;
  depositId?: number;
  depositName?: string;
  reason?: string;
  isApproved?: boolean;
  vendorRequestId?: number | null;
  isFinished?: boolean;
  isSupervisor?: boolean;
  createdBy?: string | number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WeekPlannerCreateDTO {
  date: string;
  routeId: number;
  userId: number;
  costModelId: number;
  rate?: number;
  routeCost?: number;
  routeSort?: number;
  adhocSort?: number;
  extra?: number;
  notes?: string;
  vehicleId: number;
  vendorTypeId?: number;
  status?: string;
  isDayOff?: boolean;
  operationId?: number;
  isSort?: boolean;
  adhocServiceId?: number;
  depositId?: number;
  depositName?: string;
  reason?: string;
  isApproved?: boolean;
  vendorRequestId?: number | null;
  isFinished?: boolean;
  isSupervisor?: boolean;
}

export interface WeekPlannerUpdateDTO {
  date?: string;
  routeId?: number;
  userId?: number;
  costModelId?: number;
  rate?: number;
  routeCost?: number;
  routeSort?: number;
  adhocSort?: number;
  extra?: number;
  notes?: string;
  vehicleId?: number;
  vendorTypeId?: number;
  status?: string;
  isDayOff?: boolean;
  operationId?: number;
  isSort?: boolean;
  adhocServiceId?: number;
  depositId?: number;
  depositName?: string;
  reason?: string;
  isApproved?: boolean;
  vendorRequestId?: number | null;
  isFinished?: boolean;
  isSupervisor?: boolean;
}

export interface WeekPlannerDetailDTO extends WeekPlannerListDTO {
  vendorName?: string;
  vehicleRegistration?: string;
  routeName?: string;
  costModelName?: string;
}

export interface WeekPlannerBulkCreateDTO {
  weekPlanners: WeekPlannerCreateDTO[];
}

export interface WeekPlannerToOperationDTO {
  weekPlannerId?: number;
  date: string;
  route: {
    routeId?: number;
    routeName?: string;
  };
  userId: number;
  costModel: {
    costModelId?: number;
    costModelName?: string;
  };
  vehicle: {
    vehicleId?: number;
    vehicleModel?: string;
  };
  rate?: number;
  routeCost?: number;
  routeSort?: number;
  adhocSort?: number;
  extra?: number;
  notes?: string;
  status?: string;
  isDayOff?: boolean;
  depositId?: number;
  depositName?: string;
  adhocServiceId?: number;
}

export interface WeekPlannerFiltersDTO {
  date?: string;
  page?: number;
  limit?: number;
  search?: string; // busca por Name, Route, Vehicle Model, Vehicle Registration Plate
  isDayOff?: boolean;
  status?: string;
  vendorType?: string;
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

export interface WeekPlannerStatusDTO {
  value: boolean;
  label: string;
}

export interface WeekPlannerVendorTypeDTO {
  value: string;
  label: string;
}

export interface WeekPlannerOperationStatusDTO {
  value: string;
  label: string;
}

export interface WeekPlannerTypesDTO {
  isDayOffOptions: WeekPlannerStatusDTO[];
  vendorTypes: WeekPlannerVendorTypeDTO[];
  statuses: WeekPlannerOperationStatusDTO[];
}

