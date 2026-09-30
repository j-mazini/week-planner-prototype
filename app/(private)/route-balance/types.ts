export type RouteStatus = "pending" | "validated" | "rebalance";

export interface SpecialDeliveryRow {
  subpostcode: string;
  deliveries: number;
  pickups: number;
  total: number;
}

export interface RouteCardModel {
  id: string;
  code: string;
  manifestLabel: string;
  driverName: string;
  vehiclePlate: string;
  status: RouteStatus;
  stopsCompleted: number;
  stopsTotal: number;
  deliveries: number;
  pickups: number;
  pre12: number;
  specialDeliveries: SpecialDeliveryRow[];
}

export interface KpiModel {
  id: string;
  label: string;
  value: string;
  trend?: string;
  helper: string;
  tone: "default" | "alert";
}

export interface StopModel {
  address: string;
  postcode: string;
  customer: string;
  flag: "PRE12" | "ASR" | "DSR" | null;
}

export interface ShipmentBreakdownRow {
  type: string;
  somaPhysKg?: number;
  pieces: number;
  shipments: number;
  percentTotal: number;
}

export interface RouteDetailModel {
  routeId: string;
  driverName: string;
  vehiclePlate: string;
  deliveries: number;
  pickups: number;
  completionPercent: number;
  totalPieces: number;
  somaPhysKg: number;
  totalShipments: number;
  pre12Count: number;
  asrCount: number;
  dsrCount: number;
  breakdown: ShipmentBreakdownRow[];
  stops: StopModel[];
}

export interface PostcodeAreaModel {
  area: string;
  postcodes: string[];
}

export interface PostcodeAnalysisRow {
  subpostcode: string;
  totalDeliveries: number;
}

export interface SizeClassRow {
  subpostcode: string;
  somaPhys: number;
  totalPieces: number;
  totalShipments: number;
}

export interface ImportPreviewModel {
  fileName: string;
  fileSizeLabel: string;
  pre12Rows: { postcode: string; name: string; address: string }[];
  postcodeAnalysis: PostcodeAnalysisRow[];
  sizeClass: SizeClassRow[];
}

export interface RouteBalanceBoardModel {
  kpis: KpiModel[];
  routes: RouteCardModel[];
  routeDetailsById: Record<string, RouteDetailModel>;
  postcodeAreas: PostcodeAreaModel[];
}
