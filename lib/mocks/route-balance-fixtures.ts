import type {
  ImportPreviewModel,
  KpiModel,
  PostcodeAreaModel,
  RouteBalanceBoardModel,
  RouteCardModel,
  RouteDetailModel,
} from "@/app/(private)/route-balance/types";

const route = (
  id: string,
  code: string,
  driver: string,
  plate: string,
  status: RouteCardModel["status"],
  stopsCompleted: number,
  stopsTotal: number,
  deliveries: number,
  pickups: number,
  pre12: number,
): RouteCardModel => ({
  id,
  code: `ROUTE ${code}`,
  manifestLabel: `ROUTE ${code} • MANIFEST`,
  driverName: driver,
  vehiclePlate: plate,
  status,
  stopsCompleted,
  stopsTotal,
  deliveries,
  pickups,
  pre12,
  specialDeliveries: [
    { subpostcode: "ME1", deliveries: 2, pickups: 1, total: 3 },
    { subpostcode: "ME2", deliveries: 4, pickups: 1, total: 5 },
  ],
});

export const ROUTE_BALANCE_KPIS: KpiModel[] = [
  { id: "total-stops", label: "Total Stops", value: "128", trend: "+4.2%", helper: "8 routes", tone: "default" },
  { id: "pre12", label: "Pre-12 Deliveries", value: "27", helper: "21% of stops", tone: "default" },
  { id: "asr", label: "ASR", value: "113", helper: "88% of stops", tone: "default" },
  { id: "target", label: "Target", value: "87%", helper: "Goal 95% to 105% of stops", tone: "alert" },
];

export const ROUTE_BALANCE_ROUTES: RouteCardModel[] = [
  route("r-a01", "A-01", "Carlos Silva", "YF25 OZL", "pending", 11, 15, 10, 5, 2),
  route("r-a02", "A-02", "Ana Costa", "Car-001", "validated", 14, 15, 12, 3, 2),
  route("r-a03", "A-03", "M. Whitfield", "LK71 XWD", "validated", 15, 15, 13, 2, 1),
  route("r-b01", "B-01", "K. Lennon", "BV23 ORE", "rebalance", 9, 15, 7, 8, 3),
  route("r-b02", "B-02", "J. Corrigan", "KV68 TRD", "pending", 12, 15, 9, 6, 2),
  route("r-b03", "B-03", "R. Chandran", "LR71 PFA", "validated", 15, 15, 14, 1, 0),
  route("r-c01", "C-01", "Carlos Silva", "LD68 XXS", "pending", 8, 15, 6, 9, 4),
  route("r-c02", "C-02", "Ana Costa", "MK19 PLV", "rebalance", 10, 15, 8, 7, 3),
];

function buildDetail(r: RouteCardModel, i: number): RouteDetailModel {
  return {
    routeId: r.code,
    driverName: r.driverName,
    vehiclePlate: r.vehiclePlate,
    deliveries: r.deliveries,
    pickups: r.pickups,
    completionPercent: Math.round((r.stopsCompleted / r.stopsTotal) * 100),
    totalPieces: 180 + i * 12,
    somaPhysKg: 6200 + i * 340.5,
    totalShipments: 24 + i * 2,
    pre12Count: r.pre12,
    asrCount: r.deliveries + 5,
    dsrCount: r.pickups + 3,
    breakdown: [
      { type: "COY", pieces: 50, shipments: 5, percentTotal: 14 },
      { type: "COY-S1", pieces: 57, shipments: 6, percentTotal: 16 },
      { type: "COY-S2", pieces: 22, shipments: 3, percentTotal: 8 },
      { type: "FLY", pieces: 41, shipments: 4, percentTotal: 11 },
      { type: "NCY", pieces: 33, shipments: 3, percentTotal: 9 },
      { type: "PAL", pieces: 18, shipments: 2, percentTotal: 5 },
    ],
    stops: [
      { address: "141 Victoria Avenue", postcode: "ME2 2AB", customer: "Customer 381", flag: "PRE12" },
      { address: "177 Station Road", postcode: "ME5 1AB", customer: "Customer 962", flag: "ASR" },
      { address: "22 Knight Road", postcode: "ME1 3CD", customer: "Customer 217", flag: "DSR" },
      { address: "9 Whittings Farm", postcode: "ME13 9EF", customer: "Customer 540", flag: null },
      { address: "56 Ballard Business Park", postcode: "ME20 7GH", customer: "Customer 118", flag: "ASR" },
    ],
  };
}

export const ROUTE_BALANCE_DETAILS: Record<string, RouteDetailModel> = Object.fromEntries(
  ROUTE_BALANCE_ROUTES.map((r, i) => [r.id, buildDetail(r, i)]),
);

export const ROUTE_BALANCE_POSTCODE_AREAS: PostcodeAreaModel[] = [
  { area: "ME15", postcodes: ["ME15 1AB", "ME15 2AB", "ME15 3AB", "ME15 4AB", "ME15 5AB", "ME15 6AB", "ME15 7AB", "ME15 8AB"] },
  { area: "ME1", postcodes: ["ME1 1AB", "ME1 2AB", "ME1 3AB", "ME1 4AB"] },
  { area: "ME5", postcodes: ["ME5 1AB", "ME5 2AB", "ME5 3AB"] },
];

export const ROUTE_BALANCE_BOARD: RouteBalanceBoardModel = {
  kpis: ROUTE_BALANCE_KPIS,
  routes: ROUTE_BALANCE_ROUTES,
  routeDetailsById: ROUTE_BALANCE_DETAILS,
  postcodeAreas: ROUTE_BALANCE_POSTCODE_AREAS,
};

export const ROUTE_BALANCE_IMPORT_PREVIEW: ImportPreviewModel = {
  fileName: "disco-export.xlsm",
  fileSizeLabel: "623kb",
  pre12Rows: [
    { postcode: "ME11", name: "Thorndike Dental Care", address: "New Hythe Business Pk, College Rd, Aylesford, Kent" },
    { postcode: "ME12", name: "Denise Smith", address: "14 Orchard Close, Aylesford, Kent" },
    { postcode: "ME13", name: "Acute New Elevators", address: "Unit 2, Whittings Farm, Halling, Rochester" },
    { postcode: "ME13", name: "APC Technology Group", address: "Knight Road Strood, Rochester" },
    { postcode: "ME20", name: "Polypipe Building Services", address: "Ballard Business Park, Strood, Rochester" },
    { postcode: "ME21", name: "ILS Ltd", address: "9 Larkfield Trading Estate, Aylesford, Kent" },
  ],
  postcodeAnalysis: [
    { subpostcode: "DA12 3", totalDeliveries: 3 },
    { subpostcode: "DA13 0", totalDeliveries: 8 },
    { subpostcode: "DA3 7", totalDeliveries: 15 },
    { subpostcode: "DA3 8", totalDeliveries: 6 },
    { subpostcode: "ME1 1", totalDeliveries: 11 },
  ],
  sizeClass: [
    { subpostcode: "DA12 3", somaPhys: 2.66, totalPieces: 4, totalShipments: 1 },
    { subpostcode: "DA13 0", somaPhys: 28.99, totalPieces: 14, totalShipments: 4 },
    { subpostcode: "DA3 7", somaPhys: 91.32, totalPieces: 33, totalShipments: 11 },
    { subpostcode: "ME1 1", somaPhys: 14.06, totalPieces: 9, totalShipments: 3 },
  ],
};
