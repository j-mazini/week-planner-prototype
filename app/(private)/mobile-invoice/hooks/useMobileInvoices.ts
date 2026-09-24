import { useEffect, useState } from "react";
import { getUserIdFromToken, getUserTypeFromToken, hasAuthSession } from "@/lib/auth";
import { useInvoicesByUserLast12 } from "@/hooks/useInvoicesQuery";

export function useMobileInvoices() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userTypeId, setUserTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (!hasAuthSession()) return;
    const uid = getUserIdFromToken();
    const ut = getUserTypeFromToken();
    if (uid != null) setUserId(uid);
    if (ut != null) setUserTypeId(ut);
  }, []);

  const invoicesQuery = useInvoicesByUserLast12(userId);
  const invoices = invoicesQuery.data ?? [];
  const isLoading = invoicesQuery.isLoading || invoicesQuery.isFetching;

  return { invoices, isLoading, userTypeId: userTypeId ?? 0, userId: userId ?? 0 };
}
