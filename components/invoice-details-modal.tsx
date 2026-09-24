"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from "react";
import { getBearerAuthHeader } from "@/lib/auth"
import { useServicePartnerById } from "@/hooks/useServicePartnerById";
import { parseServicePartnerId } from "@/lib/service-partner-utils";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, User, Calendar, FileWarning, X } from "lucide-react";
import { loadJsPDF } from "@/lib/lazy-imports";
import html2canvas from "html2canvas";

interface InvoiceDetailsProps {
  invoiceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface InvoiceDetailsModalRef {
  generatePDF: () => Promise<void>;
}

interface InvoiceDetail {
  invoiceDetailId?: number;
  operationId?: number;
  date: string;
  description: string;
  stops: number;
  rate: number | string;
  routeSort: number | string;
  adhocSort: number | string;
  extra: number | string;
  vatPercentage?: string;
  totalRate?: string;
  total: number | string;
  is_spms: boolean | null;
}

interface UserData {
  userId: number;
  name: string;
  lastName: string;
  email: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
}

interface InvoiceDetailData {
  invoiceId: number;
  invoiceNumber: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  totalStops: number;
  totalVat: string;
  totalOtherDeductions: string;
  totalLiquidationDamageDeductions: string;
  totalPrePaymentDeductions: string;
  totalFixDamageDeductions: string;
  totalTrafficPenaltyDeductions: string;
  totalOperationsManagement?: string;
  totalDetails: string;
  totalDeductions: string;
  subtotal: string;
  total: string;
  balanceDue: number;
  referenceDate: string;
  referenceMonth?: number;
  referenceYear?: number;
  servicePartnerId?: number | null;
  company: {
    companyId: number;
    companyName: string;
    companyStreet: string;
    companyCity: string;
    companyPostalCode: string;
    companyPhone: string;
    companyEmail: string;
    companyVatNumber: string;
  };
  vendor: {
    vendorId: number;
    name: string;
    vendorCode: string;
    vendorStreet: string;
    vendorCity: string;
    vendorPostalCode: string;
    vendorPhone: string;
    vendorEmail: string;
    vendorVatNumber: string;
    servicePartnerId?: number | null;
  };
  user?: UserData;
  details: InvoiceDetail[];
}

const InvoiceDetailsModal = forwardRef<InvoiceDetailsModalRef, InvoiceDetailsProps>(
  ({ invoiceId, open, onOpenChange }, ref) => {
  const [invoiceDetails, setInvoiceDetails] =
    useState<InvoiceDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const spId = useMemo(() => {
    const id = invoiceDetails?.servicePartnerId || invoiceDetails?.vendor?.servicePartnerId;
    return parseServicePartnerId(id);
  }, [invoiceDetails?.servicePartnerId, invoiceDetails?.vendor?.servicePartnerId]);

  const { servicePartner } = useServicePartnerById(spId);

  useEffect(() => {
    if (open && invoiceId) {
      const fetchInvoiceDetails = async () => {
        setIsLoading(true);
        setError(null);
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
            throw new Error("Failed to fetch invoice details");
          }
          const data = await response.json();
          
          // Clean invoiceNumber by removing "null" if present
          if (data.invoiceNumber && typeof data.invoiceNumber === 'string' && data.invoiceNumber.includes("null")) {
            data.invoiceNumber = data.invoiceNumber.replace("null", "");
          }
          
          // Ensure referenceDate is available
          if (!data.referenceDate) {
            console.warn("Reference date not available in invoice details");
          }
          
          setInvoiceDetails(data);
        } catch (error) {
          console.error("Error fetching invoice details:", error);
          setError("Failed to load invoice details. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchInvoiceDetails();
    }
  }, [invoiceId, open]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
    const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      // Format as DD/MM/YYYY using UTC to avoid local-timezone day rollback
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount || isNaN(parseFloat(amount.toString()))) {
      return "£0.00";
    }
    return `£${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Calculate sum of individual detail totals (BEFORE deductions)
  const getSumOfDetailTotals = () => {
    if (!invoiceDetails?.details || invoiceDetails.details.length === 0) {
      return 0;
    }
    return invoiceDetails.details.reduce((sum, detail) => {
      const total = typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total;
      return sum + (total || 0);
    }, 0);
  };

  // Calculate subtotal (Total Details BEFORE deductions)
  const getSubtotal = () => {
    // Use sum of individual detail totals to ensure it's BEFORE deductions
    return getSumOfDetailTotals();
  };

  // Calculate VAT correctly (20% of total routes BEFORE deductions)
  const calculateVat = () => {
    const hasVat = invoiceDetails?.totalVat && parseFloat(invoiceDetails.totalVat) > 0;
    if (!hasVat) return 0;
    
    // Use sum of individual detail totals to ensure it's BEFORE deductions
    const totalRoutes = getSumOfDetailTotals();
    return totalRoutes * 0.20; // 20% VAT
  };

  // Calculate invoice total (Subtotal + VAT)
  const getTotal = () => {
    const subtotal = getSubtotal();
    const vat = calculateVat();
    return subtotal + vat;
  };

  // Calculate Balance Due (Invoice Total - Deductions)
  const getBalanceDue = () => {
    const invoiceTotal = getTotal();
    const deductions = parseFloat(invoiceDetails?.totalDeductions || "0");
    return invoiceTotal - deductions;
  };

  // Format VAT for display in table
  const formatVatDisplay = () => {
    const hasVat = invoiceDetails?.totalVat && parseFloat(invoiceDetails.totalVat) > 0;
    return hasVat ? '20%' : 'no vat';
  };

  // Format Vendor ID: Initials + userId (e.g., CP148)
  const formatVendorId = () => {
    if (invoiceDetails?.user) {
      const firstInitial = invoiceDetails.user.name.charAt(0).toUpperCase();
      const lastInitial = invoiceDetails.user.lastName.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}${invoiceDetails.user.userId}`;
    }
    // Fallback to vendorCode if user data not available
    return invoiceDetails?.vendor.vendorCode || 'N/A';
  };

  // Group invoice details by date
  const groupDetailsByDate = () => {
    if (!invoiceDetails?.details) return [];
    
    const grouped = new Map<string, {
      date: string;
      routes: string[];
      total: number;
    }>();
    
    invoiceDetails.details.forEach((detail) => {
      const dateKey = detail.date;
      const routeName = detail.description.replace('ROUTE COST ID: ', '');
      const total = typeof detail.total === 'string' ? parseFloat(detail.total) : detail.total;
      
      if (grouped.has(dateKey)) {
        const existing = grouped.get(dateKey)!;
        existing.routes.push(routeName);
        existing.total += total;
      } else {
        grouped.set(dateKey, {
          date: dateKey,
          routes: [routeName],
          total: total
        });
      }
    });
    
    return Array.from(grouped.values());
  };

  const generatePDF = useCallback(async () => {
    if (!invoiceDetails) return;

    const element = document.getElementById('invoice-content');
    if (!element) {
      console.error('Invoice content element not found');
      return;
    }

    try {
      // Force desktop layout for PDF generation with compact sizing
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '210mm'; // A4 width
      element.style.maxWidth = '210mm';
      element.classList.add('force-desktop-layout');
      
      // Add temporary style to force desktop layout with compact sizing for PDF
      const style = document.createElement('style');
      style.id = 'pdf-temp-style';
      style.textContent = `
        @media screen {
          #invoice-content.force-desktop-layout {
            font-family: 'Inter', sans-serif !important;
            max-width: 210mm !important;
            width: 210mm !important;
          }
          
          #invoice-content.force-desktop-layout * {
            max-width: none !important;
          }
          
          /* Force grid to display side by side */
          .force-desktop-layout .grid.grid-cols-1.md\\:grid-cols-2,
          .force-desktop-layout [class*="grid-cols-1"][class*="md:grid-cols-2"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          /* Force flex row layout */
          .force-desktop-layout .flex.flex-col.lg\\:flex-row,
          .force-desktop-layout .flex.flex-col.sm\\:flex-row,
          .force-desktop-layout [class*="flex-col"][class*="lg:flex-row"],
          .force-desktop-layout [class*="flex-col"][class*="sm:flex-row"] {
            flex-direction: row !important;
          }
          
          /* Compact spacing for PDF */
          .force-desktop-layout .space-y-4 {
            gap: 0.25rem !important;
          }
          
          .force-desktop-layout .space-y-2 {
            gap: 0.25rem !important;
          }
          
          .force-desktop-layout .space-y-1 {
            gap: 0.125rem !important;
          }
          
          .force-desktop-layout .gap-4 {
            gap: 0.25rem !important;
          }
          
          .force-desktop-layout .gap-2 {
            gap: 0.25rem !important;
          }
          
          .force-desktop-layout .gap-3 {
            gap: 0.25rem !important;
          }
          
          .force-desktop-layout .gap-1\.5 {
            gap: 0.125rem !important;
          }
          
          .force-desktop-layout .gap-1 {
            gap: 0.125rem !important;
          }
          
          /* Compact padding */
          .force-desktop-layout .px-4 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .force-desktop-layout .px-2 {
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
          }
          
          .force-desktop-layout .py-2 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .force-desktop-layout .py-1 {
            padding-top: 0.125rem !important;
            padding-bottom: 0.125rem !important;
          }
          
          .force-desktop-layout .p-2 {
            padding: 0.25rem !important;
          }
          
          .force-desktop-layout .p-4 {
            padding: 0.25rem !important;
          }
          
          .force-desktop-layout .py-3 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .force-desktop-layout .px-3 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          /* Compact text sizes */
          .force-desktop-layout .text-xs {
            font-size: 0.625rem !important;
            line-height: 0.875rem !important;
          }
          
          .force-desktop-layout .text-sm {
            font-size: 0.7rem !important;
            line-height: 0.95rem !important;
          }
          
          .force-desktop-layout .text-base {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }
          
          .force-desktop-layout .text-lg {
            font-size: 0.8rem !important;
            line-height: 1.05rem !important;
          }
          
          /* Compact margins */
          .force-desktop-layout .mb-4 {
            margin-bottom: 0.25rem !important;
          }
          
          .force-desktop-layout .mb-2 {
            margin-bottom: 0.25rem !important;
          }
          
          .force-desktop-layout .mb-1 {
            margin-bottom: 0.125rem !important;
          }
          
          .force-desktop-layout .mb-1\.5 {
            margin-bottom: 0.2rem !important;
          }
          
          .force-desktop-layout .mb-0\.5 {
            margin-bottom: 0.1rem !important;
          }
          
          /* Table cell padding */
          .force-desktop-layout table td,
          .force-desktop-layout table th {
            padding: 0.1rem 0.3rem !important;
          }
          
          /* Ensure cards display properly */
          .force-desktop-layout .bg-\\[\\#e3f2fd\\] {
            background-color: #e3f2fd !important;
          }
          
          .force-desktop-layout .bg-\\[\\#1e3a8a\\] {
            background-color: #1e3a8a !important;
          }
          
          .force-desktop-layout .bg-\\[\\#fee2e2\\] {
            background-color: #fee2e2 !important;
          }
          
          .force-desktop-layout .border-\\[\\#b3d9f5\\] {
            border-color: #b3d9f5 !important;
          }
          
          .force-desktop-layout .border-\\[\\#fcc\\] {
            border-color: #fcc !important;
          }
          
          .force-desktop-layout .text-\\[\\#27ae60\\] {
            color: #27ae60 !important;
          }
          
          .force-desktop-layout .text-\\[\\#e74c3c\\] {
            color: #e74c3c !important;
          }
          
          .force-desktop-layout .text-\\[\\#1e3a8a\\] {
            color: #1e3a8a !important;
          }
          
          /* Reduce icon sizes */
          .force-desktop-layout .w-10 {
            width: 1.75rem !important;
          }
          
          .force-desktop-layout .h-10 {
            height: 1.75rem !important;
          }
          
          .force-desktop-layout .w-5 {
            width: 0.9rem !important;
          }
          
          .force-desktop-layout .h-5 {
            height: 0.9rem !important;
          }
          
          .force-desktop-layout .w-4 {
            width: 0.7rem !important;
          }
          
          .force-desktop-layout .h-4 {
            height: 0.7rem !important;
          }
          
          .force-desktop-layout .w-3 {
            width: 0.5rem !important;
          }
          
          .force-desktop-layout .h-3 {
            height: 0.5rem !important;
          }
          
          /* Ensure proper spacing for PDF - Ultra Reduced */
          .force-desktop-layout .space-y-2 {
            gap: 0.2rem !important;
          }
          
          .force-desktop-layout .space-y-1 {
            gap: 0.1rem !important;
          }
          
          .force-desktop-layout .gap-2 {
            gap: 0.2rem !important;
          }
          
          .force-desktop-layout .mb-2 {
            margin-bottom: 0.2rem !important;
          }
          
          .force-desktop-layout .mb-1\\.5 {
            margin-bottom: 0.15rem !important;
          }
          
          .force-desktop-layout .px-4 {
            padding-left: 0.4rem !important;
            padding-right: 0.4rem !important;
          }
          
          .force-desktop-layout .py-3 {
            padding-top: 0.2rem !important;
            padding-bottom: 0.2rem !important;
          }
          
          .force-desktop-layout .py-2 {
            padding-top: 0.15rem !important;
            padding-bottom: 0.15rem !important;
          }
          
          .force-desktop-layout .py-1\\.5 {
            padding-top: 0.1rem !important;
            padding-bottom: 0.1rem !important;
          }
          
          .force-desktop-layout .py-0\\.5 {
            padding-top: 0.05rem !important;
            padding-bottom: 0.05rem !important;
          }
          
          .force-desktop-layout .p-2 {
            padding: 0.2rem !important;
          }
          
          .force-desktop-layout .px-2 {
            padding-left: 0.2rem !important;
            padding-right: 0.2rem !important;
          }
          
          .force-desktop-layout .px-3 {
            padding-left: 0.3rem !important;
            padding-right: 0.3rem !important;
          }
          
          /* Table cell padding - Ultra Minimal */
          .force-desktop-layout table td,
          .force-desktop-layout table th {
            padding: 0.08rem 0.3rem !important;
          }
          
          /* Ensure border is exactly 1px */
          .force-desktop-layout table tbody tr {
            border-bottom: 1px solid #e5e7eb !important;
          }
          
          .force-desktop-layout table tbody tr:last-child {
            border-bottom: none !important;
          }
          
          /* Text sizes for PDF - Ultra Reduced */
          .force-desktop-layout .text-\\[10px\\] {
            font-size: 0.55rem !important;
            line-height: 0.75rem !important;
          }
          
          .force-desktop-layout .text-xs {
            font-size: 0.55rem !important;
            line-height: 0.75rem !important;
          }
          
          .force-desktop-layout .text-sm {
            font-size: 0.65rem !important;
            line-height: 0.85rem !important;
          }
          
          .force-desktop-layout .text-base {
            font-size: 0.7rem !important;
            line-height: 0.9rem !important;
          }
          
          .force-desktop-layout .text-lg {
            font-size: 0.75rem !important;
            line-height: 0.95rem !important;
          }
          
          .force-desktop-layout .text-xl {
            font-size: 0.85rem !important;
            line-height: 1.05rem !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Wait for DOM to update and reflow
      await new Promise(resolve => setTimeout(resolve, 200));

      // Captura o elemento HTML como canvas com alta qualidade
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI (210mm)
        windowWidth: 794,
      });

      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.classList.remove('force-desktop-layout');
      const tempStyle = document.getElementById('pdf-temp-style');
      if (tempStyle) tempStyle.remove();

      const imgData = canvas.toDataURL('image/png');
      
      // Calcula as dimensões para o PDF
      const JsPDF = await loadJsPDF();
      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcula a altura proporcional da imagem
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Se a imagem for maior que a página, escala para caber em uma única página
      if (imgHeight > pdfHeight) {
        // Redimensiona proporcionalmente para caber na altura da página
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * pdfHeight) / canvas.height;
        
        // Se mesmo com o redimensionamento pela altura, a largura ultrapassar, ajusta pela largura
        if (imgWidth > pdfWidth) {
          imgWidth = pdfWidth;
          imgHeight = (canvas.height * pdfWidth) / canvas.width;
          // Força o fit pela altura novamente se necessário
          if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
          }
        }
      }

      // Centraliza horizontalmente se a imagem for menor que a largura da página
      const xPosition = (pdfWidth - imgWidth) / 2;

      // Adiciona a imagem escalada para caber em uma única página
      pdf.addImage(imgData, 'PNG', xPosition, 0, imgWidth, imgHeight)

      // Salva o PDF com timestamp para evitar cache
      const timestamp = new Date().getTime();
      pdf.save(`Invoice_${invoiceDetails.invoiceNumber}_${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Cleanup in case of error
      const element = document.getElementById('invoice-content');
      if (element) {
        element.style.width = '';
        element.style.maxWidth = '';
        element.classList.remove('force-desktop-layout');
      }
      const tempStyle = document.getElementById('pdf-temp-style');
      if (tempStyle) tempStyle.remove();
    }
  }, [invoiceDetails]);

  // Expose generatePDF function via ref
  useImperativeHandle(ref, () => ({
    generatePDF,
  }), [generatePDF]);

  return (
    <>
      <style jsx global>{`
        [data-radix-dialog-overlay] {
          z-index: 1001 !important;
        }
        [data-radix-dialog-content] {
          z-index: 1002 !important;
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="z-[1001]" />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-[1002] grid w-[95vw] max-w-4xl max-h-[95vh] lg:max-h-[96vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 overflow-y-auto p-2 sm:p-6 pb-8 sm:pb-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading invoice details...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!isLoading && !error && invoiceDetails && (
          <div id="invoice-content" className="space-y-2 px-4 py-3 pb-3 bg-white font-['Inter',sans-serif] shadow-sm">
            {/* Header Section - Service Partner Data Container */}
            <div className="bg-white p-3 rounded-lg border mb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex items-start gap-2 w-full sm:w-auto">
                  {/* Logo - Service Partner initials or Company */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-base sm:text-xl font-bold">
                      {servicePartner
                        ? (servicePartner.partnerName?.substring(0, 2) || 'SP').toUpperCase()
                        : 'BA'
                      }
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg font-bold text-blue-900 mb-1">
                      {servicePartner
                        ? servicePartner.partnerName
                        : invoiceDetails.company.companyName
                      }
                    </h1>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                      {servicePartner ? (
                        <>
                          <span>{servicePartner.address || 'N/A'}</span>
                          <span>{servicePartner.phone || 'N/A'}</span>
                        </>
                      ) : (
                        <>
                          <span>{invoiceDetails.company.companyStreet}</span>
                          <span>{invoiceDetails.company.companyEmail}</span>
                          <span>VAT: {invoiceDetails.company.companyVatNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2">
                    <p className="text-[10px] sm:text-xs font-bold text-blue-900 uppercase">SELF BILLING INVOICE</p>
                    <p className="text-blue-900 font-bold text-xs sm:text-sm">#{invoiceDetails.invoiceNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor and Invoice Details - Light Blue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* Vendor Details Card */}
              <div className="bg-[#e3f2fd] rounded-lg border border-[#b3d9f5] overflow-hidden">
                {/* Header with dark blue background */}
                <div className="bg-[#1e3a8a] px-2 py-1.5 flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                    <User className="text-white w-3 h-3" />
                  </div>
                  <h3 className="font-bold text-white text-[10px]">Vendor Details</h3>
                </div>
                {/* Content - Light blue background matching image */}
                <div className="p-2 space-y-1 text-[10px] bg-[#e3f2fd]">
                  <div>
                    <span className="text-black">Name: </span>
                    <span className="font-semibold text-[#1e3a8a]">{invoiceDetails.vendor?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-black">Vendor ID: </span>
                    <span className="font-semibold text-black">{formatVendorId()}</span>
                  </div>
                  <div>
                    <span className="text-black">Email: </span>
                    <span className="font-semibold text-[#1e3a8a] underline">{invoiceDetails.vendor?.vendorEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Details Card */}
              <div className="bg-[#e3f2fd] rounded-lg border border-[#b3d9f5] overflow-hidden">
                {/* Header with dark blue background */}
                <div className="bg-[#1e3a8a] px-2 py-1.5 flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                    <Calendar className="text-white w-3 h-3" />
                  </div>
                  <h3 className="font-bold text-white text-[10px]">Invoice Details</h3>
                </div>
                {/* Content - Light blue background matching image */}
                <div className="p-2 space-y-1 text-[10px] bg-[#e3f2fd]">
                  <div>
                    <span className="text-black">Invoice Date: </span>
                    <span className="font-semibold text-[#1e3a8a]">
                      {(() => {
                        let year = invoiceDetails.referenceYear;
                        let month = invoiceDetails.referenceMonth;
                        
                        if (!year || !month) {
                          if (invoiceDetails.referenceDate) {
                            const refDate = new Date(invoiceDetails.referenceDate);
                            year = refDate.getFullYear();
                            month = refDate.getMonth() + 1;
                          }
                        }
                        
                        if (year && month) {
                          const lastDay = new Date(year, month, 0).getDate();
                          const lastDayDate = new Date(year, month - 1, lastDay);
                          return formatDate(lastDayDate.toISOString());
                        }
                        
                        return formatDate(invoiceDetails.invoiceDate);
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-black">Due Date: </span>
                    <span className="font-semibold text-[#1e3a8a]">
                      {(() => {
                        let year = invoiceDetails.referenceYear;
                        let month = invoiceDetails.referenceMonth;
                        
                        if (!year || !month) {
                          if (invoiceDetails.referenceDate) {
                            const refDate = new Date(invoiceDetails.referenceDate);
                            year = refDate.getFullYear();
                            month = refDate.getMonth() + 1;
                          }
                        }
                        
                        if (year && month) {
                          const nextMonth = month === 12 ? 1 : month + 1;
                          const nextYear = month === 12 ? year + 1 : year;
                          const dueDate = new Date(nextYear, nextMonth - 1, 15);
                          return formatDate(dueDate.toISOString());
                        }
                        
                        return formatDate(invoiceDetails.dueDate);
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-black">Payment Terms: </span>
                    <span className="font-semibold text-[#1e3a8a]">{invoiceDetails.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-black">Total Stops: </span>
                    <span className="font-semibold text-[#1e3a8a]">{invoiceDetails.totalStops}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table - Dark Blue Header - Compact for PDF */}
            {invoiceDetails.details && invoiceDetails.details.length > 0 && (
              <div className="bg-white rounded-lg overflow-hidden mb-2">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e3a8a] hover:bg-[#1e3a8a]">
                        <TableHead className="text-white font-bold px-2 py-0.5 text-[10px] uppercase text-left">DATE</TableHead>
                        <TableHead className="text-white font-bold px-2 py-0.5 text-[10px] uppercase text-left">ROUTE</TableHead>
                        <TableHead className="text-white font-bold px-2 py-0.5 text-[10px] uppercase text-center">VAT</TableHead>
                        <TableHead className="text-white font-bold px-2 py-0.5 text-[10px] uppercase text-right">AMOUNT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupDetailsByDate().map((groupedDetail, index) => (
                        <TableRow 
                          key={`detail-${groupedDetail.date}-${index}`} 
                          className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50"
                        >
                          <TableCell className="text-black px-2 py-0.5 text-[10px]">{formatDate(groupedDetail.date)}</TableCell>
                          <TableCell className="text-black px-2 py-0.5 text-[10px]">{groupedDetail.routes.join(', ')}</TableCell>
                          <TableCell className="text-black px-2 py-0.5 text-[10px] text-center">{formatVatDisplay()}</TableCell>
                          <TableCell className="text-black px-2 py-0.5 text-[10px] text-right font-semibold">{formatCurrency(groupedDetail.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Summary Section - Two Columns: Deductions (Left) and Invoice Summary (Right) */}
            <div className="flex flex-col lg:flex-row gap-2 mb-2">
              {/* Deductions - Left Column - Light Red Background */}
              <div className="flex-1 bg-[#fee2e2] rounded-lg p-2 border border-[#fcc]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 bg-[#e74c3c] rounded-full flex items-center justify-center shrink-0">
                    <FileWarning className="text-white w-3 h-3" />
                  </div>
                  <h3 className="font-bold text-black text-[10px]">Deductions</h3>
                </div>
                <div className="space-y-1 text-[10px]">
                  {/* Traffic Penalty */}
                  {(parseFloat(invoiceDetails.totalTrafficPenaltyDeductions) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-black">Traffic Penalties:</span>
                      <span className="font-bold text-black">-{formatCurrency(invoiceDetails.totalTrafficPenaltyDeductions)}</span>
                    </div>
                  )}
                  
                  {/* Pre-payments */}
                  {(parseFloat(invoiceDetails.totalPrePaymentDeductions) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-black">Pre-Payments:</span>
                      <span className="font-bold text-black">-{formatCurrency(invoiceDetails.totalPrePaymentDeductions)}</span>
                    </div>
                  )}
                  
                  {/* Other */}
                  {(parseFloat(invoiceDetails.totalOtherDeductions) || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-black">Others:</span>
                      <span className="font-bold text-black">-{formatCurrency(invoiceDetails.totalOtherDeductions)}</span>
                    </div>
                  )}

                  {/* Liquidation Damages */}
                  {(parseFloat(invoiceDetails.totalLiquidationDamageDeductions) || 0) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-black">Liquidation Damages:</span>
                      <span className="font-bold text-black">-{formatCurrency(invoiceDetails.totalLiquidationDamageDeductions)}</span>
                    </div>
                  )}

                  {/* Repair Damages */}
                  {(parseFloat(invoiceDetails.totalFixDamageDeductions) || 0) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-black">Repair Damages:</span>
                      <span className="font-bold text-black">-{formatCurrency(invoiceDetails.totalFixDamageDeductions)}</span>
                    </div>
                  )}
                  
                  {/* Total Deductions */}
                  {(parseFloat(invoiceDetails.totalDeductions) || 0) > 0 && (
                    <div className="flex justify-between font-bold text-[#e74c3c] text-[10px] border-t border-gray-300 pt-1.5 mt-1.5">
                      <span>Total Deductions:</span>
                      <span>-{formatCurrency(invoiceDetails.totalDeductions)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Summary - Right Column - White Background */}
              <div className="flex-1 bg-white rounded-lg p-2 border border-gray-200">
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-black">Invoice Subtotal:</span>
                    <span className="font-bold text-black">{formatCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">VAT:</span>
                    <span className="font-bold text-black">{formatCurrency(calculateVat())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-black text-[10px] border-t border-gray-300 pt-1.5 mt-1.5">
                    <span>Invoice Total:</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Due - Dark Blue Bar */}
            <div className="bg-[#1e3a8a] px-4 py-4 rounded-lg flex justify-between items-center">
              <span className="text-white font-bold text-[10px]">Balance Due:</span>
              <span className="text-white font-bold text-base">
                {formatCurrency(getBalanceDue())}
              </span>
            </div>
          </div>
        )}

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
});

InvoiceDetailsModal.displayName = "InvoiceDetailsModal";

export default InvoiceDetailsModal;
