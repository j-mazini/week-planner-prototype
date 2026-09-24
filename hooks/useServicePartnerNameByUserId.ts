"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVendors, type Vendor } from "@/lib/vendors";
import { useServicePartners } from "./useServicePartners";

// Module-level cache: shared across all hook instances for the session.
// Without this, mounting one instance per table row (e.g. daily financial
// insights, que rende até 500 linhas por página) fires one
// "/bff/vendors?active=true" request per row.
let cachedVendors: Vendor[] | null = null;
let pendingVendorsPromise: Promise<Vendor[]> | null = null;

/**
 * Hook that returns a Map<userId, partnerName> for use rendering the
 * Service Partner badge wherever only the vendor's userId is available
 * (e.g. operation rows). Vendors and service partners are both cached at
 * the module level, so concurrent consumers share the same network calls.
 */
export function useServicePartnerNameByUserId(): Map<number, string> {
  const { servicePartners } = useServicePartners();
  const [vendors, setVendors] = useState<Vendor[]>(cachedVendors ?? []);

  useEffect(() => {
    if (cachedVendors) {
      setVendors(cachedVendors);
      return;
    }

    let cancelled = false;
    if (!pendingVendorsPromise) {
      pendingVendorsPromise = fetchVendors({ active: true });
    }

    pendingVendorsPromise
      .then((data) => {
        cachedVendors = data;
        if (!cancelled) setVendors(data);
      })
      .catch(() => {
        pendingVendorsPromise = null;
        if (!cancelled) setVendors([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const spNameById = new Map<number, string>();
    servicePartners.forEach((sp) => {
      spNameById.set(Number(sp.servicePartnerId), sp.partnerName);
    });

    const map = new Map<number, string>();
    vendors.forEach((v) => {
      const rawSp = (v as Vendor & { servicePartnerId?: number | string | null }).servicePartnerId;
      if (rawSp == null) return;
      const spId = typeof rawSp === "string" ? parseInt(rawSp, 10) : Number(rawSp);
      if (!Number.isFinite(spId) || spId <= 0) return;
      const name = spNameById.get(spId);
      if (name) map.set(Number(v.userId), name);
    });
    return map;
  }, [vendors, servicePartners]);
}

export default useServicePartnerNameByUserId;
