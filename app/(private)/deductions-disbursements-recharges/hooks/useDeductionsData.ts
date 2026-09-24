import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Vendor } from '@/lib/vendors';
import { fetchAllDeductions, fetchFixDamageInstallments, fetchPrePaymentInstallments, fetchOtherInstallments } from '@/lib/deductions-api';
import { fetchVendors } from '@/lib/vendors';
import type { DisplayDeduction } from '../types';
import { transformDeductionToDisplay, transformInstallmentToDisplay } from '../transformers';
import { fetchVehicles, Vehicle } from '@/lib/vehicles';
import { fetchRoutes, Route } from '@/lib/api/routes';

export const useDeductionsData = (currentMonth: Date) => {
  const [deductionsData, setDeductionsData] = useState<DisplayDeduction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create usersMap from vendors using useMemo to avoid infinite loops
  const usersMap = useMemo(() => {
    const map = new Map<number, string>();
    vendors.forEach((vendor) => {
      map.set(vendor.userId, vendor.fullName);
    });
    return map;
  }, [vendors]);

  // Fetch vendors, vehicles, and routes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorsData, vehiclesData, routesData] = await Promise.all([
          fetchVendors(),
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
    };
    loadData();
  }, []);

  const reloadDeductions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Extract month and year from currentMonth
      const month = currentMonth.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
      const year = currentMonth.getFullYear();

      // Fetch both deductions and installments
      const [allDeductions, fixDamageInstallments, prePaymentInstallments, otherInstallments] = await Promise.all([
        fetchAllDeductions(month, year),
        fetchFixDamageInstallments(month, year),
        fetchPrePaymentInstallments(month, year),
        fetchOtherInstallments(month, year),
      ]);

      const transformed: DisplayDeduction[] = [];

      // Transform deductions
      allDeductions.fixDamage.forEach((d) => {
        transformed.push(transformDeductionToDisplay(d, 'Repairs & Damages', usersMap, vendors));
      });
      allDeductions.trafficPenalty.forEach((d) => {
        transformed.push(transformDeductionToDisplay(d, 'Traffic Penalties', usersMap, vendors));
      });
      allDeductions.prePayment.forEach((d) => {
        transformed.push(transformDeductionToDisplay(d, 'Pre-Payments', usersMap, vendors));
      });
      allDeductions.liquidationDamage.forEach((d) => {
        transformed.push(transformDeductionToDisplay(d, 'Liquidation Damages', usersMap, vendors));
      });
      allDeductions.other.forEach((d) => {
        transformed.push(transformDeductionToDisplay(d, 'Other', usersMap, vendors));
      });

      // Transform installments
      fixDamageInstallments.forEach((inst) => {
        const display = transformInstallmentToDisplay(inst, 'Repairs & Damages', usersMap, vendors);
        if (display) {
          transformed.push(display);
        }
      });

      prePaymentInstallments.forEach((inst) => {
        const display = transformInstallmentToDisplay(inst, 'Pre-Payments', usersMap, vendors);
        if (display) {
          transformed.push(display);
        }
      });

      otherInstallments.forEach((inst) => {
        const display = transformInstallmentToDisplay(inst, 'Other', usersMap, vendors);
        if (display) {
          transformed.push(display);
        }
      });

      // Remove duplicates while keeping installments with the same reference number separate.
      // For installments we key by (reference_number + installmentId); for base deductions
      // we keep the old behavior (one row per reference_number).
      const unique = transformed.filter((item, index, self) => {
        const key = item.isInstallment && item.installmentId
          ? `${item.id}-inst-${item.installmentId}`
          : item.id;

        return index === self.findIndex((t) => {
          const otherKey = t.isInstallment && t.installmentId
            ? `${t.id}-inst-${t.installmentId}`
            : t.id;
          return otherKey === key;
        });
      });

      setDeductionsData(unique);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reload deductions';
      console.error('Error reloading deductions:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [usersMap, vendors, currentMonth]);

  // Reload deductions when vendors are loaded or when month changes
  useEffect(() => {
    if (vendors.length > 0) {
      reloadDeductions();
    }
  }, [vendors.length, currentMonth, reloadDeductions]);

  const uniqueCouriers = useMemo(() => {
    return vendors.map((d) => d.fullName).sort();
  }, [vendors]);

  return {
    deductionsData,
    vendors,
    vehicles,
    routes,
    loading,
    error,
    uniqueCouriers,
    reloadDeductions,
  };
};


