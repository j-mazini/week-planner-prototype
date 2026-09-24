import { Invoice, InvoiceApiResponse, GroupedInvoices } from './types';

/**
 * Valida e processa dados de invoice da API
 */
export const validateInvoiceData = (invoice: InvoiceApiResponse): Invoice => {
  let cleanInvoiceNumber = invoice.invoiceNumber;
  if (typeof cleanInvoiceNumber === 'string' && cleanInvoiceNumber.includes("null")) {
    cleanInvoiceNumber = cleanInvoiceNumber.replace("null", "");
  }

  const createdDate = invoice.createdAt || invoice.createdAt || invoice.invoiceCreatedOn || '';

  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: cleanInvoiceNumber,
    userCode: invoice.userCode,
    courier: invoice.courier,
    invoiceCreatedOn: createdDate,
    totalPayment: invoice.totalPayment,
    referenceDate: invoice.referenceDate || ''
  };
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);

    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Formata valor monetário
 */
export const formatCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) {
    return "£0.00";
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Agrupa invoices por mês
 */
export const groupInvoicesByMonth = (invoices: Invoice[]): GroupedInvoices => {
  const grouped: GroupedInvoices = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  invoices.forEach((invoice) => {
    const date = new Date(invoice.referenceDate || invoice.invoiceCreatedOn);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(invoice);
  });

  // Sort invoices within each month by date (newest first)
  Object.keys(grouped).forEach((month) => {
    grouped[month].sort((a, b) => {
      const dateA = new Date(a.referenceDate || a.invoiceCreatedOn);
      const dateB = new Date(b.referenceDate || b.invoiceCreatedOn);
      return dateB.getTime() - dateA.getTime();
    });
  });

  return grouped;
};

/**
 * Ordena meses (mais recente primeiro)
 */
export const sortMonths = (groupedInvoices: GroupedInvoices): string[] => {
  const parseMonthYear = (monthYearStr: string) => {
    const [month, year] = monthYearStr.split(' ');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = monthNames.indexOf(month);
    return new Date(parseInt(year), monthIndex, 1);
  };

  return Object.keys(groupedInvoices).sort((a, b) => {
    return parseMonthYear(b).getTime() - parseMonthYear(a).getTime();
  });
};

