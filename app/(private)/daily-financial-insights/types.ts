export interface FilterState {
  depot: string;
  loop: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  payment?: string;
}

export interface FormDataState {
  /** Enviado no PATCH/POST; não há input visível (data da linha ou hoje ao criar). */
  date: string;
  depot: string;
  vrm: string;
  vendor: string;
  route: string;
  paymentMode: string;
  rate: string;
  stops: string;
  sort: string;
  /** Valor monetário / sort AD-HOC (ex.: preenchido a partir do serviço). */
  adhoc: string;
  extras: string;
  notes: string;
  /** `adhocServiceId` do select GET /bff/adhoc-services; vazio = nenhum. */
  adhocServiceId: string;
}

export interface RowTotals {
  total: number;
  avgPerStop: number;
}

export type PaymentMode = 'DR' | 'FSR' | 'VSR' | 'SP_VSR' | '1' | '7' | 'OFF';

export interface InsightRow {
  date: string;
  depot: string;
  vrm: string;
  courier: string;
  route: string;
  paymentMode: PaymentMode;
  rate: number;
  stops: number | null;
  sort: number | null;
  adhoc: number | null;
  extras: number | null;
  notes: string;
  status?: string;
  operationId?: number;
  invoiceId?: number | null;
  userId?: number;
  routeId?: number;
  vehicleId?: number;
  adhocServiceId?: number | null;
  totalPaidStops?: number;
  total?: number;
  avgPerStop?: number;
  costModel?: Array<{
    costModelId: number;
    minStops: number | null;
    maxStops: number | null;
    fixedPrice: number | null;
    pricePerStop: number | null;
    costModelName: string;
    validityStartDate?: string | null;
    validityEndDate?: string | null;
  }>;
  /** When false, Stops column is highlighted (data did not come from SPMS). */
  isSpms?: boolean;
}

export interface ReportPaginatedResponseDTO {
  data: ReportDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ReportDTO {
  operationId: number;
  operationDate: string;
  rate: string | null;
  dailyServiceCharge: string | null;
  status: string;
  routeSort: string | null;
  adhocSort: string | null;
  extra: string | null;
  userId: number;
  vehicleId: number;
  operationCostModel: number;
  note: string | null;
  routeId: number;
  routeName: string;
  depositId: number;
  depositName: string;
  serviceTypeId: number;
  serviceName: string;
  courierName: string;
  vrn: string;
  percentageOtTwDl: string | null;
  earlyDl: number | null;
  lateDl: number | null;
  otDl: number | null;
  sporh: number | null;
  breakMinutes: number | null;
  totalWorkHours: number | null;
  totalAfd: string;
  totalPu: string;
  totalOk: string;
  totalHn: string;
  totalPd: string;
  totalNr: string;
  totalFp: string;
  totalRd: string;
  totalBa: string;
  totalNh: string;
  totalCm: string;
  totalCa: string;
  totalStops: string;
  departTime: string | null;
  arriveTime: string | null;
  calculatedWorkHours: string | null;
  isSpms: boolean;
  costModel?: Array<{
    costModelId: number;
    minStops: number | null;
    maxStops: number | null;
    fixedPrice: number | null;
    pricePerStop: number | null;
    costModelName: string;
    validityStartDate?: string | null;
    validityEndDate?: string | null;
  }>;
  totalPaidStops: number;
  total: number;
  avgPerStops: number;
  /** From `operations_management`; edit/delete only when null. */
  invoiceId?: number | null;
  adhocServiceId?: number | null;
  adhocService?: {
    adhocServiceId?: number | null;
    adhocName?: string | null;
    adhocVendorPayment?: number | string | null;
  } | null;
}

export interface ServiceType {
  serviceTypeId: number;
  serviceName: string;
}

export interface Vendor {
  userId: number;
  fullName: string;
}

export interface Route {
  routeId: number;
  routeName: string;
}

export interface Vehicle {
  vehicleId: number;
  registrationPlates?: string;
  registrationPlate?: string;
  model?: string;
  fuelType?: string;
}

export interface TokenPayload {
  username: string;
  permissao: string[];
  menu: string[];
  url: string[];
  userTypeId: number;
  userId: number;
  iat: number;
  exp: number;
}

export interface PageTotals {
  total: number;
  avg: number;
  count: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}


