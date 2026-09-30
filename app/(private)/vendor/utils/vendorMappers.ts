import type {
  CostModelTypeDTO,
  OptionDTO,
  VehicleOptionDTO,
  VendorDTO,
  VendorPageDataDTO,
  VendorRateDTO,
} from "@/lib/mocks/vendor-fixtures";
import type {
  CostModelTypeModel,
  OptionModel,
  VehicleOptionModel,
  VendorModel,
  VendorPageDataModel,
  VendorRateModel,
} from "../types";

function mapRate(dto: VendorRateDTO): VendorRateModel {
  return {
    band1Stops: dto.band1_stops,
    band1Rate: dto.band1_rate,
    band2Stops: dto.band2_stops,
    band2Rate: dto.band2_rate,
    stopRate: dto.stop_rate,
    dayRate: dto.day_rate,
    hourlyRate: dto.hourly_rate,
    validityStartDate: dto.validity_start_date,
    validityEndDate: dto.validity_end_date,
  };
}

function mapVendor(dto: VendorDTO): VendorModel {
  return {
    id: dto.id,
    supplierId: dto.supplier_id,
    depotId: dto.depot_id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phone: dto.phone,
    dob: dto.dob,
    vendorTypeId: dto.vendor_type_id,
    userTypeId: dto.user_type_id,
    servicePartnerId: dto.service_partner_id,
    vat: dto.vat,
    street: dto.street,
    city: dto.city,
    postalCode: dto.postal_code,
    startDate: dto.start_date,
    finishDate: dto.finish_date,
    status: dto.status,
    routeId: dto.route_id,
    routeSortValue: dto.route_sort_value,
    vehicleId: dto.vehicle_id,
    paymentModelId: dto.payment_model_id,
    rate: mapRate(dto.rate),
    cargoTraining: dto.cargo_training,
    cargoTrainingDate: dto.cargo_training_date,
    dangerousGoodsTraining: dto.dangerous_goods_training,
    dangerousGoodsTrainingDate: dto.dangerous_goods_training_date,
    manualHandlingTraining: dto.manual_handling_training,
    manualHandlingTrainingDate: dto.manual_handling_training_date,
    dhlTrainingNumber: dto.dhl_training_number,
    criminalRecordDate: dto.criminal_record_date,
    dvlaCheckDate: dto.dvla_check_date,
    immigrationStatus: dto.immigration_status,
    visaValidity: dto.visa_validity,
    licenceExpiringDate: dto.licence_expiring_date,
    passportExpiringDate: dto.passport_expiring_date,
  };
}

function mapOption(dto: OptionDTO): OptionModel {
  return { id: dto.id, name: dto.name };
}

function mapVehicle(dto: VehicleOptionDTO): VehicleOptionModel {
  return { id: dto.id, plate: dto.plate, manufacturer: dto.manufacturer };
}

function mapCostModelType(dto: CostModelTypeDTO): CostModelTypeModel {
  return { id: dto.id, name: dto.name, kind: dto.kind };
}

export function mapVendorPageDataDtoToModel(dto: VendorPageDataDTO): VendorPageDataModel {
  return {
    vendors: dto.vendors.map(mapVendor),
    deposits: dto.deposits.map(mapOption),
    vendorTypes: dto.vendor_types.map(mapOption),
    userTypes: dto.user_types.map(mapOption),
    servicePartners: dto.service_partners.map(mapOption),
    routes: dto.routes.map(mapOption),
    vehicles: dto.vehicles.map(mapVehicle),
    costModelTypes: dto.cost_model_types.map(mapCostModelType),
  };
}
