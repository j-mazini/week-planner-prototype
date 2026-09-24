import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { useState, useCallback, useRef } from 'react';
import { getBearerAuthHeader } from '@/lib/auth';
import { fetchVendorsFromUsers, type Vendor } from '@/lib/vendors';
import { fetchDepositsWithServiceTypesAndRoutes, DepositWithServiceTypesAndRoutesDTO } from '@/lib/serviceTypes';
import { fetchCostModels, CostModel } from '@/lib/api/cost-models';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { InsightRow, ReportPaginatedResponseDTO, PaginationState, Route, Vehicle } from '../types';
import { mapOperationToInsightRow, getCostModelIdFromPaymentMode, extractLoop } from '../utils';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

interface UseDailyFinancialDataReturn {
  insightRows: InsightRow[];
  loading: boolean;
  pagination: PaginationState;
  depositsData: DepositWithServiceTypesAndRoutesDTO[];
  costModels: CostModel[];
  vendors: Vendor[];
  routes: Route[];
  vehicles: Vehicle[];
  adhocServices: AdhocServiceDTO[];
  depotToDepositIdMapRef: React.MutableRefObject<Map<string, number>>;
  loopToServiceTypeIdMapRef: React.MutableRefObject<Map<string, number>>;
  fetchWithParams: (
    dateFrom: string,
    dateTo: string,
    params: URLSearchParams,
    page: number,
    pageSize: number,
    searchTerm?: string
  ) => Promise<void>;
  fetchInitialData: () => Promise<void>;
  fetchModalData: () => Promise<void>;
}

export const useDailyFinancialData = (
  depotFilter: string,
  loopFilter: string,
  paymentFilter?: string
): UseDailyFinancialDataReturn => {
  const [insightRows, setInsightRows] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const [depositsData, setDepositsData] = useState<DepositWithServiceTypesAndRoutesDTO[]>([]);
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);

  const depotToDepositIdMapRef = useRef<Map<string, number>>(new Map());
  const loopToServiceTypeIdMapRef = useRef<Map<string, number>>(new Map());

  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch deposits with service types
      const depositsResponse = await fetchDepositsWithServiceTypesAndRoutes();
      setDepositsData(depositsResponse);
      
      // Build depot mapping
      depositsResponse.forEach(deposit => {
        if (deposit.depositName && 
            deposit.serviceTypes && 
            deposit.serviceTypes.length > 0) {
          depotToDepositIdMapRef.current.set(deposit.depositName, deposit.depositId);
        }
      });
      
      // Build loop mapping
      depositsResponse.forEach(deposit => {
        deposit.serviceTypes.forEach(serviceType => {
          const isFlexServiceType = serviceType.name?.includes('_FLEX') || serviceType.name?.includes('FLEX');
          const serviceTypeName = serviceType.name || '';
          const baseLoopFromName = serviceTypeName.replace(/_FLEX$/i, '').replace(/FLEX/i, '').trim();
          const baseLoop = extractLoop(baseLoopFromName) || extractLoop(serviceTypeName);
          
          serviceType.routes.forEach(route => {
            if (route.routeName) {
              const routeLoop = extractLoop(route.routeName);
              if (routeLoop) {
                const loopKey = isFlexServiceType ? `${routeLoop}_FLEX` : routeLoop;
                loopToServiceTypeIdMapRef.current.set(loopKey, serviceType.serviceTypeId);
                if (isFlexServiceType) {
                  loopToServiceTypeIdMapRef.current.set(routeLoop, serviceType.serviceTypeId);
                }
              }
            }
          });
          
          if (serviceType.routes.length === 0 && baseLoop) {
            const loopKey = isFlexServiceType ? `${baseLoop}_FLEX` : baseLoop;
            loopToServiceTypeIdMapRef.current.set(loopKey, serviceType.serviceTypeId);
          }
        });
      });
      
      // Fetch cost models
      const allCostModels = await fetchCostModels();
      const filteredCostModels = allCostModels.filter(cm => 
        cm.costModelId === BUSINESS_RULES.COST_MODEL.DAF || 
        cm.costModelId === BUSINESS_RULES.COST_MODEL.DR || 
        cm.costModelId === BUSINESS_RULES.COST_MODEL.FSR || 
        cm.costModelId === BUSINESS_RULES.COST_MODEL.VSR ||
        cm.costModelId === BUSINESS_RULES.COST_MODEL.HOURLY_RATE ||
        cm.costModelId === BUSINESS_RULES.COST_MODEL.SP_VSR
      );
      setCostModels(filteredCostModels);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  const fetchModalData = useCallback(async () => {
    try {
      // Vendors (NewUserByAdminDTO[]) via GET /bff/vendor — mesmo contrato que Week Planner / modal
      try {
        const vendorsAsVendors = await fetchVendorsFromUsers();
        setVendors(vendorsAsVendors.filter((d) => d.userId > 0));
      } catch (vendorErr) {
        console.error('Error fetching vendors for modal (GET /bff/vendor):', vendorErr);
        setVendors([]);
      }

      // Fetch routes
      const routesResponse = await fetch(
        `${getApiBaseUrl()}/bff/routes`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getBearerAuthHeader(),
          },
        }
      );
      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        setRoutes(routesData || []);
      }

      // Fetch vehicles
      const vehiclesResponse = await fetch(
        `${getApiBaseUrl()}/bff/vehicles`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getBearerAuthHeader(),
          },
        }
      );
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        const vehiclesArray = Array.isArray(vehiclesData) 
          ? vehiclesData 
          : (vehiclesData.vehicles || []);
        setVehicles(vehiclesArray);
      }

      try {
        const services = await fetchAdhocServices();
        setAdhocServices(services);
      } catch (adhocErr) {
        console.error('Error fetching adhoc services (GET /bff/adhoc-services):', adhocErr);
        setAdhocServices([]);
      }
    } catch (error) {
      console.error('Error fetching modal data:', error);
    }
  }, []);

  const fetchWithParams = useCallback(
    async (dateFrom: string, dateTo: string, params: URLSearchParams, page: number = 1, pageSize: number = 10, searchTerm?: string) => {
      setLoading(true);
      setInsightRows([]);
      
      try {
        // dateTo vazio => modo "dia" (finalDate = dateFrom)
        const effectiveDateTo = dateTo?.trim() ? dateTo : dateFrom;
        const normalizedDateFrom = dateFrom.trim();
        const normalizedDateTo = effectiveDateTo.trim();

        // Map depot to depositId
        let depositId: number | undefined = undefined;
        if (depotFilter !== 'All') {
          if (depotToDepositIdMapRef.current.has(depotFilter)) {
            depositId = depotToDepositIdMapRef.current.get(depotFilter);
          }
        }
        
        // Collect serviceTypeIds based on filter
        let serviceTypeIds: number[] = [];
        
        if (loopFilter !== 'All') {
          const foundServiceTypeIds = new Set<number>();
          
          if (depositsData.length > 0) {
            for (const deposit of depositsData) {
              if (depotFilter !== 'All' && depositId !== undefined && deposit.depositId !== depositId) {
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
                    if (routeLoop === loopFilter || baseLoop === loopFilter) {
                      matches = true;
                      break;
                    }
                  }
                }
                
                if (!matches && baseLoop === loopFilter) {
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
        } else if (depotFilter !== 'All' && depositId !== undefined) {
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
        
        // Map payment mode to costModelId
        let costModelId: number | undefined = undefined;
        if (paymentFilter && paymentFilter !== 'All') {
          costModelId = getCostModelIdFromPaymentMode(paymentFilter);
        }
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.set('initialDate', normalizedDateFrom);
        queryParams.set('finalDate', normalizedDateTo);
        
        if (depositId !== undefined && depositId !== 0) {
          queryParams.set('depositId', depositId.toString());
        }
        
        if (serviceTypeIds.length > 0) {
          serviceTypeIds.forEach(id => {
            queryParams.append('serviceTypeId', id.toString());
          });
        }
        
        if (costModelId !== undefined) {
          queryParams.set('costModelId', costModelId.toString());
        }
        
        queryParams.set('forceRefresh', 'false');
        queryParams.set('currentPage', page.toString());
        queryParams.set('totalItensPerPage', pageSize.toString());
        
        if (searchTerm && searchTerm.trim() !== '') {
          queryParams.set('registration_plate', searchTerm.trim());
          queryParams.set('route_name', searchTerm.trim());
          queryParams.set('vendorName', searchTerm.trim());
        }
        
        const response = await fetch(
          `${getApiBaseUrl()}/bff/reports/by-date-range?${queryParams.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...getBearerAuthHeader(),
            },
          }
        );

        if (response.ok) {
          const paginatedResponse: ReportPaginatedResponseDTO = await response.json();
          setPagination(paginatedResponse.pagination);
          
          const mappedRows = paginatedResponse.data
            .map(mapOperationToInsightRow)
            .sort((a, b) => {
              const dateA = String(a.date ?? '');
              const dateB = String(b.date ?? '');
              if (dateA !== dateB) return dateA.localeCompare(dateB);

              const routeA = String(a.route ?? '').toLowerCase();
              const routeB = String(b.route ?? '').toLowerCase();
              return routeA.localeCompare(routeB);
            });
          setInsightRows(mappedRows);
          
          if (mappedRows.length > 0) {
            mappedRows.forEach(row => {
              if (row.depot) {
                const reportData = paginatedResponse.data.find(r => r.depositName === row.depot);
                if (reportData && reportData.depositId !== undefined) {
                  depotToDepositIdMapRef.current.set(row.depot, reportData.depositId);
                }
              }
            });
          }
        } else {
          console.error('Error fetching data:', response.status, response.statusText);
          setInsightRows([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: pageSize
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setInsightRows([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: pageSize
        });
      } finally {
        setLoading(false);
      }
    },
    [depotFilter, loopFilter, paymentFilter, depositsData]
  );

  return {
    insightRows,
    loading,
    pagination,
    depositsData,
    costModels,
    vendors,
    routes,
    vehicles,
    adhocServices,
    depotToDepositIdMapRef,
    loopToServiceTypeIdMapRef,
    fetchWithParams,
    fetchInitialData,
    fetchModalData,
  };
};



