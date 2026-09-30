export interface DiscoDeliveryDTO {
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

export interface MyDeliveriesDTO {
  am_routes: string[];
  pm_routes: string[];
  deliveries: DiscoDeliveryDTO[];
}

export interface DayViewOperationDTO {
  label: string;
  vendor_name: string | null;
  vehicle_plate: string | null;
  sort_order: string;
  notes: string | null;
  status: "confirmed" | "pending";
}

export interface DepotDayViewDTO {
  depot_id: string;
  status: "started" | "finished" | "waiting";
  routes: DayViewOperationDTO[];
  adhoc_services: DayViewOperationDTO[];
}

export interface MyPerformanceDTO {
  date: string;
  spr: number;
  sporh: number | null;
  tw: number | null;
  afd: number;
  routes: string[];
}

export interface ComplianceEntryDTO {
  vendor_id: number;
  vendor_name: string;
}

export interface ComplianceCategoryDTO {
  id: "cargo" | "dangerous" | "manual";
  title: string;
  expiring: ComplianceEntryDTO[];
  expired: ComplianceEntryDTO[];
}

export interface VehicleAttentionDTO {
  vehicle_id: number;
  registration_plate: string;
  brand: string;
  depot_id: string;
  reasons: string[];
}

export interface HomeDashboardDTO {
  user_name: string;
  current_date_label: string;
  my_deliveries: MyDeliveriesDTO;
  day_view: DepotDayViewDTO[];
  my_performance: MyPerformanceDTO;
  compliance: ComplianceCategoryDTO[];
  vehicles_requiring_attention: VehicleAttentionDTO[];
}

function delivery(
  route: string,
  depot: string,
  loop: string,
  subpostcode: string,
  address: string,
  recipient: string,
  pre12: boolean,
  asr: boolean,
  dsr: boolean,
): DiscoDeliveryDTO {
  return { route, depot, loop, subpostcode, address, recipient, pre12, asr, dsr };
}

export const HOME_DASHBOARD_FIXTURE: HomeDashboardDTO = {
  user_name: "João",
  current_date_label: "",
  my_deliveries: {
    am_routes: ["LS1B", "LS2C", "LS3D", "LS4E"],
    pm_routes: ["LS1Q", "LS6G", "LS4E"],
    deliveries: [
      delivery("LS1B", "LCY", "L1", "E14 5AB", "12 Harbour Quay, Poplar", "M. Owusu", true, false, false),
      delivery("LS1B", "LCY", "L1", "E14 5AC", "4 Manilla Street, Poplar", "C. Barbosa", true, false, false),
      delivery("LS1B", "LCY", "L2", "E14 6BQ", "9 Cassilis Road, Poplar", "R. Hutton", false, true, false),
      delivery("LS1B", "LCY", "L2", "E14 6BR", "21 Millharbour, Poplar", "F. Adeyemi", false, false, true),
      delivery("LS2C", "LCY", "L1", "E1 6AN", "18 Cable Street, Whitechapel", "T. Novak", true, false, false),
      delivery("LS2C", "LCY", "L1", "E1 6AP", "3 Fletcher Street, Whitechapel", "P. Sinclair", false, false, false),
      delivery("LS2C", "LCY", "L3", "E1 7QS", "56 Wapping Lane, Wapping", "J. Ostrowski", false, true, true),
      delivery("LS3D", "LCY", "L2", "E3 4NT", "7 Wick Lane, Bow", "H. Mabaso", true, false, false),
      delivery("LS3D", "LCY", "L3", "E3 4NU", "31 Old Ford Road, Bow", "D. Quilliam", false, false, false),
      delivery("LS4E", "MSE", "L1", "SE1 9RT", "44 Union Street, Southwark", "A. Strood", true, false, false),
      delivery("LS4E", "MSE", "L1", "SE1 9RU", "2 Southwark Bridge Road", "E. Kamins.", false, true, false),
      delivery("LS4E", "MSE", "L2", "SE1 0HX", "17 Great Suffolk Street", "N. Quinn", false, false, true),
      delivery("LS4E", "MSE", "L2", "SE1 0HY", "63 Blackfriars Road", "V. Ilic", true, false, false),
      delivery("LS1Q", "MSE", "L1", "SE1 2TH", "5 Bermondsey Street", "C. Reid", false, false, false),
      delivery("LS1Q", "MSE", "L1", "SE1 2TJ", "28 Tooley Street", "S. Braithwaite", false, true, false),
      delivery("LS1Q", "MSE", "L3", "SE16 4DG", "9 Jamaica Road, Rotherhithe", "B. Whitlock", true, false, false),
      delivery("LS6G", "LSE", "L1", "SW9 8AA", "12 Coldharbour Lane, Brixton", "G. Adebayo", false, false, false),
      delivery("LS6G", "LSE", "L1", "SW9 8AB", "40 Electric Avenue, Brixton", "P. Oyelaran", true, false, false),
      delivery("LS6G", "LSE", "L2", "SW2 1RJ", "6 Effra Road, Brixton", "T. Farris", false, true, true),
      delivery("LS6G", "LSE", "L2", "SW2 1RK", "71 Railton Road, Herne Hill", "J. Carew", false, false, false),
    ],
  },
  day_view: [
    {
      depot_id: "LCY",
      status: "started",
      routes: [
        { label: "LS1B", vendor_name: "M. Whitfield", vehicle_plate: "LK71 XWD", sort_order: "1", notes: null, status: "confirmed" },
        { label: "LS2C", vendor_name: "J. Blake", vehicle_plate: "KV68 TRD", sort_order: "2", notes: "Late start — 07:40", status: "confirmed" },
        { label: "LS3D", vendor_name: "R. Chandran", vehicle_plate: "MK19 PLV", sort_order: "3", notes: null, status: "confirmed" },
      ],
      adhoc_services: [
        { label: "Container unload", vendor_name: "J. Corrigan", vehicle_plate: "BV23 ORE", sort_order: "A1", notes: null, status: "confirmed" },
      ],
    },
    {
      depot_id: "MSE",
      status: "finished",
      routes: [
        { label: "LS4E", vendor_name: "S. McAlister", vehicle_plate: "LX68 GTR", sort_order: "1", notes: null, status: "confirmed" },
        { label: "LS1Q", vendor_name: "K. Lennon", vehicle_plate: null, sort_order: "2", notes: "No vehicle assigned yet", status: "pending" },
      ],
      adhoc_services: [],
    },
    {
      depot_id: "LSE",
      status: "waiting",
      routes: [],
      adhoc_services: [
        { label: "Yard support", vendor_name: "T. Osei", vehicle_plate: null, sort_order: "A1", notes: "Awaiting confirmation", status: "pending" },
      ],
    },
    {
      depot_id: "BASP",
      status: "started",
      routes: [
        { label: "LS6G", vendor_name: "A. Strood", vehicle_plate: "WM24 QSE", sort_order: "1", notes: null, status: "confirmed" },
        { label: "LS1R", vendor_name: "V. Ilic", vehicle_plate: "LR71 PFA", sort_order: "2", notes: null, status: "confirmed" },
      ],
      adhoc_services: [
        { label: "Trailer shunt", vendor_name: "D. Adeyemi", vehicle_plate: "OY69 HDK", sort_order: "A1", notes: null, status: "confirmed" },
      ],
    },
  ],
  my_performance: {
    date: "2026-09-21",
    spr: 52,
    sporh: 6.8,
    tw: 94.3,
    afd: 2.1,
    routes: ["LS1B", "LS2C"],
  },
  compliance: [
    {
      id: "cargo",
      title: "Cargo",
      expiring: [{ vendor_id: 12, vendor_name: "M. Whitfield" }, { vendor_id: 18, vendor_name: "J. Blake" }],
      expired: [{ vendor_id: 27, vendor_name: "K. Lennon" }],
    },
    {
      id: "dangerous",
      title: "Dangerous Goods",
      expiring: [{ vendor_id: 9, vendor_name: "R. Chandran" }],
      expired: [],
    },
    {
      id: "manual",
      title: "Manual Handling",
      expiring: [],
      expired: [{ vendor_id: 31, vendor_name: "S. McAlister" }, { vendor_id: 40, vendor_name: "A. Strood" }],
    },
  ],
  vehicles_requiring_attention: [
    { vehicle_id: 1, registration_plate: "LK71 XWD", brand: "Ford Transit", depot_id: "LCY", reasons: ["MOT due 05/10/2026"] },
    { vehicle_id: 2, registration_plate: "BV23 ORE", brand: "Mercedes Sprinter", depot_id: "LCY", reasons: ["Tax expired (01/09/2026)"] },
    { vehicle_id: 3, registration_plate: "KV68 TRD", brand: "Iveco Daily", depot_id: "MSE", reasons: ["Service due 12/10/2026", "MOT due 20/10/2026"] },
    { vehicle_id: 4, registration_plate: "LR71 PFA", brand: "Renault Master", depot_id: "BASP", reasons: ["Tax due 30/09/2026"] },
    { vehicle_id: 5, registration_plate: "WM24 QSE", brand: "Vauxhall Vivaro", depot_id: "BASP", reasons: ["MOT expired (15/09/2026)"] },
    { vehicle_id: 6, registration_plate: "OY69 HDK", brand: "Ford Transit", depot_id: "LSE", reasons: ["Service due 02/10/2026"] },
  ],
};
