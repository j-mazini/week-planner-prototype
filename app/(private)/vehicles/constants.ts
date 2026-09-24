import { VehicleFormData } from './types';
import { normalizeFuelType } from './utils';

export const emptyFormData: VehicleFormData = {
  vrn: '',
  vin: '',
  brand: '',
  model: '',
  registrationDate: '',
  fuelType: normalizeFuelType('Diesel'),
  status: 'Active',
  color: '',
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
  additionalNotes: ''
};

export const availableFuelTypes = ['Diesel', 'Electric'];

export const technicalFeatures = [
  { id: 'wrappedVehicle', label: 'Wrapped Vehicle' },
  { id: 'painted', label: 'Painted' },
  { id: 'slamLock', label: 'Slam Lock' },
  { id: 'camera', label: 'Camera' },
  { id: 'gps', label: 'GPS' },
  { id: 'bulkhead', label: 'Bulkhead' },
  { id: 'doors270', label: '270° Doors' }
];

