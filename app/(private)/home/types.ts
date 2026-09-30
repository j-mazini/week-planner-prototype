export interface DiscoDeliveryModel {
  route: string;
  depot: string;
  loop: string;
  subpostcode: string;
  address: string;
  recipient: string;
  pre12: boolean;
  asr: boolean;
  dsr: boolean;
}

export interface MyDeliveriesModel {
  amRoutes: string[];
  pmRoutes: string[];
  deliveries: DiscoDeliveryModel[];
}

export type DayViewOperationStatus = "confirmed" | "pending";

export interface DayViewOperationModel {
  label: string;
  vendorName: string | null;
  vehiclePlate: string | null;
  sortOrder: string;
  notes: string | null;
  status: DayViewOperationStatus;
}

export type DepotDayStatus = "started" | "finished" | "waiting";

export interface DepotDayViewModel {
  depotId: string;
  status: DepotDayStatus;
  routes: DayViewOperationModel[];
  adhocServices: DayViewOperationModel[];
}

export interface MyPerformanceModel {
  date: string;
  spr: number;
  sporh: number | null;
  tw: number | null;
  afd: number;
  routes: string[];
}

export interface ComplianceEntryModel {
  vendorId: number;
  vendorName: string;
}

export type ComplianceCategoryId = "cargo" | "dangerous" | "manual";

export interface ComplianceCategoryModel {
  id: ComplianceCategoryId;
  title: string;
  expiring: ComplianceEntryModel[];
  expired: ComplianceEntryModel[];
}

export interface VehicleAttentionModel {
  vehicleId: number;
  registrationPlate: string;
  brand: string;
  depotId: string;
  reasons: string[];
}

export interface HomeDashboardModel {
  userName: string;
  myDeliveries: MyDeliveriesModel;
  dayView: DepotDayViewModel[];
  myPerformance: MyPerformanceModel;
  compliance: ComplianceCategoryModel[];
  vehiclesRequiringAttention: VehicleAttentionModel[];
}
