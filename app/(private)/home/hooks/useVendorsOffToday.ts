"use client";

import { useState, useEffect } from 'react';
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth'
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { fetchVendors } from '@/lib/vendors';
import { Vendor } from '@/lib/vendors';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

export interface VendorOffInfo {
  vendor: Vendor;
  reason: 'day_off' | 'inactive' | 'on_leave'
  notes?: string;
}

/**
 * Hook para buscar todos os vendors off do dia atual
 * @param date - Data no formato YYYY-MM-DD (opcional, padrão: hoje)
 * @returns Array de vendors off com informações adicionais
 */

export function useVendorsOffToday(date?: string): {
  vendorsOff: VendorOffInfo[];
  isLoading: boolean;
  error: string | null;
} {
  const [vendorsOff, setVendorsOff] = useState<VendorOffInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchVendorsOff = async () => {

      try {
        setIsLoading(true);
        setError(null);

        // Formatar data (hoje se não fornecida)
        const targetDate = date || (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');

          return `${year}-${month}-${day}`;
        })();

        const API_BASE_URL = getApiBaseUrl();

        if (!API_BASE_URL) {
          throw new Error('API URL não configurada');
        }

        if (!hasAuthSession()) {
          throw new Error('Token de autenticação não encontrado');
        }

        // Buscar todos os vendors
        const allVendors = await fetchVendors();

        // Buscar day-off items: vendors com status NotWorking e OFF
        const params = new URLSearchParams();

        params.set('date', targetDate);
        params.set('routeId', BUSINESS_RULES.ROUTE.DAY_OFF.toString());
        params.set('depositId', BUSINESS_RULES.DEPOSIT.DAY_OFF.toString());
        params.set('status', BUSINESS_RULES.WORKING_STATUS.NOT_ALLOCATED);
        params.append('status', BUSINESS_RULES.WORKING_STATUS.OFF);

        const dayOffResponse = await fetch(

          `${API_BASE_URL}/bff/week-planners/day-off-items?${params.toString()}`,

          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...getBearerAuthHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
            cache: 'no-store',
          }
        );

        if (!dayOffResponse.ok) {
          if (dayOffResponse.status === 401 || dayOffResponse.status === 403) {
            throw new Error('Token inválido. Faça login novamente.');
          }

          console.warn('Erro ao buscar day-off items:', dayOffResponse.status);
        }

        const dayOffData = await dayOffResponse.json();

        let dayOffItems: Array<Record<string, unknown>> = [];

        if (Array.isArray(dayOffData)) {
          dayOffItems = dayOffData;
        } else if (dayOffData.data && Array.isArray(dayOffData.data)) {
          dayOffItems = dayOffData.data;
        } else if (dayOffData.weekPlanners && Array.isArray(dayOffData.weekPlanners)) {
          dayOffItems = dayOffData.weekPlanners;
        } else if (dayOffData.week_planners && Array.isArray(dayOffData.week_planners)) {
          dayOffItems = dayOffData.week_planners;
        }

        // Criar mapa de vendors por ID
        const vendorsMap = new Map<number, Vendor>();

        allVendors.forEach((vendor) => {
          vendorsMap.set(vendor.userId, vendor);
        });

        // Processar vendors off
        const vendorsOffList: VendorOffInfo[] = [];
        const processedUserIds = new Set<number>();

        // Adicionar vendors com day-off
        dayOffItems.forEach((item) => {
          const userId = Number(item.userId ?? 0);

          if (userId && !processedUserIds.has(userId)) {
            const vendor = vendorsMap.get(userId);

            if (vendor) {
              processedUserIds.add(userId);
              vendorsOffList.push({
                vendor,
                reason: 'day_off',
                notes: item.notes ? String(item.notes) : undefined,
              });
            }
          }
        });

        // Adicionar vendors inativos ou em licença
        allVendors.forEach((vendor) => {
          if (!processedUserIds.has(vendor.userId)) {
            // Verificar status do vendor (pode não estar tipado)
            const vendorStatus = (vendor as Vendor & { status?: string }).status;

            if (vendorStatus === 'inactive' || vendorStatus === 'on_leave') {
              processedUserIds.add(vendor.userId);
              vendorsOffList.push({
                vendor,
                reason: vendorStatus === 'inactive' ? 'inactive' : 'on_leave',
              });
            }
          }
        });

        // Ordenar por nome
        vendorsOffList.sort((a, b) => 
          a.vendor.fullName.localeCompare(b.vendor.fullName)
        );

        if (!cancelled) {
          setVendorsOff(vendorsOffList);
        }
      } catch (err) {
        console.error('Erro ao buscar vendors off:', err);

        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao buscar vendors off');
          setVendorsOff([]);
        }

      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchVendorsOff();

    return () => {
      cancelled = true;
    };

  }, [date]);

  return { vendorsOff, isLoading, error };
}
