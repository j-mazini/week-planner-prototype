import React from 'react';
import { Vehicle, BackendVehicleDTO } from './types';
import { Vehicle as BackendVehicle } from "@/lib/vehicles";
import { StatusBadge } from '@/components/status-badge';

/**
 * Normaliza o tipo de combustível: primeira letra maiúscula, resto minúscula
 */
export const normalizeFuelType = (fuelType: string | null | undefined): string => {
  if (!fuelType || !fuelType.trim()) {
    return 'Diesel'; // Default value
  }
  const trimmed = fuelType.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Formata data para input[type="date"]
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (_error) {
    return '';
  }
};

/**
 * Mapeia Vehicle do backend para Vehicle do frontend
 */
export const mapBackendToFrontend = (backendVehicle: BackendVehicle): Vehicle => {
  let status = 'Active';
  if (backendVehicle.active === false || backendVehicle.active === null || backendVehicle.active === undefined) {
    const hasStatusField = backendVehicle.status;
    if (hasStatusField === 'Maintenance' || hasStatusField === 'maintenance') {
      status = 'Maintenance';
    } else {
      if (backendVehicle.serviceDue) {
        const serviceDate = new Date(backendVehicle.serviceDue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
    vin: '',
    brand: backendVehicle.manufacturer || '',
    model: backendVehicle.model || '',
    registrationDate: formatDateForInput(backendVehicle.registeredDate),
    fuelType: normalizeFuelType(backendVehicle.fuelType),
    status: status,
    color: backendVehicle.colour || '',
    department: '',
    primaryVendor: '',
    currentMileage: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: formatDateForInput(backendVehicle.serviceDue),
    maintenanceNotes: '',
    wrappedVehicle: Boolean(backendVehicle.logo === 'true' || (typeof backendVehicle.logo === 'boolean' && backendVehicle.logo)),
    painted: false,
    slamLock: Boolean(backendVehicle.is_slam_lock),
    camera: false,
    gps: false,
    bulkhead: false,
    doors270: Boolean(backendVehicle.is_270_door),
    purchaseDate: '',
    purchasePrice: backendVehicle.finance || '',
    additionalNotes: ''
  };
};

/**
 * Mapeia Vehicle do frontend para DTO do backend
 */
export const mapFrontendToBackend = (frontendVehicle: Omit<Vehicle, 'id'>): BackendVehicleDTO => {
  const frontendVehicleRecord = frontendVehicle as Record<string, unknown>;
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
    is_270_door: frontendVehicle.doors270 || false,
    is_slam_lock: frontendVehicle.slamLock || false,
    active: active,
    serviceDue: frontendVehicleRecord.serviceDue || frontendVehicle.nextMaintenanceDate || undefined,
    finance: frontendVehicleRecord.finance || frontendVehicle.purchasePrice || undefined,
    motDue: frontendVehicleRecord.motDue || undefined,
    taxDue: frontendVehicleRecord.taxDue || undefined,
    isWarranty: Boolean(frontendVehicleRecord.isWarranty),
    size: frontendVehicleRecord.size || undefined,
    logo: frontendVehicleRecord.logo || undefined,
    isServicePack: Boolean(frontendVehicleRecord.isServicePack),
    customerId: parseNumber(frontendVehicleRecord.customerId),
    vehiclTtypIid: parseNumber(frontendVehicleRecord.vehicleTypeId),
    registeredDate: frontendVehicle.registrationDate || undefined,
  };

  if (frontendVehicle.status === 'Maintenance') {
    result.status = 'Maintenance';
  }

  return result as unknown as BackendVehicleDTO;
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const [year, month, rest] = dateString.split('-');
    if (!year || !month || !rest) return dateString;

    const day = rest.split('T')[0]?.split(' ')[0];
    if (!day) return dateString;

    return `${day}/${month}/${year}`;
  } catch (_err) {
    return dateString;
  }
};

/**
 * Retorna badge de status
 */
export const getStatusBadge = (status: string): JSX.Element => {
  if (status === 'Active') {
    return <StatusBadge status="active">Active</StatusBadge>;
  } else if (status === 'Maintenance') {
    return <StatusBadge status="maintenance">Maintenance</StatusBadge>;
  } else if (status === 'Inactive') {
    return <StatusBadge status="inactive">Inactive</StatusBadge>;
  }
  return <StatusBadge status={status}>{status}</StatusBadge>;
};

/**
 * Renderiza tipo de combustível com ícone se for elétrico
 */
export const renderFuelType = (vehicle: Vehicle): JSX.Element => {
  if (vehicle.fuelType === 'Electric') {
    return (
      <span>
        <i className="bi bi-flag-fill me-1" style={{ color: '#16a34a' }} title="Electric Vehicle"></i>
        Electric
      </span>
    );
  }
  return <span>{vehicle.fuelType || '-'}</span>;
};



