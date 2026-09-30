export interface VendorRateDTO {
  band1_stops: number | null;
  band1_rate: number | null;
  band2_stops: number | null;
  band2_rate: number | null;
  stop_rate: number | null;
  day_rate: number | null;
  hourly_rate: number | null;
  validity_start_date: string | null;
  validity_end_date: string | null;
}

export interface VendorDTO {
  id: number;
  supplier_id: string;
  depot_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string | null;
  vendor_type_id: string;
  user_type_id: string | null;
  service_partner_id: string | null;
  vat: string;
  street: string;
  city: string;
  postal_code: string;
  start_date: string;
  finish_date: string | null;
  status: "Active" | "Inactive";
  route_id: string;
  route_sort_value: string;
  vehicle_id: string;
  payment_model_id: string;
  rate: VendorRateDTO;
  cargo_training: boolean;
  cargo_training_date: string | null;
  dangerous_goods_training: boolean;
  dangerous_goods_training_date: string | null;
  manual_handling_training: boolean;
  manual_handling_training_date: string | null;
  dhl_training_number: string;
  criminal_record_date: string | null;
  dvla_check_date: string | null;
  immigration_status: string;
  visa_validity: string | null;
  licence_expiring_date: string | null;
  passport_expiring_date: string | null;
}

export interface OptionDTO {
  id: string;
  name: string;
}

export interface VehicleOptionDTO {
  id: string;
  plate: string;
  manufacturer: string;
}

export type CostModelKind = "band" | "perStop" | "perDay" | "perHour";

export interface CostModelTypeDTO {
  id: string;
  name: string;
  kind: CostModelKind;
}

export interface VendorPageDataDTO {
  vendors: VendorDTO[];
  deposits: OptionDTO[];
  vendor_types: OptionDTO[];
  user_types: OptionDTO[];
  service_partners: OptionDTO[];
  routes: OptionDTO[];
  vehicles: VehicleOptionDTO[];
  cost_model_types: CostModelTypeDTO[];
}

const emptyRate: VendorRateDTO = {
  band1_stops: null, band1_rate: null, band2_stops: null, band2_rate: null,
  stop_rate: null, day_rate: null, hourly_rate: null,
  validity_start_date: null, validity_end_date: null,
};

function bandRate(band1Stops: number, band1Rate: number, band2Stops: number, band2Rate: number, from: string): VendorRateDTO {
  return { ...emptyRate, band1_stops: band1Stops, band1_rate: band1Rate, band2_stops: band2Stops, band2_rate: band2Rate, validity_start_date: from };
}
function stopRate(rate: number, from: string): VendorRateDTO {
  return { ...emptyRate, stop_rate: rate, validity_start_date: from };
}
function dayRate(rate: number, from: string): VendorRateDTO {
  return { ...emptyRate, day_rate: rate, validity_start_date: from };
}
function hourlyRate(rate: number, from: string): VendorRateDTO {
  return { ...emptyRate, hourly_rate: rate, validity_start_date: from };
}

function vendor(overrides: Partial<VendorDTO> & Pick<VendorDTO, "id" | "supplier_id" | "depot_id" | "first_name" | "last_name">): VendorDTO {
  return {
    email: `${overrides.first_name.toLowerCase()}.${overrides.last_name.toLowerCase()}@vendors.example`,
    phone: "+44 7700 900000",
    dob: "1988-04-12",
    vendor_type_id: "owner-driver",
    user_type_id: "driver",
    service_partner_id: null,
    vat: "",
    street: "",
    city: "",
    postal_code: "",
    start_date: "2025-01-06",
    finish_date: null,
    status: "Active",
    route_id: "",
    route_sort_value: "",
    vehicle_id: "",
    payment_model_id: "vsr",
    rate: emptyRate,
    cargo_training: false,
    cargo_training_date: null,
    dangerous_goods_training: false,
    dangerous_goods_training_date: null,
    manual_handling_training: false,
    manual_handling_training_date: null,
    dhl_training_number: "",
    criminal_record_date: null,
    dvla_check_date: null,
    immigration_status: "Citizen",
    visa_validity: null,
    licence_expiring_date: null,
    passport_expiring_date: null,
    ...overrides,
  };
}

export const VENDOR_PAGE_DATA_FIXTURE: VendorPageDataDTO = {
  deposits: [
    { id: "LCY", name: "LCY" },
    { id: "MSE", name: "MSE" },
    { id: "LSE", name: "LSE" },
    { id: "BASP", name: "BASP" },
  ],
  vendor_types: [
    { id: "owner-driver", name: "Owner Driver" },
    { id: "multi-drop", name: "Multi Drop" },
    { id: "sp-driver", name: "Service Partner Driver" },
    { id: "off", name: "OFF" },
  ],
  user_types: [
    { id: "driver", name: "Driver" },
    { id: "team-leader", name: "Team Leader" },
    { id: "supervisor", name: "Supervisor" },
  ],
  service_partners: [
    { id: "sp1", name: "Swift Logistics Partners" },
    { id: "sp2", name: "Apex Freight Solutions" },
  ],
  routes: [
    { id: "LS1B", name: "LS1B" },
    { id: "LS2C", name: "LS2C" },
    { id: "LS3D", name: "LS3D" },
    { id: "LS4E", name: "LS4E" },
    { id: "LS1Q", name: "LS1Q" },
    { id: "LS6G", name: "LS6G" },
    { id: "LS1R", name: "LS1R" },
    { id: "LS7H", name: "LS7H" },
  ],
  vehicles: [
    { id: "v1", plate: "LK71 XWD", manufacturer: "Ford Transit" },
    { id: "v2", plate: "BV23 ORE", manufacturer: "Mercedes Sprinter" },
    { id: "v3", plate: "KV68 TRD", manufacturer: "Iveco Daily" },
    { id: "v4", plate: "LR71 PFA", manufacturer: "Renault Master" },
    { id: "v5", plate: "WM24 QSE", manufacturer: "Vauxhall Vivaro" },
    { id: "v6", plate: "LX68 GTR", manufacturer: "Ford Transit" },
    { id: "v7", plate: "MK19 PLV", manufacturer: "Peugeot Boxer" },
    { id: "v8", plate: "OY69 HDK", manufacturer: "Citroën Relay" },
  ],
  cost_model_types: [
    { id: "vsr", name: "VSR", kind: "band" },
    { id: "vsr-electric", name: "VSR Electric", kind: "band" },
    { id: "sp-vsr", name: "SP VSR", kind: "band" },
    { id: "daf", name: "DAF", kind: "band" },
    { id: "fsr", name: "FSR", kind: "perStop" },
    { id: "dr", name: "DR", kind: "perDay" },
    { id: "hourly", name: "Hourly", kind: "perHour" },
  ],
  vendors: [
    vendor({
      id: 1, supplier_id: "MW-01", depot_id: "LCY", first_name: "M.", last_name: "Whitfield",
      route_id: "LS1B", route_sort_value: "1", vehicle_id: "v1", payment_model_id: "vsr",
      rate: bandRate(50, 2.1, 999, 1.85, "2025-01-06"),
      cargo_training: true, cargo_training_date: "2025-02-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2025-02-01",
      manual_handling_training: true, manual_handling_training_date: "2025-02-01",
      dhl_training_number: "DHL-88231",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
      street: "12 Harbour Quay", city: "London", postal_code: "E14 5AB",
    }),
    vendor({
      id: 2, supplier_id: "KL-02", depot_id: "LCY", first_name: "K.", last_name: "Lennon",
      route_id: "LS1Q", route_sort_value: "2", vehicle_id: "", payment_model_id: "fsr",
      rate: stopRate(1.4, "2025-03-10"),
      status: "Active",
      cargo_training: true, cargo_training_date: "2023-05-01",
      dangerous_goods_training: false,
      manual_handling_training: true, manual_handling_training_date: "2025-01-15",
      criminal_record_date: null, dvla_check_date: "2025-01-02",
    }),
    vendor({
      id: 3, supplier_id: "JC-03", depot_id: "MSE", first_name: "J.", last_name: "Corrigan",
      route_id: "LS2C", route_sort_value: "1", vehicle_id: "v2", payment_model_id: "sp-vsr",
      service_partner_id: "sp1", vendor_type_id: "sp-driver",
      rate: bandRate(40, 2.4, 999, 2.1, "2024-11-01"),
      cargo_training: true, cargo_training_date: "2025-04-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2025-04-01",
      manual_handling_training: true, manual_handling_training_date: "2025-04-01",
      dhl_training_number: "DHL-77120",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
      visa_validity: "2026-10-05",
    }),
    vendor({
      id: 4, supplier_id: "RC-04", depot_id: "MSE", first_name: "R.", last_name: "Chandran",
      route_id: "LS3D", route_sort_value: "3", vehicle_id: "v4", payment_model_id: "vsr",
      rate: bandRate(60, 1.95, 999, 1.7, "2025-01-06"),
      cargo_training: true, cargo_training_date: "2023-08-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2023-08-01",
      manual_handling_training: true, manual_handling_training_date: "2023-08-01",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
      licence_expiring_date: "2026-10-12",
    }),
    vendor({
      id: 5, supplier_id: "SM-05", depot_id: "LSE", first_name: "S.", last_name: "McAlister",
      route_id: "LS4E", route_sort_value: "1", vehicle_id: "v6", payment_model_id: "dr",
      rate: dayRate(145, "2025-02-01"),
      cargo_training: true, cargo_training_date: "2025-02-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2025-02-01",
      manual_handling_training: false,
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
    }),
    vendor({
      id: 6, supplier_id: "JB-06", depot_id: "LSE", first_name: "J.", last_name: "Blake",
      route_id: "LS6G", route_sort_value: "2", vehicle_id: "v3", payment_model_id: "vsr",
      rate: bandRate(55, 2.0, 999, 1.8, "2025-01-06"),
      status: "Inactive", finish_date: "2026-08-01",
      cargo_training: true, cargo_training_date: "2023-06-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2023-06-01",
      manual_handling_training: true, manual_handling_training_date: "2023-06-01",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
    }),
    vendor({
      id: 7, supplier_id: "AS-07", depot_id: "BASP", first_name: "A.", last_name: "Strood",
      route_id: "LS1R", route_sort_value: "1", vehicle_id: "v5", payment_model_id: "hourly",
      rate: hourlyRate(13.5, "2025-05-01"),
      cargo_training: true, cargo_training_date: "2025-05-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2025-05-01",
      manual_handling_training: true, manual_handling_training_date: "2025-05-01",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
      passport_expiring_date: "2026-10-20",
    }),
    vendor({
      id: 8, supplier_id: "DA-08", depot_id: "BASP", first_name: "D.", last_name: "Adeyemi",
      route_id: "LS7H", route_sort_value: "1", vehicle_id: "v8", payment_model_id: "daf",
      rate: bandRate(30, 3.1, 999, 2.8, "2025-01-06"),
      immigration_status: "Visa", visa_validity: "2026-11-15",
      cargo_training: false, dangerous_goods_training: false, manual_handling_training: false,
      criminal_record_date: null, dvla_check_date: null,
    }),
    vendor({
      id: 9, supplier_id: "VI-09", depot_id: "LCY", first_name: "V.", last_name: "Ilic",
      route_id: "LS1B", route_sort_value: "4", vehicle_id: "v7", payment_model_id: "vsr",
      rate: bandRate(45, 2.15, 999, 1.9, "2025-01-06"),
      cargo_training: true, cargo_training_date: "2023-09-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2023-09-01",
      manual_handling_training: true, manual_handling_training_date: "2023-09-01",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
    }),
    vendor({
      id: 10, supplier_id: "NQ-10", depot_id: "MSE", first_name: "N.", last_name: "Quinn",
      route_id: "LS2C", route_sort_value: "2", vehicle_id: "", payment_model_id: "fsr",
      rate: stopRate(1.35, "2025-06-01"),
      cargo_training: true, cargo_training_date: "2025-01-01",
      dangerous_goods_training: true, dangerous_goods_training_date: "2025-01-01",
      manual_handling_training: true, manual_handling_training_date: "2025-01-01",
      criminal_record_date: "2025-01-02", dvla_check_date: "2025-01-02",
    }),
  ],
};
