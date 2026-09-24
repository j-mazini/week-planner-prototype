"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getBearerAuthHeader } from "@/lib/auth";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { guardedFetch } from "@/lib/in-flight-guard";

interface ServicePartnerInvoicePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicePartnerId: number;
  month: number;
  year: number;
  servicePartnerName: string;
  operationsData?: ServicePartnerOperationItem[];
  onInvoiceCreated?: () => void;
}

interface ServicePartnerOperationItem {
  date: string;
  routeName?: string;
  routeId?: number | string;
  rate?: number | string;
  note?: string;
  [key: string]: unknown;
}

interface ServicePartnerInvoiceLineItem {
  date: string;
  routeName?: string;
  routeId?: number | string;
  totalStops?: number;
  amount?: number;
  note?: string;
  [key: string]: unknown;
}

interface InvoiceRoute {
  date: string;
  route: string;
  stops: number;
  amount: number;
  description: string;
}

interface InvoiceData {
  routes: InvoiceRoute[];
  totalStops: number;
  totalAmount: number;
  servicePartnerName: string;
  month: number;
  year: number;
}

const BA_COMPANY = {
  name: "BA EXPRESS LIMITED",
  address: "20 The Laurels",
  email: "info@baexpress.co.uk",
  vat: "GB238595859",
};

export default function ServicePartnerInvoicePreviewModal({
  open,
  onOpenChange,
  servicePartnerId,
  month,
  year,
  servicePartnerName,
  operationsData,
  onInvoiceCreated,
}: ServicePartnerInvoicePreviewModalProps) {
  const { data: company } = useCurrentCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (!open) return;

    // If operations data is provided, transform it directly
    if (operationsData && operationsData.length > 0) {
      try {
        const routes: InvoiceRoute[] = [];
        let totalAmount = 0;

        operationsData.forEach((operation: ServicePartnerOperationItem) => {
          const date = operation.date;
          const route: InvoiceRoute = {
            date,
            route: operation.routeName || `Route ${operation.routeId || ''}`,
            stops: 0,
            amount: parseFloat(String(operation.rate ?? "0")),
            description: operation.note || '—',
          };

          routes.push(route);
          totalAmount += route.amount;
        });

        setInvoiceData({
          routes,
          totalStops: operationsData.length,
          totalAmount,
          servicePartnerName,
          month,
          year,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
      return;
    }

    const fetchInvoiceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await guardedFetch(
          `${getApiBaseUrl()}/bff/service-partner-invoices?service_partner_id=${servicePartnerId}&month=${month}&year=${year}`,
          {
            headers: {
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }

        const data = await response.json();

        // Transform data to match expected format
        const routes: InvoiceRoute[] = [];
        let totalStops = 0;
        let totalAmount = 0;

        if (Array.isArray(data) && data.length > 0) {
          const invoice = data[0];

          if (invoice.itens && Array.isArray(invoice.itens)) {
            invoice.itens.forEach((item: ServicePartnerInvoiceLineItem) => {
              const date = item.date;
              const route: InvoiceRoute = {
                date,
                route: item.routeName || `Route ${item.routeId || ''}`,
                stops: item.totalStops || 0,
                amount: item.amount || 0,
                description: item.note || '—',
              };

              routes.push(route);
              totalStops += route.stops;
              totalAmount += route.amount;
            });
          }
        }

        setInvoiceData({
          routes,
          totalStops,
          totalAmount,
          servicePartnerName,
          month,
          year,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setInvoiceData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [open, servicePartnerId, month, year, servicePartnerName, operationsData]);

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

  const periodLabel = useMemo(() => {
    return new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase();
  }, [month, year]);

  const handleConfirmCreate = async () => {
    try {
      setIsCreating(true);
      setError(null);

      if (!company?.companyId) {
        throw new Error("Company ID not found. Please reload the page.");
      }

      if (!invoiceData) {
        throw new Error("Invoice data not loaded. Please try again.");
      }

      const payload = {
        data: `${year}-${String(month).padStart(2, "0")}-01`,
        service_partner_id: servicePartnerId,
        company_id: company.companyId,
        items: invoiceData.routes.map((route) => ({
          route_name: route.route,
          date: route.date,
          stops: route.stops,
          amount: route.amount,
          note: route.description,
        })),
      };

      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/service-partner-invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getBearerAuthHeader(),
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create invoice");
      }

      onInvoiceCreated?.();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the invoice";
      console.error("Invoice creation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading invoice data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded m-6">
            {error}
          </div>
        ) : invoiceData ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-slate-900">{invoiceData.servicePartnerName}</h1>
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
                <p className="text-sm font-bold text-slate-900 mt-1">{invoiceData.routes.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Total Stops</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{invoiceData.totalStops}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-gray-600 font-semibold">Total Amount</p>
                <p className="text-sm font-bold text-blue-900 mt-1">{formatCurrency(invoiceData.totalAmount)}</p>
              </div>
            </div>

            {/* Routes Table */}
            <div className="mb-3">
              <div className="bg-blue-900 text-white px-4 py-3 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs">{invoiceData.servicePartnerName}</span>
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
                    {invoiceData.routes.map((route, idx) => (
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
                <p className="font-semibold text-slate-800 text-sm">Subtotal: {formatCurrency(invoiceData.totalAmount)}</p>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-blue-900 text-white px-4 py-3 rounded-lg flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold text-sm">Grand Total</p>
                <p className="text-xs text-gray-300 mt-0.5">(1 invoice, {invoiceData.routes.length} items)</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(invoiceData.totalAmount)}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCreate}
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Confirm & Create"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
