import { parseISO, isValid, getMonth, getYear } from "date-fns";
import { Invoice, InvoiceApiResponse } from './types';

/**
 * Obtém mês e ano de uma data
 */
export const getMonthYear = (date: Date) => {
  return { month: getMonth(date) + 1, year: getYear(date) };
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = parseISO(dateString);

    if (!isValid(date)) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    return "N/A";
  }
};

/**
 * Formata valor monetário
 */
export const formatCurrency = (amount: string): string => {
  if (!amount || isNaN(parseFloat(amount))) {
    return "0.00";
  }
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
};

/**
 * Valida e transforma dados de invoice da API
 */
export const validateInvoiceData = (invoice: InvoiceApiResponse): Invoice => {
  // Clean invoiceNumber by removing "null" if present
  let cleanInvoiceNumber = invoice.invoiceNumber;
  if (typeof cleanInvoiceNumber === 'string' && cleanInvoiceNumber.includes("null")) {
    cleanInvoiceNumber = cleanInvoiceNumber.replace("null", "");
  }

  // Try to get the created date from multiple possible field names
  const createdDate = invoice.createdAt || invoice.createdAt || invoice.invoiceCreatedOn || '';

  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: cleanInvoiceNumber,
    userCode: invoice.userCode,
    courier: invoice.courier,
    invoiceCreatedOn: createdDate,
    totalPayment: invoice.totalPayment,
    referenceDate: invoice.referenceDate || '',
    totalStops: invoice.totalStops,
    servicePartnerName: invoice.servicePartnerName ?? undefined,
    userId: invoice.userId ?? undefined,
  };
};

/**
 * Gera meses disponíveis (mês atual + 3 meses anteriores)
 */
export const generateAvailableMonths = (): Array<{ value: string; label: string; date: Date }> => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const available = [];

  // Add current month and 3 previous months
  for (let i = 0; i < 4; i++) {
    const monthIndex = (currentMonth - i + 12) % 12;
    let year = currentYear;
    if (currentMonth - i < 0) {
      year = currentYear - 1;
    }

    available.push({
      value: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      label: `${months[monthIndex]} ${year}`,
      date: new Date(year, monthIndex, 1)
    });
  }

  return available;
};

