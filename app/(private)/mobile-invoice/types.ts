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
}

export interface GroupedInvoices {
  [key: string]: Invoice[];
}

