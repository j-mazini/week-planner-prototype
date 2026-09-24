"use client";

import { useState, useEffect } from "react";
import { fetchServicePartners, type ServicePartnerDTO } from "@/lib/service-partners-api";
import type { SelectItem } from "@/components/ui/searchable-select";

// Module-level cache: shared across all hook instances for the session.
// Only one HTTP request is made regardless of how many components call this hook.
let cachedData: ServicePartnerDTO[] | null = null;
let pendingPromise: Promise<ServicePartnerDTO[]> | null = null;

export function useServicePartners() {
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>(cachedData ?? []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) {
      setServicePartners(cachedData);
      setLoading(false);
      return;
    }

    if (!pendingPromise) {
      pendingPromise = fetchServicePartners();
    }

    setLoading(true);
    pendingPromise
      .then((data) => {
        cachedData = data;
        setServicePartners(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useServicePartners] Error:', message);
        pendingPromise = null;
        setServicePartners([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const servicePartnerItems: SelectItem[] = [
    { value: "", label: "All Service Partners" },
    ...servicePartners.map((sp) => ({
      value: String(sp.servicePartnerId),
      label: sp.partnerName,
    })),
  ];

  return { servicePartners, servicePartnerItems, loading };
}
