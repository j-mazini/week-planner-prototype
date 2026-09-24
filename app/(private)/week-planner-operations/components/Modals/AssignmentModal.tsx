"use client";

import React, { useMemo } from 'react';
import type { WeekPlannerFormData, WeekPlannerField } from '../../contexts/PlannerContext';
import type { Vendor } from '@/lib/vendors';
import type { CostModel } from '@/lib/cost-models';
import type { Vehicle } from '@/lib/vehicles';
import type { Route } from '@/lib/api/routes';
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

const TABLE_HEADERS = [
  { key: "date" as WeekPlannerField, label: "Date" },
  { key: "name" as WeekPlannerField, label: "Name" },
  { key: "route" as WeekPlannerField, label: "Route" },
  { key: "costModel" as WeekPlannerField, label: "Cost Model" },
  { key: "rate" as WeekPlannerField, label: "Rate" },
  { key: "routeCost" as WeekPlannerField, label: "Route Cost" },
  { key: "routeSort" as WeekPlannerField, label: "Sort" },
  { key: "adhocSort" as WeekPlannerField, label: "AD-HOC Sort" },
  { key: "extras" as WeekPlannerField, label: "Extras" },
  { key: "notes" as WeekPlannerField, label: "Notes" },
  { key: "registrationPlate" as WeekPlannerField, label: "Registration Plate" },
  { key: "status" as WeekPlannerField, label: "Status" },
  { key: "isDayOff" as WeekPlannerField, label: "Day Off" },
] as const;

type AssignmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: WeekPlannerFormData;
  onInputChange: (field: WeekPlannerField | "vehicle", value: string) => void;
  editingWeekPlannerId: number | null;
  submitting: boolean;
  weekPlannerTypes: {
    statuses?: string[];
  };
  vendors: Vendor[];
  loadingVendors: boolean;
  costModels: CostModel[];
  loadingCostModels: boolean;
  routes: Route[];
  loadingRoutes: boolean;
  vehicles: Vehicle[];
  loadingVehicles: boolean;
};

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  editingWeekPlannerId,
  submitting,
  weekPlannerTypes,
  vendors,
  loadingVendors,
  costModels,
  loadingCostModels,
  routes,
  loadingRoutes,
  vehicles,
  loadingVehicles,
}) => {
  const { guard } = useSubmitGuard();
  // Sort routes by depositId, then by routeName
  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      const depositIdA = a.depositId ?? 0;
      const depositIdB = b.depositId ?? 0;
      
      // First sort by depositId
      if (depositIdA !== depositIdB) {
        return depositIdA - depositIdB;
      }
      
      // If same depositId, sort by routeName
      const nameA = a.routeName || '';
      const nameB = b.routeName || '';
      return nameA.localeCompare(nameB);
    });
  }, [routes]);

  // Memoize Select items
  const vendorItems = useMemo<SelectItem[]>(() => {
    return vendors.map(v => ({
      value: String(v.userId),
      label: v.fullName || `Vendor ${v.userId}`,
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [vendors]);

  const routeItems = useMemo<SelectItem[]>(() => {
    return sortedRoutes.map(r => ({
      value: String(r.routeId),
      label: r.routeName || `Route ${r.routeId}`,
    }));
  }, [sortedRoutes]);

  const vehicleItems = useMemo<SelectItem[]>(() => {
    return vehicles.map(v => ({
      value: String(v.vehicleId),
      label: v.registrationPlates || `Vehicle ${v.vehicleId}`,
      secondaryLabel: v.model
    }));
  }, [vehicles]);

  const handleNumericInput = (field: WeekPlannerField, value: string) => {
    const numericValue = value.replace(/[^\d.-]/g, '');
    const parts = numericValue.split('.');
    const filteredValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    onInputChange(field, filteredValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingWeekPlannerId ? "Edit Record" : "Add New Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={guard(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLE_HEADERS.map(({ key, label }) => {
              if (key === "registrationPlate") return null;
              
              const isRequired = ["date", "name", "route", "costModel"].includes(key);
              
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                    {isRequired && <span className="text-red-600"> *</span>}
                  </label>
                  {key === "status" ? (
                    <select
                      required
                      value={formData[key]}
                      onChange={(e) => onInputChange(key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {weekPlannerTypes.statuses && weekPlannerTypes.statuses.length > 0 ? (
                        weekPlannerTypes.statuses.map((status, idx) => {
                          const statusValue = typeof status === "string" ? status : (status as { value?: string; label?: string }).value || String(status);
                          const statusLabel = typeof status === "string" ? status : (status as { value?: string; label?: string }).label || statusValue;
                          return (
                            <option key={statusValue ?? `status-${idx}`} value={statusValue}>
                              {statusLabel}
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option key="Working" value="Working">Working</option>
                          <option key="Off" value="Off">Off</option>
                          <option key="pending" value="pending">pending</option>
                          <option key="submitted" value="submitted">submitted</option>
                        </>
                      )}
                    </select>
                  ) : key === "name" ? (
                    <SearchableSelect
                      items={vendorItems}
                      value={formData[key]}
                      onValueChange={(value) => onInputChange(key, value)}
                      loading={loadingVendors}
                      placeholder="Select a vendor"
                      searchPlaceholder="Search vendor by name or ID..."
                      title="Vendors"
                    />
                  ) : key === "costModel" ? (
                    <select
                      required
                      value={formData[key]}
                      onChange={(e) => onInputChange(key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a cost model</option>
                      {costModels && costModels.length > 0 ? (
                        costModels.map((model, idx) => {
                          const modelId = model.costModelId;
                          const modelName = model.name || String(modelId || "");
                          const modelValue = String(modelId || "");
                          return (
                            <option key={modelId ?? `cost-model-${idx}`} value={modelValue}>
                              {modelName}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>
                          {loadingCostModels ? "Loading cost models..." : "No cost models available"}
                        </option>
                      )}
                    </select>
                  ) : key === "route" ? (
                    <SearchableSelect
                      items={routeItems}
                      value={formData[key]}
                      onValueChange={(value) => onInputChange(key, value)}
                      loading={loadingRoutes}
                      placeholder="Select a route"
                      searchPlaceholder="Search route..."
                      title="Routes"
                    />
                  ) : key === "isDayOff" ? (
                    <select
                      value={formData[key]}
                      onChange={(e) => onInputChange(key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : (
                    <input
                      type={
                        key === "date"
                          ? "date"
                          : key === "rate" || key === "routeSort" || key === "adhocSort" || key === "extras"
                          ? "text"
                          : "text"
                      }
                      required={key === "date"}
                      value={formData[key]}
                      disabled={key === "adhocSort"}
                      readOnly={key === "adhocSort"}
                      onChange={(e) => {
                        if (key === "adhocSort") return;
                        if (key === "rate" || key === "routeSort" || key === "extras") {
                          handleNumericInput(key, e.target.value);
                        } else {
                          onInputChange(key, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (key === "adhocSort") return;
                        if (key === "rate" || key === "routeSort" || key === "extras") {
                          const allowedKeys = [
                            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                            'Home', 'End'
                          ];
                          const isNumber = /^[0-9]$/.test(e.key);
                          const isDecimal = e.key === '.' && !e.currentTarget.value.includes('.');
                          const isMinus = e.key === '-' && e.currentTarget.selectionStart === 0;
                          const isAllowedKey = allowedKeys.includes(e.key);
                          const isCtrlA = e.ctrlKey && e.key === 'a';
                          const isCtrlC = e.ctrlKey && e.key === 'c';
                          const isCtrlV = e.ctrlKey && e.key === 'v';
                          const isCtrlX = e.ctrlKey && e.key === 'x';
                          
                          if (!isNumber && !isDecimal && !isMinus && !isAllowedKey && !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlX) {
                            e.preventDefault();
                          }
                        }
                      }}
                      className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent${
                        key === "adhocSort" ? " bg-slate-50 text-slate-600 cursor-not-allowed" : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
            
            {/* Vehicle field */}
            <div key="vehicle">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vehicle
                <span className="text-red-600"> *</span>
              </label>
              <SearchableSelect
                items={vehicleItems}
                value={formData.vehicle}
                onValueChange={(value) => onInputChange("vehicle", value)}
                loading={loadingVehicles}
                placeholder="Select a vehicle"
                searchPlaceholder="Search vehicle..."
                title="Vehicles"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" pending={submitting}>
              {submitting
                ? "Saving..."
                : editingWeekPlannerId
                ? "Update Record"
                : "Add Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
