"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchServicePartnerInvoices, type ServicePartnerInvoiceDTO } from "@/lib/service-partners-api";

interface UseServicePartnerInvoicesArgs {
  month: number;
  year: number;
  servicePartnerId?: number;
  enabled?: boolean;
}

export function useServicePartnerInvoices({
  month,
  year,
  servicePartnerId,
  enabled = true,
}: UseServicePartnerInvoicesArgs) {
  return useQuery<ServicePartnerInvoiceDTO[]>({
    queryKey: ["service-partner-invoices", { month, year, servicePartnerId }] as const,
    queryFn: () => fetchServicePartnerInvoices(month, year, servicePartnerId),
    enabled: enabled && month >= 1 && month <= 12 && year >= 2000,
  });
}
