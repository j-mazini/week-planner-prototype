/**
 * The payment mode is a cost model's name. The authoritative list is data —
 * `/bff/cost-models` — not a union here, so a model the backend adds must not
 * be a compile error or a thrown mapper. The four below are what the design's
 * fixtures use; they are documentation, not a constraint.
 *
 * Known values: DAF, DR, VSR, SP_VSR.
 */
export type PaymentMode = string;

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
  /** The cost model the mode and the figures below came from. */
  costModelId: number | null;
  /** Derived from the chosen cost model's fixedPrice. */
  payment: Money;
  /** Derived from the chosen cost model's pricePerStop. */
  perStop: number;
  sort: boolean;
  sortValue: number;
  adhoc: string | null;
}
