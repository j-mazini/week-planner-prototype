"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations/page-animation';
import { DgpPageFrame } from '@/app/(private)/components';
import { fetchWeekPlannersPaginated, fetchAllWeekPlannersForDate, updateWeekPlanner, deleteWeekPlanner, createWeekPlanner, createOperationsFromWeekPlanners } from './services/apiService';
import type { WeekPlannerRecord } from './contexts/PlannerContext';
import type { WeekPlannerUpdateDTO, WeekPlannerCreateDTO, WeekPlannerToOperationDTO } from './types/week-planner-dto';
import { fetchVendorsFromUsers, Vendor } from '@/lib/vendors';
import { fetchRoutes, Route } from '@/lib/api/routes';
import { fetchVehicles, Vehicle } from '@/lib/vehicles';
import { fetchCostModels, CostModel } from '@/lib/api/cost-models';
import { fetchVendorTypes, VendorType, fetchCostModelEmployeesByUserId, type CostModelItem } from '@/lib/vendors-api';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { ADHOC_OPERATION_CREATE_DEFAULTS } from '@/lib/adhoc-operation-defaults';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { fetchDepositsWithRoutes, type DepositDTO } from '@/lib/api/deposits';
import { fetchDailyGamePlansByDate } from '@/app/(private)/daily-game-plan/api';
import { getDayOffEntries, type DayOffEntry } from '@/lib/day-off-api';
import { fetchWeekPlannersStatusOff } from './services/apiService';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { OperationsHeaderControls } from "./components/operations-management/OperationsHeaderControls";
import { OperationsFiltersBar } from "./components/operations-management/OperationsFiltersBar";
import { OperationsTable } from "./components/operations-management/OperationsTable";
import { OperationsFormModal } from "./components/operations-management/OperationsFormModal";
import { OperationsReviewModal } from "./components/operations-management/OperationsReviewModal";
import { OperationsHistoryModal } from "./components/operations-management/OperationsHistoryModal";
import { SuccessCelebration } from "./components/operations-management/SuccessCelebration";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { loadJsPDF } from "@/lib/lazy-imports";
import { TABLE_HEADERS } from "./types/operations-management";
import type { ConfettiPiece, FrontendOperationRecord, OperationsHistoryEntry } from "./types/operations-management";
import { mapWeekPlannerToFrontend, extraToNumeric10_2, formatDecimalHoursAsTime, toOptionalRate } from "./utils/operationsManagementMappers";
import { weekPlannerOperationsStyles } from "./styles";
import DailyOperationsManagementPage from "./DailyOperationsManagementPage";
import { RateBandsModal } from "./components/operations-management/RateBandsModal";
import { buildRateDetailsModalData, type RateDetailsModalData } from "./utils/rateDetailsModalData";
import { useServicePartners } from "@/hooks/useServicePartners";

function CloseSidebarOnModalOpen({ open }: { open: boolean }) {
    const { isMobile, setOpen, setOpenMobile } = useSidebar();

    useEffect(() => {
        if (!open) return;
        // Ensure sidebar is closed whenever a modal is shown (prevents overlay/z-index conflicts).
        if (isMobile) setOpenMobile(false);
        setOpen(false);
    }, [open, isMobile, setOpen, setOpenMobile]);

    return null;
}

// --- Listas Mestras para o Formul�rio (ser�o carregadas do backend) ---

// Helper function to normalize date (remove timezone, keep only YYYY-MM-DD)
const normalizeDate = (dateString: string): string => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    // If it contains timezone info, extract only the date part
    const datePart = dateString.split('T')[0];
    return datePart || dateString;
};

const REQUIRED_DAILY_GAME_PLAN_DEPOSITS = [1, 2, 3, 7];
const DAILY_GAME_PLAN_DEPOSIT_LABELS: Record<number, string> = {
    1: 'LCY',
    2: 'MSE',
    3: 'LSE',
    7: 'BAOP',
};

const getReviewValidationKey = (item: FrontendOperationRecord): string => {
    if (item.weekPlannerId != null && Number.isFinite(Number(item.weekPlannerId))) {
        return `wp:${Number(item.weekPlannerId)}`;
    }
    if (item.operationId != null && Number.isFinite(Number(item.operationId))) {
        return `op:${Number(item.operationId)}`;
    }
    return `fallback:${normalizeDate(item.Date)}|${String(item.Route || '').trim().toLowerCase()}|${String(item.Name || '').trim().toLowerCase()}|${String(item.Vehicle || '').trim().toLowerCase()}`;
};

const isBandedCostModelId = (costModelId: number): boolean => costModelId === 1 || costModelId === 4; // DAF / VSR
const isFixedRateCostModelId = (costModelId: number): boolean => costModelId === 2 || costModelId === 3; // DR / FSR

// NOTE: use `toOptionalRate` imported from `operationsManagementMappers` (single source of truth).

// Fun��o para mapear dados do frontend para WeekPlannerUpdateDTO
const mapFrontendToWeekPlannerUpdate = (
    frontend: FrontendOperationRecord,
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[],
    costModels: CostModel[],
    weekPlannerRaw?: Record<string, unknown>,
    adhocServices: AdhocServiceDTO[] = [],
    vendorTypes: VendorType[] = [],
    deposits: DepositDTO[] = []
): WeekPlannerUpdateDTO => {
    const vendor = vendors.find(d => d.fullName === frontend.Name);
    const route = routes.find(r => r.routeName === frontend.Route);
    const vehicle = vehicles.find(v => v.registrationPlates === frontend.Vehicle || (frontend.Vehicle === 'NOVEHICLE' && !v));
    
    // Extrair costModelId do Payment Mode selecionado no formul�rio
    // Priorizar o valor do formul�rio (novo valor selecionado) sobre o raw data
    let costModelId: number | undefined;
    
    // Fun��o helper para buscar costModelId
    const findCostModelId = (paymentModeValue: string | number | undefined): number | undefined => {
        if (!paymentModeValue) return undefined;
        
        // Primeiro, tentar como n�mero (ID direto)
        const paymentModeAsNumber = Number(paymentModeValue);
        if (!isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
            const costModel = costModels.find(cm => cm.costModelId === paymentModeAsNumber);
            if (costModel && costModel.costModelId) {
                return costModel.costModelId;
            }
        }
        
        // Fun��o para limpar o nome do cost model (mesma l�gica do formul�rio)
        const getCleanName = (name: string | undefined): string => {
            if (!name) return '';
            const upperName = name.toUpperCase();
            const cleanName = upperName
                .replace(/_RATE/g, '')
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (cleanName.includes('DAF')) return 'DAF';
            if (cleanName.includes('DR') && !cleanName.includes('VSR') && !cleanName.includes('FSR')) return 'DR';
            if (cleanName.includes('VSR')) return 'VSR';
            if (cleanName.includes('FSR')) return 'FSR';
            return cleanName;
        };
        
        // Tentar encontrar por nome formatado
        const searchValue = String(paymentModeValue).toUpperCase();
        const costModel = costModels.find(cm => {
            const cleanName = getCleanName(cm.name) || getCleanName(cm.description);
            return cleanName.toUpperCase() === searchValue;
        });
        
        if (costModel && costModel.costModelId) {
            return costModel.costModelId;
        }
        
        return undefined;
    };
    
    // Priorizar Payment Mode do formul�rio (valor atual selecionado) sobre paymentModeId (valor original)
    // O Payment Mode do formul�rio ser� o ID quando o usu�rio seleciona um novo valor
    if (frontend['Payment Mode']) {
        costModelId = findCostModelId(frontend['Payment Mode']);
    } else if (frontend.paymentModeId) {
        // Fallback: usar paymentModeId se Payment Mode n�o estiver definido
        costModelId = findCostModelId(frontend.paymentModeId);
    }
    
    // Fallback final: usar raw data apenas se n�o encontrou no formul�rio
    if (!costModelId && weekPlannerRaw?.costModel && typeof weekPlannerRaw.costModel === 'object') {
        const costModel = weekPlannerRaw.costModel as Record<string, unknown>;
        const rawCm =
            costModel.costModelId != null
                ? Number(costModel.costModelId)
                : costModel.costModelId != null
                  ? Number(costModel.costModelId)
                  : undefined;
        costModelId = rawCm != null && Number.isFinite(rawCm) ? rawCm : undefined;
    }
    
    // Priorizar vendorTypeId do formul�rio (valor atual selecionado) sobre raw data (valor original)
    // Buscar vendorTypeId baseado no Vendor type selecionado no formul�rio
    let vendorTypeId: number | undefined;
    if (frontend['Vendor type']) {
        const vendorType = vendorTypes.find(dt => 
            dt.nameType?.toUpperCase() === frontend['Vendor type'].toUpperCase() ||
            dt.nameType?.toUpperCase().includes(frontend['Vendor type'].toUpperCase())
        );
        if (vendorType && vendorType.vendorTypeId) {
            vendorTypeId = vendorType.vendorTypeId;
        }
    }
    
    // Fallback: usar raw data apenas se n�o encontrou no formul�rio
    if (!vendorTypeId && weekPlannerRaw?.vendorType && typeof weekPlannerRaw.vendorType === 'object') {
        const vendorType = weekPlannerRaw.vendorType as Record<string, unknown>;
        vendorTypeId = vendorType.vendorTypeId ? Number(vendorType.vendorTypeId) : undefined;
    }
    
    // Determinar isDayOff baseado no Status
    // Se Status � 'Off', ent�o isDayOff pode ser true, mas vamos manter o status original
    const isDayOff = frontend.Status === 'Off';
    
    // Mapear status - manter o formato original se dispon�vel no raw, sen�o converter
    let status: string | undefined;
    if (weekPlannerRaw?.status) {
        status = String(weekPlannerRaw.status);
    } else {
        // Converter do formato do frontend para o formato do backend
        if (frontend.Status === 'Working') {
            status = 'Working'; // Manter 'Working' conforme a API retorna
        } else if (frontend.Status === 'Off') {
            status = 'Off';
        }
    }
    
    // Extrair routeCost do raw data se dispon�vel
    let routeCost: number | undefined;
    if (weekPlannerRaw?.routeCost !== null && weekPlannerRaw?.routeCost !== undefined) {
        routeCost = typeof weekPlannerRaw.routeCost === 'number' 
            ? weekPlannerRaw.routeCost 
            : parseFloat(String(weekPlannerRaw.routeCost)) || undefined;
    }
    
    // Extrair adhocServiceId
    let adhocServiceId: number | undefined;
    if (frontend.adhocServiceId) {
        const parsedId = typeof frontend.adhocServiceId === 'number' 
            ? frontend.adhocServiceId 
            : Number(frontend.adhocServiceId);
        if (Number.isFinite(parsedId) && parsedId > 0) {
            adhocServiceId = parsedId;
        }
    } else if (frontend['AD-HOC Service']) {
        // Se tiver nome mas n�o ID, tentar encontrar pelo nome
        const adhocService = adhocServices.find(s => 
            String(s.adhocServiceId) === String(frontend['AD-HOC Service']) ||
            s.adhocName === frontend['AD-HOC Service']
        );
        if (adhocService) {
            adhocServiceId = adhocService.adhocServiceId;
        }
    }
    
    // Extrair depositId e depositName baseado no Deposit Name selecionado
    let depositId: number | undefined;
    let depositName: string | undefined;
    if (frontend['Deposit Name']) {
        depositName = frontend['Deposit Name'];
        const deposit = deposits.find(d => d.depositName === frontend['Deposit Name']);
        if (deposit && deposit.depositId) {
            depositId = deposit.depositId;
        }
    }
    // Fallback: tentar obter do raw data se n�o encontrou no formul�rio
    if (!depositId && weekPlannerRaw?.depositId !== null && weekPlannerRaw?.depositId !== undefined) {
        depositId = typeof weekPlannerRaw.depositId === 'number' 
            ? weekPlannerRaw.depositId 
            : Number(weekPlannerRaw.depositId) || undefined;
    }
    // Fallback: tentar obter depositName do raw data se n�o encontrou no formul�rio
    if (!depositName && weekPlannerRaw?.depositName) {
        depositName = String(weekPlannerRaw.depositName);
    }
    
    // Determinar vehicleId: NOVEHICLE usa 55 como placeholder
    let vehicleIdUpdate: number | undefined;
    if (frontend.Vehicle && frontend.Vehicle !== 'NOVEHICLE') {
        vehicleIdUpdate = vehicle?.vehicleId;
    } else if (frontend.Vehicle === 'NOVEHICLE') {
        vehicleIdUpdate = 55;
    }

    return {
        date: frontend.Date,
        routeId: route?.routeId,
        userId: vendor?.userId,
        costModelId: costModelId,
        rate: toOptionalRate(frontend.Rate),
        routeCost: routeCost,
        routeSort:
          frontend.routeSort != null && String(frontend.routeSort).trim() !== "" && Number.isFinite(Number(frontend.routeSort))
            ? Number(frontend.routeSort)
            : (typeof frontend.Sort === 'number' ? frontend.Sort : (frontend.Sort ? parseFloat(String(frontend.Sort)) : 0)),
        adhocSort: typeof frontend['AD-HOC Sort'] === 'number' ? frontend['AD-HOC Sort'] : (frontend['AD-HOC Sort'] ? parseFloat(String(frontend['AD-HOC Sort'])) : 0),
        adhocServiceId: adhocServiceId,
        extra: extraToNumeric10_2(frontend.Extras) ?? 0,
        notes: frontend.Notes || undefined,
        vehicleId: vehicleIdUpdate,
        vendorTypeId: vendorTypeId,
        status: status,
        isDayOff: isDayOff,
        isSort: false,
        operationId: frontend.operationId || undefined,
        depositId: depositId,
        depositName: depositName,
    } as WeekPlannerUpdateDTO;
};

// Fun��o para mapear dados do frontend para WeekPlannerCreateDTO
const mapFrontendToWeekPlannerCreate = (
    frontend: FrontendOperationRecord,
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[],
    costModels: CostModel[],
    vendorTypes: VendorType[],
    adhocServices: AdhocServiceDTO[],
    deposits: DepositDTO[] = []
): WeekPlannerCreateDTO => {
    const isDayOff = frontend.Status === 'Off';

    const nameTrim = String(frontend.Name || '').trim();
    const vendor =
        vendors.find(d => (d.fullName || '').trim() === nameTrim) ||
        vendors.find(d => (d.fullName || '').trim().toLowerCase() === nameTrim.toLowerCase());
    const route = routes.find(r => r.routeName === frontend.Route);
    const vehicle = vehicles.find(v => v.registrationPlates === frontend.Vehicle || (frontend.Vehicle === 'NOVEHICLE' && !v));
    
    if (!vendor) {
        throw new Error(`Vendor not found: "${frontend.Name}". Please select a vendor from the list.`);
    }
    
    // Para Status Off, Route "OFF" n�o existe na lista de rotas; usar routeId fixo 48
    if (!isDayOff && !route) {
        throw new Error(`Route not found: "${frontend.Route}". Please select a route from the list.`);
    }

    const resolveAdhocServiceIdForCreate = (): number | undefined => {
        if (frontend.adhocServiceId) {
            const parsedId = typeof frontend.adhocServiceId === 'number'
                ? frontend.adhocServiceId
                : Number(frontend.adhocServiceId);
            if (Number.isFinite(parsedId) && parsedId > 0) {
                return parsedId;
            }
        }
        if (frontend['AD-HOC Service']) {
            const adhocService = adhocServices.find(s =>
                String(s.adhocServiceId) === String(frontend['AD-HOC Service']) ||
                s.adhocName === frontend['AD-HOC Service']
            );
            if (adhocService) {
                return adhocService.adhocServiceId;
            }
        }
        return undefined;
    };

    const adhocServiceIdResolvedForCreate = resolveAdhocServiceIdForCreate();
    const isAdhocWeekPlannerCreate =
        adhocServiceIdResolvedForCreate != null && adhocServiceIdResolvedForCreate > 0;
    
    // Fun��o helper para buscar costModelId (reutiliz�vel)
    const findCostModelIdForCreate = (paymentModeValue: string | number | undefined): number | undefined => {
        if (!paymentModeValue) return undefined;
        
        // Primeiro, tentar como n�mero (ID direto do select)
        const paymentModeAsNumber = Number(paymentModeValue);
        if (!isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
            const costModel = costModels.find(cm => cm.costModelId === paymentModeAsNumber);
            if (costModel && costModel.costModelId) {
                return costModel.costModelId;
            }
            // Se n�o encontrar na lista filtrada, usar o ID diretamente (pode ser v�lido mas n�o estar na lista)
            return paymentModeAsNumber;
        }
        
        // Fun��o para limpar o nome do cost model (mesma l�gica do formul�rio)
        const getCleanName = (name: string | undefined): string => {
            if (!name) return '';
            const upperName = name.toUpperCase();
            const cleanName = upperName
                .replace(/_RATE/g, '')
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (cleanName.includes('DAF')) return 'DAF';
            if (cleanName.includes('DR') && !cleanName.includes('VSR') && !cleanName.includes('FSR')) return 'DR';
            if (cleanName.includes('VSR')) return 'VSR';
            if (cleanName.includes('FSR')) return 'FSR';
            return cleanName;
        };
        
        // Tentar encontrar por nome formatado
        const searchValue = String(paymentModeValue).toUpperCase();
        const costModel = costModels.find(cm => {
            const cleanName = getCleanName(cm.name) || getCleanName(cm.description);
            return cleanName.toUpperCase() === searchValue;
        });
        
        if (costModel && costModel.costModelId) {
            return costModel.costModelId;
        }
        
        return undefined;
    };
    
    // Buscar costModelId baseado no Payment Mode selecionado
    // O Payment Mode deve ser o costModelId (string do ID do select)
    let costModelId: number | undefined;
    if (isAdhocWeekPlannerCreate) {
        costModelId = ADHOC_OPERATION_CREATE_DEFAULTS.costModelId;
    } else if (frontend['Payment Mode']) {
        costModelId = findCostModelIdForCreate(frontend['Payment Mode']);
    } else if (frontend.paymentModeId) {
        // Fallback: usar paymentModeId se Payment Mode n�o estiver definido
        costModelId = findCostModelIdForCreate(frontend.paymentModeId);
    }
    
    if (!isDayOff && !isAdhocWeekPlannerCreate && (!costModelId || costModelId <= 0)) {
        throw new Error(`Invalid payment mode. Please select a Payment Mode from the list.`);
    }

    // Determinar vehicleId - obrigat�rio. Para NOVEHICLE usa 55 (placeholder no backend)
    let vehicleId: number;
    if (frontend.Vehicle && frontend.Vehicle !== 'NOVEHICLE') {
        if (!vehicle) {
            throw new Error(`Vehicle not found: ${frontend.Vehicle}`);
        }
        vehicleId = Number(vehicle.vehicleId) || BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER;
    } else {
        // NOVEHICLE ou vazio: usa placeholder BAOP (mesmo fallback do week-planner)
        vehicleId = BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER;
    }
    
    // Mapear status
    let status: string | undefined;
    if (frontend.Status === 'Working') {
        status = 'Working';
    } else if (frontend.Status === 'Off') {
        status = 'Off';
    }
    
    // Garantir que todos os campos obrigat�rios sejam n�meros v�lidos
    if (!frontend.Date) {
        throw new Error('Date is required');
    }
    
    const routeId = isDayOff ? BUSINESS_RULES.ROUTE.DAY_OFF : (route?.routeId ?? 0);
    if (!routeId || routeId <= 0) {
        throw new Error(`Invalid routeId for route: ${frontend.Route}`);
    }
    
    if (!vendor.userId || vendor.userId <= 0) {
        throw new Error(`Invalid userId for vendor: ${frontend.Name}`);
    }
    
    if (!isDayOff && !isAdhocWeekPlannerCreate && (!costModelId || costModelId <= 0)) {
        throw new Error(`Invalid costModelId for Payment Mode: ${frontend['Payment Mode']}`);
    }
    
    if (!vehicleId || vehicleId <= 0) {
        throw new Error('Vehicle is required. Please select a vehicle.');
    }
    
    // Buscar vendorTypeId baseado no Vendor type selecionado
    let vendorTypeId: number = 1; // Valor padr�o
    if (frontend['Vendor type']) {
        const vendorType = vendorTypes.find(dt => 
            dt.nameType?.toUpperCase() === frontend['Vendor type'].toUpperCase() ||
            dt.nameType?.toUpperCase().includes(frontend['Vendor type'].toUpperCase())
        );
        if (vendorType && vendorType.vendorTypeId) {
            vendorTypeId = vendorType.vendorTypeId;
        }
    }
    
    // Extrair depositId baseado no Deposit Name selecionado
    let depositId: number | undefined;
    if (frontend['Deposit Name']) {
        const deposit = deposits.find(d => d.depositName === frontend['Deposit Name']);
        if (deposit && deposit.depositId) {
            depositId = deposit.depositId;
        }
    }
    
    return {
        date: frontend.Date,
        routeId: routeId,
        userId: vendor.userId,
        costModelId: costModelId,
        rate: isAdhocWeekPlannerCreate ? ADHOC_OPERATION_CREATE_DEFAULTS.rate : toOptionalRate(frontend.Rate),
        routeCost: 0,
        routeSort:
          frontend.routeSort != null && String(frontend.routeSort).trim() !== "" && Number.isFinite(Number(frontend.routeSort))
            ? Number(frontend.routeSort)
            : (typeof frontend.Sort === 'number' ? frontend.Sort : (frontend.Sort ? parseFloat(String(frontend.Sort)) : 0)),
        adhocSort: typeof frontend['AD-HOC Sort'] === 'number' ? frontend['AD-HOC Sort'] : (frontend['AD-HOC Sort'] ? parseFloat(String(frontend['AD-HOC Sort'])) : 0),
        adhocServiceId: adhocServiceIdResolvedForCreate,
        extra: extraToNumeric10_2(frontend.Extras) ?? 0,
        notes: frontend.Notes || undefined,
        vehicleId: vehicleId,
        vendorTypeId: vendorTypeId,
        status: status,
        isDayOff: isDayOff,
        isSort: isAdhocWeekPlannerCreate ? ADHOC_OPERATION_CREATE_DEFAULTS.isSort : false,
        operationId: frontend.operationId || undefined,
        depositId: depositId,
    } as WeekPlannerCreateDTO;
};

// Fun��o para mapear dados do frontend para WeekPlannerToOperationDTO
const mapFrontendToOperationDTO = (
    frontend: FrontendOperationRecord,
    weekPlannerItem: WeekPlannerRecord | undefined,
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[],
    costModels: CostModel[]
): WeekPlannerToOperationDTO => {
    // Resolver vendor: prioridade 1) userId (da API/week planner), 2) match por fullName
    const userIdFromFrontend = frontend.userId != null && Number.isFinite(Number(frontend.userId)) ? Number(frontend.userId) : undefined;
    const userIdFromRaw = weekPlannerItem?.raw && typeof weekPlannerItem.raw === 'object'
        ? (weekPlannerItem.raw as Record<string, unknown>).userId != null
            ? Number((weekPlannerItem.raw as Record<string, unknown>).userId)
            : (weekPlannerItem.raw as Record<string, unknown>).userId != null
                ? Number((weekPlannerItem.raw as Record<string, unknown>).userId)
                : undefined
        : undefined;
    const effectiveVendorId = userIdFromFrontend ?? userIdFromRaw;
    const vendor = effectiveVendorId != null
        ? vendors.find(d => d.userId === effectiveVendorId)
        : vendors.find(d => d.fullName === frontend.Name);
    const route = routes.find(r => r.routeName === frontend.Route);
    const vehicle = frontend.Vehicle && frontend.Vehicle !== 'NOVEHICLE'
        ? vehicles.find(v => v.registrationPlates === frontend.Vehicle)
        : undefined;
    // NOVEHICLE uses vehicleId 55 as placeholder
    const vehicleIdForOp = frontend.Vehicle === 'NOVEHICLE' ? 55 : vehicle?.vehicleId;

    const userIdForDto = effectiveVendorId != null && Number.isFinite(effectiveVendorId)
        ? effectiveVendorId
        : vendor?.userId;
    if (userIdForDto == null || !Number.isFinite(userIdForDto)) {
        throw new Error(`Vendor not found or invalid: ${frontend.Name}`);
    }

    // Buscar costModelId
    let costModelId: number | undefined;
    let costModelName: string | undefined;
    
    // Fun��o helper para buscar costModel
    const findCostModel = (paymentModeValue: string | number | undefined): { id?: number; name?: string } => {
        if (!paymentModeValue) return {};
        
        const paymentModeAsNumber = Number(paymentModeValue);
        if (!isNaN(paymentModeAsNumber) && paymentModeAsNumber > 0) {
            const costModel = costModels.find(cm => cm.costModelId === paymentModeAsNumber);
            if (costModel) {
                return {
                    id: costModel.costModelId,
                    name: costModel.name || costModel.description || undefined
                };
            }
        }
        
        // Tentar por nome formatado
        const getCleanName = (name: string | undefined): string => {
            if (!name) return '';
            const upperName = name.toUpperCase();
            const cleanName = upperName
                .replace(/_RATE/g, '')
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (cleanName.includes('DAF')) return 'DAF';
            if (cleanName.includes('DR') && !cleanName.includes('VSR') && !cleanName.includes('FSR')) return 'DR';
            if (cleanName.includes('VSR')) return 'VSR';
            if (cleanName.includes('FSR')) return 'FSR';
            return cleanName;
        };
        
        const searchValue = String(paymentModeValue).toUpperCase();
        const costModel = costModels.find(cm => {
            const cleanName = getCleanName(cm.name) || getCleanName(cm.description);
            return cleanName.toUpperCase() === searchValue;
        });
        
        if (costModel) {
            return {
                id: costModel.costModelId,
                name: costModel.name || costModel.description || undefined
            };
        }
        
        return {};
    };
    
    // Usar paymentModeId se dispon�vel, sen�o Payment Mode
    if (frontend.paymentModeId) {
        const costModelInfo = findCostModel(frontend.paymentModeId);
        costModelId = costModelInfo.id;
        costModelName = costModelInfo.name;
    } else if (frontend['Payment Mode']) {
        const costModelInfo = findCostModel(frontend['Payment Mode']);
        costModelId = costModelInfo.id;
        costModelName = costModelInfo.name;
    }
    
    // Se n�o encontrou, tentar do raw data do week planner
    if (!costModelId && weekPlannerItem?.raw) {
        const raw = weekPlannerItem.raw as Record<string, unknown>;
        if (raw.costModel && typeof raw.costModel === 'object') {
            const costModelObj = raw.costModel as Record<string, unknown>;
            costModelId = costModelObj.costModelId ? Number(costModelObj.costModelId) : undefined;
            costModelName = costModelObj.costModelName ? String(costModelObj.costModelName) : undefined;
        }
    }
    
    // Extrair routeCost, depositId, depositName, adhocServiceId do raw data se dispon�vel
    let routeCost: number | undefined;
    let depositId: number | undefined;
    let depositName: string | undefined;
    let adhocServiceId: number | undefined;
    if (weekPlannerItem?.raw) {
        const raw = weekPlannerItem.raw as Record<string, unknown>;
        if (raw.routeCost !== null && raw.routeCost !== undefined) {
            routeCost = typeof raw.routeCost === 'number' ? raw.routeCost : parseFloat(String(raw.routeCost)) || undefined;
        }
        if (raw.depositId != null && raw.depositId !== undefined) {
            depositId = Number(raw.depositId);
        }
        if (raw.depositName != null && raw.depositName !== undefined) {
            depositName = String(raw.depositName);
        }
        if (raw.adhocServiceId != null && raw.adhocServiceId !== undefined) {
            adhocServiceId = Number(raw.adhocServiceId);
        } else if (raw.adhocService && typeof raw.adhocService === 'object') {
            const adhocObj = raw.adhocService as Record<string, unknown>;
            if (adhocObj.adhocServiceId != null) {
                adhocServiceId = Number(adhocObj.adhocServiceId);
            }
        }
    }
    if (depositId == null && frontend.depositId != null && Number.isFinite(Number(frontend.depositId))) {
        depositId = Number(frontend.depositId);
    }
    if (depositName == null && frontend['Deposit Name']) {
        depositName = String(frontend['Deposit Name']);
    }
    if (adhocServiceId == null && frontend.adhocServiceId != null && Number.isFinite(Number(frontend.adhocServiceId))) {
        adhocServiceId = Number(frontend.adhocServiceId);
    }

    return {
        weekPlannerId: frontend.weekPlannerId || undefined,
        date: frontend.Date,
        route: {
            routeId: route?.routeId || undefined,
            routeName: route?.routeName || frontend.Route || undefined
        },
        userId: userIdForDto,
        costModel: {
            costModelId: costModelId,
            costModelName: costModelName
        },
        vehicle: {
            vehicleId: vehicleIdForOp,
            vehicleModel: vehicle?.model || undefined
        },
        rate: toOptionalRate(frontend.Rate),
        routeCost: routeCost,
        routeSort:
          frontend.routeSort != null && String(frontend.routeSort).trim() !== "" && Number.isFinite(Number(frontend.routeSort))
            ? Number(frontend.routeSort)
            : (typeof frontend.Sort === 'number' ? frontend.Sort : (frontend.Sort ? parseFloat(String(frontend.Sort)) : 0)),
        adhocSort: typeof frontend['AD-HOC Sort'] === 'number' ? frontend['AD-HOC Sort'] : (frontend['AD-HOC Sort'] ? parseFloat(String(frontend['AD-HOC Sort'])) : 0),
        extra: extraToNumeric10_2(frontend.Extras) ?? 0,
        notes: frontend.Notes || undefined,
        status: frontend.Status || undefined,
        isDayOff: frontend.Status === 'Off',
        depositId: depositId,
        depositName: depositName,
        adhocServiceId: adhocServiceId
    };
};



export default function OperationsManagement() {
    return <DailyOperationsManagementPage />;
    // Estado para dados do backend
    const [operationsData, setOperationsData] = useState<FrontendOperationRecord[]>([]);
    const [weekPlannersData, setWeekPlannersData] = useState<WeekPlannerRecord[]>([]); // Armazenar dados originais do week planner
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [costModels, setCostModels] = useState<CostModel[]>([]);
    const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
    const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);
    const [deposits, setDeposits] = useState<DepositDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Data selecionada (padr�o: hoje)
    const [selectedDate, setSelectedDate] = useState(() => {
        return format(new Date(), 'yyyy-MM-dd');
    });
    
    // Uma "p�gina" = um dia: carregamos todos os registros da data selecionada (sem pagina��o)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 9999
    });

    // Popular: week-planners com isFinished=true e operationId !== null (request e pagina��o separados)
    const [popularWeekPlannersRaw] = useState<WeekPlannerRecord[]>([]);
    const [popularLoading] = useState(false);
    const [popularError] = useState<string | null>(null);
    
    // Estados de Filtro/UI
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 350);
    const lastDebouncedSearchRef = useRef<string>(debouncedSearchTerm);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterVendorType, setFilterVendorType] = useState('all');
    const [filterServicePartnerId, setFilterServicePartnerId] = useState('');
    const { servicePartners } = useServicePartners();
    // Ordena��o por defeito: Route (coluna route)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'Route', direction: 'asc' });
    
    // Estados de Modais
    const [showModal, setShowModal] = useState(false);
    const [editingWeekPlannerId, setEditingWeekPlannerId] = useState<number | null>(null);
    const [editingWeekPlannerRaw, setEditingWeekPlannerRaw] = useState<Record<string, unknown> | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FrontendOperationRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewModalData, setReviewModalData] = useState<FrontendOperationRecord[]>([]);
    const [loadingReview, setLoadingReview] = useState(false);
    const [showPendingListModal, _setShowPendingListModal] = useState(false);
    const [showPendingReviewModal, _setShowPendingReviewModal] = useState(false);
    const [showRateDetailsModal, setShowRateDetailsModal] = useState(false);
    const [rateDetailsLoading, setRateDetailsLoading] = useState(false);
    const [rateDetailsError, setRateDetailsError] = useState<string | null>(null);
    const [rateDetailsData, setRateDetailsData] = useState<RateDetailsModalData | null>(null);

    // Enquanto a modal de Add/Edit estiver aberta, desativa o scroll do fundo (remove a scrollbar).
    // Precisamos de `!important` porque o NavbarWrapper injeta `body { overflow-y: auto !important; }`.
    useEffect(() => {
        const shouldLockScroll = showModal;
        const docEl = document.documentElement;
        const body = document.body;

        const prevPaddingRight = body.style.paddingRight;

        const styleId = "week-planner-operations-scroll-lock-style";
        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            styleEl.textContent = `
                html[data-scroll-locked="true"],
                body[data-scroll-locked="true"] {
                    overflow: hidden !important;
                    overscroll-behavior: none !important;
                }
            `;
            document.head.appendChild(styleEl);
        }

        if (shouldLockScroll) {
            const scrollbarWidth = window.innerWidth - docEl.clientWidth;
            docEl.setAttribute("data-scroll-locked", "true");
            body.setAttribute("data-scroll-locked", "true");
            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            docEl.removeAttribute("data-scroll-locked");
            body.removeAttribute("data-scroll-locked");
            body.style.paddingRight = prevPaddingRight;
        }

        return () => {
            docEl.removeAttribute("data-scroll-locked");
            body.removeAttribute("data-scroll-locked");
            body.style.paddingRight = prevPaddingRight;
        };
    }, [showModal]);

    // Day-off entries (para incluir vendors com day off na tabela principal e synthetic rows)
    const [dayOffEntries, setDayOffEntries] = useState<DayOffEntry[]>([]);
    // Vendors com status Off (tabela Day Off - via GET /week-planners)
    const [dayOffTableRows, setDayOffTableRows] = useState<{ name: string; reason: string; notes: string; userId?: number | null }[]>([]);

    // Hist�rico de Opera��es (Relat�rios Di�rios)
    const [operationsHistory, setOperationsHistory] = useState<OperationsHistoryEntry[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
    
    // --- Estado para anima��o de sucesso ---
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

    // Estados de Valida��o
    const [mainValidationErrors, setMainValidationErrors] = useState<string[]>([]);
    const [dailyGamePlanSubmitError, setDailyGamePlanSubmitError] = useState<string | null>(null);
    const [validatedReviewItemKeys, setValidatedReviewItemKeys] = useState<Set<string>>(new Set());
    const [autoValidatedEditedItemKeys, setAutoValidatedEditedItemKeys] = useState<Set<string>>(new Set());
    
    // Estado do Formul�rio (Add/Edit)
    const [formData, setFormData] = useState<FrontendOperationRecord>({
        Date: selectedDate, // Usar a data selecionada inicialmente
        Route: '',
        Name: '',
        'Payment Mode': '',
        Rate: '',
        Sort: '',
        'AD-HOC Sort': '',
        'AD-HOC Service': '',
        Extras: '',
        Notes: '',
        Vehicle: '',
        'Vendor type': '',
        Status: 'Working',
        'Deposit Name': ''
    });

    const loadCostModelEmployees = useCallback(async (userId: number): Promise<CostModelItem[]> => {
        return fetchCostModelEmployeesByUserId(userId);
    }, []);

    const pickDefaultCostModelEmployee = useCallback(
        (items: CostModelItem[], costModelId: number, dateYYYYMMDD: string) => {
            const candidates = items.filter((i) => i.costModelId === costModelId);
            if (candidates.length === 0) return undefined;

            const inRange = (i: CostModelItem) => {
                const raw = i as CostModelItem & { validity_startDate?: string; validity_endDate?: string };
                const startRaw = raw.validityStartDate ?? raw.validity_startDate;
                const endRaw = raw.validityEndDate ?? raw.validity_endDate;
                const start = startRaw ? String(startRaw).slice(0, 10) : undefined;
                const end = endRaw ? String(endRaw).slice(0, 10) : undefined;
                if (start && dateYYYYMMDD < start) return false;
                if (end && dateYYYYMMDD > end) return false;
                return true;
            };

            const applicable = candidates.filter(inRange);
            const pool = applicable.length > 0 ? applicable : candidates;

            // Prefer non-electric when not specified
            const nonElectric = pool.filter((p) => p.isElectric !== true);
            const pool2 = nonElectric.length > 0 ? nonElectric : pool;

            // Prefer flat rate (no bands) then smallest band (minStops)
            const flat = pool2.filter((p) => (p.minStops == null || Number.isNaN(p.minStops)) && (p.maxStops == null || Number.isNaN(p.maxStops)));
            if (flat.length > 0) return flat[0];

            return [...pool2].sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0))[0];
        },
        []
    );

    // Auto-fill Rate only for DR/FSR when Vendor + Payment Mode are set. Do NOT depend on formData.Rate
    // so that when the user clears or edits Rate, this effect does not re-run and overwrite their input.
    const formDataPaymentMode = formData["Payment Mode"];
    useEffect(() => {
        if (!showModal) return;

        const name = String(formData.Name || "").trim();
        const paymentModeValue = String(formDataPaymentMode || "").trim();

        if (!name || !paymentModeValue) return;

        const vendor = vendors.find((d) => d.fullName === name);
        const userId = vendor?.userId;
        const costModelId = Number(paymentModeValue);
        if (!userId || !Number.isFinite(costModelId) || costModelId <= 0) return;

        // DAF/VSR: clear Rate when switching to banded model (run only when Name/Payment Mode change)
        if (isBandedCostModelId(costModelId)) {
            setFormData((prev) => {
                const prevRate = String(prev.Rate ?? "").trim();
                if (prevRate === "") return prev;
                return { ...prev, Rate: "" };
            });
            return;
        }

        if (!isFixedRateCostModelId(costModelId)) return;

        let cancelled = false;
        (async () => {
            try {
                const items = await loadCostModelEmployees(userId);
                if (cancelled) return;

                const selected = pickDefaultCostModelEmployee(items, costModelId, selectedDate);
                const rate = selected?.fixedPrice ?? selected?.pricePerStop;
                if (rate === null || rate === undefined || !Number.isFinite(Number(rate))) return;

                setFormData((prev) => {
                    const prevRate = String(prev.Rate ?? "").trim();
                    if (prevRate !== "") return prev;
                    return { ...prev, Rate: String(rate) };
                });
            } catch (e) {
                console.warn("Could not auto-fill Rate from costModel_employee:", e);
            }
        })();

        return () => { cancelled = true; };
    }, [
        showModal,
        formData.Name,
        formDataPaymentMode,
        vendors,
        selectedDate,
        loadCostModelEmployees,
        pickDefaultCostModelEmployee,
    ]);
    
    // Carregar dados iniciais (vendors, routes, vehicles, cost models, vendor types, adhoc services, deposits)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [vendorsData, routesData, vehiclesData, costModelsData, vendorTypesData, adhocServicesData, depositsData] = await Promise.all([
                    fetchVendorsFromUsers(),
                    fetchRoutes(),
                    fetchVehicles(),
                    fetchCostModels(),
                    fetchVendorTypes(),
                    fetchAdhocServices().catch(err => {
                        console.warn('Error loading adhoc services:', err);
                        return [];
                    }),
                    fetchDepositsWithRoutes().catch(err => {
                        console.warn('Error loading deposits:', err);
                        return [];
                    })
                ]);
                
                setVendors(vendorsData);
                setRoutes(routesData);
                setVehicles(vehiclesData);
                setCostModels(costModelsData);
                setVendorTypes(vendorTypesData);
                setAdhocServices(adhocServicesData);
                setDeposits(depositsData);
            } catch (err) {
                console.error('Error loading initial data:', err);
                // Don't block the main week-planners fetch if reference data fails.
                // Surface the error in the UI so it's actionable.
                setError(err instanceof Error ? err.message : 'Error loading initial data (vendors/routes/vehicles/cost models/vendor types).');
            }
        };
        
        loadInitialData();
    }, []);
    
    // Carrega todos os week planners da data selecionada (sem pagina��o: um dia = uma "p�gina")
    const fetchData = useCallback(async () => {
        lastDebouncedSearchRef.current = debouncedSearchTerm;

        try {
            setLoading(true);
            setError(null);

            // Removido uso do endpoint paginated: alguns deployments/bDs
            // ainda n�o t�m todas as colunas esperadas e estamos eliminando o 500
            // no console fazendo apenas fallback por data.
            const spId = filterServicePartnerId !== '' ? Number(filterServicePartnerId) : undefined;
            const allForDate = await fetchAllWeekPlannersForDate(selectedDate, undefined, spId);
            const withoutOps = allForDate.filter((wp) => wp.operationId == null);
            const filtered = debouncedSearchTerm
                ? withoutOps.filter((wp) => {
                    const name = (wp.name || '').toLowerCase();
                    const route = (wp.route || '').toLowerCase();
                    const term = debouncedSearchTerm.toLowerCase();
                    return name.includes(term) || route.includes(term);
                })
                : withoutOps;

            setWeekPlannersData(filtered);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalItems: filtered.length,
                itemsPerPage: filtered.length || 9999
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, debouncedSearchTerm, filterServicePartnerId]);
    
    // Carregar dados quando o componente monta ou quando os filtros mudam
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Mapear Popular raw para formato frontend
    const popularMapped = useMemo(() => {
        return popularWeekPlannersRaw.map(wp => mapWeekPlannerToFrontend(wp, costModels, vehicles));
    }, [popularWeekPlannersRaw, costModels, vehicles]);

    // Carregar day-off entries (para synthetic rows na tabela principal)
    useEffect(() => {
        if (!selectedDate) {
            setDayOffEntries([]);
            return;
        }
        getDayOffEntries(selectedDate, selectedDate)
            .then(setDayOffEntries)
            .catch((err) => {
                console.warn('Error loading day-off entries:', err);
                setDayOffEntries([]);
            });
    }, [selectedDate]);

    // Carregar vendors com status Off via GET /week-planners (tabela Day Off)
    useEffect(() => {
        if (!selectedDate) {
            setDayOffTableRows([]);
            return;
        }
        fetchWeekPlannersStatusOff(selectedDate)
            .then((records) => {
                const byName = new Map<string, { name: string; reason: string; notes: string; userId?: number | null }>();
                for (const wp of records) {
                    const raw = wp.raw as Record<string, unknown> | undefined;
                    const reason = raw?.reason ? String(raw.reason) : "-";
                    const name = (wp.name || "Vendor").trim();
                    const userIdNum = wp.userId != null && Number.isFinite(Number(wp.userId)) ? Number(wp.userId) : null;
                    const existing = byName.get(name);
                    const notes = (wp.notes || "-").trim();
                    if (!existing) {
                        byName.set(name, { name, reason, notes, userId: userIdNum });
                    } else if (notes !== "-" && existing.notes === "-") {
                        byName.set(name, { ...existing, notes });
                    } else if (reason !== "-" && existing.reason === "-") {
                        byName.set(name, { ...existing, reason });
                    }
                }
                setDayOffTableRows(Array.from(byName.values()));
            })
            .catch((err) => {
                console.warn('Error loading week planners status off:', err);
                setDayOffTableRows([]);
            })
    }, [selectedDate]);

    // Mapear dados do WeekPlannerRecord para o formato do frontend
    // (recalcula quando costModels/vehicles chegarem)
    useEffect(() => {
        // Mostrar TODOS os registros retornados pelo endpoint /without-operations
        // (que j� filtra apenas registros sem operationId)
        const mappedData = weekPlannersData.map((wp) => mapWeekPlannerToFrontend(wp, costModels, vehicles));
        setOperationsData(mappedData);
    }, [weekPlannersData, costModels, vehicles]);

    // Atualizar data do formul�rio quando selectedDate mudar (apenas se n�o estiver editando)
    useEffect(() => {
        if (editingWeekPlannerId === null && !showModal) {
            setFormData(prev => ({
                ...prev,
                Date: selectedDate
            }));
        }
    }, [selectedDate, editingWeekPlannerId, showModal]);

    // Fun��es do Formul�rio
    const resetForm = () => {
        setFormData({
            Date: selectedDate, // Usar a data selecionada ao inv�s da data atual
            Route: '',
            Name: '',
            'Payment Mode': '',
            Rate: '',
            Sort: '',
            'AD-HOC Sort': '',
            'AD-HOC Service': '',
            Extras: '',
            Notes: '',
            Vehicle: '',
            'Vendor type': '',
            Status: 'Working',
            'Deposit Name': ''
        });
        setEditingWeekPlannerId(null);
        setEditingWeekPlannerRaw(null);
    };

    const handleInputChange = (field: string, value: string | number) => {
        if (field === "Payment Mode") {
            // Sempre limpar Rate ao trocar Payment Mode:
            // DR/FSR ser� auto-preenchido pelo efeito;
            // DAF/VSR permanecer� vazio e desabilitado no modal.
            setFormData(prev => ({ ...prev, [field]: String(value), Rate: "" }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value as string }));
    };

    const isBandedCostModel = useCallback((item: FrontendOperationRecord): boolean => {
        const costModelId = Number(item.paymentModeId ?? item["Payment Mode"]);
        return costModelId === 1 || costModelId === 4; // DAF or VSR
    }, []);

    const handleOpenRateDetails = useCallback(async (item: FrontendOperationRecord) => {
        setShowRateDetailsModal(true);
        setRateDetailsLoading(true);
        setRateDetailsError(null);
        setRateDetailsData(null);

        try {
            const userIdFromItem = item.userId != null ? Number(item.userId) : NaN;
            const rawWp = weekPlannersData.find((wp) => wp.weekPlannerId === item.weekPlannerId)?.raw as
                | Record<string, unknown>
                | undefined;
            let userIdFromRaw: number | undefined;
            if (rawWp != null) {
                const a = rawWp.userId != null ? Number(rawWp.userId) : NaN;
                const b = rawWp.userId != null ? Number(rawWp.userId) : NaN;
                const pick = Number.isFinite(a) && a > 0 ? a : Number.isFinite(b) && b > 0 ? b : undefined;
                userIdFromRaw = pick;
            }
            const userId = Number.isFinite(userIdFromItem) && userIdFromItem > 0
                ? userIdFromItem
                : userIdFromRaw != null
                  ? userIdFromRaw
                  : NaN;

            const data = await buildRateDetailsModalData(item, loadCostModelEmployees, {
                userIdOverride: Number.isFinite(userId) && userId > 0 ? userId : undefined,
            });
            setRateDetailsData(data);
        } catch (err) {
            setRateDetailsError(err instanceof Error ? err.message : "Failed to load rate details.");
        } finally {
            setRateDetailsLoading(false);
        }
    }, [loadCostModelEmployees, weekPlannersData]);

    // Fun��o para validar e filtrar apenas n�meros (incluindo decimais) nos campos num�ricos
    const handleNumericInputChange = (field: string, value: string) => {
        // Remove tudo que n�o for n�mero, ponto decimal ou sinal de menos no in�cio
        const numericValue = value.replace(/[^\d.-]/g, '');
        // Permite apenas um ponto decimal
        const parts = numericValue.split('.');
        const filteredValue = parts.length > 2 
            ? parts[0] + '.' + parts.slice(1).join('')
            : numericValue;
        handleInputChange(field, filteredValue);
    };

    // Fun��o para verificar duplicatas baseadas em Date, Name e Route
    const checkDuplicateRecord = (
        date: string,
        name: string,
        route: string,
        excludeWeekPlannerId?: number | null
    ): boolean => {
        // Normalizar valores do formul�rio para compara��o
        const formDate = normalizeDate(date);
        const formName = String(name || '').trim().toLowerCase();
        const formRoute = String(route || '').trim().toLowerCase();
        
        // Verificar nos dados j� carregados (operationsData)
        const duplicateInOperations = operationsData.find(item => {
            // Ignorar o pr�prio registro se estiver editando
            if (excludeWeekPlannerId && item.weekPlannerId === excludeWeekPlannerId) {
                return false;
            }
            
            // Normalizar valores para compara��o (case-insensitive e trim)
            const itemDate = normalizeDate(item.Date);
            const itemName = String(item.Name || '').trim().toLowerCase();
            const itemRoute = String(item.Route || '').trim().toLowerCase();
            
            return (
                itemDate === formDate &&
                itemName === formName &&
                itemRoute === formRoute
            );
        });
        
        if (duplicateInOperations) {
            return true;
        }
        
        // Tamb�m verificar nos dados originais do backend (weekPlannersData)
        // para capturar casos onde o item pode n�o estar nos dados filtrados
        const duplicateInWeekPlanners = weekPlannersData.find(wp => {
            // Ignorar o pr�prio registro se estiver editando
            if (excludeWeekPlannerId && wp.weekPlannerId === excludeWeekPlannerId) {
                return false;
            }
            
            // Ignorar registros que j� foram convertidos em opera��es
            if (wp.operationId) {
                return false;
            }
            
            // Normalizar valores para compara��o
            const wpDate = normalizeDate(wp.date);
            const wpName = String(wp.name || '').trim().toLowerCase();
            const wpRoute = String(wp.route || '').trim().toLowerCase();
            
            return (
                wpDate === formDate &&
                wpName === formName &&
                wpRoute === formRoute
            );
        });
        
        return !!duplicateInWeekPlanners;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const editedWeekPlannerId = editingWeekPlannerId;
            
            // Validar campos obrigat�rios
            if (!formData.Date || !formData.Name || !formData.Route) {
                alert('Please fill in all required fields: Date, Name, and Route.');
                return;
            }
            
            // Verificar duplicatas antes de criar ou atualizar
            if (editingWeekPlannerId) {
                // Ao editar, verificar se a nova combina��o j� existe (excluindo o registro atual)
                if (checkDuplicateRecord(formData.Date, formData.Name, formData.Route, editingWeekPlannerId)) {
                    alert(`A record already exists for Date: ${formData.Date}, Vendor: ${formData.Name}, and Route: ${formData.Route}. Please choose a different combination.`);
                    return;
                }
                
                // Atualizar week planner usando PATCH /week-planners/:weekPlannerId
                const updateData = mapFrontendToWeekPlannerUpdate(
                    formData, 
                    vendors, 
                    routes, 
                    vehicles,
                    costModels,
                    editingWeekPlannerRaw || undefined,
                    adhocServices,
                    vendorTypes,
                    deposits
                );
                await updateWeekPlanner(editingWeekPlannerId, updateData);
            } else {
                // Ao criar, verificar se j� existe um registro com essa combina��o
                if (checkDuplicateRecord(formData.Date, formData.Name, formData.Route)) {
                    alert(`A record already exists for Date: ${formData.Date}, Vendor: ${formData.Name}, and Route: ${formData.Route}. Please choose a different combination.`);
                    return;
                }
                
                // Criar novo week planner usando POST /week-planners
                let createData = mapFrontendToWeekPlannerCreate(formData, vendors, routes, vehicles, costModels, vendorTypes, adhocServices, deposits);
                // FSR (costModelId 3): usar fixedPrice do costModel do vendor como rate
                if (createData.costModelId === 3 && createData.userId && createData.date) {
                    try {
                        const items = await loadCostModelEmployees(createData.userId);
                        const dateStr = String(createData.date).slice(0, 10);
                        const selected = pickDefaultCostModelEmployee(items, 3, dateStr);
                        const fixedPrice = selected?.fixedPrice;
                        if (fixedPrice != null && Number.isFinite(Number(fixedPrice))) {
                            createData = { ...createData, rate: Number(fixedPrice) };
                        }
                    } catch (err) {
                        console.warn('Could not resolve FSR fixedPrice from vendor costModel for week-planner create:', err);
                    }
                }
                const createdWP = await createWeekPlanner(createData);
                // Auto-validate newly created item
                if (createdWP.weekPlannerId) {
                    const createdKey = `wp:${createdWP.weekPlannerId}`;
                    setAutoValidatedEditedItemKeys(prev => { const next = new Set(prev); next.add(createdKey); return next; });
                    setValidatedReviewItemKeys(prev => { const next = new Set(prev); next.add(createdKey); return next; });
                }
            }

            setShowModal(false);
            resetForm();
            setEditingWeekPlannerId(null);
            setEditingWeekPlannerRaw(null);
            // Recarregar dados (se falhar, registo j� foi criado - avisar utilizador)
            try {
                await fetchData();
            } catch (refreshErr) {
                console.warn('Create succeeded but refresh failed:', refreshErr);
                alert(
                    'Record created successfully. The list may not have refreshed � switch dates and back, or reload the page.',
                );
            }

            if (editedWeekPlannerId != null) {
                const editedKey = `wp:${editedWeekPlannerId}`;
                setAutoValidatedEditedItemKeys(prev => {
                    const next = new Set(prev);
                    next.add(editedKey);
                    return next;
                });
                setValidatedReviewItemKeys(prev => {
                    const next = new Set(prev);
                    next.add(editedKey);
                    return next;
                });
            }
        } catch (err) {
            console.error('Error saving operation:', err);
            alert(err instanceof Error ? err.message : 'Failed to save operation');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fun��es da Tabela
    const handleEdit = (item: FrontendOperationRecord) => {
        if (!item) return;

        // Criar c�pia do item para o formul�rio
        const formItem = { ...item };
        // Se tiver paymentModeId, usar esse ID no Payment Mode para o formul�rio
        if (item.paymentModeId) {
            formItem['Payment Mode'] = String(item.paymentModeId);
        }
        // Para o select AD-HOC Service usar o id (adhocServiceId) para que a op��o fique selecionada
        if (item.adhocServiceId != null && item.adhocServiceId !== '') {
            formItem['AD-HOC Service'] = String(item.adhocServiceId);
            formItem.adhocServiceId = item.adhocServiceId;
        }

        // Buscar raw data do item original dos week planners para garantir que o Name seja o fullName correto
        const weekPlannerItem = weekPlannersData.find(wp => wp.weekPlannerId === item.weekPlannerId);
        if (weekPlannerItem?.raw) {
            const raw = weekPlannerItem.raw as Record<string, unknown>;
            // Garantir que o Name seja o fullName do raw data para corresponder ao select
            const fullName = raw.fullName ? String(raw.fullName) : item.Name;
            formItem.Name = fullName;
            setEditingWeekPlannerRaw(raw);
        } else {
            setEditingWeekPlannerRaw(null);
        }
        
        setFormData(formItem);
        
        // Armazenar weekPlannerId para uso na atualiza��o
        setEditingWeekPlannerId(item.weekPlannerId || null);
        
        setShowModal(true);
    };

    const handleDelete = (item: FrontendOperationRecord) => {
        if (!item || !item.weekPlannerId) return;
        
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete || !itemToDelete.weekPlannerId) return;
        
        try {
            setIsDeleting(true);
            await deleteWeekPlanner(itemToDelete.weekPlannerId);
            // Recarregar dados
            await fetchData();
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error deleting week planner:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete week planner');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseDeleteModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    // Filtros (Dropdowns) - usar dados do backend

    // Mesclar operationsData com vendors que t�m day off mas n�o t�m registro na tabela
    const operationsDataWithDayOff = useMemo(() => {
        const existingVendorIds = new Set(
            operationsData
                .filter((item) => item.userId != null && item.userId > 0)
                .map((item) => item.userId!)
        );
        const dayOffOnDate = dayOffEntries.filter((e) => normalizeDate(e.date) === selectedDate);
        const dayOffVendorIdsToAdd = [
            ...new Set(
                dayOffOnDate
                    .map((e) => e.userId)
                    .filter((id) => !existingVendorIds.has(id))
            ),
        ];

        if (dayOffVendorIdsToAdd.length === 0) {
            return operationsData;
        }

        const syntheticRows: FrontendOperationRecord[] = [];

        for (const userId of dayOffVendorIdsToAdd) {
            const vendor = vendors.find((d) => d.userId === userId);
            if (!vendor) continue;

            const vendorTypeName =
                vendorTypes.find((dt) => dt.vendorTypeId === vendor.vendorTypeId)?.nameType ?? "";

            const entry = dayOffOnDate.find((e) => e.userId === userId);

            syntheticRows.push({
                weekPlannerId: undefined,
                operationId: undefined,
                userId: userId,
                Date: selectedDate,
                Route: "OFF",
                Name: vendor.fullName || "",
                "Payment Mode": "",
                Rate: "",
                Sort: "",
                "AD-HOC Sort": "",
                "AD-HOC Service": "",
                Extras: "",
                Notes: entry?.notes ?? "",
                Vehicle: "NOVEHICLE",
                "Vendor type": vendorTypeName,
                Status: "Off",
                "Deposit Name": "",
            });
        }

        return [...operationsData, ...syntheticRows];
    }, [operationsData, dayOffEntries, selectedDate, vendors, vendorTypes]);

    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(operationsDataWithDayOff.map(item => item.Status).filter(Boolean))];
        return statuses;
    }, [operationsDataWithDayOff]);

    const uniqueVendorTypes = useMemo(() => {
        const types = [...new Set(operationsDataWithDayOff.map(item => item['Vendor type']).filter(Boolean))];
        // Filtrar apenas BAOP (permitir todos os outros tipos)
        return types.filter(type => {
            const typeUpper = String(type).toUpperCase();
            return !typeUpper.includes('BAOP');
        });
    }, [operationsDataWithDayOff]);

    // Sort data: Off rows always at top (red gradient), then the rest with client-side sort.
    const sortedData = useMemo(() => {
        const offRows = operationsDataWithDayOff.filter((i) => i.Status === "Off" || String(i.Route || "").trim().toUpperCase() === "OFF");
        const restRows = operationsDataWithDayOff.filter((i) => i.Status !== "Off" && String(i.Route || "").trim().toUpperCase() !== "OFF");
        const sortableData = [...restRows];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                if (sortConfig.key === "Sort Value") {
                    const parseRouteSortVal = (r: FrontendOperationRecord) => {
                        const raw = r.routeSort;
                        if (raw == null || String(raw).trim() === "") return NaN;
                        const n = Number(raw);
                        return Number.isFinite(n) ? n : NaN;
                    };
                    const aNum = parseRouteSortVal(a);
                    const bNum = parseRouteSortVal(b);
                    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
                        if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
                        if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
                        return 0;
                    }
                    return 0;
                }

                const key = sortConfig.key as keyof FrontendOperationRecord;
                const aRaw = a[key];
                const bRaw = b[key];

                const numericKeys = new Set<string>(["Rate", "Sort", "Sort Value", "Extras"]);
                const isNumericKey = numericKeys.has(sortConfig.key);

                if (isNumericKey) {
                    const aNum = typeof aRaw === "number" ? aRaw : aRaw !== undefined && aRaw !== null ? parseFloat(String(aRaw)) : NaN;
                    const bNum = typeof bRaw === "number" ? bRaw : bRaw !== undefined && bRaw !== null ? parseFloat(String(bRaw)) : NaN;

                    const aFinite = Number.isFinite(aNum);
                    const bFinite = Number.isFinite(bNum);

                    if (aFinite && bFinite) {
                        if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
                        if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
                        return 0;
                    }
                }

                const aValue = aRaw === null || aRaw === undefined ? "" : String(aRaw);
                const bValue = bRaw === null || bRaw === undefined ? "" : String(bRaw);

                let cmp = 0;
                if (aValue < bValue) cmp = sortConfig.direction === 'asc' ? -1 : 1;
                else if (aValue > bValue) cmp = sortConfig.direction === 'asc' ? 1 : -1;

                // Desempate: quando ordenamos por Name, ordenar depois por Route (uma linha por rota/servi�o por utilizador)
                if (cmp === 0 && sortConfig.key === 'Name') {
                    const aRoute = String(a.Route ?? "").trim();
                    const bRoute = String(b.Route ?? "").trim();
                    if (aRoute < bRoute) return -1;
                    if (aRoute > bRoute) return 1;
                    const aDate = String(a.Date ?? "").trim();
                    const bDate = String(b.Date ?? "").trim();
                    return aDate.localeCompare(bDate);
                }
                return cmp;
            });
        }
        // Off rows at top (sorted by Name), then the rest
        const offSorted = [...offRows].sort((a, b) => String(a.Name ?? "").localeCompare(String(b.Name ?? ""), undefined, { sensitivity: "base" }));
        return [...offSorted, ...sortableData];
    }, [operationsDataWithDayOff, sortConfig]);

    // Filters (client-side, sobre a p�gina j� paginada do backend)
    const filteredData = useMemo(() => {
        const filtered = sortedData.filter(item => {
            // Filtrar BAOP - n�o mostrar registros com BAOP
            if (item['Vendor type']) {
                const vendorTypeUpper = item['Vendor type'].toUpperCase();
                if (vendorTypeUpper.includes('BAOP')) {
                    return false;
                }
                // Se h� um filtro espec�fico de vendor type selecionado, aplicar
                if (filterVendorType !== 'all' && item['Vendor type'] !== filterVendorType) {
                    return false;
                }
            }
            if (filterStatus !== 'all' && item.Status !== filterStatus) return false;
            return true;
        });

        return filtered;
    }, [sortedData, filterStatus, filterVendorType]);

    // Usar dados j� paginados do backend
    const paginatedData = filteredData;

    // Agrupar dados por dep�sito para visualiza��o separada (Week planner operations por deposit)
    const dataByDeposit = useMemo(() => {
        const groups = new Map<string, FrontendOperationRecord[]>();
        const offKey = "__off";
        const otherKey = "__other";

        for (const item of paginatedData) {
            const isOff = item.Status === "Off" || String(item.Route || "").trim().toUpperCase() === "OFF";
            if (isOff) {
                const list = groups.get(offKey) ?? [];
                list.push(item);
                groups.set(offKey, list);
                continue;
            }
            const depositName = String(item["Deposit Name"] ?? "").trim();
            const key = depositName || otherKey;
            const list = groups.get(key) ?? [];
            list.push(item);
            groups.set(key, list);
        }

        // Ordem: Off primeiro, depois dep�sitos pela ordem de `deposits` (depositId), depois outros nomes, depois "Outros"
        const result: { depositKey: string; depositLabel: string; rows: FrontendOperationRecord[] }[] = [];
        const offRows = groups.get(offKey);
        if (offRows && offRows.length > 0) {
            result.push({ depositKey: offKey, depositLabel: "Off", rows: offRows });
        }
        const addedKeys = new Set<string>([offKey, otherKey]);
        for (const d of deposits) {
            const name = (d.depositName || "").trim();
            if (!name) continue;
            const rows = groups.get(name);
            if (rows && rows.length > 0) {
                result.push({ depositKey: `deposit-${d.depositId ?? name}`, depositLabel: name, rows });
                addedKeys.add(name);
            }
        }
        // Incluir quaisquer outros nomes de dep�sito que existam nos dados mas n�o na lista deposits
        groups.forEach((rows, key) => {
            if (addedKeys.has(key) || rows.length === 0) return;
            result.push({ depositKey: `deposit-${key}`, depositLabel: key, rows });
        });
        const otherRows = groups.get(otherKey);
        if (otherRows && otherRows.length > 0) {
            result.push({ depositKey: otherKey, depositLabel: "Outros", rows: otherRows });
        }
        return result;
    }, [paginatedData, deposits]);

    // Submitted agrupado por depot (mesma l�gica para o box verde)
    const popularByDeposit = useMemo(() => {
        const groups = new Map<string, FrontendOperationRecord[]>();
        const offKey = "__off";
        const otherKey = "__other";
        for (const item of popularMapped) {
            const isOff = item.Status === "Off" || String(item.Route || "").trim().toUpperCase() === "OFF";
            if (isOff) {
                const list = groups.get(offKey) ?? [];
                list.push(item);
                groups.set(offKey, list);
            } else {
                const name = String(item["Deposit Name"] ?? "").trim() || otherKey;
                const list = groups.get(name) ?? [];
                list.push(item);
                groups.set(name, list);
            }
        }
        const result: { depositKey: string; depositLabel: string; rows: FrontendOperationRecord[] }[] = [];
        const offRows = groups.get(offKey);
        if (offRows?.length) result.push({ depositKey: offKey, depositLabel: "Off", rows: offRows });
        const added = new Set<string>([offKey, otherKey]);
        for (const d of deposits) {
            const name = (d.depositName || "").trim();
            if (!name) continue;
            const rows = groups.get(name);
            if (rows?.length) {
                result.push({ depositKey: `dep-${d.depositId}`, depositLabel: name, rows });
                added.add(name);
            }
        }
        groups.forEach((rows, key) => {
            if (added.has(key) || !rows.length) return;
            result.push({ depositKey: `dep-${key}`, depositLabel: key, rows });
        });
        const otherRows = groups.get(otherKey);
        if (otherRows?.length) result.push({ depositKey: otherKey, depositLabel: "Outros", rows: otherRows });
        return result;
    }, [popularMapped, deposits]);

    // Estado derivado: j� foi submetido (tudo j� tem operationId) vs ainda h� algo para submeter
    const hasAnyRecords = operationsData.length > 0;
    const hasPendingToSubmit = operationsData.some(item => !item.operationId);
    const isCurrentDayFullySubmitted = hasAnyRecords && !hasPendingToSubmit;

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const handleDateChange = useCallback((date: string) => {
        setSelectedDate(date);
        setValidatedReviewItemKeys(new Set());
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);
    
    const exportHeaders = TABLE_HEADERS.map(h => (h === 'Extras' ? 'Extras - Qtd Hour' : h));
    const DAY_OFF_EXPORT_HEADERS = ['Name', 'Reason', 'Notes'];

    // Helper: obt�m TODOS os dados para export (igual à p�gina: Day Off + Operations completos)
    const getAllDataForExport = useCallback(async () => {
        const res = await fetchWeekPlannersPaginated(1, 99999, selectedDate, debouncedSearchTerm || undefined);
        const allMapped = res.data.map(wp => mapWeekPlannerToFrontend(wp, costModels, vehicles));
        const existingVendorIds = new Set(
            allMapped.filter((item) => item.userId != null && item.userId > 0).map((item) => item.userId!)
        );
        const dayOffOnDate = dayOffEntries.filter((e) => normalizeDate(e.date) === selectedDate);
        const dayOffVendorIdsToAdd = [...new Set(dayOffOnDate.map((e) => e.userId).filter((id) => !existingVendorIds.has(id)))];
        const syntheticRows: FrontendOperationRecord[] = [];
        for (const userId of dayOffVendorIdsToAdd) {
            const vendor = vendors.find((d) => d.userId === userId);
            if (!vendor) continue;
            const vendorTypeName = vendorTypes.find((dt) => dt.vendorTypeId === vendor.vendorTypeId)?.nameType ?? "";
            const entry = dayOffOnDate.find((e) => e.userId === userId);
            syntheticRows.push({
                weekPlannerId: undefined,
                operationId: undefined,
                userId: userId,
                Date: selectedDate,
                Route: "OFF",
                Name: vendor.fullName || "",
                "Payment Mode": "",
                Rate: "",
                Sort: "",
                "AD-HOC Sort": "",
                "AD-HOC Service": "",
                Extras: "",
                Notes: entry?.notes ?? "",
                Vehicle: "NOVEHICLE",
                "Vendor type": vendorTypeName,
                Status: "Off",
                "Deposit Name": "",
            });
        }
        let opsData = [...allMapped, ...syntheticRows];
        if (sortConfig.key) {
            const direction = sortConfig.direction === 'asc' ? 1 : -1;
            const numericKeys = new Set<string>(["Rate", "Sort", "Sort Value", "Extras"]);
            opsData = [...opsData].sort((a, b) => {
                if (sortConfig.key === "Sort Value") {
                    const parseRouteSortVal = (r: FrontendOperationRecord) => {
                        const raw = r.routeSort;
                        if (raw == null || String(raw).trim() === "") return NaN;
                        const n = Number(raw);
                        return Number.isFinite(n) ? n : NaN;
                    };
                    const aNum = parseRouteSortVal(a);
                    const bNum = parseRouteSortVal(b);
                    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return (aNum - bNum) * direction;
                    return 0;
                }
                const key = sortConfig.key as keyof FrontendOperationRecord;
                const aRaw = a[key];
                const bRaw = b[key];
                if (numericKeys.has(sortConfig.key)) {
                    const aNum = typeof aRaw === "number" ? aRaw : parseFloat(String(aRaw)) || NaN;
                    const bNum = typeof bRaw === "number" ? bRaw : parseFloat(String(bRaw)) || NaN;
                    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return (aNum - bNum) * direction;
                }
                const aVal = aRaw == null ? "" : String(aRaw);
                const bVal = bRaw == null ? "" : String(bRaw);
                return aVal.localeCompare(bVal) * direction;
            });
        }
        const filtered = opsData.filter((item) => {
            if (item['Vendor type']?.toUpperCase().includes('BAOP')) return false;
            if (filterVendorType !== 'all' && item['Vendor type'] !== filterVendorType) return false;
            if (filterStatus !== 'all' && item.Status !== filterStatus) return false;
            return true;
        });
        const sortedDayOff = [...dayOffTableRows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        return { dayOffRows: sortedDayOff, operationsData: filtered };
    }, [selectedDate, debouncedSearchTerm, costModels, vehicles, dayOffEntries, vendors, vendorTypes, dayOffTableRows, sortConfig, filterStatus, filterVendorType]);

    const buildOperationsExportRows = useCallback((operationsData: FrontendOperationRecord[]) => {
        const renderCellValue = (value: unknown): string => {
            if (value === null || value === undefined) return '-';
            const str = String(value);
            return str.trim() === '' ? '-' : str;
        };
        return operationsData.map((item) =>
            exportHeaders.map((header) => {
                const origHeader = header === 'Extras - Qtd Hour' ? 'Extras' : header;
                if (origHeader === 'Vehicle') {
                    const plate = String(item.Vehicle ?? '').trim();
                    return !plate || plate.toUpperCase() === 'NOVEHICLE' ? '-' : plate;
                }
                if (origHeader === 'Notes') {
                    return item.Notes && String(item.Notes).trim() !== '' ? String(item.Notes) : '-';
                }
                if (origHeader === 'Extras' && Number(item.paymentModeId) === 7) {
                    return formatDecimalHoursAsTime(item.Extras);
                }
                return renderCellValue(item[origHeader as keyof FrontendOperationRecord]);
            })
        );
    }, [exportHeaders]);

    const handleExportCSV = async () => {
        try {
            setLoading(true);
            const { dayOffRows, operationsData } = await getAllDataForExport();
            const operationsExportRows = buildOperationsExportRows(operationsData);
            const escapeCsv = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

            const csvLines: string[] = [];
            csvLines.push(`Day Off � ${selectedDate || format(new Date(), 'yyyy-MM-dd')}`);
            csvLines.push(DAY_OFF_EXPORT_HEADERS.map(escapeCsv).join(','));
            for (const row of dayOffRows) {
                csvLines.push([row.name, row.reason, row.notes].map(escapeCsv).join(','));
            }
            csvLines.push('');
            csvLines.push('Operations');
            csvLines.push(exportHeaders.map(escapeCsv).join(','));
            for (const row of operationsExportRows) {
                csvLines.push(row.map(escapeCsv).join(','));
            }

            const csvContent = csvLines.join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `week-planner-operations-${selectedDate || format(new Date(), 'yyyy-MM-dd')}.csv`;
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(link);
            }, 100);
        } catch (err) {
            console.error('Error exporting:', err);
            alert(err instanceof Error ? err.message : 'Failed to export week planners. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setLoading(true);
            const { dayOffRows, operationsData } = await getAllDataForExport();
            const operationsExportRows = buildOperationsExportRows(operationsData);
            const JsPDF = await loadJsPDF();
            const pdf = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const darkBlue = [30, 58, 138];
            const white = [255, 255, 255];
            const borderGray = [200, 200, 200];
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height;
            const margin = 12;
            const rowHeight = 7;

            let currentY = margin;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
            pdf.text('Daily Operations Management', margin, currentY);
            currentY += 6;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Date: ${selectedDate || format(new Date(), 'yyyy-MM-dd')}  |  Day Off: ${dayOffRows.length}  |  Operations: ${operationsData.length}`, margin, currentY);
            currentY += 12;

            const availableWidth = pageWidth - 2 * margin;

            // Day Off section
            if (dayOffRows.length > 0) {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
                pdf.text(`Day Off � ${selectedDate || format(new Date(), 'yyyy-MM-dd')} (${dayOffRows.length})`, margin, currentY);
                currentY += 8;
                const dayOffCols = 3;
                const dayOffColWidth = availableWidth / dayOffCols;
                pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
                pdf.rect(margin, currentY, availableWidth, rowHeight, 'F');
                pdf.setTextColor(white[0], white[1], white[2]);
                pdf.setFontSize(8);
                DAY_OFF_EXPORT_HEADERS.forEach((h, i) => {
                    pdf.text(h, margin + i * dayOffColWidth + 2, currentY + 5);
                });
                currentY += rowHeight;
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7);
                pdf.setTextColor(50, 50, 50);
                for (const row of dayOffRows) {
                    if (currentY + rowHeight > pageHeight - 15) {
                        pdf.addPage('landscape');
                        currentY = margin;
                    }
                    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
                    [row.name, row.reason, row.notes].forEach((txt, i) => {
                        const display = String(txt ?? '-').length > 30 ? String(txt).slice(0, 28) + '..' : String(txt ?? '-');
                        pdf.text(display, margin + i * dayOffColWidth + 2, currentY + 5);
                        if (i < 2) pdf.line(margin + (i + 1) * dayOffColWidth, currentY, margin + (i + 1) * dayOffColWidth, currentY + rowHeight);
                    });
                    pdf.rect(margin, currentY, availableWidth, rowHeight);
                    currentY += rowHeight;
                }
                currentY += 10;
            }

            // Operations section
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
            pdf.text('Operations', margin, currentY);
            currentY += 8;
            const numCols = exportHeaders.length;
            const colWidth = availableWidth / numCols;

            const renderOpsHeader = (y: number) => {
                pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
                pdf.rect(margin, y, availableWidth, rowHeight, 'F');
                pdf.setTextColor(white[0], white[1], white[2]);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                let x = margin;
                exportHeaders.forEach((h) => {
                    const label = h.length > 12 ? h.slice(0, 10) + '..' : h;
                    pdf.text(label, x + 2, y + 5);
                    x += colWidth;
                });
            };

            renderOpsHeader(currentY);
            currentY += rowHeight;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);

            for (const row of operationsExportRows) {
                if (currentY + rowHeight > pageHeight - 15) {
                    pdf.addPage('landscape');
                    currentY = margin;
                    renderOpsHeader(currentY);
                    currentY += rowHeight;
                }
                pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
                let x = margin;
                row.forEach((cell, i) => {
                    const txt = String(cell ?? '-');
                    const display = txt.length > 18 ? txt.slice(0, 16) + '..' : txt;
                    pdf.setTextColor(50, 50, 50);
                    pdf.text(display, x + 2, currentY + 5);
                    if (i < row.length - 1) pdf.line(x + colWidth, currentY, x + colWidth, currentY + rowHeight);
                    x += colWidth;
                });
                pdf.rect(margin, currentY, availableWidth, rowHeight);
                currentY += rowHeight;
            }

            const blob = pdf.output('blob');
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `week-planner-operations-${selectedDate || format(new Date(), 'yyyy-MM-dd')}.pdf`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert(err instanceof Error ? err.message : 'Failed to export PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // L�gica de Valida��o (reutiliz�vel)
    const runValidations = (_dataToValidate: FrontendOperationRecord[]) => {
        const errors: string[] = [];
        return errors;
    };

    // --- Fun��es de Submiss�o ---
    const validateDailyGamePlanStatusForSubmit = useCallback(async (date: string): Promise<string | null> => {
        const targetDate = normalizeDate(date);
        const plans = await fetchDailyGamePlansByDate(targetDate);
        const plansByDeposit = new Map<number, string>();
        const formatDeposit = (depositId: number) => DAILY_GAME_PLAN_DEPOSIT_LABELS[depositId] || `Deposit ${depositId}`;

        for (const plan of plans) {
            if (!plan.depositId) continue;
            if (normalizeDate(String(plan.date || '')) !== targetDate) continue;
            plansByDeposit.set(plan.depositId, String(plan.status || '').toLowerCase());
        }

        const missingDeposits = REQUIRED_DAILY_GAME_PLAN_DEPOSITS.filter(
            (depositId) => !plansByDeposit.has(depositId)
        );
        const invalidStatusDeposits = REQUIRED_DAILY_GAME_PLAN_DEPOSITS.filter((depositId) => {
            const status = plansByDeposit.get(depositId);
            return status !== 'finished';
        });

        if (missingDeposits.length === 0 && invalidStatusDeposits.length === 0) {
            return null;
        }

        const hasNotFinished = invalidStatusDeposits.length > 0;
        const hasMissing = missingDeposits.length > 0;
        const missingText = missingDeposits.map(formatDeposit).join(', ');
        const notFinishedText = invalidStatusDeposits.map(formatDeposit).join(', ');

        if (hasNotFinished && hasMissing) {
            return `Approval cannot be completed for ${targetDate}. Missing: ${missingText}. Not finished: ${notFinishedText}.`;
        }
        if (hasNotFinished) {
            return `Approval cannot be completed for ${targetDate}. Not finished: ${notFinishedText}.`;
        }
        return `Approval cannot be completed for ${targetDate}. Missing: ${missingText}.`;
    }, []);

    // Para o dia principal: ao abrir o Review traz TODOS os itens da data (incluindo OFF / day-off)
    const handleOpenMainReviewModal = useCallback(async () => {
        setDailyGamePlanSubmitError(null);
        setShowReviewModal(true);
        setReviewModalData([]);
        setLoadingReview(true);
        try {
            const [res, offRecords] = await Promise.all([
                fetchWeekPlannersPaginated(1, 99999, selectedDate),
                fetchWeekPlannersStatusOff(selectedDate),
            ]);
            const paginatedMapped = res.data.map(wp => mapWeekPlannerToFrontend(wp, costModels, vehicles));
            const paginatedIds = new Set(paginatedMapped.map(m => m.weekPlannerId).filter(Boolean));
            const offMapped = offRecords
                .map(wp => mapWeekPlannerToFrontend(wp, costModels, vehicles))
                .filter(m => !m.operationId && !paginatedIds.has(m.weekPlannerId));
            const allMapped: FrontendOperationRecord[] = [...paginatedMapped, ...offMapped];

            // Incluir vendors com day off (dayOffEntries) que ainda n�o est�o na lista
            const existingVendorIds = new Set(
                allMapped
                    .filter((item) => item.userId != null && item.userId > 0)
                    .map((item) => item.userId!)
            );
            const dayOffOnDate = dayOffEntries.filter((e) => normalizeDate(e.date) === selectedDate);
            const dayOffVendorIdsToAdd = [
                ...new Set(
                    dayOffOnDate
                        .map((e) => e.userId)
                        .filter((id) => !existingVendorIds.has(id))
                ),
            ];
            for (const userId of dayOffVendorIdsToAdd) {
                const vendor = vendors.find((d) => d.userId === userId);
                if (!vendor) continue;
                const vendorTypeName =
                    vendorTypes.find((dt) => dt.vendorTypeId === vendor.vendorTypeId)?.nameType ?? "";
                const entry = dayOffOnDate.find((e) => e.userId === userId);
                allMapped.push({
                    weekPlannerId: undefined,
                    operationId: undefined,
                    userId: userId,
                    Date: selectedDate,
                    Route: "OFF",
                    Name: vendor.fullName || "",
                    "Payment Mode": "",
                    Rate: "",
                    Sort: "",
                    "AD-HOC Sort": "",
                    "AD-HOC Service": "",
                    Extras: "",
                    Notes: entry?.notes ?? "",
                    Vehicle: "NOVEHICLE",
                    "Vendor type": vendorTypeName,
                    Status: "Off",
                    "Deposit Name": "",
                });
            }

            // Ordenar por Route (Off no topo, depois o resto por Route)
            const offRows = allMapped.filter(item => item.Status === "Off" || String(item.Route ?? "").trim().toUpperCase() === "OFF");
            const restRows = allMapped.filter(item => item.Status !== "Off" && String(item.Route ?? "").trim().toUpperCase() !== "OFF");
            const offSorted = [...offRows].sort((a, b) => String(a.Route ?? "").localeCompare(String(b.Route ?? ""), undefined, { sensitivity: "base" }));
            const restSorted = [...restRows].sort((a, b) => String(a.Route ?? "").localeCompare(String(b.Route ?? ""), undefined, { sensitivity: "base" }));
            const sortedForReview = [...offSorted, ...restSorted];
            setReviewModalData(sortedForReview);
            setMainValidationErrors(runValidations(allMapped));
            const pendingKeys = new Set(
                allMapped
                    .filter((item) => !item.operationId)
                    .map(getReviewValidationKey)
            );
            // Unir valida��es: manter as que o usu�rio j� marcou (em mem�ria) + as auto-validadas por edi��o
            setValidatedReviewItemKeys((prev) => {
                const next = new Set<string>();
                for (const key of prev) {
                    if (pendingKeys.has(key)) next.add(key);
                }
                for (const key of autoValidatedEditedItemKeys) {
                    if (pendingKeys.has(key)) next.add(key);
                }
                return next;
            });
            const submitBlockError = await validateDailyGamePlanStatusForSubmit(selectedDate);
            setDailyGamePlanSubmitError(submitBlockError);
        } catch (err) {
            console.error('Error loading all items for review:', err);
            setError(err instanceof Error ? err.message : 'Failed to load all records for review.');
        } finally {
            setLoadingReview(false);
        }
    }, [selectedDate, costModels, vehicles, dayOffEntries, vendors, vendorTypes, validateDailyGamePlanStatusForSubmit, autoValidatedEditedItemKeys]);

    const handleToggleReviewItemValidated = useCallback((item: FrontendOperationRecord, checked: boolean) => {
        const key = getReviewValidationKey(item);
        setValidatedReviewItemKeys(prev => {
            const next = new Set(prev);
            if (checked) next.add(key);
            else next.delete(key);
            return next;
        });
    }, []);


    const handleMainSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            setDailyGamePlanSubmitError(null);

            // Apenas valida o DGP para a data atual � datas antigas s�o permitidas sem esta restri��o
            const todayStr = new Date().toISOString().split('T')[0];
            const isPastDate = normalizeDate(selectedDate) < todayStr;
            if (!isPastDate) {
                const submitBlockError = await validateDailyGamePlanStatusForSubmit(selectedDate);
                if (submitBlockError) {
                    setDailyGamePlanSubmitError(submitBlockError);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Converter todos os registros do frontend para WeekPlannerToOperationDTO
            // Incluir TODOS os registros (tanto os que j� existem quanto os novos)
            const operationsToCreate: WeekPlannerToOperationDTO[] = [];
            const errors: string[] = [];
            
            // Submeter apenas registros que ainda n�o t�m operationId (usa a lista completa do modal de review)
            const dataToSubmit = reviewModalData.length > 0 ? reviewModalData : operationsData;
            const pendingItems = dataToSubmit.filter(item => !item.operationId);
            const validatedPendingItems = pendingItems.filter(item => validatedReviewItemKeys.has(getReviewValidationKey(item)));

            if (validatedPendingItems.length === 0) {
                alert('No validated record selected. Please tick at least one item in the review list.');
                setIsSubmitting(false);
                return;
            }

            for (const item of validatedPendingItems) {
                try {
                    // Buscar o week planner original para obter dados do raw se necess�rio
                    const weekPlannerItem = weekPlannersData.find(wp => wp.weekPlannerId === item.weekPlannerId);
                    
                    const operationData = mapFrontendToOperationDTO(
                        item,
                        weekPlannerItem,
                        vendors,
                        routes,
                        vehicles,
                        costModels
                    );
                    
                    operationsToCreate.push(operationData);
                } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    errors.push(`Error converting record for ${item.Name}: ${errorMsg}`);
                    console.error(`Error converting item to WeekPlannerToOperationDTO:`, err);
                    // Continuar com os outros itens mesmo se um falhar
                }
            }
            
            if (errors.length > 0) {
                alert(`Some records had errors:\n${errors.join('\n')}\n\nOnly valid records will be submitted.`);
            }
            
            if (operationsToCreate.length === 0) {
                alert('No pending records to submit (all items already submitted) or no valid records found.');
                setIsSubmitting(false);
                return;
            }
            
            // Fazer a chamada ao endpoint de cria��o de opera��es
            await createOperationsFromWeekPlanners(operationsToCreate);
            
            // Salvar no hist�rico local para visualiza��o (usar os mesmos dados do modal de review)
            const dateKey = selectedDate;
            const dataForHistory = reviewModalData.length > 0 ? reviewModalData : operationsData;
            setOperationsHistory(prev => {
                const others = prev.filter(entry => entry.date !== dateKey);
                const updated = [{ date: dateKey, data: dataForHistory }, ...others];
                updated.sort((a, b) => b.date.localeCompare(a.date));
                return updated;
            });

            setShowReviewModal(false);
            
            // Recarregar dados do backend para refletir as mudan�as
            await fetchData();
            
            // Prepare new confetti pieces and show celebration
            const generatePieces = (count: number) => {
                const colors = ['#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
                return Array.from({ length: count }).map(() => ({
                    left: Math.random() * 100,
                    delay: Math.random() * 0.25,
                    duration: 0.9 + Math.random() * 0.9,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 0.8 + Math.random() * 0.2,
                }));
            };
            setConfettiPieces(generatePieces(60));
            setShowSuccessAnimation(true);

            setTimeout(() => {
                setShowSuccessAnimation(false);
                setIsSubmitting(false);
            }, 1500);
        } catch (err) {
            console.error('Error submitting:', err);
            setDailyGamePlanSubmitError(err instanceof Error ? err.message : 'Unable to validate Daily Game Plan status for submit.');
            alert(err instanceof Error ? err.message : 'Failed to create operations from week planners. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Sort routes by depositId, then by routeName
    const sortedRoutes = useMemo(() => {
        return [...routes].sort((a, b) => {
            const depositIdA = a.depositId ?? 0;
            const depositIdB = b.depositId ?? 0;
            
            // First sort by depositId
            if (depositIdA !== depositIdB) {
                return depositIdA - depositIdB;
            }
            
            // If same deposit, sort by routeName
            const nameA = a.routeName || '';
            const nameB = b.routeName || '';
            return nameA.localeCompare(nameB);
        });
    }, [routes]);

    return (
      <NavbarWrapper>
        <CloseSidebarOnModalOpen
          open={
            showModal ||
            showReviewModal ||
            showDeleteModal ||
            showHistoryModal ||
            showPendingListModal ||
            showPendingReviewModal
          }
        />
        <div className="w-full min-w-0">
          <DgpPageFrame
                width="ultra"
                containerClassName="mx-auto w-full px-0"
                className="font-['Inter',sans-serif] text-slate-800 text-[0.9rem] [&_*]:font-['Inter',sans-serif]"
            >
                <motion.div
                    className="relative w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                >
                    <div className="w-full px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {/* Header */}
                    <FadeIn delay={0.1}>
                        <OperationsHeaderControls
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            onExportCSV={handleExportCSV}
                            onExportPDF={handleExportPDF}
                            onAddNew={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            operationsData={operationsData}
                        />
                    </FadeIn>

                    <OperationsFiltersBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        filterVendorType={filterVendorType}
                        onFilterVendorTypeChange={setFilterVendorType}
                        statusOptions={uniqueStatuses as string[]}
                        vendorTypeOptions={uniqueVendorTypes as string[]}
                        filterServicePartnerId={filterServicePartnerId}
                        onFilterServicePartnerIdChange={setFilterServicePartnerId}
                        servicePartners={servicePartners}
                    />

                    {/* Visualiza��o separada por dep�sito */}
                    {error && (
                        <div className={weekPlannerOperationsStyles.tableErrorContainer}>
                            <p className={weekPlannerOperationsStyles.tableErrorTitle}>Error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {loading && (
                        <div className={weekPlannerOperationsStyles.tableLoadingContainer}>
                            <div className={weekPlannerOperationsStyles.tableLoadingSpinner}></div>
                            <p className={weekPlannerOperationsStyles.tableLoadingText}>Loading operations...</p>
                        </div>
                    )}
                    {!loading && !error && paginatedData.length === 0 && (
                        <div className={weekPlannerOperationsStyles.tableEmptyContainer}>
                            {weekPlannersData.length === 0 ? (
                                <>
                                    <p className={weekPlannerOperationsStyles.tableEmptyTitle}>No data</p>
                                    <p className={weekPlannerOperationsStyles.tableEmptyText}>No record was returned for the selected date ({selectedDate}).</p>
                                </>
                            ) : (
                                <>
                                    <p className={weekPlannerOperationsStyles.tableEmptyTitle}>No records to show</p>
                                    <p className={weekPlannerOperationsStyles.tableEmptyText}>
                                        The server returned {weekPlannersData.length} record(s) for this page/date, but none match the current filters or search.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                    {!loading && !error && dataByDeposit.length > 0 && (
                        <div className="space-y-6">
                            {dataByDeposit.map(({ depositKey, depositLabel, rows }) => (
                                <section key={depositKey} aria-labelledby={`deposit-${depositKey}`} className={weekPlannerOperationsStyles.depotBlock}>
                                    <h2 id={`deposit-${depositKey}`} className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                                        {depositLabel}
                                        <span className="ml-2 text-sm font-normal text-slate-500">({rows.length} {rows.length === 1 ? "record" : "records"})</span>
                                    </h2>
                                    <OperationsTable
                                        headers={TABLE_HEADERS}
                                        loading={false}
                                        error={null}
                                        showEmptyState={false}
                                        selectedDate={selectedDate}
                                        weekPlannersCount={rows.length}
                                        data={rows}
                                        sortConfig={sortConfig}
                                        onSort={handleSort}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        pagination={{
                                            currentPage: pagination.currentPage,
                                            totalPages: pagination.totalPages,
                                            totalItems: pagination.totalItems,
                                        }}
                                        showPagination={false}
                                        onOpenRateDetails={handleOpenRateDetails}
                                        shouldShowRateDetailsIcon={isBandedCostModel}
                                        validatedKeys={validatedReviewItemKeys}
                                        getItemKey={getReviewValidationKey}
                                        onToggleValidated={handleToggleReviewItemValidated}
                                    />
                                </section>
                            ))}
                        </div>
                    )}

                    {/* Submitted: box verde mais transparente, blocos por depot */}
                    <div className={weekPlannerOperationsStyles.submittedSectionBox} aria-labelledby="popular-heading">
                        <h2 id="popular-heading" className="text-lg font-semibold text-emerald-800 mb-3 pb-2 border-b border-emerald-200/70">
                            Submitted
                        </h2>
                        {popularLoading && (
                            <div className={weekPlannerOperationsStyles.tableLoadingContainer}>
                                <div className={weekPlannerOperationsStyles.tableLoadingSpinner}></div>
                                <p className={weekPlannerOperationsStyles.tableLoadingText}>Loading...</p>
                            </div>
                        )}
                        {popularError && (
                            <div className={weekPlannerOperationsStyles.tableErrorContainer}>
                                <p>{popularError}</p>
                            </div>
                        )}
                        {!popularLoading && !popularError && popularMapped.length === 0 && (
                            <p className="text-sm text-slate-500 py-4">No submitted records for this date.</p>
                        )}
                        {!popularLoading && !popularError && popularByDeposit.length > 0 && (
                            <div className="space-y-6">
                                {popularByDeposit.map(({ depositKey, depositLabel, rows }) => (
                                    <div key={depositKey} className="rounded-lg border border-emerald-100 bg-white/60 p-3">
                                        <h3 className="text-sm font-semibold text-emerald-800 mb-2">{depositLabel} ({rows.length})</h3>
                                        <OperationsTable
                                            headers={TABLE_HEADERS}
                                            loading={false}
                                            error={null}
                                            showEmptyState={false}
                                            selectedDate={selectedDate}
                                            weekPlannersCount={rows.length}
                                            data={rows}
                                            sortConfig={sortConfig}
                                            onSort={handleSort}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                            pagination={{ currentPage: 1, totalPages: 1, totalItems: rows.length }}
                                            showPagination={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Bot�o de Revis�o (Principal) */}
                    <div className={weekPlannerOperationsStyles.reviewButtonContainer}>
                        {isCurrentDayFullySubmitted ? (
                            <button
                                type="button"
                                disabled
                                className={weekPlannerOperationsStyles.reviewButtonSubmitted}
                                title="Already submitted"
                            >
                                <svg className={weekPlannerOperationsStyles.reviewButtonSubmittedIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submitted
                            </button>
                        ) : (
                            <button
                                onClick={handleOpenMainReviewModal}
                                disabled={!hasAnyRecords || isSubmitting}
                                className={weekPlannerOperationsStyles.reviewButtonActive}
                            >
                                <svg className={weekPlannerOperationsStyles.reviewButtonActiveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Review and Submit (Current Day)
                            </button>
                        )}
                    </div>
                    
                </div>

                {/* --- Modal Add/Edit (Com Select Boxes) --- */}
                <OperationsFormModal
                    open={showModal}
                    editing={editingWeekPlannerId !== null}
                    formData={formData}
                    vendors={vendors}
                    sortedRoutes={sortedRoutes}
                    vehicles={vehicles}
                    costModels={costModels}
                    vendorTypes={vendorTypes}
                    adhocServices={adhocServices}
                    deposits={deposits}
                    isSubmitting={isSubmitting}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                    onNumericChange={handleNumericInputChange}
                />

                <RateBandsModal
                    open={showRateDetailsModal}
                    onOpenChange={setShowRateDetailsModal}
                    loading={rateDetailsLoading}
                    error={rateDetailsError}
                    data={rateDetailsData}
                />


                {/* Modal de Revis�o (Principal) - data cont�m TODOS os itens da data, carregados ao abrir */}
                <OperationsReviewModal
                    open={showReviewModal}
                    errors={(dailyGamePlanSubmitError ? [...mainValidationErrors, dailyGamePlanSubmitError] : mainValidationErrors).filter(
                        (e): e is string => Boolean(e)
                    )}
                    data={reviewModalData}
                    validatedKeys={validatedReviewItemKeys}
                    loading={loadingReview}
                    isSubmitting={isSubmitting}
                    onClose={() => {
                        setShowReviewModal(false);
                        setReviewModalData([]);
                    }}
                    onSubmit={handleMainSubmit}
                />
                
                {/* Modal Lista de Pendentes (desabilitado) */}
                {false && showPendingListModal && (<div />)}

                {/* Modal de Revis�o (PENDENTE) desabilitado */}
                {false && showPendingReviewModal && (<div />)}

                {/* Modal de Hist�rico de Opera��es (Relat�rios Di�rios) */}
                <OperationsHistoryModal
                    open={showHistoryModal}
                    operationsHistory={operationsHistory}
                    selectedHistoryIndex={selectedHistoryIndex}
                    onSelectHistoryIndex={setSelectedHistoryIndex}
                    onClose={() => setShowHistoryModal(false)}
                    onLoadFromDatabase={(date) => {
                        handleDateChange(date);
                        setShowHistoryModal(false);
                    }}
                />

                {/* --- Modal de Confirma��o de Delete --- */}
                <DeleteConfirmModal
                    show={showDeleteModal}
                    item={itemToDelete}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />

                {/* --- Modal de Anima��o de Sucesso --- */}
                <SuccessCelebration show={showSuccessAnimation} confettiPieces={confettiPieces} />
                    </motion.div>
                </DgpPageFrame>
            </div>
        </NavbarWrapper>
    );
}






