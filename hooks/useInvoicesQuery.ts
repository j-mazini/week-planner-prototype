import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoicesByMonth,
  fetchInvoicesByUserLast12,
  fetchInvoicesLast12,
} from "@/lib/invoices-api";

type Nullable<T> = T | null | undefined;

interface ByMonthArgs {
  month: Nullable<number>;
  year: Nullable<number>;
  userId?: Nullable<number>;
  servicePartnerId?: Nullable<string | number>;
}

export function useInvoicesByMonth({ month, year, userId, servicePartnerId }: ByMonthArgs) {
  return useQuery({
    queryKey: ["invoices", "by-month", { month, year, userId, servicePartnerId }] as const,
    queryFn: () =>
      fetchInvoicesByMonth({
        month: month!,
        year: year!,
        userId: userId ?? undefined,
        servicePartnerId: servicePartnerId ?? undefined,
      }),
    enabled: Boolean(month) && Boolean(year),
  });
}

export function useInvoicesByUserLast12(userId: Nullable<number>) {
  return useQuery({
    queryKey: ["invoices", "by-user-last-12", userId] as const,
    queryFn: () => fetchInvoicesByUserLast12(userId!),
    enabled: Boolean(userId),
  });
}

interface Last12Args {
  servicePartnerId?: Nullable<string | number>;
  enabled?: boolean;
}

export function useInvoicesLast12({ servicePartnerId, enabled = true }: Last12Args = {}) {
  return useQuery({
    queryKey: ["invoices", "last-12", { servicePartnerId }] as const,
    queryFn: () => fetchInvoicesLast12({ servicePartnerId: servicePartnerId ?? undefined }),
    enabled,
  });
}

export function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["invoices"] });
}
