import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { Invoice } from './types';
import { formatDate, formatCurrency, getMonthYear } from './utils';
import { getBearerAuthHeader } from '@/lib/auth'
import { loadXlsx } from '@/lib/lazy-imports';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

interface ExportParams {
  invoices: Invoice[];
  userTypeId: number;
  selectedMonth: Date | null;
}

interface InvoiceDetailsResponse {
  totalStops: number;
}

/**
 * Busca os detalhes de uma invoice para obter o totalStops
 */
const fetchInvoiceDetails = async (invoiceId: number): Promise<number | null> => {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/bff/invoices/${invoiceId}/details`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch details for invoice ${invoiceId}: ${response.status}`);
      return null;
    }

    const data: InvoiceDetailsResponse = await response.json();
    return data.totalStops ?? null;
  } catch (error) {
    console.error(`Error fetching invoice details for ${invoiceId}:`, error);
    return null;
  }
};

export const exportInvoicesToExcel = async ({ invoices, userTypeId: _userTypeId, selectedMonth: _selectedMonth }: ExportParams): Promise<Blob> => {
  // Verificar se há dados para exportar
  if (!invoices || invoices.length === 0) {
    throw new Error("No data available for download");
  }

  // Buscar totalStops para cada invoice em paralelo
  const invoicesWithStops = await Promise.all(
    invoices.map(async (invoice) => {
      // Se já tiver totalStops, usar ele, senão buscar dos detalhes
      if (invoice.totalStops !== undefined && invoice.totalStops !== null) {
        return { ...invoice, totalStops: invoice.totalStops };
      }
      
      const totalStops = await fetchInvoiceDetails(invoice.invoiceId);
      return { ...invoice, totalStops: totalStops ?? undefined };
    })
  );

  // Preparar os dados para exportação
  const exportData = invoicesWithStops.map((invoice) => ({
    "Record ID": invoice.invoiceNumber || "",
    "Vendor": invoice.courier || "",
    "Service Partner": invoice.servicePartnerName || "",
    "Period": formatDate(invoice.referenceDate),
    "Created On": formatDate(invoice.invoiceCreatedOn),
    "Amount": formatCurrency(invoice.totalPayment?.toString() || "0"),
    "Total Stops": invoice.totalStops ?? "",
  }));

  const XLSX = await loadXlsx();
  // Criar uma nova workbook
  const workbook = XLSX.utils.book_new();

  // Criar uma worksheet a partir dos dados
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Adjust column widths (larger wch = more space between columns)
  const columnWidths = [
    { wch: 18 }, // Record ID
    { wch: 30 }, // Vendor
    { wch: 25 }, // Service Partner
    { wch: 18 }, // Period
    { wch: 18 }, // Created On
    { wch: 18 }, // Amount
    { wch: 15 }, // Total Stops
  ];
  worksheet['!cols'] = columnWidths;

  // Adicionar a worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  // Gerar o arquivo Excel como array buffer
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    compression: true 
  });

  // Criar e retornar blob com o MIME type correto
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};

// Função helper para gerar o nome do arquivo
export const getExportFileName = ({ userTypeId, selectedMonth }: { userTypeId: number; selectedMonth: Date | null }): string => {
  if (userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN && selectedMonth) {
    // Admin: usar o mês selecionado
    const { month, year } = getMonthYear(selectedMonth);
    return `invoices-${month}-${year}`;
  } else {
    // Courier ou outros: usar data atual
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `invoices-${month}-${year}`;
  }
};
