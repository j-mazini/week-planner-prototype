export type ModalMode = 'add' | 'edit';

export interface Vehicle {
  id: number;
  vrn: string;
  vin: string;
  brand: string;
  model: string;
  registrationDate: string;
  fuelType: string;
  status: string;
  color: string;
  department?: string;
  primaryVendor?: string;
  currentMileage: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  wrappedVehicle?: boolean;
  painted?: boolean;
  slamLock?: boolean;
  camera?: boolean;
  gps?: boolean;
  bulkhead?: boolean;
  doors270?: boolean;
  purchaseDate?: string;
  purchasePrice?: string;
  additionalNotes?: string;
}

export interface TokenPayload {
  username: string;
  permissao: string[];
  menu: string[];
  url: string[];
  userTypeId: number;
  userId: number;
  iat: number;
  exp: number;
}

export type VehicleFormData = Omit<Vehicle, 'id'>;

export interface BackendVehicleDTO {
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  colour?: string;
  is_270_door?: boolean;
  is_slam_lock?: boolean;
  active?: boolean;
  serviceDue?: string;
  finance?: string;
  motDue?: string;
  taxDue?: string;
  isWarranty?: boolean;
  size?: string;
  logo?: string;
  is_service_pack?: boolean;
  customerId?: number;
  companyId: number;
  servicePartnerId?: number | null;
  vehicleTypeId?: number;
  registeredDate?: string;
  depositId?: number;
}



