"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WeekPlannerFormData, WeekPlannerField } from '../../contexts/PlannerContext';
import type { Vendor } from '@/lib/vendors';
import type { CostModel } from '@/lib/cost-models';
import type { Vehicle } from '@/lib/vehicles';
import type { Route } from '@/lib/api/routes';
import { SearchableSelect, type SelectItem as SearchableSelectItem } from "@/components/ui/searchable-select";

const TABLE_HEADERS: Array<{ key: WeekPlannerField | "isDayOff"; label: string }> = [
  { key: "date", label: "Date" },
  { key: "name", label: "Name" },
  { key: "route", label: "Route" },
  { key: "routeSort", label: "Sort" },
  { key: "adhocSort", label: "AD-HOC Sort" },
  { key: "notes", label: "Notes" },
  { key: "registrationPlate", label: "Registration Plate" },
  { key: "status", label: "Status" },
  { key: "isDayOff", label: "Day Off" },
];

type AssignmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: WeekPlannerFormData;
  onInputChange: (field: WeekPlannerField | "vehicle" | "isDayOff", value: string) => void;
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
  costModels: _costModels,
  loadingCostModels: _loadingCostModels,
  routes,
  loadingRoutes,
  vehicles,
  loadingVehicles,
}) => {
  const { guard } = useSubmitGuard();
  const vendorItems = React.useMemo<SearchableSelectItem[]>(() =>
    (vendors || []).map(v => ({
      value: String(v.userId),
      label: v.fullName || `Vendor ${v.userId}`,
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [vendors]
  );

  const routeItems = React.useMemo<SearchableSelectItem[]>(() => 
    (routes || []).map(r => ({
      value: String(r.routeId),
      label: r.routeName || `Route ${r.routeId}`,
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [routes]
  );

  const vehicleItems = React.useMemo<SearchableSelectItem[]>(() => 
    (vehicles || []).map(v => ({
      value: String(v.vehicleId),
      label: v.registrationPlates || `Vehicle ${v.vehicleId}`,
      secondaryLabel: v.model
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [vehicles]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingWeekPlannerId ? "Edit Record" : "Add New Record"}
          </DialogTitle>
          <DialogDescription>
            {editingWeekPlannerId 
              ? "Update the assignment details below." 
              : "Fill in the details to create a new assignment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={guard(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLE_HEADERS.map(({ key, label }) => {
              if (key === "registrationPlate") return null;
              
              // Notes field should span full width
              if (key === "notes") {
                return (
                  <div key={key} className="space-y-2 md:col-span-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Textarea
                      id={key}
                      value={formData[key]}
                      onChange={(e) => onInputChange(key, e.target.value)}
                      placeholder="Enter notes (optional)..."
                      rows={3}
                      className="resize-none bg-[#fffef0] border-[#f5e6a3] focus:border-[#e8d48f] focus:ring-[#f5e6a3]"
                    />
                  </div>
                );
              }
              
              // Only date and name (vendor) are required now
              const isRequired = ["date", "name"].includes(key);
              
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>
                    {label}
                    {isRequired && <span className="text-red-600"> *</span>}
                  </Label>
                  {key === "status" ? (
                    <Select
                      required
                      value={formData[key]}
                      onValueChange={(value) => onInputChange(key, value)}
                    >
                      <SelectTrigger id={key}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekPlannerTypes.statuses && weekPlannerTypes.statuses.length > 0 ? (
                          weekPlannerTypes.statuses.map((status, idx) => {
                            const statusValue = typeof status === "string" ? status : (status as { value?: string; label?: string }).value || String(status);
                            const statusLabel = typeof status === "string" ? status : (status as { value?: string; label?: string }).label || statusValue;
                            return (
                              <SelectItem key={statusValue ?? `status-${idx}`} value={statusValue}>
                                {statusLabel}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem value="Working">Working</SelectItem>
                            <SelectItem value="Off">Off</SelectItem>
                            <SelectItem value="pending">pending</SelectItem>
                            <SelectItem value="submitted">submitted</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
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
                  ) : key === "route" ? (
                    <SearchableSelect
                      items={routeItems}
                      value={formData[key] || ""}
                      onValueChange={(value) => onInputChange(key, value)}
                      loading={loadingRoutes}
                      placeholder="Select a route (optional)"
                      searchPlaceholder="Search route by name or ID..."
                      title="Routes"
                    />
                  ) : key === "isDayOff" ? (
                    <Select
                      value={formData[key]}
                      onValueChange={(value) => onInputChange(key, value)}
                    >
                      <SelectTrigger id={key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={key}
                      type={
                        key === "date"
                          ? "date"
                          : key === "routeSort" || key === "adhocSort"
                          ? "number"
                          : "text"
                      }
                      required={key === "date"}
                      value={formData[key]}
                      disabled={key === "adhocSort"}
                      readOnly={key === "adhocSort"}
                      onChange={(e) => {
                        if (key === "adhocSort") return;
                        onInputChange(key, e.target.value);
                      }}
                      placeholder=""
                      className={key === "adhocSort" ? "bg-slate-50 text-slate-600 cursor-not-allowed" : undefined}
                    />
                  )}
                </div>
              );
            })}
            
            {/* Vehicle field */}
            <div key="vehicle" className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <SearchableSelect
                items={vehicleItems}
                value={formData.vehicle || ""}
                onValueChange={(value) => onInputChange("vehicle", value)}
                loading={loadingVehicles}
                placeholder="Select a vehicle (optional)"
                searchPlaceholder="Search vehicle by plate or model..."
                title="Vehicles"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingWeekPlannerId
                ? "Update Record"
                : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
