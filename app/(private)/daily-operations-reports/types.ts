export interface Filters {
  dateFrom: string;
  dateTo: string;
  depot: string;
  loop: string;
  search: string;
}

export interface TransformedReportData {
  date: string;
  route: string;
  vendor: string;
  vrn: string;
  tw: number | null;
  depart: string | null;
  arrive: string | null;
  workHours: string | number | null;
  stops: number;
  note: string;
  depot: string;
  breakTime: string | null;
  depositId?: number;
  depositName?: string;
  loop?: string | null;
  /** Route sort numeric value (no longer used to decide sort time; kept for display/back-compat) */
  routeSort?: number | string | null;
  /** Sort flag (operations_management.is_sort): sort time is added if and only if isSort === true */
  isSort?: boolean | null;
  /** Work Hours column value: base + sort (once per depot/day when Sort=Yes) */
  workHoursWithSort?: number;
  /** When false, Stops column is highlighted (data did not come from SPMS). */
  isSpms?: boolean;
}


