'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';
import { fetchServiceTypesDTO, type ServiceTypeDTO } from '@/lib/serviceTypes';

export interface NameLookups {
  depositNameById: Map<number, string>;
  servicePartnerNameById: Map<number, string>;
  serviceTypeNameById: Map<number, string>;
  servicePartners: ServicePartnerDTO[];
  isLoading: boolean;
}

/**
 * Loads deposits + service partners + service types once and exposes name lookup maps.
 * Backed by short-TTL caches in the underlying fetchers, so this is cheap across tabs.
 */
export function useNameLookups(): NameLookups {
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      fetchDeposits().catch(() => [] as DepositDTO[]),
      fetchServicePartners().catch(() => [] as ServicePartnerDTO[]),
      fetchServiceTypesDTO().catch(() => [] as ServiceTypeDTO[]),
    ]).then(([d, sp, st]) => {
      if (cancelled) return;
      setDeposits(d);
      setServicePartners(sp);
      setServiceTypes(st);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const depositNameById = useMemo(() => {
    const m = new Map<number, string>();
    deposits.forEach((d) => { if (d.depositId != null) m.set(d.depositId, d.depositName); });
    return m;
  }, [deposits]);

  const servicePartnerNameById = useMemo(() => {
    const m = new Map<number, string>();
    servicePartners.forEach((sp) => m.set(sp.servicePartnerId, sp.partnerName));
    return m;
  }, [servicePartners]);

  const serviceTypeNameById = useMemo(() => {
    const m = new Map<number, string>();
    serviceTypes.forEach((st) => { if (st.serviceTypeId != null) m.set(st.serviceTypeId, st.name || ''); });
    return m;
  }, [serviceTypes]);

  return { depositNameById, servicePartnerNameById, serviceTypeNameById, servicePartners, isLoading };
}
