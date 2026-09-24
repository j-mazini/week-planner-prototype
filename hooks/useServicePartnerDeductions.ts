"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchServicePartnerDeductions,
  type ServicePartnerDeductionDTO,
} from "@/lib/service-partner-deductions-api";

interface UseServicePartnerDeductionsArgs {
  month?: number;
  year?: number;
  servicePartnerId?: number;
  enabled?: boolean;
}

export function useServicePartnerDeductions({
  month,
  year,
  servicePartnerId,
  enabled = true,
}: UseServicePartnerDeductionsArgs) {
  return useQuery<ServicePartnerDeductionDTO[]>({
    queryKey: ["service-partner-deductions", { month, year, servicePartnerId }],
    queryFn: () => fetchServicePartnerDeductions({ month, year, servicePartnerId }),
    enabled: enabled && (!month || (month >= 1 && month <= 12)) && (!year || year >= 2000),
  });
}
