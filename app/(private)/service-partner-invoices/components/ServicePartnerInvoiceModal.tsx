"use client";

import React from "react";
import { LightModal } from "@/components/ui/light-modal";
import type { ServicePartnerInvoiceDTO } from "@/lib/service-partners-api";
import { BA_COMPANY } from "../constants/baCompany";
import { INVOICE_HEX } from "../constants/invoiceTheme";
import { formatGbp } from "../utils/format";
import { ServicePartnerDetailsBlock } from "./ServicePartnerDetailsBlock";
import { InvoiceSummaryStats } from "./InvoiceSummaryStats";
import { PartnerInvoiceBlock } from "./PartnerInvoiceBlock";
import { VatBlock } from "./VatBlock";
import { DeductionsBlock } from "./DeductionsBlock";
import { GrandTotalBar } from "./GrandTotalBar";

interface ServicePartnerInvoiceModalProps {
  invoice: ServicePartnerInvoiceDTO | null;
  onClose: () => void;
  servicePartnerAddress?: string | null;
  servicePartnerPhone?: string | null;
  servicePartnerVatNumber?: string | null;
}

/** Renders the period label from the API's `MMYYYY` date stamp (e.g. "May 2026"). */
function formatPeriodLabel(dateStr: string): string {
  if (/^\d{6}$/.test(dateStr)) {
    const mm = parseInt(dateStr.slice(0, 2), 10) - 1;
    const yyyy = parseInt(dateStr.slice(2), 10);
    return new Date(yyyy, mm, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Formats invoice number to SP-INV-XXXX format. */
function formatInvoiceNumber(invoiceNumber?: string): string {
  if (!invoiceNumber) return "";
  const numericMatch = invoiceNumber.match(/\d+/);
  if (!numericMatch) return invoiceNumber;
  return `SP-INV-${numericMatch[0]}`;
}

/**
 * The branded invoice document shown when a partner row's "View" is clicked:
 * BA Express header, the stat-card strip, the per-item block (with subtotal) and
 * the grand-total bar. Presentation only — amounts are pre-computed by the
 * backend.
 */
export function ServicePartnerInvoiceModal({
  invoice,
  onClose,
  servicePartnerAddress,
  servicePartnerPhone,
  servicePartnerVatNumber,
}: ServicePartnerInvoiceModalProps) {
  if (!invoice) return null;

  const periodLabel = formatPeriodLabel(invoice.date);
  const totalStops = invoice.itens.reduce((sum, item) => sum + item.totalStops, 0);
  const itemLabel = `${invoice.itens.length} ${invoice.itens.length === 1 ? "item" : "items"}`;
  const invoiceNumber = invoice.invoiceNumber || "—";
  const formattedInvoiceNumber = formatInvoiceNumber(invoiceNumber);

  const cards = [
    { label: "Period", value: periodLabel },
    { label: "Total Stops", value: String(totalStops) },
    { label: "Net Total", value: formatGbp(invoice.netTotal), positive: true },
  ];

  return (
    <LightModal show={!!invoice} onClose={onClose} size="xl" closeOnBackdropClick={false} showCloseButton={true}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6 items-start border-b border-gray-200 pb-6">
          {/* BA Company Details */}
          <div className="flex items-start gap-4">
            <div className="leading-snug">
              <p className="text-xs font-extrabold mb-1" style={{ color: INVOICE_HEX.navy }}>TO</p>
              <p className="text-xl font-extrabold tracking-tight" style={{ color: INVOICE_HEX.navy }}>
                {BA_COMPANY.name}
              </p>
              <p className="text-sm text-gray-500">{BA_COMPANY.address}</p>
              <p className="text-sm text-gray-500">{BA_COMPANY.email}</p>
              <p className="text-sm text-gray-500">{BA_COMPANY.vat}</p>
            </div>
          </div>

          {/* Service Partner Details */}
          <ServicePartnerDetailsBlock
            name={invoice.servicePartnerName || `#${invoice.servicePartnerId}`}
            address={servicePartnerAddress || invoice.servicePartnerAddress}
            phone={servicePartnerPhone || invoice.servicePartnerPhone}
            vatNumber={servicePartnerVatNumber || invoice.servicePartnerVatNumber}
          />

          {/* Invoice Box */}
          <div
            className="rounded-xl py-3 space-y-2 text-xs max-w-[170px]"
            style={{ backgroundColor: INVOICE_HEX.surface, paddingLeft: '31px', paddingRight: '31px' }}
          >
            {formattedInvoiceNumber && (
              <div>
                <p className="text-xs font-extrabold text-left" style={{ color: INVOICE_HEX.navy }}>
                  Invoice Number:
                </p>
                <p className="text-sm font-black text-center" style={{ color: INVOICE_HEX.navy }}>
                  {formattedInvoiceNumber}
                </p>
              </div>
            )}
            {invoice.date && (
              <div>
                <p className="text-xs font-extrabold text-left" style={{ color: INVOICE_HEX.navy }}>
                  Date:
                </p>
                <p className="text-sm font-black text-center" style={{ color: INVOICE_HEX.navy }}>
                  {periodLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        <InvoiceSummaryStats cards={cards} />

        <PartnerInvoiceBlock
          partnerName={invoice.servicePartnerName || `#${invoice.servicePartnerId}`}
          issuerLabel={`${BA_COMPANY.name} - ${periodLabel}`}
          items={invoice.itens}
          subtotal={invoice.amountTotal}
        />

        <DeductionsBlock
          deductions={invoice.deductions}
          totalDeductions={invoice.totalDeductions}
          totalReimbursements={invoice.totalReimbursements}
        />

        <VatBlock amount={invoice.totalVat} />

        <GrandTotalBar total={invoice.netTotal} caption={`1 invoice, ${itemLabel}`} />

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs text-gray-400">
          <span>Generated by {BA_COMPANY.name}</span>
          <span style={{ color: INVOICE_HEX.navy }}>Service Partner Invoices</span>
        </div>
      </div>
    </LightModal>
  );
}
