import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { useState, useEffect, useCallback, useRef } from 'react';
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth'
import { Filters } from '../types';
import { DepositWithServiceTypesAndRoutesDTO } from '@/lib/serviceTypes';
import type { DailyOperationsReportDTO } from '@/lib/daily-operations-api';
import { extractLoop } from '../utils';

/** Busca todos os reports do período (visualização diária, sem paginação). */
export const useReportsData = (
  currentFilters: Filters,
  depositsData: DepositWithServiceTypesAndRoutesDTO[],
  currentPage: number = 1,
  itemsPerPage: number = 50,
  servicePartnerId?: number
) => {
  const [reports, setReports] = useState<DailyOperationsReportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage,
  });

  const depotToDepositIdMapRef = useRef<Map<string, number>>(new Map());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lógica: se apenas dateTo preenchido, usar dateTo; se ambos, usar range; se apenas dateFrom, usar dateFrom
      let effectiveDateFrom: string;
      let effectiveFinalDate: string;
      
      if (currentFilters.dateTo?.trim() && !currentFilters.dateFrom?.trim()) {
        // Apenas dateTo preenchido: usar dateTo para ambos
        effectiveDateFrom = currentFilters.dateTo.trim();
        effectiveFinalDate = currentFilters.dateTo.trim();
      } else if (currentFilters.dateFrom?.trim() && currentFilters.dateTo?.trim()) {
        // Ambos preenchidos: usar range
        effectiveDateFrom = currentFilters.dateFrom.trim();
        effectiveFinalDate = currentFilters.dateTo.trim();
      } else if (currentFilters.dateFrom?.trim()) {
        // Apenas dateFrom preenchido: usar dateFrom para ambos
        effectiveDateFrom = currentFilters.dateFrom.trim();
        effectiveFinalDate = currentFilters.dateFrom.trim();
      } else {
        // Nenhum preenchido: não fazer busca
        setLoading(false);
        setReports([]);
        return;
      }

      // Mapear depot para depositId
      let depositId: number | undefined = undefined;
      if (currentFilters.depot !== 'All') {
        if (depotToDepositIdMapRef.current.has(currentFilters.depot)) {
          depositId = depotToDepositIdMapRef.current.get(currentFilters.depot);
        } else {
          if (depositsData.length > 0) {
            const foundDeposit = depositsData.find(d => d.depositName === currentFilters.depot);
            if (foundDeposit?.depositId !== undefined) {
              depositId = foundDeposit.depositId;
              depotToDepositIdMapRef.current.set(currentFilters.depot, depositId);
            }
          }
        }
      }

      // Coletar serviceTypeIds baseado no filtro
      let serviceTypeIds: number[] = [];

      if (currentFilters.loop !== 'All') {
        const foundServiceTypeIds = new Set<number>();

        if (depositsData.length > 0) {
          for (const deposit of depositsData) {
            if (currentFilters.depot !== 'All' && depositId !== undefined && deposit.depositId !== depositId) {
              continue;
            }

            for (const serviceType of deposit.serviceTypes) {
              const serviceTypeName = serviceType.name || '';
              const baseLoopFromName = serviceTypeName.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim();
              const baseLoop = extractLoop(baseLoopFromName) || extractLoop(serviceTypeName);

              let matches = false;

              for (const route of serviceType.routes) {
                if (route.routeName) {
                  const routeLoop = extractLoop(route.routeName);
                  if (routeLoop === currentFilters.loop || baseLoop === currentFilters.loop) {
                    matches = true;
                    break;
                  }
                }
              }

              if (!matches && baseLoop === currentFilters.loop) {
                matches = true;
              }

              if (matches) {
                foundServiceTypeIds.add(serviceType.serviceTypeId);

                const isFlexServiceType = serviceType.name?.includes('_FLEX') || serviceType.name?.includes('FLEX');
                const baseName = serviceTypeName.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim();

                if (baseName) {
                  for (const otherServiceType of deposit.serviceTypes) {
                    if (otherServiceType.serviceTypeId !== serviceType.serviceTypeId) {
                      const otherIsFlex = otherServiceType.name?.includes('_FLEX') || otherServiceType.name?.includes('FLEX');
                      const otherBaseName = otherServiceType.name?.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim() || '';

                      if (baseName === otherBaseName && isFlexServiceType !== otherIsFlex) {
                        foundServiceTypeIds.add(otherServiceType.serviceTypeId);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        serviceTypeIds = Array.from(foundServiceTypeIds);
      } else if (currentFilters.depot !== 'All' && depositId !== undefined) {
        const selectedDeposit = depositsData.find(d => d.depositId === depositId);
        if (selectedDeposit && selectedDeposit.serviceTypes) {
          const serviceTypeIdsSet = new Set<number>();
          const processedServiceTypes = new Set<number>();

          selectedDeposit.serviceTypes.forEach(serviceType => {
            if (processedServiceTypes.has(serviceType.serviceTypeId)) {
              return;
            }

            serviceTypeIdsSet.add(serviceType.serviceTypeId);
            processedServiceTypes.add(serviceType.serviceTypeId);

            const isFlexServiceType = serviceType.name?.includes('_FLEX') || serviceType.name?.includes('FLEX');
            const baseName = serviceType.name?.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim() || '';

            if (baseName) {
              selectedDeposit.serviceTypes.forEach(otherServiceType => {
                if (otherServiceType.serviceTypeId !== serviceType.serviceTypeId &&
                  !processedServiceTypes.has(otherServiceType.serviceTypeId)) {
                  const otherIsFlex = otherServiceType.name?.includes('_FLEX') || otherServiceType.name?.includes('FLEX');
                  const otherBaseName = otherServiceType.name?.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim() || '';

                  if (baseName === otherBaseName && isFlexServiceType !== otherIsFlex) {
                    serviceTypeIdsSet.add(otherServiceType.serviceTypeId);
                    processedServiceTypes.add(otherServiceType.serviceTypeId);
                  }
                }
              });
            }
          });

          serviceTypeIds = Array.from(serviceTypeIdsSet);
        }
      }

      // Preparar parâmetros de busca
      const searchTerm = currentFilters.search.trim();

      const params = new URLSearchParams();
      params.set("initialDate", effectiveDateFrom);
      params.set("finalDate", effectiveFinalDate);

      if (depositId !== undefined && depositId !== 0) {
        params.set("depositId", depositId.toString());
      }

      if (serviceTypeIds.length > 0) {
        serviceTypeIds.forEach(id => {
          params.append("serviceTypeId", id.toString());
        });
      }

      params.set("forceRefresh", "false");
      params.set("currentPage", currentPage.toString());
      params.set("totalItensPerPage", itemsPerPage.toString());

      if (searchTerm && searchTerm.trim() !== '') {
        params.set("registration_plate", searchTerm.trim());
        params.set("route_name", searchTerm.trim());
        params.set("vendorName", searchTerm.trim());
      }

      if (servicePartnerId !== undefined && servicePartnerId !== 0) {
        params.set("servicePartnerId", servicePartnerId.toString());
      }

      if (!hasAuthSession()) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const API_BASE_URL = getApiBaseUrl();
      if (!API_BASE_URL) {
        throw new Error("API URL is not configured. Please check your environment variables.");
      }

      const response = await fetch(`${API_BASE_URL}/bff/reports/by-date-range?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getBearerAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to fetch reports (${response.status})`
        );
      }

      const data = await response.json();
      const list = data?.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setReports(list);
      setPagination(
        data?.pagination ?? {
          currentPage,
          totalPages: 1,
          totalItems: list.length,
          itemsPerPage,
        }
      );
    } catch (err: unknown) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setReports([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage,
      });
    } finally {
      setLoading(false);
    }
  }, [currentFilters, depositsData, currentPage, itemsPerPage, servicePartnerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { reports, loading, error, setError, pagination };
};


