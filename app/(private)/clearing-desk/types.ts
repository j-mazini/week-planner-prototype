export type PaymentMode = 'DAF' | 'DR' | 'VSR' | 'SP_VSR';

export interface Money {
  /** null when the design shows an em dash: the figure is not known for this payee. */
  amount: number | null;
  /** true when the design labels the amount "flat". */
  flat: boolean;
}

export interface Payee {
  /** Route code, used as the identity throughout: DY1B, MD7E, DHOC, DY1A, LL2A, LL2X. */
  id: string;
  name: string;
  /** null when the design shows NOVEHICLE. */
  vehicle: string | null;
  mode: PaymentMode;
  payment: Money;
  sort: boolean;
  sortValue: number;
  /** null when the design shows a hyphen. */
  adhoc: string | null;
  perStop: number;
}

export interface RouteSummary {
  postcodes: string[];
  stops: number;
  pre12: number;
}

export interface ClearingDeskBoard {
  depot: string;
  routeSummary: RouteSummary;
  payees: Payee[];
  /** Route ids already cleared, most recent first. */
  cleared: string[];
}

/** The fields the editor can change. */
export interface PayeeUpdate {
  name: string;
  vehicle: string | null;
  mode: PaymentMode;
  sort: boolean;
  sortValue: number;
  adhoc: string | null;
}
