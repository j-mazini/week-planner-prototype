"use client";

import { memo, useMemo } from "react";
import { Download } from "lucide-react";
import { buildLedger } from "@/lib/invoice-ledger";
import type { Invoice } from "../types";
import { formatCurrency, formatDate } from "../utils";

interface InvoiceListContainerProps {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (invoiceId: number) => void;
  onDownload: (invoiceId: number) => void;
}

/**
 * The driver's invoice ledger: the latest payment, then every month newest first with its
 * own total. The month is the period an invoice covers; the date on a row is the day it
 * was issued — they differ, so both are labelled.
 */
export const InvoiceListContainer = memo(function InvoiceListContainer({
  invoices,
  isLoading,
  onView,
  onDownload,
}: InvoiceListContainerProps) {
  const ledger = useMemo(() => buildLedger(invoices), [invoices]);

  if (isLoading) {
    return (
      <div className="invoice-skeleton" aria-busy="true" aria-label="Loading your invoices">
        <span /><span /><span />
      </div>
    );
  }

  if (!ledger.latest) {
    return (
      <p className="invoice-empty">
        <strong>No invoices yet</strong>
        Once a month is invoiced it appears here, ready to open or download.
      </p>
    );
  }

  return (
    <div className="invoice-page">
      <section className="invoice-hero" aria-label="Latest payment">
        <div>
          <span className="invoice-hero__label">Last payment</span>
          <p className="invoice-hero__amount">{formatCurrency(ledger.latest.amount)}</p>
          <p className="invoice-hero__period">Covering {ledger.latest.period}</p>
        </div>
        <span className="invoice-hero__count">
          {ledger.count} {ledger.count === 1 ? "invoice" : "invoices"}
        </span>
      </section>

      <div className="invoice-ledger">
        {ledger.months.map((month) => (
          <section key={month.key} aria-label={month.label}>
            <div className="invoice-month__rule">
              <h2 className="invoice-month__name">{month.label}</h2>
              <span className="invoice-month__total">{formatCurrency(month.total)}</span>
            </div>

            {month.invoices.map((invoice) => (
              <div className="invoice-row" key={invoice.invoiceId} role="button" tabIndex={0}
                onClick={() => onView(invoice.invoiceId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onView(invoice.invoiceId);
                  }
                }}
              >
                <span className="invoice-row__number">Invoice #{invoice.invoiceNumber}</span>
                <span className="invoice-row__issued">Issued {formatDate(invoice.invoiceCreatedOn)}</span>
                <span className="invoice-row__amount">{formatCurrency(invoice.totalPayment)}</span>
                <button
                  type="button"
                  className="invoice-row__download"
                  aria-label={`Download invoice ${invoice.invoiceNumber}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload(invoice.invoiceId);
                  }}
                >
                  <Download size={17} />
                </button>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
});
