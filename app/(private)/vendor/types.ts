import type { CostModelKind } from "@/lib/mocks/vendor-fixtures";

export type VendorStatus = "Active" | "Inactive";

export interface VendorRateModel {
  band1Stops: number | null;
  band1Rate: number | null;
  band2Stops: number | null;
  band2Rate: number | null;
  stopRate: number | null;
  dayRate: number | null;
  hourlyRate: number | null;
  validityStartDate: string | null;
  validityEndDate: string | null;
}

export interface VendorModel {
  id: number;
  supplierId: string;
  depotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string | null;
  vendorTypeId: string;
  userTypeId: string | null;
  servicePartnerId: string | null;
  vat: string;
  street: string;
  city: string;
  postalCode: string;
  startDate: string;
  finishDate: string | null;
  status: VendorStatus;
  routeId: string;
  routeSortValue: string;
  vehicleId: string;
  paymentModelId: string;
  rate: VendorRateModel;
  cargoTraining: boolean;
  cargoTrainingDate: string | null;
  dangerousGoodsTraining: boolean;
  dangerousGoodsTrainingDate: string | null;
  manualHandlingTraining: boolean;
  manualHandlingTrainingDate: string | null;
  dhlTrainingNumber: string;
  criminalRecordDate: string | null;
  dvlaCheckDate: string | null;
  immigrationStatus: string;
  visaValidity: string | null;
  licenceExpiringDate: string | null;
  passportExpiringDate: string | null;
}

export interface OptionModel {
  id: string;
  name: string;
}

export interface VehicleOptionModel {
  id: string;
  plate: string;
  manufacturer: string;
}

export interface CostModelTypeModel {
  id: string;
  name: string;
  kind: CostModelKind;
}

export interface VendorPageDataModel {
  vendors: VendorModel[];
  deposits: OptionModel[];
  vendorTypes: OptionModel[];
  userTypes: OptionModel[];
  servicePartners: OptionModel[];
  routes: OptionModel[];
  vehicles: VehicleOptionModel[];
  costModelTypes: CostModelTypeModel[];
}

export interface VendorFilterState {
  search: string;
  status: "all" | "active" | "inactive" | "expiring" | "pending";
  vendorTypeId: "all" | string;
  servicePartnerId: string;
}
