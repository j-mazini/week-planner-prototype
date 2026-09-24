"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useServicePartners } from "@/hooks/useServicePartners";
import { getBearerAuthHeader } from "@/lib/auth";
import ServicePartnerInvoicePreviewModal from "./service-partner-invoice-preview-modal";

interface ServicePartnerNewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
}

interface ServicePartnerWithoutInvoice {
  service_partner_id: number | string;
  partner_name?: string;
  [key: string]: unknown;
}

interface ServicePartnerOperation {
  servicePartnerId?: number | string;
  date: string;
  routeName?: string;
  routeId?: number | string;
  rate?: number | string;
  note?: string;
  [key: string]: unknown;
}

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

export default function ServicePartnerNewInvoiceModal({
  open,
  onOpenChange,
  onInvoiceCreated,
}: ServicePartnerNewInvoiceModalProps) {
  useServicePartners();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedSpId, setSelectedSpId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [operationsData, setOperationsData] = useState<ServicePartnerOperation[]>([]);
  const [servicePartnersWithoutInvoice, setServicePartnersWithoutInvoice] = useState<ServicePartnerWithoutInvoice[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Fetch service partners without invoices for selected month/year
  useEffect(() => {
    if (!open || !selectedMonth || !selectedYear) return;

    const fetchPartners = async () => {
      try {
        setLoadingPartners(true);
        const month = parseInt(selectedMonth);

        const partnersResponse = await fetch(
          `${getApiBaseUrl()}/bff/service-partners/without-invoice/${month}/${selectedYear}`,
          {
            headers: {
              ...getBearerAuthHeader(),
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
            cache: "no-store",
          }
        );

        if (!partnersResponse.ok) {
          throw new Error("Failed to fetch service partners without invoice");
        }

        const partnersData = await partnersResponse.json();
        setServicePartnersWithoutInvoice(partnersData);
        setSelectedSpId(""); // Reset service partner selection when month/year changes
      } catch (err) {
        console.error("Error fetching partners:", err);
        setServicePartnersWithoutInvoice([]);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchPartners();
  }, [open, selectedMonth, selectedYear]);

  const handleCreate = async () => {
    if (!selectedSpId) {
      setError("Please select a Service Partner");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const month = parseInt(selectedMonth);
      const year = selectedYear;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const operationsResponse = await fetch(
        `${getApiBaseUrl()}/bff/operations?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            ...getBearerAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          cache: "no-store",
        }
      );

      if (!operationsResponse.ok) {
        throw new Error("Failed to fetch operations");
      }

      const allOps = await operationsResponse.json();
      const filteredOps = allOps.filter(
        (op: ServicePartnerOperation) => String(op.servicePartnerId) === selectedSpId
      );

      setOperationsData(filteredOps);
      setPreviewOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getServicePartnerName = () => {
    return servicePartnersWithoutInvoice.find(sp => String(sp.service_partner_id) === selectedSpId)?.partner_name || "";
  };

  const getAvailableMonths = () => {
    // If selected year is current year, show only months up to current month
    if (selectedYear === currentYear) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      return months.filter((month) => parseInt(month.value) <= currentMonth);
    }
    // For past years, show all months
    return months;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Create Service Partner Invoice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Year Select */}
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setSelectedYear(newYear);
                  // Reset month if it becomes invalid for current year
                  if (newYear === currentYear) {
                    const now = new Date();
                    const currentMonth = now.getMonth() + 1;
                    const selectedMonthNum = parseInt(selectedMonth);
                    if (selectedMonthNum > currentMonth) {
                      setSelectedMonth(String(currentMonth));
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Select */}
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableMonths().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Partner Select */}
            <div>
              <label className="block text-sm font-medium mb-2">Service Partner</label>
              <select
                value={selectedSpId}
                onChange={(e) => setSelectedSpId(e.target.value)}
                disabled={loadingPartners || servicePartnersWithoutInvoice.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {loadingPartners ? "Loading..." : servicePartnersWithoutInvoice.length === 0 ? "No available service partners" : "Select a Service Partner"}
                </option>
                {servicePartnersWithoutInvoice.map((sp) => (
                  <option key={sp.service_partner_id} value={String(sp.service_partner_id)}>
                    {sp.partner_name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !selectedSpId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Invoice"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {previewOpen && (
        <ServicePartnerInvoicePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          servicePartnerId={Number(selectedSpId)}
          month={Number(selectedMonth)}
          year={selectedYear}
          servicePartnerName={getServicePartnerName()}
          operationsData={operationsData}
          onInvoiceCreated={() => {
            onInvoiceCreated?.();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
