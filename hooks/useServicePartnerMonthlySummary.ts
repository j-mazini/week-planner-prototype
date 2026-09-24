"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchServicePartnerMonthlySummary,
  type ServicePartnerMonthlySummaryDTO,
} from "@/lib/service-partners-api";

interface UseServicePartnerMonthlySummaryArgs {
  servicePartnerId: number | null;
  month: number;
  year: number;
  enabled?: boolean;
}

/**
 * Server state for a service partner's monthly invoice summary. Disabled until a
 * service partner is selected so it never fires with a null id.
 */
export function useServicePartnerMonthlySummary({
  servicePartnerId,
  month,
  year,
  enabled = true,
}: UseServicePartnerMonthlySummaryArgs) {
  return useQuery<ServicePartnerMonthlySummaryDTO>({
    queryKey: ["service-partner-monthly-summary", { servicePartnerId, month, year }] as const,
    queryFn: () => fetchServicePartnerMonthlySummary(servicePartnerId!, month, year),
    enabled: enabled && servicePartnerId != null,
  });
}
