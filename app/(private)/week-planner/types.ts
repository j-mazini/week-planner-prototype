export type RouteStatus = "ok" | "warning" | "conflict" | "error" | "open";
export type VehicleBadge = "ok" | "sub" | "none" | null;

export interface RouteCardModel {
  id: string;
  code: string;
  isFlex: boolean;
  status: RouteStatus;
  driverName: string | null;
  vehiclePlate: string | null;
  vehicleBadge: VehicleBadge;
}

export type ReviewBadge = "reviewed" | "re-review" | null;

export interface DayColumnModel {
  date: string;
  name: string;
  dayNumber: string;
  isWeekend: boolean;
  reviewBadge: ReviewBadge;
  assignmentCount: number;
  mainRoutes: RouteCardModel[];
  adhocRoutes: RouteCardModel[];
}

export type WeekState = "past" | "current" | "next" | "draft" | "future";

export interface WeekOption {
  id: string;
  label: string;
  range: string;
  state: WeekState;
}

export interface NoteModel {
  id: string;
  severity: "URGENT" | "CRITICAL";
  body: string;
  acknowledged: boolean;
}

export interface AbsenceChip {
  kind: "OFF" | "LEAVE";
  personName: string;
}

export interface AbsenceDayModel {
  dayLabel: string;
  chips: AbsenceChip[];
  extraCount: number;
}

export interface ManagementCellModel {
  managerName: string;
  isMuted: boolean;
  tooltip?: string;
}

export interface ManagementDayModel {
  dayLabel: string;
  cells: ManagementCellModel[];
}

export interface SpareVehicleModel {
  tag: "SPARE" | "VOR";
  plate: string;
  usable: boolean;
}

export interface SpareDriverModel {
  tag: "UNALLOCATED" | "SPARE" | "FLEX";
  name: string;
  placeable: boolean;
}

export interface ExceptionsModel {
  dayLabel: string;
  vehicles: {
    utilizationLabel: string;
    utilizationPercent: number;
    depotLabel: string;
    items: SpareVehicleModel[];
  };
  drivers: {
    unallocated: SpareDriverModel | null;
    items: SpareDriverModel[];
  };
}

export interface HorizonAction {
  label: string;
  variant: "primary" | "pill" | "default";
}

export interface HorizonDepotStatus {
  code: string;
  approved: boolean;
}

export type HorizonStatTone = "sealed" | "pending" | "fix" | "open";

export interface HorizonStat {
  label: string;
  tone: HorizonStatTone;
}

export type HorizonDayMark = "ok" | "bad" | "weekend";

export interface HorizonWeekModel {
  weekLabel: string;
  range: string;
  isActive: boolean;
  dayStrip: HorizonDayMark[];
  actions: HorizonAction[];
  depots: HorizonDepotStatus[];
  stats: HorizonStat[];
}

export interface WeekPlannerBoardModel {
  weekId: string;
  depotId: string;
  days: DayColumnModel[];
  notes: NoteModel[];
  absences: AbsenceDayModel[];
  management: ManagementDayModel[];
  exceptionsByDate: Record<string, ExceptionsModel>;
  horizon: HorizonWeekModel[];
}
