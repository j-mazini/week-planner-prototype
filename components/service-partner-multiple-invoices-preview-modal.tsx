"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getBearerAuthHeader } from "@/lib/auth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { guardedFetch } from "@/lib/in-flight-guard";

interface ServicePartnerMultipleInvoicesPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number;
  year: number;
  servicePartners?: ServicePartnerSummary[];
  operationsByPartner?: Record<string, ServicePartnerOperation[]>;
  onInvoicesCreated?: () => void;
}

interface ServicePartnerSummary {
  service_partner_id: number | string;
  partner_name?: string;
  [key: string]: unknown;
}

interface ServicePartnerOperation {
  date: string;
  routeName?: string;
  routeId?: number | string;
  rate?: number | string;
  note?: string;
  [key: string]: unknown;
}

const BA_COMPANY = {
  name: "BA EXPRESS LIMITED",
  address: "20 The Laurels",
  email: "info@baexpress.co.uk",
  vat: "GB238595859",
};

export default function ServicePartnerMultipleInvoicesPreviewModal({
  open,
  onOpenChange,
  month,
  year,
  servicePartners = [],
  operationsByPartner = {},
  onInvoicesCreated,
}: ServicePartnerMultipleInvoicesPreviewModalProps) {
  const { data: company } = useCurrentCompany();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());

  // Get list of service partners that have operations
  const partnersWithOps = useMemo(() => {
    return servicePartners.filter(
      (sp: ServicePartnerSummary) => operationsByPartner[String(sp.service_partner_id)]?.length > 0
    );
  }, [servicePartners, operationsByPartner]);

  const currentPartner = partnersWithOps[currentIndex];

  const currentOperations = useMemo(() => {
    return currentPartner
      ? operationsByPartner[String(currentPartner.service_partner_id)] || []
      : [];
  }, [currentPartner, operationsByPartner]);

  const currentInvoiceData = useMemo(() => {
    if (!currentPartner || currentOperations.length === 0) return null;

    let totalAmount = 0;
    const routes = currentOperations.map((op: ServicePartnerOperation) => {
      const amount = parseFloat(String(op.rate ?? "0"));
      totalAmount += amount;
      return {
        date: op.date,
        route: op.routeName || `Route ${op.routeId || ''}`,
        stops: 0,
        amount,
        description: op.note || '—',
      };
    });

    return {
      routes,
      totalStops: 0,
      totalAmount,
      servicePartnerId: currentPartner.service_partner_id,
      servicePartnerName: currentPartner.partner_name,
      month,
      year,
    };
  }, [currentPartner, currentOperations, month, year]);

  const periodLabel = useMemo(() => {
    return new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase();
  }, [month, year]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const handleNext = () => {
    if (currentIndex < partnersWithOps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTogglePartner = (partnerId: string | number) => {
    const partnerIdStr = String(partnerId);
    const newSelected = new Set(selectedPartnerIds);
    if (newSelected.has(partnerIdStr)) {
      newSelected.delete(partnerIdStr);
    } else {
      newSelected.add(partnerIdStr);
    }
    setSelectedPartnerIds(newSelected);
  };

  const handleConfirmCreateAll = async () => {
    try {
      setIsCreating(true);
      setError(null);

      if (!company?.companyId) {
        throw new Error("Company ID not found. Please reload the page.");
      }

      if (selectedPartnerIds.size === 0) {
        throw new Error("Please select at least one service partner");
      }

      const invoicesToCreate = partnersWithOps
        .filter((partner) => selectedPartnerIds.has(String(partner.service_partner_id)))
        .map((partner) => {
          const ops = operationsByPartner[String(partner.service_partner_id)] || [];
          return {
            data: `${year}-${String(month).padStart(2, "0")}-01`,
            service_partner_id: partner.service_partner_id,
            company_id: company.companyId,
            items: ops.map((op: ServicePartnerOperation) => ({
              route_name: op.routeName || `Route ${op.routeId || ''}`,
              date: op.date,
              stops: 0,
              amount: parseFloat(String(op.rate ?? "0")),
              note: op.note || '—',
            })),
          };
        });

      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/service-partner-invoices/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
          },
          body: JSON.stringify(invoicesToCreate),
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to create invoices");
      }

      onInvoicesCreated?.();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating invoices";
      console.error("Invoices creation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  if (partnersWithOps.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white" onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle className="sr-only">Multiple Invoices Preview</DialogTitle>
          <div className="text-center py-8 text-gray-500 p-6">
            No service partners with operations available for this period
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white" onInteractOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Multiple Invoices Preview</DialogTitle>
        {currentInvoiceData ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-2 flex justify-between items-start">
              <h1 className="text-xl font-bold text-slate-900">{currentInvoiceData.servicePartnerName}</h1>
            </div>
            <div className="mb-4 text-right">
              <p className="text-sm text-gray-600">
                Page {currentIndex + 1} of {partnersWithOps.length}
              </p>
            </div>

            {/* Company Info & Invoice Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-300">
              <div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-900 text-white rounded-lg p-2 w-10 h-10 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    BA
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{BA_COMPANY.name}</h2>
                    <p className="text-xs text-gray-600 mt-0.5">{BA_COMPANY.address}</p>
                    <p className="text-xs text-gray-600">{BA_COMPANY.email}</p>
                    <p className="text-xs text-gray-600">VAT: {BA_COMPANY.vat}</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-blue-900 mb-1">SERVICE PARTNER INVOICE</p>
                <p className="text-xs font-bold bg-blue-600 text-white px-3 py-0.5 rounded inline-block">
                  {periodLabel}
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Period</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{periodLabel}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Company</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{BA_COMPANY.name}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Total Items</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{currentInvoiceData.routes.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Total Stops</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{currentInvoiceData.totalStops}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Total Amount</p>
                <p className="text-sm font-bold text-blue-900 mt-1">{formatCurrency(currentInvoiceData.totalAmount)}</p>
              </div>
            </div>

            {/* Routes Table */}
            <div className="mb-3">
              <div className="bg-blue-900 text-white px-4 py-3 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs">{currentInvoiceData.servicePartnerName}</span>
                  <span className="font-semibold text-xs">{BA_COMPANY.name} - {periodLabel}</span>
                </div>
              </div>

              <div className="border border-t-0 border-gray-300 rounded-b-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Route</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Note</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Stops</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoiceData.routes.map((route, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-slate-800">{route.route}</td>
                        <td className="px-4 py-2 text-slate-600">{route.description}</td>
                        <td className="px-4 py-2 text-center text-slate-600">{route.stops}</td>
                        <td className="px-4 py-2 text-right font-medium text-slate-800">{formatCurrency(route.amount)}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{formatDate(route.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal */}
              <div className="bg-gray-50 px-4 py-2 text-right border border-t-0 border-gray-300">
                <p className="font-semibold text-slate-800 text-sm">Subtotal: {formatCurrency(currentInvoiceData.totalAmount)}</p>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-blue-900 text-white px-4 py-3 rounded-lg flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold text-sm">Grand Total</p>
                <p className="text-xs text-gray-300 mt-0.5">(1 invoice, {currentInvoiceData.routes.length} items)</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(currentInvoiceData.totalAmount)}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isCreating}
                    className="px-3 py-2 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === partnersWithOps.length - 1 || isCreating}
                    className="px-3 py-2 text-sm flex items-center gap-2"
                  >
                    Next Service Partner
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={() => currentPartner && handleTogglePartner(currentPartner.service_partner_id)}
                  disabled={isCreating}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${
                    currentPartner && selectedPartnerIds.has(String(currentPartner.service_partner_id))
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-150"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border ${selectedPartnerIds.has(String(currentPartner?.service_partner_id || 0)) ? "bg-blue-600 border-blue-600" : "border-gray-300"} flex items-center justify-center`}>
                    {selectedPartnerIds.has(String(currentPartner?.service_partner_id || 0)) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>
                    {currentPartner && selectedPartnerIds.has(String(currentPartner.service_partner_id))
                      ? "Selected"
                      : "Select this partner"}
                  </span>
                </button>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmCreateAll}
                  disabled={isCreating || selectedPartnerIds.size === 0}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Confirm & Create Selected (${selectedPartnerIds.size})`
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 p-6">
            Loading invoice data...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
