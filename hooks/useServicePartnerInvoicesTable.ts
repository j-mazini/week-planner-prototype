"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { getBearerAuthHeader } from "@/lib/auth";
import type { ServicePartnerInvoiceDTO } from "@/lib/service-partners-api";

interface UseServicePartnerInvoicesTableArgs {
  month?: number;
  year?: number;
  servicePartnerId?: number;
  enabled?: boolean;
}

export function useServicePartnerInvoicesTable({
  month,
  year,
  servicePartnerId,
  enabled = true,
}: UseServicePartnerInvoicesTableArgs) {
  return useQuery<ServicePartnerInvoiceDTO[]>({
    queryKey: ["service-partner-invoices-table", { month, year, servicePartnerId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append("month", String(month));
      if (year) params.append("year", String(year));
      if (servicePartnerId) params.append("service_partner_id", String(servicePartnerId));

      const response = await fetch(
        `${getApiBaseUrl()}/bff/service-partner-invoices?${params.toString()}`,
        {
          headers: {
            ...getBearerAuthHeader(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service partner invoices");
      }

      const data = await response.json();

      // Map snake_case to camelCase for compatibility
      return data.map((invoice: unknown) => {
        const inv = invoice as Record<string, unknown>;
        return {
          ...inv,
          servicePartnerInvoiceId: inv.service_partner_invoice_id ?? inv.servicePartnerInvoiceId,
          servicePartnerId: Number(inv.service_partner_id || inv.servicePartnerId),
          companyId: inv.company_id || inv.companyId,
          servicePartnerName: inv.service_partner_name || inv.servicePartnerName,
          companyName: inv.company_name || inv.companyName,
          amountTotal: parseFloat(inv.subtotal as string) || parseFloat(inv.amountTotal as string) || 0,
          date: inv.invoice_date || inv.date,
          // Backend can omit `itens`/`deductions` (or send null) for invoices with no lines yet —
          // normalize to [] so every consumer can safely rely on array methods.
          itens: Array.isArray(inv.itens) ? inv.itens : [],
          deductions: Array.isArray(inv.deductions) ? inv.deductions : [],
        };
      });
    },
    enabled: enabled && (!month || (month >= 1 && month <= 12)) && (!year || (year >= 2000)),
  });
}
