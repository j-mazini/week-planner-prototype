import type { WeekPlannerRecord } from "../contexts/PlannerContext";

// Table headers (exibição na tabela principal)
export const TABLE_HEADERS = [
  "Route",
  "Name",
  "Payment Mode",
  "Vehicle",
  "Rate",
  "Sort",
  "Sort Value",
  "Extras",
  "Notes",
  "Vendor type",
] as const;

/** Headers do bloco "Submitted" (inclui colunas AD-HOC). */
export const TABLE_HEADERS_SUBMITTED = [
  ...TABLE_HEADERS,
  "AD-HOC Service",
] as const;

/** Colunas na tabela do bloco Not allocated (sem campos de operação / pagamento). */
export const TABLE_HEADERS_NOT_ALLOCATED = ["Route", "Name", "Vendor type"] as const;

/** Colunas padronizadas da tabela AD-HOC (Daily Operations Management, por depósito). */
export const TABLE_HEADERS_ADHOC = [
  "Route",
  "Vendor",
  "Vehicle",
  "AD-HOC Service",
  "AD-HOC Sort",
  "Extra",
  "Notes",
] as const;

// Review table headers (todos os campos para revisão antes de submeter)
export const REVIEW_TABLE_HEADERS = [
  "Date",
  "Route",
  "Name",
  "Payment Mode",
  "Rate",
  "Sort",
  "Sort Value",
  "Extras",
  "Notes",
  "Vehicle",
  "Vendor type",
  "Status",
] as const;

// Form fields (todos os campos para o formulário de edição)
export const FORM_FIELDS = [
  "Date",
  "Name",
  "Route",
  "Payment Mode",
  "Rate",
  "Sort",
  "AD-HOC Sort",
  "AD-HOC Service",
  "Extras",
  "Notes",
  "Vehicle",
  "Vendor type",
  "Status",
  "Deposit Name",
] as const;

// Interface para dados do frontend (formato da tabela)
export interface FrontendOperationRecord {
  weekPlannerId?: number;
  operationId?: number;
  /**
   * ID da linha em `dailyOperationsManagement` quando a página já sincronizou
   * esse registro com a tabela diária.
   */
  dailyOperationsManagementId?: number | null;
  userId?: number; // userId da API; usado na conversão para DTO (evita "Vendor not found" quando o nome não casa na lista de vendors)
  modelEmployeesId?: number | null;
  Date: string;
  Route: string;
  Name: string;
  "Payment Mode": string; // Nome para exibição na tabela
  paymentModeId?: string | number; // ID para uso no formulário
  Rate: number | string;
  Sort: number | string;
  /** Alinhado ao Daily Game Plan: quando Sort é Yes, indica atraso (routeSort 1 / isLate). */
  SortLate?: boolean;
  /** Valor numérico de sort (dailyOperationsManagement.routeSort). Usado no input "Sort value". */
  routeSort?: number | string | null;
  "AD-HOC Sort": number | string;
  "AD-HOC Service": string;
  adhocServiceId?: string | number; // ID para uso no formulário
  Extras: number | string;
  Notes: string;
  Vehicle: string;
  vehicleFuelType?: string;
  "Vendor type": string;
  Status: string;
  "Deposit Name": string;
  depositId?: number;
  /** Espelha `isDayOff` da API; usado no agrupamento por depósito/categoria. */
  isDayOff?: boolean;
  /** Espelha `isSubmitted` da API (bloco Submitted e ações read-only). */
  isSubmitted?: boolean;
  /** Service Partner ID from dailyOperationsManagement. */
  servicePartnerId?: number | null;
  /** Linha gerada na UI: motorista sem registo em `dailyOperationsManagement` nesse dia (mostrar em Not allocated). */
  isSyntheticNotAllocated?: boolean;
  [key: string]: string | number | boolean | undefined | null;
}

export type OperationsHistoryEntry = { date: string; data: FrontendOperationRecord[] };

export type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
};

export type WeekPlannerSourceRecord = WeekPlannerRecord;




