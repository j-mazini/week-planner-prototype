export interface RouteData {
  routeId: number;
  routeName: string;
}

export interface PaidStops {
  pu: number;
  ok: number;
  hn: number;
  pd: number | null;
}

export interface UnpaidStops {
  nr: number;
  fp: number;
  rd: number;
  ba: number;
  nh: number;
  cm: number;
  ca: number;
}

export interface DeliveryDetails {
  totalAfd: number;
  paidStops: PaidStops;
  unpaidStops: UnpaidStops;
  departTime: string | null;
  arriveTime: string | null;
}

export interface DailyMetrics {
  totalStops: number;
  sporh: number;
  breakMinutes: number;
}

export interface DailyCash {
  rate: number;
  dailyServiceCharge: number;
}

export interface Vehicle {
  vehicleId: number;
  vehicleModel: string;
  vehicleRegistrationPlate: string;
}

export interface DailyPerformanceData {
  operationId: number;
  operationDate: string;
  note: string;
  status: string;
  dailyCash: DailyCash;
  route: RouteData;
  timeWindows: { percentageOnTime: number };
  deliveryDetails: DeliveryDetails;
  dailyMetrics: DailyMetrics;
  vehicle?: Vehicle;
  isSpms: boolean;
  // Campos pré-computados pelo backend (PerformanceCalculationService) quando
  // a request usa ?metrics=performance — sem recálculo no cliente.
  sporh?: number;
  spr?: number;
  afd?: number;
  twPercentage?: number;
  userId?: string | number;
  fullName?: string;
  email?: string;
}

export interface DayInfo {
  day: number;
  dayName: string;
  index: number;
  date: Date;
}

