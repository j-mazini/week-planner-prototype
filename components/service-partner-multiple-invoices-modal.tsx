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
import { getBearerAuthHeader } from "@/lib/auth";
import ServicePartnerMultipleInvoicesPreviewModal from "./service-partner-multiple-invoices-preview-modal";

interface ServicePartnerMultipleInvoicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoicesCreated?: () => void;
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

export default function ServicePartnerMultipleInvoicesModal({
  open,
  onOpenChange,
  onInvoicesCreated,
}: ServicePartnerMultipleInvoicesModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [servicePartnersWithoutInvoice, setServicePartnersWithoutInvoice] = useState<ServicePartnerWithoutInvoice[]>([]);
  const [, setAllOperationsData] = useState<ServicePartnerOperation[]>([]);
  const [operationsByPartner, setOperationsByPartner] = useState<Record<string, ServicePartnerOperation[]>>({});
  const [, setLoadingPartners] = useState(false);
  const [, setLoadingOperations] = useState(false);

  // Fetch service partners without invoices and all operations for selected month/year
  useEffect(() => {
    if (!open || !selectedMonth || !selectedYear) return;

    const fetchData = async () => {
      try {
        setLoadingPartners(true);
        setLoadingOperations(true);
        const month = parseInt(selectedMonth);

        // Fetch service partners without invoice
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

        // Fetch all operations for the selected month/year
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

        const ops = await operationsResponse.json();
        setAllOperationsData(ops);

        // Group operations by service partner
        const grouped = ops.reduce((acc: Record<string, ServicePartnerOperation[]>, op: ServicePartnerOperation) => {
          const spId = String(op.servicePartnerId);
          if (!acc[spId]) {
            acc[spId] = [];
          }
          acc[spId].push(op);
          return acc;
        }, {});
        setOperationsByPartner(grouped);
      } catch (err) {
        console.error("Error fetching data:", err);
        setServicePartnersWithoutInvoice([]);
        setAllOperationsData([]);
        setOperationsByPartner({});
      } finally {
        setLoadingPartners(false);
        setLoadingOperations(false);
      }
    };

    fetchData();
  }, [open, selectedMonth, selectedYear]);

  const handleCreate = () => {
    // Open the preview modal instead of sending to backend
    setPreviewOpen(true);
  };

  const getAvailableMonths = () => {
    if (selectedYear === currentYear) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      return months.filter((month) => parseInt(month.value) <= currentMonth);
    }
    return months;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Create Multiple Service Partner Invoices</DialogTitle>
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Invoices"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {previewOpen && (
      <ServicePartnerMultipleInvoicesPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        month={Number(selectedMonth)}
        year={selectedYear}
        servicePartners={servicePartnersWithoutInvoice}
        operationsByPartner={operationsByPartner}
        onInvoicesCreated={() => {
          onInvoicesCreated?.();
          onOpenChange(false);
        }}
      />
    )}
    </>
  );
}
