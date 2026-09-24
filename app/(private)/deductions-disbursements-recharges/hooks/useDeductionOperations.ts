'use client';
import { useCallback } from 'react';
import type { Vendor } from '@/lib/vendors';
import type { DisplayDeduction, FormDataState } from '../types';
import {
  deleteFixDamageDeduction,
  deleteTrafficPenaltyDeduction,
  deletePrePaymentDeduction,
  deleteLiquidationDamageDeduction,
  deleteOtherDeduction,
  fetchFixDamageDeductionById,
  fetchTrafficPenaltyDeductionById,
  fetchPrePaymentDeductionById,
  fetchLiquidationDamageDeductionById,
  fetchOtherDeductionById,
  type FixDamageDeduction,
  type TrafficPenaltyDeduction,
  type PrePaymentDeduction,
  type LiquidationDamageDeduction,
  type OtherDeduction,
} from '@/lib/deductions-api';
import {
  REQUIRED_FIELDS_BY_CATEGORY,
  AMOUNT_FIELD_BY_CATEGORY,
} from '../constants';
import {
  parseBackendDateToString,
  getStringValue,
} from '../utils';
import { Vehicle } from '@/lib/vehicles';
import { Route } from '@/lib/vendors-api';

interface UseDeductionOperationsProps {
  vendors: Vendor[];
  vehicles: Vehicle[];
  routes: Route[];
  deductionsData: DisplayDeduction[];
}

export const useDeductionOperations = ({
  vendors,
  vehicles,
}: UseDeductionOperationsProps) => {
  const validateStep = useCallback((step: number, formData: FormDataState, selectedCategory: string): boolean => {
    if (step === 1) {
      if (!selectedCategory) {
        return false;
      }
      const requiredFields = REQUIRED_FIELDS_BY_CATEGORY[selectedCategory] || [];
      return requiredFields.every((field) => {
        const value = formData[field];
        if (!value) {
          return false;
        }
        if (field === AMOUNT_FIELD_BY_CATEGORY[selectedCategory]) {
          const numValue = Number.parseFloat(getStringValue(value));
          return !Number.isNaN(numValue) && numValue > 0;
        }
        return true;
      });
    }
    if (step === 3) {
      return Boolean(formData.confirmCheck);
    }
    return true;
  }, []);

  const populateFormForEdit = useCallback((
    deduction: FixDamageDeduction | TrafficPenaltyDeduction | PrePaymentDeduction | LiquidationDamageDeduction | OtherDeduction,
    backendType: string,
    setFormData: React.Dispatch<React.SetStateAction<FormDataState>>,
    setSelectedCategory: (category: string) => void
  ) => {
    const getInitialFormState = () => ({} as FormDataState);
    const newFormData: FormDataState = { ...getInitialFormState() };

    const vendor = vendors.find(d => d.userId === (deduction as { userId?: number }).userId);
    const vendorName = vendor?.fullName || '';

    if (backendType === 'fix-damage') {
      const d = deduction as FixDamageDeduction;
      newFormData.rep_refNumber = d.referenceNumber;
      newFormData.rep_vendor = vendorName;
      if (d.servicePartnerId) newFormData.rep_servicePartnerId = String(d.servicePartnerId);
      newFormData.rep_incidentDate = parseBackendDateToString(d.incidentDate);
      newFormData.rep_amount = String(d.amountChargedVendor);
      newFormData.rep_repairCost = String(d.repairCost);
      newFormData.rep_totalRepairCost = String(d.totalRepairCost);
      newFormData.rep_paymentDate = parseBackendDateToString(d.entryDate);
      newFormData.rep_scheduleTerms = d.scheduleTerms || '';
      newFormData.rep_description = d.description || '';
      const vehicle = vehicles.find(v => v.vehicleId === d.vehicleId);
      newFormData.rep_vehicleReg = vehicle?.registrationPlates || '';
      setSelectedCategory('Repairs & Damages');
    } else if (backendType === 'traffic-penalty') {
      const d = deduction as TrafficPenaltyDeduction;
      newFormData.pen_refNumber = d.referenceNumber;
      newFormData.pen_vendor = vendorName;
      if (d.servicePartnerId) newFormData.pen_servicePartnerId = String(d.servicePartnerId);
      newFormData.pen_pcnRef = d.pcnRef;
      newFormData.pen_amount = String(d.amount);
      newFormData.pen_penaltyDate = parseBackendDateToString(d.pcnDate);
      newFormData.pen_issuingAuth = d.issuingAuthority || '';
      newFormData.pen_appealStatus = d.appealStatus || '';
      newFormData.pen_paidBy = d.paidBy || '';
      newFormData.pen_paymentDate = parseBackendDateToString(d.paymentDate);
      newFormData.pen_dateOfEntry = parseBackendDateToString(d.entryDate);
      newFormData.pen_council = d.council || '';
      const vehicle = vehicles.find(v => v.vehicleId === d.vehicleId);
      newFormData.pen_vehicleReg = vehicle?.registrationPlates || '';
      setSelectedCategory('Traffic Penalties');
    } else if (backendType === 'pre-payment') {
      const d = deduction as PrePaymentDeduction;
      newFormData.pre_refNumber = d.referenceNumber;
      newFormData.pre_vendor = vendorName;
      if (d.servicePartnerId) newFormData.pre_servicePartnerId = String(d.servicePartnerId);
      newFormData.pre_amount = String(d.amount);
      newFormData.pre_totalAmount = String(d.totalAmount);
      newFormData.pre_fee = d.feeValue ? String(d.feeValue) : '0';
      newFormData.pre_paymentDate = parseBackendDateToString(d.paymentDate);
      newFormData.pre_scheduleTerms = d.scheduleTerms || '';
      newFormData.pre_description = d.description || '';
      if (d.initialPaymentDate) {
        const dateStr = parseBackendDateToString(d.initialPaymentDate);
        newFormData.pre_initialPaymentDate = dateStr.length >= 7 ? dateStr.substring(0, 7) : '';
      } else {
        newFormData.pre_initialPaymentDate = '';
      }
      setSelectedCategory('Pre-Payments');
    } else if (backendType === 'liquidation-damage') {
      const d = deduction as LiquidationDamageDeduction;
      newFormData.liq_refNumber = d.referenceNumber;
      newFormData.liq_vendor = vendorName;
      if (d.servicePartnerId) newFormData.liq_servicePartnerId = String(d.servicePartnerId);
      newFormData.liq_routeId = String(d.routeId);
      newFormData.liq_awbNumber = d.awbBooking || '';
      newFormData.liq_lqCode = d.code || '';
      newFormData.liq_amount = String(d.amount);
      newFormData.liq_lqDate = parseBackendDateToString(d.liquidationDate);
      newFormData.liq_paidBy = d.paidBy || '';
      newFormData.liq_paymentDate = parseBackendDateToString(d.paymentDate);
      newFormData.liq_dateOfEntry = parseBackendDateToString(d.entryDate);
      newFormData.liq_failureCode = d.failureCode != null ? String(d.failureCode) : '';
      newFormData.liq_description = d.description || '';
      setSelectedCategory('Liquidation Damages');
    } else if (backendType === 'other') {
      const d = deduction as OtherDeduction;
      newFormData.oth_refNumber = d.referenceNumber;
      newFormData.oth_vendor = vendorName;
      if (d.servicePartnerId) newFormData.oth_servicePartnerId = String(d.servicePartnerId);
      newFormData.oth_amount = String(d.totalAmount);
      newFormData.oth_incidentDate = parseBackendDateToString(d.incidentDate);
      newFormData.oth_scheduleTerms = d.scheduleTerms || '';
      // paymentDate espelha o entry_date gravado.
      newFormData.oth_paymentDate = parseBackendDateToString(d.entryDate);
      newFormData.oth_description = d.description || '';
      newFormData.oth_details = d.detail || '';
      setSelectedCategory('Other');
    }

    setFormData(newFormData);
  }, [vendors, vehicles]);

  const handleDelete = useCallback(async (item: DisplayDeduction): Promise<void> => {
    if (item.backendType === 'fix-damage') {
      await deleteFixDamageDeduction(item.backendId);
    } else if (item.backendType === 'traffic-penalty') {
      await deleteTrafficPenaltyDeduction(item.backendId);
    } else if (item.backendType === 'pre-payment') {
      await deletePrePaymentDeduction(item.backendId);
    } else if (item.backendType === 'liquidation-damage') {
      await deleteLiquidationDamageDeduction(item.backendId);
    } else if (item.backendType === 'other') {
      await deleteOtherDeduction(item.backendId);
    }
  }, []);

  const fetchDeductionById = useCallback(async (item: DisplayDeduction) => {
    if (item.backendType === 'fix-damage') {
      return await fetchFixDamageDeductionById(item.backendId);
    } else if (item.backendType === 'traffic-penalty') {
      return await fetchTrafficPenaltyDeductionById(item.backendId);
    } else if (item.backendType === 'pre-payment') {
      return await fetchPrePaymentDeductionById(item.backendId);
    } else if (item.backendType === 'liquidation-damage') {
      return await fetchLiquidationDamageDeductionById(item.backendId);
    } else if (item.backendType === 'other') {
      return await fetchOtherDeductionById(item.backendId);
    }
    return null;
  }, []);

  return {
    validateStep,
    populateFormForEdit,
    handleDelete,
    fetchDeductionById,
  };
};
