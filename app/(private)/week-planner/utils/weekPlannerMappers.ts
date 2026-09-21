import type {
  AbsenceDayDTO,
  DayColumnDTO,
  ExceptionsDTO,
  HorizonWeekDTO,
  ManagementDayDTO,
  NoteDTO,
  RouteCardDTO,
  WeekPlannerBoardDTO,
} from "@/lib/mocks/week-planner-fixtures";
import type {
  AbsenceDayModel,
  DayColumnModel,
  ExceptionsModel,
  HorizonWeekModel,
  ManagementDayModel,
  NoteModel,
  RouteCardModel,
  WeekPlannerBoardModel,
} from "../types";

function mapRoute(dto: RouteCardDTO): RouteCardModel {
  return {
    id: dto.id,
    code: dto.code,
    isFlex: dto.is_flex,
    status: dto.status,
    driverName: dto.driver_name,
    vehiclePlate: dto.vehicle_plate,
    vehicleBadge: dto.vehicle_badge,
  };
}

function mapDay(dto: DayColumnDTO): DayColumnModel {
  return {
    date: dto.date,
    name: dto.name,
    dayNumber: dto.day_number,
    isWeekend: dto.is_weekend,
    reviewBadge: dto.review_badge,
    assignmentCount: dto.assignment_count,
    mainRoutes: dto.main_routes.map(mapRoute),
    adhocRoutes: dto.adhoc_routes.map(mapRoute),
  };
}

function mapNote(dto: NoteDTO): NoteModel {
  return { id: dto.id, severity: dto.severity, body: dto.body, acknowledged: dto.acknowledged };
}

function mapAbsenceDay(dto: AbsenceDayDTO): AbsenceDayModel {
  return {
    dayLabel: dto.day_label,
    chips: dto.chips.map((c) => ({ kind: c.kind, personName: c.person_name })),
    extraCount: dto.extra_count,
  };
}

function mapManagementDay(dto: ManagementDayDTO): ManagementDayModel {
  return {
    dayLabel: dto.day_label,
    cells: dto.cells.map((c) => ({ managerName: c.manager_name, isMuted: c.is_muted, tooltip: c.tooltip })),
  };
}

function mapExceptions(dto: ExceptionsDTO): ExceptionsModel {
  return {
    dayLabel: dto.day_label,
    vehicles: {
      utilizationLabel: dto.vehicles.utilization_label,
      utilizationPercent: dto.vehicles.utilization_percent,
      depotLabel: dto.vehicles.depot_label,
      items: dto.vehicles.items.map((v) => ({ tag: v.tag, plate: v.plate, usable: v.usable })),
    },
    drivers: {
      unallocated: dto.drivers.unallocated
        ? { tag: "UNALLOCATED", name: dto.drivers.unallocated.name, placeable: dto.drivers.unallocated.placeable }
        : null,
      items: dto.drivers.items.map((d) => ({ tag: d.tag, name: d.name, placeable: d.placeable })),
    },
  };
}

function mapHorizonWeek(dto: HorizonWeekDTO): HorizonWeekModel {
  return {
    weekLabel: dto.week_label,
    range: dto.range,
    isActive: dto.is_active,
    dayStrip: dto.day_strip,
    actions: dto.actions,
    depots: dto.depots,
    stats: dto.stats,
  };
}

export function mapWeekPlannerBoardDtoToModel(dto: WeekPlannerBoardDTO): WeekPlannerBoardModel {
  return {
    weekId: dto.week_id,
    depotId: dto.depot_id,
    days: dto.days.map(mapDay),
    notes: dto.notes.map(mapNote),
    absences: dto.absences.map(mapAbsenceDay),
    management: dto.management.map(mapManagementDay),
    exceptionsByDate: Object.fromEntries(
      Object.entries(dto.exceptions_by_date).map(([date, exc]) => [date, mapExceptions(exc)]),
    ),
    horizon: dto.horizon.map(mapHorizonWeek),
  };
}
