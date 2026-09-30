import { useAuth } from "@/hooks/useAuth";
import { useInvoicesByUserLast12 } from "@/hooks/useInvoicesQuery";

export function useMobileInvoices() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const userTypeId = user?.userTypeId ?? null;

  const invoicesQuery = useInvoicesByUserLast12(userId);
  const invoices = invoicesQuery.data ?? [];
  const isLoading = invoicesQuery.isLoading || invoicesQuery.isFetching;

  return { invoices, isLoading, userTypeId: userTypeId ?? 0, userId: userId ?? 0 };
}
