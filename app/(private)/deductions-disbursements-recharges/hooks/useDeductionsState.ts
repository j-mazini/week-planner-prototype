'use client';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { DisplayDeduction } from '../types';
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { fetchRoutes, type Route } from '@/lib/api/routes';
import {
  fetchAllDeductions,
  fetchFixDamageInstallments,
  fetchPrePaymentInstallments,
  fetchOtherInstallments,
  type FixDamageInstallment,
  type PrePaymentInstallment,
  type OtherInstallment,
} from '@/lib/deductions-api';
import { transformDeductionToDisplay } from '../utils';
import { formatDateToString } from '../utils';
import { fetchVendors, Vendor } from '@/lib/vendors';

export const useDeductionsState = (servicePartnerId?: number) => {
  const [deductionsData, setDeductionsData] = useState<DisplayDeduction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  // Create usersMap from vendors
  const usersMap = useMemo(() => {
    const map = new Map<number, string>();
    vendors.forEach((vendor) => {
      map.set(vendor.userId, vendor.fullName);
    });
    return map;
  }, [vendors]);

  const uniqueCouriers = useMemo(() => {
    return Array.from(new Set(vendors.map(d => d.fullName))).sort();
  }, [vendors]);

  // Helper function to transform installment to DisplayDeduction
  const transformInstallmentToDisplay = useCallback((
    installment: FixDamageInstallment | PrePaymentInstallment | OtherInstallment,
    type: string,
    usersMap: Map<number, string>,
    vendorList: Vendor[]
  ): DisplayDeduction | null => {
    const userId = installment.userId || 0;
    let courierName = 'Unknown Vendor';

    if (userId > 0) {
      courierName = usersMap.get(userId) || 'Unknown Vendor';

      if (courierName === 'Unknown Vendor') {
        for (let i = 0; i < vendorList.length; i++) {
          if (vendorList[i].userId === userId) {
            courierName = vendorList[i].fullName;
            break;
          }
        }
        if (courierName === 'Unknown Vendor') {
          courierName = `Vendor ID: ${userId}`;
        }
      }
    }

    let installmentDate: string;
    if (typeof installment.installmentDate === 'string') {
      const str = installment.installmentDate;
      installmentDate = str.length >= 10 ? str.slice(0, 10) : formatDateToString(str);
    } else {
      installmentDate = formatDateToString(installment.installmentDate);
    }

    const amount = parseFloat(installment.installmentValue) || 0;
    const status: 'Paid' | 'Pending' | 'Disputed' = installment.invoiceId ? 'Paid' : 'Pending';

    const backendId = 'fixDamageId' in installment ? installment.fixDamageId :
      'prePaymentId' in installment ? installment.prePaymentId :
        'otherDeductionId' in installment ? installment.otherDeductionId : 0;

    return {
      id: installment.referenceNumber,
      dateOfIncident: installmentDate,
      courierName,
      type,
      amount,
      status,
      backendId,
      backendType: type === 'Repairs & Damages' ? 'fix-damage' :
        type === 'Pre-Payments' ? 'pre-payment' : 'other',
      userId,
      isInstallment: true,
      installmentId: 'fixDamageInstallmentsId' in installment ? installment.fixDamageInstallmentsId :
        'prePaymentInstallmentsId' in installment ? installment.prePaymentInstallmentsId :
          'otherInstallmentsId' in installment ? installment.otherInstallmentsId : 0,
    };
  }, []);

  const reloadDeductions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();

      const [allDeductions, fixDamageInstallments, prePaymentInstallments, otherInstallments] = await Promise.all([
        fetchAllDeductions(month, year, servicePartnerId),
        fetchFixDamageInstallments(month, year, servicePartnerId),
        fetchPrePaymentInstallments(month, year, servicePartnerId),
        fetchOtherInstallments(month, year, servicePartnerId),
      ]);

      const estimatedSize =
        allDeductions.fixDamage.length +
        allDeductions.trafficPenalty.length +
        allDeductions.prePayment.length +
        allDeductions.liquidationDamage.length +
        allDeductions.other.length +
        fixDamageInstallments.length +
        prePaymentInstallments.length +
        otherInstallments.length;

      const transformed: DisplayDeduction[] = [];
      transformed.length = estimatedSize;
      let index = 0;

      for (const d of allDeductions.fixDamage) {
        transformed[index++] = transformDeductionToDisplay(d, 'Repairs & Damages', usersMap, vendors);
      }
      for (const d of allDeductions.trafficPenalty) {
        transformed[index++] = transformDeductionToDisplay(d, 'Traffic Penalties', usersMap, vendors);
      }
      for (const d of allDeductions.prePayment) {
        transformed[index++] = transformDeductionToDisplay(d, 'Pre-Payments', usersMap, vendors);
      }
      for (const d of allDeductions.liquidationDamage) {
        transformed[index++] = transformDeductionToDisplay(d, 'Liquidation Damages', usersMap, vendors);
      }
      for (const d of allDeductions.other) {
        transformed[index++] = transformDeductionToDisplay(d, 'Other', usersMap, vendors);
      }

      for (const inst of fixDamageInstallments) {
        const display = transformInstallmentToDisplay(inst, 'Repairs & Damages', usersMap, vendors);
        if (display) transformed[index++] = display;
      }

      for (const inst of prePaymentInstallments) {
        const display = transformInstallmentToDisplay(inst, 'Pre-Payments', usersMap, vendors);
        if (display) transformed[index++] = display;
      }

      for (const inst of otherInstallments) {
        const display = transformInstallmentToDisplay(inst, 'Other', usersMap, vendors);
        if (display) transformed[index++] = display;
      }

      transformed.length = index;
      const seenKeys = new Set<string>();
      const unique: DisplayDeduction[] = [];

      for (const item of transformed) {
        const key = item.isInstallment && item.installmentId
          ? `${item.id}-inst-${item.installmentId}`
          : item.id;

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          unique.push(item);
        }
      }

      setDeductionsData(unique);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reload deductions';
      console.error('Error reloading deductions:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [usersMap, vendors, currentMonth, servicePartnerId, transformInstallmentToDisplay]);

  // Keep latest reloadDeductions in a ref so the trigger effect doesn't re-fire
  // every time its identity changes (vendors/usersMap recompute on each load).
  const reloadRef = useRef(reloadDeductions);
  useEffect(() => { reloadRef.current = reloadDeductions; }, [reloadDeductions]);

  // Load initial data (once)
  const didLoadInitial = useRef(false);
  useEffect(() => {
    if (didLoadInitial.current) return;
    didLoadInitial.current = true;
    (async () => {
      try {
        const [vendorsData, vehiclesData, routesData] = await Promise.all([
          fetchVendors({ allUserTypes: true }),
          fetchVehicles(),
          fetchRoutes(),
        ]);
        setVendors(vendorsData);
        setVehicles(vehiclesData);
        setRoutes(routesData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    })();
  }, []);

  // Reload deductions when vendors finish loading or filter inputs change.
  // Deps are primitives only — avoids re-firing on reloadDeductions identity churn.
  const vendorsReady = vendors.length > 0;
  useEffect(() => {
    if (!vendorsReady) {
      setLoading(true);
      return;
    }
    reloadRef.current();
  }, [vendorsReady, currentMonth, servicePartnerId]);

  return {
    deductionsData,
    vendors,
    vehicles,
    routes,
    loading,
    error,
    currentMonth,
    setCurrentMonth,
    usersMap,
    uniqueCouriers,
    reloadDeductions,
  };
};



