import type { Vehicle as BackendVehicle, VehicleDTO } from "@/lib/vehicles";

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
  vehicleType?: number;
  depot?: number;
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
  servicePartnerId?: number | null;
}

export type VehicleFormData = Omit<Vehicle, 'id'>;

// Helper function to normalize fuel type: first letter uppercase, rest lowercase
export const normalizeFuelType = (fuelType: string | null | undefined): string => {
  if (!fuelType || !fuelType.trim()) {
    return 'Diesel'; // Default value
  }
  const trimmed = fuelType.trim();
  // Capitalize first letter, lowercase the rest
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

// Helper function to format date for input[type="date"]
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    // Handle ISO date strings with time
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // Format as YYYY-MM-DD for input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (_error) {
    return '';
  }
};

// Helper function to map backend Vehicle to frontend Vehicle
export const mapBackendToFrontend = (backendVehicle: BackendVehicle | VehicleDTO): Vehicle => {
  // Map status: active -> 'Active', !active -> check if it's Maintenance or Inactive
  let status = 'Active';
  if (backendVehicle.active === false || backendVehicle.active === null || backendVehicle.active === undefined) {
    // Check if there's a status field in the backend response that indicates maintenance
    const hasStatusField = (backendVehicle as Record<string, unknown>).status;
    if (hasStatusField === 'Maintenance' || hasStatusField === 'maintenance') {
      status = 'Maintenance';
    } else {
      // Check if serviceDue is in the past (might indicate maintenance)
      if (backendVehicle.serviceDue) {
        const serviceDate = new Date(backendVehicle.serviceDue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // If service is due in the past or today, it might be in maintenance
        if (serviceDate <= today) {
          status = 'Maintenance';
        } else {
          status = 'Inactive';
        }
      } else {
        status = 'Inactive';
      }
    }
  }

  return {
    id: backendVehicle.vehicleId || 0,
    vrn: backendVehicle.registrationPlates || '',
    vin: '', // VIN não está no backend, manter vazio
    brand: backendVehicle.manufacturer || '',
    model: backendVehicle.model || '',
    registrationDate: formatDateForInput(backendVehicle.registeredDate),
    fuelType: normalizeFuelType(backendVehicle.fuelType),
    status: status,
    color: backendVehicle.colour || '',
    vehicleType: backendVehicle.vehicleTypeId || undefined,
    depot: (backendVehicle as VehicleDTO).depositId || undefined,
    department: '', // Não está no backend
    primaryVendor: '', // Não está no backend
    currentMileage: '', // Não está no backend
    lastMaintenanceDate: '', // Não está no backend
    nextMaintenanceDate: formatDateForInput(backendVehicle.serviceDue),
    maintenanceNotes: '', // Não está no backend
    wrappedVehicle: Boolean((backendVehicle as VehicleDTO).isWrapped),
    painted: false, // Não está no backend
    slamLock: Boolean(backendVehicle.isSlamLock),
    camera: Boolean((backendVehicle as VehicleDTO).isCam),
    gps: Boolean((backendVehicle as VehicleDTO).isGps),
    bulkhead: Boolean((backendVehicle as VehicleDTO).isBulkhead),
    doors270: Boolean(backendVehicle.is270Door),
    purchaseDate: '', // Não está no backend
    purchasePrice: backendVehicle.finance || '',
    additionalNotes: '', // Não está no backend
    servicePartnerId: (backendVehicle as VehicleDTO).servicePartnerId ?? null,
  };
};

// Return type for mapFrontendToBackend (frontendVehicle may carry extra loosely-typed fields not on Vehicle).
type BackendVehicleUpdatePayload = {
  manufacturer?: string;
  model?: string;
  fuelType?: string;
  registrationPlates?: string;
  colour?: string;
  is270Door?: boolean;
  isSlamLock?: boolean;
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
  companyId?: number;
  vehicleTypeId?: number;
  registeredDate?: string;
};

// Helper function to map frontend Vehicle to backend VehicleCreateDTO/VehicleUpdateDTO
export const mapFrontendToBackend = (frontendVehicle: Omit<Vehicle, 'id'>): BackendVehicleUpdatePayload => {
  const frontendVehicleRecord = frontendVehicle as Record<string, unknown>;
  // Map status: 'Active' -> true, 'Maintenance' and 'Inactive' -> false
  const activeFromStatus = frontendVehicle.status === 'Active';
  const active =
    typeof frontendVehicleRecord.active === 'boolean'
      ? Boolean(frontendVehicleRecord.active)
      : activeFromStatus;
  const parseNumber = (v: unknown) => {
    const n = typeof v === 'string' ? parseInt(v, 10) : (v as number | undefined);
    return Number.isFinite(n as number) ? (n as number) : undefined;
  };

  const result: Record<string, unknown> = {
    manufacturer: frontendVehicle.brand || undefined,
    model: frontendVehicle.model || undefined,
    fuelType: frontendVehicle.fuelType || undefined,
    registrationPlates: frontendVehicle.vrn || undefined,
    colour: frontendVehicleRecord.colour || frontendVehicle.color || undefined,
    is270Door: frontendVehicle.doors270 || false,
    isSlamLock: frontendVehicle.slamLock || false,
    is_wrapped: frontendVehicle.wrappedVehicle || false,
    is_cam: frontendVehicle.camera || false,
    is_gps: frontendVehicle.gps || false,
    is_bulkhead: frontendVehicle.bulkhead || false,
    active: active,
    serviceDue: frontendVehicleRecord.serviceDue || frontendVehicle.nextMaintenanceDate || undefined,
    finance: frontendVehicleRecord.finance || frontendVehicle.purchasePrice || undefined,
    motDue: frontendVehicleRecord.motDue || undefined,
    taxDue: frontendVehicleRecord.taxDue || undefined,
    isWarranty: Boolean(frontendVehicleRecord.isWarranty),
    size: frontendVehicleRecord.size || undefined,
    logo: frontendVehicleRecord.logo || undefined,
    is_service_pack: Boolean(frontendVehicleRecord.is_service_pack),
    customerId: parseNumber(frontendVehicleRecord.customerId),
    vehicleTypeId: parseNumber(frontendVehicle.vehicleType || frontendVehicleRecord.vehicleTypeId),
    depositId: parseNumber(frontendVehicle.depot || frontendVehicleRecord.depositId),
    servicePartnerId: frontendVehicle.servicePartnerId ?? null,
    registeredDate: frontendVehicle.registrationDate || undefined,
  };

  // Try to preserve Maintenance status by storing it in a custom field
  if (frontendVehicle.status === 'Maintenance') {
    result.status = 'Maintenance';
  }

  return result as unknown as BackendVehicleUpdatePayload;
};

export const emptyFormData: VehicleFormData = {
  vrn: '',
  vin: '',
  brand: '',
  model: '',
  registrationDate: '',
  fuelType: normalizeFuelType('Diesel'),
  status: 'Active',
  color: '',
  vehicleType: undefined,
  depot: undefined,
  department: '',
  primaryVendor: '',
  currentMileage: '',
  lastMaintenanceDate: '',
  nextMaintenanceDate: '',
  maintenanceNotes: '',
  wrappedVehicle: false,
  painted: false,
  slamLock: false,
  camera: false,
  gps: false,
  bulkhead: false,
  doors270: false,
  purchaseDate: '',
  purchasePrice: '',
  additionalNotes: '',
  servicePartnerId: null
};



