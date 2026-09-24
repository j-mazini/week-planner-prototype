"use client";

import React, { useState } from "react";
import { fetchServicePartnerInvoiceById, type ServicePartnerInvoiceDTO } from "@/lib/service-partners-api";
import type { ServicePartnerDTO } from "@/lib/service-partners-api";
import { formatGbp } from "../utils/format";
import { exportSingleServicePartnerInvoiceToPDF } from "../utils/pdfExport";
import { LightModal } from "@/components/ui/light-modal";
import { ServicePartnerInvoiceModal } from "./ServicePartnerInvoiceModal";
import { DollarSign, Download, Loader2, Users } from "lucide-react";

interface ServicePartnerMonthViewProps {
  invoices: ServicePartnerInvoiceDTO[];
  servicePartners?: ServicePartnerDTO[];
}

/**
 * Lists the month's service partner invoices with a totals strip and a row per
 * partner. "View" loads the specific invoice by its id and opens the branded
 * invoice document in a modal.
 */
export function ServicePartnerMonthView({ invoices, servicePartners = [] }: ServicePartnerMonthViewProps) {
  const [activeInvoice, setActiveInvoice] = useState<ServicePartnerInvoiceDTO | null>(null);
  const [detail, setDetail] = useState<ServicePartnerInvoiceDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const getServicePartnerDetails = (servicePartnerId: string | number) => {
    const partner = servicePartners.find((sp) => String(sp.servicePartnerId) === String(servicePartnerId));
    return {
      address: partner?.address || null,
      phone: partner?.phone || null,
      vatNumber: partner?.vatNumber || null,
    };
  };

  const handleView = async (inv: ServicePartnerInvoiceDTO) => {
    setActiveInvoice(inv);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      if (!inv.servicePartnerInvoiceId) throw new Error("Missing invoice id");
      const data = await fetchServicePartnerInvoiceById(inv.servicePartnerInvoiceId);
      setDetail(
        data ?? {
          ...inv,
          itens: [],
          deductions: [],
          totalDeductions: 0,
          totalReimbursements: 0,
          netTotal: inv.amountTotal,
        }
      );
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load invoice items");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeView = () => {
    setActiveInvoice(null);
    setDetail(null);
    setDetailError(null);
  };

  const handleDownload = async (inv: ServicePartnerInvoiceDTO) => {
    const key = `${inv.servicePartnerId}-${inv.date}`;
    setDownloadingKey(key);
    try {
      if (!inv.servicePartnerInvoiceId) throw new Error("Missing invoice id");
      const data = await fetchServicePartnerInvoiceById(inv.servicePartnerInvoiceId);
      const fullInvoice: ServicePartnerInvoiceDTO =
        data ?? {
          ...inv,
          itens: [],
          deductions: [],
          totalDeductions: 0,
          totalReimbursements: 0,
          netTotal: inv.amountTotal,
        };
      const { address, phone, vatNumber } = getServicePartnerDetails(fullInvoice.servicePartnerId);
      const blob = await exportSingleServicePartnerInvoiceToPDF(fullInvoice, address, phone, vatNumber);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const partnerSlug = (fullInvoice.servicePartnerName || `partner-${fullInvoice.servicePartnerId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      link.download = `service-partner-invoice-${partnerSlug}-${fullInvoice.date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ServicePartnerInvoices] download failed:", err);
      alert(`Error downloading PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amountTotal, 0);
  const partnerCount = new Set(invoices.map((inv) => inv.servicePartnerId)).size;

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Total Amount */}
          <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Amount</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{formatGbp(totalAmount)}</p>
              </div>
              <div className="bg-blue-600 rounded-xl p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Service Partners */}
          <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Service Partners</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">{partnerCount}</p>
              </div>
              <div className="bg-emerald-500 rounded-xl p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-white text-left">
                  <th className="py-4 pl-6 pr-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Service Partner
                  </th>
                  <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Company
                  </th>
                  <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">
                    Total Amount
                  </th>
                  <th className="py-4 pl-3 pr-6 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No invoices for this period
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const key = `${inv.servicePartnerId}-${inv.date}`;
                    return (
                      <tr
                        key={key}
                        className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="py-4 pl-6 pr-3 font-medium text-slate-800">
                          {inv.servicePartnerName}
                        </td>
                        <td className="py-4 px-3 text-slate-600">{inv.companyName}</td>
                        <td className="py-4 px-3 text-right font-semibold text-slate-800">
                          {formatGbp(inv.amountTotal)}
                        </td>
                        <td className="py-4 pl-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(inv)}
                              className="rounded-lg px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(inv)}
                              disabled={downloadingKey === key}
                              title="Download PDF"
                              aria-label="Download PDF"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-slate-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {downloadingKey === key ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeInvoice && detail ? (
        <>
          {(() => {
            const { address, phone, vatNumber } = getServicePartnerDetails(detail.servicePartnerId);
            return (
              <ServicePartnerInvoiceModal
                invoice={detail}
                onClose={closeView}
                servicePartnerAddress={address}
                servicePartnerPhone={phone}
                servicePartnerVatNumber={vatNumber}
              />
            );
          })()}
        </>
      ) : (
        <LightModal
          show={!!activeInvoice}
          onClose={closeView}
          title={activeInvoice?.servicePartnerName ?? undefined}
        >
          {detailLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading invoice items…
            </div>
          ) : detailError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {detailError}
            </p>
          ) : null}
        </LightModal>
      )}
    </>
  );
}
