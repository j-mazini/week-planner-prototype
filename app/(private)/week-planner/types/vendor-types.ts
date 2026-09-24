/**
 * Types for NewUserByAdminDTO from GET /vendor endpoint
 */

export interface CostModelEmployeeDTO {
  modelEmployeesId: number;
  minStops?: number;
  maxStops?: number;
  fixedPrice?: number;
  pricePerStop?: number;
  description?: string;
  costModelId?: number;
  validityStartDate?: string;
  validityEndDate?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  userCostModelId?: number;
}

export interface VendorTrainingDTO {
  vendorTrainingId: number;
  completedDate?: string;
  userId: number;
  trainingId: number;
}

export interface NewUserByAdminDTO {
  userId: number;
  userCode?: string;
  depositId?: number;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  vendorTypeId?: number;
  userTypeId?: number;
  vatNumber?: string;
  companyId: number;
  servicePartnerId?: number | null;
  street?: string;
  city?: string;
  postalCode?: string;
  mainAddress?: boolean;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  routeId?: number;
  vehicleId?: number;
  routeSortValue?: number;
  costModelId?: number;
  dhlTraining?: number;
  criminalRecordDate?: string;
  visaValidity?: string;
  dvlaCheckDate?: string;
  drivingLicenceExpiryDate?: string;
  imigrationStatus?: string;
  passportExpireDate?: string;
  isFirstLogin?: boolean;
  costModels?: CostModelEmployeeDTO[];
  training?: VendorTrainingDTO[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
