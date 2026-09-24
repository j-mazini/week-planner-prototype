import React, { useCallback, useMemo } from 'react';
import { FormDataState, Route, Vehicle } from '../types';
import type { AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { X } from 'lucide-react';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { Vendor } from '@/lib/vendors';
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";

interface VehicleConflict {
  plate: string;
  date: string;
  existingVendor: string;
  currentVendor: string;
}

function parseVehicleConflict(message: string): VehicleConflict | null {
  const plate = message.match(/registration plate "([^"]+)"/)?.[1];
  const date = message.match(/on (\d{4}-\d{2}-\d{2})/)?.[1];
  const existing = message.match(/Vendors: "([^"]+)"/)?.[1];
  const current = message.match(/"([^"]+)" \(current request\)/)?.[1];
  if (!plate || !date || !existing || !current) return null;
  return { plate, date, existingVendor: existing, currentVendor: current };
}

const PAYMENT_MODE_VALUE = {
  DAF: String(BUSINESS_RULES.COST_MODEL.DAF),
  DR: String(BUSINESS_RULES.COST_MODEL.DR),
  FSR: String(BUSINESS_RULES.COST_MODEL.FSR),
  HOURLY_RATE: String(BUSINESS_RULES.COST_MODEL.HOURLY_RATE),
  VSR: String(BUSINESS_RULES.COST_MODEL.VSR),
  SP_VSR: String(BUSINESS_RULES.COST_MODEL.SP_VSR),
} as const;

const REQUIRED_RATE_PAYMENT_MODES = new Set<string>([
  PAYMENT_MODE_VALUE.DR,
  PAYMENT_MODE_VALUE.FSR,
  PAYMENT_MODE_VALUE.HOURLY_RATE,
]);

const FORCED_ZERO_RATE_PAYMENT_MODES = new Set<string>([
  PAYMENT_MODE_VALUE.VSR,
  PAYMENT_MODE_VALUE.SP_VSR,
]);

interface OperationModalProps {
  show: boolean;
  isSaving: boolean;
  editingOperationId: number | null;
  formData: FormDataState;
  formErrors: Record<string, string>;
  vendors: Vendor[];
  routes: Route[];
  vehicles: Vehicle[];
  adhocServices: AdhocServiceDTO[];
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (field: keyof FormDataState, value: string) => void;
  onFormErrorClear: (field: string) => void;
}

export const OperationModal: React.FC<OperationModalProps> = React.memo(({
  show,
  isSaving,
  editingOperationId,
  formData,
  formErrors,
  vendors,
  routes,
  vehicles,
  adhocServices,
  onClose,
  onSave,
  onFormDataChange,
  onFormErrorClear,
}) => {
  const vendorItems = useMemo<SelectItem[]>(() => {
    return [...vendors]
      .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' }))
      .map((v) => ({
        value: v.fullName || '',
        label: v.fullName || `Vendor ${v.userId}`,
      }));
  }, [vendors]);

  const vehicleItems = useMemo<SelectItem[]>(() => {
    return vehicles.map((v) => {
      const plate = v.registrationPlates || v.registrationPlate || 'N/A';
      return {
        value: plate,
        label: plate,
        secondaryLabel: v.model,
      };
    });
  }, [vehicles]);

  const routeItems = useMemo<SelectItem[]>(() => {
    return routes.map((r) => ({
      value: r.routeName || '',
      label: r.routeName || `Route ${r.routeId}`,
    }));
  }, [routes]);

  const adhocServiceItems = useMemo<SelectItem[]>(() => {
    return adhocServices.map((s) => ({
      value: String(s.adhocServiceId),
      label: s.adhocName || `AD-HOC Service ${s.adhocServiceId}`,
    }));
  }, [adhocServices]);

  const shouldShowRateField = !formData.adhocServiceId && formData.paymentMode !== '';
  const isRateRequired = REQUIRED_RATE_PAYMENT_MODES.has(formData.paymentMode);
  const isForcedZeroRateMode = FORCED_ZERO_RATE_PAYMENT_MODES.has(formData.paymentMode);

  const handleAdhocServiceChange = useCallback(
    (value: string) => {
      onFormDataChange('adhocServiceId', value);
      if (!value) {
        // Clearing the service → reset Adhoc Value to 0
        onFormDataChange('adhoc', '0');
        return;
      }
      const selected = adhocServices.find((s) => String(s.adhocServiceId) === value);
      if (
        selected &&
        selected.adhocVendorPayment != null &&
        selected.adhocVendorPayment !== undefined
      ) {
        const v =
          typeof selected.adhocVendorPayment === 'number'
            ? selected.adhocVendorPayment
            : Number(String(selected.adhocVendorPayment));
        onFormDataChange('adhoc', Number.isFinite(v) && v > 0 ? String(v) : '0');
      }
    },
    [adhocServices, onFormDataChange]
  );

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1040] transition-opacity duration-200"
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-[1050] flex items-center justify-center px-[10%] py-4"
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingOperationId ? 'Edit Register' : 'Add New Register'}
            </h3>
            <button 
              onClick={onClose}
              disabled={isSaving}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form id="addRegisterForm" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
              {formErrors.general && (() => {
                const conflict = parseVehicleConflict(formErrors.general);
                if (conflict) {
                  return (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-sm text-red-700">
                      <p className="font-semibold mb-2">Vehicle already assigned</p>
                      <p className="mb-1">
                        Registration plate <strong>{conflict.plate}</strong> on <strong>{conflict.date}</strong> is already in use:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Existing assignment: <strong>{conflict.existingVendor}</strong></li>
                        <li>Current request: <strong>{conflict.currentVendor}</strong></li>
                      </ul>
                    </div>
                  );
                }
                return (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-sm text-red-700">
                    {formErrors.general}
                  </div>
                );
              })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="newVendor" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vendor <span className="text-red-600">*</span>
                  </label>
                  <SearchableSelect
                    items={vendorItems}
                    value={formData.vendor}
                    onValueChange={(value) => {
                      onFormDataChange('vendor', value);
                      if (formErrors.vendor) {
                        onFormErrorClear('vendor');
                      }
                    }}
                    disabled={isSaving}
                    placeholder="Select Vendor"
                    searchPlaceholder="Search vendor..."
                    title="Vendors"
                    className={formErrors.vendor ? 'border-red-500' : ''}
                  />
                  {formErrors.vendor && <p className="mt-1 text-xs text-red-600">{formErrors.vendor}</p>}
                </div>
                <div>
                  <label htmlFor="newDepot" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Depot Location <span className="text-red-600">*</span>
                  </label>
                  <select 
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formErrors.depot ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    id="newDepot" 
                    value={formData.depot}
                    onChange={(e) => {
                      onFormDataChange('depot', e.target.value);
                      if (formErrors.depot) {
                        onFormErrorClear('depot');
                      }
                    }}
                    required
                    disabled={isSaving}
                  >
                    <option value="">Select Depot</option>
                    <option value="LCY">LCY</option>
                    <option value="LSE">LSE</option>
                    <option value="MSE">MSE</option>
                    <option value="BAOP">BAOP</option>
                  </select>
                  {formErrors.depot && <p className="mt-1 text-xs text-red-600">{formErrors.depot}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="newVRN" className="block text-sm font-medium text-gray-700 mb-1.5">
                    VRN <span className="text-red-600">*</span>
                  </label>
                  <SearchableSelect
                    items={vehicleItems}
                    value={formData.vrm}
                    onValueChange={(value) => {
                      onFormDataChange('vrm', value);
                      if (formErrors.vrm) {
                        onFormErrorClear('vrm');
                      }
                    }}
                    disabled={isSaving}
                    placeholder="Select Vehicle"
                    searchPlaceholder="Search vehicle..."
                    title="Vehicles"
                    className={formErrors.vrm ? 'border-red-500' : ''}
                  />
                  {formErrors.vrm && <p className="mt-1 text-xs text-red-600">{formErrors.vrm}</p>}
                </div>
                <div>
                  <label htmlFor="newRoute" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Route <span className="text-red-600">*</span>
                  </label>
                  <SearchableSelect
                    items={routeItems}
                    value={formData.route}
                    onValueChange={(value) => {
                      onFormDataChange('route', value);
                      if (formErrors.route) {
                        onFormErrorClear('route');
                      }
                    }}
                    disabled={isSaving}
                    placeholder="Select Route"
                    searchPlaceholder="Search route..."
                    title="Routes"
                    className={formErrors.route ? 'border-red-500' : ''}
                  />
                  {formErrors.route && <p className="mt-1 text-xs text-red-600">{formErrors.route}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="newPaymentMode" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Mode <span className="text-red-600">*</span>
                </label>
                <select
                  className={`w-full md:max-w-md px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.paymentMode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  id="newPaymentMode"
                  value={formData.paymentMode}
                  onChange={(e) => {
                    onFormDataChange('paymentMode', e.target.value);
                    if (formErrors.paymentMode) {
                      onFormErrorClear('paymentMode');
                    }
                  }}
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Payment Mode</option>
                  <option value={PAYMENT_MODE_VALUE.DAF}>DAF</option>
                  <option value={PAYMENT_MODE_VALUE.DR}>DR</option>
                  <option value={PAYMENT_MODE_VALUE.FSR}>FSR</option>
                  <option value={PAYMENT_MODE_VALUE.HOURLY_RATE}>Hourly Rate</option>
                  <option value={PAYMENT_MODE_VALUE.VSR}>VSR</option>
                  <option value={PAYMENT_MODE_VALUE.SP_VSR}>SP_VSR</option>
                </select>
                {formErrors.paymentMode && <p className="mt-1 text-xs text-red-600">{formErrors.paymentMode}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:items-start">
                <div>
                  <label htmlFor="newAdhocService" className="block text-sm font-medium text-gray-700 mb-1.5">
                    AD-HOC Service
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        items={adhocServiceItems}
                        value={formData.adhocServiceId}
                        onValueChange={(value) => handleAdhocServiceChange(value)}
                        disabled={isSaving}
                        placeholder="Select AD-HOC Service"
                        searchPlaceholder="Search service..."
                        title="AD-HOC Services"
                      />
                    </div>
                    {formData.adhocServiceId && (
                      <button
                        type="button"
                        onClick={() => handleAdhocServiceChange('')}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove AD-HOC Service"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="newAdhocValue" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adhoc Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="newAdhocValue"
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formData.adhocServiceId ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                    value={formData.adhoc}
                    onKeyDown={(e) => {
                      const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End','Enter'];
                      const isNum = e.key >= '0' && e.key <= '9';
                      const isDot = e.key === '.' || e.key === ',';
                      if (!isNum && !isDot && !allowed.includes(e.key)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
                      onFormDataChange('adhoc', sanitized);
                    }}
                    disabled={isSaving || !formData.adhocServiceId}
                  />
                </div>
              </div>
              {/* Rate — visible for all payment modes without AD-HOC; required only for DR, FSR and Hourly Rate */}
              {shouldShowRateField && (
                <div className="mb-4">
                  <label htmlFor="newRate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rate {isRateRequired && <span className="text-red-600">*</span>}
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className={`w-full md:w-1/2 px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      formErrors.rate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    id="newRate" 
                    placeholder="e.g., 1.51" 
                    value={formData.rate}
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        'Backspace','Tab','ArrowLeft','ArrowRight',
                        'Delete','Home','End','Enter',
                      ];
                      const isNumberKey = e.key >= '0' && e.key <= '9';
                      const isDecimalPoint = e.key === '.' || e.key === ',';
                      if (!isNumberKey && !isDecimalPoint && !allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
                      onFormDataChange('rate', sanitized);
                      if (formErrors.rate) onFormErrorClear('rate');
                    }}
                    disabled={isSaving || isForcedZeroRateMode}
                  />
                  {formErrors.rate && <p className="mt-1 text-xs text-red-600">{formErrors.rate}</p>}
                </div>
              )}
              {/* Sort — hidden when AD-HOC Service is selected */}
              {!formData.adhocServiceId && (
                <div className="mb-4">
                  <label htmlFor="newSort" className="block text-sm font-medium text-gray-700 mb-1.5">Sort</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    id="newSort"
                    placeholder="e.g., 28"
                    value={formData.sort}
                    onKeyDown={(e) => {
                      const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End','Enter'];
                      const isNum = e.key >= '0' && e.key <= '9';
                      const isDot = e.key === '.' || e.key === ',';
                      if (!isNum && !isDot && !allowed.includes(e.key)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      onFormDataChange('sort', e.target.value.replace(/[^0-9.,]/g, ''));
                    }}
                    disabled={isSaving}
                  />
                </div>
              )}
              {/* Extras — always visible */}
              <div className="mb-4">
                <label htmlFor="newextras" className="block text-sm font-medium text-gray-700 mb-1.5">Extras</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  id="newextras"
                  placeholder="e.g., 2"
                  value={formData.extras}
                  onKeyDown={(e) => {
                    const allowed = ['Backspace','Tab','ArrowLeft','ArrowRight','Delete','Home','End','Enter'];
                    const isNum = e.key >= '0' && e.key <= '9';
                    const isDot = e.key === '.' || e.key === ',';
                    if (!isNum && !isDot && !allowed.includes(e.key)) e.preventDefault();
                  }}
                  onChange={(e) => {
                    onFormDataChange('extras', e.target.value.replace(/[^0-9.,]/g, ''));
                  }}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label htmlFor="newNotes" className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  id="newNotes" 
                  rows={3} 
                  placeholder="Optional notes..."
                  value={formData.notes}
                  onChange={(e) => onFormDataChange('notes', e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave} pending={isSaving}>
              {isSaving
                ? (editingOperationId ? 'Updating...' : 'Saving...')
                : (editingOperationId ? 'Update Register' : 'Save Register')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

OperationModal.displayName = 'OperationModal';

