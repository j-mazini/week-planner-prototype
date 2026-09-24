"use client";

import { useState, useEffect } from "react";
import { fetchServicePartnerById, type ServicePartnerDTO } from "@/lib/service-partners-api";

export function useServicePartnerById(servicePartnerId: number | null | undefined) {
  const [servicePartner, setServicePartner] = useState<ServicePartnerDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!servicePartnerId) {
      setServicePartner(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchServicePartnerById(servicePartnerId)
      .then((data) => {
        setServicePartner(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setServicePartner(null);
      })
      .finally(() => setLoading(false));
  }, [servicePartnerId]);

  return { servicePartner, loading, error };
}
