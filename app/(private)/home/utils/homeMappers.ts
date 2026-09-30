import type {
  ComplianceCategoryDTO,
  DayViewOperationDTO,
  DepotDayViewDTO,
  DiscoDeliveryDTO,
  HomeDashboardDTO,
  MyPerformanceDTO,
  VehicleAttentionDTO,
} from "@/lib/mocks/home-fixtures";
import type {
  ComplianceCategoryModel,
  DayViewOperationModel,
  DepotDayViewModel,
  DiscoDeliveryModel,
  HomeDashboardModel,
  MyPerformanceModel,
  VehicleAttentionModel,
} from "../types";

function mapDelivery(dto: DiscoDeliveryDTO): DiscoDeliveryModel {
  return {
    route: dto.route,
    depot: dto.depot,
    loop: dto.loop,
    subpostcode: dto.subpostcode,
    address: dto.address,
    recipient: dto.recipient,
    pre12: dto.pre12,
    asr: dto.asr,
    dsr: dto.dsr,
  };
}

function mapOperation(dto: DayViewOperationDTO): DayViewOperationModel {
  return {
    label: dto.label,
    vendorName: dto.vendor_name,
    vehiclePlate: dto.vehicle_plate,
    sortOrder: dto.sort_order,
    notes: dto.notes,
    status: dto.status,
  };
}

function mapDepotDayView(dto: DepotDayViewDTO): DepotDayViewModel {
  return {
    depotId: dto.depot_id,
    status: dto.status,
    routes: dto.routes.map(mapOperation),
    adhocServices: dto.adhoc_services.map(mapOperation),
  };
}

function mapPerformance(dto: MyPerformanceDTO): MyPerformanceModel {
  return { date: dto.date, spr: dto.spr, sporh: dto.sporh, tw: dto.tw, afd: dto.afd, routes: dto.routes };
}

function mapCompliance(dto: ComplianceCategoryDTO): ComplianceCategoryModel {
  return {
    id: dto.id,
    title: dto.title,
    expiring: dto.expiring.map((e) => ({ vendorId: e.vendor_id, vendorName: e.vendor_name })),
    expired: dto.expired.map((e) => ({ vendorId: e.vendor_id, vendorName: e.vendor_name })),
  };
}

function mapVehicle(dto: VehicleAttentionDTO): VehicleAttentionModel {
  return {
    vehicleId: dto.vehicle_id,
    registrationPlate: dto.registration_plate,
    brand: dto.brand,
    depotId: dto.depot_id,
    reasons: dto.reasons,
  };
}

export function mapHomeDashboardDtoToModel(dto: HomeDashboardDTO): HomeDashboardModel {
  return {
    userName: dto.user_name,
    myDeliveries: {
      amRoutes: dto.my_deliveries.am_routes,
      pmRoutes: dto.my_deliveries.pm_routes,
      deliveries: dto.my_deliveries.deliveries.map(mapDelivery),
    },
    dayView: dto.day_view.map(mapDepotDayView),
    myPerformance: mapPerformance(dto.my_performance),
    compliance: dto.compliance.map(mapCompliance),
    vehiclesRequiringAttention: dto.vehicles_requiring_attention.map(mapVehicle),
  };
}
