import { createPDFWithHeader, addSummaryBox, drawTable, PDF_COLORS } from '@/lib/pdf-utils';
import type { Vendor, VendorType, CostModel, ServicePartner } from '@/lib/vendors-api';
import { formatDateForDisplay } from './vendor-utils';

const getStatusText = (vendor: Vendor): string => {
  if (vendor.status) {
    return vendor.status;
  }
  const today = new Date();
  if (!vendor.finishDate || new Date(vendor.finishDate) > today) {
    return 'Active';
  }
  return 'Inactive';
};

const getTrainingStatus = (vendor: Vendor): string => {
  const isComplete = vendor.cargoTraining && vendor.dangerousGoodsTraining && vendor.manualHandlingTraining;
  return isComplete ? 'Complete' : 'Incomplete';
};

const getDocumentsStatus = (vendor: Vendor): string => {
  const isVerified = vendor.criminalRecordDate && vendor.dvlaCheckDate;
  return isVerified ? 'Verified' : 'Pending';
};

export async function exportVendorsToPDF(
  vendors: Vendor[],
  vendorTypes: VendorType[],
  costModels: CostModel[],
  statusFilter: string,
  vendorTypeFilter: string,
  searchTerm: string,
  servicePartners?: ServicePartner[]
): Promise<Blob> {
  try {
    const pdf = await createPDFWithHeader({
      title: 'Vendor Management',
      subtitle: 'Vendors Report',
      orientation: 'landscape',
    });

    const margin = 14;
    let currentY = margin + 40;

    // Criar maps para lookup
    const vendorTypeMap = new Map<string, string>();
    vendorTypes.forEach((vt) => {
      if (vt.vendorTypeId && vt.nameType) {
        vendorTypeMap.set(String(vt.vendorTypeId), vt.nameType);
      }
    });

    const costModelMap = new Map<string, string>();
    costModels.forEach((cm) => {
      if (cm.costModelId && cm.name) {
        costModelMap.set(String(cm.costModelId), cm.name);
      }
    });

    const servicePartnerMap = new Map<number, string>();
    if (servicePartners) {
      servicePartners.forEach((sp) => {
        servicePartnerMap.set(sp.servicePartnerId, sp.partnerName);
      });
    }

    // Summary box
    const activeCount = vendors.filter((v) => getStatusText(v) === 'Active').length;
    const inactiveCount = vendors.filter((v) => getStatusText(v) === 'Inactive').length;
    const summaryData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Total Vendors', value: vendors.length.toString() },
      { label: 'Active', value: activeCount.toString() },
      { label: 'Inactive', value: inactiveCount.toString() },
    ];

    if (statusFilter !== 'all') {
      summaryData.push({ label: 'Status Filter', value: statusFilter });
    }
    if (vendorTypeFilter !== 'all') {
      summaryData.push({ label: 'Vendor Type Filter', value: vendorTypeFilter });
    }
    if (searchTerm) {
      summaryData.push({ label: 'Search Term', value: searchTerm });
    }

    currentY = addSummaryBox(pdf, currentY, summaryData);
    currentY += 15;

    // Table headers and data
    const headers = ['Name', 'Email', 'Vendor Type', 'Payment Model', 'Service Partner', 'Status', 'Start Date', 'Training', 'Documents'];
    const columnWidths = [35, 45, 30, 30, 35, 20, 28, 28, 28];

    const tableData = vendors.map((vendor) => [
      `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || '-',
      String(vendor.email || '-'),
      vendor.vendorType
        ? (vendorTypeMap.get(String(vendor.vendorType)) || vendor.vendorType)
        : '-',
      vendor.paymentModel
        ? (costModelMap.get(String(vendor.paymentModel)) || vendor.paymentModel)
        : '-',
      vendor.servicePartnerId
        ? (servicePartnerMap.get(vendor.servicePartnerId) || String(vendor.servicePartnerId))
        : '-',
      getStatusText(vendor),
      vendor.startDate ? formatDateForDisplay(vendor.startDate) : '-',
      getTrainingStatus(vendor),
      getDocumentsStatus(vendor),
    ]);

    if (tableData.length > 0) {
      drawTable(pdf, currentY, headers, tableData, columnWidths);
    } else {
      // Se não houver dados, mostrar mensagem
      pdf.setFontSize(10);
      pdf.setTextColor(...PDF_COLORS.textDark);
      pdf.text('No data available', margin, currentY);
    }

    // Converter PDF para ArrayBuffer e criar Blob
    const pdfData = pdf.output('arraybuffer');
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


