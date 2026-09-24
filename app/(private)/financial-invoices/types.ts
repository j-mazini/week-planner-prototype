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

export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  userCode: string;
  courier: string;
  invoiceCreatedOn: string;
  totalPayment: number;
  referenceDate: string;
  totalStops?: number;
  servicePartnerName?: string;
  userId?: number;
}

export interface InvoiceApiResponse {
  invoiceId: number;
  invoiceNumber: string;
  userCode: string;
  courier: string;
  created_at?: string;
  createdAt?: string;
  invoiceCreatedOn?: string;
  totalPayment: number;
  referenceDate: string;
  totalStops?: number;
  servicePartnerName?: string | null;
  userId?: number | null;
}

export type SortField = 'invoiceNumber' | 'courier' | 'referenceDate' | 'invoiceCreatedOn' | 'totalPayment' | 'totalStops';
export type SortDirection = 'asc' | 'desc' | null;

export interface MonthOption {
  value: string;
  label: string;
  date: Date;
}

