"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVendors, type Vendor } from "@/lib/vendors";
import { useServicePartners } from "./useServicePartners";

// Module-level cache: shared across all hook instances for the session.
// Without this, mounting one instance per table row (e.g. daily operations
// reports) fires one "/bff/vendors?active=true" request per row.
let cachedVendors: Vendor[] | null = null;
let pendingVendorsPromise: Promise<Vendor[]> | null = null;

/**
 * Normalizes a vendor/courier display name for fuzzy matching between data
 * sources that only expose a name string (e.g. daily operations reports) and
 * the vendor catalogue. Collapses whitespace, trims and lowercases.
 * @param name - Raw vendor/courier name.
 * @returns Normalized key, or empty string when name is missing.
 */
export function normalizeVendorName(name?: string | null): string {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Hook that returns a Map<normalizedFullName, partnerName> for rendering the
 * Service Partner badge wherever only the vendor's display name is available
 * (e.g. daily operations report rows whose DTO lacks a userId/servicePartnerId).
 *
 * This is a best-effort fallback: matching is by name, so homonyms or
 * formatting differences may miss. Prefer {@link useServicePartnerNameByUserId}
 * whenever a stable userId is present on the row.
 */
export function useServicePartnerNameByVendorName(): Map<string, string> {
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

    const map = new Map<string, string>();
    vendors.forEach((v) => {
      const rawSp = (v as Vendor & { servicePartnerId?: number | string | null }).servicePartnerId;
      if (rawSp == null) return;
      const spId = typeof rawSp === "string" ? parseInt(rawSp, 10) : Number(rawSp);
      if (!Number.isFinite(spId) || spId <= 0) return;
      const name = spNameById.get(spId);
      const key = normalizeVendorName(v.fullName);
      if (name && key) map.set(key, name);
    });
    return map;
  }, [vendors, servicePartners]);
}

export default useServicePartnerNameByVendorName;
