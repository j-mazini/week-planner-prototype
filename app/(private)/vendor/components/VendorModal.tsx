'use client';

import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Vendor, Deposit, VendorType, UserType, ServicePartner, Route, Vehicle, CostModel, CostModelItem } from '@/lib/vendors-api';
import { deleteCostModels } from '@/lib/vendors-api';
import { formatDateOnly, formatDateForDisplay, formatPhone, generateVendorId } from '../utils/vendor-utils';
import { resolveCostModelMapping } from '../utils/cost-model-mapping';
import { vendorStyles } from '../styles';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';

interface VendorModalProps {
  show: boolean;
  mode: 'add' | 'edit';
  vendor: Vendor | null;
  vendors: Vendor[];
  deposits: Deposit[];
  vendorTypes: VendorType[];
  userTypes: UserType[];
  servicePartners: ServicePartner[];
  routes: Route[];
  vehicles: Vehicle[];
  costModels: CostModel[];
  onClose: () => void;
  onSave: (data: Partial<Vendor>) => Promise<void>;
}

type Step = 'personal' | 'address' | 'employment' | 'cost' | 'training' | 'compliance';

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal', icon: 'bi-person' },
  { id: 'address', label: 'Address', icon: 'bi-geo-alt' },
  { id: 'employment', label: 'Contract', icon: 'bi-briefcase' },
  { id: 'cost', label: 'Cost Model', icon: 'bi-calculator' },
  { id: 'training', label: 'Training', icon: 'bi-book' },
  { id: 'compliance', label: 'Compliance', icon: 'bi-shield-check' },
];

const VendorModal: React.FC<VendorModalProps> = memo(({
  show,
  mode,
  vendor,
  vendors,
  deposits,
  vendorTypes,
  userTypes,
  servicePartners,
  routes,
  vehicles,
  costModels,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  // Ref to control if initial vendor loading has been done
  const vendorLoadedRef = useRef<number | null>(null);
  // State to control which new cost models are visible (only in edit mode)
  const [showNewCostModels, setShowNewCostModels] = useState<{
    vsr: boolean;
    vsrEletric: boolean;
    spVsr: boolean;
    spVsrEletric: boolean;
    daf: boolean;
    dafEletric: boolean;
    fsr: boolean;
    fsrEletric: boolean;
    dr: boolean;
    drEletric: boolean;
    hourlyEletric: boolean;
  }>({
    vsr: false,
    vsrEletric: false,
    spVsr: false,
    spVsrEletric: false,
    daf: false,
    dafEletric: false,
    fsr: false,
    fsrEletric: false,
    dr: false,
    drEletric: false,
    hourlyEletric: false,
  });

  // Ref to store original validityEndDate values (more reliable than state to avoid closure issues)
  const originalValidityEndDatesRef = useRef<{
    vsr?: string;
    vsrEletric?: string;
    spVsr?: string;
    spVsrEletric?: string;
    daf?: string;
    dafEletric?: string;
    fsr?: string;
    fsrEletric?: string;
    dr?: string;
    drEletric?: string;
    hourlyEletric?: string;
  }>({});

  // State to store original validityEndDate values (kept for synchronization, but ref is used for reading)
  const [originalValidityEndDates, setOriginalValidityEndDates] = useState<{
    vsr?: string;
    vsrEletric?: string;
    spVsr?: string;
    spVsrEletric?: string;
    daf?: string;
    dafEletric?: string;
    fsr?: string;
    fsrEletric?: string;
    dr?: string;
    drEletric?: string;
    hourlyEletric?: string;
  }>({});

  // Refs to store original bands/rates field values before clicking +New
  const originalCostModelFieldsRef = useRef<{
    vsr?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string };
    vsrEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string };
    spVsr?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; band3Stops?: string; band3Rate?: string; band4Stops?: string; band4Rate?: string; validityStartDate?: string };
    spVsrEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; band3Stops?: string; band3Rate?: string; band4Stops?: string; band4Rate?: string; validityStartDate?: string };
    daf?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string };
    dafEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string };
    fsr?: { stopRate?: string; validityStartDate?: string };
    fsrEletric?: { stopRate?: string; validityStartDate?: string };
    dr?: { dayRate?: string; validityStartDate?: string };
    drEletric?: { dayRate?: string; validityStartDate?: string };
    hourlyEletric?: { hourlyRate?: string; validityStartDate?: string };
  }>({});

  // Ref to store user changes by type and date (to preserve when selecting in the select)
  const userChangesByDateRef = useRef<{
    [key: string]: {
      vsr?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string; validityEndDate?: string };
      vsrEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string; validityEndDate?: string };
      spVsr?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; band3Stops?: string; band3Rate?: string; band4Stops?: string; band4Rate?: string; validityStartDate?: string; validityEndDate?: string };
      spVsrEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; band3Stops?: string; band3Rate?: string; band4Stops?: string; band4Rate?: string; validityStartDate?: string; validityEndDate?: string };
      daf?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string; validityEndDate?: string };
      dafEletric?: { band1Stops?: string; band1Rate?: string; band2Stops?: string; band2Rate?: string; validityStartDate?: string; validityEndDate?: string };
      fsr?: { stopRate?: string; validityStartDate?: string; validityEndDate?: string };
      fsrEletric?: { stopRate?: string; validityStartDate?: string; validityEndDate?: string };
      dr?: { dayRate?: string; validityStartDate?: string; validityEndDate?: string };
      drEletric?: { dayRate?: string; validityStartDate?: string; validityEndDate?: string };
      hourlyEletric?: { hourlyRate?: string; validityStartDate?: string; validityEndDate?: string };
    };
  }>({});
  // Estado para controlar o modal de confirmação de delete
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean;
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric' | null;
  }>({
    show: false,
    type: null,
  });
  // State to control the error modal
  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: '',
    message: '',
  });
  // Local vendor state to update after deleting (without needing to reload from backend)
  const [localVendor, setLocalVendor] = useState<Vendor | null>(null);

  // Helper to show error
  const showError = (title: string, message: string) => {
    setErrorModal({ show: true, title, message });
  };

  // Helper to subtract one day from a date in yyyy-mm-dd format
  const subtractOneDay = (dateString: string): string => {
    if (!dateString) return '';
    // Use new Date with UTC timezone to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);
    const resultYear = date.getUTCFullYear();
    const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const resultDay = String(date.getUTCDate()).padStart(2, '0');
    return `${resultYear}-${resultMonth}-${resultDay}`;
  };

  // Helper to add one day to a date in yyyy-mm-dd format
  const addOneDay = (dateString: string): string => {
    if (!dateString) return '';
    // Use new Date with UTC timezone to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + 1);
    const resultYear = date.getUTCFullYear();
    const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const resultDay = String(date.getUTCDate()).padStart(2, '0');
    return `${resultYear}-${resultMonth}-${resultDay}`;
  };

  // Helper to get today's date in yyyy-mm-dd (local time)
  const getTodayDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handler for when the date input (shown alongside the select) changes the validity start date
  // This updates both formData and localVendor.originalCostModels so handleSave matches correctly (Bug #1, #2, #3)
  const handleValidityStartDateEdit = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    newDate: string
  ): void => {
    const formKey = `${type}ValidityStartDate` as keyof typeof formData;
    const oldDate = formData[formKey] as string | undefined;
    if (!newDate) return;

    const oldDateFormatted = oldDate ? formatDateOnly(oldDate) : '';
    const newDateFormatted = formatDateOnly(newDate);
    if (!newDateFormatted || oldDateFormatted === newDateFormatted) return;

    // Determine costModelId and isElectric
    const { costModelId, isElectric } = resolveCostModelMapping(type);

    // Update localVendor.originalCostModels — change validityStartDate of matching items
    setLocalVendor(prev => {
      if (!prev?.originalCostModels) return prev;
      const updatedCostModels = (prev.originalCostModels as CostModelItem[]).map(cm => {
        const cmDate = formatDateOnly(cm.validityStartDate);
        if (cmDate !== oldDateFormatted) return cm;
        let matchesType = false;
        if (isElectric === true) {
          matchesType = cm.costModelId === costModelId && cm.isElectric === true;
        } else {
          matchesType = cm.costModelId === costModelId && (cm.isElectric === false || cm.isElectric === null);
        }
        if (!matchesType) return cm;
        return { ...cm, validityStartDate: newDateFormatted };
      });
      return { ...prev, originalCostModels: updatedCostModels };
    });

    // Update formData
    setFormData(prev => ({ ...prev, [formKey]: newDateFormatted }));

    // Adjust the previous group's endDate to avoid gaps (Bug #3)
    if (oldDateFormatted) {
      setTimeout(() => {
        updatePreviousItemEndDate(type, oldDateFormatted, newDateFormatted);
      }, 0);
    }
  };

  // Function to update validityEndDate of the previous item when validityStartDate is changed
  // If the new validityStartDate passes the validityEndDate of the previous item, update the endDate
  const updatePreviousItemEndDate = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    currentStartDate: string,
    newStartDate: string
  ): void => {
    if (!newStartDate || !currentStartDate) return;

    const currentVendor = localVendor || vendor;
    if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) return;

    const costModels = currentVendor.originalCostModels as CostModelItem[];
    const formattedCurrentStartDate = formatDateOnly(currentStartDate);
    const formattedNewStartDate = formatDateOnly(newStartDate);
    if (!formattedCurrentStartDate || !formattedNewStartDate) return;

    // Determine costModelId and isElectric based on type
    const { costModelId, isElectric } = resolveCostModelMapping(type);

    // Filter cost models of the same type
    const sameTypeModels = costModels.filter(cm => {
      let matchesType = false;
      if (isElectric === true) {
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }
      return matchesType && cm.validityStartDate;
    });

    // Agrupar por validityStartDate
    const groupedByStartDate = new Map<string, CostModelItem[]>();
    sameTypeModels.forEach(cm => {
      const formattedDate = formatDateOnly(cm.validityStartDate!);
      if (formattedDate) {
        if (!groupedByStartDate.has(formattedDate)) {
          groupedByStartDate.set(formattedDate, []);
        }
        groupedByStartDate.get(formattedDate)!.push(cm);
      }
    });

    // Convert to array and sort by date (ascending)
    const sortedGroups = Array.from(groupedByStartDate.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      });

    // Find the index of the current group
    const currentGroupIndex = sortedGroups.findIndex(([date]) => date === formattedCurrentStartDate);

    if (currentGroupIndex <= 0) {
      // No previous group to update
      return;
    }

    // Get the previous group
    const previousGroup = sortedGroups[currentGroupIndex - 1];
    const [, previousGroupItems] = previousGroup;

    // Check if any item in the previous group has validityEndDate
    // If the new start date passes the end date of the previous item, update it
    const newStartDateObj = new Date(formattedNewStartDate);

    const updates: Array<{ modelEmployeesId: number; newEndDate: string }> = [];

    previousGroupItems.forEach(item => {
      if (item.validityEndDate) {
        const previousEndDateFormatted = formatDateOnly(item.validityEndDate);
        if (previousEndDateFormatted) {
          const previousEndDateObj = new Date(previousEndDateFormatted);

          // If the new start date is greater than or equal to the previous end date, update it
          if (newStartDateObj > previousEndDateObj) {
            // Update the end date to newStartDate - 1 day
            const newEndDate = subtractOneDay(formattedNewStartDate);
            if (item.modelEmployeesId) {
              updates.push({
                modelEmployeesId: item.modelEmployeesId,
                newEndDate: newEndDate
              });
            }
          }
        }
      }
    });

    // Apply all updates at once
    if (updates.length > 0) {
      setLocalVendor(prev => {
        if (!prev || !prev.originalCostModels || !Array.isArray(prev.originalCostModels)) return prev;

        const updatedCostModels = prev.originalCostModels.map(cm => {
          const update = updates.find(u => u.modelEmployeesId === cm.modelEmployeesId);
          if (update) {
            return {
              ...cm,
              validityEndDate: update.newEndDate
            };
          }
          return cm;
        });

        return {
          ...prev,
          originalCostModels: updatedCostModels
        };
      });
    }
  };

  // Function to update validityStartDate and validityEndDate of next groups when validityEndDate is changed
  // Trabalha com grupos de cost models que têm a mesma validityStartDate
  // Preserva a duração original de cada grupo (diferença entre endDate e startDate)
  const updateNextItemsStartDates = (
    type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    currentStartDate: string,
    newEndDate: string
  ): void => {
    if (!newEndDate || !currentStartDate) return;

    const currentVendor = localVendor || vendor;
    if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) return;

    const costModels = currentVendor.originalCostModels as CostModelItem[];
    const formattedCurrentStartDate = formatDateOnly(currentStartDate);
    const formattedNewEndDate = formatDateOnly(newEndDate);
    if (!formattedCurrentStartDate || !formattedNewEndDate) return;

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Filter cost models of the same type
    const sameTypeModels = costModels.filter(cm => {
      let matchesType = false;
      if (isElectric === true) {
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }
      return matchesType && cm.validityStartDate;
    });

    // Agrupar por validityStartDate (similar ao groupByDate)
    const groupedByStartDate = new Map<string, CostModelItem[]>();
    sameTypeModels.forEach(cm => {
      const formattedDate = formatDateOnly(cm.validityStartDate!);
      if (formattedDate) {
        if (!groupedByStartDate.has(formattedDate)) {
          groupedByStartDate.set(formattedDate, []);
        }
        groupedByStartDate.get(formattedDate)!.push(cm);
      }
    });

    // Convert to array and sort by date (ascending)
    const sortedGroups = Array.from(groupedByStartDate.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      });

    // Find the index of the current group
    const currentGroupIndex = sortedGroups.findIndex(([date]) => date === formattedCurrentStartDate);

    if (currentGroupIndex === -1 || currentGroupIndex >= sortedGroups.length - 1) {
      // No next groups to update
      return;
    }

    // Update the validityEndDate of the current group first
    const currentGroupItems = sameTypeModels.filter(cm => {
      const cmFormattedDate = formatDateOnly(cm.validityStartDate!);
      return cmFormattedDate === formattedCurrentStartDate;
    });

    const currentGroupEndDateUpdates: Array<{ modelEmployeesId: number; newEndDate: string }> = [];
    currentGroupItems.forEach(item => {
      if (item.modelEmployeesId) {
        // Update endDate even if it's null
        const currentEndDate = item.validityEndDate ? formatDateOnly(item.validityEndDate) : null;
        if (currentEndDate !== formattedNewEndDate) {
          currentGroupEndDateUpdates.push({
            modelEmployeesId: item.modelEmployeesId,
            newEndDate: formattedNewEndDate
          });
        }
      }
    });

    // Collect all necessary updates for all subsequent groups
    // Update both startDate and endDate
    const startDateUpdates: Array<{ modelEmployeesId: number; newStartDate: string }> = [];
    const endDateUpdates: Array<{ modelEmployeesId: number; newEndDate: string }> = [];

    let previousEndDate = formattedNewEndDate;

    // Process each subsequent group
    for (let i = currentGroupIndex + 1; i < sortedGroups.length; i++) {
      const [originalGroupStartDate, groupItems] = sortedGroups[i];

      // Calculate the new startDate: previous group's endDate + 1 day
      const calculatedStartDate = addOneDay(previousEndDate);

      const formattedOriginalGroupStartDate = formatDateOnly(originalGroupStartDate);
      if (!formattedOriginalGroupStartDate) {
        break;
      }

      // Find the original endDate of the group
      const originalGroupEndDate = groupItems.find(item => item.validityEndDate)?.validityEndDate;

      // If calculated dates are different from current ones, update all items in this group
      if (originalGroupStartDate !== calculatedStartDate) {
        groupItems.forEach(item => {
          if (item.modelEmployeesId) {
            startDateUpdates.push({
              modelEmployeesId: item.modelEmployeesId,
              newStartDate: calculatedStartDate
            });
          }
        });
      }

      if (originalGroupEndDate) {
        // Grupo tem endDate: calcular duração e atualizar endDate
        const formattedOriginalGroupEndDate = formatDateOnly(originalGroupEndDate);

        if (formattedOriginalGroupEndDate) {
          // Calculate duration in days using addOneDay function repeatedly (more reliable)
          let tempDate = formattedOriginalGroupStartDate;
          let durationInDays = 0;
          while (tempDate < formattedOriginalGroupEndDate) {
            tempDate = addOneDay(tempDate);
            durationInDays++;
          }

          // Calculate the new endDate: new startDate + original duration (using addOneDay repeatedly)
          let calculatedEndDate = calculatedStartDate;
          for (let j = 0; j < durationInDays; j++) {
            calculatedEndDate = addOneDay(calculatedEndDate);
          }

          // Atualizar endDate de todos os items do grupo que têm endDate
          groupItems.forEach(item => {
            if (item.modelEmployeesId && item.validityEndDate) {
              const currentEndDate = formatDateOnly(item.validityEndDate);
              if (currentEndDate !== calculatedEndDate) {
                endDateUpdates.push({
                  modelEmployeesId: item.modelEmployeesId,
                  newEndDate: calculatedEndDate
                });
              }
            }
          });

          // Atualizar previousEndDate para o próximo grupo
          previousEndDate = calculatedEndDate;
        } else {
          // If couldn't format, stop
          break;
        }
      } else {
        // Group has no endDate (indefinite in the future): only update startDate and stop
        // Don't update previousEndDate, as there is no end date
        break;
      }
    }

    // Apply all updates at once (incluindo o grupo atual)
    if (startDateUpdates.length > 0 || endDateUpdates.length > 0 || currentGroupEndDateUpdates.length > 0) {
      setLocalVendor(prev => {
        if (!prev || !prev.originalCostModels || !Array.isArray(prev.originalCostModels)) return prev;

        const updatedCostModels = prev.originalCostModels.map(cm => {
          const startUpdate = startDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);
          const endUpdate = endDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);
          const currentGroupEndUpdate = currentGroupEndDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);

          if (startUpdate || endUpdate || currentGroupEndUpdate) {
            return {
              ...cm,
              ...(startUpdate && { validityStartDate: startUpdate.newStartDate }),
              ...(endUpdate && { validityEndDate: endUpdate.newEndDate }),
              ...(currentGroupEndUpdate && { validityEndDate: currentGroupEndUpdate.newEndDate })
            };
          }
          return cm;
        });

        return {
          ...prev,
          originalCostModels: updatedCostModels
        };
      });
    }
  };

  // Toggle to show/hide new cost model fields
  const toggleNewCostModel = (type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric') => {
    setShowNewCostModels(prev => {
      const isCurrentlyVisible = prev[type];

      // Se já está visível, limpar os campos e ocultar
      if (isCurrentlyVisible) {
        // Capture values changed by the user before clicking +New (saved in refs)
        const originalValue = originalValidityEndDatesRef.current[type];

        // Clear new fields and restore values that the user had changed before clicking +New
        setFormData(currentFormData => {
          const updated = { ...currentFormData };
          switch (type) {
            case 'vsr':
              updated.newVsrBand1Stops = '';
              updated.newVsrBand1Rate = '';
              updated.newVsrBand2Stops = '';
              updated.newVsrBand2Rate = '';
              updated.newVsrValidityStartDate = '';
              updated.newVsrValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const vsrFields = originalCostModelFieldsRef.current.vsr;
              if (vsrFields) {
                if (vsrFields.band1Stops !== undefined) updated.vsrBand1Stops = vsrFields.band1Stops;
                if (vsrFields.band1Rate !== undefined) updated.vsrBand1Rate = vsrFields.band1Rate;
                if (vsrFields.band2Stops !== undefined) updated.vsrBand2Stops = vsrFields.band2Stops;
                if (vsrFields.band2Rate !== undefined) updated.vsrBand2Rate = vsrFields.band2Rate;
                if (vsrFields.validityStartDate !== undefined) updated.vsrValidityStartDate = vsrFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(vsrFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `vsr_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].vsr = {
                    band1Stops: vsrFields.band1Stops,
                    band1Rate: vsrFields.band1Rate,
                    band2Stops: vsrFields.band2Stops,
                    band2Rate: vsrFields.band2Rate,
                    validityStartDate: vsrFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              // Restaurar o validityEndDate que o usuário tinha antes de clicar em +New
              updated.vsrValidityEndDate = originalValue ?? '';
              break;
            case 'vsrEletric':
              updated.newVsrEletricBand1Stops = '';
              updated.newVsrEletricBand1Rate = '';
              updated.newVsrEletricBand2Stops = '';
              updated.newVsrEletricBand2Rate = '';
              updated.newVsrEletricValidityStartDate = '';
              updated.newVsrEletricValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const vsrEletricFields = originalCostModelFieldsRef.current.vsrEletric;
              if (vsrEletricFields) {
                if (vsrEletricFields.band1Stops !== undefined) updated.vsrEletricBand1Stops = vsrEletricFields.band1Stops;
                if (vsrEletricFields.band1Rate !== undefined) updated.vsrEletricBand1Rate = vsrEletricFields.band1Rate;
                if (vsrEletricFields.band2Stops !== undefined) updated.vsrEletricBand2Stops = vsrEletricFields.band2Stops;
                if (vsrEletricFields.band2Rate !== undefined) updated.vsrEletricBand2Rate = vsrEletricFields.band2Rate;
                if (vsrEletricFields.validityStartDate !== undefined) updated.vsrEletricValidityStartDate = vsrEletricFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(vsrEletricFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `vsrEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].vsrEletric = {
                    band1Stops: vsrEletricFields.band1Stops,
                    band1Rate: vsrEletricFields.band1Rate,
                    band2Stops: vsrEletricFields.band2Stops,
                    band2Rate: vsrEletricFields.band2Rate,
                    validityStartDate: vsrEletricFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.vsrEletricValidityEndDate = originalValue ?? '';
              break;
            case 'spVsr':
              updated.newSpVsrBand1Stops = '';
              updated.newSpVsrBand1Rate = '';
              updated.newSpVsrBand2Stops = '';
              updated.newSpVsrBand2Rate = '';
              updated.newSpVsrBand3Stops = '';
              updated.newSpVsrBand3Rate = '';
              updated.newSpVsrBand4Stops = '';
              updated.newSpVsrBand4Rate = '';
              updated.newSpVsrValidityStartDate = '';
              updated.newSpVsrValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const spVsrFields = originalCostModelFieldsRef.current.spVsr;
              if (spVsrFields) {
                if (spVsrFields.band1Stops !== undefined) updated.spVsrBand1Stops = spVsrFields.band1Stops;
                if (spVsrFields.band1Rate !== undefined) updated.spVsrBand1Rate = spVsrFields.band1Rate;
                if (spVsrFields.band2Stops !== undefined) updated.spVsrBand2Stops = spVsrFields.band2Stops;
                if (spVsrFields.band2Rate !== undefined) updated.spVsrBand2Rate = spVsrFields.band2Rate;
                if (spVsrFields.band3Stops !== undefined) updated.spVsrBand3Stops = spVsrFields.band3Stops;
                if (spVsrFields.band3Rate !== undefined) updated.spVsrBand3Rate = spVsrFields.band3Rate;
                if (spVsrFields.band4Stops !== undefined) updated.spVsrBand4Stops = spVsrFields.band4Stops;
                if (spVsrFields.band4Rate !== undefined) updated.spVsrBand4Rate = spVsrFields.band4Rate;
                if (spVsrFields.validityStartDate !== undefined) updated.spVsrValidityStartDate = spVsrFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(spVsrFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `spVsr_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].spVsr = {
                    band1Stops: spVsrFields.band1Stops,
                    band1Rate: spVsrFields.band1Rate,
                    band2Stops: spVsrFields.band2Stops,
                    band2Rate: spVsrFields.band2Rate,
                    band3Stops: spVsrFields.band3Stops,
                    band3Rate: spVsrFields.band3Rate,
                    band4Stops: spVsrFields.band4Stops,
                    band4Rate: spVsrFields.band4Rate,
                    validityStartDate: spVsrFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.spVsrValidityEndDate = originalValue ?? '';
              break;
            case 'spVsrEletric':
              updated.newSpVsrEletricBand1Stops = '';
              updated.newSpVsrEletricBand1Rate = '';
              updated.newSpVsrEletricBand2Stops = '';
              updated.newSpVsrEletricBand2Rate = '';
              updated.newSpVsrEletricBand3Stops = '';
              updated.newSpVsrEletricBand3Rate = '';
              updated.newSpVsrEletricBand4Stops = '';
              updated.newSpVsrEletricBand4Rate = '';
              updated.newSpVsrEletricValidityStartDate = '';
              updated.newSpVsrEletricValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const spVsrEletricFields = originalCostModelFieldsRef.current.spVsrEletric;
              if (spVsrEletricFields) {
                if (spVsrEletricFields.band1Stops !== undefined) updated.spVsrEletricBand1Stops = spVsrEletricFields.band1Stops;
                if (spVsrEletricFields.band1Rate !== undefined) updated.spVsrEletricBand1Rate = spVsrEletricFields.band1Rate;
                if (spVsrEletricFields.band2Stops !== undefined) updated.spVsrEletricBand2Stops = spVsrEletricFields.band2Stops;
                if (spVsrEletricFields.band2Rate !== undefined) updated.spVsrEletricBand2Rate = spVsrEletricFields.band2Rate;
                if (spVsrEletricFields.band3Stops !== undefined) updated.spVsrEletricBand3Stops = spVsrEletricFields.band3Stops;
                if (spVsrEletricFields.band3Rate !== undefined) updated.spVsrEletricBand3Rate = spVsrEletricFields.band3Rate;
                if (spVsrEletricFields.band4Stops !== undefined) updated.spVsrEletricBand4Stops = spVsrEletricFields.band4Stops;
                if (spVsrEletricFields.band4Rate !== undefined) updated.spVsrEletricBand4Rate = spVsrEletricFields.band4Rate;
                if (spVsrEletricFields.validityStartDate !== undefined) updated.spVsrEletricValidityStartDate = spVsrEletricFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(spVsrEletricFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `spVsrEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].spVsrEletric = {
                    band1Stops: spVsrEletricFields.band1Stops,
                    band1Rate: spVsrEletricFields.band1Rate,
                    band2Stops: spVsrEletricFields.band2Stops,
                    band2Rate: spVsrEletricFields.band2Rate,
                    band3Stops: spVsrEletricFields.band3Stops,
                    band3Rate: spVsrEletricFields.band3Rate,
                    band4Stops: spVsrEletricFields.band4Stops,
                    band4Rate: spVsrEletricFields.band4Rate,
                    validityStartDate: spVsrEletricFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.spVsrEletricValidityEndDate = originalValue ?? '';
              break;
            case 'daf':
              updated.newDafBand1Stops = '';
              updated.newDafBand1Rate = '';
              updated.newDafBand2Stops = '';
              updated.newDafBand2Rate = '';
              updated.newDafValidityStartDate = '';
              updated.newDafValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const dafFields = originalCostModelFieldsRef.current.daf;
              if (dafFields) {
                if (dafFields.band1Stops !== undefined) updated.dafBand1Stops = dafFields.band1Stops;
                if (dafFields.band1Rate !== undefined) updated.dafBand1Rate = dafFields.band1Rate;
                if (dafFields.band2Stops !== undefined) updated.dafBand2Stops = dafFields.band2Stops;
                if (dafFields.band2Rate !== undefined) updated.dafBand2Rate = dafFields.band2Rate;
                if (dafFields.validityStartDate !== undefined) updated.dafValidityStartDate = dafFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(dafFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `daf_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].daf = {
                    band1Stops: dafFields.band1Stops,
                    band1Rate: dafFields.band1Rate,
                    band2Stops: dafFields.band2Stops,
                    band2Rate: dafFields.band2Rate,
                    validityStartDate: dafFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.dafValidityEndDate = originalValue ?? '';
              break;
            case 'dafEletric':
              updated.newDafEletricBand1Stops = '';
              updated.newDafEletricBand1Rate = '';
              updated.newDafEletricBand2Stops = '';
              updated.newDafEletricBand2Rate = '';
              updated.newDafEletricValidityStartDate = '';
              updated.newDafEletricValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const dafEletricFields = originalCostModelFieldsRef.current.dafEletric;
              if (dafEletricFields) {
                if (dafEletricFields.band1Stops !== undefined) updated.dafEletricBand1Stops = dafEletricFields.band1Stops;
                if (dafEletricFields.band1Rate !== undefined) updated.dafEletricBand1Rate = dafEletricFields.band1Rate;
                if (dafEletricFields.band2Stops !== undefined) updated.dafEletricBand2Stops = dafEletricFields.band2Stops;
                if (dafEletricFields.band2Rate !== undefined) updated.dafEletricBand2Rate = dafEletricFields.band2Rate;
                if (dafEletricFields.validityStartDate !== undefined) updated.dafEletricValidityStartDate = dafEletricFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(dafEletricFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `dafEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].dafEletric = {
                    band1Stops: dafEletricFields.band1Stops,
                    band1Rate: dafEletricFields.band1Rate,
                    band2Stops: dafEletricFields.band2Stops,
                    band2Rate: dafEletricFields.band2Rate,
                    validityStartDate: dafEletricFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.dafEletricValidityEndDate = originalValue ?? '';
              break;
            case 'fsr':
              updated.newFsrStopRate = '';
              updated.newFsrValidityStartDate = '';
              updated.newFsrValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const fsrFields = originalCostModelFieldsRef.current.fsr;
              if (fsrFields) {
                if (fsrFields.stopRate !== undefined) updated.fsrStopRate = fsrFields.stopRate;
                if (fsrFields.validityStartDate !== undefined) updated.fsrValidityStartDate = fsrFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(fsrFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `fsr_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].fsr = {
                    stopRate: fsrFields.stopRate,
                    validityStartDate: fsrFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.fsrValidityEndDate = originalValue ?? '';
              break;
            case 'fsrEletric':
              updated.newFsrEletricStopRate = '';
              updated.newFsrEletricValidityStartDate = '';
              updated.newFsrEletricValidityEndDate = '';
              const fsrEletricFields = originalCostModelFieldsRef.current.fsrEletric;
              if (fsrEletricFields) {
                if (fsrEletricFields.stopRate !== undefined) updated.fsrEletricStopRate = fsrEletricFields.stopRate;
                if (fsrEletricFields.validityStartDate !== undefined) updated.fsrEletricValidityStartDate = fsrEletricFields.validityStartDate;
                const dateKey = formatDateOnly(fsrEletricFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `fsrEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) userChangesByDateRef.current[changeKey] = {};
                  userChangesByDateRef.current[changeKey].fsrEletric = {
                    stopRate: fsrEletricFields.stopRate,
                    validityStartDate: fsrEletricFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.fsrEletricValidityEndDate = originalValue ?? '';
              break;
            case 'dr':
              updated.newDrDayRate = '';
              updated.newDrValidityStartDate = '';
              updated.newDrValidityEndDate = '';
              // Restore values that the user had changed before clicking +New
              const drFields = originalCostModelFieldsRef.current.dr;
              if (drFields) {
                if (drFields.dayRate !== undefined) updated.drDayRate = drFields.dayRate;
                if (drFields.validityStartDate !== undefined) updated.drValidityStartDate = drFields.validityStartDate;

                // Save changes in ref to preserve when selecting in the select
                const dateKey = formatDateOnly(drFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `dr_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) {
                    userChangesByDateRef.current[changeKey] = {};
                  }
                  userChangesByDateRef.current[changeKey].dr = {
                    dayRate: drFields.dayRate,
                    validityStartDate: drFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.drValidityEndDate = originalValue ?? '';
              break;
            case 'drEletric':
              updated.newDrEletricDayRate = '';
              updated.newDrEletricValidityStartDate = '';
              updated.newDrEletricValidityEndDate = '';
              const drEletricFields = originalCostModelFieldsRef.current.drEletric;
              if (drEletricFields) {
                if (drEletricFields.dayRate !== undefined) updated.drEletricDayRate = drEletricFields.dayRate;
                if (drEletricFields.validityStartDate !== undefined) updated.drEletricValidityStartDate = drEletricFields.validityStartDate;
                const dateKey = formatDateOnly(drEletricFields.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `drEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) userChangesByDateRef.current[changeKey] = {};
                  userChangesByDateRef.current[changeKey].drEletric = {
                    dayRate: drEletricFields.dayRate,
                    validityStartDate: drEletricFields.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.drEletricValidityEndDate = originalValue ?? '';
              break;
            case 'hourlyEletric':
              updated.newHourlyEletricRate = '';
              updated.newHourlyEletricValidityStartDate = '';
              updated.newHourlyEletricValidityEndDate = '';
              const hourlyEletricFieldsCancel = originalCostModelFieldsRef.current.hourlyEletric;
              if (hourlyEletricFieldsCancel) {
                if (hourlyEletricFieldsCancel.hourlyRate !== undefined) updated.hourlyEletricRate = hourlyEletricFieldsCancel.hourlyRate;
                if (hourlyEletricFieldsCancel.validityStartDate !== undefined) updated.hourlyEletricValidityStartDate = hourlyEletricFieldsCancel.validityStartDate;
                const dateKey = formatDateOnly(hourlyEletricFieldsCancel.validityStartDate || '');
                if (dateKey) {
                  const changeKey = `hourlyEletric_${dateKey}`;
                  if (!userChangesByDateRef.current[changeKey]) userChangesByDateRef.current[changeKey] = {};
                  userChangesByDateRef.current[changeKey].hourlyEletric = {
                    hourlyRate: hourlyEletricFieldsCancel.hourlyRate,
                    validityStartDate: hourlyEletricFieldsCancel.validityStartDate,
                    validityEndDate: originalValue ?? ''
                  };
                }
              }
              updated.hourlyEletricValidityEndDate = originalValue ?? '';
              break;
          }
          return updated;
        });

        // Clear saved values (both in state and ref)
        setOriginalValidityEndDates(prev => {
          const updated = { ...prev };
          delete updated[type];
          return updated;
        });
        delete originalValidityEndDatesRef.current[type];
        delete originalCostModelFieldsRef.current[type];
      } else {
        // If it's being shown, first select the oldest group (with oldest validityStartDate) in the previous select
        // and then fill with the current date and update the validityEndDate of the previous one

        // Helper function to find the newest group (with most recent validityStartDate)
        const findNewestGroup = (groups: Array<{ date: string; items: CostModelItem[] }>): { date: string; items: CostModelItem[] } | null => {
          if (groups.length === 0) return null;

          // Groups are sorted by date descending (most recent first)
          // So the first group is the newest
          // But let's ensure by explicitly finding the group with the most recent date
          let newestGroup: { date: string; items: CostModelItem[] } | null = null;
          let newestDate: Date | null = null;

          for (const group of groups) {
            const groupDate = new Date(group.date);
            if (!newestDate || groupDate > newestDate) {
              newestDate = groupDate;
              newestGroup = group;
            }
          }

          // If none found, return the first group (which should already be the newest)
          return newestGroup || groups[0];
        };

        // Select the newest group (with most recent validityStartDate)
        let closestGroup: { date: string; items: CostModelItem[] } | null = null;
        switch (type) {
          case 'vsr':
            closestGroup = findNewestGroup(groupedCostModels.vsr);
            break;
          case 'vsrEletric':
            closestGroup = findNewestGroup(groupedCostModels.vsrEletric);
            break;
          case 'daf':
            closestGroup = findNewestGroup(groupedCostModels.daf);
            break;
          case 'dafEletric':
            closestGroup = findNewestGroup(groupedCostModels.dafEletric);
            break;
          case 'fsr':
            closestGroup = findNewestGroup(groupedCostModels.fsr);
            break;
          case 'fsrEletric':
            closestGroup = findNewestGroup(groupedCostModels.fsrEletric);
            break;
          case 'dr':
            closestGroup = findNewestGroup(groupedCostModels.dr);
            break;
          case 'drEletric':
            closestGroup = findNewestGroup(groupedCostModels.drEletric);
            break;
          case 'hourlyEletric':
            closestGroup = findNewestGroup(groupedCostModels.hourlyEletric);
            break;
        }

        // Apply everything in a single update: select the newest + add new fields
        // BUT preserve changes already made by the user
        setFormData(currentFormData => {
          const updated = { ...currentFormData };

          // Save the original validityEndDate values before changing them
          const originalEndDates: Partial<typeof originalValidityEndDatesRef.current> = {};

          // First, select the newest group (with most recent validityStartDate) in the previous select
          // ALWAYS select the newest group when clicking +New
          if (closestGroup && closestGroup.items.length > 0) {
            const items = closestGroup.items;

            // Save the original validityEndDate before changing it
            switch (type) {
              case 'vsr':
                originalEndDates.vsr = currentFormData.vsrValidityEndDate ?? '';
                break;
              case 'vsrEletric':
                originalEndDates.vsrEletric = currentFormData.vsrEletricValidityEndDate ?? '';
                break;
              case 'spVsr':
                originalEndDates.spVsr = currentFormData.spVsrValidityEndDate ?? '';
                break;
              case 'spVsrEletric':
                originalEndDates.spVsrEletric = currentFormData.spVsrEletricValidityEndDate ?? '';
                break;
              case 'daf':
                originalEndDates.daf = currentFormData.dafValidityEndDate ?? '';
                break;
              case 'dafEletric':
                originalEndDates.dafEletric = currentFormData.dafEletricValidityEndDate ?? '';
                break;
              case 'fsr':
                originalEndDates.fsr = currentFormData.fsrValidityEndDate ?? '';
                break;
              case 'fsrEletric':
                originalEndDates.fsrEletric = currentFormData.fsrEletricValidityEndDate ?? '';
                break;
              case 'dr':
                originalEndDates.dr = currentFormData.drValidityEndDate ?? '';
                break;
              case 'drEletric':
                originalEndDates.drEletric = currentFormData.drEletricValidityEndDate ?? '';
                break;
              case 'hourlyEletric':
                originalEndDates.hourlyEletric = currentFormData.hourlyEletricValidityEndDate ?? '';
                break;
            }

            // Save the current values of bands/rates fields (which may have been changed by the user) before changing them
            const originalFields: Partial<typeof originalCostModelFieldsRef.current> = {};
            switch (type) {
              case 'vsr':
                originalFields.vsr = {
                  band1Stops: currentFormData.vsrBand1Stops ?? '',
                  band1Rate: currentFormData.vsrBand1Rate ?? '',
                  band2Stops: currentFormData.vsrBand2Stops ?? '',
                  band2Rate: currentFormData.vsrBand2Rate ?? '',
                  validityStartDate: currentFormData.vsrValidityStartDate ?? ''
                };
                break;
              case 'vsrEletric':
                originalFields.vsrEletric = {
                  band1Stops: currentFormData.vsrEletricBand1Stops ?? '',
                  band1Rate: currentFormData.vsrEletricBand1Rate ?? '',
                  band2Stops: currentFormData.vsrEletricBand2Stops ?? '',
                  band2Rate: currentFormData.vsrEletricBand2Rate ?? '',
                  validityStartDate: currentFormData.vsrEletricValidityStartDate ?? ''
                };
                break;
              case 'spVsr':
                originalFields.spVsr = {
                  band1Stops: currentFormData.spVsrBand1Stops ?? '',
                  band1Rate: currentFormData.spVsrBand1Rate ?? '',
                  band2Stops: currentFormData.spVsrBand2Stops ?? '',
                  band2Rate: currentFormData.spVsrBand2Rate ?? '',
                  band3Stops: currentFormData.spVsrBand3Stops ?? '',
                  band3Rate: currentFormData.spVsrBand3Rate ?? '',
                  band4Stops: currentFormData.spVsrBand4Stops ?? '',
                  band4Rate: currentFormData.spVsrBand4Rate ?? '',
                  validityStartDate: currentFormData.spVsrValidityStartDate ?? ''
                };
                break;
              case 'spVsrEletric':
                originalFields.spVsrEletric = {
                  band1Stops: currentFormData.spVsrEletricBand1Stops ?? '',
                  band1Rate: currentFormData.spVsrEletricBand1Rate ?? '',
                  band2Stops: currentFormData.spVsrEletricBand2Stops ?? '',
                  band2Rate: currentFormData.spVsrEletricBand2Rate ?? '',
                  band3Stops: currentFormData.spVsrEletricBand3Stops ?? '',
                  band3Rate: currentFormData.spVsrEletricBand3Rate ?? '',
                  band4Stops: currentFormData.spVsrEletricBand4Stops ?? '',
                  band4Rate: currentFormData.spVsrEletricBand4Rate ?? '',
                  validityStartDate: currentFormData.spVsrEletricValidityStartDate ?? ''
                };
                break;
              case 'daf':
                originalFields.daf = {
                  band1Stops: currentFormData.dafBand1Stops ?? '',
                  band1Rate: currentFormData.dafBand1Rate ?? '',
                  band2Stops: currentFormData.dafBand2Stops ?? '',
                  band2Rate: currentFormData.dafBand2Rate ?? '',
                  validityStartDate: currentFormData.dafValidityStartDate ?? ''
                };
                break;
              case 'dafEletric':
                originalFields.dafEletric = {
                  band1Stops: currentFormData.dafEletricBand1Stops ?? '',
                  band1Rate: currentFormData.dafEletricBand1Rate ?? '',
                  band2Stops: currentFormData.dafEletricBand2Stops ?? '',
                  band2Rate: currentFormData.dafEletricBand2Rate ?? '',
                  validityStartDate: currentFormData.dafEletricValidityStartDate ?? ''
                };
                break;
              case 'fsr':
                originalFields.fsr = {
                  stopRate: currentFormData.fsrStopRate ?? '',
                  validityStartDate: currentFormData.fsrValidityStartDate ?? ''
                };
                break;
              case 'fsrEletric':
                originalFields.fsrEletric = {
                  stopRate: currentFormData.fsrEletricStopRate ?? '',
                  validityStartDate: currentFormData.fsrEletricValidityStartDate ?? ''
                };
                break;
              case 'dr':
                originalFields.dr = {
                  dayRate: currentFormData.drDayRate ?? '',
                  validityStartDate: currentFormData.drValidityStartDate ?? ''
                };
                break;
              case 'drEletric':
                originalFields.drEletric = {
                  dayRate: currentFormData.drEletricDayRate ?? '',
                  validityStartDate: currentFormData.drEletricValidityStartDate ?? ''
                };
                break;
              case 'hourlyEletric':
                originalFields.hourlyEletric = {
                  hourlyRate: currentFormData.hourlyEletricRate ?? '',
                  validityStartDate: currentFormData.hourlyEletricValidityStartDate ?? ''
                };
                break;
            }

            // Save the current values (which may have been changed by the user) to restore when clicking Cancel
            Object.assign(originalValidityEndDatesRef.current, originalEndDates);
            setOriginalValidityEndDates(prev => ({ ...prev, ...originalEndDates }));
            Object.assign(originalCostModelFieldsRef.current, originalFields);

            const today = getTodayDateString();

            switch (type) {
              case 'vsr':
                // Check if the current validityStartDate corresponds to the newest group
                const currentVsrDate = currentFormData.vsrValidityStartDate ? formatDateOnly(currentFormData.vsrValidityStartDate) : '';
                const newestVsrDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestVsr = !currentVsrDate;

                // Apenas atualizar os campos de bands se o usuário estava editando um grupo diferente
                if (shouldSelectNewestVsr) {
                  const vsrFirstBand = items.find(cm => cm.minStops === 1 || !cm.minStops) || items[0];
                  const vsrSecondBand = items.find(cm => cm.minStops !== 1 && cm.minStops) || (items.length > 1 ? items[1] : null);
                  if (vsrFirstBand) {
                    updated.vsrBand1Stops = vsrFirstBand.maxStops ? String(vsrFirstBand.maxStops) : '';
                    updated.vsrBand1Rate = vsrFirstBand.pricePerStop ? String(vsrFirstBand.pricePerStop) : '';
                  }
                  if (vsrSecondBand) {
                    updated.vsrBand2Stops = vsrSecondBand.maxStops ? String(vsrSecondBand.maxStops) : '';
                    updated.vsrBand2Rate = vsrSecondBand.pricePerStop ? String(vsrSecondBand.pricePerStop) : '';
                  }
                }
                if (shouldSelectNewestVsr) {
                  updated.vsrValidityStartDate = newestVsrDate;
                }
                // New cost model should start from current date by default
                updated.newVsrValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.vsrValidityEndDate = updated.newVsrValidityStartDate ? subtractOneDay(updated.newVsrValidityStartDate) : '';
                break;
              case 'vsrEletric':
                // Check if the current validityStartDate corresponds to the newest group
                const currentVsrEletricDate = currentFormData.vsrEletricValidityStartDate ? formatDateOnly(currentFormData.vsrEletricValidityStartDate) : '';
                const newestVsrEletricDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestVsrEletric = !currentVsrEletricDate;

                // Apenas atualizar os campos de bands se o usuário estava editando um grupo diferente
                if (shouldSelectNewestVsrEletric) {
                  const vsrEletricFirstBand = items.find(cm => cm.minStops === 1 || !cm.minStops) || items[0];
                  const vsrEletricSecondBand = items.find(cm => cm.minStops !== 1 && cm.minStops) || (items.length > 1 ? items[1] : null);
                  if (vsrEletricFirstBand) {
                    updated.vsrEletricBand1Stops = vsrEletricFirstBand.maxStops ? String(vsrEletricFirstBand.maxStops) : '';
                    updated.vsrEletricBand1Rate = vsrEletricFirstBand.pricePerStop ? String(vsrEletricFirstBand.pricePerStop) : '';
                  }
                  if (vsrEletricSecondBand) {
                    updated.vsrEletricBand2Stops = vsrEletricSecondBand.maxStops ? String(vsrEletricSecondBand.maxStops) : '';
                    updated.vsrEletricBand2Rate = vsrEletricSecondBand.pricePerStop ? String(vsrEletricSecondBand.pricePerStop) : '';
                  }
                }
                if (shouldSelectNewestVsrEletric) {
                  updated.vsrEletricValidityStartDate = newestVsrEletricDate;
                }
                // New cost model should start from current date by default
                updated.newVsrEletricValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.vsrEletricValidityEndDate = updated.newVsrEletricValidityStartDate ? subtractOneDay(updated.newVsrEletricValidityStartDate) : '';
                break;
              case 'daf':
                // Check if the current validityStartDate corresponds to the newest group
                const currentDafDate = currentFormData.dafValidityStartDate ? formatDateOnly(currentFormData.dafValidityStartDate) : '';
                const newestDafDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestDaf = !currentDafDate;

                // Apenas atualizar os campos de bands se o usuário estava editando um grupo diferente
                if (shouldSelectNewestDaf) {
                  const dafFirstBand = items.find(cm => Number(cm.minStops ?? 1) <= 1) || items[0];
                  const dafSecondBand = items.find(cm => Number(cm.minStops ?? 0) > 1) || (items.length > 1 ? items[1] : null);
                  if (dafFirstBand) {
                    updated.dafBand1Stops = dafFirstBand.maxStops ? String(dafFirstBand.maxStops) : '';
                    updated.dafBand1Rate = dafFirstBand.fixedPrice ? String(dafFirstBand.fixedPrice) : (dafFirstBand.pricePerStop ? String(dafFirstBand.pricePerStop) : '');
                  }
                  if (dafSecondBand) {
                    updated.dafBand2Stops = dafSecondBand.maxStops ? String(dafSecondBand.maxStops) : '';
                    updated.dafBand2Rate = dafSecondBand.pricePerStop ? String(dafSecondBand.pricePerStop) : '';
                  }
                }
                if (shouldSelectNewestDaf) {
                  updated.dafValidityStartDate = newestDafDate;
                }
                // New cost model should start from current date by default
                updated.newDafValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.dafValidityEndDate = updated.newDafValidityStartDate ? subtractOneDay(updated.newDafValidityStartDate) : '';
                break;
              case 'dafEletric':
                // Check if the current validityStartDate corresponds to the newest group
                const currentDafEletricDate = currentFormData.dafEletricValidityStartDate ? formatDateOnly(currentFormData.dafEletricValidityStartDate) : '';
                const newestDafEletricDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestDafEletric = !currentDafEletricDate;

                // Apenas atualizar os campos de bands se o usuário estava editando um grupo diferente
                if (shouldSelectNewestDafEletric) {
                  const dafEletricFirstBand = items.find(cm => Number(cm.minStops ?? 1) <= 1) || items[0];
                  const dafEletricSecondBand = items.find(cm => Number(cm.minStops ?? 0) > 1) || (items.length > 1 ? items[1] : null);
                  if (dafEletricFirstBand) {
                    updated.dafEletricBand1Stops = dafEletricFirstBand.maxStops ? String(dafEletricFirstBand.maxStops) : '';
                    updated.dafEletricBand1Rate = dafEletricFirstBand.fixedPrice ? String(dafEletricFirstBand.fixedPrice) : (dafEletricFirstBand.pricePerStop ? String(dafEletricFirstBand.pricePerStop) : '');
                  }
                  if (dafEletricSecondBand) {
                    updated.dafEletricBand2Stops = dafEletricSecondBand.maxStops ? String(dafEletricSecondBand.maxStops) : '';
                    updated.dafEletricBand2Rate = dafEletricSecondBand.pricePerStop ? String(dafEletricSecondBand.pricePerStop) : '';
                  }
                }
                if (shouldSelectNewestDafEletric) {
                  updated.dafEletricValidityStartDate = newestDafEletricDate;
                }
                // New cost model should start from current date by default
                updated.newDafEletricValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.dafEletricValidityEndDate = updated.newDafEletricValidityStartDate ? subtractOneDay(updated.newDafEletricValidityStartDate) : '';
                break;
              case 'fsr':
                // Check if the current validityStartDate corresponds to the newest group
                const currentFsrDate = currentFormData.fsrValidityStartDate ? formatDateOnly(currentFormData.fsrValidityStartDate) : '';
                const newestFsrDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestFsr = !currentFsrDate;

                // Apenas atualizar o campo de rate se o usuário estava editando um grupo diferente
                if (shouldSelectNewestFsr) {
                  const fsrModel = items[0];
                  updated.fsrStopRate = fsrModel.fixedPrice ? String(fsrModel.fixedPrice) : (fsrModel.pricePerStop ? String(fsrModel.pricePerStop) : '');
                }
                if (shouldSelectNewestFsr) {
                  updated.fsrValidityStartDate = newestFsrDate;
                }
                // New cost model should start from current date by default
                updated.newFsrValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.fsrValidityEndDate = updated.newFsrValidityStartDate ? subtractOneDay(updated.newFsrValidityStartDate) : '';
                break;
              case 'dr':
                // Check if the current validityStartDate corresponds to the newest group
                const currentDrDate = currentFormData.drValidityStartDate ? formatDateOnly(currentFormData.drValidityStartDate) : '';
                const newestDrDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestDr = !currentDrDate;

                // Apenas atualizar o campo de rate se o usuário estava editando um grupo diferente
                if (shouldSelectNewestDr) {
                  const drModel = items[0];
                  updated.drDayRate = drModel.fixedPrice ? String(drModel.fixedPrice) : '';
                }
                if (shouldSelectNewestDr) {
                  updated.drValidityStartDate = newestDrDate;
                }
                // New cost model should start from current date by default
                updated.newDrValidityStartDate = today;
                // Calcular o validityEndDate do cost model antigo como newValidityStartDate - 1
                updated.drValidityEndDate = updated.newDrValidityStartDate ? subtractOneDay(updated.newDrValidityStartDate) : '';
                break;
              case 'fsrEletric': {
                const currentFsrEletricDate = currentFormData.fsrEletricValidityStartDate ? formatDateOnly(currentFormData.fsrEletricValidityStartDate) : '';
                const newestFsrEletricDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestFsrEletric = !currentFsrEletricDate;
                if (shouldSelectNewestFsrEletric) {
                  const m = items[0];
                  updated.fsrEletricStopRate = m.fixedPrice ? String(m.fixedPrice) : (m.pricePerStop ? String(m.pricePerStop) : '');
                }
                if (shouldSelectNewestFsrEletric) {
                  updated.fsrEletricValidityStartDate = newestFsrEletricDate;
                }
                updated.newFsrEletricValidityStartDate = today;
                updated.fsrEletricValidityEndDate = updated.newFsrEletricValidityStartDate ? subtractOneDay(updated.newFsrEletricValidityStartDate) : '';
                break;
              }
              case 'drEletric': {
                const currentDrEletricDate = currentFormData.drEletricValidityStartDate ? formatDateOnly(currentFormData.drEletricValidityStartDate) : '';
                const newestDrEletricDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestDrEletric = !currentDrEletricDate;
                if (shouldSelectNewestDrEletric) {
                  const m = items[0];
                  updated.drEletricDayRate = m.fixedPrice ? String(m.fixedPrice) : '';
                }
                if (shouldSelectNewestDrEletric) {
                  updated.drEletricValidityStartDate = newestDrEletricDate;
                }
                updated.newDrEletricValidityStartDate = today;
                updated.drEletricValidityEndDate = updated.newDrEletricValidityStartDate ? subtractOneDay(updated.newDrEletricValidityStartDate) : '';
                break;
              }
              case 'hourlyEletric': {
                const currentHourlyEletricDate = currentFormData.hourlyEletricValidityStartDate ? formatDateOnly(currentFormData.hourlyEletricValidityStartDate) : '';
                const newestHourlyEletricDate = closestGroup ? formatDateOnly(closestGroup.date) || '' : '';
                const shouldSelectNewestHourlyEletric = !currentHourlyEletricDate;
                if (shouldSelectNewestHourlyEletric) {
                  const m = items[0];
                  updated.hourlyEletricRate = m.pricePerStop ? String(m.pricePerStop) : '';
                }
                if (shouldSelectNewestHourlyEletric) {
                  updated.hourlyEletricValidityStartDate = newestHourlyEletricDate;
                }
                updated.newHourlyEletricValidityStartDate = today;
                updated.hourlyEletricValidityEndDate = updated.newHourlyEletricValidityStartDate ? subtractOneDay(updated.newHourlyEletricValidityStartDate) : '';
                break;
              }
            }

            // Save original values (both in state and ref to avoid closure issues)
            setOriginalValidityEndDates(prev => ({
              ...prev,
              ...originalEndDates
            }));
            // Atualizar a ref também para garantir acesso sempre atualizado
            Object.assign(originalValidityEndDatesRef.current, originalEndDates);
          } else {
            // If there are no cost models, just add the new fields
            switch (type) {
              case 'vsr':
                updated.newVsrValidityStartDate = '';
                break;
              case 'vsrEletric':
                updated.newVsrEletricValidityStartDate = '';
                break;
              case 'daf':
                updated.newDafValidityStartDate = '';
                break;
              case 'dafEletric':
                updated.newDafEletricValidityStartDate = '';
                break;
              case 'fsr':
                updated.newFsrValidityStartDate = '';
                break;
              case 'fsrEletric':
                updated.newFsrEletricValidityStartDate = '';
                break;
              case 'dr':
                updated.newDrValidityStartDate = '';
                break;
              case 'drEletric':
                updated.newDrEletricValidityStartDate = '';
                break;
              case 'hourlyEletric':
                updated.newHourlyEletricValidityStartDate = '';
                break;
            }
          }

          return updated;
        });
      }

      return {
        ...prev,
        [type]: !isCurrentlyVisible,
      };
    });
  };

  // Helper function to check if two date periods overlap
  const hasDateOverlap = (
    start1: string | undefined,
    end1: string | undefined,
    start2: string | undefined,
    end2: string | undefined
  ): boolean => {
    if (!start1 || !start2) return false;

    const start1Date = new Date(formatDateOnly(start1) || '');
    const start2Date = new Date(formatDateOnly(start2) || '');
    start1Date.setHours(0, 0, 0, 0);
    start2Date.setHours(0, 0, 0, 0);

    // If there is no end date, consider it valid indefinitely (infinite future)
    let end1Date: Date | null = null;
    let end2Date: Date | null = null;

    if (end1) {
      end1Date = new Date(formatDateOnly(end1) || '');
      end1Date.setHours(0, 0, 0, 0);
    }

    if (end2) {
      end2Date = new Date(formatDateOnly(end2) || '');
      end2Date.setHours(0, 0, 0, 0);
    }

    // Two periods overlap if: start1 <= end2 && start2 <= end1
    // If a period has no end date, it is valid indefinitely
    const end1Effective = end1Date || new Date('9999-12-31');
    const end2Effective = end2Date || new Date('9999-12-31');

    return start1Date <= end2Effective && start2Date <= end1Effective;
  };

  // Helper function to check if a cost model with the same validityStartDate already exists
  // Function to check if there is date period overlap
  const hasOverlappingDateRange = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    newStartDate: string,
    newEndDate: string | null | undefined
  ): { hasOverlap: boolean; overlappingGroup?: { startDate: string; endDate: string | null } } => {
    if (!newStartDate) {
      return { hasOverlap: false };
    }

    const currentVendor = localVendor || vendor;
    if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) {
      return { hasOverlap: false };
    }

    const formattedNewStartDate = formatDateOnly(newStartDate);
    if (!formattedNewStartDate) return { hasOverlap: false };

    // If there is no end date, consider it as indefinite period (only check start date)
    const formattedNewEndDate = newEndDate ? formatDateOnly(newEndDate) : null;

    const costModels = currentVendor.originalCostModels as CostModelItem[];

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Filter cost models of the same type
    const sameTypeModels = costModels.filter(cm => {
      let matchesType = false;
      if (isElectric === true) {
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }
      return matchesType && cm.validityStartDate;
    });

    // Agrupar por validityStartDate (grupos)
    const groupedByStartDate = new Map<string, CostModelItem[]>();
    sameTypeModels.forEach(cm => {
      const formattedDate = formatDateOnly(cm.validityStartDate!);
      if (formattedDate) {
        if (!groupedByStartDate.has(formattedDate)) {
          groupedByStartDate.set(formattedDate, []);
        }
        groupedByStartDate.get(formattedDate)!.push(cm);
      }
    });

    // Convert to array and check each group
    const groups = Array.from(groupedByStartDate.entries());

    for (const [groupStartDate, groupItems] of groups) {
      const formattedGroupStartDate = formatDateOnly(groupStartDate);
      if (!formattedGroupStartDate) continue;

      // Find the end date of the group (use the end date of the first item that has it)
      const groupEndDate = groupItems.find(item => item.validityEndDate)?.validityEndDate || null;
      const formattedGroupEndDate = groupEndDate ? formatDateOnly(groupEndDate) : null;

      // Verificar sobreposição de intervalos
      // Dois intervalos se sobrepõem se:
      // newStartDate <= groupEndDate AND newEndDate >= groupStartDate
      // (considerando null como infinito)

      const newStart = new Date(formattedNewStartDate);
      const newEnd = formattedNewEndDate ? new Date(formattedNewEndDate) : null;
      const groupStart = new Date(formattedGroupStartDate);
      const groupEnd = formattedGroupEndDate ? new Date(formattedGroupEndDate) : null;

      // Verificar sobreposição
      let overlaps = false;

      if (groupEnd === null && newEnd === null) {
        // Ambos são infinitos, sobrepõem se têm a mesma start date
        overlaps = formattedNewStartDate === formattedGroupStartDate;
      } else if (groupEnd === null) {
        // Grupo é infinito, sobrepõe se newEnd >= groupStart
        overlaps = newEnd! >= groupStart;
      } else if (newEnd === null) {
        // New is infinite, overlaps if newStart <= groupEnd
        overlaps = newStart <= groupEnd;
      } else {
        // Both have end date, use the standard formula
        overlaps = newStart <= groupEnd && newEnd >= groupStart;
      }

      if (overlaps) {
        return {
          hasOverlap: true,
          overlappingGroup: {
            startDate: formattedGroupStartDate,
            endDate: formattedGroupEndDate
          }
        };
      }
    }

    return { hasOverlap: false };
  };

  const hasDuplicateValidityStartDate = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    validityStartDate: string
  ): boolean => {
    // Usar localVendor se disponível (já atualizado após deleções), senão usar vendor
    const currentVendor = localVendor || vendor;
    if (!validityStartDate || !currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) {
      return false;
    }

    const formattedDate = formatDateOnly(validityStartDate);
    if (!formattedDate) return false;

    const costModels = currentVendor.originalCostModels as CostModelItem[];

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'spVsr':
        costModelId = 12;
        isElectric = false;
        break;
      case 'spVsrEletric':
        costModelId = 12;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Check if there is any cost model with the same validityStartDate, costModelId and isElectric
    return costModels.some(cm => {
      const cmFormattedDate = formatDateOnly(cm.validityStartDate);

      // Check if it's the same type
      let matchesType = false;
      if (isElectric === true) {
        // Electric type: must be exactly true
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        // Non-electric type: can be false or null
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }

      return matchesType && cmFormattedDate === formattedDate;
    });
  };

  // Helper function to check if there is a date conflict (overlap) with existing cost models
  // Disabled function - date conflict validation disabled
  const hasDateConflict = (
    type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    validityStartDate: string | undefined,
    validityEndDate: string | undefined,
    excludeModelEmployeesIds?: number[] // IDs to exclude from check (useful when editing)
  ): boolean => {
    if (!validityStartDate) return false;

    // Usar localVendor se disponível, senão usar vendor
    const currentVendor = localVendor || vendor;
    if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) {
      return false;
    }

    const costModels = currentVendor.originalCostModels as CostModelItem[];

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Check if there is overlap with any existing cost model of the same type
    return costModels.some(cm => {
      // Exclude cost models that are being edited
      if (excludeModelEmployeesIds && cm.modelEmployeesId && excludeModelEmployeesIds.includes(cm.modelEmployeesId)) {
        return false;
      }

      // Check if it's the same type
      // For electric types (isElectric === true), must match exactly: cm.isElectric === true
      // For non-electric types (isElectric === false), can be false or null
      let matchesType = false;
      if (isElectric === true) {
        // Electric type: must be exactly true
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        // Non-electric type: can be false or null
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }

      if (!matchesType || !cm.validityStartDate) return false;

      // If the existing cost model has validityEndDate null (valid indefinitely)
      // and the new cost model starts AFTER it, there is no conflict because the existing one will be closed
      if (!cm.validityEndDate && validityStartDate) {
        const existingStartDate = new Date(formatDateOnly(cm.validityStartDate) || '');
        const newStartDate = new Date(formatDateOnly(validityStartDate) || '');
        existingStartDate.setHours(0, 0, 0, 0);
        newStartDate.setHours(0, 0, 0, 0);

        // Se o novo começa depois do existente, o existente será fechado, então não há conflito
        if (newStartDate > existingStartDate) {
          return false;
        }

        // Se o novo começa antes ou no mesmo dia, há conflito
        if (newStartDate <= existingStartDate) {
          return true;
        }
      }

      // Check date overlap for normal cases
      return hasDateOverlap(
        validityStartDate,
        validityEndDate,
        cm.validityStartDate,
        cm.validityEndDate
      );
    });
  };

  // Handler for when newValidityStartDate changes
  // Function to update existing groups when a new cost model is created with a smaller start date
  const updateExistingGroupsForNewCostModel = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    newStartDate: string,
    newEndDate: string | null
  ): void => {
    if (!newStartDate) return;

    const currentVendor = localVendor || vendor;
    if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) return;

    const costModels = currentVendor.originalCostModels as CostModelItem[];
    const formattedNewStartDate = formatDateOnly(newStartDate);
    if (!formattedNewStartDate) return;

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Filter cost models of the same type
    const sameTypeModels = costModels.filter(cm => {
      let matchesType = false;
      if (isElectric === true) {
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }
      return matchesType && cm.validityStartDate;
    });

    // Agrupar por validityStartDate
    const groupedByStartDate = new Map<string, CostModelItem[]>();
    sameTypeModels.forEach(cm => {
      const formattedDate = formatDateOnly(cm.validityStartDate!);
      if (formattedDate) {
        if (!groupedByStartDate.has(formattedDate)) {
          groupedByStartDate.set(formattedDate, []);
        }
        groupedByStartDate.get(formattedDate)!.push(cm);
      }
    });

    // Convert to array and sort by date (ascending)
    const sortedGroups = Array.from(groupedByStartDate.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      });

    // Encontrar grupos que têm startDate maior ou igual Ã  nova startDate
    const groupsToUpdate = sortedGroups.filter(([date]) => {
      const groupStartDate = new Date(date);
      const newStartDateObj = new Date(formattedNewStartDate);
      return groupStartDate >= newStartDateObj;
    });

    if (groupsToUpdate.length === 0) return;

    // Se não temos o newEndDate ainda, usar o end date do grupo anterior (se existir)
    // Ou calcular como newStartDate + 1 dia se não houver grupo anterior
    const previousGroup = sortedGroups.find(([date]) => {
      const groupStartDate = new Date(date);
      const newStartDateObj = new Date(formattedNewStartDate);
      return groupStartDate < newStartDateObj;
    });

    let referenceEndDate: string;
    if (newEndDate) {
      referenceEndDate = formatDateOnly(newEndDate) || formattedNewStartDate;
    } else if (previousGroup) {
      // Usar o end date do grupo anterior, ou calcular como newStartDate + 1 dia
      const prevGroupEndDate = previousGroup[1].find(item => item.validityEndDate)?.validityEndDate;
      if (prevGroupEndDate) {
        referenceEndDate = formatDateOnly(prevGroupEndDate) || subtractOneDay(formattedNewStartDate);
      } else {
        referenceEndDate = subtractOneDay(formattedNewStartDate);
      }
    } else {
      // Não há grupo anterior, usar newStartDate - 1 como referência
      referenceEndDate = subtractOneDay(formattedNewStartDate);
    }

    // Atualizar o validityEndDate do grupo anterior (se existir) para newStartDate - 1
    const previousGroupEndDateUpdates: Array<{ modelEmployeesId: number; newEndDate: string }> = [];
    if (previousGroup) {
      const prevEndDate = subtractOneDay(formattedNewStartDate);
      previousGroup[1].forEach(item => {
        if (item.modelEmployeesId) {
          previousGroupEndDateUpdates.push({
            modelEmployeesId: item.modelEmployeesId,
            newEndDate: prevEndDate
          });
        }
      });
    }

    // Coletar updates para os grupos que precisam ser deslocados
    const startDateUpdates: Array<{ modelEmployeesId: number; newStartDate: string }> = [];
    const endDateUpdates: Array<{ modelEmployeesId: number; newEndDate: string }> = [];

    let previousEndDate = referenceEndDate;

    // Processar cada grupo que precisa ser deslocado
    for (const [originalGroupStartDate, groupItems] of groupsToUpdate) {
      const formattedOriginalGroupStartDate = formatDateOnly(originalGroupStartDate);
      if (!formattedOriginalGroupStartDate) continue;

      // Calculate the new startDate: previous group's endDate + 1 day
      const calculatedStartDate = addOneDay(previousEndDate);

      // If calculated dates are different from current ones, update all items in this group
      if (originalGroupStartDate !== calculatedStartDate) {
        groupItems.forEach(item => {
          if (item.modelEmployeesId) {
            startDateUpdates.push({
              modelEmployeesId: item.modelEmployeesId,
              newStartDate: calculatedStartDate
            });
          }
        });
      }

      // Encontrar o endDate original do grupo
      const originalGroupEndDate = groupItems.find(item => item.validityEndDate)?.validityEndDate;

      if (originalGroupEndDate) {
        // Grupo tem endDate: calcular duração e atualizar endDate
        const formattedOriginalGroupEndDate = formatDateOnly(originalGroupEndDate);

        if (formattedOriginalGroupEndDate) {
          // Calcular a duração em dias
          let tempDate = formattedOriginalGroupStartDate;
          let durationInDays = 0;
          while (tempDate < formattedOriginalGroupEndDate) {
            tempDate = addOneDay(tempDate);
            durationInDays++;
          }

          // Calculate the new endDate: new startDate + original duration
          let calculatedEndDate = calculatedStartDate;
          for (let j = 0; j < durationInDays; j++) {
            calculatedEndDate = addOneDay(calculatedEndDate);
          }

          // Atualizar endDate de todos os items do grupo que têm endDate
          groupItems.forEach(item => {
            if (item.modelEmployeesId && item.validityEndDate) {
              const currentEndDate = formatDateOnly(item.validityEndDate);
              if (currentEndDate !== calculatedEndDate) {
                endDateUpdates.push({
                  modelEmployeesId: item.modelEmployeesId,
                  newEndDate: calculatedEndDate
                });
              }
            }
          });

          // Atualizar previousEndDate para o próximo grupo
          previousEndDate = calculatedEndDate;
        }
      } else {
        // Grupo não tem endDate (indefinido no futuro): apenas atualizar startDate e parar
        break;
      }
    }

    // Apply all updates at once
    if (startDateUpdates.length > 0 || endDateUpdates.length > 0 || previousGroupEndDateUpdates.length > 0) {
      setLocalVendor(prev => {
        if (!prev || !prev.originalCostModels || !Array.isArray(prev.originalCostModels)) return prev;

        const updatedCostModels = prev.originalCostModels.map(cm => {
          const startUpdate = startDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);
          const endUpdate = endDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);
          const prevGroupEndUpdate = previousGroupEndDateUpdates.find(u => u.modelEmployeesId === cm.modelEmployeesId);

          if (startUpdate || endUpdate || prevGroupEndUpdate) {
            return {
              ...cm,
              ...(startUpdate && { validityStartDate: startUpdate.newStartDate }),
              ...(endUpdate && { validityEndDate: endUpdate.newEndDate }),
              ...(prevGroupEndUpdate && { validityEndDate: prevGroupEndUpdate.newEndDate })
            };
          }
          return cm;
        });

        return {
          ...prev,
          originalCostModels: updatedCostModels
        };
      });
    }
  };

  const handleNewValidityStartDateChange = (
    type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric',
    newStartDate: string
  ) => {
    // Validar se já existe um cost model com essa validityStartDate
    if (newStartDate && hasDuplicateValidityStartDate(type, newStartDate)) {
      const typeNames: Record<string, string> = {
        vsr: 'VSR',
        vsrEletric: 'VSR Electric',
        spVsr: 'SP VSR',
        spVsrEletric: 'SP VSR Electric',
        daf: 'DAF',
        dafEletric: 'DAF Electric',
        fsr: 'FSR',
        fsrEletric: 'FSR Electric',
        dr: 'DR',
        drEletric: 'DR Electric',
        hourlyEletric: 'Hourly Electric',
      };
      showError(
        'Duplicate Cost Model',
        `A cost model of type ${typeNames[type] || type.toUpperCase()} with start date ${formatDateForDisplay(newStartDate)} already exists. Please choose another date.`
      );
      return;
    }

    setFormData(prev => {
      const updated = { ...prev } as Vendor & Record<string, unknown>;
      const previousEndDate = subtractOneDay(newStartDate);

      // Get the current end date of the new cost model (if already defined)
      let currentNewEndDate: string | null = null;
      switch (type) {
        case 'vsr':
          currentNewEndDate = updated.newVsrValidityEndDate || null;
          updated.newVsrValidityStartDate = newStartDate;
          updated.vsrValidityEndDate = previousEndDate;
          break;
        case 'vsrEletric':
          currentNewEndDate = updated.newVsrEletricValidityEndDate || null;
          updated.newVsrEletricValidityStartDate = newStartDate;
          updated.vsrEletricValidityEndDate = previousEndDate;
          break;
        case 'spVsr':
          currentNewEndDate = updated.newSpVsrValidityEndDate || null;
          updated.newSpVsrValidityStartDate = newStartDate;
          updated.spVsrValidityEndDate = previousEndDate;
          break;
        case 'spVsrEletric':
          currentNewEndDate = updated.newSpVsrEletricValidityEndDate || null;
          updated.newSpVsrEletricValidityStartDate = newStartDate;
          updated.spVsrEletricValidityEndDate = previousEndDate;
          break;
        case 'daf':
          currentNewEndDate = updated.newDafValidityEndDate || null;
          updated.newDafValidityStartDate = newStartDate;
          updated.dafValidityEndDate = previousEndDate;
          break;
        case 'dafEletric':
          currentNewEndDate = updated.newDafEletricValidityEndDate || null;
          updated.newDafEletricValidityStartDate = newStartDate;
          updated.dafEletricValidityEndDate = previousEndDate;
          break;
        case 'fsr':
          currentNewEndDate = updated.newFsrValidityEndDate || null;
          updated.newFsrValidityStartDate = newStartDate;
          updated.fsrValidityEndDate = previousEndDate;
          break;
        case 'fsrEletric':
          currentNewEndDate = updated.newFsrEletricValidityEndDate || null;
          updated.newFsrEletricValidityStartDate = newStartDate;
          updated.fsrEletricValidityEndDate = previousEndDate;
          break;
        case 'dr':
          currentNewEndDate = updated.newDrValidityEndDate || null;
          updated.newDrValidityStartDate = newStartDate;
          updated.drValidityEndDate = previousEndDate;
          break;
        case 'drEletric':
          currentNewEndDate = updated.newDrEletricValidityEndDate || null;
          updated.newDrEletricValidityStartDate = newStartDate;
          updated.drEletricValidityEndDate = previousEndDate;
          break;
        case 'hourlyEletric':
          currentNewEndDate = updated.newHourlyEletricValidityEndDate || null;
          updated.newHourlyEletricValidityStartDate = newStartDate;
          updated.hourlyEletricValidityEndDate = previousEndDate;
          break;
      }

      // Validar sobreposição de períodos
      const typeNamesMap: Record<string, string> = {
        vsr: 'VSR',
        vsrEletric: 'VSR Electric',
        spVsr: 'SP VSR',
        spVsrEletric: 'SP VSR Electric',
        daf: 'DAF',
        dafEletric: 'DAF Electric',
        fsr: 'FSR',
        fsrEletric: 'FSR Electric',
        dr: 'DR',
        drEletric: 'DR Electric',
        hourlyEletric: 'Hourly Electric',
      };

      if (newStartDate) {
        const overlapCheck = hasOverlappingDateRange(type, newStartDate, currentNewEndDate);
        if (overlapCheck.hasOverlap) {
          const overlappingPeriod = overlapCheck.overlappingGroup;
          const periodStr = overlappingPeriod?.endDate
            ? `${formatDateForDisplay(overlappingPeriod.startDate)} to ${formatDateForDisplay(overlappingPeriod.endDate)}`
            : `starting from ${formatDateForDisplay(overlappingPeriod!.startDate)}`;

          showError(
            'Overlapping Date Range',
            `The date range for the new ${typeNamesMap[type] || type.toUpperCase()} cost model overlaps with an existing cost model (${periodStr}). Please choose a different date range.`
          );
          // Reverter a mudança
          return prev;
        }
      }

      // Update existing groups in cascade
      updateExistingGroupsForNewCostModel(type, newStartDate, currentNewEndDate);

      return updated;
    });
  };

  // Helper function to check if a cost model is valid on the current date
  const isValidForCurrentDate = useMemo(() => {
    // Get current date without time
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (item: CostModelItem): boolean => {
      if (!item.validityStartDate) return false;

      const startDate = new Date(formatDateOnly(item.validityStartDate) || '');
      startDate.setHours(0, 0, 0, 0);

      // Se validityStartDate é futura, não está válido
      if (startDate > currentDate) return false;

      // If there is no validityEndDate, it's valid (no end date)
      if (!item.validityEndDate) return true;

      // Verificar se current_date está entre start e end
      const endDate = new Date(formatDateOnly(item.validityEndDate) || '');
      endDate.setHours(0, 0, 0, 0);

      return currentDate >= startDate && currentDate <= endDate;
    };
  }, []);

  // Group vendor costModels by type and validityStartDate (only in edit mode)
  const groupedCostModels = useMemo(() => {
    // Usar localVendor se disponível, senão usar vendor
    const currentVendor = localVendor || vendor;

    if (mode !== 'edit' || !currentVendor || !currentVendor.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) {
      return {
        vsr: [] as Array<{ date: string; items: CostModelItem[] }>,
        vsrEletric: [] as Array<{ date: string; items: CostModelItem[] }>,
        spVsr: [] as Array<{ date: string; items: CostModelItem[] }>,
        daf: [] as Array<{ date: string; items: CostModelItem[] }>,
        dafEletric: [] as Array<{ date: string; items: CostModelItem[] }>,
        fsr: [] as Array<{ date: string; items: CostModelItem[] }>,
        fsrEletric: [] as Array<{ date: string; items: CostModelItem[] }>,
        dr: [] as Array<{ date: string; items: CostModelItem[] }>,
        drEletric: [] as Array<{ date: string; items: CostModelItem[] }>,
        hourlyEletric: [] as Array<{ date: string; items: CostModelItem[] }>,
      };
    }

    const costModels = currentVendor.originalCostModels as CostModelItem[];

    // Get current date without time
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Função auxiliar para agrupar por validityStartDate
    // Para VSR e DAF: agrupa todos os items com a mesma validityStartDate
    // Para outros: também agrupa por validityStartDate mas geralmente terá apenas 1 item
    const groupByDate = (items: CostModelItem[]): Array<{ date: string; items: CostModelItem[] }> => {
      const grouped = new Map<string, CostModelItem[]>();

      // Group ALL items (don't filter)
      items.forEach(item => {
        if (item.validityStartDate) {
          // Format date to yyyy-mm-dd (remove timezone)
          const formattedDate = formatDateOnly(item.validityStartDate);
          if (formattedDate) {
            if (!grouped.has(formattedDate)) {
              grouped.set(formattedDate, []);
            }
            grouped.get(formattedDate)!.push(item);
          }
        }
      });

      // Sort by most recent date (largest validityStartDate first) - descending
      return Array.from(grouped.entries())
        .sort((a, b) => {
          const dateA = new Date(a[0]);
          const dateB = new Date(b[0]);

          // Sort by descending date (most recent first)
          return dateB.getTime() - dateA.getTime();
        })
        .map(([date, items]) => ({ date, items }));
    };

    // Filtrar e agrupar por tipo
    // Para isElectric: null ou false = não elétrico, true = elétrico
    const vsrItems = costModels.filter(cm => cm.costModelId === 4 && (cm.isElectric === null || cm.isElectric === false));
    const vsrEletricItems = costModels.filter(cm => cm.costModelId === 4 && cm.isElectric === true);
    const spVsrItems = costModels.filter(cm => cm.costModelId === 12 && (cm.isElectric === null || cm.isElectric === false));
    const spVsrEletricItems = costModels.filter(cm => cm.costModelId === 12 && cm.isElectric === true);
    const dafItems = costModels.filter(cm => cm.costModelId === 1 && (cm.isElectric === null || cm.isElectric === false));
    const dafEletricItems = costModels.filter(cm => cm.costModelId === 1 && cm.isElectric === true);
    const fsrItems = costModels.filter(cm => cm.costModelId === 3 && (cm.isElectric === null || cm.isElectric === false));
    const fsrEletricItems = costModels.filter(cm => cm.costModelId === 3 && cm.isElectric === true);
    const drItems = costModels.filter(cm => cm.costModelId === 2 && (cm.isElectric === null || cm.isElectric === false));
    const drEletricItems = costModels.filter(cm => cm.costModelId === 2 && cm.isElectric === true);
    const hourlyEletricItems = costModels.filter(cm => cm.costModelId === 7 && cm.isElectric === true);

    // For VSR and DAF: group by validityStartDate (can have multiple bands with the same date)
    // For FSR and DR: also group by validityStartDate but will usually have only 1 item per date
    // Show all cost models, but sort so that valid ones for the current date appear first
    return {
      vsr: groupByDate(vsrItems),
      vsrEletric: groupByDate(vsrEletricItems),
      spVsr: groupByDate(spVsrItems),
      spVsrEletric: groupByDate(spVsrEletricItems),
      daf: groupByDate(dafItems),
      dafEletric: groupByDate(dafEletricItems),
      fsr: groupByDate(fsrItems),
      fsrEletric: groupByDate(fsrEletricItems),
      dr: groupByDate(drItems),
      drEletric: groupByDate(drEletricItems),
      hourlyEletric: groupByDate(hourlyEletricItems),
    };
  }, [mode, vendor, localVendor]);


  // Handler para abrir o modal de confirmação de delete
  const handleDeleteCostModelClick = (type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric') => {
    if (!vendor?.id || !vendor?.originalCostModels || !Array.isArray(vendor.originalCostModels)) {
      return;
    }

    // Get the current validityStartDate of the selected type
    let currentValidityStartDate: string | undefined;
    switch (type) {
      case 'vsr':
        currentValidityStartDate = formData.vsrValidityStartDate ? formatDateOnly(formData.vsrValidityStartDate) : undefined;
        break;
      case 'vsrEletric':
        currentValidityStartDate = formData.vsrEletricValidityStartDate ? formatDateOnly(formData.vsrEletricValidityStartDate) : undefined;
        break;
      case 'spVsr':
        currentValidityStartDate = formData.spVsrValidityStartDate ? formatDateOnly(formData.spVsrValidityStartDate) : undefined;
        break;
      case 'daf':
        currentValidityStartDate = formData.dafValidityStartDate ? formatDateOnly(formData.dafValidityStartDate) : undefined;
        break;
      case 'dafEletric':
        currentValidityStartDate = formData.dafEletricValidityStartDate ? formatDateOnly(formData.dafEletricValidityStartDate) : undefined;
        break;
      case 'fsr':
        currentValidityStartDate = formData.fsrValidityStartDate ? formatDateOnly(formData.fsrValidityStartDate) : undefined;
        break;
      case 'fsrEletric':
        currentValidityStartDate = formData.fsrEletricValidityStartDate ? formatDateOnly(formData.fsrEletricValidityStartDate) : undefined;
        break;
      case 'dr':
        currentValidityStartDate = formData.drValidityStartDate ? formatDateOnly(formData.drValidityStartDate) : undefined;
        break;
      case 'drEletric':
        currentValidityStartDate = formData.drEletricValidityStartDate ? formatDateOnly(formData.drEletricValidityStartDate) : undefined;
        break;
      case 'hourlyEletric':
        currentValidityStartDate = formData.hourlyEletricValidityStartDate ? formatDateOnly(formData.hourlyEletricValidityStartDate) : undefined;
        break;
    }

    if (!currentValidityStartDate) {
      showError('Delete Cost Model', 'Please select a validity start date to delete.');
      return;
    }

    // Abrir modal de confirmação
    setDeleteConfirmModal({ show: true, type });
  };

  // Handler to delete cost models (called after confirmation)
  const handleDeleteCostModel = async () => {
    const type = deleteConfirmModal.type;
    if (!type || !vendor?.id || !vendor?.originalCostModels || !Array.isArray(vendor.originalCostModels)) {
      return;
    }

    // Get the current validityStartDate of the selected type
    let currentValidityStartDate: string | undefined;
    switch (type) {
      case 'vsr':
        currentValidityStartDate = formData.vsrValidityStartDate ? formatDateOnly(formData.vsrValidityStartDate) : undefined;
        break;
      case 'vsrEletric':
        currentValidityStartDate = formData.vsrEletricValidityStartDate ? formatDateOnly(formData.vsrEletricValidityStartDate) : undefined;
        break;
      case 'spVsr':
        currentValidityStartDate = formData.spVsrValidityStartDate ? formatDateOnly(formData.spVsrValidityStartDate) : undefined;
        break;
      case 'daf':
        currentValidityStartDate = formData.dafValidityStartDate ? formatDateOnly(formData.dafValidityStartDate) : undefined;
        break;
      case 'dafEletric':
        currentValidityStartDate = formData.dafEletricValidityStartDate ? formatDateOnly(formData.dafEletricValidityStartDate) : undefined;
        break;
      case 'fsr':
        currentValidityStartDate = formData.fsrValidityStartDate ? formatDateOnly(formData.fsrValidityStartDate) : undefined;
        break;
      case 'fsrEletric':
        currentValidityStartDate = formData.fsrEletricValidityStartDate ? formatDateOnly(formData.fsrEletricValidityStartDate) : undefined;
        break;
      case 'dr':
        currentValidityStartDate = formData.drValidityStartDate ? formatDateOnly(formData.drValidityStartDate) : undefined;
        break;
      case 'drEletric':
        currentValidityStartDate = formData.drEletricValidityStartDate ? formatDateOnly(formData.drEletricValidityStartDate) : undefined;
        break;
      case 'hourlyEletric':
        currentValidityStartDate = formData.hourlyEletricValidityStartDate ? formatDateOnly(formData.hourlyEletricValidityStartDate) : undefined;
        break;
    }

    if (!currentValidityStartDate) {
      setDeleteConfirmModal({ show: false, type: null });
      return;
    }

    // Usar localVendor se disponível, senão usar vendor
    const currentVendor = localVendor || vendor;
    const costModels = currentVendor?.originalCostModels as CostModelItem[] || [];

    // Determine costModelId and isElectric based on type
    let costModelId: number;
    let isElectric: boolean | null;

    switch (type) {
      case 'vsr':
        costModelId = 4;
        isElectric = false;
        break;
      case 'vsrEletric':
        costModelId = 4;
        isElectric = true;
        break;
      case 'spVsr':
        costModelId = 12;
        isElectric = null;
        break;
      case 'spVsrEletric':
        costModelId = 12;
        isElectric = true;
        break;
      case 'daf':
        costModelId = 1;
        isElectric = false;
        break;
      case 'dafEletric':
        costModelId = 1;
        isElectric = true;
        break;
      case 'fsr':
        costModelId = 3;
        isElectric = false;
        break;
      case 'dr':
        costModelId = 2;
        isElectric = false;
        break;
      case 'fsrEletric':
        costModelId = 3;
        isElectric = true;
        break;
      case 'drEletric':
        costModelId = 2;
        isElectric = true;
        break;
      case 'hourlyEletric':
        costModelId = 7;
        isElectric = true;
        break;
    }

    // Filtrar cost models do tipo e data selecionada
    // Encontrar apenas os cost models que correspondem aos valores exibidos no formulário
    const itemsToDelete: CostModelItem[] = [];

    // Primeiro, filtrar por tipo, isElectric e validityStartDate
    const filteredByDate = costModels.filter(cm => {
      if (!cm.validityStartDate || !cm.modelEmployeesId) return false;
      const formattedDate = formatDateOnly(cm.validityStartDate);

      // Check if it's the same type
      let matchesType = false;
      if (isElectric === true) {
        // Electric type: must be exactly true
        matchesType = cm.costModelId === costModelId && cm.isElectric === true;
      } else {
        // Non-electric type: can be false or null
        matchesType = cm.costModelId === costModelId &&
          (cm.isElectric === false || cm.isElectric === null);
      }

      return matchesType && formattedDate === currentValidityStartDate;
    });

    if (type === 'spVsr') {
      // SP_VSR tem 4 bandas — remover todos os items filtrados por data
      filteredByDate.forEach(cm => {
        if (!itemsToDelete.find(item => item.modelEmployeesId === cm.modelEmployeesId)) {
          itemsToDelete.push(cm);
        }
      });
    } else if (type === 'vsr' || type === 'vsrEletric' || type === 'daf' || type === 'dafEletric') {
      // Para VSR e DAF, encontrar os cost models que correspondem aos bands exibidos no formulário
      // Band 1: geralmente minStops = 1 ou o primeiro item
      // Band 2: geralmente minStops > 1

      let band1Stops: string | undefined;
      let band1Rate: string | undefined;
      let band2Stops: string | undefined;
      let band2Rate: string | undefined;

      switch (type) {
        case 'vsr':
          band1Stops = formData.vsrBand1Stops;
          band1Rate = formData.vsrBand1Rate;
          band2Stops = formData.vsrBand2Stops;
          band2Rate = formData.vsrBand2Rate;
          break;
        case 'vsrEletric':
          band1Stops = formData.vsrEletricBand1Stops;
          band1Rate = formData.vsrEletricBand1Rate;
          band2Stops = formData.vsrEletricBand2Stops;
          band2Rate = formData.vsrEletricBand2Rate;
          break;
        case 'daf':
          band1Stops = formData.dafBand1Stops;
          band1Rate = formData.dafBand1Rate;
          band2Stops = formData.dafBand2Stops;
          band2Rate = formData.dafBand2Rate;
          break;
        case 'dafEletric':
          band1Stops = formData.dafEletricBand1Stops;
          band1Rate = formData.dafEletricBand1Rate;
          band2Stops = formData.dafEletricBand2Stops;
          band2Rate = formData.dafEletricBand2Rate;
          break;
      }

      // Encontrar Band 1: corresponde aos valores de Band 1 no formulário
      if (band1Stops || band1Rate) {
        const band1Item = filteredByDate.find(cm => {
          const matchesMaxStops = !band1Stops || cm.maxStops?.toString() === band1Stops;
          const matchesPricePerStop = !band1Rate || cm.pricePerStop?.toString() === band1Rate;
          return matchesMaxStops && matchesPricePerStop && (cm.minStops === 1 || !cm.minStops);
        });
        if (band1Item) {
          itemsToDelete.push(band1Item);
        }
      }

      // Encontrar Band 2: corresponde aos valores de Band 2 no formulário
      if (band2Stops || band2Rate) {
        const band2Item = filteredByDate.find(cm => {
          const matchesMaxStops = !band2Stops || cm.maxStops?.toString() === band2Stops;
          const matchesPricePerStop = !band2Rate || cm.pricePerStop?.toString() === band2Rate;
          // Band 2 geralmente tem minStops > 1
          return matchesMaxStops && matchesPricePerStop && cm.minStops !== undefined && cm.minStops > 1;
        });
        if (band2Item && !itemsToDelete.find(item => item.modelEmployeesId === band2Item.modelEmployeesId)) {
          itemsToDelete.push(band2Item);
        }
      }
    } else {
      // Para FSR e DR (e variantes elétricas), pegar o item que corresponde aos valores no formulário
      let rateValue: string | undefined;

      if (type === 'fsr') {
        rateValue = formData.fsrStopRate;
      } else if (type === 'fsrEletric') {
        rateValue = formData.fsrEletricStopRate;
      } else if (type === 'dr') {
        rateValue = formData.drDayRate;
      } else if (type === 'drEletric') {
        rateValue = formData.drEletricDayRate;
      } else if (type === 'hourlyEletric') {
        rateValue = formData.hourlyEletricRate;
      }

      const matchingItem = filteredByDate.find(cm => {
        if (type === 'fsr' || type === 'fsrEletric') {
          const matchesFixedPrice = !rateValue || cm.fixedPrice?.toString() === rateValue;
          const matchesPricePerStop = !rateValue || cm.pricePerStop?.toString() === rateValue;
          return matchesFixedPrice || matchesPricePerStop;
        } else if (type === 'dr' || type === 'drEletric') {
          return !rateValue || cm.fixedPrice?.toString() === rateValue;
        } else if (type === 'hourlyEletric') {
          return !rateValue || cm.pricePerStop?.toString() === rateValue;
        }
        return false;
      });

      if (matchingItem) {
        itemsToDelete.push(matchingItem);
      }
    }

    if (itemsToDelete.length === 0) {
      showError('Delete Cost Model', 'No cost model found to delete.');
      return;
    }

    // Extrair todos os modelEmployeesIds
    const modelEmployeesIds = itemsToDelete
      .map(cm => cm.modelEmployeesId)
      .filter((id): id is number => id !== undefined);

    if (modelEmployeesIds.length === 0) {
      showError('Delete Cost Model', 'No cost model ID found to delete.');
      return;
    }

    try {
      await deleteCostModels(currentVendor.id, modelEmployeesIds);

      // Remover os cost models deletados do originalCostModels localmente
      let updatedVendor = currentVendor;
      if (currentVendor?.originalCostModels && Array.isArray(currentVendor.originalCostModels)) {
        const updatedCostModels = currentVendor.originalCostModels.filter(
          cm => !modelEmployeesIds.includes(cm.modelEmployeesId || -1)
        );

        // Atualizar o vendor local
        updatedVendor = {
          ...currentVendor,
          originalCostModels: updatedCostModels,
        };
        setLocalVendor(updatedVendor);
      }

      // Limpar os campos do formulário após deletar
      setFormData(prev => {
        const updated = { ...prev } as Vendor & Record<string, unknown>;
        switch (type) {
          case 'vsr':
            updated.vsrBand1Stops = '';
            updated.vsrBand1Rate = '';
            updated.vsrBand2Stops = '';
            updated.vsrBand2Rate = '';
            updated.vsrValidityStartDate = '';
            updated.vsrValidityEndDate = '';
            break;
          case 'vsrEletric':
            updated.vsrEletricBand1Stops = '';
            updated.vsrEletricBand1Rate = '';
            updated.vsrEletricBand2Stops = '';
            updated.vsrEletricBand2Rate = '';
            updated.vsrEletricValidityStartDate = '';
            updated.vsrEletricValidityEndDate = '';
            break;
          case 'spVsr':
            updated.spVsrBand1Stops = '';
            updated.spVsrBand1Rate = '';
            updated.spVsrBand2Stops = '';
            updated.spVsrBand2Rate = '';
            updated.spVsrBand3Stops = '';
            updated.spVsrBand3Rate = '';
            updated.spVsrBand4Stops = '';
            updated.spVsrBand4Rate = '';
            updated.spVsrValidityStartDate = '';
            updated.spVsrValidityEndDate = '';
            break;
          case 'spVsrEletric':
            updated.spVsrEletricBand1Stops = '';
            updated.spVsrEletricBand1Rate = '';
            updated.spVsrEletricBand2Stops = '';
            updated.spVsrEletricBand2Rate = '';
            updated.spVsrEletricBand3Stops = '';
            updated.spVsrEletricBand3Rate = '';
            updated.spVsrEletricBand4Stops = '';
            updated.spVsrEletricBand4Rate = '';
            updated.spVsrEletricValidityStartDate = '';
            updated.spVsrEletricValidityEndDate = '';
            break;
          case 'daf':
            updated.dafBand1Stops = '';
            updated.dafBand1Rate = '';
            updated.dafBand2Stops = '';
            updated.dafBand2Rate = '';
            updated.dafValidityStartDate = '';
            updated.dafValidityEndDate = '';
            break;
          case 'dafEletric':
            updated.dafEletricBand1Stops = '';
            updated.dafEletricBand1Rate = '';
            updated.dafEletricBand2Stops = '';
            updated.dafEletricBand2Rate = '';
            updated.dafEletricValidityStartDate = '';
            updated.dafEletricValidityEndDate = '';
            break;
          case 'fsr':
            updated.fsrStopRate = '';
            updated.fsrValidityStartDate = '';
            updated.fsrValidityEndDate = '';
            break;
          case 'fsrEletric':
            updated.fsrEletricStopRate = '';
            updated.fsrEletricValidityStartDate = '';
            updated.fsrEletricValidityEndDate = '';
            break;
          case 'dr':
            updated.drDayRate = '';
            updated.drValidityStartDate = '';
            updated.drValidityEndDate = '';
            break;
          case 'drEletric':
            updated.drEletricDayRate = '';
            updated.drEletricValidityStartDate = '';
            updated.drEletricValidityEndDate = '';
            break;
          case 'hourlyEletric':
            updated.hourlyEletricRate = '';
            updated.hourlyEletricValidityStartDate = '';
            updated.hourlyEletricValidityEndDate = '';
            break;
        }
        return updated;
      });

      // Fechar o modal de confirmação
      setDeleteConfirmModal({ show: false, type: null });

      // Se não houver mais cost models deste tipo, ativar automaticamente o modo de criação
      // Usar o vendor atualizado que acabamos de setar
      const remainingCostModels = (updatedVendor?.originalCostModels as CostModelItem[] || []).filter(
        cm => {
          // Check if it's the same type
          if (isElectric === true) {
            // Electric type: must be exactly true
            return cm.costModelId === costModelId && cm.isElectric === true;
          } else {
            // Non-electric type: can be false or null
            return cm.costModelId === costModelId &&
              (cm.isElectric === false || cm.isElectric === null);
          }
        }
      );

      // Se não há mais cost models deste tipo, apenas limpar os campos
      // Os campos antigos já foram limpos acima, então não precisamos fazer mais nada
      // O usuário pode clicar em +New se quiser criar um novo cost model
      if (remainingCostModels.length > 0) {
        // Se ainda há cost models, selecionar automaticamente o próximo disponível
        // Usar a mesma lógica de agrupamento e seleção
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Agrupar os cost models restantes por validityStartDate
        const grouped = new Map<string, CostModelItem[]>();
        remainingCostModels.forEach(item => {
          if (item.validityStartDate) {
            const formattedDate = formatDateOnly(item.validityStartDate);
            if (formattedDate) {
              if (!grouped.has(formattedDate)) {
                grouped.set(formattedDate, []);
              }
              grouped.get(formattedDate)!.push(item);
            }
          }
        });

        // Ordenar grupos: primeiro os válidos para a data atual, depois por proximidade
        const sortedGroups = Array.from(grouped.entries())
          .sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);

            const groupAValid = a[1].some(item => isValidForCurrentDate(item));
            const groupBValid = b[1].some(item => isValidForCurrentDate(item));

            if (groupAValid && !groupBValid) return -1;
            if (!groupAValid && groupBValid) return 1;

            const diffA = Math.abs(dateA.getTime() - currentDate.getTime());
            const diffB = Math.abs(dateB.getTime() - currentDate.getTime());

            const isAFuture = dateA >= currentDate;
            const isBFuture = dateB >= currentDate;
            if (isAFuture && !isBFuture) return -1;
            if (!isAFuture && isBFuture) return 1;

            return diffA - diffB;
          })
          .map(([date, items]) => ({ date, items }));

        // Selecionar o primeiro grupo (mais relevante) e popular os campos
        if (sortedGroups.length > 0) {
          const selectedGroup = sortedGroups[0];
          const filteredItems = selectedGroup.items;

          // Popular os campos diretamente, similar ao handleValidityDateSelect
          setFormData(prev => {
            const updated = { ...prev };

            if (type === 'vsr' && filteredItems.length > 0) {
              const firstBand = filteredItems.find(cm => Number(cm.minStops ?? 1) <= 1) || filteredItems[0];
              const secondBand = filteredItems.find(cm => Number(cm.minStops ?? 0) > 1) || (filteredItems.length > 1 ? filteredItems[1] : null);

              const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

              if (firstBand) {
                updated.vsrBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
                updated.vsrBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
                updated.vsrValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
                updated.vsrValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
              }
              if (secondBand) {
                updated.vsrBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
                updated.vsrBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
              }
            } else if (type === 'vsrEletric' && filteredItems.length > 0) {
              const firstBand = filteredItems.find(cm => cm.minStops === 1 || !cm.minStops) || filteredItems[0];
              const secondBand = filteredItems.find(cm => cm.minStops !== 1 && cm.minStops) || (filteredItems.length > 1 ? filteredItems[1] : null);

              const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

              if (firstBand) {
                updated.vsrEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
                updated.vsrEletricBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
                updated.vsrEletricValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
                updated.vsrEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
              }
              if (secondBand) {
                updated.vsrEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
                updated.vsrEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
              }
            } else if (type === 'daf' && filteredItems.length > 0) {
              const sortedItems = [...filteredItems].sort((a, b) => {
                const minA = a.minStops ?? 0;
                const minB = b.minStops ?? 0;
                return minA - minB;
              });

              const firstBand = sortedItems.find(cm => cm.minStops === 1 || (!cm.minStops && cm.minStops !== 0)) || sortedItems[0];
              const secondBand = sortedItems.find(cm => cm !== firstBand && (cm.minStops !== 1 || (cm.minStops && cm.minStops > 1))) || (sortedItems.length > 1 ? sortedItems[1] : null);

              const validityEndDateItem = sortedItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

              if (firstBand) {
                updated.dafBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
                updated.dafBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
                updated.dafValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
                updated.dafValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
              }
              if (secondBand) {
                updated.dafBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
                updated.dafBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
              }
            } else if (type === 'dafEletric' && filteredItems.length > 0) {
              const firstBand = filteredItems.find(cm => cm.minStops === 1 || !cm.minStops) || filteredItems[0];
              const secondBand = filteredItems.find(cm => cm.minStops !== 1 && cm.minStops) || (filteredItems.length > 1 ? filteredItems[1] : null);

              const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

              if (firstBand) {
                updated.dafEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
                updated.dafEletricBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
                updated.dafEletricValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
                updated.dafEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
              }
              if (secondBand) {
                updated.dafEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
                updated.dafEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
              }
            } else if (type === 'fsr' && filteredItems.length > 0) {
              const fsrModel = filteredItems[0];
              updated.fsrStopRate = fsrModel.fixedPrice ? String(fsrModel.fixedPrice) : (fsrModel.pricePerStop ? String(fsrModel.pricePerStop) : '');
              updated.fsrValidityStartDate = fsrModel.validityStartDate ? formatDateOnly(fsrModel.validityStartDate) : '';
              updated.fsrValidityEndDate = (fsrModel.validityEndDate && fsrModel.validityEndDate !== null && typeof fsrModel.validityEndDate === 'string' && fsrModel.validityEndDate.trim() !== '') ? formatDateOnly(fsrModel.validityEndDate) : '';
            } else if (type === 'fsrEletric' && filteredItems.length > 0) {
              const fsrEModel = filteredItems[0];
              updated.fsrEletricStopRate = fsrEModel.fixedPrice ? String(fsrEModel.fixedPrice) : (fsrEModel.pricePerStop ? String(fsrEModel.pricePerStop) : '');
              updated.fsrEletricValidityStartDate = fsrEModel.validityStartDate ? formatDateOnly(fsrEModel.validityStartDate) : '';
              updated.fsrEletricValidityEndDate = (fsrEModel.validityEndDate && fsrEModel.validityEndDate !== null && typeof fsrEModel.validityEndDate === 'string' && fsrEModel.validityEndDate.trim() !== '') ? formatDateOnly(fsrEModel.validityEndDate) : '';
            } else if (type === 'dr' && filteredItems.length > 0) {
              const drModel = filteredItems[0];
              updated.drDayRate = drModel.fixedPrice ? String(drModel.fixedPrice) : '';
              updated.drValidityStartDate = drModel.validityStartDate ? formatDateOnly(drModel.validityStartDate) : '';
              updated.drValidityEndDate = (drModel.validityEndDate && drModel.validityEndDate !== null && typeof drModel.validityEndDate === 'string' && drModel.validityEndDate.trim() !== '') ? formatDateOnly(drModel.validityEndDate) : '';
            } else if (type === 'drEletric' && filteredItems.length > 0) {
              const drEModel = filteredItems[0];
              updated.drEletricDayRate = drEModel.fixedPrice ? String(drEModel.fixedPrice) : '';
              updated.drEletricValidityStartDate = drEModel.validityStartDate ? formatDateOnly(drEModel.validityStartDate) : '';
              updated.drEletricValidityEndDate = (drEModel.validityEndDate && drEModel.validityEndDate !== null && typeof drEModel.validityEndDate === 'string' && drEModel.validityEndDate.trim() !== '') ? formatDateOnly(drEModel.validityEndDate) : '';
            } else if (type === 'hourlyEletric' && filteredItems.length > 0) {
              const hEModel = filteredItems[0];
              updated.hourlyEletricRate = hEModel.pricePerStop ? String(hEModel.pricePerStop) : '';
              updated.hourlyEletricValidityStartDate = hEModel.validityStartDate ? formatDateOnly(hEModel.validityStartDate) : '';
              updated.hourlyEletricValidityEndDate = (hEModel.validityEndDate && hEModel.validityEndDate !== null && typeof hEModel.validityEndDate === 'string' && hEModel.validityEndDate.trim() !== '') ? formatDateOnly(hEModel.validityEndDate) : '';
            }

            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error deleting cost model:', error);
      showError(
        'Delete Error',
        `Failed to delete cost model: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Handler para quando selecionar uma validityStartDate
  const handleValidityDateSelect = (type: 'vsr' | 'vsrEletric' | 'spVsr' | 'spVsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric', date: string) => {
    // Função auxiliar para carregar o novo grupo
    const loadNewGroup = (updatedVendor: typeof localVendor) => {
      const currentVendor = updatedVendor || vendor;
      if (!currentVendor?.originalCostModels || !Array.isArray(currentVendor.originalCostModels)) return;

      const costModels = currentVendor.originalCostModels as CostModelItem[];
      // A data já vem do select no formato yyyy-mm-dd, mas vamos garantir que está formatada corretamente
      const formattedSelectedDate = formatDateOnly(date);
      if (!formattedSelectedDate) return; // Se não conseguir formatar, não fazer nada

      // Filtrar cost models do tipo e data selecionada
      let filteredItems: CostModelItem[] = [];

      switch (type) {
        case 'vsr':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 4 &&
              (cm.isElectric === null || cm.isElectric === false) &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'vsrEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 4 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'spVsr':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 12 &&
              (cm.isElectric === null || cm.isElectric === false) &&
              formattedDate === formattedSelectedDate;
          }).sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0));
          break;
        case 'spVsrEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 12 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          }).sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0));
          break;
        case 'daf':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            const matchesType = cm.costModelId === 1;
            const matchesElectric = (cm.isElectric === null || cm.isElectric === false);
            const matchesDate = formattedDate === formattedSelectedDate && formattedDate !== '';
            return matchesType && matchesElectric && matchesDate;
          });
          break;
        case 'dafEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 1 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'fsr':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 3 &&
              (cm.isElectric === null || cm.isElectric === false) &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'fsrEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 3 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'dr':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 2 &&
              (cm.isElectric === null || cm.isElectric === false) &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'drEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 2 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          });
          break;
        case 'hourlyEletric':
          filteredItems = costModels.filter(cm => {
            if (!cm.validityStartDate) return false;
            const formattedDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 7 &&
              cm.isElectric === true &&
              formattedDate === formattedSelectedDate;
          });
          break;
      }

      // Atualizar os campos do formulário com os valores encontrados
      // PRIMEIRO verificar se há alterações do usuário guardadas para esta data
      const changeKey = `${type}_${formattedSelectedDate}`;
      const userChanges = userChangesByDateRef.current[changeKey];

      setFormData(prev => {
        const updated = { ...prev } as Vendor & Record<string, unknown>;

        // Se há alterações do usuário guardadas para esta data, usar essas alterações
        if (userChanges) {
          if (type === 'vsr' && userChanges.vsr) {
            const changes = userChanges.vsr;
            if (changes.band1Stops !== undefined) {
              updated.vsrBand1Stops = changes.band1Stops;
              updated.vsrBand1Rate = changes.band1Rate ?? '';
              updated.vsrBand2Stops = changes.band2Stops ?? '';
              updated.vsrBand2Rate = changes.band2Rate ?? '';
              updated.vsrValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.vsrValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'vsrEletric' && userChanges.vsrEletric) {
            const changes = userChanges.vsrEletric;
            if (changes.band1Stops !== undefined) {
              updated.vsrEletricBand1Stops = changes.band1Stops;
              updated.vsrEletricBand1Rate = changes.band1Rate ?? '';
              updated.vsrEletricBand2Stops = changes.band2Stops ?? '';
              updated.vsrEletricBand2Rate = changes.band2Rate ?? '';
              updated.vsrEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.vsrEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'spVsr' && userChanges.spVsr) {
            const changes = userChanges.spVsr;
            if (changes.band1Stops !== undefined) {
              updated.spVsrBand1Stops = changes.band1Stops;
              updated.spVsrBand1Rate = changes.band1Rate ?? '';
              updated.spVsrBand2Stops = changes.band2Stops ?? '';
              updated.spVsrBand2Rate = changes.band2Rate ?? '';
              updated.spVsrBand3Stops = changes.band3Stops ?? '';
              updated.spVsrBand3Rate = changes.band3Rate ?? '';
              updated.spVsrBand4Stops = changes.band4Stops ?? '';
              updated.spVsrBand4Rate = changes.band4Rate ?? '';
              updated.spVsrValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.spVsrValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'spVsrEletric' && userChanges.spVsrEletric) {
            const changes = userChanges.spVsrEletric;
            if (changes.band1Stops !== undefined) {
              updated.spVsrEletricBand1Stops = changes.band1Stops;
              updated.spVsrEletricBand1Rate = changes.band1Rate ?? '';
              updated.spVsrEletricBand2Stops = changes.band2Stops ?? '';
              updated.spVsrEletricBand2Rate = changes.band2Rate ?? '';
              updated.spVsrEletricBand3Stops = changes.band3Stops ?? '';
              updated.spVsrEletricBand3Rate = changes.band3Rate ?? '';
              updated.spVsrEletricBand4Stops = changes.band4Stops ?? '';
              updated.spVsrEletricBand4Rate = changes.band4Rate ?? '';
              updated.spVsrEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.spVsrEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'daf' && userChanges.daf) {
            const changes = userChanges.daf;
            if (changes.band1Stops !== undefined) {
              updated.dafBand1Stops = changes.band1Stops;
              updated.dafBand1Rate = changes.band1Rate ?? '';
              updated.dafBand2Stops = changes.band2Stops ?? '';
              updated.dafBand2Rate = changes.band2Rate ?? '';
              updated.dafValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.dafValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'dafEletric' && userChanges.dafEletric) {
            const changes = userChanges.dafEletric;
            if (changes.band1Stops !== undefined) {
              updated.dafEletricBand1Stops = changes.band1Stops;
              updated.dafEletricBand1Rate = changes.band1Rate ?? '';
              updated.dafEletricBand2Stops = changes.band2Stops ?? '';
              updated.dafEletricBand2Rate = changes.band2Rate ?? '';
              updated.dafEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.dafEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'fsr' && userChanges.fsr) {
            const changes = userChanges.fsr;
            if (changes.stopRate !== undefined) {
              updated.fsrStopRate = changes.stopRate;
              updated.fsrValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.fsrValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'fsrEletric' && userChanges.fsrEletric) {
            const changes = userChanges.fsrEletric;
            if (changes.stopRate !== undefined) {
              updated.fsrEletricStopRate = changes.stopRate;
              updated.fsrEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.fsrEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'dr' && userChanges.dr) {
            const changes = userChanges.dr;
            if (changes.dayRate !== undefined) {
              updated.drDayRate = changes.dayRate;
              updated.drValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.drValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'drEletric' && userChanges.drEletric) {
            const changes = userChanges.drEletric;
            if (changes.dayRate !== undefined) {
              updated.drEletricDayRate = changes.dayRate;
              updated.drEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.drEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          } else if (type === 'hourlyEletric' && userChanges.hourlyEletric) {
            const changes = userChanges.hourlyEletric;
            if (changes.hourlyRate !== undefined) {
              updated.hourlyEletricRate = changes.hourlyRate;
              updated.hourlyEletricValidityStartDate = changes.validityStartDate ?? formattedSelectedDate;
              updated.hourlyEletricValidityEndDate = changes.validityEndDate ?? '';
              return updated;
            }
          }
        }

        // Se não há alterações guardadas, carregar do banco
        if (type === 'vsr' && filteredItems.length > 0) {
          // VSR tem first_band e second_band
          const firstBand = filteredItems.find(cm => Number(cm.minStops ?? 1) <= 1) || filteredItems[0];
          const secondBand = filteredItems.find(cm => Number(cm.minStops ?? 0) > 1) || (filteredItems.length > 1 ? filteredItems[1] : null);

          // Encontrar o validityEndDate do primeiro item que tiver esse valor
          const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.vsrBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.vsrBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
            updated.vsrValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
            updated.vsrValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (secondBand) {
            updated.vsrBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.vsrBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
          }
        } else if (type === 'vsrEletric' && filteredItems.length > 0) {
          const firstBand = filteredItems.find(cm => cm.minStops === 1 || !cm.minStops) || filteredItems[0];
          const secondBand = filteredItems.find(cm => cm.minStops !== 1 && cm.minStops) || (filteredItems.length > 1 ? filteredItems[1] : null);

          // Encontrar o validityEndDate do primeiro item que tiver esse valor
          const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.vsrEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.vsrEletricBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
            updated.vsrEletricValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
            updated.vsrEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (secondBand) {
            updated.vsrEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.vsrEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
          }
        } else if (type === 'spVsr' && filteredItems.length > 0) {
          // SP_VSR — 4 bandas ordenadas por minStops (já ordenadas no filtro)
          const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || filteredItems[0];
          const [b1, b2, b3, b4] = filteredItems;
          if (b1) {
            updated.spVsrBand1Stops = b1.maxStops ? String(b1.maxStops) : '';
            updated.spVsrBand1Rate = b1.pricePerStop ? String(b1.pricePerStop) : '';
            updated.spVsrValidityStartDate = b1.validityStartDate ? formatDateOnly(b1.validityStartDate) : '';
            updated.spVsrValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (b2) { updated.spVsrBand2Stops = b2.maxStops ? String(b2.maxStops) : ''; updated.spVsrBand2Rate = b2.pricePerStop ? String(b2.pricePerStop) : ''; }
          if (b3) { updated.spVsrBand3Stops = b3.maxStops ? String(b3.maxStops) : ''; updated.spVsrBand3Rate = b3.pricePerStop ? String(b3.pricePerStop) : ''; }
          if (b4) { updated.spVsrBand4Stops = b4.maxStops ? String(b4.maxStops) : ''; updated.spVsrBand4Rate = b4.pricePerStop ? String(b4.pricePerStop) : ''; }
        } else if (type === 'spVsrEletric' && filteredItems.length > 0) {
          // SP_VSR Electric — 4 bandas ordenadas por minStops
          const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || filteredItems[0];
          const [b1, b2, b3, b4] = filteredItems;
          if (b1) {
            updated.spVsrEletricBand1Stops = b1.maxStops ? String(b1.maxStops) : '';
            updated.spVsrEletricBand1Rate = b1.pricePerStop ? String(b1.pricePerStop) : '';
            updated.spVsrEletricValidityStartDate = b1.validityStartDate ? formatDateOnly(b1.validityStartDate) : '';
            updated.spVsrEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (b2) { updated.spVsrEletricBand2Stops = b2.maxStops ? String(b2.maxStops) : ''; updated.spVsrEletricBand2Rate = b2.pricePerStop ? String(b2.pricePerStop) : ''; }
          if (b3) { updated.spVsrEletricBand3Stops = b3.maxStops ? String(b3.maxStops) : ''; updated.spVsrEletricBand3Rate = b3.pricePerStop ? String(b3.pricePerStop) : ''; }
          if (b4) { updated.spVsrEletricBand4Stops = b4.maxStops ? String(b4.maxStops) : ''; updated.spVsrEletricBand4Rate = b4.pricePerStop ? String(b4.pricePerStop) : ''; }
        } else if (type === 'daf' && filteredItems.length > 0) {
          // Ordenar items por minStops para garantir ordem correta
          const sortedItems = [...filteredItems].sort((a, b) => {
            const minA = a.minStops ?? 0;
            const minB = b.minStops ?? 0;
            return minA - minB;
          });

          // Primeiro band: menor minStops (geralmente 1) ou primeiro item
          const firstBand = sortedItems.find(cm => cm.minStops === 1 || (!cm.minStops && cm.minStops !== 0)) || sortedItems[0];
          // Segundo band: próximo item que não seja o primeiro
          const secondBand = sortedItems.find(cm => cm !== firstBand && (cm.minStops !== 1 || (cm.minStops && cm.minStops > 1))) || (sortedItems.length > 1 ? sortedItems[1] : null);

          // Encontrar o validityEndDate do primeiro item que tiver esse valor
          const validityEndDateItem = sortedItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.dafBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.dafBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
            updated.dafValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
            updated.dafValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (secondBand) {
            updated.dafBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.dafBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
          }
        } else if (type === 'dafEletric' && filteredItems.length > 0) {
          const firstBand = filteredItems.find(cm => cm.minStops === 1 || !cm.minStops) || filteredItems[0];
          const secondBand = filteredItems.find(cm => cm.minStops !== 1 && cm.minStops) || (filteredItems.length > 1 ? filteredItems[1] : null);

          // Encontrar o validityEndDate do primeiro item que tiver esse valor
          const validityEndDateItem = filteredItems.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.dafEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.dafEletricBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
            updated.dafEletricValidityStartDate = firstBand.validityStartDate ? formatDateOnly(firstBand.validityStartDate) : '';
            updated.dafEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
          }
          if (secondBand) {
            updated.dafEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.dafEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
          }
        } else if (type === 'fsr' && filteredItems.length > 0) {
          const fsrModel = filteredItems[0];
          updated.fsrStopRate = fsrModel.fixedPrice ? String(fsrModel.fixedPrice) : (fsrModel.pricePerStop ? String(fsrModel.pricePerStop) : '');
          updated.fsrValidityStartDate = fsrModel.validityStartDate ? formatDateOnly(fsrModel.validityStartDate) : '';
          updated.fsrValidityEndDate = (fsrModel.validityEndDate && fsrModel.validityEndDate !== null) ? formatDateOnly(fsrModel.validityEndDate) : '';
        } else if (type === 'fsrEletric' && filteredItems.length > 0) {
          const fsrEModel = filteredItems[0];
          updated.fsrEletricStopRate = fsrEModel.fixedPrice ? String(fsrEModel.fixedPrice) : (fsrEModel.pricePerStop ? String(fsrEModel.pricePerStop) : '');
          updated.fsrEletricValidityStartDate = fsrEModel.validityStartDate ? formatDateOnly(fsrEModel.validityStartDate) : '';
          updated.fsrEletricValidityEndDate = (fsrEModel.validityEndDate && fsrEModel.validityEndDate !== null) ? formatDateOnly(fsrEModel.validityEndDate) : '';
        } else if (type === 'dr' && filteredItems.length > 0) {
          const drModel = filteredItems[0];
          updated.drDayRate = drModel.fixedPrice ? String(drModel.fixedPrice) : '';
          updated.drValidityStartDate = drModel.validityStartDate ? formatDateOnly(drModel.validityStartDate) : '';
          updated.drValidityEndDate = (drModel.validityEndDate && drModel.validityEndDate !== null) ? formatDateOnly(drModel.validityEndDate) : '';
        } else if (type === 'drEletric' && filteredItems.length > 0) {
          const drEModel = filteredItems[0];
          updated.drEletricDayRate = drEModel.fixedPrice ? String(drEModel.fixedPrice) : '';
          updated.drEletricValidityStartDate = drEModel.validityStartDate ? formatDateOnly(drEModel.validityStartDate) : '';
          updated.drEletricValidityEndDate = (drEModel.validityEndDate && drEModel.validityEndDate !== null) ? formatDateOnly(drEModel.validityEndDate) : '';
        } else if (type === 'hourlyEletric' && filteredItems.length > 0) {
          const hEModel = filteredItems[0];
          updated.hourlyEletricRate = hEModel.pricePerStop ? String(hEModel.pricePerStop) : '';
          updated.hourlyEletricValidityStartDate = hEModel.validityStartDate ? formatDateOnly(hEModel.validityStartDate) : '';
          updated.hourlyEletricValidityEndDate = (hEModel.validityEndDate && hEModel.validityEndDate !== null) ? formatDateOnly(hEModel.validityEndDate) : '';
        }

        return updated;
      });
    };

    // ANTES de mudar para o novo grupo, salvar as alterações do grupo atual no localVendor
    // Isso preserva as alterações que o usuário fez nos inputs
    const currentStartDate = formData[`${type}ValidityStartDate` as keyof typeof formData] as string | undefined;
    if (currentStartDate) {
      // Salvar as alterações do grupo atual antes de mudar
      setLocalVendor(prev => {
        if (!prev || !prev.originalCostModels || !Array.isArray(prev.originalCostModels)) return prev;

        const formattedCurrentStartDate = formatDateOnly(currentStartDate);
        if (!formattedCurrentStartDate) return prev;

        // Determine costModelId and isElectric based on type
        let costModelId: number;
        let isElectric: boolean | null;

        switch (type) {
          case 'vsr':
            costModelId = 4;
            isElectric = false;
            break;
          case 'vsrEletric':
            costModelId = 4;
            isElectric = true;
            break;
          case 'daf':
            costModelId = 1;
            isElectric = false;
            break;
          case 'dafEletric':
            costModelId = 1;
            isElectric = true;
            break;
          case 'fsr':
            costModelId = 3;
            isElectric = false;
            break;
          case 'dr':
            costModelId = 2;
            isElectric = false;
            break;
        }

        // Atualizar os costModels do grupo atual com os valores do formulário
        const updatedCostModels = prev.originalCostModels.map(cm => {
          const updated = { ...cm };

          // Check if it's the same type e mesma validityStartDate
          let matchesType = false;
          if (isElectric === true) {
            matchesType = cm.costModelId === costModelId && cm.isElectric === true;
          } else {
            matchesType = cm.costModelId === costModelId &&
              (cm.isElectric === false || cm.isElectric === null);
          }

          const cmStartDate = formatDateOnly(cm.validityStartDate);
          if (!matchesType || cmStartDate !== formattedCurrentStartDate) {
            return updated; // Não é o grupo atual, não alterar
          }

          // Este é o grupo atual - atualizar com os valores do formulário
          switch (type) {
            case 'vsr':
              if (cm.minStops === 1 || !cm.minStops) {
                // First band
                if (formData.vsrBand1Stops) updated.maxStops = Number(formData.vsrBand1Stops);
                if (formData.vsrBand1Rate) updated.pricePerStop = Number(formData.vsrBand1Rate);
              } else {
                // Second band
                const firstBandMaxStops = formData.vsrBand1Stops ? Number(formData.vsrBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.vsrBand2Stops) updated.maxStops = Number(formData.vsrBand2Stops);
                if (formData.vsrBand2Rate) updated.pricePerStop = Number(formData.vsrBand2Rate);
              }
              if (formData.vsrValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.vsrValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'vsrEletric':
              if (cm.minStops === 1 || !cm.minStops) {
                if (formData.vsrEletricBand1Stops) updated.maxStops = Number(formData.vsrEletricBand1Stops);
                if (formData.vsrEletricBand1Rate) updated.pricePerStop = Number(formData.vsrEletricBand1Rate);
              } else {
                const firstBandMaxStops = formData.vsrEletricBand1Stops ? Number(formData.vsrEletricBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.vsrEletricBand2Stops) updated.maxStops = Number(formData.vsrEletricBand2Stops);
                if (formData.vsrEletricBand2Rate) updated.pricePerStop = Number(formData.vsrEletricBand2Rate);
              }
              if (formData.vsrEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.vsrEletricValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'daf':
              if (Number(cm.minStops ?? 1) <= 1) {
                if (formData.dafBand1Stops) updated.maxStops = Number(formData.dafBand1Stops);
                if (formData.dafBand1Rate) {
                  updated.fixedPrice = Number(formData.dafBand1Rate);
                  updated.pricePerStop = undefined;
                }
              } else {
                const firstBandMaxStops = formData.dafBand1Stops ? Number(formData.dafBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.dafBand2Stops) updated.maxStops = Number(formData.dafBand2Stops);
                if (formData.dafBand2Rate) {
                  updated.pricePerStop = Number(formData.dafBand2Rate);
                  updated.fixedPrice = undefined;
                }
              }
              if (formData.dafValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.dafValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'dafEletric':
              if (Number(cm.minStops ?? 1) <= 1) {
                if (formData.dafEletricBand1Stops) updated.maxStops = Number(formData.dafEletricBand1Stops);
                if (formData.dafEletricBand1Rate) {
                  updated.fixedPrice = Number(formData.dafEletricBand1Rate);
                  updated.pricePerStop = undefined;
                }
              } else {
                const firstBandMaxStops = formData.dafEletricBand1Stops ? Number(formData.dafEletricBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.dafEletricBand2Stops) updated.maxStops = Number(formData.dafEletricBand2Stops);
                if (formData.dafEletricBand2Rate) {
                  updated.pricePerStop = Number(formData.dafEletricBand2Rate);
                  updated.fixedPrice = undefined;
                }
              }
              if (formData.dafEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.dafEletricValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'fsr':
              if (formData.fsrStopRate) {
                updated.fixedPrice = Number(formData.fsrStopRate);
                updated.pricePerStop = undefined;
              }
              if (formData.fsrValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.fsrValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'fsrEletric':
              if (formData.fsrEletricStopRate) {
                updated.fixedPrice = Number(formData.fsrEletricStopRate);
                updated.pricePerStop = undefined;
              }
              if (formData.fsrEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.fsrEletricValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'dr':
              if (formData.drDayRate) {
                updated.fixedPrice = Number(formData.drDayRate);
                updated.pricePerStop = undefined;
              }
              if (formData.drValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.drValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'drEletric':
              if (formData.drEletricDayRate) {
                updated.fixedPrice = Number(formData.drEletricDayRate);
                updated.pricePerStop = undefined;
              }
              if (formData.drEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.drEletricValidityEndDate) || cm.validityEndDate;
              }
              break;
            case 'hourlyEletric':
              if (formData.hourlyEletricRate) {
                updated.pricePerStop = Number(formData.hourlyEletricRate);
                updated.fixedPrice = undefined;
              }
              if (formData.hourlyEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.hourlyEletricValidityEndDate) || cm.validityEndDate;
              }
              break;
          }

          return updated;
        });

        const updatedVendor = {
          ...prev,
          originalCostModels: updatedCostModels
        };

        // Após salvar as alterações, carregar o novo grupo
        setTimeout(() => {
          loadNewGroup(updatedVendor);
        }, 0);

        return updatedVendor;
      });
    } else {
      // Se não há grupo atual, apenas carregar o novo grupo
      loadNewGroup(localVendor);
    }
  };

  // Resetar showNewCostModels e ref quando o vendor ou mode mudar
  useEffect(() => {
    setShowNewCostModels({
      vsr: false,
      vsrEletric: false,
      spVsr: false,
      spVsrEletric: false,
      daf: false,
      dafEletric: false,
      fsr: false,
      fsrEletric: false,
      dr: false,
      drEletric: false,
      hourlyEletric: false,
    });
    // Limpar os valores originais guardados (tanto no state quanto na ref)
    setOriginalValidityEndDates({});
    originalValidityEndDatesRef.current = {};
    originalCostModelFieldsRef.current = {};
    userChangesByDateRef.current = {};
    // Resetar ref quando vendor muda para permitir seleção automática novamente
    vendorLoadedRef.current = null;
    // Inicializar localVendor quando vendor mudar
    if (vendor) {
      setLocalVendor(vendor);
    } else {
      setLocalVendor(null);
    }
  }, [vendor, mode]);

  useEffect(() => {
    // Helper para obter data atual no formato yyyy-mm-dd
    const getCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (mode === 'edit' && vendor) {
      // Resetar a ref quando um novo vendor é carregado
      if (vendorLoadedRef.current !== vendor.id) {
        vendorLoadedRef.current = null;
      }

      const today = new Date();
      const vendorStatus = vendor.status || (vendor.finishDate && new Date(vendor.finishDate) <= today ? 'Inactive' : 'Active');
      let formattedPhone = vendor.phone || '';
      // Formatar apenas se o telefone não estiver já formatado (sem espaços ou +)
      if (formattedPhone && !formattedPhone.includes(' ') && !formattedPhone.includes('+')) {
        formattedPhone = formatPhone(formattedPhone);
      }

      // Limpar campos de cost models para que o useEffect selecione automaticamente o mais próximo da data atual
      const vendorWithAll = vendor as Vendor & Record<string, unknown>;
      const {
        vsrBand1Stops,
        vsrBand1Rate,
        vsrBand2Stops,
        vsrBand2Rate,
        vsrValidityStartDate,
        vsrValidityEndDate,
        vsrEletricBand1Stops,
        vsrEletricBand1Rate,
        vsrEletricBand2Stops,
        vsrEletricBand2Rate,
        vsrEletricValidityStartDate,
        vsrEletricValidityEndDate,
        spVsrBand1Stops,
        spVsrBand1Rate,
        spVsrBand2Stops,
        spVsrBand2Rate,
        spVsrBand3Stops,
        spVsrBand3Rate,
        spVsrBand4Stops,
        spVsrBand4Rate,
        spVsrValidityStartDate,
        spVsrValidityEndDate,
        spVsrEletricBand1Stops,
        spVsrEletricBand1Rate,
        spVsrEletricBand2Stops,
        spVsrEletricBand2Rate,
        spVsrEletricBand3Stops,
        spVsrEletricBand3Rate,
        spVsrEletricBand4Stops,
        spVsrEletricBand4Rate,
        spVsrEletricValidityStartDate,
        spVsrEletricValidityEndDate,
        dafBand1Stops,
        dafBand1Rate,
        dafBand2Stops,
        dafBand2Rate,
        dafValidityStartDate,
        dafValidityEndDate,
        dafEletricBand1Stops,
        dafEletricBand1Rate,
        dafEletricBand2Stops,
        dafEletricBand2Rate,
        dafEletricValidityStartDate,
        dafEletricValidityEndDate,
        fsrStopRate,
        fsrValidityStartDate,
        fsrValidityEndDate,
        drDayRate,
        drValidityStartDate,
        drValidityEndDate,
        ...vendorWithoutCostModels
      } = vendorWithAll;

      setFormData({
        ...vendorWithoutCostModels,
        id: vendor.id,
        status: vendorStatus as 'Active' | 'Inactive',
        dob: vendor.dob ? formatDateOnly(vendor.dob) : undefined,
        phone: formattedPhone,
        servicePartnerId: vendor.servicePartnerId ?? undefined,
        startDate: vendor.startDate ? formatDateOnly(vendor.startDate) : undefined,
        finishDate: vendor.finishDate ? formatDateOnly(vendor.finishDate) : undefined,
        cargoTrainingDate: vendor.cargoTrainingDate ? formatDateOnly(vendor.cargoTrainingDate) : undefined,
        dangerousGoodsTrainingDate: vendor.dangerousGoodsTrainingDate ? formatDateOnly(vendor.dangerousGoodsTrainingDate) : undefined,
        manualHandlingTrainingDate: vendor.manualHandlingTrainingDate ? formatDateOnly(vendor.manualHandlingTrainingDate) : undefined,
        criminalRecordDate: vendor.criminalRecordDate ? formatDateOnly(vendor.criminalRecordDate) : undefined,
        dvlaCheckDate: vendor.dvlaCheckDate ? formatDateOnly(vendor.dvlaCheckDate) : undefined,
        visaValidity: vendor.visaValidity ? formatDateOnly(vendor.visaValidity) : undefined,
        licenceExpiringDate: vendor.licenceExpiringDate ? formatDateOnly(vendor.licenceExpiringDate) : undefined,
        passportExpiringDate: vendor.passportExpiringDate ? formatDateOnly(vendor.passportExpiringDate) : undefined,
        // Limpar cost models para seleção automática posterior
        vsrBand1Stops: undefined,
        vsrBand1Rate: undefined,
        vsrBand2Stops: undefined,
        vsrBand2Rate: undefined,
        vsrValidityStartDate: undefined,
        vsrValidityEndDate: undefined,
        vsrEletricBand1Stops: undefined,
        vsrEletricBand1Rate: undefined,
        vsrEletricBand2Stops: undefined,
        vsrEletricBand2Rate: undefined,
        vsrEletricValidityStartDate: undefined,
        vsrEletricValidityEndDate: undefined,
        spVsrBand1Stops: undefined,
        spVsrBand1Rate: undefined,
        spVsrBand2Stops: undefined,
        spVsrBand2Rate: undefined,
        spVsrBand3Stops: undefined,
        spVsrBand3Rate: undefined,
        spVsrBand4Stops: undefined,
        spVsrBand4Rate: undefined,
        spVsrValidityStartDate: undefined,
        spVsrValidityEndDate: undefined,
        spVsrEletricBand1Stops: undefined,
        spVsrEletricBand1Rate: undefined,
        spVsrEletricBand2Stops: undefined,
        spVsrEletricBand2Rate: undefined,
        spVsrEletricBand3Stops: undefined,
        spVsrEletricBand3Rate: undefined,
        spVsrEletricBand4Stops: undefined,
        spVsrEletricBand4Rate: undefined,
        spVsrEletricValidityStartDate: undefined,
        spVsrEletricValidityEndDate: undefined,
        dafBand1Stops: undefined,
        dafBand1Rate: undefined,
        dafBand2Stops: undefined,
        dafBand2Rate: undefined,
        dafValidityStartDate: undefined,
        dafValidityEndDate: undefined,
        dafEletricBand1Stops: undefined,
        dafEletricBand1Rate: undefined,
        dafEletricBand2Stops: undefined,
        dafEletricBand2Rate: undefined,
        dafEletricValidityStartDate: undefined,
        dafEletricValidityEndDate: undefined,
        fsrStopRate: undefined,
        fsrValidityStartDate: undefined,
        fsrValidityEndDate: undefined,
        drDayRate: undefined,
        drValidityStartDate: undefined,
        drValidityEndDate: undefined,
      });
    } else {
      const currentDate = getCurrentDate();
      setFormData({
        supplierId: '',
        depot: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        vendorType: '',
        userType: '',
        servicePartnerId: undefined,
        vat: '',
        street: '',
        city: '',
        postalCode: '',
        startDate: currentDate,
        finishDate: '',
        routeIdLink: '',
        routeSortValue: '',
        vehicleRegLink: '',
        vsrBand1Stops: '',
        vsrBand1Rate: '',
        vsrBand2Stops: '',
        vsrBand2Rate: '',
        vsrValidityStartDate: '',
        vsrValidityEndDate: '',
        vsrEletricBand1Stops: '',
        vsrEletricBand1Rate: '',
        vsrEletricBand2Stops: '',
        vsrEletricBand2Rate: '',
        vsrEletricValidityStartDate: '',
        vsrEletricValidityEndDate: '',
        spVsrBand1Stops: '',
        spVsrBand1Rate: '',
        spVsrBand2Stops: '',
        spVsrBand2Rate: '',
        spVsrBand3Stops: '',
        spVsrBand3Rate: '',
        spVsrBand4Stops: '',
        spVsrBand4Rate: '',
        spVsrValidityStartDate: '',
        spVsrValidityEndDate: '',
        spVsrEletricBand1Stops: '',
        spVsrEletricBand1Rate: '',
        spVsrEletricBand2Stops: '',
        spVsrEletricBand2Rate: '',
        spVsrEletricBand3Stops: '',
        spVsrEletricBand3Rate: '',
        spVsrEletricBand4Stops: '',
        spVsrEletricBand4Rate: '',
        spVsrEletricValidityStartDate: '',
        spVsrEletricValidityEndDate: '',
        fsrStopRate: '',
        fsrValidityStartDate: '',
        fsrValidityEndDate: '',
        drDayRate: '',
        drValidityStartDate: '',
        drValidityEndDate: '',
        hourlyRate: '',
        hourlyValidityStartDate: '',
        hourlyValidityEndDate: '',
        dafBand1Stops: '',
        dafBand1Rate: '',
        dafBand2Stops: '',
        dafBand2Rate: '',
        dafValidityStartDate: '',
        dafValidityEndDate: '',
        dafEletricBand1Stops: '',
        dafEletricBand1Rate: '',
        dafEletricBand2Stops: '',
        dafEletricBand2Rate: '',
        dafEletricValidityStartDate: '',
        dafEletricValidityEndDate: '',
        paymentModel: '',
        cargoTraining: false,
        dangerousGoodsTraining: false,
        manualHandlingTraining: false,
        cargoTrainingDate: '',
        dangerousGoodsTrainingDate: '',
        manualHandlingTrainingDate: '',
        dhlTrainingNumber: '',
        criminalRecordDate: '',
        dvlaCheckDate: '',
        immigrationStatus: undefined,
        visaValidity: '',
        licenceExpiringDate: '',
        passportExpiringDate: '',
        status: 'Active'
      });
    }
    setCurrentStep('personal');
  }, [mode, vendor]);

  // Selecionar automaticamente o cost model com validityStartDate mais próximo da data atual
  useEffect(() => {
    if (mode !== 'edit' || !groupedCostModels || !vendor?.originalCostModels || !vendor?.id) {
      return;
    }

    // Verificar se já foi feito o carregamento inicial para este vendor
    if (vendorLoadedRef.current === vendor.id) {
      return; // Já foi carregado, não fazer nada
    }

    // Marcar que este vendor foi carregado
    vendorLoadedRef.current = vendor.id;

    // Sempre selecionar o cost model mais novo (com validityStartDate mais recente) para cada tipo
    setFormData(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      // VSR - selecionar o grupo mais novo (primeiro grupo, já ordenado por data decrescente)
      if (groupedCostModels.vsr.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.vsr[0];

        if (closestGroup && closestGroup.items.length > 0) {
          const firstBand = closestGroup.items.find(cm => Number(cm.minStops ?? 1) <= 1) || closestGroup.items[0];
          const secondBand = closestGroup.items.find(cm => Number(cm.minStops ?? 0) > 1) || (closestGroup.items.length > 1 ? closestGroup.items[1] : null);

          if (firstBand) {
            updated.vsrBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.vsrBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
            updated.vsrValidityStartDate = formatDateOnly(firstBand.validityStartDate) || '';
            updated.vsrValidityEndDate = (firstBand.validityEndDate && firstBand.validityEndDate !== null && typeof firstBand.validityEndDate === 'string' && firstBand.validityEndDate.trim() !== '') ? formatDateOnly(firstBand.validityEndDate) : '';
            hasChanges = true;
          }
          if (secondBand) {
            updated.vsrBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.vsrBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
            hasChanges = true;
          }
        }
      }

      // VSR Eletric - selecionar o grupo mais novo
      if (groupedCostModels.vsrEletric.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.vsrEletric[0];

        if (closestGroup && closestGroup.items.length > 0) {
          const firstBand = closestGroup.items.find(cm => cm.minStops === 1 || !cm.minStops) || closestGroup.items[0];
          const secondBand = closestGroup.items.find(cm => cm.minStops !== 1 && cm.minStops) || (closestGroup.items.length > 1 ? closestGroup.items[1] : null);

          // Buscar validityEndDate do primeiro item do grupo que tiver esse valor
          const validityEndDateItemVsrEletric = closestGroup.items.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.vsrEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.vsrEletricBand1Rate = firstBand.pricePerStop ? String(firstBand.pricePerStop) : '';
            updated.vsrEletricValidityStartDate = formatDateOnly(firstBand.validityStartDate) || '';
            updated.vsrEletricValidityEndDate = (validityEndDateItemVsrEletric?.validityEndDate && validityEndDateItemVsrEletric.validityEndDate !== null && typeof validityEndDateItemVsrEletric.validityEndDate === 'string' && validityEndDateItemVsrEletric.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItemVsrEletric.validityEndDate) : '';
            hasChanges = true;
          }
          if (secondBand) {
            updated.vsrEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.vsrEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
            hasChanges = true;
          }
        }
      }

      // SP_VSR - selecionar o grupo mais novo (4 bandas, ordenadas por minStops)
      if (groupedCostModels.spVsr && groupedCostModels.spVsr.length > 0) {
        const closestGroup = groupedCostModels.spVsr[0];
        if (closestGroup && closestGroup.items.length > 0) {
          const sortedBands = [...closestGroup.items].sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0));
          const validityEndDateItem = sortedBands.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || sortedBands[0];
          const [b1, b2, b3, b4] = sortedBands;
          if (b1) {
            updated.spVsrBand1Stops = b1.maxStops ? String(b1.maxStops) : '';
            updated.spVsrBand1Rate = b1.pricePerStop ? String(b1.pricePerStop) : '';
            updated.spVsrValidityStartDate = formatDateOnly(b1.validityStartDate) || '';
            updated.spVsrValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
            hasChanges = true;
          }
          if (b2) { updated.spVsrBand2Stops = b2.maxStops ? String(b2.maxStops) : ''; updated.spVsrBand2Rate = b2.pricePerStop ? String(b2.pricePerStop) : ''; hasChanges = true; }
          if (b3) { updated.spVsrBand3Stops = b3.maxStops ? String(b3.maxStops) : ''; updated.spVsrBand3Rate = b3.pricePerStop ? String(b3.pricePerStop) : ''; hasChanges = true; }
          if (b4) { updated.spVsrBand4Stops = b4.maxStops ? String(b4.maxStops) : ''; updated.spVsrBand4Rate = b4.pricePerStop ? String(b4.pricePerStop) : ''; hasChanges = true; }
        }
      }

      // SP_VSR Electric - selecionar o grupo mais novo (4 bandas, ordenadas por minStops)
      if (groupedCostModels.spVsrEletric && groupedCostModels.spVsrEletric.length > 0) {
        const closestGroup = groupedCostModels.spVsrEletric[0];
        if (closestGroup && closestGroup.items.length > 0) {
          const sortedBands = [...closestGroup.items].sort((a, b) => (a.minStops ?? 0) - (b.minStops ?? 0));
          const validityEndDateItem = sortedBands.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || sortedBands[0];
          const [b1, b2, b3, b4] = sortedBands;
          if (b1) {
            updated.spVsrEletricBand1Stops = b1.maxStops ? String(b1.maxStops) : '';
            updated.spVsrEletricBand1Rate = b1.pricePerStop ? String(b1.pricePerStop) : '';
            updated.spVsrEletricValidityStartDate = formatDateOnly(b1.validityStartDate) || '';
            updated.spVsrEletricValidityEndDate = (validityEndDateItem?.validityEndDate && validityEndDateItem.validityEndDate !== null && typeof validityEndDateItem.validityEndDate === 'string' && validityEndDateItem.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItem.validityEndDate) : '';
            hasChanges = true;
          }
          if (b2) { updated.spVsrEletricBand2Stops = b2.maxStops ? String(b2.maxStops) : ''; updated.spVsrEletricBand2Rate = b2.pricePerStop ? String(b2.pricePerStop) : ''; hasChanges = true; }
          if (b3) { updated.spVsrEletricBand3Stops = b3.maxStops ? String(b3.maxStops) : ''; updated.spVsrEletricBand3Rate = b3.pricePerStop ? String(b3.pricePerStop) : ''; hasChanges = true; }
          if (b4) { updated.spVsrEletricBand4Stops = b4.maxStops ? String(b4.maxStops) : ''; updated.spVsrEletricBand4Rate = b4.pricePerStop ? String(b4.pricePerStop) : ''; hasChanges = true; }
        }
      }

      // DAF - selecionar o grupo mais novo
      if (groupedCostModels.daf.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.daf[0];

        if (closestGroup && closestGroup.items.length > 0) {
          // Ordenar items por minStops para garantir ordem correta
          const sortedItems = [...closestGroup.items].sort((a, b) => {
            const minA = a.minStops ?? 0;
            const minB = b.minStops ?? 0;
            return minA - minB;
          });

          // Primeiro band: menor minStops (geralmente 1) ou primeiro item
          const firstBand = sortedItems.find(cm => cm.minStops === 1 || (!cm.minStops && cm.minStops !== 0)) || sortedItems[0];
          // Segundo band: próximo item que não seja o primeiro
          const secondBand = sortedItems.find(cm => cm !== firstBand && (cm.minStops !== 1 || (cm.minStops && cm.minStops > 1))) || (sortedItems.length > 1 ? sortedItems[1] : null);

          // Buscar validityEndDate do primeiro item do grupo que tiver esse valor
          const validityEndDateItemDaf = closestGroup.items.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.dafBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.dafBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
            updated.dafValidityStartDate = formatDateOnly(firstBand.validityStartDate) || '';
            updated.dafValidityEndDate = (validityEndDateItemDaf?.validityEndDate && validityEndDateItemDaf.validityEndDate !== null && typeof validityEndDateItemDaf.validityEndDate === 'string' && validityEndDateItemDaf.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItemDaf.validityEndDate) : '';
            hasChanges = true;
          }
          if (secondBand) {
            updated.dafBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.dafBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
            hasChanges = true;
          }
        }
      }

      // DAF Eletric - selecionar o grupo mais novo
      if (groupedCostModels.dafEletric.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.dafEletric[0];

        if (closestGroup && closestGroup.items.length > 0) {
          const firstBand = closestGroup.items.find(cm => cm.minStops === 1 || !cm.minStops) || closestGroup.items[0];
          const secondBand = closestGroup.items.find(cm => cm.minStops !== 1 && cm.minStops) || (closestGroup.items.length > 1 ? closestGroup.items[1] : null);

          // Buscar validityEndDate do primeiro item do grupo que tiver esse valor
          const validityEndDateItemDafEletric = closestGroup.items.find((cm: CostModelItem) => cm.validityEndDate && cm.validityEndDate !== null && typeof cm.validityEndDate === 'string' && cm.validityEndDate.trim() !== '') || firstBand;

          if (firstBand) {
            updated.dafEletricBand1Stops = firstBand.maxStops ? String(firstBand.maxStops) : '';
            updated.dafEletricBand1Rate = firstBand.fixedPrice ? String(firstBand.fixedPrice) : (firstBand.pricePerStop ? String(firstBand.pricePerStop) : '');
            updated.dafEletricValidityStartDate = formatDateOnly(firstBand.validityStartDate) || '';
            updated.dafEletricValidityEndDate = (validityEndDateItemDafEletric?.validityEndDate && validityEndDateItemDafEletric.validityEndDate !== null && typeof validityEndDateItemDafEletric.validityEndDate === 'string' && validityEndDateItemDafEletric.validityEndDate.trim() !== '') ? formatDateOnly(validityEndDateItemDafEletric.validityEndDate) : '';
            hasChanges = true;
          }
          if (secondBand) {
            updated.dafEletricBand2Stops = secondBand.maxStops ? String(secondBand.maxStops) : '';
            updated.dafEletricBand2Rate = secondBand.pricePerStop ? String(secondBand.pricePerStop) : '';
            hasChanges = true;
          }
        }
      }

      // FSR - selecionar o grupo mais novo
      if (groupedCostModels.fsr.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.fsr[0];

        if (closestGroup && closestGroup.items.length > 0) {
          const fsrModel = closestGroup.items[0];
          updated.fsrStopRate = fsrModel.fixedPrice ? String(fsrModel.fixedPrice) : (fsrModel.pricePerStop ? String(fsrModel.pricePerStop) : '');
          updated.fsrValidityStartDate = formatDateOnly(fsrModel.validityStartDate) || '';
          updated.fsrValidityEndDate = (fsrModel.validityEndDate && fsrModel.validityEndDate !== null && typeof fsrModel.validityEndDate === 'string' && fsrModel.validityEndDate.trim() !== '') ? formatDateOnly(fsrModel.validityEndDate) : '';
          hasChanges = true;
        }
      }

      // DR - selecionar o grupo mais novo
      if (groupedCostModels.dr.length > 0) {
        // Selecionar sempre o primeiro grupo (mais novo)
        const closestGroup = groupedCostModels.dr[0];

        if (closestGroup && closestGroup.items.length > 0) {
          const drModel = closestGroup.items[0];
          updated.drDayRate = drModel.fixedPrice ? String(drModel.fixedPrice) : '';
          updated.drValidityStartDate = formatDateOnly(drModel.validityStartDate) || '';
          updated.drValidityEndDate = (drModel.validityEndDate && drModel.validityEndDate !== null && typeof drModel.validityEndDate === 'string' && drModel.validityEndDate.trim() !== '') ? formatDateOnly(drModel.validityEndDate) : '';
          hasChanges = true;
        }
      }

      return hasChanges ? updated : prev;
    });
  }, [mode, groupedCostModels, vendor?.id, vendor?.originalCostModels, isValidForCurrentDate]);

  const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Permitir teclas de navegação e controle
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      return;
    }

    // Se estiver digitando no campo de ano (primeiros 4 caracteres)
    if (cursorPosition <= 4 && /^\d$/.test(e.key)) {
      const beforeCursor = value.substring(0, cursorPosition);
      const yearPart = beforeCursor.split('-')[0];

      // Se já tem 4 dígitos no ano e está tentando digitar mais, prevenir
      if (yearPart.length >= 4) {
        e.preventDefault();
        return;
      }
    }
  };

  // Handler para campos numéricos inteiros (sem ponto decimal)
  const handleIntegerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegação e controle
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(e.key)) {
      return;
    }

    // Permitir Ctrl/Cmd + A, C, V, X, Z
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
      return;
    }

    // Permitir apenas números
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handler para campos numéricos decimais (com ponto decimal permitido)
  const handleDecimalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;

    // Permitir teclas de navegação e controle
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(e.key)) {
      return;
    }

    // Permitir Ctrl/Cmd + A, C, V, X, Z
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
      return;
    }

    // Permitir números e ponto decimal
    if (/^\d$/.test(e.key)) {
      return; // Número permitido
    }

    // Permitir ponto decimal apenas se ainda não houver um
    if (e.key === '.' && !value.includes('.')) {
      return; // Ponto decimal permitido se não houver outro
    }

    // Bloquear qualquer outro caractere
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Campos que devem aceitar apenas números inteiros (sem ponto decimal)
    const integerFields = [
      'vsrBand1Stops', 'vsrBand2Stops',
      'vsrEletricBand1Stops', 'vsrEletricBand2Stops',
      'spVsrBand1Stops', 'spVsrBand2Stops', 'spVsrBand3Stops', 'spVsrBand4Stops',
      'spVsrEletricBand1Stops', 'spVsrEletricBand2Stops', 'spVsrEletricBand3Stops', 'spVsrEletricBand4Stops',
      'newSpVsrBand1Stops', 'newSpVsrBand2Stops', 'newSpVsrBand3Stops', 'newSpVsrBand4Stops',
      'newSpVsrEletricBand1Stops', 'newSpVsrEletricBand2Stops', 'newSpVsrEletricBand3Stops', 'newSpVsrEletricBand4Stops',
      'dafBand1Stops', 'dafBand2Stops',
      'dafEletricBand1Stops', 'dafEletricBand2Stops',
      'newVsrBand1Stops', 'newVsrBand2Stops',
      'newVsrEletricBand1Stops', 'newVsrEletricBand2Stops',
      'newDafBand1Stops', 'newDafBand2Stops',
      'newDafEletricBand1Stops', 'newDafEletricBand2Stops'
    ];

    // Campos que devem aceitar apenas números (com ponto decimal permitido)
    const decimalFields = [
      'vsrBand1Rate', 'vsrBand2Rate',
      'vsrEletricBand1Rate', 'vsrEletricBand2Rate',
      'spVsrBand1Rate', 'spVsrBand2Rate', 'spVsrBand3Rate', 'spVsrBand4Rate',
      'spVsrEletricBand1Rate', 'spVsrEletricBand2Rate', 'spVsrEletricBand3Rate', 'spVsrEletricBand4Rate',
      'newSpVsrBand1Rate', 'newSpVsrBand2Rate', 'newSpVsrBand3Rate', 'newSpVsrBand4Rate',
      'newSpVsrEletricBand1Rate', 'newSpVsrEletricBand2Rate', 'newSpVsrEletricBand3Rate', 'newSpVsrEletricBand4Rate',
      'dafBand1Rate', 'dafBand2Rate',
      'dafEletricBand1Rate', 'dafEletricBand2Rate',
      'newVsrBand1Rate', 'newVsrBand2Rate',
      'newVsrEletricBand1Rate', 'newVsrEletricBand2Rate',
      'newDafBand1Rate', 'newDafBand2Rate',
      'newDafEletricBand1Rate', 'newDafEletricBand2Rate',
      'fsrStopRate', 'newFsrStopRate',
      'fsrEletricStopRate', 'newFsrEletricStopRate',
      'drDayRate', 'newDrDayRate',
      'drEletricDayRate', 'newDrEletricDayRate',
      'hourlyEletricRate', 'newHourlyEletricRate',
      'dhlTrainingNumber'
    ];

    // Validar se o campo deve aceitar apenas números
    let processedValue = value;
    if (integerFields.includes(id)) {
      // Campos inteiros: apenas números, sem ponto decimal
      if (value === '') {
        processedValue = '';
      } else {
        // Remover qualquer caractere que não seja número
        const numericValue = value.replace(/[^0-9]/g, '');
        processedValue = numericValue;

        // Se o valor foi alterado, atualizar o input diretamente
        if (processedValue !== value && e.target instanceof HTMLInputElement) {
          e.target.value = processedValue;
        }
      }
    } else if (decimalFields.includes(id)) {
      // Campos decimais: números com ponto decimal permitido
      if (value === '') {
        processedValue = '';
      } else {
        // Permitir apenas números e ponto decimal
        let numericValue = value.replace(/[^0-9.]/g, '');

        // Garantir que há no máximo um ponto decimal
        const parts = numericValue.split('.');
        numericValue = parts.length > 2
          ? parts[0] + '.' + parts.slice(1).join('')
          : numericValue;

        processedValue = numericValue;

        // Se o valor foi alterado, atualizar o input diretamente
        if (processedValue !== value && e.target instanceof HTMLInputElement) {
          e.target.value = processedValue;
        }
      }
    }

    // Validar conflito de datas quando validityStartDate ou validityEndDate são alteradas (apenas em modo edit)
    if (mode === 'edit' && type === 'date' && value) {
      const validityDateFields: Record<string, { type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric'; startDateField?: string; endDateField?: string; name: string; isStartDate: boolean }> = {
        // Campos de end date
        vsrValidityEndDate: { type: 'vsr', startDateField: 'vsrValidityStartDate', name: 'VSR', isStartDate: false },
        vsrEletricValidityEndDate: { type: 'vsrEletric', startDateField: 'vsrEletricValidityStartDate', name: 'VSR Electric', isStartDate: false },
        dafValidityEndDate: { type: 'daf', startDateField: 'dafValidityStartDate', name: 'DAF', isStartDate: false },
        dafEletricValidityEndDate: { type: 'dafEletric', startDateField: 'dafEletricValidityStartDate', name: 'DAF Electric', isStartDate: false },
        fsrValidityEndDate: { type: 'fsr', startDateField: 'fsrValidityStartDate', name: 'FSR', isStartDate: false },
        fsrEletricValidityEndDate: { type: 'fsrEletric', startDateField: 'fsrEletricValidityStartDate', name: 'FSR Electric', isStartDate: false },
        drValidityEndDate: { type: 'dr', startDateField: 'drValidityStartDate', name: 'DR', isStartDate: false },
        drEletricValidityEndDate: { type: 'drEletric', startDateField: 'drEletricValidityStartDate', name: 'DR Electric', isStartDate: false },
        hourlyEletricValidityEndDate: { type: 'hourlyEletric', startDateField: 'hourlyEletricValidityStartDate', name: 'Hourly Electric', isStartDate: false },
        newVsrValidityEndDate: { type: 'vsr', startDateField: 'newVsrValidityStartDate', name: 'VSR', isStartDate: false },
        newVsrEletricValidityEndDate: { type: 'vsrEletric', startDateField: 'newVsrEletricValidityStartDate', name: 'VSR Electric', isStartDate: false },
        newDafValidityEndDate: { type: 'daf', startDateField: 'newDafValidityStartDate', name: 'DAF', isStartDate: false },
        newDafEletricValidityEndDate: { type: 'dafEletric', startDateField: 'newDafEletricValidityStartDate', name: 'DAF Electric', isStartDate: false },
        newFsrValidityEndDate: { type: 'fsr', startDateField: 'newFsrValidityStartDate', name: 'FSR', isStartDate: false },
        newFsrEletricValidityEndDate: { type: 'fsrEletric', startDateField: 'newFsrEletricValidityStartDate', name: 'FSR Electric', isStartDate: false },
        newDrValidityEndDate: { type: 'dr', startDateField: 'newDrValidityStartDate', name: 'DR', isStartDate: false },
        newDrEletricValidityEndDate: { type: 'drEletric', startDateField: 'newDrEletricValidityStartDate', name: 'DR Electric', isStartDate: false },
        newHourlyEletricValidityEndDate: { type: 'hourlyEletric', startDateField: 'newHourlyEletricValidityStartDate', name: 'Hourly Electric', isStartDate: false },
        // Campos de start date (quando são inputs, não selects)
        vsrValidityStartDate: { type: 'vsr', endDateField: 'vsrValidityEndDate', name: 'VSR', isStartDate: true },
        vsrEletricValidityStartDate: { type: 'vsrEletric', endDateField: 'vsrEletricValidityEndDate', name: 'VSR Electric', isStartDate: true },
        dafValidityStartDate: { type: 'daf', endDateField: 'dafValidityEndDate', name: 'DAF', isStartDate: true },
        dafEletricValidityStartDate: { type: 'dafEletric', endDateField: 'dafEletricValidityEndDate', name: 'DAF Electric', isStartDate: true },
        fsrValidityStartDate: { type: 'fsr', endDateField: 'fsrValidityEndDate', name: 'FSR', isStartDate: true },
        fsrEletricValidityStartDate: { type: 'fsrEletric', endDateField: 'fsrEletricValidityEndDate', name: 'FSR Electric', isStartDate: true },
        drValidityStartDate: { type: 'dr', endDateField: 'drValidityEndDate', name: 'DR', isStartDate: true },
        drEletricValidityStartDate: { type: 'drEletric', endDateField: 'drEletricValidityEndDate', name: 'DR Electric', isStartDate: true },
        hourlyEletricValidityStartDate: { type: 'hourlyEletric', endDateField: 'hourlyEletricValidityEndDate', name: 'Hourly Electric', isStartDate: true },
      };

      const fieldInfo = validityDateFields[id];
      if (fieldInfo) {
        const isNewField = id.startsWith('new');
        let startDate: string | undefined;
        let endDate: string | undefined;

        if (fieldInfo.isStartDate) {
          startDate = value;
          endDate = fieldInfo.endDateField ? (formData[fieldInfo.endDateField as keyof typeof formData] as string | undefined) : undefined;
        } else {
          startDate = fieldInfo.startDateField ? (formData[fieldInfo.startDateField as keyof typeof formData] as string | undefined) : undefined;
          endDate = value;
        }

        if (startDate) {
          // Para campos novos, não precisamos excluir IDs
          // Para campos editados, precisamos obter os IDs dos cost models que estão sendo editados
          let excludeIds: number[] | undefined = undefined;

          if (!isNewField) {
            // Encontrar IDs dos cost models que estão sendo editados
            const currentVendor = localVendor || vendor;
            const costModels = currentVendor?.originalCostModels as CostModelItem[] || [];
            const originalStartDate = formatDateOnly(startDate);

            let costModelId: number;
            let isElectric: boolean | null;

            switch (fieldInfo.type) {
              case 'vsr':
                costModelId = 4;
                isElectric = false;
                break;
              case 'vsrEletric':
                costModelId = 4;
                isElectric = true;
                break;
              case 'daf':
                costModelId = 1;
                isElectric = false;
                break;
              case 'dafEletric':
                costModelId = 1;
                isElectric = true;
                break;
              case 'fsr':
                costModelId = 3;
                isElectric = false;
                break;
              case 'dr':
                costModelId = 2;
                isElectric = false;
                break;
            }

            excludeIds = [];
            costModels.forEach(cm => {
              // Check if it's the same type
              let matchesType = false;
              if (isElectric === true) {
                // Electric type: must be exactly true
                matchesType = cm.costModelId === costModelId && cm.isElectric === true;
              } else {
                // Non-electric type: can be false or null
                matchesType = cm.costModelId === costModelId &&
                  (cm.isElectric === false || cm.isElectric === null);
              }

              if (matchesType && cm.modelEmployeesId) {
                const cmFormattedDate = formatDateOnly(cm.validityStartDate);
                if (cmFormattedDate === originalStartDate) {
                  excludeIds!.push(cm.modelEmployeesId);
                }
              }
            });
          }

        }

        // Se estamos editando validityEndDate de um item existente (não novo), atualizar próximos items
        // Isso será feito após o setFormData para garantir que usamos os valores atualizados
        if (!fieldInfo.isStartDate && !isNewField && startDate && endDate) {
          // Usar setTimeout para garantir que o estado foi atualizado
          // Passar o novo valor (value) como newEndDate, não o endDate do formData
          const newEndDateValue = value; // valor novo que está sendo digitado
          setTimeout(() => {
            updateNextItemsStartDates(fieldInfo.type, startDate, newEndDateValue);
          }, 0);
        }

        // Se estamos editando validityEndDate de um novo cost model, validar sobreposição e atualizar grupos existentes em cascata
        if (!fieldInfo.isStartDate && isNewField && startDate && value) {
          const newEndDateValue = value;
          const typeNames: Record<string, string> = {
            vsr: 'VSR',
            vsrEletric: 'VSR Electric',
            daf: 'DAF',
            dafEletric: 'DAF Electric',
            fsr: 'FSR',
            fsrEletric: 'FSR Electric',
            dr: 'DR',
            drEletric: 'DR Electric',
            hourlyEletric: 'Hourly Electric',
          };

          // Validar sobreposição de períodos
          const overlapCheck = hasOverlappingDateRange(fieldInfo.type, startDate, newEndDateValue);
          if (overlapCheck.hasOverlap) {
            const overlappingPeriod = overlapCheck.overlappingGroup;
            const periodStr = overlappingPeriod?.endDate
              ? `${formatDateForDisplay(overlappingPeriod.startDate)} to ${formatDateForDisplay(overlappingPeriod.endDate)}`
              : `starting from ${formatDateForDisplay(overlappingPeriod!.startDate)}`;

            showError(
              'Overlapping Date Range',
              `The date range for the new ${typeNames[fieldInfo.type] || fieldInfo.type.toUpperCase()} cost model overlaps with an existing cost model (${periodStr}). Please choose a different date range.`
            );
            return; // Não atualizar o formData se houver sobreposição
          }

          setTimeout(() => {
            updateExistingGroupsForNewCostModel(fieldInfo.type, startDate, newEndDateValue);
          }, 0);
        }

        // Se estamos editando validityStartDate de um item existente (não novo), atualizar item anterior
        // Se a nova start date passar da end date do item anterior, atualizar o end date do anterior
        if (fieldInfo.isStartDate && !isNewField) {
          const oldStartDate = formData[id as keyof typeof formData] as string | undefined; // valor antigo
          const newStartDate = value; // novo valor
          if (oldStartDate && newStartDate) {
            // Usar setTimeout para garantir que o estado foi atualizado
            setTimeout(() => {
              updatePreviousItemEndDate(fieldInfo.type, oldStartDate, newStartDate);
            }, 0);
          }
        }
      }
    }

    setFormData(prev => {
      // Se já processamos o valor para campos numéricos, usar esse valor
      // Caso contrário, usar o valor original ou checked para checkbox
      let finalProcessedValue: string | boolean = type === 'checkbox' ? checked : ((integerFields.includes(id) || decimalFields.includes(id)) ? processedValue : value);

      if (id === 'phone') {
        finalProcessedValue = formatPhone(value);
      }

      // Validar campos de data para limitar ano a 4 dígitos
      if (type === 'date' && value) {
        // Se o valor contém mais de 4 dígitos no ano, corrigir
        const dateMatch = value.match(/^(\d{4,})-(\d{2})-(\d{2})$/);
        if (dateMatch && dateMatch[1].length > 4) {
          // Limitar a 4 dígitos
          finalProcessedValue = `${dateMatch[1].substring(0, 4)}-${dateMatch[2]}-${dateMatch[3]}`;
        } else {
          // Validar formato enquanto digita
          const parts = value.split('-');
          if (parts.length > 0 && parts[0].length > 4) {
            parts[0] = parts[0].substring(0, 4);
            finalProcessedValue = parts.join('-');
          }
        }
      }

      const updated: Partial<Vendor> = {
        ...prev,
        [id]: finalProcessedValue
      };

      if (id === 'status' && (value === 'Active' || value === 'Inactive')) {
        updated.status = value as 'Active' | 'Inactive';
      }

      if (id === 'servicePartnerId') {
        // Converter servicePartnerId string para número
        updated.servicePartnerId = value ? Number(value) : undefined;
      }

      if (mode === 'add' && (id === 'firstName' || id === 'lastName')) {
        const firstName = id === 'firstName' ? value : (prev.firstName || '');
        const lastName = id === 'lastName' ? value : (prev.lastName || '');
        if (firstName && lastName) {
          updated.supplierId = generateVendorId(firstName, lastName, vendors);
        }
      }

      return updated;
    });

    // Guardar alterações do usuário nos campos de bands/rates na ref para preservar quando selecionar no select
    if (mode === 'edit') {
      const bandFields: Record<string, { type: 'vsr' | 'vsrEletric' | 'spVsr' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric'; startDateField: string }> = {
        vsrBand1Stops: { type: 'vsr', startDateField: 'vsrValidityStartDate' },
        vsrBand1Rate: { type: 'vsr', startDateField: 'vsrValidityStartDate' },
        vsrBand2Stops: { type: 'vsr', startDateField: 'vsrValidityStartDate' },
        vsrBand2Rate: { type: 'vsr', startDateField: 'vsrValidityStartDate' },
        vsrEletricBand1Stops: { type: 'vsrEletric', startDateField: 'vsrEletricValidityStartDate' },
        vsrEletricBand1Rate: { type: 'vsrEletric', startDateField: 'vsrEletricValidityStartDate' },
        vsrEletricBand2Stops: { type: 'vsrEletric', startDateField: 'vsrEletricValidityStartDate' },
        vsrEletricBand2Rate: { type: 'vsrEletric', startDateField: 'vsrEletricValidityStartDate' },
        spVsrBand1Stops: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand1Rate: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand2Stops: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand2Rate: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand3Stops: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand3Rate: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand4Stops: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        spVsrBand4Rate: { type: 'spVsr', startDateField: 'spVsrValidityStartDate' },
        dafBand1Stops: { type: 'daf', startDateField: 'dafValidityStartDate' },
        dafBand1Rate: { type: 'daf', startDateField: 'dafValidityStartDate' },
        dafBand2Stops: { type: 'daf', startDateField: 'dafValidityStartDate' },
        dafBand2Rate: { type: 'daf', startDateField: 'dafValidityStartDate' },
        dafEletricBand1Stops: { type: 'dafEletric', startDateField: 'dafEletricValidityStartDate' },
        dafEletricBand1Rate: { type: 'dafEletric', startDateField: 'dafEletricValidityStartDate' },
        dafEletricBand2Stops: { type: 'dafEletric', startDateField: 'dafEletricValidityStartDate' },
        dafEletricBand2Rate: { type: 'dafEletric', startDateField: 'dafEletricValidityStartDate' },
        fsrStopRate: { type: 'fsr', startDateField: 'fsrValidityStartDate' },
        fsrEletricStopRate: { type: 'fsrEletric', startDateField: 'fsrEletricValidityStartDate' },
        drDayRate: { type: 'dr', startDateField: 'drValidityStartDate' },
        drEletricDayRate: { type: 'drEletric', startDateField: 'drEletricValidityStartDate' },
        hourlyEletricRate: { type: 'hourlyEletric', startDateField: 'hourlyEletricValidityStartDate' },
      };

      const fieldInfo = bandFields[id];
      if (fieldInfo) {
        // Usar setTimeout para garantir que o formData foi atualizado
        setTimeout(() => {
          setFormData(currentFormData => {
            const startDate = currentFormData[fieldInfo.startDateField as keyof typeof currentFormData] as string | undefined;
            if (startDate) {
              const dateKey = formatDateOnly(startDate);
              if (dateKey) {
                const changeKey = `${fieldInfo.type}_${dateKey}`;
                if (!userChangesByDateRef.current[changeKey]) {
                  userChangesByDateRef.current[changeKey] = {};
                }

                // Guardar todos os valores atuais do tipo
                switch (fieldInfo.type) {
                  case 'vsr':
                    userChangesByDateRef.current[changeKey].vsr = {
                      band1Stops: currentFormData.vsrBand1Stops ?? '',
                      band1Rate: currentFormData.vsrBand1Rate ?? '',
                      band2Stops: currentFormData.vsrBand2Stops ?? '',
                      band2Rate: currentFormData.vsrBand2Rate ?? '',
                      validityStartDate: currentFormData.vsrValidityStartDate ?? '',
                      validityEndDate: currentFormData.vsrValidityEndDate ?? ''
                    };
                    break;
                  case 'vsrEletric':
                    userChangesByDateRef.current[changeKey].vsrEletric = {
                      band1Stops: currentFormData.vsrEletricBand1Stops ?? '',
                      band1Rate: currentFormData.vsrEletricBand1Rate ?? '',
                      band2Stops: currentFormData.vsrEletricBand2Stops ?? '',
                      band2Rate: currentFormData.vsrEletricBand2Rate ?? '',
                      validityStartDate: currentFormData.vsrEletricValidityStartDate ?? '',
                      validityEndDate: currentFormData.vsrEletricValidityEndDate ?? ''
                    };
                    break;
                  case 'spVsr':
                    userChangesByDateRef.current[changeKey].spVsr = {
                      band1Stops: currentFormData.spVsrBand1Stops ?? '',
                      band1Rate: currentFormData.spVsrBand1Rate ?? '',
                      band2Stops: currentFormData.spVsrBand2Stops ?? '',
                      band2Rate: currentFormData.spVsrBand2Rate ?? '',
                      band3Stops: currentFormData.spVsrBand3Stops ?? '',
                      band3Rate: currentFormData.spVsrBand3Rate ?? '',
                      band4Stops: currentFormData.spVsrBand4Stops ?? '',
                      band4Rate: currentFormData.spVsrBand4Rate ?? '',
                      validityStartDate: currentFormData.spVsrValidityStartDate ?? '',
                      validityEndDate: currentFormData.spVsrValidityEndDate ?? ''
                    };
                    break;
                  case 'daf':
                    userChangesByDateRef.current[changeKey].daf = {
                      band1Stops: currentFormData.dafBand1Stops ?? '',
                      band1Rate: currentFormData.dafBand1Rate ?? '',
                      band2Stops: currentFormData.dafBand2Stops ?? '',
                      band2Rate: currentFormData.dafBand2Rate ?? '',
                      validityStartDate: currentFormData.dafValidityStartDate ?? '',
                      validityEndDate: currentFormData.dafValidityEndDate ?? ''
                    };
                    break;
                  case 'dafEletric':
                    userChangesByDateRef.current[changeKey].dafEletric = {
                      band1Stops: currentFormData.dafEletricBand1Stops ?? '',
                      band1Rate: currentFormData.dafEletricBand1Rate ?? '',
                      band2Stops: currentFormData.dafEletricBand2Stops ?? '',
                      band2Rate: currentFormData.dafEletricBand2Rate ?? '',
                      validityStartDate: currentFormData.dafEletricValidityStartDate ?? '',
                      validityEndDate: currentFormData.dafEletricValidityEndDate ?? ''
                    };
                    break;
                  case 'fsr':
                    userChangesByDateRef.current[changeKey].fsr = {
                      stopRate: currentFormData.fsrStopRate ?? '',
                      validityStartDate: currentFormData.fsrValidityStartDate ?? '',
                      validityEndDate: currentFormData.fsrValidityEndDate ?? ''
                    };
                    break;
                  case 'fsrEletric':
                    userChangesByDateRef.current[changeKey].fsrEletric = {
                      stopRate: currentFormData.fsrEletricStopRate ?? '',
                      validityStartDate: currentFormData.fsrEletricValidityStartDate ?? '',
                      validityEndDate: currentFormData.fsrEletricValidityEndDate ?? ''
                    };
                    break;
                  case 'dr':
                    userChangesByDateRef.current[changeKey].dr = {
                      dayRate: currentFormData.drDayRate ?? '',
                      validityStartDate: currentFormData.drValidityStartDate ?? '',
                      validityEndDate: currentFormData.drValidityEndDate ?? ''
                    };
                    break;
                  case 'drEletric':
                    userChangesByDateRef.current[changeKey].drEletric = {
                      dayRate: currentFormData.drEletricDayRate ?? '',
                      validityStartDate: currentFormData.drEletricValidityStartDate ?? '',
                      validityEndDate: currentFormData.drEletricValidityEndDate ?? ''
                    };
                    break;
                  case 'hourlyEletric':
                    userChangesByDateRef.current[changeKey].hourlyEletric = {
                      hourlyRate: currentFormData.hourlyEletricRate ?? '',
                      validityStartDate: currentFormData.hourlyEletricValidityStartDate ?? '',
                      validityEndDate: currentFormData.hourlyEletricValidityEndDate ?? ''
                    };
                    break;
                }
              }
            }
            return currentFormData;
          });
        }, 0);
      }
    }
  };

  const handleSave = async () => {
    // Validar campos obrigatórios - verificar se são strings não vazias
    const firstNameStr = formData.firstName ? String(formData.firstName).trim() : '';
    const lastNameStr = formData.lastName ? String(formData.lastName).trim() : '';
    const emailStr = formData.email ? String(formData.email).trim() : '';
    const phoneStr = formData.phone ? String(formData.phone).trim() : '';
    const dobStr = formData.dob ? String(formData.dob).trim() : '';
    const vendorTypeStr = formData.vendorType ? String(formData.vendorType).trim() : '';
    const depotStr = formData.depot ? String(formData.depot).trim() : '';
    // Para o startDate, verificar se existe e não está vazio
    // Pode vir como string vazia ou undefined
    const startDateValue = formData.startDate;
    const startDateStr = startDateValue ? String(startDateValue).trim() : '';
    // User Type é obrigatório apenas no modo de criação
    const userTypeStr = formData.userType ? String(formData.userType).trim() : '';
    // Payment Model é obrigatório
    const paymentModelStr = formData.paymentModel ? String(formData.paymentModel).trim() : '';
    // Route e Vehicle Registration são obrigatórios
    const routeStr = formData.routeIdLink ? String(formData.routeIdLink).trim() : '';
    const vehicleRegStr = formData.vehicleRegLink ? String(formData.vehicleRegLink).trim() : '';

    const firstNameValid = firstNameStr !== '';
    const lastNameValid = lastNameStr !== '';
    const emailValid = emailStr !== '';
    const phoneValid = phoneStr !== '';
    const dobValid = dobStr !== '';
    const vendorTypeValid = vendorTypeStr !== '';
    const depotValid = depotStr !== '';
    // Validação de data: deve ter formato válido (pelo menos 8 caracteres para yyyy-mm-dd)
    // ou ser um objeto Date válido
    const isDateObject = startDateValue && typeof startDateValue === 'object' && 'getTime' in startDateValue;
    const startDateValid = startDateStr !== '' && (startDateStr.length >= 8 || isDateObject);
    // User Type é obrigatório apenas no modo de criação (add)
    const userTypeValid = mode === 'add' ? userTypeStr !== '' : true;
    const paymentModelValid = paymentModelStr !== '';
    const routeValid = routeStr !== '';
    const vehicleRegValid = vehicleRegStr !== '';

    if (!firstNameValid || !lastNameValid || !emailValid || !phoneValid || !dobValid || !vendorTypeValid || !depotValid || !startDateValid || !userTypeValid || !paymentModelValid || !routeValid || !vehicleRegValid) {
      // Navegar para o step que contém os campos faltantes
      if (!firstNameValid || !lastNameValid || !emailValid || !phoneValid || !dobValid || !vendorTypeValid || !depotValid || !userTypeValid) {
        setCurrentStep('personal');
      } else if (!startDateValid || !routeValid || !vehicleRegValid) {
        setCurrentStep('employment');
      } else if (!paymentModelValid) {
        setCurrentStep('cost');
      }

      const missingFields = [];
      if (!firstNameValid) missingFields.push('First Name');
      if (!lastNameValid) missingFields.push('Last Name');
      if (!emailValid) missingFields.push('Email');
      if (!phoneValid) missingFields.push('Phone');
      if (!dobValid) missingFields.push('Date of Birth');
      if (!vendorTypeValid) missingFields.push('Vendor Type');
      if (!depotValid) missingFields.push('Depot');
      if (!userTypeValid) missingFields.push('User Type');
      if (!startDateValid) missingFields.push('Start Date');
      if (!routeValid) missingFields.push('Route');
      if (!vehicleRegValid) missingFields.push('Vehicle Registration');
      if (!paymentModelValid) missingFields.push('Payment Model');

      showError(
        'Required Fields',
        `Please fill in the required fields: ${missingFields.join(', ')}`
      );
      return;
    }

    // Validar conflitos de datas para cost models (apenas em modo edit)
    if (mode === 'edit') {
      // Validar novos cost models
      const newCostModelTypes: Array<{ type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric'; startDate: string | undefined; endDate: string | undefined; name: string }> = [
        { type: 'vsr', startDate: formData.newVsrValidityStartDate, endDate: formData.newVsrValidityEndDate, name: 'VSR' },
        { type: 'vsrEletric', startDate: formData.newVsrEletricValidityStartDate, endDate: formData.newVsrEletricValidityEndDate, name: 'VSR Electric' },
        { type: 'daf', startDate: formData.newDafValidityStartDate, endDate: formData.newDafValidityEndDate, name: 'DAF' },
        { type: 'dafEletric', startDate: formData.newDafEletricValidityStartDate, endDate: formData.newDafEletricValidityEndDate, name: 'DAF Electric' },
        { type: 'fsr', startDate: formData.newFsrValidityStartDate, endDate: formData.newFsrValidityEndDate, name: 'FSR' },
        { type: 'fsrEletric', startDate: formData.newFsrEletricValidityStartDate, endDate: formData.newFsrEletricValidityEndDate, name: 'FSR Electric' },
        { type: 'dr', startDate: formData.newDrValidityStartDate, endDate: formData.newDrValidityEndDate, name: 'DR' },
        { type: 'drEletric', startDate: formData.newDrEletricValidityStartDate, endDate: formData.newDrEletricValidityEndDate, name: 'DR Electric' },
        { type: 'hourlyEletric', startDate: formData.newHourlyEletricValidityStartDate, endDate: formData.newHourlyEletricValidityEndDate, name: 'Hourly Electric' },
      ];

      for (const { type, startDate } of newCostModelTypes) {
        if (startDate) {
          // Verificar duplicata de start date
          if (hasDuplicateValidityStartDate(type, startDate)) {
            const name = newCostModelTypes.find(n => n.type === type && n.startDate === startDate)?.name || type.toUpperCase();
            showError(
              'Duplicate Cost Model',
              `A cost model of type ${name} with start date ${formatDateForDisplay(startDate)} already exists. Please choose another date.`
            );
            setCurrentStep('cost');
            return;
          }

        }
      }

      // Validar cost models editados (campos antigos)
      // Obter IDs dos cost models que estão sendo editados para excluí-los da verificação
      const currentVendor = localVendor || vendor;
      const costModels = currentVendor?.originalCostModels as CostModelItem[] || [];

      const editedCostModelTypes: Array<{ type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric'; startDate: string | undefined; endDate: string | undefined; name: string }> = [
        { type: 'vsr', startDate: formData.vsrValidityStartDate, endDate: formData.vsrValidityEndDate, name: 'VSR' },
        { type: 'vsrEletric', startDate: formData.vsrEletricValidityStartDate, endDate: formData.vsrEletricValidityEndDate, name: 'VSR Electric' },
        { type: 'daf', startDate: formData.dafValidityStartDate, endDate: formData.dafValidityEndDate, name: 'DAF' },
        { type: 'dafEletric', startDate: formData.dafEletricValidityStartDate, endDate: formData.dafEletricValidityEndDate, name: 'DAF Electric' },
        { type: 'fsr', startDate: formData.fsrValidityStartDate, endDate: formData.fsrValidityEndDate, name: 'FSR' },
        { type: 'fsrEletric', startDate: formData.fsrEletricValidityStartDate, endDate: formData.fsrEletricValidityEndDate, name: 'FSR Electric' },
        { type: 'dr', startDate: formData.drValidityStartDate, endDate: formData.drValidityEndDate, name: 'DR' },
        { type: 'drEletric', startDate: formData.drEletricValidityStartDate, endDate: formData.drEletricValidityEndDate, name: 'DR Electric' },
        { type: 'hourlyEletric', startDate: formData.hourlyEletricValidityStartDate, endDate: formData.hourlyEletricValidityEndDate, name: 'Hourly Electric' },
      ];

      for (const { type, startDate } of editedCostModelTypes) {
        if (startDate) {
          // Encontrar os IDs dos cost models que estão sendo editados (mesmo tipo e mesma validityStartDate original)
          const originalStartDate = formatDateOnly(startDate);
          const excludeIds: number[] = [];

          // Determinar costModelId e isElectric
          let costModelId: number;
          let isElectric: boolean | null;

          switch (type) {
            case 'vsr':
              costModelId = 4;
              isElectric = false;
              break;
            case 'vsrEletric':
              costModelId = 4;
              isElectric = true;
              break;
            case 'daf':
              costModelId = 1;
              isElectric = false;
              break;
            case 'dafEletric':
              costModelId = 1;
              isElectric = true;
              break;
            case 'fsr':
              costModelId = 3;
              isElectric = false;
              break;
            case 'dr':
              costModelId = 2;
              isElectric = false;
              break;
          }

          // Encontrar cost models do mesmo tipo com a mesma validityStartDate original
          costModels.forEach(cm => {
            // Check if it's the same type
            let matchesType = false;
            if (isElectric === true) {
              // Electric type: must be exactly true
              matchesType = cm.costModelId === costModelId && cm.isElectric === true;
            } else {
              // Non-electric type: can be false or null
              matchesType = cm.costModelId === costModelId &&
                (cm.isElectric === false || cm.isElectric === null);
            }

            if (matchesType && cm.modelEmployeesId) {
              const cmFormattedDate = formatDateOnly(cm.validityStartDate);
              if (cmFormattedDate === originalStartDate) {
                excludeIds.push(cm.modelEmployeesId);
              }
            }
          });

        }
      }
    }

    // Validar cost models: se algum campo foi preenchido, todos os campos obrigatórios devem ser preenchidos
    // (exceto Validity End Date para novos itens ou primeiro item)
    const validateCostModel = (
      fields: {
        rate1?: string;
        stops1?: string;
        rate2?: string;
        stops2?: string;
        fixedRate?: string;
        validityStartDate?: string;
        validityEndDate?: string;
      },
      isNew: boolean,
      modelName: string
    ): { valid: boolean; missingFields: string[] } => {
      const missingFields: string[] = [];

      // Helper para verificar se um campo está preenchido
      const isFilled = (value: string | undefined | null): boolean => {
        return value !== undefined && value !== null && String(value).trim() !== '';
      };

      // Verificar se algum campo foi preenchido
      const hasAnyField = isFilled(fields.rate1) || isFilled(fields.stops1) ||
        isFilled(fields.rate2) || isFilled(fields.stops2) ||
        isFilled(fields.fixedRate) || isFilled(fields.validityStartDate) ||
        isFilled(fields.validityEndDate);

      if (!hasAnyField) {
        return { valid: true, missingFields: [] };
      }

      // Se algum campo foi preenchido, validar todos os campos obrigatórios
      // Para modelos com bands (VSR, DAF)
      if (isFilled(fields.rate1) || isFilled(fields.stops1) || isFilled(fields.rate2) || isFilled(fields.stops2)) {
        if (!isFilled(fields.stops1)) missingFields.push(`${modelName} Band 1 Max Stops`);
        if (!isFilled(fields.rate1)) missingFields.push(`${modelName} Band 1 Rate`);
        if (!isFilled(fields.stops2)) missingFields.push(`${modelName} Band 2 Max Stops`);
        if (!isFilled(fields.rate2)) missingFields.push(`${modelName} Band 2 Rate`);
        if (!isFilled(fields.validityStartDate)) missingFields.push(`${modelName} Validity Start Date`);
        // Validity End Date é opcional para novos itens
      }
      // Para modelos com fixed rate (FSR, DR)
      else if (isFilled(fields.fixedRate)) {
        if (!isFilled(fields.fixedRate)) missingFields.push(`${modelName} Rate`);
        if (!isFilled(fields.validityStartDate)) missingFields.push(`${modelName} Validity Start Date`);
        // Validity End Date é opcional para novos itens
      }
      // Se apenas validityStartDate foi preenchido, verificar qual tipo de modelo
      else if (isFilled(fields.validityStartDate)) {
        // Se há campos de bands definidos (mesmo que vazios), é um modelo com bands
        if (fields.rate1 !== undefined || fields.stops1 !== undefined ||
          fields.rate2 !== undefined || fields.stops2 !== undefined) {
          if (!isFilled(fields.stops1)) missingFields.push(`${modelName} Band 1 Max Stops`);
          if (!isFilled(fields.rate1)) missingFields.push(`${modelName} Band 1 Rate`);
          if (!isFilled(fields.stops2)) missingFields.push(`${modelName} Band 2 Max Stops`);
          if (!isFilled(fields.rate2)) missingFields.push(`${modelName} Band 2 Rate`);
        }
        // Se há fixedRate definido (mesmo que vazio), é um modelo com fixed rate
        else if (fields.fixedRate !== undefined) {
          if (!isFilled(fields.fixedRate)) missingFields.push(`${modelName} Rate`);
        }
      }

      return {
        valid: missingFields.length === 0,
        missingFields
      };
    };

    // Validação específica para modelos com 4 bands (SP_VSR e SP_VSR_ELECTRIC)
    const validateCostModelWith4Bands = (
      fields: {
        rate1?: string;
        stops1?: string;
        rate2?: string;
        stops2?: string;
        rate3?: string;
        stops3?: string;
        rate4?: string;
        stops4?: string;
        validityStartDate?: string;
        validityEndDate?: string;
      },
      modelName: string
    ): { valid: boolean; missingFields: string[] } => {
      const missingFields: string[] = [];

      const isFilled = (value: string | undefined | null): boolean => {
        return value !== undefined && value !== null && String(value).trim() !== '';
      };

      // Verificar se algum campo foi preenchido
      const hasAnyField = isFilled(fields.rate1) || isFilled(fields.stops1) ||
        isFilled(fields.rate2) || isFilled(fields.stops2) ||
        isFilled(fields.rate3) || isFilled(fields.stops3) ||
        isFilled(fields.rate4) || isFilled(fields.stops4) ||
        isFilled(fields.validityStartDate) || isFilled(fields.validityEndDate);

      if (!hasAnyField) {
        return { valid: true, missingFields: [] };
      }

      // Se algum campo foi preenchido, todos os 4 bands devem ser preenchidos
      if (isFilled(fields.rate1) || isFilled(fields.stops1) ||
          isFilled(fields.rate2) || isFilled(fields.stops2) ||
          isFilled(fields.rate3) || isFilled(fields.stops3) ||
          isFilled(fields.rate4) || isFilled(fields.stops4)) {

        // Validar que TODOS os 4 bands estão preenchidos
        if (!isFilled(fields.stops1)) missingFields.push(`${modelName} Band 1 Max Stops`);
        if (!isFilled(fields.rate1)) missingFields.push(`${modelName} Band 1 Rate`);
        if (!isFilled(fields.stops2)) missingFields.push(`${modelName} Band 2 Max Stops`);
        if (!isFilled(fields.rate2)) missingFields.push(`${modelName} Band 2 Rate`);
        if (!isFilled(fields.stops3)) missingFields.push(`${modelName} Band 3 Max Stops`);
        if (!isFilled(fields.rate3)) missingFields.push(`${modelName} Band 3 Rate`);
        if (!isFilled(fields.stops4)) missingFields.push(`${modelName} Band 4 Max Stops`);
        if (!isFilled(fields.rate4)) missingFields.push(`${modelName} Band 4 Rate`);
        if (!isFilled(fields.validityStartDate)) missingFields.push(`${modelName} Validity Start Date`);
      }

      return {
        valid: missingFields.length === 0,
        missingFields
      };
    };

    // Validar cost models existentes (modo edit) e novos (ambos os modos)
    const costModelValidations: Array<{ valid: boolean; missingFields: string[]; name: string }> = [];

    // VSR (não elétrico)
    const vsrValidation = validateCostModel(
      {
        rate1: formData.vsrBand1Rate,
        stops1: formData.vsrBand1Stops,
        rate2: formData.vsrBand2Rate,
        stops2: formData.vsrBand2Stops,
        validityStartDate: formData.vsrValidityStartDate,
        validityEndDate: formData.vsrValidityEndDate,
      },
      false,
      'VSR'
    );
    if (!vsrValidation.valid) {
      costModelValidations.push({ ...vsrValidation, name: 'VSR' });
    }

    // VSR Electric
    const vsrEletricValidation = validateCostModel(
      {
        rate1: formData.vsrEletricBand1Rate,
        stops1: formData.vsrEletricBand1Stops,
        rate2: formData.vsrEletricBand2Rate,
        stops2: formData.vsrEletricBand2Stops,
        validityStartDate: formData.vsrEletricValidityStartDate,
        validityEndDate: formData.vsrEletricValidityEndDate,
      },
      false,
      'VSR Electric'
    );
    if (!vsrEletricValidation.valid) {
      costModelValidations.push({ ...vsrEletricValidation, name: 'VSR Electric' });
    }

    // SP_VSR (4 bands)
    const spVsrValidation = validateCostModelWith4Bands(
      {
        rate1: formData.spVsrBand1Rate,
        stops1: formData.spVsrBand1Stops,
        rate2: formData.spVsrBand2Rate,
        stops2: formData.spVsrBand2Stops,
        rate3: formData.spVsrBand3Rate,
        stops3: formData.spVsrBand3Stops,
        rate4: formData.spVsrBand4Rate,
        stops4: formData.spVsrBand4Stops,
        validityStartDate: formData.spVsrValidityStartDate,
        validityEndDate: formData.spVsrValidityEndDate,
      },
      'SP VSR'
    );
    if (!spVsrValidation.valid) {
      costModelValidations.push({ ...spVsrValidation, name: 'SP VSR' });
    }

    // SP_VSR Electric (4 bands)
    const spVsrEletricValidation = validateCostModelWith4Bands(
      {
        rate1: formData.spVsrEletricBand1Rate,
        stops1: formData.spVsrEletricBand1Stops,
        rate2: formData.spVsrEletricBand2Rate,
        stops2: formData.spVsrEletricBand2Stops,
        rate3: formData.spVsrEletricBand3Rate,
        stops3: formData.spVsrEletricBand3Stops,
        rate4: formData.spVsrEletricBand4Rate,
        stops4: formData.spVsrEletricBand4Stops,
        validityStartDate: formData.spVsrEletricValidityStartDate,
        validityEndDate: formData.spVsrEletricValidityEndDate,
      },
      'SP VSR Electric'
    );
    if (!spVsrEletricValidation.valid) {
      costModelValidations.push({ ...spVsrEletricValidation, name: 'SP VSR Electric' });
    }

    // FSR
    const fsrValidation = validateCostModel(
      {
        fixedRate: formData.fsrStopRate,
        validityStartDate: formData.fsrValidityStartDate,
        validityEndDate: formData.fsrValidityEndDate,
      },
      false,
      'FSR'
    );
    if (!fsrValidation.valid) {
      costModelValidations.push({ ...fsrValidation, name: 'FSR' });
    }

    // DR
    const drValidation = validateCostModel(
      {
        fixedRate: formData.drDayRate,
        validityStartDate: formData.drValidityStartDate,
        validityEndDate: formData.drValidityEndDate,
      },
      false,
      'DR'
    );
    if (!drValidation.valid) {
      costModelValidations.push({ ...drValidation, name: 'DR' });
    }

    // DAF (não elétrico)
    const dafValidation = validateCostModel(
      {
        rate1: formData.dafBand1Rate,
        stops1: formData.dafBand1Stops,
        rate2: formData.dafBand2Rate,
        stops2: formData.dafBand2Stops,
        validityStartDate: formData.dafValidityStartDate,
        validityEndDate: formData.dafValidityEndDate,
      },
      false,
      'DAF'
    );
    if (!dafValidation.valid) {
      costModelValidations.push({ ...dafValidation, name: 'DAF' });
    }

    // DAF Electric
    const dafEletricValidation = validateCostModel(
      {
        rate1: formData.dafEletricBand1Rate,
        stops1: formData.dafEletricBand1Stops,
        rate2: formData.dafEletricBand2Rate,
        stops2: formData.dafEletricBand2Stops,
        validityStartDate: formData.dafEletricValidityStartDate,
        validityEndDate: formData.dafEletricValidityEndDate,
      },
      false,
      'DAF Electric'
    );
    if (!dafEletricValidation.valid) {
      costModelValidations.push({ ...dafEletricValidation, name: 'DAF Electric' });
    }

    // Validar novos cost models (apenas em modo edit)
    if (mode === 'edit') {
      // New VSR
      const newVsrValidation = validateCostModel(
        {
          rate1: formData.newVsrBand1Rate,
          stops1: formData.newVsrBand1Stops,
          rate2: formData.newVsrBand2Rate,
          stops2: formData.newVsrBand2Stops,
          validityStartDate: formData.newVsrValidityStartDate,
          validityEndDate: formData.newVsrValidityEndDate,
        },
        true,
        'New VSR'
      );
      if (!newVsrValidation.valid) {
        costModelValidations.push({ ...newVsrValidation, name: 'New VSR' });
      }

      // New VSR Electric
      const newVsrEletricValidation = validateCostModel(
        {
          rate1: formData.newVsrEletricBand1Rate,
          stops1: formData.newVsrEletricBand1Stops,
          rate2: formData.newVsrEletricBand2Rate,
          stops2: formData.newVsrEletricBand2Stops,
          validityStartDate: formData.newVsrEletricValidityStartDate,
          validityEndDate: formData.newVsrEletricValidityEndDate,
        },
        true,
        'New VSR Electric'
      );
      if (!newVsrEletricValidation.valid) {
        costModelValidations.push({ ...newVsrEletricValidation, name: 'New VSR Electric' });
      }

      // New SP_VSR (4 bands)
      const newSpVsrValidation = validateCostModelWith4Bands(
        {
          rate1: formData.newSpVsrBand1Rate,
          stops1: formData.newSpVsrBand1Stops,
          rate2: formData.newSpVsrBand2Rate,
          stops2: formData.newSpVsrBand2Stops,
          rate3: formData.newSpVsrBand3Rate,
          stops3: formData.newSpVsrBand3Stops,
          rate4: formData.newSpVsrBand4Rate,
          stops4: formData.newSpVsrBand4Stops,
          validityStartDate: formData.newSpVsrValidityStartDate,
          validityEndDate: formData.newSpVsrValidityEndDate,
        },
        'New SP VSR'
      );
      if (!newSpVsrValidation.valid) {
        costModelValidations.push({ ...newSpVsrValidation, name: 'New SP VSR' });
      }

      // New SP_VSR Electric (4 bands)
      const newSpVsrEletricValidation = validateCostModelWith4Bands(
        {
          rate1: formData.newSpVsrEletricBand1Rate,
          stops1: formData.newSpVsrEletricBand1Stops,
          rate2: formData.newSpVsrEletricBand2Rate,
          stops2: formData.newSpVsrEletricBand2Stops,
          rate3: formData.newSpVsrEletricBand3Rate,
          stops3: formData.newSpVsrEletricBand3Stops,
          rate4: formData.newSpVsrEletricBand4Rate,
          stops4: formData.newSpVsrEletricBand4Stops,
          validityStartDate: formData.newSpVsrEletricValidityStartDate,
          validityEndDate: formData.newSpVsrEletricValidityEndDate,
        },
        'New SP VSR Electric'
      );
      if (!newSpVsrEletricValidation.valid) {
        costModelValidations.push({ ...newSpVsrEletricValidation, name: 'New SP VSR Electric' });
      }

      // New FSR
      const newFsrValidation = validateCostModel(
        {
          fixedRate: formData.newFsrStopRate,
          validityStartDate: formData.newFsrValidityStartDate,
          validityEndDate: formData.newFsrValidityEndDate,
        },
        true,
        'New FSR'
      );
      if (!newFsrValidation.valid) {
        costModelValidations.push({ ...newFsrValidation, name: 'New FSR' });
      }

      // New DR
      const newDrValidation = validateCostModel(
        {
          fixedRate: formData.newDrDayRate,
          validityStartDate: formData.newDrValidityStartDate,
          validityEndDate: formData.newDrValidityEndDate,
        },
        true,
        'New DR'
      );
      if (!newDrValidation.valid) {
        costModelValidations.push({ ...newDrValidation, name: 'New DR' });
      }

      // New DAF
      const newDafValidation = validateCostModel(
        {
          rate1: formData.newDafBand1Rate,
          stops1: formData.newDafBand1Stops,
          rate2: formData.newDafBand2Rate,
          stops2: formData.newDafBand2Stops,
          validityStartDate: formData.newDafValidityStartDate,
          validityEndDate: formData.newDafValidityEndDate,
        },
        true,
        'New DAF'
      );
      if (!newDafValidation.valid) {
        costModelValidations.push({ ...newDafValidation, name: 'New DAF' });
      }

      // New DAF Electric
      const newDafEletricValidation = validateCostModel(
        {
          rate1: formData.newDafEletricBand1Rate,
          stops1: formData.newDafEletricBand1Stops,
          rate2: formData.newDafEletricBand2Rate,
          stops2: formData.newDafEletricBand2Stops,
          validityStartDate: formData.newDafEletricValidityStartDate,
          validityEndDate: formData.newDafEletricValidityEndDate,
        },
        true,
        'New DAF Electric'
      );
      if (!newDafEletricValidation.valid) {
        costModelValidations.push({ ...newDafEletricValidation, name: 'New DAF Electric' });
      }
    }

    // Se houver erros de validação, mostrar mensagem e navegar para o step de cost
    if (costModelValidations.length > 0) {
      const allMissingFields = costModelValidations.flatMap(v => v.missingFields);
      showError(
        'Incomplete Cost Model',
        `Please fill in all required fields for the cost models: ${allMissingFields.join(', ')}`
      );
      setCurrentStep('cost');
      return;
    }

    try {
      // Em modo de edição, incluir os costModels atualizados do localVendor com modelEmployeesId
      // Em modo de adição, criar costModels a partir dos dados do formulário
      let costModelsToSave: CostModelItem[] | undefined = undefined;

      if ((mode === 'edit' && localVendor?.originalCostModels && Array.isArray(localVendor.originalCostModels)) || mode === 'add') {
        // Inicializar baseModels: em edit usa cost models existentes, em add começa vazio
        const baseModels = (mode === 'edit' && localVendor?.originalCostModels && Array.isArray(localVendor.originalCostModels))
          ? localVendor.originalCostModels
          : [];

        // Índice da banda por posição no array original para SP_VSR (normal/elétrico),
        // agrupado por validityStartDate. Isso evita perder a identificação da banda
        // quando o usuário altera os limites (maxStops) no formulário.
        const spVsrBandIndexByArrayIndex = new Map<number, number>();
        const spVsrElectricBandIndexByArrayIndex = new Map<number, number>();

        const spVsrGroups = new Map<string, Array<{ idx: number; cm: CostModelItem }>>();
        baseModels.forEach((cm, idx) => {
          if (cm.costModelId !== 12) return;
          const startDate = formatDateOnly(cm.validityStartDate);
          if (!startDate) return;
          const isElectric = cm.isElectric === true;
          const key = `${startDate}|${isElectric ? '1' : '0'}`;
          if (!spVsrGroups.has(key)) spVsrGroups.set(key, []);
          spVsrGroups.get(key)!.push({ idx, cm });
        });

        spVsrGroups.forEach((items, key) => {
          const sorted = [...items].sort((a, b) => {
            const minA = Number(a.cm.minStops ?? Number.MAX_SAFE_INTEGER);
            const minB = Number(b.cm.minStops ?? Number.MAX_SAFE_INTEGER);
            if (minA !== minB) return minA - minB;

            const idA = Number(a.cm.modelEmployeesId ?? Number.MAX_SAFE_INTEGER);
            const idB = Number(b.cm.modelEmployeesId ?? Number.MAX_SAFE_INTEGER);
            if (idA !== idB) return idA - idB;

            return a.idx - b.idx;
          });

          const isElectric = key.endsWith('|1');
          sorted.forEach((item, position) => {
            const bandNumber = position + 1;
            if (isElectric) {
              spVsrElectricBandIndexByArrayIndex.set(item.idx, bandNumber);
            } else {
              spVsrBandIndexByArrayIndex.set(item.idx, bandNumber);
            }
          });
        });

        // Atualizar os costModels com os valores do formulário antes de salvar
        const updatedCostModels = baseModels.map((cm, cmIndex) => {
          const updated = { ...cm };

          // Determinar o tipo baseado no costModelId e isElectric
          const isVSR = cm.costModelId === 4 && (cm.isElectric === false || cm.isElectric === null);
          const isVSRElectric = cm.costModelId === 4 && cm.isElectric === true;
          const isDAF = cm.costModelId === 1 && (cm.isElectric === false || cm.isElectric === null);
          const isDAFElectric = cm.costModelId === 1 && cm.isElectric === true;
          const isFSR = cm.costModelId === 3 && (cm.isElectric === false || cm.isElectric === null);
          const isDR = cm.costModelId === 2 && (cm.isElectric === false || cm.isElectric === null);
          const isHourly = cm.costModelId === 7;

          // Verificar se este cost model está sendo editado no formulário (mesma validityStartDate)
          const cmStartDate = formatDateOnly(cm.validityStartDate);
          if (!cmStartDate) return updated;

          // VSR
          if (isVSR && formData.vsrValidityStartDate) {
            const formStartDate = formatDateOnly(formData.vsrValidityStartDate);
            if (formStartDate === cmStartDate) {
              // Este é o grupo sendo editado
              if (cm.minStops === 1 || !cm.minStops) {
                // First band
                if (formData.vsrBand1Stops) updated.maxStops = Number(formData.vsrBand1Stops);
                if (formData.vsrBand1Rate) updated.pricePerStop = Number(formData.vsrBand1Rate);
              } else {
                // Second band
                const firstBandMaxStops = formData.vsrBand1Stops ? Number(formData.vsrBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.vsrBand2Stops) updated.maxStops = Number(formData.vsrBand2Stops);
                if (formData.vsrBand2Rate) updated.pricePerStop = Number(formData.vsrBand2Rate);
              }
              // Atualizar validityEndDate se presente no formulário
              if (formData.vsrValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.vsrValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // VSR Electric
          if (isVSRElectric && formData.vsrEletricValidityStartDate) {
            const formStartDate = formatDateOnly(formData.vsrEletricValidityStartDate);
            if (formStartDate === cmStartDate) {
              if (cm.minStops === 1 || !cm.minStops) {
                if (formData.vsrEletricBand1Stops) updated.maxStops = Number(formData.vsrEletricBand1Stops);
                if (formData.vsrEletricBand1Rate) updated.pricePerStop = Number(formData.vsrEletricBand1Rate);
              } else {
                const firstBandMaxStops = formData.vsrEletricBand1Stops ? Number(formData.vsrEletricBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.vsrEletricBand2Stops) updated.maxStops = Number(formData.vsrEletricBand2Stops);
                if (formData.vsrEletricBand2Rate) updated.pricePerStop = Number(formData.vsrEletricBand2Rate);
              }
              if (formData.vsrEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.vsrEletricValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // DAF
          if (isDAF && formData.dafValidityStartDate) {
            const formStartDate = formatDateOnly(formData.dafValidityStartDate);
            if (formStartDate === cmStartDate) {
              if (Number(cm.minStops ?? 1) <= 1) {
                if (formData.dafBand1Stops) updated.maxStops = Number(formData.dafBand1Stops);
                if (formData.dafBand1Rate) {
                  updated.fixedPrice = Number(formData.dafBand1Rate);
                  updated.pricePerStop = undefined;
                }
              } else {
                const firstBandMaxStops = formData.dafBand1Stops ? Number(formData.dafBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.dafBand2Stops) updated.maxStops = Number(formData.dafBand2Stops);
                if (formData.dafBand2Rate) {
                  updated.pricePerStop = Number(formData.dafBand2Rate);
                  updated.fixedPrice = undefined;
                }
              }
              if (formData.dafValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.dafValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // DAF Electric
          if (isDAFElectric && formData.dafEletricValidityStartDate) {
            const formStartDate = formatDateOnly(formData.dafEletricValidityStartDate);
            if (formStartDate === cmStartDate) {
              if (Number(cm.minStops ?? 1) <= 1) {
                if (formData.dafEletricBand1Stops) updated.maxStops = Number(formData.dafEletricBand1Stops);
                if (formData.dafEletricBand1Rate) {
                  updated.fixedPrice = Number(formData.dafEletricBand1Rate);
                  updated.pricePerStop = undefined;
                }
              } else {
                const firstBandMaxStops = formData.dafEletricBand1Stops ? Number(formData.dafEletricBand1Stops) : undefined;
                if (firstBandMaxStops !== undefined) updated.minStops = firstBandMaxStops + 1;
                if (formData.dafEletricBand2Stops) updated.maxStops = Number(formData.dafEletricBand2Stops);
                if (formData.dafEletricBand2Rate) {
                  updated.pricePerStop = Number(formData.dafEletricBand2Rate);
                  updated.fixedPrice = undefined;
                }
              }
              if (formData.dafEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.dafEletricValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // FSR
          if (isFSR && formData.fsrValidityStartDate) {
            const formStartDate = formatDateOnly(formData.fsrValidityStartDate);
            if (formStartDate === cmStartDate) {
              if (formData.fsrStopRate) {
                updated.fixedPrice = Number(formData.fsrStopRate);
                updated.pricePerStop = undefined; // Limpar pricePerStop se estiver usando fixedPrice
              }
              if (formData.fsrValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.fsrValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // DR
          if (isDR && formData.drValidityStartDate) {
            const formStartDate = formatDateOnly(formData.drValidityStartDate);
            if (formStartDate === cmStartDate) {
              if (formData.drDayRate) {
                updated.fixedPrice = Number(formData.drDayRate);
                updated.pricePerStop = undefined;
              }
              if (formData.drValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.drValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // Hourly (costModelId 7)
          if (isHourly) {
            if (formData.hourlyRate != null && formData.hourlyRate !== '') updated.pricePerStop = Number(formData.hourlyRate);
            if (formData.hourlyValidityStartDate) updated.validityStartDate = formatDateOnly(formData.hourlyValidityStartDate) || cm.validityStartDate;
            if (formData.hourlyValidityEndDate != null && formData.hourlyValidityEndDate !== '') updated.validityEndDate = formatDateOnly(formData.hourlyValidityEndDate) || undefined;
          }

          // SP VSR (costModelId 12, 4 bands)
          const isSpVSR = cm.costModelId === 12 && (cm.isElectric === false || cm.isElectric === null);
          if (isSpVSR && formData.spVsrValidityStartDate) {
            const formStartDate = formatDateOnly(formData.spVsrValidityStartDate);
            if (formStartDate === cmStartDate) {
              const band1MaxStops = formData.spVsrBand1Stops ? Number(formData.spVsrBand1Stops) : undefined;
              const band2MaxStops = formData.spVsrBand2Stops ? Number(formData.spVsrBand2Stops) : undefined;
              const band3MaxStops = formData.spVsrBand3Stops ? Number(formData.spVsrBand3Stops) : undefined;
              const bandPosition = spVsrBandIndexByArrayIndex.get(cmIndex);

              if (bandPosition === 1 || ((cm.minStops === 1 || !cm.minStops) && bandPosition === undefined)) {
                // Band 1
                if (band1MaxStops) updated.maxStops = band1MaxStops;
                if (formData.spVsrBand1Rate) updated.pricePerStop = Number(formData.spVsrBand1Rate);
              } else if (bandPosition === 2 || (bandPosition === undefined && cm.minStops && cm.minStops > 1 && band1MaxStops && cm.minStops === band1MaxStops + 1)) {
                // Band 2, 3, or 4 - determine by minStops value
                updated.minStops = band1MaxStops !== undefined ? band1MaxStops + 1 : updated.minStops;
                if (band2MaxStops) updated.maxStops = band2MaxStops;
                if (formData.spVsrBand2Rate) updated.pricePerStop = Number(formData.spVsrBand2Rate);
              } else if (bandPosition === 3 || (bandPosition === undefined && band2MaxStops && cm.minStops === band2MaxStops + 1)) {
                // Band 3
                updated.minStops = band2MaxStops !== undefined ? band2MaxStops + 1 : updated.minStops;
                if (band3MaxStops) updated.maxStops = band3MaxStops;
                if (formData.spVsrBand3Rate) updated.pricePerStop = Number(formData.spVsrBand3Rate);
              } else {
                // Band 4
                if (band3MaxStops) updated.minStops = band3MaxStops + 1;
                if (formData.spVsrBand4Stops) updated.maxStops = Number(formData.spVsrBand4Stops);
                if (formData.spVsrBand4Rate) updated.pricePerStop = Number(formData.spVsrBand4Rate);
              }
              if (formData.spVsrValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.spVsrValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          // SP VSR Electric (costModelId 12, isElectric: true, 4 bands)
          const isSpVSRElectric = cm.costModelId === 12 && cm.isElectric === true;
          if (isSpVSRElectric && formData.spVsrEletricValidityStartDate) {
            const formStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate);
            if (formStartDate === cmStartDate) {
              const band1MaxStops = formData.spVsrEletricBand1Stops ? Number(formData.spVsrEletricBand1Stops) : undefined;
              const band2MaxStops = formData.spVsrEletricBand2Stops ? Number(formData.spVsrEletricBand2Stops) : undefined;
              const band3MaxStops = formData.spVsrEletricBand3Stops ? Number(formData.spVsrEletricBand3Stops) : undefined;
              const bandPosition = spVsrElectricBandIndexByArrayIndex.get(cmIndex);

              if (bandPosition === 1 || ((cm.minStops === 1 || !cm.minStops) && bandPosition === undefined)) {
                // Band 1
                if (band1MaxStops) updated.maxStops = band1MaxStops;
                if (formData.spVsrEletricBand1Rate) updated.pricePerStop = Number(formData.spVsrEletricBand1Rate);
              } else if (bandPosition === 2 || (bandPosition === undefined && cm.minStops && cm.minStops > 1 && band1MaxStops && cm.minStops === band1MaxStops + 1)) {
                // Band 2, 3, or 4 - determine by minStops value
                updated.minStops = band1MaxStops !== undefined ? band1MaxStops + 1 : updated.minStops;
                if (band2MaxStops) updated.maxStops = band2MaxStops;
                if (formData.spVsrEletricBand2Rate) updated.pricePerStop = Number(formData.spVsrEletricBand2Rate);
              } else if (bandPosition === 3 || (bandPosition === undefined && band2MaxStops && cm.minStops === band2MaxStops + 1)) {
                // Band 3
                updated.minStops = band2MaxStops !== undefined ? band2MaxStops + 1 : updated.minStops;
                if (band3MaxStops) updated.maxStops = band3MaxStops;
                if (formData.spVsrEletricBand3Rate) updated.pricePerStop = Number(formData.spVsrEletricBand3Rate);
              } else {
                // Band 4
                if (band3MaxStops) updated.minStops = band3MaxStops + 1;
                if (formData.spVsrEletricBand4Stops) updated.maxStops = Number(formData.spVsrEletricBand4Stops);
                if (formData.spVsrEletricBand4Rate) updated.pricePerStop = Number(formData.spVsrEletricBand4Rate);
              }
              if (formData.spVsrEletricValidityEndDate) {
                updated.validityEndDate = formatDateOnly(formData.spVsrEletricValidityEndDate) || cm.validityEndDate;
              }
            }
          }

          return updated;
        });

        // Verificar se há campos de VSR Eletric preenchidos mas não há cost models correspondentes
        // Se houver campos preenchidos mas não houver cost model com a mesma validityStartDate, adicionar
        if (formData.vsrEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.vsrEletricValidityStartDate);
          const hasVSRElectric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 4 && cm.isElectric === true && cmStartDate === formStartDate;
          });

          if (!hasVSRElectric && (formData.vsrEletricBand1Stops || formData.vsrEletricBand1Rate)) {
            // Adicionar primeiro band de VSR Eletric
            const vsrEletricFirstBand: CostModelItem = {
              costModelId: 4,
              minStops: 1,
              isElectric: true,
            };
            if (formData.vsrEletricBand1Stops) vsrEletricFirstBand.maxStops = Number(formData.vsrEletricBand1Stops);
            if (formData.vsrEletricBand1Rate) vsrEletricFirstBand.pricePerStop = Number(formData.vsrEletricBand1Rate);
            if (formData.vsrEletricValidityStartDate) vsrEletricFirstBand.validityStartDate = formatDateOnly(formData.vsrEletricValidityStartDate) || undefined;
            if (formData.vsrEletricValidityEndDate) vsrEletricFirstBand.validityEndDate = formatDateOnly(formData.vsrEletricValidityEndDate) || undefined;
            updatedCostModels.push(vsrEletricFirstBand);

            // Adicionar segundo band se houver
            if (formData.vsrEletricBand2Stops || formData.vsrEletricBand2Rate) {
              const vsrEletricSecondBand: CostModelItem = {
                costModelId: 4,
                isElectric: true,
              };
              const firstBandMaxStops = formData.vsrEletricBand1Stops ? Number(formData.vsrEletricBand1Stops) : undefined;
              if (firstBandMaxStops !== undefined) vsrEletricSecondBand.minStops = firstBandMaxStops + 1;
              if (formData.vsrEletricBand2Stops) vsrEletricSecondBand.maxStops = Number(formData.vsrEletricBand2Stops);
              if (formData.vsrEletricBand2Rate) vsrEletricSecondBand.pricePerStop = Number(formData.vsrEletricBand2Rate);
              if (formData.vsrEletricValidityStartDate) vsrEletricSecondBand.validityStartDate = formatDateOnly(formData.vsrEletricValidityStartDate) || undefined;
              if (formData.vsrEletricValidityEndDate) vsrEletricSecondBand.validityEndDate = formatDateOnly(formData.vsrEletricValidityEndDate) || undefined;
              updatedCostModels.push(vsrEletricSecondBand);
            }
          }
        }

        // Verificar se há campos de DAF Eletric preenchidos mas não há cost models correspondentes
        if (formData.dafEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.dafEletricValidityStartDate);
          const hasDAFElectric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 1 && cm.isElectric === true && cmStartDate === formStartDate;
          });

          if (!hasDAFElectric && (formData.dafEletricBand1Stops || formData.dafEletricBand1Rate)) {
            // Adicionar primeiro band de DAF Eletric
            const dafEletricFirstBand: CostModelItem = {
              costModelId: 1,
              minStops: 1,
              isElectric: true,
            };
            if (formData.dafEletricBand1Stops) dafEletricFirstBand.maxStops = Number(formData.dafEletricBand1Stops);
            if (formData.dafEletricBand1Rate) dafEletricFirstBand.fixedPrice = Number(formData.dafEletricBand1Rate);
            if (formData.dafEletricValidityStartDate) dafEletricFirstBand.validityStartDate = formatDateOnly(formData.dafEletricValidityStartDate) || undefined;
            if (formData.dafEletricValidityEndDate) dafEletricFirstBand.validityEndDate = formatDateOnly(formData.dafEletricValidityEndDate) || undefined;
            updatedCostModels.push(dafEletricFirstBand);

            // Adicionar segundo band se houver
            if (formData.dafEletricBand2Stops || formData.dafEletricBand2Rate) {
              const dafEletricSecondBand: CostModelItem = {
                costModelId: 1,
                isElectric: true,
              };
              const firstBandMaxStops = formData.dafEletricBand1Stops ? Number(formData.dafEletricBand1Stops) : undefined;
              if (firstBandMaxStops !== undefined) dafEletricSecondBand.minStops = firstBandMaxStops + 1;
              if (formData.dafEletricBand2Stops) dafEletricSecondBand.maxStops = Number(formData.dafEletricBand2Stops);
              if (formData.dafEletricBand2Rate) dafEletricSecondBand.pricePerStop = Number(formData.dafEletricBand2Rate);
              if (formData.dafEletricValidityStartDate) dafEletricSecondBand.validityStartDate = formatDateOnly(formData.dafEletricValidityStartDate) || undefined;
              if (formData.dafEletricValidityEndDate) dafEletricSecondBand.validityEndDate = formatDateOnly(formData.dafEletricValidityEndDate) || undefined;
              updatedCostModels.push(dafEletricSecondBand);
            }
          }
        }

        // Verificar se há campos de VSR normal preenchidos mas não há cost models correspondentes
        if (formData.vsrValidityStartDate) {
          const formStartDate = formatDateOnly(formData.vsrValidityStartDate);
          const hasVSR = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 4 && (cm.isElectric === false || cm.isElectric === null) && cmStartDate === formStartDate;
          });

          if (!hasVSR && (formData.vsrBand1Stops || formData.vsrBand1Rate)) {
            // Adicionar primeiro band de VSR
            const vsrFirstBand: CostModelItem = {
              costModelId: 4,
              minStops: 1,
              isElectric: false,
            };
            if (formData.vsrBand1Stops) vsrFirstBand.maxStops = Number(formData.vsrBand1Stops);
            if (formData.vsrBand1Rate) vsrFirstBand.pricePerStop = Number(formData.vsrBand1Rate);
            if (formData.vsrValidityStartDate) vsrFirstBand.validityStartDate = formatDateOnly(formData.vsrValidityStartDate) || undefined;
            if (formData.vsrValidityEndDate) vsrFirstBand.validityEndDate = formatDateOnly(formData.vsrValidityEndDate) || undefined;
            updatedCostModels.push(vsrFirstBand);

            // Adicionar segundo band se houver
            if (formData.vsrBand2Stops || formData.vsrBand2Rate) {
              const vsrSecondBand: CostModelItem = {
                costModelId: 4,
                isElectric: false,
              };
              const firstBandMaxStops = formData.vsrBand1Stops ? Number(formData.vsrBand1Stops) : undefined;
              if (firstBandMaxStops !== undefined) vsrSecondBand.minStops = firstBandMaxStops + 1;
              if (formData.vsrBand2Stops) vsrSecondBand.maxStops = Number(formData.vsrBand2Stops);
              if (formData.vsrBand2Rate) vsrSecondBand.pricePerStop = Number(formData.vsrBand2Rate);
              if (formData.vsrValidityStartDate) vsrSecondBand.validityStartDate = formatDateOnly(formData.vsrValidityStartDate) || undefined;
              if (formData.vsrValidityEndDate) vsrSecondBand.validityEndDate = formatDateOnly(formData.vsrValidityEndDate) || undefined;
              updatedCostModels.push(vsrSecondBand);
            }
          }
        }

        // Verificar se há campos de DAF normal preenchidos mas não há cost models correspondentes
        if (formData.dafValidityStartDate) {
          const formStartDate = formatDateOnly(formData.dafValidityStartDate);
          const hasDAF = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 1 && (cm.isElectric === false || cm.isElectric === null) && cmStartDate === formStartDate;
          });

          if (!hasDAF && (formData.dafBand1Stops || formData.dafBand1Rate)) {
            // Adicionar primeiro band de DAF
            const dafFirstBand: CostModelItem = {
              costModelId: 1,
              minStops: 1,
              isElectric: false,
            };
            if (formData.dafBand1Stops) dafFirstBand.maxStops = Number(formData.dafBand1Stops);
            if (formData.dafBand1Rate) dafFirstBand.fixedPrice = Number(formData.dafBand1Rate);
            if (formData.dafValidityStartDate) dafFirstBand.validityStartDate = formatDateOnly(formData.dafValidityStartDate) || undefined;
            if (formData.dafValidityEndDate) dafFirstBand.validityEndDate = formatDateOnly(formData.dafValidityEndDate) || undefined;
            updatedCostModels.push(dafFirstBand);

            // Adicionar segundo band se houver
            if (formData.dafBand2Stops || formData.dafBand2Rate) {
              const dafSecondBand: CostModelItem = {
                costModelId: 1,
                isElectric: false,
              };
              const firstBandMaxStops = formData.dafBand1Stops ? Number(formData.dafBand1Stops) : undefined;
              if (firstBandMaxStops !== undefined) dafSecondBand.minStops = firstBandMaxStops + 1;
              if (formData.dafBand2Stops) dafSecondBand.maxStops = Number(formData.dafBand2Stops);
              if (formData.dafBand2Rate) dafSecondBand.pricePerStop = Number(formData.dafBand2Rate);
              if (formData.dafValidityStartDate) dafSecondBand.validityStartDate = formatDateOnly(formData.dafValidityStartDate) || undefined;
              if (formData.dafValidityEndDate) dafSecondBand.validityEndDate = formatDateOnly(formData.dafValidityEndDate) || undefined;
              updatedCostModels.push(dafSecondBand);
            }
          }
        }

        // Verificar se há campos de FSR preenchidos mas não há cost models correspondentes
        if (formData.fsrValidityStartDate) {
          const formStartDate = formatDateOnly(formData.fsrValidityStartDate);
          const hasFSR = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 3 && (cm.isElectric === false || cm.isElectric === null) && cmStartDate === formStartDate;
          });

          if (!hasFSR && formData.fsrStopRate) {
            const fsrModel: CostModelItem = {
              costModelId: 3,
              isElectric: false,
            };
            if (formData.fsrStopRate) fsrModel.fixedPrice = Number(formData.fsrStopRate);
            if (formData.fsrValidityStartDate) fsrModel.validityStartDate = formatDateOnly(formData.fsrValidityStartDate) || undefined;
            if (formData.fsrValidityEndDate) fsrModel.validityEndDate = formatDateOnly(formData.fsrValidityEndDate) || undefined;
            updatedCostModels.push(fsrModel);
          }
        }

        // Verificar se há campos de DR preenchidos mas não há cost models correspondentes
        if (formData.drValidityStartDate) {
          const formStartDate = formatDateOnly(formData.drValidityStartDate);
          const hasDR = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 2 && (cm.isElectric === false || cm.isElectric === null) && cmStartDate === formStartDate;
          });

          if (!hasDR && formData.drDayRate) {
            const drModel: CostModelItem = {
              costModelId: 2,
              isElectric: false,
            };
            if (formData.drDayRate) drModel.fixedPrice = Number(formData.drDayRate);
            if (formData.drValidityStartDate) drModel.validityStartDate = formatDateOnly(formData.drValidityStartDate) || undefined;
            if (formData.drValidityEndDate) drModel.validityEndDate = formatDateOnly(formData.drValidityEndDate) || undefined;
            updatedCostModels.push(drModel);
          }
        }

        // Verificar se há campos de FSR Electric preenchidos mas não há cost models correspondentes
        if (formData.fsrEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.fsrEletricValidityStartDate);
          const hasFsrEletric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 3 && cm.isElectric === true && cmStartDate === formStartDate;
          });
          if (!hasFsrEletric && formData.fsrEletricStopRate) {
            const m: CostModelItem = { costModelId: 3, isElectric: true };
            m.fixedPrice = Number(formData.fsrEletricStopRate);
            if (formData.fsrEletricValidityStartDate) m.validityStartDate = formatDateOnly(formData.fsrEletricValidityStartDate) || undefined;
            if (formData.fsrEletricValidityEndDate) m.validityEndDate = formatDateOnly(formData.fsrEletricValidityEndDate) || undefined;
            updatedCostModels.push(m);
          }
        }

        // Verificar se há campos de DR Electric preenchidos mas não há cost models correspondentes
        if (formData.drEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.drEletricValidityStartDate);
          const hasDrEletric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 2 && cm.isElectric === true && cmStartDate === formStartDate;
          });
          if (!hasDrEletric && formData.drEletricDayRate) {
            const m: CostModelItem = { costModelId: 2, isElectric: true };
            m.fixedPrice = Number(formData.drEletricDayRate);
            if (formData.drEletricValidityStartDate) m.validityStartDate = formatDateOnly(formData.drEletricValidityStartDate) || undefined;
            if (formData.drEletricValidityEndDate) m.validityEndDate = formatDateOnly(formData.drEletricValidityEndDate) || undefined;
            updatedCostModels.push(m);
          }
        }

        // Verificar se há campos de Hourly Electric preenchidos mas não há cost models correspondentes
        if (formData.hourlyEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.hourlyEletricValidityStartDate);
          const hasHourlyEletric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 7 && cm.isElectric === true && cmStartDate === formStartDate;
          });
          if (!hasHourlyEletric && formData.hourlyEletricRate) {
            const m: CostModelItem = { costModelId: 7, isElectric: true };
            m.pricePerStop = Number(formData.hourlyEletricRate);
            if (formData.hourlyEletricValidityStartDate) m.validityStartDate = formatDateOnly(formData.hourlyEletricValidityStartDate) || undefined;
            if (formData.hourlyEletricValidityEndDate) m.validityEndDate = formatDateOnly(formData.hourlyEletricValidityEndDate) || undefined;
            updatedCostModels.push(m);
          }
        }

        // Verificar se há campos de SP_VSR preenchidos mas não há cost models correspondentes (4 bands)
        if (formData.spVsrValidityStartDate) {
          const formStartDate = formatDateOnly(formData.spVsrValidityStartDate);
          const hasSpVSR = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 12 && (cm.isElectric === false || cm.isElectric === null) && cmStartDate === formStartDate;
          });

          if (!hasSpVSR && (formData.spVsrBand1Stops || formData.spVsrBand1Rate)) {
            // Adicionar Band 1
            const band1: CostModelItem = {
              costModelId: 12,
              minStops: 1,
              isElectric: false,
            };
            if (formData.spVsrBand1Stops) band1.maxStops = Number(formData.spVsrBand1Stops);
            if (formData.spVsrBand1Rate) band1.pricePerStop = Number(formData.spVsrBand1Rate);
            if (formData.spVsrValidityStartDate) band1.validityStartDate = formatDateOnly(formData.spVsrValidityStartDate) || undefined;
            if (formData.spVsrValidityEndDate) band1.validityEndDate = formatDateOnly(formData.spVsrValidityEndDate) || undefined;
            updatedCostModels.push(band1);

            // Adicionar Band 2 se houver
            if (formData.spVsrBand2Stops || formData.spVsrBand2Rate) {
              const band2: CostModelItem = { costModelId: 12, isElectric: false };
              const band1MaxStops = formData.spVsrBand1Stops ? Number(formData.spVsrBand1Stops) : undefined;
              if (band1MaxStops !== undefined) band2.minStops = band1MaxStops + 1;
              if (formData.spVsrBand2Stops) band2.maxStops = Number(formData.spVsrBand2Stops);
              if (formData.spVsrBand2Rate) band2.pricePerStop = Number(formData.spVsrBand2Rate);
              if (formData.spVsrValidityStartDate) band2.validityStartDate = formatDateOnly(formData.spVsrValidityStartDate) || undefined;
              if (formData.spVsrValidityEndDate) band2.validityEndDate = formatDateOnly(formData.spVsrValidityEndDate) || undefined;
              updatedCostModels.push(band2);
            }

            // Adicionar Band 3 se houver
            if (formData.spVsrBand3Stops || formData.spVsrBand3Rate) {
              const band3: CostModelItem = { costModelId: 12, isElectric: false };
              const band2MaxStops = formData.spVsrBand2Stops ? Number(formData.spVsrBand2Stops) : undefined;
              if (band2MaxStops !== undefined) band3.minStops = band2MaxStops + 1;
              if (formData.spVsrBand3Stops) band3.maxStops = Number(formData.spVsrBand3Stops);
              if (formData.spVsrBand3Rate) band3.pricePerStop = Number(formData.spVsrBand3Rate);
              if (formData.spVsrValidityStartDate) band3.validityStartDate = formatDateOnly(formData.spVsrValidityStartDate) || undefined;
              if (formData.spVsrValidityEndDate) band3.validityEndDate = formatDateOnly(formData.spVsrValidityEndDate) || undefined;
              updatedCostModels.push(band3);
            }

            // Adicionar Band 4 se houver
            if (formData.spVsrBand4Stops || formData.spVsrBand4Rate) {
              const band4: CostModelItem = { costModelId: 12, isElectric: false };
              const band3MaxStops = formData.spVsrBand3Stops ? Number(formData.spVsrBand3Stops) : undefined;
              if (band3MaxStops !== undefined) band4.minStops = band3MaxStops + 1;
              if (formData.spVsrBand4Stops) band4.maxStops = Number(formData.spVsrBand4Stops);
              if (formData.spVsrBand4Rate) band4.pricePerStop = Number(formData.spVsrBand4Rate);
              if (formData.spVsrValidityStartDate) band4.validityStartDate = formatDateOnly(formData.spVsrValidityStartDate) || undefined;
              if (formData.spVsrValidityEndDate) band4.validityEndDate = formatDateOnly(formData.spVsrValidityEndDate) || undefined;
              updatedCostModels.push(band4);
            }
          }
        }

        // Verificar se há campos de SP_VSR Electric preenchidos mas não há cost models correspondentes (4 bands)
        if (formData.spVsrEletricValidityStartDate) {
          const formStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate);
          const hasSpVSRElectric = updatedCostModels.some(cm => {
            const cmStartDate = formatDateOnly(cm.validityStartDate);
            return cm.costModelId === 12 && cm.isElectric === true && cmStartDate === formStartDate;
          });

          if (!hasSpVSRElectric && (formData.spVsrEletricBand1Stops || formData.spVsrEletricBand1Rate)) {
            // Adicionar Band 1
            const band1: CostModelItem = {
              costModelId: 12,
              minStops: 1,
              isElectric: true,
            };
            if (formData.spVsrEletricBand1Stops) band1.maxStops = Number(formData.spVsrEletricBand1Stops);
            if (formData.spVsrEletricBand1Rate) band1.pricePerStop = Number(formData.spVsrEletricBand1Rate);
            if (formData.spVsrEletricValidityStartDate) band1.validityStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate) || undefined;
            if (formData.spVsrEletricValidityEndDate) band1.validityEndDate = formatDateOnly(formData.spVsrEletricValidityEndDate) || undefined;
            updatedCostModels.push(band1);

            // Adicionar Band 2 se houver
            if (formData.spVsrEletricBand2Stops || formData.spVsrEletricBand2Rate) {
              const band2: CostModelItem = { costModelId: 12, isElectric: true };
              const band1MaxStops = formData.spVsrEletricBand1Stops ? Number(formData.spVsrEletricBand1Stops) : undefined;
              if (band1MaxStops !== undefined) band2.minStops = band1MaxStops + 1;
              if (formData.spVsrEletricBand2Stops) band2.maxStops = Number(formData.spVsrEletricBand2Stops);
              if (formData.spVsrEletricBand2Rate) band2.pricePerStop = Number(formData.spVsrEletricBand2Rate);
              if (formData.spVsrEletricValidityStartDate) band2.validityStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate) || undefined;
              if (formData.spVsrEletricValidityEndDate) band2.validityEndDate = formatDateOnly(formData.spVsrEletricValidityEndDate) || undefined;
              updatedCostModels.push(band2);
            }

            // Adicionar Band 3 se houver
            if (formData.spVsrEletricBand3Stops || formData.spVsrEletricBand3Rate) {
              const band3: CostModelItem = { costModelId: 12, isElectric: true };
              const band2MaxStops = formData.spVsrEletricBand2Stops ? Number(formData.spVsrEletricBand2Stops) : undefined;
              if (band2MaxStops !== undefined) band3.minStops = band2MaxStops + 1;
              if (formData.spVsrEletricBand3Stops) band3.maxStops = Number(formData.spVsrEletricBand3Stops);
              if (formData.spVsrEletricBand3Rate) band3.pricePerStop = Number(formData.spVsrEletricBand3Rate);
              if (formData.spVsrEletricValidityStartDate) band3.validityStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate) || undefined;
              if (formData.spVsrEletricValidityEndDate) band3.validityEndDate = formatDateOnly(formData.spVsrEletricValidityEndDate) || undefined;
              updatedCostModels.push(band3);
            }

            // Adicionar Band 4 se houver
            if (formData.spVsrEletricBand4Stops || formData.spVsrEletricBand4Rate) {
              const band4: CostModelItem = { costModelId: 12, isElectric: true };
              const band3MaxStops = formData.spVsrEletricBand3Stops ? Number(formData.spVsrEletricBand3Stops) : undefined;
              if (band3MaxStops !== undefined) band4.minStops = band3MaxStops + 1;
              if (formData.spVsrEletricBand4Stops) band4.maxStops = Number(formData.spVsrEletricBand4Stops);
              if (formData.spVsrEletricBand4Rate) band4.pricePerStop = Number(formData.spVsrEletricBand4Rate);
              if (formData.spVsrEletricValidityStartDate) band4.validityStartDate = formatDateOnly(formData.spVsrEletricValidityStartDate) || undefined;
              if (formData.spVsrEletricValidityEndDate) band4.validityEndDate = formatDateOnly(formData.spVsrEletricValidityEndDate) || undefined;
              updatedCostModels.push(band4);
            }
          }
        }

        // Hourly (costModelId 7): adicionar se formulário tiver dados e não existir
        if (formData.hourlyRate || formData.hourlyValidityStartDate || formData.hourlyValidityEndDate) {
          const hasHourly = updatedCostModels.some(cm => cm.costModelId === 7);
          if (!hasHourly) {
            const hourlyModel: CostModelItem = { costModelId: 7 };
            if (formData.hourlyRate) hourlyModel.pricePerStop = Number(formData.hourlyRate);
            if (formData.hourlyValidityStartDate) hourlyModel.validityStartDate = formatDateOnly(formData.hourlyValidityStartDate) || undefined;
            if (formData.hourlyValidityEndDate) hourlyModel.validityEndDate = formatDateOnly(formData.hourlyValidityEndDate) || undefined;
            if (Object.keys(hourlyModel).length > 1) updatedCostModels.push(hourlyModel);
          }
        }

        // Usar os costModels atualizados com os valores do formulário
        costModelsToSave = updatedCostModels.map(cm => ({
          ...cm,
          modelEmployeesId: cm.modelEmployeesId // Incluir o ID para identificar items existentes
        }));
      }

      const formDataToSave = {
        ...formData,
        startDate: formatDateOnly(formData.startDate),
        finishDate: formData.finishDate ? formatDateOnly(formData.finishDate) : undefined,
        dob: formData.dob ? formatDateOnly(formData.dob) : undefined,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
        cargoTrainingDate: formData.cargoTrainingDate ? formatDateOnly(formData.cargoTrainingDate) : undefined,
        dangerousGoodsTrainingDate: formData.dangerousGoodsTrainingDate ? formatDateOnly(formData.dangerousGoodsTrainingDate) : undefined,
        manualHandlingTrainingDate: formData.manualHandlingTrainingDate ? formatDateOnly(formData.manualHandlingTrainingDate) : undefined,
        criminalRecordDate: formData.criminalRecordDate ? formatDateOnly(formData.criminalRecordDate) : undefined,
        dvlaCheckDate: formData.dvlaCheckDate ? formatDateOnly(formData.dvlaCheckDate) : undefined,
        visaValidity: formData.visaValidity ? formatDateOnly(formData.visaValidity) : undefined,
        licenceExpiringDate: formData.licenceExpiringDate ? formatDateOnly(formData.licenceExpiringDate) : undefined,
        passportExpiringDate: formData.passportExpiringDate ? formatDateOnly(formData.passportExpiringDate) : undefined,
        status: mode === 'add' ? 'Active' : (formData.status as 'Active' | 'Inactive' || 'Active'),
        // Incluir costModels atualizados em modo de edição e adição
        ...(costModelsToSave && costModelsToSave.length > 0 && { costModels: costModelsToSave }),
      };

      await onSave(formDataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving vendor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('email') || errorMessage.includes('duplicar') || errorMessage.includes('already registered')) {
        showError('Error', errorMessage);
      } else {
        showError('Error Saving Vendor', errorMessage);
      }
    }
  };

  const getCurrentStepIndex = () => STEPS.findIndex(s => s.id === currentStep);
  const canGoNext = () => getCurrentStepIndex() < STEPS.length - 1;
  const canGoPrev = () => getCurrentStepIndex() > 0;

  const handleNext = () => {
    if (canGoNext()) {
      const nextIndex = getCurrentStepIndex() + 1;
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      const prevIndex = getCurrentStepIndex() - 1;
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const renderValidityStartDateInput = (
    type: 'vsr' | 'vsrEletric' | 'daf' | 'dafEletric' | 'fsr' | 'fsrEletric' | 'dr' | 'drEletric' | 'hourlyEletric' | 'spVsr' | 'spVsrEletric',
    fieldId: keyof Vendor & string,
    value: string | undefined,
    groups: Array<{ date: string; items: CostModelItem[] }>,
    isDisabled: boolean
  ) => {
    const formattedValue = value ? formatDateOnly(value) : '';
    const hasMultipleGroups = mode === 'edit' && groups.length > 1;

    const handleSingleDateInputChange = (newValue: string) => {
      if (!newValue) return;

      const normalizedDate = formatDateOnly(newValue);
      if (!normalizedDate) return;

      if (hasMultipleGroups && groups.some(group => group.date === normalizedDate)) {
        handleValidityDateSelect(type, normalizedDate);
        return;
      }

      if (mode === 'edit') {
        handleValidityStartDateEdit(type, normalizedDate);
        return;
      }

      setFormData(prev => ({ ...prev, [fieldId]: normalizedDate }));
    };

    return (
      <div className="input-group">
        <input
          type="date"
          className="form-control"
          id={fieldId}
          value={formattedValue}
          onChange={(e) => handleSingleDateInputChange(e.target.value)}
          onFocus={() => {
            const formKey = fieldId as keyof Vendor;
            if (!formData[formKey]) {
              setFormData(prev => ({ ...prev, [formKey]: getTodayDateString() }));
            }
          }}
          onKeyDown={handleDateKeyDown}
          max="9999-12-31"
          disabled={isDisabled}
        />

        {hasMultipleGroups && (
          <details className="position-relative">
            <summary
              className="btn btn-outline-secondary h-100 d-flex align-items-center"
              style={{ listStyle: 'none' }}
              title="Select existing item"
            >
              <i className="bi bi-caret-down-fill"></i>
            </summary>
            <div
              className="position-absolute end-0 mt-1 bg-white border rounded shadow-sm"
              style={{ minWidth: '180px', zIndex: 1080, maxHeight: '220px', overflowY: 'auto' }}
            >
              {groups.map((group, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="dropdown-item"
                  onClick={(e) => {
                    handleValidityDateSelect(type, group.date);
                    const detailsElement = e.currentTarget.closest('details');
                    if (detailsElement) {
                      detailsElement.removeAttribute('open');
                    }
                  }}
                  disabled={isDisabled}
                >
                  {formatDateForDisplay(group.date)}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label text-black">Vendor ID</label><input type="text" className="form-control" id="supplierId" value={formData.supplierId || ''} onChange={handleInputChange} disabled /></div>
            <div className="col-md-6">
              <label className="form-label text-black">Depot *</label>
              <select className="form-select" id="depot" value={formData.depot || ''} onChange={handleInputChange} required>
                <option value="">Select a depot</option>
                {deposits && Array.isArray(deposits) && deposits.length > 0 ? (
                  filterAllowedDeposits(deposits).map((deposit, index) => (
                    <option key={deposit.depositId || index} value={String(deposit.depositId || '')}>
                      {deposit.depositName || `Depot ${deposit.depositId}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {deposits && deposits.length === 0 ? 'No deposits available' : 'Loading deposits...'}
                  </option>
                )}
              </select>
            </div>
            <div className="col-md-6"><label className="form-label text-black">First Name *</label><input type="text" className="form-control" id="firstName" value={formData.firstName || ''} onChange={handleInputChange} required /></div>
            <div className="col-md-6"><label className="form-label text-black">Last Name *</label><input type="text" className="form-control" id="lastName" value={formData.lastName || ''} onChange={handleInputChange} required /></div>
            <div className="col-md-6"><label className="form-label text-black">Email *</label><input type="email" className="form-control" id="email" value={formData.email || ''} onChange={handleInputChange} required /></div>
            <div className="col-md-6"><label className="form-label text-black">Phone *</label><input type="tel" className="form-control" id="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="+1234567890" maxLength={25} required /></div>
            <div className="col-md-6"><label className="form-label text-black">Date of Birth *</label><input type="date" className="form-control" id="dob" value={formData.dob ? formatDateOnly(formData.dob) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" required /></div>
            <div className="col-md-6">
              <label className="form-label text-black">Vendor Type *</label>
              <select className="form-select" id="vendorType" value={formData.vendorType || ''} onChange={handleInputChange} required>
                <option value="">Select a vendor type</option>
                {vendorTypes && vendorTypes.length > 0 ? (
                  vendorTypes
                    .filter(vendorType => {
                      const nameType = vendorType.nameType?.toUpperCase() || '';
                      return nameType !== 'OFF';
                    })
                    .map(vendorType => (
                      <option key={vendorType.vendorTypeId} value={String(vendorType.vendorTypeId || '')}>
                        {vendorType.nameType || `Vendor Type ${vendorType.vendorTypeId}`}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>Loading vendor types...</option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-black">User Type{mode === 'add' ? ' *' : ''}</label>
              <select
                className="form-select"
                id="userType"
                value={formData.userType || ''}
                onChange={handleInputChange}
                required={mode === 'add'}
              >
                <option value="">Select a user type</option>
                {userTypes && userTypes.length > 0 ? (
                  userTypes.map(userType => (
                    <option key={userType.userTypeId} value={String(userType.userTypeId || '')}>
                      {userType.nameType || `User Type ${userType.userTypeId}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading user types...</option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-black">Service Partner</label>
              <select className="form-select" id="servicePartnerId" value={formData.servicePartnerId ? String(formData.servicePartnerId) : ''} onChange={handleInputChange}>
                <option value="">Select a service partner</option>
                {servicePartners && servicePartners.length > 0 ? (
                  servicePartners.map(partner => (
                    <option key={partner.servicePartnerId} value={String(partner.servicePartnerId || '')}>
                      {partner.partnerName || `Service Partner ${partner.servicePartnerId}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No service partners available</option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-black">Vat</label>
              <input type="text" className="form-control" id="vat" value={formData.vat || ''} onChange={handleInputChange} />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="row g-3">
            <div className="col-12"><label className="form-label text-black">Street</label><input type="text" className="form-control" id="street" value={formData.street || ''} onChange={handleInputChange} /></div>
            <div className="col-md-6"><label className="form-label text-black">City</label><input type="text" className="form-control" id="city" value={formData.city || ''} onChange={handleInputChange} /></div>
            <div className="col-md-6"><label className="form-label text-black">Postal Code</label><input type="text" className="form-control" id="postalCode" value={formData.postalCode || ''} onChange={handleInputChange} /></div>
          </div>
        );

      case 'employment':
        return (
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label text-black">Start Date *</label><input type="date" className="form-control" id="startDate" value={formData.startDate ? (typeof formData.startDate === 'string' ? formData.startDate : formatDateOnly(formData.startDate)) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" required /></div>
            <div className="col-md-6"><label className="form-label text-black">Finish Date</label><input type="date" className="form-control" id="finishDate" value={formData.finishDate ? formatDateOnly(formData.finishDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            {mode === 'edit' && (
              <div className="col-md-6">
                <label className="form-label text-black">Status</label>
                <select className="form-select" id="status" value={(formData.status as 'Active' | 'Inactive') || 'Active'} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label text-black">Route *</label>
              <select className="form-select" id="routeIdLink" value={formData.routeIdLink || ''} onChange={handleInputChange} required>
                <option value="">Select a route</option>
                {routes && routes.length > 0 ? (
                  routes.map(route => (
                    <option key={route.routeId} value={String(route.routeId || '')}>
                      {route.routeName || `Route ${route.routeId}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading routes...</option>
                )}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-black">Sort</label>
              <input type="text" className="form-control" id="routeSortValue" value={formData.routeSortValue || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-black">Vehicle Registration *</label>
              <select className="form-select" id="vehicleRegLink" value={formData.vehicleRegLink || ''} onChange={handleInputChange} required>
                <option value="">Select a vehicle</option>
                {vehicles && vehicles.length > 0 ? (
                  vehicles.map(vehicle => {
                    const registration = vehicle.registrationPlates || '';
                    const manufacturer = vehicle.manufacturer || '';
                    const displayText = registration && manufacturer
                      ? `${registration} - ${manufacturer}`
                      : registration || manufacturer || `Vehicle ${vehicle.vehicleId}`;
                    return (
                      <option key={vehicle.vehicleId} value={String(vehicle.vehicleId || '')}>
                        {displayText}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>Loading vehicles...</option>
                )}
              </select>
            </div>
          </div>
        );

      case 'cost':
        return (
          <div className="row g-3">
            <div className="col-md-6 mb-4">
              <label className="form-label text-black">Payment Model *</label>
              <select className="form-select" id="paymentModel" value={formData.paymentModel || ''} onChange={handleInputChange} required>
                <option value="">Select Payment Model</option>
                {costModels && costModels.length > 0 ? (
                  costModels.map(costModel => (
                    <option key={costModel.costModelId} value={String(costModel.costModelId || '')}>
                      {costModel.name || `Cost Model ${costModel.costModelId}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading payment models...</option>
                )}
              </select>
            </div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">VSR</strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.vsrValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('vsr')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('vsr')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="vsrBand1Stops" value={formData.vsrBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.vsrValidityStartDate) {
                setFormData(prev => ({ ...prev, vsrValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="vsrBand1Rate" value={formData.vsrBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.vsrValidityStartDate) {
                setFormData(prev => ({ ...prev, vsrValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="vsrBand2Stops" value={formData.vsrBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="vsrBand2Rate" value={formData.vsrBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('vsr', 'vsrValidityStartDate', formData.vsrValidityStartDate, groupedCostModels.vsr, showNewCostModels.vsr)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="vsrValidityEndDate" value={formData.vsrValidityEndDate ? formatDateOnly(formData.vsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.vsr} /></div>
            {mode === 'edit' && showNewCostModels.vsr && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New VSR</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('vsr')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newVsrBand1Stops" value={formData.newVsrBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newVsrBand1Rate" value={formData.newVsrBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newVsrBand2Stops" value={formData.newVsrBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newVsrBand2Rate" value={formData.newVsrBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newVsrValidityStartDate" value={formData.newVsrValidityStartDate ? formatDateOnly(formData.newVsrValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('vsr', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newVsrValidityEndDate" value={formData.newVsrValidityEndDate ? formatDateOnly(formData.newVsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">VSR <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.vsrEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('vsrEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('vsrEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="vsrEletricBand1Stops" value={formData.vsrEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.vsrEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, vsrEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="vsrEletricBand1Rate" value={formData.vsrEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.vsrEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, vsrEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="vsrEletricBand2Stops" value={formData.vsrEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="vsrEletricBand2Rate" value={formData.vsrEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('vsrEletric', 'vsrEletricValidityStartDate', formData.vsrEletricValidityStartDate, groupedCostModels.vsrEletric, showNewCostModels.vsrEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="vsrEletricValidityEndDate" value={formData.vsrEletricValidityEndDate ? formatDateOnly(formData.vsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.vsrEletric} /></div>
            {mode === 'edit' && showNewCostModels.vsrEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New VSR <span className="text-success">Eletric</span></strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('vsrEletric')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newVsrEletricBand1Stops" value={formData.newVsrEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newVsrEletricBand1Rate" value={formData.newVsrEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newVsrEletricBand2Stops" value={formData.newVsrEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newVsrEletricBand2Rate" value={formData.newVsrEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newVsrEletricValidityStartDate" value={formData.newVsrEletricValidityStartDate ? formatDateOnly(formData.newVsrEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('vsrEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newVsrEletricValidityEndDate" value={formData.newVsrEletricValidityEndDate ? formatDateOnly(formData.newVsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">SP VSR</strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.spVsrValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('spVsr')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('spVsr')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="spVsrBand1Stops" value={formData.spVsrBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.spVsrValidityStartDate) {
                setFormData(prev => ({ ...prev, spVsrValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="spVsrBand1Rate" value={formData.spVsrBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.spVsrValidityStartDate) {
                setFormData(prev => ({ ...prev, spVsrValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="spVsrBand2Stops" value={formData.spVsrBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="spVsrBand2Rate" value={formData.spVsrBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 3 Max Stops</label><input type="text" className="form-control" id="spVsrBand3Stops" value={formData.spVsrBand3Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 3 Rate</label><input type="text" className="form-control" id="spVsrBand3Rate" value={formData.spVsrBand3Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 4 Max Stops</label><input type="text" className="form-control" id="spVsrBand4Stops" value={formData.spVsrBand4Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 4 Rate</label><input type="text" className="form-control" id="spVsrBand4Rate" value={formData.spVsrBand4Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('spVsr', 'spVsrValidityStartDate', formData.spVsrValidityStartDate, groupedCostModels.spVsr, showNewCostModels.spVsr)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="spVsrValidityEndDate" value={formData.spVsrValidityEndDate ? formatDateOnly(formData.spVsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.spVsr} /></div>
            {mode === 'edit' && showNewCostModels.spVsr && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New SP VSR</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('spVsr')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newSpVsrBand1Stops" value={formData.newSpVsrBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newSpVsrBand1Rate" value={formData.newSpVsrBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newSpVsrBand2Stops" value={formData.newSpVsrBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newSpVsrBand2Rate" value={formData.newSpVsrBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 3 Max Stops</label><input type="text" className="form-control" id="newSpVsrBand3Stops" value={formData.newSpVsrBand3Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 3 Rate</label><input type="text" className="form-control" id="newSpVsrBand3Rate" value={formData.newSpVsrBand3Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 4 Max Stops</label><input type="text" className="form-control" id="newSpVsrBand4Stops" value={formData.newSpVsrBand4Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 4 Rate</label><input type="text" className="form-control" id="newSpVsrBand4Rate" value={formData.newSpVsrBand4Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newSpVsrValidityStartDate" value={formData.newSpVsrValidityStartDate ? formatDateOnly(formData.newSpVsrValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('spVsr', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newSpVsrValidityEndDate" value={formData.newSpVsrValidityEndDate ? formatDateOnly(formData.newSpVsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">SP VSR <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.spVsrEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('spVsrEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('spVsrEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="spVsrEletricBand1Stops" value={formData.spVsrEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.spVsrEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, spVsrEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="spVsrEletricBand1Rate" value={formData.spVsrEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.spVsrEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, spVsrEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="spVsrEletricBand2Stops" value={formData.spVsrEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="spVsrEletricBand2Rate" value={formData.spVsrEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 3 Max Stops</label><input type="text" className="form-control" id="spVsrEletricBand3Stops" value={formData.spVsrEletricBand3Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 3 Rate</label><input type="text" className="form-control" id="spVsrEletricBand3Rate" value={formData.spVsrEletricBand3Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 4 Max Stops</label><input type="text" className="form-control" id="spVsrEletricBand4Stops" value={formData.spVsrEletricBand4Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 4 Rate</label><input type="text" className="form-control" id="spVsrEletricBand4Rate" value={formData.spVsrEletricBand4Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('spVsrEletric', 'spVsrEletricValidityStartDate', formData.spVsrEletricValidityStartDate, groupedCostModels.spVsrEletric || [], showNewCostModels.spVsrEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="spVsrEletricValidityEndDate" value={formData.spVsrEletricValidityEndDate ? formatDateOnly(formData.spVsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.spVsrEletric} /></div>
            {mode === 'edit' && showNewCostModels.spVsrEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New SP VSR <span className="text-success">Eletric</span></strong>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleNewCostModel('spVsrEletric')}>
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newSpVsrEletricBand1Stops" value={formData.newSpVsrEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newSpVsrEletricBand1Rate" value={formData.newSpVsrEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newSpVsrEletricBand2Stops" value={formData.newSpVsrEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newSpVsrEletricBand2Rate" value={formData.newSpVsrEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 3 Max Stops</label><input type="text" className="form-control" id="newSpVsrEletricBand3Stops" value={formData.newSpVsrEletricBand3Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 3 Rate</label><input type="text" className="form-control" id="newSpVsrEletricBand3Rate" value={formData.newSpVsrEletricBand3Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 4 Max Stops</label><input type="text" className="form-control" id="newSpVsrEletricBand4Stops" value={formData.newSpVsrEletricBand4Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 4 Rate</label><input type="text" className="form-control" id="newSpVsrEletricBand4Rate" value={formData.newSpVsrEletricBand4Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newSpVsrEletricValidityStartDate" value={formData.newSpVsrEletricValidityStartDate ? formatDateOnly(formData.newSpVsrEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('spVsrEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newSpVsrEletricValidityEndDate" value={formData.newSpVsrEletricValidityEndDate ? formatDateOnly(formData.newSpVsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">FSR</strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.fsrValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('fsr')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('fsr')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-4"><label className="form-label text-black">Stop Rate</label><input type="text" className="form-control" id="fsrStopRate" value={formData.fsrStopRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.fsrValidityStartDate) {
                setFormData(prev => ({ ...prev, fsrValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('fsr', 'fsrValidityStartDate', formData.fsrValidityStartDate, groupedCostModels.fsr, showNewCostModels.fsr)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="fsrValidityEndDate" value={formData.fsrValidityEndDate ? formatDateOnly(formData.fsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.fsr} /></div>
            {mode === 'edit' && showNewCostModels.fsr && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New FSR</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('fsr')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-4"><label className="form-label text-black">Stop Rate</label><input type="text" className="form-control" id="newFsrStopRate" value={formData.newFsrStopRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newFsrValidityStartDate" value={formData.newFsrValidityStartDate ? formatDateOnly(formData.newFsrValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('fsr', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newFsrValidityEndDate" value={formData.newFsrValidityEndDate ? formatDateOnly(formData.newFsrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            {/* FSR Electric */}
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">FSR <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.fsrEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('fsrEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('fsrEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-4"><label className="form-label text-black">Stop Rate</label><input type="text" className="form-control" id="fsrEletricStopRate" value={formData.fsrEletricStopRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.fsrEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, fsrEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('fsrEletric', 'fsrEletricValidityStartDate', formData.fsrEletricValidityStartDate, groupedCostModels.fsrEletric, showNewCostModels.fsrEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="fsrEletricValidityEndDate" value={formData.fsrEletricValidityEndDate ? formatDateOnly(formData.fsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.fsrEletric} /></div>
            {mode === 'edit' && showNewCostModels.fsrEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New FSR Eletric</strong>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleNewCostModel('fsrEletric')}>
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-4"><label className="form-label text-black">Stop Rate</label><input type="text" className="form-control" id="newFsrEletricStopRate" value={formData.newFsrEletricStopRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newFsrEletricValidityStartDate" value={formData.newFsrEletricValidityStartDate ? formatDateOnly(formData.newFsrEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('fsrEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newFsrEletricValidityEndDate" value={formData.newFsrEletricValidityEndDate ? formatDateOnly(formData.newFsrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">DR</strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.drValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('dr')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('dr')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-4"><label className="form-label text-black">Day Rate</label><input type="text" className="form-control" id="drDayRate" value={formData.drDayRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.drValidityStartDate) {
                setFormData(prev => ({ ...prev, drValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('dr', 'drValidityStartDate', formData.drValidityStartDate, groupedCostModels.dr, showNewCostModels.dr)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="drValidityEndDate" value={formData.drValidityEndDate ? formatDateOnly(formData.drValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.dr} /></div>
            {mode === 'edit' && showNewCostModels.dr && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New DR</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('dr')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-4"><label className="form-label text-black">Day Rate</label><input type="text" className="form-control" id="newDrDayRate" value={formData.newDrDayRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newDrValidityStartDate" value={formData.newDrValidityStartDate ? formatDateOnly(formData.newDrValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('dr', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newDrValidityEndDate" value={formData.newDrValidityEndDate ? formatDateOnly(formData.newDrValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            {/* DR Electric */}
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">DR <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.drEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('drEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('drEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-4"><label className="form-label text-black">Day Rate</label><input type="text" className="form-control" id="drEletricDayRate" value={formData.drEletricDayRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.drEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, drEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('drEletric', 'drEletricValidityStartDate', formData.drEletricValidityStartDate, groupedCostModels.drEletric, showNewCostModels.drEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="drEletricValidityEndDate" value={formData.drEletricValidityEndDate ? formatDateOnly(formData.drEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.drEletric} /></div>
            {mode === 'edit' && showNewCostModels.drEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New DR Eletric</strong>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleNewCostModel('drEletric')}>
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-4"><label className="form-label text-black">Day Rate</label><input type="text" className="form-control" id="newDrEletricDayRate" value={formData.newDrEletricDayRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newDrEletricValidityStartDate" value={formData.newDrEletricValidityStartDate ? formatDateOnly(formData.newDrEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('drEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newDrEletricValidityEndDate" value={formData.newDrEletricValidityEndDate ? formatDateOnly(formData.newDrEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">DAF</strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.dafValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('daf')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('daf')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="dafBand1Stops" value={formData.dafBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.dafValidityStartDate) {
                setFormData(prev => ({ ...prev, dafValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="dafBand1Rate" value={formData.dafBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.dafValidityStartDate) {
                setFormData(prev => ({ ...prev, dafValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="dafBand2Stops" value={formData.dafBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="dafBand2Rate" value={formData.dafBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('daf', 'dafValidityStartDate', formData.dafValidityStartDate, groupedCostModels.daf, showNewCostModels.daf)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="dafValidityEndDate" value={formData.dafValidityEndDate ? formatDateOnly(formData.dafValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.daf} /></div>
            {mode === 'edit' && showNewCostModels.daf && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New DAF</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('daf')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newDafBand1Stops" value={formData.newDafBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newDafBand1Rate" value={formData.newDafBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newDafBand2Stops" value={formData.newDafBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newDafBand2Rate" value={formData.newDafBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newDafValidityStartDate" value={formData.newDafValidityStartDate ? formatDateOnly(formData.newDafValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('daf', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newDafValidityEndDate" value={formData.newDafValidityEndDate ? formatDateOnly(formData.newDafValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">DAF <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.dafEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('dafEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('dafEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="dafEletricBand1Stops" value={formData.dafEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} onFocus={() => {
              if (!formData.dafEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, dafEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="dafEletricBand1Rate" value={formData.dafEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.dafEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, dafEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="dafEletricBand2Stops" value={formData.dafEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
            <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="dafEletricBand2Rate" value={formData.dafEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('dafEletric', 'dafEletricValidityStartDate', formData.dafEletricValidityStartDate, groupedCostModels.dafEletric, showNewCostModels.dafEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="dafEletricValidityEndDate" value={formData.dafEletricValidityEndDate ? formatDateOnly(formData.dafEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.dafEletric} /></div>
            {mode === 'edit' && showNewCostModels.dafEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New DAF <span className="text-success">Eletric</span></strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleNewCostModel('dafEletric')}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Max Stops</label><input type="text" className="form-control" id="newDafEletricBand1Stops" value={formData.newDafEletricBand1Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 1 Rate</label><input type="text" className="form-control" id="newDafEletricBand1Rate" value={formData.newDafEletricBand1Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Max Stops</label><input type="text" className="form-control" id="newDafEletricBand2Stops" value={formData.newDafEletricBand2Stops || ''} onChange={handleInputChange} onKeyDown={handleIntegerKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Band 2 Rate</label><input type="text" className="form-control" id="newDafEletricBand2Rate" value={formData.newDafEletricBand2Rate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newDafEletricValidityStartDate" value={formData.newDafEletricValidityStartDate ? formatDateOnly(formData.newDafEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('dafEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newDafEletricValidityEndDate" value={formData.newDafEletricValidityEndDate ? formatDateOnly(formData.newDafEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
            <div className="col-12"><hr /></div>
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">Hourly</strong>
            </div>
            <div className="col-md-4">
              <label className="form-label text-black">Hourly Rate</label>
              <input
                type="text"
                className="form-control"
                id="hourlyRate"
                value={formData.hourlyRate || ''}
                onChange={handleInputChange}
                onKeyDown={handleDecimalKeyDown}
                onFocus={() => {
                  if (!formData.hourlyValidityStartDate) {
                    const now = new Date();
                    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    setFormData(prev => ({ ...prev, hourlyValidityStartDate: dateStr }));
                  }
                }}
                placeholder="e.g. 12.50"
              />
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="hourlyValidityStartDate" value={formData.hourlyValidityStartDate ? formatDateOnly(formData.hourlyValidityStartDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="hourlyValidityEndDate" value={formData.hourlyValidityEndDate ? formatDateOnly(formData.hourlyValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>

            <div className="col-12"><hr /></div>
            {/* Hourly Electric */}
            <div className="col-12 d-flex justify-content-between align-items-center">
              <strong className="text-primary">Hourly <span className="text-success">Eletric</span></strong>
              {mode === 'edit' && (
                <div className="d-flex gap-2">
                  {formData.hourlyEletricValidityStartDate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCostModelClick('hourlyEletric')}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleNewCostModel('hourlyEletric')}
                  >
                    <i className="bi bi-plus-lg"></i> New
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-4"><label className="form-label text-black">Hourly Rate</label><input type="text" className="form-control" id="hourlyEletricRate" value={formData.hourlyEletricRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} onFocus={() => {
              if (!formData.hourlyEletricValidityStartDate) {
                setFormData(prev => ({ ...prev, hourlyEletricValidityStartDate: getTodayDateString() }));
              }
            }} /></div>
            <div className="col-md-3">
              <label className="form-label text-black">Validity Start Date</label>
              {renderValidityStartDateInput('hourlyEletric', 'hourlyEletricValidityStartDate', formData.hourlyEletricValidityStartDate, groupedCostModels.hourlyEletric, showNewCostModels.hourlyEletric)}
            </div>
            <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="hourlyEletricValidityEndDate" value={formData.hourlyEletricValidityEndDate ? formatDateOnly(formData.hourlyEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" disabled={showNewCostModels.hourlyEletric} /></div>
            {mode === 'edit' && showNewCostModels.hourlyEletric && (
              <>
                <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                  <strong className="text-primary" style={{ color: '#003b3e' }}>New Hourly Eletric</strong>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleNewCostModel('hourlyEletric')}>
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
                <div className="col-md-4"><label className="form-label text-black">Hourly Rate</label><input type="text" className="form-control" id="newHourlyEletricRate" value={formData.newHourlyEletricRate || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity Start Date</label><input type="date" className="form-control" id="newHourlyEletricValidityStartDate" value={formData.newHourlyEletricValidityStartDate ? formatDateOnly(formData.newHourlyEletricValidityStartDate) : ''} onChange={(e) => handleNewValidityStartDateChange('hourlyEletric', e.target.value)} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
                <div className="col-md-3"><label className="form-label text-black">Validity End Date</label><input type="date" className="form-control" id="newHourlyEletricValidityEndDate" value={formData.newHourlyEletricValidityEndDate ? formatDateOnly(formData.newHourlyEletricValidityEndDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
              </>
            )}
          </div>
        );

      case 'training':
        return (
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-black">Cargo Operative training CO+T</label>
              <input type="date" className="form-control" id="cargoTrainingDate" value={formData.cargoTrainingDate ? formatDateOnly(formData.cargoTrainingDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" />
            </div>
            <div className="col-md-4">
              <label className="form-label text-black">Dangerous Goods Awareness training</label>
              <input type="date" className="form-control" id="dangerousGoodsTrainingDate" value={formData.dangerousGoodsTrainingDate ? formatDateOnly(formData.dangerousGoodsTrainingDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" />
            </div>
            <div className="col-md-4">
              <label className="form-label text-black">Manual Handling Training</label>
              <input type="date" className="form-control" id="manualHandlingTrainingDate" value={formData.manualHandlingTrainingDate ? formatDateOnly(formData.manualHandlingTrainingDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" />
            </div>
            <div className="col-md-6"><label className="form-label text-black">DHL Training Number</label><input type="text" className="form-control" id="dhlTrainingNumber" value={formData.dhlTrainingNumber || ''} onChange={handleInputChange} onKeyDown={handleDecimalKeyDown} /></div>
          </div>
        );

      case 'compliance':
        return (
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label text-black">Criminal Record Date</label><input type="date" className="form-control" id="criminalRecordDate" value={formData.criminalRecordDate ? formatDateOnly(formData.criminalRecordDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            <div className="col-md-4"><label className="form-label text-black">DVLA Check Date</label><input type="date" className="form-control" id="dvlaCheckDate" value={formData.dvlaCheckDate ? formatDateOnly(formData.dvlaCheckDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            <div className="col-md-4">
              <label className="form-label text-black">Immigration Status</label>
              <select className="form-select" id="immigrationStatus" value={(formData.immigrationStatus as string) || ''} onChange={handleInputChange}>
                <option value="Citizen">Citizen</option>
                <option value="Pre-Settlement">Pre-Settlement</option>
                <option value="Settlement">Settlement</option>
                <option value="Visa">Visa</option>
              </select>
            </div>
            <div className="col-md-4"><label className="form-label text-black">Visa Validity</label><input type="date" className="form-control" id="visaValidity" value={formData.visaValidity ? formatDateOnly(formData.visaValidity) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            <div className="col-md-4"><label className="form-label text-black">Driving Licence Expiring</label><input type="date" className="form-control" id="licenceExpiringDate" value={formData.licenceExpiringDate ? formatDateOnly(formData.licenceExpiringDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
            <div className="col-md-4"><label className="form-label text-black">Passport Expiring</label><input type="date" className="form-control" id="passportExpiringDate" value={formData.passportExpiringDate ? formatDateOnly(formData.passportExpiringDate) : ''} onChange={handleInputChange} onKeyDown={handleDateKeyDown} max="9999-12-31" /></div>
          </div>
        );

      default:
        return null;
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!mounted || !show) return;
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, show]);

  // Reset formData when modal closes
  useEffect(() => {
    if (!show && mode === 'add') {
      setFormData({});
    }
  }, [show, mode]);

  if (!mounted || !show) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={vendorStyles.modalBackdrop}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={vendorStyles.vendorModalContainer}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`vendor-theme ${vendorStyles.vendorModalContent}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={vendorStyles.vendorModalHeader}>
            <h5 className={vendorStyles.vendorModalHeaderTitle}>
              {mode === 'add' ? 'New Vendor' : 'Edit Vendor'}
            </h5>
            <button
              type="button"
              className={vendorStyles.vendorModalHeaderClose}
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className={vendorStyles.vendorModalHeaderCloseIcon} />
            </button>
          </div>

          {/* Body */}
          <div className={vendorStyles.vendorModalBody} style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Steps Navigation */}
            <div className={vendorStyles.stepsContainer}>
              <div className={vendorStyles.stepsWrapper}>
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      className={`${vendorStyles.stepButton} ${currentStep === step.id
                          ? vendorStyles.stepButtonActive
                          : vendorStyles.stepButtonInactive
                        }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <i className={`bi ${step.icon} ${vendorStyles.stepButtonIcon}`}></i>
                      <span className={vendorStyles.stepButtonLabel}>{step.label}</span>
                      <span className={vendorStyles.stepButtonNumber}>{index + 1}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className={vendorStyles.stepSeparator}>
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <form id="vendorForm">
              <h6 className={vendorStyles.formSection}>
                <i className={`bi ${STEPS.find(s => s.id === currentStep)?.icon} me-2`}></i>
                {STEPS.find(s => s.id === currentStep)?.label}
              </h6>
              {renderStepContent()}
            </form>
          </div>

          {/* Footer */}
          <div className={vendorStyles.vendorModalFooter}>
            <div>
              {canGoPrev() && (
                <button
                  type="button"
                  className={`${vendorStyles.btn} ${vendorStyles.btnSecondary} ${vendorStyles.btnFlex}`}
                  onClick={handlePrev}
                >
                  <i className="bi bi-chevron-left"></i>
                  Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {mode === 'edit' && (
                <button
                  type="button"
                  className={`${vendorStyles.btn} ${vendorStyles.btnPrimary}`}
                  onClick={handleSave}
                >
                  Save
                </button>
              )}
              {canGoNext() ? (
                <button
                  type="button"
                  className={`${vendorStyles.btn} ${vendorStyles.btnPrimary} ${vendorStyles.btnFlex}`}
                  onClick={handleNext}
                >
                  Next
                  <i className="bi bi-chevron-right"></i>
                </button>
              ) : (
                <button
                  type="button"
                  className={`${vendorStyles.btn} ${vendorStyles.btnPrimary}`}
                  onClick={handleSave}
                >
                  Save Vendor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <>
          {/* Backdrop */}
          <div
            className={vendorStyles.nestedModalBackdrop}
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal */}
          <div
            className={vendorStyles.nestedModalContainer}
            style={{ display: 'block', zIndex: 1150 }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="deleteCostModelModalLabel"
            aria-hidden={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={vendorStyles.nestedModalDialog} role="document">
              <div
                className={vendorStyles.nestedModalContent}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className={vendorStyles.nestedModalHeader}>
                  <h5 className={vendorStyles.nestedModalTitle} id="deleteCostModelModalLabel">
                    <i className={vendorStyles.nestedModalTitleIcon}></i>
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className={vendorStyles.nestedModalClose}
                    onClick={() => setDeleteConfirmModal({ show: false, type: null })}
                    aria-label="Close"
                  />
                </div>
                <div className={vendorStyles.nestedModalBody}>
                  <p className="mb-3">
                    Are you sure you want to delete this cost model? This action cannot be undone.
                  </p>
                  <div className={`${vendorStyles.alert} ${vendorStyles.alertWarning} mt-3 mb-0`} role="alert">
                    <i className={`bi bi-info-circle ${vendorStyles.alertIcon}`}></i>
                    This action cannot be undone.
                  </div>
                </div>
                <div className={vendorStyles.nestedModalFooter}>
                  <button
                    type="button"
                    className={`${vendorStyles.btn} ${vendorStyles.btnSecondary}`}
                    onClick={() => setDeleteConfirmModal({ show: false, type: null })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${vendorStyles.btn} ${vendorStyles.btnDanger} ${vendorStyles.btnFlex}`}
                    onClick={handleDeleteCostModel}
                  >
                    <i className={`bi bi-trash-fill ${vendorStyles.btnIcon}`}></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <>
          {/* Backdrop */}
          <div
            className={vendorStyles.nestedModalBackdrop}
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal */}
          <div
            className={vendorStyles.nestedModalContainer}
            style={{ display: 'block', zIndex: 1150 }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="errorModalLabel"
            aria-hidden={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={vendorStyles.nestedModalDialog} role="document">
              <div
                className={vendorStyles.nestedModalContent}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className={vendorStyles.nestedModalHeader}>
                  <h5 className={vendorStyles.nestedModalTitle} id="errorModalLabel">
                    <i className={vendorStyles.nestedModalTitleIconError}></i>
                    {errorModal.title}
                  </h5>
                  <button
                    type="button"
                    className={vendorStyles.nestedModalClose}
                    onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                    aria-label="Close"
                  />
                </div>
                <div className={vendorStyles.nestedModalBody}>
                  <p className="mb-0">
                    {errorModal.message}
                  </p>
                </div>
                <div className={vendorStyles.nestedModalFooter}>
                  <button
                    type="button"
                    className={`${vendorStyles.btn} ${vendorStyles.btnPrimary}`}
                    onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
    , document.body);
});

VendorModal.displayName = 'VendorModal';

export default VendorModal;
