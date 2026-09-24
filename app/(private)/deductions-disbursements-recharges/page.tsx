'use client';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import NavbarWrapper from '@/components/navbar-wrapper';
import { DgpPageFrame } from '@/app/(private)/components';
import { useSidebar } from '@/components/ui/sidebar';
import DeductionModal from './components/DeductionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { ErrorInfoModal } from '@/components/ui/error-info-modal';
import DesktopView from './components/DesktopView';
import MobileView from './components/MobileView';
import { PerformanceModal } from '../vendor-performance/components/PerformanceModal';
import { useVendorMonthData } from '../vendor-performance/hooks/useVendorMonthData';
import type { ProcessedVendor } from '../vendor-performance/utils';
import {
  KPI_CARDS,
  VENDOR_FIELD_BY_CATEGORY,
  DATE_OF_INCIDENT_FIELD_BY_CATEGORY,
  AMOUNT_FIELD_BY_CATEGORY
} from './constants';
import { useDeductionsState } from './hooks/useDeductionsState';
import { useModalState } from './hooks/useModalState';
import { useFilters } from './hooks/useFilters';
import { useDeductionOperations } from './hooks/useDeductionOperations';
import { formatCurrency } from './formState';
import {
  generateReferenceNumber,
  getStringValue,
  getTodayString
} from './utils';
import { getNextBusinessDayString } from '@/lib/business-days';
import { formatDateToString } from '@/lib/deduction-installments';
import { useBankHolidays } from '@/hooks/useBankHolidays';
import { useServicePartners } from '@/hooks/useServicePartners';

import type { DisplayDeduction } from './types';
import type { ExportFormat } from '@/components/export-button';
import { exportDeductionsToPDF } from './utils/pdfExport';
import { loadXlsx } from '@/lib/lazy-imports';
import {
  createFixDamageDeduction,
  createTrafficPenaltyDeduction,
  createPrePaymentDeduction,
  createLiquidationDamageDeduction,
  createOtherDeduction,
  updateFixDamageDeduction,
  updateTrafficPenaltyDeduction,
  updatePrePaymentDeduction,
  updateLiquidationDamageDeduction,
  updateOtherDeduction,
  type FixDamageDeduction,
  type TrafficPenaltyDeduction,
  type PrePaymentDeduction,
  type LiquidationDamageDeduction,
  type OtherDeduction,
  type FixDamageDeductionCreateDTO,
  type PrePaymentDeductionCreateDTO,
  type PrePaymentDeductionUpdateDTO,
  type OtherDeductionCreateDTO,
} from '@/lib/deductions-api';
import {
  validateFixDamageDeduction,
  validateOtherDeduction,
  validatePrePaymentDeduction,
  validateLiquidationDamageDeduction,
  validateTrafficPenaltyDeduction,
  formatValidationErrors
} from '@/lib/deduction-validators';


// Componente helper para fechar a sidebar quando modais são abertos
function CloseSidebarOnModalOpen({ open }: { open: boolean }) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!open) return;
    // Fecha a sidebar quando um modal é aberto (previne conflitos de overlay/z-index)
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [open, isMobile, setOpen, setOpenMobile]);

  return null;
}

const DeductionsDashboardContent = () => {
  const { isMobile } = useSidebar();
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();
  const servicePartnerIdNum = selectedServicePartnerId !== '' ? Number(selectedServicePartnerId) : undefined;
  // Use custom hooks for state management
  const {
    deductionsData,
    vendors,
    vehicles,
    routes,
    loading: dataLoading,
    error: dataError,
    currentMonth,
    setCurrentMonth,
    uniqueCouriers,
    reloadDeductions,
  } = useDeductionsState(servicePartnerIdNum);

  // Mapa userId -> nome do Service Partner, construído a partir dos vendors já
  // carregados (inclui inativos, pois deduções podem ser de vendors que saíram)
  // e da lista de service partners. Usado para o badge SP nas linhas/cards.
  const servicePartnerNameByUserId = useMemo(() => {
    const spNameById = new Map<number, string>();
    servicePartners.forEach((sp) => spNameById.set(Number(sp.servicePartnerId), sp.partnerName));
    const map = new Map<number, string>();
    vendors.forEach((v) => {
      const rawSp = (v as { servicePartnerId?: number | string | null }).servicePartnerId;
      if (rawSp == null) return;
      const spId = typeof rawSp === 'string' ? parseInt(rawSp, 10) : Number(rawSp);
      if (!Number.isFinite(spId) || spId <= 0) return;
      const name = spNameById.get(spId);
      if (name && v.userId != null) map.set(Number(v.userId), name);
    });
    return map;
  }, [vendors, servicePartners]);

  const modalState = useModalState();
  const {
    searchQuery,
    setSearchQuery,
    activeKpiFilter,
    handleKpiFilterChange,
    filteredData,
    tableTotalAmount,
    kpiTotals,
  } = useFilters(deductionsData, currentMonth);

  const {
    validateStep,
    populateFormForEdit,
    handleDelete,
    fetchDeductionById,
  } = useDeductionOperations({
    vendors,
    vehicles,
    routes,
    deductionsData,
  });

  // Additional state
  const [itemToDelete, setItemToDelete] = useState<DisplayDeduction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [descriptionFieldError, setDescriptionFieldError] = useState<string | null>(null);
  const [detailFieldError, setDetailFieldError] = useState<string | null>(null);

  // Performance Modal states
  const today = useMemo(() => new Date(), []);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<ProcessedVendor | null>(null);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const { monthData, averages: modalAverages, loading: modalLoading, loadMonthData } = useVendorMonthData();

  const reviewBaseInfo = useMemo(() => {
    const dateField = DATE_OF_INCIDENT_FIELD_BY_CATEGORY[modalState.selectedCategory] || '';
    const vendorField = VENDOR_FIELD_BY_CATEGORY[modalState.selectedCategory] || '';

    return {
      incidentDate: (dateField && modalState.formData[dateField]) || 'N/A',
      vendor: (vendorField && modalState.formData[vendorField]) || 'N/A',
      type: modalState.formData.type || 'N/A'
    };
  }, [modalState.formData, modalState.selectedCategory]);

  const handleKpiAddClick = useCallback((card: typeof KPI_CARDS[0], event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (card.filterType !== 'All') {
      modalState.setModalEntryType(card.filterType);
      modalState.handleOpenModal(card.filterType);
    }
  }, [modalState]);

  // Fetch bank holidays from backend (Task 3.7)
  const currentYear = new Date().getFullYear();
  const { data: bankHolidays } = useBankHolidays(currentYear);

  /**
   * Helper to get next business day using fetched bank holidays
   */
  const getAdjustedBusinessDay = useCallback((dateStr: string) => {
    if (!bankHolidays) return getNextBusinessDayString(dateStr);

    // Append T00:00:00 to force local time parsing and avoid UTC offset shifting the date
    const currentDate = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr);
    if (isNaN(currentDate.getTime())) return dateStr;

    currentDate.setHours(0, 0, 0, 0);

    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = (date: Date) => {
      const formatted = formatDateToString(date);
      return bankHolidays.includes(formatted);
    };

    while (isWeekend(currentDate) || isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return formatDateToString(currentDate);
  }, [bankHolidays]);

  const handleOpenModalForNewEntry = useCallback((type: string) => {
    setDescriptionFieldError(null);
    setDetailFieldError(null);
    modalState.setModalEntryType(type);
    modalState.handleOpenModal(type);
  }, [modalState]);

  const extractFieldError = (errors: { field: string; message: string }[], field: string): string | null => {
    const matches = errors.filter((e) => e.field === field);
    return matches.length ? matches.map((e) => e.message).join('\n') : null;
  };

  const handleSaveEntryWithData = useCallback(async (formDataToUse: typeof modalState.formData) => {
    if (!validateStep(3, formDataToUse, modalState.selectedCategory)) {
      modalState.setValidationAttempted(true);
      return;
    }
    if (!modalState.selectedCategory) {
      return;
    }

    const amountField = AMOUNT_FIELD_BY_CATEGORY[modalState.selectedCategory];
    const vendorField = VENDOR_FIELD_BY_CATEGORY[modalState.selectedCategory];

    // For Pre-Payments, use totalAmount; for Repairs & Damages, use totalRepairCost; for others, use the amount field
    let amount: number;
    if (modalState.selectedCategory === 'Pre-Payments') {
      amount = Number.parseFloat(getStringValue(formDataToUse.pre_totalAmount) || '0');
    } else if (modalState.selectedCategory === 'Repairs & Damages') {
      amount = Number.parseFloat(getStringValue(formDataToUse.rep_totalRepairCost) || '0');
    } else {
      amount = Number.parseFloat(getStringValue(formDataToUse[amountField]) || '0');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      modalState.setValidationAttempted(true);
      return;
    }

    // Find userId from courier name (vendor fullName)
    const courierName = getStringValue(formDataToUse[vendorField]);
    const vendor = vendors.find((d) => d.fullName === courierName);
    if (!vendor) {
      alert('Please select a valid vendor');
      return;
    }

    // Get reference number field for the category
    const refNumberField =
      modalState.selectedCategory === 'Repairs & Damages' ? 'rep_refNumber' :
        modalState.selectedCategory === 'Traffic Penalties' ? 'pen_refNumber' :
          modalState.selectedCategory === 'Pre-Payments' ? 'pre_refNumber' :
            modalState.selectedCategory === 'Liquidation Damages' ? 'liq_refNumber' :
              'oth_refNumber';

    // Service Partner field from the modal (per-deduction). Takes priority over vendor's SP and the page filter.
    const spFieldByCategory: Record<string, string> = {
      'Repairs & Damages': 'rep_servicePartnerId',
      'Traffic Penalties': 'pen_servicePartnerId',
      'Pre-Payments': 'pre_servicePartnerId',
      'Liquidation Damages': 'liq_servicePartnerId',
      'Other': 'oth_servicePartnerId',
    };
    const formSpRaw = getStringValue(formDataToUse[spFieldByCategory[modalState.selectedCategory]]);
    const formSpId = formSpRaw && !Number.isNaN(Number(formSpRaw)) ? Number(formSpRaw) : undefined;
    const vendorSpId = vendor.servicePartnerId ? Number(vendor.servicePartnerId) : undefined;
    const resolvedServicePartnerId = formSpId ?? vendorSpId;

    // Generate reference number if not editing and reference number is empty
    const isEditing = modalState.editingItem !== null;
    let referenceNumber = getStringValue(formDataToUse[refNumberField]);
    if (!isEditing && (!referenceNumber || referenceNumber.trim() === '')) {
      referenceNumber = generateReferenceNumber(modalState.selectedCategory, courierName, deductionsData);
    }

    try {
      setLoading(true);
      let savedDeduction: FixDamageDeduction | TrafficPenaltyDeduction | PrePaymentDeduction | LiquidationDamageDeduction | OtherDeduction | undefined;

      if (modalState.selectedCategory === 'Repairs & Damages') {
        const vehicleReg = getStringValue(formDataToUse.rep_vehicleReg);
        const vehicle = vehicles.find((v) => v.registrationPlates === vehicleReg);
        if (!vehicle || !vehicle.vehicleId) {
          alert('Please select a valid vehicle');
          setLoading(false);
          return;
        }

        const totalRepairCost = Number.parseFloat(getStringValue(formDataToUse.rep_totalRepairCost) || '0');
        // paymentDate: data em que a dedução será cobrada; entry_date espelha e as
        // installments começam a partir dela (backend também garante o mirror).
        const repPaymentDate = getStringValue(formDataToUse.rep_paymentDate) || getTodayString();
        const payload: FixDamageDeductionCreateDTO = {
          referenceNumber: referenceNumber || getStringValue(formDataToUse.rep_refNumber) || '',
          incidentDate: getStringValue(formDataToUse.rep_incidentDate) || getTodayString(),
          totalRepairCost: totalRepairCost,
          amountChargedVendor: totalRepairCost,
          paymentDate: repPaymentDate,
          entryDate: repPaymentDate,
          scheduleTerms: getStringValue(formDataToUse.rep_scheduleTerms),
          userId: vendor.userId,
          vehicleId: vehicle.vehicleId,
          repairCost: totalRepairCost,
          servicePartnerId: resolvedServicePartnerId,
          // Inclui a description também na criação (antes só entrava ao editar).
          description: getStringValue(formDataToUse.rep_description || formDataToUse.briefDescription),
        };

        if (isEditing) {
          payload.repairCost = Number.parseFloat(getStringValue(formDataToUse.rep_repairCost) || '0');
          const amountCharged = Number.parseFloat(getStringValue(formDataToUse.rep_amount) || '0');
          if (amountCharged > 0) {
            payload.amountChargedVendor = amountCharged;
          }
        }

        const validation = validateFixDamageDeduction(payload);
        if (!validation.isValid) {
          const descError = extractFieldError(validation.errors, 'description');
          setDescriptionFieldError(descError);
          if (descError) modalState.setCurrentStep(2);
          const rest = validation.errors.filter((e) => e.field !== 'description');
          if (rest.length > 0) {
            setSaveErrorMessage(formatValidationErrors(rest));
          }
          setLoading(false);
          return;
        }
        setDescriptionFieldError(null);

        if (isEditing) {
          payload.description = getStringValue(formDataToUse.rep_description || formDataToUse.briefDescription);
        }

        if (isEditing && modalState.editingItem) {
          savedDeduction = await updateFixDamageDeduction(modalState.editingItem.backendId, payload);
        } else {
          savedDeduction = await createFixDamageDeduction(payload);
        }
      } else if (modalState.selectedCategory === 'Traffic Penalties') {
        const vehicleReg = getStringValue(formDataToUse.pen_vehicleReg);
        const vehicle = vehicles.find((v) => v.registrationPlates === vehicleReg);
        if (!vehicle || !vehicle.vehicleId) {
          alert('Please select a valid vehicle');
          setLoading(false);
          return;
        }

        // paymentDate: informado pelo usuário; entry_date espelha o paymentDate.
        const penPaymentDate = getStringValue(formDataToUse.pen_paymentDate) || getTodayString();
        const adjustedPaymentDate = getAdjustedBusinessDay(penPaymentDate);

        const payload = {
          referenceNumber: referenceNumber || getStringValue(formDataToUse.pen_refNumber) || '',
          vehicleId: vehicle.vehicleId,
          pcnRef: getStringValue(formDataToUse.pen_pcnRef) || '',
          amount: amount,
          pcnDate: getStringValue(formDataToUse.pen_penaltyDate) || getTodayString(),
          issuingAuthority: getStringValue(formDataToUse.pen_issuingAuth),
          appealStatus: getStringValue(formDataToUse.pen_appealStatus),
          paidBy: getStringValue(formDataToUse.pen_paidBy),
          paymentDate: adjustedPaymentDate,
          entryDate: adjustedPaymentDate, // entry_date espelha paymentDate
          council: getStringValue(formDataToUse.pen_council),
          userId: vendor.userId,
          servicePartnerId: resolvedServicePartnerId,
          description: getStringValue(formDataToUse.pen_notes),
        };

        const penaltyValidation = validateTrafficPenaltyDeduction(payload);
        if (!penaltyValidation.isValid) {
          const descError = extractFieldError(penaltyValidation.errors, 'description');
          setDescriptionFieldError(descError);
          if (descError) modalState.setCurrentStep(2);
          const rest = penaltyValidation.errors.filter((e) => e.field !== 'description');
          if (rest.length > 0) {
            setSaveErrorMessage(formatValidationErrors(rest));
          }
          setLoading(false);
          return;
        }
        setDescriptionFieldError(null);

        if (isEditing && modalState.editingItem) {
          savedDeduction = await updateTrafficPenaltyDeduction(modalState.editingItem.backendId, payload);
        } else {
          savedDeduction = await createTrafficPenaltyDeduction(payload);
        }
      } else if (modalState.selectedCategory === 'Pre-Payments') {
        const totalAmount = Number.parseFloat(getStringValue(formDataToUse.pre_totalAmount) || '0');
        const feeValue = Number.parseFloat(getStringValue(formDataToUse.pre_fee) || '0');
        const paymentDateValue = getStringValue(formDataToUse.pre_paymentDate) || getTodayString();
        const adjustedPaymentDate = getAdjustedBusinessDay(paymentDateValue);
        const initialPaymentDateRaw = getStringValue(formDataToUse.pre_initialPaymentDate);
        const initialPaymentDateValue = initialPaymentDateRaw
          ? (initialPaymentDateRaw.length === 7 ? `${initialPaymentDateRaw}-01` : initialPaymentDateRaw)
          : undefined;

        const payload: PrePaymentDeductionCreateDTO = {
          referenceNumber: referenceNumber || getStringValue(formDataToUse.pre_refNumber) || '',
          amount: totalAmount,
          totalAmount: totalAmount,
          feeValue: feeValue > 0 ? feeValue : undefined,
          scheduleTerms: getStringValue(formDataToUse.pre_scheduleTerms),
          entryDate: adjustedPaymentDate,
          userId: vendor.userId,
          paymentDate: adjustedPaymentDate,
          initialPaymentDate: initialPaymentDateValue,
          servicePartnerId: resolvedServicePartnerId,
          description: getStringValue(formDataToUse.pre_description || formDataToUse.briefDescription),
        };

        if (isEditing) {
          const separateAmount = Number.parseFloat(getStringValue(formDataToUse.pre_amount) || '0');
          if (separateAmount > 0) {
            payload.amount = separateAmount;
          }
          if (getStringValue(formDataToUse.pre_paymentDate)) {
            payload.paymentDate = getAdjustedBusinessDay(getStringValue(formDataToUse.pre_paymentDate));
          }
          if (feeValue > 0) {
            payload.feeValue = feeValue;
          }
          if (initialPaymentDateValue) {
            payload.initialPaymentDate = initialPaymentDateValue;
          }
        }

        const validation = validatePrePaymentDeduction(payload);
        if (!validation.isValid) {
          const descError = extractFieldError(validation.errors, 'description');
          setDescriptionFieldError(descError);
          if (descError) modalState.setCurrentStep(2);
          const rest = validation.errors.filter((e) => e.field !== 'description');
          if (rest.length > 0) {
            setSaveErrorMessage(formatValidationErrors(rest));
          }
          setLoading(false);
          return;
        }
        setDescriptionFieldError(null);

        if (isEditing && modalState.editingItem) {
          const updatePayload: PrePaymentDeductionUpdateDTO = { ...payload };
          savedDeduction = await updatePrePaymentDeduction(modalState.editingItem.backendId, updatePayload);
        } else {
          savedDeduction = await createPrePaymentDeduction(payload);
        }
      } else if (modalState.selectedCategory === 'Liquidation Damages') {
        const routeId = getStringValue(formDataToUse.liq_routeId) ? Number.parseInt(getStringValue(formDataToUse.liq_routeId)) : 0;
        if (!routeId) {
          alert('Please select a valid route');
          setLoading(false);
          return;
        }

        const liquidationDate = getStringValue(formDataToUse.liq_lqDate) || getTodayString();
        const description = getStringValue(formDataToUse.liq_description || formDataToUse.briefDescription);
        const liqValidation = validateLiquidationDamageDeduction({ description });
        if (!liqValidation.isValid) {
          setDescriptionFieldError(extractFieldError(liqValidation.errors, 'description'));
          modalState.setCurrentStep(2);
          setLoading(false);
          return;
        }
        setDescriptionFieldError(null);

        const paymentDateValue = getStringValue(formDataToUse.liq_paymentDate) || liquidationDate;
        const adjustedPaymentDate = getAdjustedBusinessDay(paymentDateValue);

        const payload = {
          referenceNumber: referenceNumber || getStringValue(formDataToUse.liq_refNumber) || '',
          routeId: routeId,
          userId: vendor.userId,
          code: getStringValue(formDataToUse.liq_lqCode),
          description: description,
          amount: amount,
          awbBooking: getStringValue(formDataToUse.liq_awbNumber),
          liquidationDate: liquidationDate,
          paymentDate: adjustedPaymentDate,
          entryDate: adjustedPaymentDate, // entry_date espelha paymentDate
          failureCode: (() => {
            const raw = getStringValue(formDataToUse.liq_failureCode || formDataToUse.liqFailureCode).trim();
            return raw ? raw : undefined;
          })(),
          paidBy: getStringValue(formDataToUse.liq_paidBy),
          servicePartnerId: resolvedServicePartnerId,
        };

        if (isEditing && modalState.editingItem) {
          savedDeduction = await updateLiquidationDamageDeduction(modalState.editingItem.backendId, payload);
        } else {
          savedDeduction = await createLiquidationDamageDeduction(payload);
        }
      } else if (modalState.selectedCategory === 'Other') {
        // paymentDate: informado pelo usuário; entry_date espelha e as installments começam aqui.
        const othPaymentDate = getStringValue(formDataToUse.oth_paymentDate) || getTodayString();
        const payload: OtherDeductionCreateDTO = {
          referenceNumber: referenceNumber || getStringValue(formDataToUse.oth_refNumber) || '',
          incidentDate: getStringValue(formDataToUse.oth_incidentDate) || getTodayString(),
          totalAmount: amount,
          scheduleTerms: getStringValue(formDataToUse.oth_scheduleTerms),
          paymentDate: othPaymentDate,
          entryDate: othPaymentDate,
          userId: vendor.userId,
          servicePartnerId: resolvedServicePartnerId,
          description: getStringValue(formDataToUse.oth_description || formDataToUse.briefDescription),
          detail: getStringValue(formDataToUse.oth_details),
        };

        const validation = validateOtherDeduction(payload);
        if (!validation.isValid) {
          const descError = extractFieldError(validation.errors, 'description');
          const detError = extractFieldError(validation.errors, 'detail');
          setDescriptionFieldError(descError);
          setDetailFieldError(detError);
          if (descError || detError) modalState.setCurrentStep(2);
          const rest = validation.errors.filter((e) => e.field !== 'description' && e.field !== 'detail');
          if (rest.length > 0) {
            setSaveErrorMessage(formatValidationErrors(rest));
          }
          setLoading(false);
          return;
        }
        setDescriptionFieldError(null);
        setDetailFieldError(null);

        if (isEditing && modalState.editingItem) {
          savedDeduction = await updateOtherDeduction(modalState.editingItem.backendId, payload);
        } else {
          savedDeduction = await createOtherDeduction(payload);
        }
      }

      if (savedDeduction) {
        await reloadDeductions();
        modalState.setEditingItem(null);
        modalState.handleCloseModal();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save deduction';
      console.error('Error saving deduction:', err);
      setSaveErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [modalState, validateStep, vendors, vehicles, deductionsData, reloadDeductions, setLoading, getAdjustedBusinessDay]);

  const handleSaveDeduction = useCallback(async (newDeductionData: Record<string, unknown>) => {
    try {
      // Convert and merge data
      const convertedData: typeof modalState.formData = {};
      Object.keys(newDeductionData).forEach(key => {
        const value = newDeductionData[key];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === undefined) {
          convertedData[key] = value;
        } else {
          convertedData[key] = String(value);
        }
      });

      // Update form data
      modalState.setFormData((prev) => ({ ...prev, ...convertedData }));

      // Call handleSaveEntry directly with the merged data
      await handleSaveEntryWithData({ ...modalState.formData, ...convertedData });
    } catch (err) {
      console.error('Error in handleSaveDeduction:', err);
      throw err;
    }
  }, [modalState, handleSaveEntryWithData]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = event.target;
    if (['rep_description', 'pen_notes', 'pre_description', 'liq_description', 'oth_description'].includes(name)) {
      setDescriptionFieldError(null);
    }
    if (name === 'oth_details') {
      setDetailFieldError(null);
    }
    let nextValue: string | boolean;
    if (type === 'checkbox') {
      nextValue = (event.target as HTMLInputElement).checked;
    } else {
      nextValue = event.target.value;
    }

    modalState.setFormData((prev) => {
      const updated = { ...prev, [name]: nextValue };

      if (!modalState.editingItem && modalState.selectedCategory) {
        const vendorField = VENDOR_FIELD_BY_CATEGORY[modalState.selectedCategory];
        const refNumberField =
          modalState.selectedCategory === 'Repairs & Damages' ? 'rep_refNumber' :
            modalState.selectedCategory === 'Traffic Penalties' ? 'pen_refNumber' :
              modalState.selectedCategory === 'Pre-Payments' ? 'pre_refNumber' :
                modalState.selectedCategory === 'Liquidation Damages' ? 'liq_refNumber' :
                  'oth_refNumber';

        if (name === vendorField && typeof nextValue === 'string' && nextValue.trim()) {
          const vendorName = nextValue.trim();
          if (vendorName) {
            const generatedRef = generateReferenceNumber(modalState.selectedCategory, vendorName, deductionsData);
            updated[refNumberField] = generatedRef;

            // Auto-fill Service Partner from the selected vendor (if vendor has one)
            const spFieldByCategory: Record<string, string> = {
              'Repairs & Damages': 'rep_servicePartnerId',
              'Traffic Penalties': 'pen_servicePartnerId',
              'Pre-Payments': 'pre_servicePartnerId',
              'Liquidation Damages': 'liq_servicePartnerId',
              'Other': 'oth_servicePartnerId',
            };
            const spField = spFieldByCategory[modalState.selectedCategory];
            const matchedVendor = vendors.find((v) => v.fullName === vendorName);
            if (spField && matchedVendor?.servicePartnerId) {
              updated[spField] = String(matchedVendor.servicePartnerId);
            }
          }
        }
      }

      return updated;
    });
  }, [modalState, deductionsData, vendors]);

  const handleViewEntry = useCallback(async (item: DisplayDeduction) => {
    try {
      setLoading(true);
      const deduction = await fetchDeductionById(item);

      if (deduction) {
        modalState.setEditingItem({ ...item, isViewOnly: true } as DisplayDeduction & { isViewOnly: boolean });
        populateFormForEdit(
          deduction,
          item.backendType,
          modalState.setFormData,
          modalState.setSelectedCategory
        );
        modalState.handleOpenModal(item.type, true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deduction details';
      console.error('Error viewing deduction:', err);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchDeductionById, modalState, populateFormForEdit]);

  const handleEditEntry = useCallback(async (item: DisplayDeduction) => {
    try {
      setLoading(true);
      const deduction = await fetchDeductionById(item);

      if (deduction) {
        modalState.setEditingItem(item);
        populateFormForEdit(
          deduction,
          item.backendType,
          modalState.setFormData,
          modalState.setSelectedCategory
        );
        modalState.handleOpenModal(item.type, true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deduction for editing';
      console.error('Error loading deduction for edit:', err);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchDeductionById, modalState, populateFormForEdit]);

  const handleOpenDeleteModal = useCallback((item: DisplayDeduction) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      await handleDelete(itemToDelete);
      await reloadDeductions();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deduction';
      console.error('Error deleting deduction:', err);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [itemToDelete, handleDelete, reloadDeductions]);

  const handleDeleteCancel = useCallback(() => {
    if (loading) return;
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, [loading]);

  const handleMonthSelect = useCallback(async (year: number, month: number) => {
    if (!selectedVendor) return;
    setSelectedYear(year);
    setSelectedMonth(month);
    await loadMonthData(year, month, selectedVendor);
  }, [selectedVendor, loadMonthData]);

  const fieldHasError = useCallback((_fieldName: string): boolean => {
    // TODO: Implement field validation logic
    void _fieldName;
    return false;
  }, []);

  const confirmHasError = modalState.validationAttempted && !modalState.formData.confirmCheck && modalState.currentStep === 3;

  const handleNextStep = useCallback(() => {
    if (!validateStep(modalState.currentStep, modalState.formData, modalState.selectedCategory)) {
      modalState.setValidationAttempted(true);
      return;
    }
    modalState.setCurrentStep(prev => prev + 1);
  }, [modalState, validateStep]);

  const handlePrevStep = useCallback(() => {
    modalState.setCurrentStep(prev => Math.max(1, prev - 1));
  }, [modalState]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    modalState.setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    // Process files logic here
    const acceptedFiles: File[] = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB).`);
        return;
      }
      acceptedFiles.push(file);
    });
    if (acceptedFiles.length > 0) {
      modalState.setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    }
  }, [modalState]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const acceptedFiles: File[] = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB).`);
        return;
      }
      acceptedFiles.push(file);
    });
    if (acceptedFiles.length > 0) {
      modalState.setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    }
    if (modalState.fileInputRef.current) {
      modalState.fileInputRef.current.value = '';
    }
  }, [modalState]);

  const handleExport = useCallback(async (format: ExportFormat): Promise<Blob | null> => {
    if (format === 'pdf') {
      const blob = await exportDeductionsToPDF(filteredData, currentMonth, activeKpiFilter, searchQuery);
      return blob;
    } else if (format === 'xlsx') {
      const XLSX = await loadXlsx();
      // Exportar para Excel
      const worksheetData = filteredData.map((deduction) => ({
        'ID': deduction.id,
        'Date': deduction.dateOfIncident || 'N/A',
        'Vendor Name': deduction.courierName,
        'Type': deduction.type,
        'Amount': deduction.amount,
        'Status': deduction.status,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      ws['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Deductions');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } else {
      // CSV
      const headers = ['ID', 'Date', 'Vendor Name', 'Type', 'Amount', 'Status'];
      const rows = filteredData.map((deduction) => [
        deduction.id || '',
        deduction.dateOfIncident || 'N/A',
        deduction.courierName || '',
        deduction.type || '',
        deduction.amount.toString(),
        deduction.status || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  }, [filteredData, currentMonth, activeKpiFilter, searchQuery]);

  return (
    <>
      <div className="w-full min-w-0">
        <DgpPageFrame
          maxWidthClassName="w-full max-w-full"
          containerClassName="w-full px-0"
          className="font-['Inter',sans-serif] text-slate-800 text-sm [&_*]:font-['Inter',sans-serif]"
        >
          <div className="px-[clamp(16px,1.8vw,24px)] py-[clamp(16px,1.8vw,24px)] space-y-[clamp(16px,1.6vw,24px)]">
            {isMobile ? (
              <MobileView
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                kpiCards={KPI_CARDS}
                kpiTotals={kpiTotals}
                activeKpiFilter={activeKpiFilter}
                onKpiFilterChange={handleKpiFilterChange}
                onOpenModalForNewEntry={handleOpenModalForNewEntry}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filteredData={filteredData}
                tableTotalAmount={tableTotalAmount}
                loading={dataLoading || loading}
                error={dataError}
                onView={handleViewEntry}
                onEdit={handleEditEntry}
                onDelete={handleOpenDeleteModal}
                servicePartners={servicePartners}
                servicePartnerNameByUserId={servicePartnerNameByUserId}
                selectedServicePartnerId={selectedServicePartnerId}
                onServicePartnerChange={setSelectedServicePartnerId}
              />
            ) : (
              <DesktopView
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                kpiCards={KPI_CARDS}
                kpiTotals={kpiTotals}
                activeKpiFilter={activeKpiFilter}
                onKpiFilterChange={handleKpiFilterChange}
                onKpiAddClick={handleKpiAddClick}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filteredData={filteredData}
                tableTotalAmount={tableTotalAmount}
                loading={dataLoading || loading}
                error={dataError}
                onView={handleViewEntry}
                onEdit={handleEditEntry}
                onDelete={handleOpenDeleteModal}
                deductionsData={deductionsData}
                onExport={handleExport}
                hasActiveFilters={activeKpiFilter !== 'all' || searchQuery !== ''}
                servicePartners={servicePartners}
                servicePartnerNameByUserId={servicePartnerNameByUserId}
                selectedServicePartnerId={selectedServicePartnerId}
                onServicePartnerChange={setSelectedServicePartnerId}
              />
            )}
          </div>
        </DgpPageFrame>
      </div>

      {/* Fecha a sidebar quando modais são abertos */}
      <CloseSidebarOnModalOpen open={showDeleteModal} />
      <CloseSidebarOnModalOpen open={showPerformanceModal} />

      {showPerformanceModal && (
        <PerformanceModal
          show={showPerformanceModal}
          vendor={selectedVendor}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthData={monthData}
          averages={modalAverages}
          loading={modalLoading}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedVendor(null);
          }}
          onMonthSelect={handleMonthSelect}
        />
      )}

      <DeductionModal
        show={modalState.showModal}
        handleClose={() => {
          setDescriptionFieldError(null);
          setDetailFieldError(null);
          modalState.handleCloseModal();
        }}
        handleSubmit={handleSaveDeduction}
        entryType={modalState.modalEntryType}
        vendors={uniqueCouriers}
        vehicles={vehicles.map(v => ({
          vehicleId: v.vehicleId ?? 0,
          registrationPlates: v.registrationPlates
        }))}
        routes={routes.map(r => ({
          routeId: r.routeId ?? 0,
          routeName: r.routeName
        })) as { routeId: number; routeName?: string }[]}
        servicePartners={servicePartners}
        editingItem={modalState.editingItem}
        formData={modalState.formData}
        selectedCategory={modalState.selectedCategory}
        currentStep={modalState.currentStep}
        uploadedFiles={modalState.uploadedFiles}
        validationAttempted={modalState.validationAttempted}
        descriptionFieldError={descriptionFieldError}
        detailFieldError={detailFieldError}
        onInputChange={handleInputChange}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          modalState.setIsDragOver(true);
        }}
        onDragLeave={() => modalState.setIsDragOver(false)}
        onFileInputChange={handleFileInputChange}
        onRemoveFile={(index) => {
          modalState.setUploadedFiles(prev => prev.filter((_, idx) => idx !== index));
        }}
        fieldHasError={fieldHasError}
        confirmHasError={confirmHasError}
        reviewBaseInfo={reviewBaseInfo ? {
          incidentDate: String(reviewBaseInfo.incidentDate || 'N/A'),
          vendor: String(reviewBaseInfo.vendor || 'N/A'),
          type: String(reviewBaseInfo.type || 'N/A')
        } : undefined}
        fileInputRef={modalState.fileInputRef}
        isDragOver={modalState.isDragOver}
        isViewMode={!!(modalState.editingItem && (modalState.editingItem as DisplayDeduction & { isViewOnly?: boolean }).isViewOnly === true)}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        item={itemToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={loading}
        formatCurrency={formatCurrency}
      />

      <ErrorInfoModal
        show={!!saveErrorMessage}
        onClose={() => setSaveErrorMessage(null)}
        title="Failed to save deduction"
        message={saveErrorMessage ?? ''}
      />
    </>
  );
};

const DeductionsDashboard = () => (
  <NavbarWrapper>
    <DeductionsDashboardContent />
  </NavbarWrapper>
);

export default DeductionsDashboard;

