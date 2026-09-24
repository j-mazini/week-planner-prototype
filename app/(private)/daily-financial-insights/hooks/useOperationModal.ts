import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { useState, useCallback, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import type { AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { fetchAdhocServices } from '@/lib/adhoc-services-api';
import { FormDataState, InsightRow, Route, Vehicle } from '../types';
import { getBearerAuthHeader } from '@/lib/auth';
import {
  getCostModelIdFromPaymentMode,
  canEditOrDeleteOperationRow,
  resolveVendorSelectValue,
  resolveAdhocServiceSelectValue,
} from '../utils';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { Vendor } from '@/lib/vendors';
import type { CostModelItem } from '@/lib/vendors-api';
import type { CostModel } from '@/lib/api/cost-models';

const today = new Date().toISOString().split('T')[0];
const PAYMENT_MODE_VALUE = {
  DAF: String(BUSINESS_RULES.COST_MODEL.DAF),
  DR: String(BUSINESS_RULES.COST_MODEL.DR),
  FSR: String(BUSINESS_RULES.COST_MODEL.FSR),
  HOURLY_RATE: String(BUSINESS_RULES.COST_MODEL.HOURLY_RATE),
  VSR: String(BUSINESS_RULES.COST_MODEL.VSR),
  SP_VSR: String(BUSINESS_RULES.COST_MODEL.SP_VSR),
} as const;

const DEFAULT_ZERO_RATE_PAYMENT_MODES = new Set<string>([
  PAYMENT_MODE_VALUE.DAF,
  PAYMENT_MODE_VALUE.VSR,
  PAYMENT_MODE_VALUE.SP_VSR,
]);
const FORCED_ZERO_RATE_PAYMENT_MODES = new Set<string>([
  PAYMENT_MODE_VALUE.VSR,
  PAYMENT_MODE_VALUE.SP_VSR,
]);
const REQUIRED_RATE_PAYMENT_MODES = new Set<string>([
  PAYMENT_MODE_VALUE.DR,
  PAYMENT_MODE_VALUE.FSR,
  PAYMENT_MODE_VALUE.HOURLY_RATE,
]);

const defaultFormState: FormDataState = {
  date: today,
  depot: '',
  vrm: '',
  vendor: '',
  route: '',
  paymentMode: '',
  rate: '',
  stops: '',
  sort: '',
  adhoc: '',
  extras: '',
  notes: '',
  adhocServiceId: '',
};

interface UseOperationModalReturn {
  showModal: boolean;
  editingOperationId: number | null;
  formData: FormDataState;
  formErrors: Record<string, string>;
  isSaving: boolean;
  openModal: (row?: InsightRow, defaultDepot?: string) => Promise<void>;
  closeModal: () => void;
  saveOperation: (vendors: Vendor[], routes: Route[], vehicles: Vehicle[]) => Promise<boolean>;
  updateFormData: (field: keyof FormDataState, value: string) => void;
  clearFormError: (field: string) => void;
}

export const useOperationModal = (
  onSuccess: () => void,
  vendors: Vendor[],
  adhocServices: AdhocServiceDTO[],
  _costModels: CostModel[] = []
): UseOperationModalReturn => {
  const [showModal, setShowModal] = useState(false);
  const [editingOperationId, setEditingOperationId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const editingRowSnapshotRef = useRef<InsightRow | null>(null);

  // Helper function to extract rate from vendor's costModels (defined early so it can be used in useEffects)
  const getVendorRate = useCallback((vendorName: string, costModelId: number): string | undefined => {
    const vendor = vendors.find((v) => v.fullName === vendorName);

    if (!vendor || !vendor.costModels || !Array.isArray(vendor.costModels)) {
      return undefined;
    }

    const vendorCostModels: CostModelItem[] = vendor.costModels;

    // Find the cost model matching the costModelId
    const matchingCostModel = vendorCostModels.find(
      (cm) => Number(cm.costModelId) === costModelId || (costModelId === 2 && cm.fixedPrice != null && !cm.minStops)
    );

    if (matchingCostModel) {
      const rate = matchingCostModel.fixedPrice || matchingCostModel.pricePerStop;
      return rate ? String(rate) : undefined;
    }

    return undefined;
  }, [vendors]);

  const openModal = useCallback(async (row?: InsightRow, defaultDepot?: string) => {
    if (isMobile) setOpenMobile(false);
    setOpen(false);
    setFormErrors({});

    if (row && row.operationId) {
      if (!canEditOrDeleteOperationRow(row)) return;

      editingRowSnapshotRef.current = row;
      setEditingOperationId(row.operationId);

      // Ensure adhoc services are loaded (in-memory cache after first call).
      let servicesList = adhocServices;
      if (servicesList.length === 0) {
        try { servicesList = await fetchAdhocServices(); } catch { servicesList = []; }
      }

      // Strategy 1: GET /bff/operations/:id — the detail endpoint returns adhocServiceId directly.
      // The reports list endpoint (/bff/reports/by-date-range) does NOT return adhocServiceId,
      // so we must fetch the full record to get it reliably.
      let resolvedAdhocId = '';
      try {
        const detailRes = await fetch(
          `${getApiBaseUrl()}/bff/operations/${row.operationId}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json', ...getBearerAuthHeader() } }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json() as Record<string, unknown>;
          const adhocObj = detail.adhocService && typeof detail.adhocService === 'object'
            ? (detail.adhocService as Record<string, unknown>)
            : null;
          const rawId = detail.adhocServiceId ?? adhocObj?.adhocServiceId ?? null;
          if (rawId != null && Number.isFinite(Number(rawId)) && Number(rawId) > 0) {
            resolvedAdhocId = String(Number(rawId));
          }
        }
      } catch (err) {
        console.warn('[openModal] Could not fetch operation detail:', err);
      }

      // Strategy 2: fallback — match adhocServiceId by adhocVendorPayment ≈ adhocSort value.
      if (!resolvedAdhocId) {
        resolvedAdhocId = resolveAdhocServiceSelectValue(row, servicesList);
        if (!resolvedAdhocId) {
          console.warn(`[openModal] Could not resolve adhocServiceId for op ${row.operationId}. adhocSort=${row.adhoc}. Services:`,
            servicesList.map(s => `${s.adhocServiceId}(vp=${s.adhocVendorPayment})`).join(', '));
        }
      }

      // Always use the operation's actual adhocSort value (row.adhoc) as the Adhoc Value field.
      // adhocVendorPayment is the base payment of the service — it may differ from what was
      // actually charged in this specific operation (e.g., service base = 40, operation = 400).
      // adhocVendorPayment is only used for auto-filling when the user picks a NEW service.
      const resolvedAdhocValue = row.adhoc != null && row.adhoc !== 0
        ? String(row.adhoc)
        : '';
      const normalizedPaymentMode = String(getCostModelIdFromPaymentMode(row.paymentMode));

      setFormData({
        date: row.date,
        depot: row.depot,
        vrm: row.vrm,
        vendor: resolveVendorSelectValue(row, vendors),
        route: row.route,
        paymentMode: normalizedPaymentMode,
        rate: DEFAULT_ZERO_RATE_PAYMENT_MODES.has(normalizedPaymentMode) ? '0' : row.rate.toString(),
        stops: (row.stops || 0).toString(),
        sort: (row.sort || 0).toString(),
        adhoc: resolvedAdhocValue,
        extras: (row.extras || 0).toString(),
        notes: row.notes || '',
        adhocServiceId: resolvedAdhocId,
      });
    } else {
      editingRowSnapshotRef.current = null;
      setEditingOperationId(null);
      setFormData({
        ...defaultFormState,
        date: new Date().toISOString().split('T')[0],
        depot: defaultDepot && defaultDepot !== 'All' ? defaultDepot : ''
      });
    }

    setShowModal(true);
  }, [isMobile, setOpen, setOpenMobile, vendors, adhocServices]);

  useEffect(() => {
    if (!showModal || editingOperationId == null) return;
    const snap = editingRowSnapshotRef.current;
    if (!snap || vendors.length === 0) return;
    setFormData((prev) => {
      if (vendors.some((d) => d.fullName === prev.vendor)) return prev;
      const next = resolveVendorSelectValue(snap, vendors);
      if (!next || prev.vendor === next) return prev;
      return { ...prev, vendor: next };
    });
  }, [showModal, editingOperationId, vendors]);

  useEffect(() => {
    if (!showModal || editingOperationId == null) return;
    const snap = editingRowSnapshotRef.current;
    if (!snap) return;
    const resolvedId = resolveAdhocServiceSelectValue(snap, adhocServices);
    if (!resolvedId) return;
    setFormData((prev) => {
      // Only update adhocServiceId — never overwrite adhoc (the operation's actual adhocSort value)
      // with adhocVendorPayment (the service base price, which may differ from the op value).
      if (prev.adhocServiceId === resolvedId) return prev;
      return { ...prev, adhocServiceId: resolvedId };
    });
  }, [showModal, editingOperationId, adhocServices]);

  // Auto-populate paymentMode when vendor changes
  useEffect(() => {
    if (!showModal) return;

    if (!formData.vendor) {
      return;
    }

    const vendor = vendors.find((v) => v.fullName === formData.vendor);

    if (!vendor) {
      return;
    }

    // Don't override paymentMode when editing an existing operation
    if (editingOperationId != null) {
      return;
    }

    // Get vendor's default cost model or first available
    let defaultCostModelId: string | undefined;

    if (vendor.costModelId) {
      defaultCostModelId = String(vendor.costModelId);
    } else if (vendor.costModels && Array.isArray(vendor.costModels) && vendor.costModels.length > 0) {
      // Get the first cost model and check if it has a costModelId field
      const firstCostModel = vendor.costModels[0];
      defaultCostModelId = String(firstCostModel.costModelId || 2);
    } else {
      defaultCostModelId = String(BUSINESS_RULES.COST_MODEL.DR);
    }

    if (formData.paymentMode !== defaultCostModelId) {
      // Get the rate from vendor for this payment mode
      const vendorRate = getVendorRate(formData.vendor, parseInt(defaultCostModelId));
      setFormData(prev => ({ ...prev, paymentMode: defaultCostModelId, rate: vendorRate || '' }));
    }
  }, [formData.vendor, formData.paymentMode, vendors, showModal, getVendorRate, editingOperationId]);

  const closeModal = useCallback(() => {
    editingRowSnapshotRef.current = null;
    setShowModal(false);
    setFormErrors({});
    setEditingOperationId(null);
    setFormData(defaultFormState);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.depot) {
      errors.depot = 'Depot location is required';
    }
    if (!formData.vrm) {
      errors.vrm = 'VRN is required';
    }
    if (!formData.vendor) {
      errors.vendor = 'Vendor/Vendor is required';
    }
    if (!formData.route) {
      errors.route = 'Route is required';
    }
    if (!formData.paymentMode) {
      errors.paymentMode = 'Payment mode is required';
    }
    
    // Rate logic:
    // Required only for DR, FSR, or Hourly Rate (7).
    // Not required for DAF (1) or VSR.
    // Also optional when an adhocServiceId is set.
    const hasAdhoc = formData.adhocServiceId.trim() !== '';
    const isRateRequiredMode = REQUIRED_RATE_PAYMENT_MODES.has(formData.paymentMode);
    
    if (!hasAdhoc && isRateRequiredMode && (formData.rate === '' || formData.rate === undefined)) {
      errors.rate = 'Rate is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const saveOperation = useCallback(async (
    vendors: Vendor[],
    routes: Route[],
    vehicles: Vehicle[]
  ): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    const vendorTrimmed = formData.vendor.trim();
    const vendor =
      vendors.find((d) => d.fullName === formData.vendor) ??
      vendors.find((d) => (d.fullName ?? '').trim() === vendorTrimmed) ??
      vendors.find(
        (d) => (d.fullName ?? '').trim().toLowerCase() === vendorTrimmed.toLowerCase()
      );
    if (!vendor) {
      setFormErrors(prev => ({ ...prev, vendor: 'Please select a valid vendor' }));
      return false;
    }

    const route = routes.find(r => r.routeName === formData.route);
    if (!route) {
      setFormErrors(prev => ({ ...prev, route: 'Please select a valid route' }));
      return false;
    }

    const vehicle = vehicles.find(v => {
      const plate = (v.registrationPlates || v.registrationPlate || '').toUpperCase();
      return plate === formData.vrm.toUpperCase();
    });
    if (!vehicle) {
      setFormErrors(prev => ({ ...prev, vrm: 'Please select a valid vehicle' }));
      return false;
    }

    setIsSaving(true);
    setFormErrors({});

    const costModelId = getCostModelIdFromPaymentMode(formData.paymentMode);
    const rate = FORCED_ZERO_RATE_PAYMENT_MODES.has(formData.paymentMode)
      ? 0
      : parseFloat(formData.rate) || 0;
    const dailyServiceCharge = rate;

    const operationData = {
      date: formData.date,
      userId: vendor.userId,
      routeId: route.routeId,
      vehicleId: vehicle.vehicleId,
      costModelId: costModelId,
      rate: rate,
      dailyServiceCharge: dailyServiceCharge,
      routeSort: parseFloat(formData.sort) || 0,
      adhocSort: parseFloat(formData.adhoc) || 0,
      extra: parseFloat(formData.extras) || 0,
      note: formData.notes || null,
      status: BUSINESS_RULES.WORKING_STATUS.WORKING,
      adhocServiceId: formData.adhocServiceId.trim() !== '' && Number.isFinite(Number(formData.adhocServiceId))
        ? Number(formData.adhocServiceId)
        : null,
    };

    try {
      let response;

      if (editingOperationId) {
        response = await fetch(
          `${getApiBaseUrl()}/bff/operations/${editingOperationId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...getBearerAuthHeader(),
            },
            body: JSON.stringify(operationData),
          }
        );
      } else {
        response = await fetch(
          `${getApiBaseUrl()}/bff/operations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getBearerAuthHeader(),
            },
            body: JSON.stringify(operationData),
          }
        );
      }

      if (response.ok) {
        closeModal();
        onSuccess();
        return true;
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to save register';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error saving operation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save register. Please try again.';
      setFormErrors(prev => ({ ...prev, general: errorMessage }));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, editingOperationId, validateForm, closeModal, onSuccess]);

  const updateFormData = useCallback((field: keyof FormDataState, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      // If paymentMode changes
      if (field === 'paymentMode') {
        // For DAF (1) or VSR, zero out rate
        if (DEFAULT_ZERO_RATE_PAYMENT_MODES.has(value)) {
          next.rate = '0';
          setFormErrors(errs => {
            if (!errs.rate) return errs;
            const { rate: _, ...rest } = errs;
            return rest;
          });
        }
        // For DR (2), FSR (3), or Hourly Rate (7), populate rate from vendor.costModels
        else if (REQUIRED_RATE_PAYMENT_MODES.has(value)) {
          const costModelId = parseInt(value);

          // Use helper to get vendor rate
          const vendorRate = getVendorRate(prev.vendor, costModelId);

          if (vendorRate) {
            next.rate = String(vendorRate);
            setFormErrors(errs => {
              if (!errs.rate) return errs;
              const { rate: _, ...rest } = errs;
              return rest;
            });
          }
        }
      }

      return next;
    });
  }, [getVendorRate]);

  const clearFormError = useCallback((field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    showModal,
    editingOperationId,
    formData,
    formErrors,
    isSaving,
    openModal,
    closeModal,
    saveOperation,
    updateFormData,
    clearFormError,
  };
};
