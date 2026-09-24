'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateInstallments, formatDateToString } from '@/lib/deduction-installments';
import { useBankHolidays } from '@/hooks/useBankHolidays';
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";


interface DeductionModalProps {
  show: boolean;
  handleClose: () => void;
  handleSubmit: (data: Record<string, unknown>) => void;
  entryType: string;
  vendors?: string[];
  vehicles?: Array<{ vehicleId: number; registrationPlates?: string }>;
  routes?: Array<{ routeId: number; routeName?: string }>;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
  editingItem?: unknown;
  formData?: Record<string, string | boolean | number | undefined>;
  selectedCategory?: string;
  currentStep?: number;
  uploadedFiles?: File[];
  validationAttempted?: boolean;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  onFileInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile?: (index: number) => void;
  fieldHasError?: (fieldName: string) => boolean;
  confirmHasError?: boolean;
  reviewBaseInfo?: { incidentDate: string; vendor: string; type: string };
  fileInputRef?: React.RefObject<HTMLInputElement>;
  isDragOver?: boolean;
  isViewMode?: boolean;
  descriptionFieldError?: string | null;
  detailFieldError?: string | null;
}

function DeductionModal({
  show,
  handleClose,
  handleSubmit,
  entryType,
  vendors = [],
  vehicles = [],
  routes = [],
  servicePartners: _servicePartners = [],
  editingItem,
  formData: externalFormData,
  selectedCategory: _selectedCategory = '',
  currentStep: externalCurrentStep = 1,
  uploadedFiles = [],
  validationAttempted: _validationAttempted = false,
  onInputChange,
  onNextStep,
  onPrevStep,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInputChange,
  onRemoveFile,
  fieldHasError,
  confirmHasError = false,
  reviewBaseInfo,
  fileInputRef,
  isDragOver = false,
  isViewMode = false,
  descriptionFieldError,
  detailFieldError
}: DeductionModalProps) {
  const vendorItems = useMemo<SelectItem[]>(() => {
    return vendors.map((v) => ({
      value: v,
      label: v,
    }));
  }, [vendors]);

  const vehicleItems = useMemo<SelectItem[]>(() => {
    return vehicles.map((v) => ({
      value: v.registrationPlates || '',
      label: v.registrationPlates || 'N/A',
    }));
  }, [vehicles]);

  const routeItems = useMemo<SelectItem[]>(() => {
    return routes.map((r) => ({
      value: String(r.routeId),
      label: r.routeName || `Route ${r.routeId}`,
    }));
  }, [routes]);

  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const { guard } = useSubmitGuard();
  const [internalFormData, setInternalFormData] = useState<Record<string, unknown>>({});
  const [formType, setFormType] = useState(entryType);

  // Fetch bank holidays from backend (Task 3.7)
  const currentYear = new Date().getFullYear();
  const { data: bankHolidays } = useBankHolidays(currentYear);

  /**
   * Helper to get next business day using fetched bank holidays
   */
  const getAdjustedBusinessDay = useCallback((dateStr: string) => {
    // Append T00:00:00 to force local time parsing and avoid UTC offset shifting the date
    const currentDate = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00' : dateStr);
    if (isNaN(currentDate.getTime())) return dateStr;
    currentDate.setHours(0, 0, 0, 0);

    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = (date: Date) => {
      if (!bankHolidays) return false;
      const formatted = formatDateToString(date);
      return bankHolidays.includes(formatted);
    };

    while (isWeekend(currentDate) || isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return formatDateToString(currentDate);
  }, [bankHolidays]);

  // Use external formData and currentStep if provided, otherwise use internal state
  const formData = externalFormData || internalFormData;
  const currentStep = externalCurrentStep || internalCurrentStep;

  // Apply blur effect to modal backdrop and prevent layout shift
  useEffect(() => {
    if (show) {
      // Prevent layout shift by removing any padding/margin that might be added
      const preventLayoutShift = () => {
        // Force remove padding and margin from body to prevent content shift
        document.body.style.setProperty('padding-right', '0', 'important');
        document.body.style.setProperty('padding-left', '0', 'important');
        document.body.style.setProperty('margin-right', '0', 'important');
        document.body.style.setProperty('margin-left', '0', 'important');

        // Also check and remove from html if needed
        document.documentElement.style.setProperty('padding-right', '0', 'important');
        document.documentElement.style.setProperty('padding-left', '0', 'important');
        document.documentElement.style.setProperty('margin-right', '0', 'important');
        document.documentElement.style.setProperty('margin-left', '0', 'important');
      };

      // No need for backdrop manipulation with Tailwind

      // Force Vendor select to open downward
      const forceSelectDownward = () => {
        if (formType === 'Other') {
          const vendorSelect = document.querySelector('select[name="oth_vendor"]') as HTMLSelectElement;
          if (vendorSelect) {
            // Add event listener to ensure dropdown opens downward
            const handleFocus = () => {
              // Ensure there's enough space below by scrolling if needed
              const modalBody = vendorSelect.closest('[class*="modal-body"]') || vendorSelect.closest('div');
              if (modalBody) {
                const selectRect = vendorSelect.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - selectRect.bottom;

                // If there's less than 350px below, scroll down to make room
                // This ensures the dropdown has enough space to open downward
                if (spaceBelow < 350) {
                  const scrollAmount = 350 - spaceBelow + 50; // Extra 50px buffer
                  (modalBody as HTMLElement).scrollTop = Math.min(
                    (modalBody as HTMLElement).scrollTop + scrollAmount,
                    (modalBody as HTMLElement).scrollHeight - (modalBody as HTMLElement).clientHeight
                  );

                  // Also scroll the window if needed
                  const selectTop = selectRect.top + window.scrollY;
                  window.scrollTo({
                    top: selectTop - 100,
                    behavior: 'smooth'
                  });
                }
              }
            };

            const handleClick = () => {
              // Same logic on click to ensure space
              handleFocus();
            };

            vendorSelect.addEventListener('focus', handleFocus, { once: false });
            vendorSelect.addEventListener('click', handleClick, { once: false });

            return () => {
              vendorSelect.removeEventListener('focus', handleFocus);
              vendorSelect.removeEventListener('click', handleClick);
            };
          }
        }
        return undefined;
      };

      // Prevent layout shift immediately
      preventLayoutShift();

      const selectCleanup = forceSelectDownward();

      return () => {
        if (selectCleanup) selectCleanup();
        // Ensure padding is removed when modal closes
        preventLayoutShift();
      };
    } else {
      // When modal closes, ensure everything is reset
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('padding-left');
      document.body.style.removeProperty('margin-right');
      document.body.style.removeProperty('margin-left');
      document.documentElement.style.removeProperty('padding-right');
      document.documentElement.style.removeProperty('padding-left');
      document.documentElement.style.removeProperty('margin-right');
      document.documentElement.style.removeProperty('margin-left');
    }
  }, [show, formType]);

  // When the modal opens, reset state and set the type
  useEffect(() => {
    if (show) {
      setInternalCurrentStep(1);
      setFormType(entryType);
      if (!externalFormData) {
        const initialData: Record<string, unknown> = { type: entryType };
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        // For Repairs & Damages, set incident date to today
        if (entryType === 'Repairs & Damages') {
          initialData.rep_incidentDate = todayString;
        }
        // For Pre-Payments, set payment date to next business day and start month to current month
        if (entryType === 'Pre-Payments') {
          initialData.pre_paymentDate = getAdjustedBusinessDay(todayString);
          // Initialize start month with current month in YYYY-MM format
          const currentMonth = `${year}-${month}`;
          initialData.pre_initialPaymentDate = currentMonth;
        }
        // For Other, set incident date to today
        if (entryType === 'Other') {
          initialData.oth_incidentDate = todayString;
        }
        setInternalFormData(initialData);
      } else if (!editingItem && onInputChange) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        // For Repairs & Damages when not editing, set incident date only when empty
        if (entryType === 'Repairs & Damages') {
          // Only set default when field is empty; keep user's manual selection
          if (!externalFormData.rep_incidentDate || externalFormData.rep_incidentDate === '') {
            // Create a synthetic event to update the field
            const syntheticEvent = {
              target: {
                name: 'rep_incidentDate',
                value: todayString
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onInputChange(syntheticEvent);
          }
        }
        // For Other when not editing, set incident date only when empty
        if (entryType === 'Other') {
          // Only set default when field is empty; keep user's manual selection
          if (!externalFormData.oth_incidentDate || externalFormData.oth_incidentDate === '') {
            // Create a synthetic event to update the field
            const syntheticEvent = {
              target: {
                name: 'oth_incidentDate',
                value: todayString
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onInputChange(syntheticEvent);
          }
        }
      } else if (entryType === 'Pre-Payments' && onInputChange) {
        // For Pre-Payments, initialize start month with current month if empty (both new and editing)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const currentMonth = `${year}-${month}`;

        if (!externalFormData.pre_initialPaymentDate || externalFormData.pre_initialPaymentDate === '') {
          const syntheticEvent = {
            target: {
              name: 'pre_initialPaymentDate',
              value: currentMonth
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(syntheticEvent);
        }
      }
    }
  }, [show, entryType, externalFormData, editingItem, onInputChange, getAdjustedBusinessDay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Adjust payment dates to next business day if they fall on weekend or holiday
    // Only applies to today or future dates — past dates are allowed as-is
    // Note: Liquidation Damages allows any date (including weekends)
    let adjustedValue = value;
    if ((name === 'pre_paymentDate' || name === 'pen_paymentDate') && value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(value + 'T00:00:00');
        if (selected >= today) {
          adjustedValue = getAdjustedBusinessDay(value);
        }
      }
    }

    // Filter non-numeric characters for numeric fields
    let filteredValue = adjustedValue;
    // Fields that accept numbers and decimal point (monetary values)
    if (name === 'rep_totalRepairCost' || name === 'pre_totalAmount' || name === 'liq_amount' || name === 'pen_amount' || name === 'oth_amount') {
      // Allow numbers and decimal point
      filteredValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = filteredValue.split('.');
      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    // Fields that accept only integers (schedule terms)
    else if (name === 'rep_scheduleTerms' || name === 'pre_scheduleTerms' || name === 'oth_scheduleTerms') {
      // Allow only integers (numbers without decimal point)
      filteredValue = value.replace(/[^0-9]/g, '');
    }

    // Create a new event with filtered value if needed
    const eventToUse = filteredValue !== value
      ? { ...e, target: { ...e.target, value: filteredValue } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      : e;

    if (onInputChange) {
      onInputChange(eventToUse);
    } else {
      setInternalFormData((prev) => ({ ...prev, [name]: filteredValue }));
    }
  };

  // Handler to prevent non-numeric input for numeric fields
  const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const goToStep = (step: number) => {
    if (onNextStep && step > currentStep) {
      onNextStep();
    } else if (onPrevStep && step < currentStep) {
      onPrevStep();
    } else {
      setInternalCurrentStep(step);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract relevant data from formData based on formType
    const submissionData = { ...formData };
    handleSubmit(submissionData);
  };

  const getFieldValue = useCallback((fieldName: string): string => {
    const value = formData[fieldName];
    if (value === undefined || value === null) return '';
    return String(value);
  }, [formData]);

  const getFieldError = (fieldName: string): boolean => {
    return fieldHasError ? fieldHasError(fieldName) : false;
  };

  // Calculate installments preview for Repairs & Damages, Pre-Payments, and Other
  const installmentsPreview = useMemo(() => {
    // Only show preview for these types and when not editing
    if (editingItem || (formType !== 'Repairs & Damages' && formType !== 'Pre-Payments' && formType !== 'Other')) {
      return null;
    }

    let totalAmount = 0;
    let referenceNumber = '';
    let scheduleTerms = '';
    let entryDate = '';

    if (formType === 'Repairs & Damages') {
      totalAmount = parseFloat(getFieldValue('rep_totalRepairCost')) || 0;
      referenceNumber = getFieldValue('rep_refNumber') || '';
      scheduleTerms = getFieldValue('rep_scheduleTerms') || '';
      // Use payment date as base for installment calculation
      entryDate = getFieldValue('rep_paymentDate') || '';
    } else if (formType === 'Pre-Payments') {
      totalAmount = parseFloat(getFieldValue('pre_totalAmount')) || 0;
      referenceNumber = getFieldValue('pre_refNumber') || '';
      scheduleTerms = getFieldValue('pre_scheduleTerms') || '';
      // Use start month (pre_initialPaymentDate) if set, otherwise fall back to payment date
      const startMonth = getFieldValue('pre_initialPaymentDate');
      if (startMonth) {
        // Convert YYYY-MM format to YYYY-MM-01
        entryDate = startMonth.length === 7 ? `${startMonth}-01` : startMonth;
      } else {
        entryDate = getFieldValue('pre_paymentDate') || '';
      }
    } else if (formType === 'Other') {
      totalAmount = parseFloat(getFieldValue('oth_amount')) || 0;
      referenceNumber = getFieldValue('oth_refNumber') || '';
      scheduleTerms = getFieldValue('oth_scheduleTerms') || '';
      // Use payment date as base for installment calculation
      entryDate = getFieldValue('oth_paymentDate') || '';
    }

    // Only calculate if we have minimum required fields
    // entryDate must be a valid date string (YYYY-MM-DD format)
    if (totalAmount > 0 && referenceNumber && entryDate) {
      // Ensure entryDate is in YYYY-MM-DD format
      // Input date fields return YYYY-MM-DD format, so we can use it directly
      // But if it's empty or invalid, we need to handle it
      let formattedEntryDate = entryDate.trim();

      // If the date is in a different format, try to convert it
      if (formattedEntryDate.includes('/')) {
        // Convert from DD/MM/YYYY to YYYY-MM-DD if needed
        const parts = formattedEntryDate.split('/');
        if (parts.length === 3) {
          formattedEntryDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      // Validate the date format (should be YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedEntryDate)) {
        // If invalid format, don't calculate installments
        return null;
      }

      return calculateInstallments(
        totalAmount,
        scheduleTerms || null,
        referenceNumber,
        formattedEntryDate,
        [] // preview uses no bank holidays — contractual end-of-month dates; backend handles holiday adjustments on processing
      );
    }

    return null;
  }, [formType, editingItem, getFieldValue]);

  const formatCurrency = (val: number) => {
    return `£${val.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      // Parse the date string manually to avoid timezone issues
      // Expected format: YYYY-MM-DD
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        // Format as DD/MM/YYYY
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }

      // Fallback: try to parse as Date if format is different
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const renderRepairsDamagesFields = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Reference Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="rep_refNumber"
          value={getFieldValue('rep_refNumber')}
          onChange={handleInputChange}
          placeholder="Auto-generated"
          readOnly={true}
          className={`w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${getFieldError('rep_refNumber') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('rep_refNumber') && (
          <div className="text-red-500 text-sm mt-1">Reference number is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vendor <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vendorItems}
          value={getFieldValue('rep_vendor')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'rep_vendor', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vendor..."
          searchPlaceholder="Search vendor..."
          title="Vendors"
          className={getFieldError('rep_vendor') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('rep_vendor') && (
          <div className="text-red-500 text-sm mt-1">Vendor is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vehicle Registration <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vehicleItems}
          value={getFieldValue('rep_vehicleReg')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'rep_vehicleReg', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vehicle..."
          searchPlaceholder="Search vehicle..."
          title="Vehicles"
          className={getFieldError('rep_vehicleReg') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('rep_vehicleReg') && (
          <div className="text-red-500 text-sm mt-1">Vehicle is required</div>
        )}
      </div>
      {/*
        BAE-483/BAE-637: Incident Date só é bloqueada em modo de visualização.
        Antes também travava quando havia editingItem, o que impedia corrigir a data
        de um repair/damage já criado — mesmo tratamento já aplicado no modal Other.
      */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Incident Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="rep_incidentDate"
          value={getFieldValue('rep_incidentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('rep_incidentDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('rep_incidentDate') && (
          <div className="text-red-500 text-sm mt-1">Incident date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Payment Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="rep_paymentDate"
          value={getFieldValue('rep_paymentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('rep_paymentDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('rep_paymentDate') && (
          <div className="text-red-500 text-sm mt-1">Payment date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Total Repair Cost <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="rep_totalRepairCost"
          value={getFieldValue('rep_totalRepairCost')}
          onChange={handleInputChange}
          onKeyDown={handleNumericInput}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('rep_totalRepairCost') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('rep_totalRepairCost') && (
          <div className="text-red-500 text-sm mt-1">Total repair cost is required and must be greater than 0</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Schedule Terms</label>
        <select
          name="rep_scheduleTerms"
          value={getFieldValue('rep_scheduleTerms')}
          onChange={handleInputChange}
          disabled={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value="">Select number of installments</option>
          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}x
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const renderTrafficPenaltyFields = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Reference Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="pen_refNumber"
          value={getFieldValue('pen_refNumber')}
          onChange={handleInputChange}
          placeholder="Auto-generated"
          readOnly={true}
          className={`w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${getFieldError('pen_refNumber') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('pen_refNumber') && (
          <div className="text-red-500 text-sm mt-1">Reference number is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vendor <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vendorItems}
          value={getFieldValue('pen_vendor')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'pen_vendor', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vendor..."
          searchPlaceholder="Search vendor..."
          title="Vendors"
          className={getFieldError('pen_vendor') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('pen_vendor') && (
          <div className="text-red-500 text-sm mt-1">Vendor is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vehicle Registration <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vehicleItems}
          value={getFieldValue('pen_vehicleReg')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'pen_vehicleReg', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vehicle..."
          searchPlaceholder="Search vehicle..."
          title="Vehicles"
          className={getFieldError('pen_vehicleReg') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('pen_vehicleReg') && (
          <div className="text-red-500 text-sm mt-1">Vehicle is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">PCN Reference <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="pen_pcnRef"
          value={getFieldValue('pen_pcnRef')}
          onChange={handleInputChange}
          placeholder="Enter PCN reference"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Amount <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="pen_amount"
          value={getFieldValue('pen_amount')}
          onChange={handleInputChange}
          onKeyDown={handleNumericInput}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('pen_amount') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('pen_amount') && (
          <div className="text-red-500 text-sm mt-1">Amount is required and must be greater than 0</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">PCN Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="pen_penaltyDate"
          value={getFieldValue('pen_penaltyDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('pen_penaltyDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('pen_penaltyDate') && (
          <div className="text-red-500 text-sm mt-1">PCN date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Issuing Authority</label>
        <input
          type="text"
          name="pen_issuingAuth"
          value={getFieldValue('pen_issuingAuth')}
          onChange={handleInputChange}
          placeholder="Enter issuing authority"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Appeal Status</label>
        <input
          type="text"
          name="pen_appealStatus"
          value={getFieldValue('pen_appealStatus')}
          onChange={handleInputChange}
          placeholder="Enter appeal status"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Paid By</label>
        <input
          type="text"
          name="pen_paidBy"
          value={getFieldValue('pen_paidBy')}
          onChange={handleInputChange}
          placeholder="Enter who paid"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Payment Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="pen_paymentDate"
          value={getFieldValue('pen_paymentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('pen_paymentDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('pen_paymentDate') && (
          <div className="text-red-500 text-sm mt-1">Payment date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Entry Date</label>
        <input
          type="date"
          name="pen_dateOfEntry"
          value={getFieldValue('pen_dateOfEntry')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Council</label>
        <input
          type="text"
          name="pen_council"
          value={getFieldValue('pen_council')}
          onChange={handleInputChange}
          placeholder="Enter council"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
    </>
  );

  const renderPrePaymentFields = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Reference Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="pre_refNumber"
          value={getFieldValue('pre_refNumber')}
          onChange={handleInputChange}
          placeholder="Auto-generated"
          readOnly={true}
          className={`w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${getFieldError('pre_refNumber') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('pre_refNumber') && (
          <div className="text-red-500 text-sm mt-1">Reference number is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vendor <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vendorItems}
          value={getFieldValue('pre_vendor')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'pre_vendor', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vendor..."
          searchPlaceholder="Search vendor..."
          title="Vendors"
          className={getFieldError('pre_vendor') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('pre_vendor') && (
          <div className="text-red-500 text-sm mt-1">Vendor is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Total Amount <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="pre_totalAmount"
          value={getFieldValue('pre_totalAmount')}
          onChange={handleInputChange}
          onKeyDown={handleNumericInput}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('pre_totalAmount') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('pre_totalAmount') && (
          <div className="text-red-500 text-sm mt-1">Total amount is required and must be greater than 0</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Payment Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="pre_paymentDate"
          value={getFieldValue('pre_paymentDate')}
          onChange={handleInputChange}
          disabled={isViewMode || !!editingItem}
          readOnly={isViewMode || !!editingItem}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('pre_paymentDate') ? 'border-red-500' : 'border-gray-300'} ${(isViewMode || !!editingItem) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('pre_paymentDate') && (
          <div className="text-red-500 text-sm mt-1">Payment date is required</div>
        )}
      </div>
      {!isViewMode && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-900 mb-1">Start Month</label>
          <input
            type="month"
            name="pre_initialPaymentDate"
            value={getFieldValue('pre_initialPaymentDate')}
            onChange={handleInputChange}
            lang="en"
            className="w-full px-3 py-2 border rounded-md border-gray-300 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the month when the first deduction will start. If left empty, deductions will begin in the current month.
          </p>
        </div>
      )}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Schedule Terms</label>
        <select
          name="pre_scheduleTerms"
          value={getFieldValue('pre_scheduleTerms')}
          onChange={handleInputChange}
          disabled={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value="">Select number of installments</option>
          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}x
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Fees <span className="text-red-500">*</span></label>
        <select
          name="pre_fee"
          value={getFieldValue('pre_fee')}
          onChange={handleInputChange}
          disabled={isViewMode}
          className={`w-full px-3 py-2 border rounded-md bg-white ${getFieldError('pre_fee') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="0">0 pounds</option>
          <option value="25">25 pounds</option>
          <option value="40">40 pounds</option>
        </select>
        {getFieldError('pre_fee') && (
          <div className="text-red-500 text-sm mt-1">Fees is required</div>
        )}
      </div>
    </>
  );

  const renderLiquidationDamageFields = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Reference Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="liq_refNumber"
          value={getFieldValue('liq_refNumber')}
          onChange={handleInputChange}
          placeholder="Auto-generated"
          readOnly={true}
          className={`w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${getFieldError('liq_refNumber') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('liq_refNumber') && (
          <div className="text-red-500 text-sm mt-1">Reference number is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vendor <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vendorItems}
          value={getFieldValue('liq_vendor')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'liq_vendor', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vendor..."
          searchPlaceholder="Search vendor..."
          title="Vendors"
          className={getFieldError('liq_vendor') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('liq_vendor') && (
          <div className="text-red-500 text-sm mt-1">Vendor is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Route ID <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={routeItems}
          value={getFieldValue('liq_routeId')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'liq_routeId', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select route..."
          searchPlaceholder="Search route..."
          title="Routes"
          className={getFieldError('liq_routeId') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('liq_routeId') && (
          <div className="text-red-500 text-sm mt-1">Route is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Code</label>
        <input
          type="text"
          name="liq_lqCode"
          value={getFieldValue('liq_lqCode')}
          onChange={handleInputChange}
          placeholder="Enter code"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Amount <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="liq_amount"
          value={getFieldValue('liq_amount')}
          onChange={handleInputChange}
          onKeyDown={handleNumericInput}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('liq_amount') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('liq_amount') && (
          <div className="text-red-500 text-sm mt-1">Amount is required and must be greater than 0</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">AWB Booking</label>
        <input
          type="text"
          name="liq_awbNumber"
          value={getFieldValue('liq_awbNumber')}
          onChange={handleInputChange}
          placeholder="Enter AWB booking"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Liquidation Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="liq_lqDate"
          value={getFieldValue('liq_lqDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('liq_lqDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('liq_lqDate') && (
          <div className="text-red-500 text-sm mt-1">Liquidation date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Payment Date</label>
        <input
          type="date"
          name="liq_paymentDate"
          value={getFieldValue('liq_paymentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      {/* Entry Date only shown when editing */}
      {editingItem && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-900 mb-1">Entry Date</label>
            <input
              type="date"
              name="liq_dateOfEntry"
              value={getFieldValue('liq_dateOfEntry')}
              onChange={handleInputChange}
              disabled={isViewMode}
              readOnly={isViewMode}
              className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
          </div>
        </>
      )}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Failure Code</label>
        <input
          type="text"
          name="liq_failureCode"
          value={getFieldValue('liq_failureCode')}
          onChange={handleInputChange}
          placeholder="Enter failure code"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Paid By</label>
        <input
          type="text"
          name="liq_paidBy"
          value={getFieldValue('liq_paidBy')}
          onChange={handleInputChange}
          placeholder="Enter who paid"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
    </>
  );

  const renderOtherFields = () => (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Reference Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="oth_refNumber"
          value={getFieldValue('oth_refNumber')}
          onChange={handleInputChange}
          placeholder="Auto-generated"
          readOnly={true}
          className={`w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed ${getFieldError('oth_refNumber') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('oth_refNumber') && (
          <div className="text-red-500 text-sm mt-1">Reference number is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Vendor <span className="text-red-500">*</span></label>
        <SearchableSelect
          items={vendorItems}
          value={getFieldValue('oth_vendor')}
          onValueChange={(value) => {
            const syntheticEvent = {
              target: { name: 'oth_vendor', value }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          disabled={isViewMode}
          placeholder="Select vendor..."
          searchPlaceholder="Search vendor..."
          title="Vendors"
          className={getFieldError('oth_vendor') ? 'border-red-500' : 'border-gray-300'}
        />
        {getFieldError('oth_vendor') && (
          <div className="text-red-500 text-sm mt-1">Vendor is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Amount <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="oth_amount"
          value={getFieldValue('oth_amount')}
          onChange={handleInputChange}
          onKeyDown={handleNumericInput}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('oth_amount') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('oth_amount') && (
          <div className="text-red-500 text-sm mt-1">Amount is required and must be greater than 0</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Incident Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="oth_incidentDate"
          value={getFieldValue('oth_incidentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('oth_incidentDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('oth_incidentDate') && (
          <div className="text-red-500 text-sm mt-1">Incident date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Payment Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          name="oth_paymentDate"
          value={getFieldValue('oth_paymentDate')}
          onChange={handleInputChange}
          disabled={isViewMode}
          readOnly={isViewMode}
          className={`w-full px-3 py-2 border rounded-md ${getFieldError('oth_paymentDate') ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {getFieldError('oth_paymentDate') && (
          <div className="text-red-500 text-sm mt-1">Payment date is required</div>
        )}
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-900 mb-1">Schedule Terms</label>
        <select
          name="oth_scheduleTerms"
          value={getFieldValue('oth_scheduleTerms')}
          onChange={handleInputChange}
          disabled={isViewMode}
          className={`w-full px-3 py-2 border rounded-md border-gray-300 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        >
          <option value="">Select number of installments</option>
          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}x
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            {formType === 'Repairs & Damages' && renderRepairsDamagesFields()}
            {formType === 'Traffic Penalties' && renderTrafficPenaltyFields()}
            {formType === 'Pre-Payments' && renderPrePaymentFields()}
            {formType === 'Liquidation Damages' && renderLiquidationDamageFields()}
            {formType === 'Other' && renderOtherFields()}
          </div>
        );
      case 2:
        return (
          <div>
            {/* Description field based on type */}
            {formType === 'Repairs & Damages' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  rows={4}
                  name="rep_description"
                  value={getFieldValue('rep_description')}
                  onChange={handleInputChange}
                  placeholder="Enter description..."
                  disabled={isViewMode}
                  readOnly={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md ${descriptionFieldError ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                {descriptionFieldError && (
                  <div className="text-red-500 text-sm mt-1">{descriptionFieldError}</div>
                )}
              </div>
            )}
            {formType === 'Traffic Penalties' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  rows={4}
                  name="pen_notes"
                  value={getFieldValue('pen_notes')}
                  onChange={handleInputChange}
                  placeholder="Enter description..."
                  disabled={isViewMode}
                  readOnly={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${descriptionFieldError ? 'border-red-500' : 'border-gray-300'}`}
                />
                {descriptionFieldError && (
                  <div className="text-red-500 text-sm mt-1">{descriptionFieldError}</div>
                )}
              </div>
            )}
            {formType === 'Pre-Payments' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  rows={4}
                  name="pre_description"
                  value={getFieldValue('pre_description')}
                  onChange={handleInputChange}
                  placeholder="Enter description..."
                  disabled={isViewMode}
                  readOnly={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md ${descriptionFieldError ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                {descriptionFieldError && (
                  <div className="text-red-500 text-sm mt-1">{descriptionFieldError}</div>
                )}
              </div>
            )}
            {formType === 'Liquidation Damages' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  name="liq_description"
                  value={getFieldValue('liq_description')}
                  onChange={handleInputChange}
                  placeholder="Enter description..."
                  disabled={isViewMode}
                  readOnly={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md ${descriptionFieldError ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                {descriptionFieldError && (
                  <div className="text-red-500 text-sm mt-1">{descriptionFieldError}</div>
                )}
              </div>
            )}
            {formType === 'Other' && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                  <textarea
                    rows={4}
                    name="oth_description"
                    value={getFieldValue('oth_description')}
                    onChange={handleInputChange}
                    placeholder="Enter description..."
                    disabled={isViewMode}
                    readOnly={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md ${descriptionFieldError ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                  {descriptionFieldError && (
                    <div className="text-red-500 text-sm mt-1">{descriptionFieldError}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Detail</label>
                  <textarea
                    rows={4}
                    name="oth_details"
                    value={getFieldValue('oth_details')}
                    onChange={handleInputChange}
                    placeholder="Enter additional details..."
                    disabled={isViewMode}
                    readOnly={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md ${detailFieldError ? 'border-red-500' : 'border-gray-300'} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                  {detailFieldError && (
                    <div className="text-red-500 text-sm mt-1">{detailFieldError}</div>
                  )}
                </div>
              </>
            )}

            {/* Installments Preview for Repairs & Damages, Pre-Payments, and Other */}
            {installmentsPreview && installmentsPreview.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Installments Preview</label>
                <div className="border rounded p-3 bg-gray-50">
                  <p className="mb-2 text-gray-500 text-sm">
                    This deduction will be split into {installmentsPreview.length} installment(s):
                  </p>
                  <table className="w-full border-collapse mb-0 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Reference Number</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                        {formType === 'Pre-Payments' ? (
                          <>
                            <th className="border border-gray-300 px-3 py-2 text-left">Installment Value</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Fee</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Final Value</th>
                          </>
                        ) : (
                          <th className="border border-gray-300 px-3 py-2 text-left">Amount</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {installmentsPreview.map((inst, idx) => {
                        const feeValue = formType === 'Pre-Payments'
                          ? parseFloat(getFieldValue('pre_fee') || '0')
                          : 0;
                        const finalAmount = inst.amount + feeValue;

                        return (
                          <tr key={inst.installmentNumber} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-2">{inst.installmentNumber}</td>
                            <td className="border border-gray-300 px-3 py-2"><strong>{inst.referenceNumber || 'N/A'}</strong></td>
                            <td className="border border-gray-300 px-3 py-2">{formatDate(inst.date)}</td>
                            {formType === 'Pre-Payments' ? (
                              <>
                                <td className="border border-gray-300 px-3 py-2"><strong>{formatCurrency(inst.amount)}</strong></td>
                                <td className="border border-gray-300 px-3 py-2"><strong>{formatCurrency(feeValue)}</strong></td>
                                <td className="border border-gray-300 px-3 py-2"><strong className="text-blue-600">{formatCurrency(finalAmount)}</strong></td>
                              </>
                            ) : (
                              <td className="border border-gray-300 px-3 py-2"><strong>{formatCurrency(inst.amount)}</strong></td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-semibold">
                        {formType === 'Pre-Payments' ? (
                          <>
                            <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right">Total:</td>
                            <td className="border border-gray-300 px-3 py-2">{formatCurrency(installmentsPreview[0]?.totalAmount || 0)}</td>
                            <td className="border border-gray-300 px-3 py-2">{formatCurrency(parseFloat(getFieldValue('pre_fee') || '0') * installmentsPreview.length)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-blue-600">
                              {formatCurrency((installmentsPreview[0]?.totalAmount || 0) + (parseFloat(getFieldValue('pre_fee') || '0') * installmentsPreview.length))}
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right">Total:</td>
                            <td className="border border-gray-300 px-3 py-2">{formatCurrency(installmentsPreview[0]?.totalAmount || 0)}</td>
                          </>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            {!isViewMode && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Upload Documents</label>
                <div
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 transition-colors duration-200 ${isDragOver ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                >
                  <i className="bi bi-cloud-upload flex items-center justify-center text-3xl mb-4"></i>
                  <p>Drag and drop files here, or click to select files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={onFileInputChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef?.current?.click()}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Select Files
                  </button>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-700">Uploaded Files:</p>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                          <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            className="ml-2 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
                            onClick={() => onRemoveFile?.(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 3:
        const formatCurrencyForReview = (val: number | string | undefined) => {
          if (val === undefined || val === null || val === '') return '£0.00';
          const num = typeof val === 'string' ? parseFloat(val) : Number(val);
          if (isNaN(num)) return '£0.00';
          return `£${num.toFixed(2)}`;
        };

        const renderReviewFields = () => {
          if (reviewBaseInfo) {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{reviewBaseInfo.type || formType || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{reviewBaseInfo.vendor || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Incident Date:</span>
                  <span className="text-[#8491a1]">{reviewBaseInfo.incidentDate || 'N/A'}</span>
                </div>
              </>
            );
          }

          if (formType === 'Repairs & Damages') {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{formType}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Reference Number:</span>
                  <span className="text-[#8491a1]">{getFieldValue('rep_refNumber') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{getFieldValue('rep_vendor') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vehicle:</span>
                  <span className="text-[#8491a1]">{getFieldValue('rep_vehicleReg') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Incident Date:</span>
                  <span className="text-[#8491a1]">{getFieldValue('rep_incidentDate') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Total Repair Cost:</span>
                  <span className="text-[#8491a1]">{formatCurrencyForReview(getFieldValue('rep_totalRepairCost'))}</span>
                </div>
              </>
            );
          }

          if (formType === 'Traffic Penalties') {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{formType}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Reference Number:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pen_refNumber') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pen_vendor') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vehicle:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pen_vehicleReg') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>PCN Reference:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pen_pcnRef') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>PCN Date:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pen_penaltyDate') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Amount:</span>
                  <span className="text-[#8491a1]">{formatCurrencyForReview(getFieldValue('pen_amount'))}</span>
                </div>
                {getFieldValue('pen_issuingAuth') && (
                  <div className="flex justify-between mb-2 text-[0.9rem]">
                    <span>Issuing Authority:</span>
                    <span className="text-[#8491a1]">{getFieldValue('pen_issuingAuth')}</span>
                  </div>
                )}
              </>
            );
          }

          if (formType === 'Pre-Payments') {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{formType}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Reference Number:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pre_refNumber') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pre_vendor') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Total Amount:</span>
                  <span className="text-[#8491a1]">{formatCurrencyForReview(getFieldValue('pre_totalAmount'))}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Payment Date:</span>
                  <span className="text-[#8491a1]">{getFieldValue('pre_paymentDate') || 'N/A'}</span>
                </div>
              </>
            );
          }

          if (formType === 'Liquidation Damages') {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{formType}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Reference Number:</span>
                  <span className="text-[#8491a1]">{getFieldValue('liq_refNumber') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{getFieldValue('liq_vendor') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Route ID:</span>
                  <span className="text-[#8491a1]">{getFieldValue('liq_routeId') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Liquidation Date:</span>
                  <span className="text-[#8491a1]">{getFieldValue('liq_lqDate') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Amount:</span>
                  <span className="text-[#8491a1]">{formatCurrencyForReview(getFieldValue('liq_amount'))}</span>
                </div>
                {getFieldValue('liq_lqCode') && (
                  <div className="flex justify-between mb-2 text-[0.9rem]">
                    <span>Code:</span>
                    <span className="text-[#8491a1]">{getFieldValue('liq_lqCode')}</span>
                  </div>
                )}
                {getFieldValue('liq_awbNumber') && (
                  <div className="flex justify-between mb-2 text-[0.9rem]">
                    <span>AWB Booking:</span>
                    <span className="text-[#8491a1]">{getFieldValue('liq_awbNumber')}</span>
                  </div>
                )}
              </>
            );
          }

          if (formType === 'Other') {
            return (
              <>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Type:</span>
                  <span className="text-[#8491a1]">{formType}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Reference Number:</span>
                  <span className="text-[#8491a1]">{getFieldValue('oth_refNumber') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Vendor:</span>
                  <span className="text-[#8491a1]">{getFieldValue('oth_vendor') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Incident Date:</span>
                  <span className="text-[#8491a1]">{getFieldValue('oth_incidentDate') || 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2 text-[0.9rem]">
                  <span>Amount:</span>
                  <span className="text-[#8491a1]">{formatCurrencyForReview(getFieldValue('oth_amount'))}</span>
                </div>
              </>
            );
          }

          return null;
        };

        return (
          <div>
            <div className="mb-6 p-5 bg-[#f7f8fa] rounded-lg">
              <div className="font-semibold text-[#2c3e50] mb-3 border-b border-[#e9ecef] pb-2">Review Information</div>
              {renderReviewFields()}
            </div>
            {!isViewMode && (
              <div className="mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="confirmCheck"
                    checked={(formData.confirmCheck as boolean) || false}
                    onChange={handleInputChange}
                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${confirmHasError ? 'border-red-500' : ''}`}
                  />
                  <span className="text-sm text-gray-900">I confirm that the information above is correct</span>
                </label>
                {confirmHasError && (
                  <div className="text-red-500 text-sm mt-1">
                    Please confirm that the information is correct
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const modalTitle = isViewMode
    ? `View ${formType || entryType}`
    : editingItem
      ? `Edit ${formType || entryType}`
      : `New Entry: ${formType || entryType}`;

  if (!show) return null;

  return (
    <>
      {/* Modal with backdrop */}
      <div
        className="fixed inset-0 z-[1050] overflow-y-auto bg-black/60 backdrop-blur-sm"
      >
        <div
          className="flex min-h-full items-center justify-center px-[10%] py-4"
        >
          <div
            // Força locale en-GB nos controles nativos de data/mês do modal
            // (o picker e o texto exibido herdam o `lang`), evitando meses em português.
            lang="en-GB"
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col ${formType === 'Other' ? 'max-h-[85vh]' : 'max-h-[90vh]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">{modalTitle}</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <i className="bi bi-x-lg text-2xl"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {/* Wizard Navigation */}
              {!isViewMode && (
                <nav className="flex mb-4 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentStep === 1
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    1. Basic Information
                  </button>
                  <button
                    type="button"
                    onClick={() => currentStep >= 2 && goToStep(2)}
                    disabled={currentStep < 2}
                    className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentStep === 2
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      } ${currentStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    2. Details & Documentation
                  </button>
                  <button
                    type="button"
                    onClick={() => currentStep >= 3 && goToStep(3)}
                    disabled={currentStep < 3}
                    className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentStep === 3
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      } ${currentStep < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    3. Review & Confirmation
                  </button>
                </nav>
              )}

              {/* Form wraps all step content */}
              <form id="deductionForm" onSubmit={guard(onFormSubmit)}>
                {renderStepContent()}
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (onPrevStep) {
                      onPrevStep();
                    } else {
                      goToStep(currentStep - 1);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNextStep) {
                      onNextStep();
                    } else {
                      goToStep(currentStep + 1);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
              {!isViewMode && (
                <>
                  {currentStep === 3 && (
                    <Button type="submit" form="deductionForm">
                      Save Entry
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              {isViewMode && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeductionModal;


