"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect, type SelectItem as SearchableSelectItem } from "@/components/ui/searchable-select";
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { fetchRoutes } from '@/lib/api/routes';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { CalendarDays, Trash2, Calendar, CalendarClock } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

type EditVehicleModalProps = {
  open: boolean;
  onClose: () => void;
  assignment: WeekPlannerRecord | null;
  onSave: (
    weekPlannerId: number,
    vehicleId: number,
    costModelId: number,
    routeSort?: string,
    assignment?: WeekPlannerRecord,
    vehicleName?: string,
    registrationPlate?: string,
    costModelName?: string,
    adhocServiceId?: number | null,
    depositId?: number | null,
  ) => Promise<void>;
  currentDate?: string;
  showWeekends?: boolean;
  onAssignWeek?: (assignment: WeekPlannerRecord, excludeWeekends: boolean) => Promise<void>;
  onDelete?: (assignmentId: string | number) => Promise<void>;
  onRemoveDay?: (assignment: WeekPlannerRecord) => Promise<void>;
  onRemoveWeek?: (assignment: WeekPlannerRecord) => Promise<void>;
};

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  open,
  onClose,
  assignment,
  onSave,
  showWeekends = true,
  onAssignWeek,
  onDelete: _onDelete,
  onRemoveDay,
  onRemoveWeek,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [routeSort, setRouteSort] = useState<string>('yes');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);
  const [selectedAdhocServiceId, setSelectedAdhocServiceId] = useState<string>('');
  const [routeDepositId, setRouteDepositId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigningWeek, setIsAssigningWeek] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [error, setError] = useState<string>('');

  // Use ref to track if we've already initialized for this assignment
  const initializedAssignmentId = useRef<number | null>(null);
  const isInitializing = useRef(false);
  const lastAssignmentRef = useRef<WeekPlannerRecord | null>(null);

  // Memoize assignment ID to avoid unnecessary re-initializations
  const assignmentId = useMemo(() => {
    return assignment?.weekPlannerId ?? null;
  }, [assignment?.weekPlannerId]);

  // Check if assignment actually changed
  const assignmentChanged = useMemo(() => {
    if (!assignment || !lastAssignmentRef.current) return true;
    const current = assignment.weekPlannerId;
    const last = lastAssignmentRef.current.weekPlannerId;
    return current !== last;
  }, [assignment]);

  // Initialize form when modal opens
  useEffect(() => {
    if (!open) {
      setShowRemoveModal(false);
      initializedAssignmentId.current = null;
      lastAssignmentRef.current = null;
      // Reset form state when modal closes
      setSelectedVehicleId('');
      setSelectedAdhocServiceId('');
      setRouteSort('yes');
      setRouteDepositId(null);
      setVehicles([]);
      setAdhocServices([]);
      setError('');
      return;
    }
    
    if (!assignment) {
      return;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing.current) {
      return;
    }

    // Skip if already initialized for this assignment and assignment hasn't changed
    if (initializedAssignmentId.current === assignmentId && !assignmentChanged) {
      return;
    }

    const initializeForm = async () => {
      isInitializing.current = true;
      setIsLoading(true);
      setError('');

      try {
        // Load vehicles + cost models + routes + adhoc services
        // Use Promise.allSettled to handle individual failures gracefully
        const [vehiclesResult, routesResult, adhocServicesResult] = await Promise.allSettled([
          fetchVehicles(),
          fetchRoutes(),
          fetchAdhocServices(),
        ]);

        // Extract successful results or use empty arrays as fallback
        const vehiclesData = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : [];
        const routesData = routesResult.status === 'fulfilled' ? routesResult.value : [];
        const adhocServicesData = adhocServicesResult.status === 'fulfilled' ? adhocServicesResult.value : [];

        // Log errors for debugging and collect error messages
        const errors: string[] = [];
        if (vehiclesResult.status === 'rejected') {
          console.error('Error fetching vehicles:', vehiclesResult.reason);
          errors.push('vehicles');
        }
        if (routesResult.status === 'rejected') {
          console.error('Error fetching routes:', routesResult.reason);
          // Routes error is less critical, just log it
        }
        if (adhocServicesResult.status === 'rejected') {
          console.error('Error fetching adhoc services:', adhocServicesResult.reason);
          // Adhoc services error is less critical, just log it
        }

        // Show warning if critical data failed to load
        if (errors.length > 0) {
          const errorMessage = `Failed to load: ${errors.join(', ')}. Some features may be limited.`;
          setError(errorMessage);
        }

        // Batch all state updates together to minimize re-renders
        const raw = assignment.raw as Record<string, unknown>;
        
        // Extract vehicle ID
        const vehicleId = raw.vehicleId || 
          (raw.vehicle && typeof raw.vehicle === 'object' 
            ? (raw.vehicle as Record<string, unknown>).vehicleId 
            : null);
        
        // Determine depositId
        const routeIdCandidate =
          raw.routeId ??
          raw.routeDefaultId ??
          (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeId ?? (raw.route as Record<string, unknown>).routeDefaultId : undefined);

        const routeId = Number(routeIdCandidate ?? 0);
        const depositFromRaw = raw.depositId ?? (raw as Record<string, unknown>).depositId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).depositId : undefined);
        const depositIdFromRaw = depositFromRaw !== null && depositFromRaw !== undefined ? Number(depositFromRaw) : NaN;

        const resolvedRoute =
          Number.isFinite(routeId) && routeId > 0
            ? routesData.find((r) => r.routeId === routeId || (r as Record<string, unknown>).routeDefaultId === routeId)
            : null;

        const depositId =
          Number.isFinite(depositIdFromRaw) && depositIdFromRaw > 0
            ? depositIdFromRaw
            : resolvedRoute?.depositId != null
              ? Number(resolvedRoute.depositId)
              : null;

        // Extract adhoc service ID - check multiple possible locations
        const adhocServiceObj = raw.adhocService as Record<string, unknown> | undefined;
        const adhocServiceFromRaw = 
          raw.adhocServiceId ?? 
          (raw as Record<string, unknown>).adhocServiceId ?? 
          (adhocServiceObj?.adhocServiceId) ?? 
          null;
        const adhocServiceId = adhocServiceFromRaw !== null && adhocServiceFromRaw !== undefined ? Number(adhocServiceFromRaw) : NaN;

        // Extract route sort - prefer isSort (API) over routeSort when available
        const rawIsSort = raw.isSort;
        const currentRouteSort = assignment.routeSort || raw.routeSort || '';
        const hasAdHocSort = raw.adhocSort !== null && raw.adhocSort !== undefined && Number(raw.adhocSort) > 0;
        const routeNameForType = String(
          (raw.routeName as string | undefined) ??
            ((raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).routeName : undefined) as string | undefined) ??
            assignment.route ??
            ""
        ).toLowerCase();
        const isAdHocRoute = routeNameForType.includes("adhoc") || routeNameForType.includes("ad-hoc");

        let sortValue = (hasAdHocSort || isAdHocRoute) ? 'no' : 'yes';

        // isSort from API takes precedence (routeSort can be 0 for payment while isSort=true for sort)
        if (rawIsSort !== null && rawIsSort !== undefined) {
          sortValue = rawIsSort === true || rawIsSort === 'true' || rawIsSort === 1 ? 'yes' : 'no';
        } else if (currentRouteSort !== null && currentRouteSort !== undefined && currentRouteSort !== '') {
          if (typeof currentRouteSort === 'number') {
            sortValue = (currentRouteSort === 1 || currentRouteSort === 20) ? 'yes' : 'no';
          } else {
            const sortStr = String(currentRouteSort).toLowerCase();
            if (sortStr === 'yes' || sortStr === '1') {
              sortValue = 'yes';
            } else if (sortStr === 'no' || sortStr === '0') {
              sortValue = 'no';
            } else if (sortStr === '20') {
              sortValue = 'yes';
            }
          }
        }

        // Batch all state updates
        setVehicles(vehiclesData);
        setAdhocServices(adhocServicesData);
        setSelectedVehicleId(vehicleId ? String(vehicleId) : '');
        setRouteDepositId(depositId);
        setSelectedAdhocServiceId(Number.isFinite(adhocServiceId) && adhocServiceId > 0 ? String(adhocServiceId) : '');
        setRouteSort(sortValue);
        
        // Mark as initialized
        initializedAssignmentId.current = assignmentId;
        lastAssignmentRef.current = assignment;
      } catch (err) {
        console.error("Error initializing form:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeForm();
  }, [open, assignment, assignmentId, assignmentChanged]);

  /** Cost model is not editable here — keep from assignment payload */
  const effectiveCostModelId = useMemo(() => {
    if (!assignment) return 0;
    const raw = assignment.raw as Record<string, unknown>;
    const rawCostModelObj =
      raw.costModel && typeof raw.costModel === "object"
        ? (raw.costModel as Record<string, unknown>)
        : null;
    const costModelCandidate =
      raw.costModelId ??
      rawCostModelObj?.costModelId ??
      raw.costModel;
    const parsed = Number(costModelCandidate ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [assignment]);

  const effectiveCostModelName = useMemo(() => {
    if (!assignment) return "";
    const raw = assignment.raw as Record<string, unknown>;
    const co =
      raw.costModel && typeof raw.costModel === "object"
        ? (raw.costModel as Record<string, unknown>)
        : null;
    return String(co?.costModelName ?? co?.name ?? "");
  }, [assignment]);

  const handleSave = useCallback(async () => {
    if (!assignment) {
      setError('Invalid assignment');
      return;
    }

    if (!selectedVehicleId) {
      setError('Please select a vehicle');
      return;
    }

    if (!effectiveCostModelId) {
      setError('Cost model is missing on this assignment. Refresh data or check vendor cost model.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const selectedVehicle = vehicles.find(v => v.vehicleId === Number(selectedVehicleId));
      const vehicleName = selectedVehicle?.model || '';
      const registrationPlate = (selectedVehicle?.registration_plates as string | undefined) || '';
      const sortValue = routeSort === 'yes' ? 'yes' : 'no';

      const costModelName = effectiveCostModelName;
      
      const weekPlannerId = typeof assignment.weekPlannerId === 'number' && assignment.weekPlannerId > 0
        ? assignment.weekPlannerId
        : 0;

      const adhocServiceId =
        selectedAdhocServiceId && Number(selectedAdhocServiceId) > 0 ? Number(selectedAdhocServiceId) : null;

      await onSave(
        weekPlannerId,
        Number(selectedVehicleId),
        effectiveCostModelId,
        sortValue,
        assignment,
        vehicleName,
        registrationPlate,
        costModelName,
        adhocServiceId,
        routeDepositId,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vehicle");
    } finally {
      setIsSaving(false);
    }
  }, [assignment, selectedVehicleId, effectiveCostModelId, effectiveCostModelName, routeSort, selectedAdhocServiceId, routeDepositId, vehicles, onSave, onClose]);

  const handleAssignWeek = useCallback(async () => {
    if (!assignment || !onAssignWeek) {
      setError('Cannot assign week: missing assignment or handler');
      return;
    }

    if (!effectiveCostModelId) {
      setError('Cost model is missing on this assignment. Refresh data or check vendor cost model.');
      return;
    }

    setIsAssigningWeek(true);
    setError('');

    try {
      const selectedVehicle = vehicles.find(v => v.vehicleId === Number(selectedVehicleId));
      const vehicleName = selectedVehicle?.model || assignment.vehicle || '';
      const registrationPlate = (selectedVehicle?.registration_plates as string | undefined) || assignment.registrationPlate || '';
      const sortValue = routeSort === 'yes' ? 'yes' : 'no';

      const costModelName = effectiveCostModelName;

      const updatedAssignment: WeekPlannerRecord = {
        ...assignment,
        vehicle: vehicleName,
        registrationPlate,
        routeSort: sortValue,
        raw: {
          ...(assignment.raw ?? {}),
          vehicleId: selectedVehicleId ? Number(selectedVehicleId) : (assignment.raw as Record<string, unknown> | undefined)?.vehicleId,
          costModelId: effectiveCostModelId,
          isSort: sortValue === 'yes',
          routeSort: sortValue,
          adhocServiceId:
            selectedAdhocServiceId && Number(selectedAdhocServiceId) > 0 ? Number(selectedAdhocServiceId) : undefined,
          depositId: routeDepositId ?? undefined,
          costModel: {
            ...((assignment.raw as Record<string, unknown> | undefined)?.costModel && typeof (assignment.raw as Record<string, unknown>).costModel === 'object'
              ? (assignment.raw as Record<string, unknown>).costModel as Record<string, unknown>
              : {}),
            costModelId: effectiveCostModelId,
            costModelName: costModelName || undefined,
            name: costModelName || undefined,
          },
        },
      };

      await onAssignWeek(updatedAssignment, !showWeekends);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign vendor for the week");
    } finally {
      setIsAssigningWeek(false);
    }
  }, [assignment, onAssignWeek, showWeekends, effectiveCostModelId, effectiveCostModelName, selectedVehicleId, vehicles, routeSort, routeDepositId, selectedAdhocServiceId, onClose]);

  const handleDeleteClick = useCallback(() => {
    if (!assignment) {
      setError('Invalid assignment');
      return;
    }
    setError('');
    setShowRemoveModal(true);
  }, [assignment]);

  const handleRemoveDayClick = useCallback(async () => {
    if (!assignment || !onRemoveDay) {
      setError('Cannot remove: missing assignment or handler');
      return;
    }

    setIsDeleting(true);
    setError('');
    setShowRemoveModal(false);

    try {
      await onRemoveDay(assignment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove assignment");
    } finally {
      setIsDeleting(false);
    }
  }, [assignment, onRemoveDay, onClose]);

  const handleRemoveWeekClick = useCallback(async () => {
    if (!assignment || !onRemoveWeek) {
      setError('Cannot remove: missing assignment or handler');
      return;
    }

    setIsDeleting(true);
    setError('');
    setShowRemoveModal(false);

    try {
      await onRemoveWeek(assignment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove assignments");
    } finally {
      setIsDeleting(false);
    }
  }, [assignment, onRemoveWeek, onClose]);

  const canAssignWeek = Boolean(onAssignWeek && assignment);

  // Memoize handlers to prevent re-renders
  const handleAdhocServiceChange = useCallback((value: string) => {
    const nextAdhocServiceId = value === "none" ? "" : value;
    setSelectedAdhocServiceId(nextAdhocServiceId);
  }, []);

  const handleVehicleChange = useCallback((value: string) => {
    setSelectedVehicleId(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setRouteSort(value);
  }, []);

  const getVehicleLabel = useCallback((vehicle: Vehicle): string => {
    const vehicleId = vehicle.vehicleId;
    const plates = (vehicle.registration_plates as string | undefined) || '';

    if (plates) return plates;
    return vehicleId != null ? `Vehicle ${vehicleId}` : 'Vehicle';
  }, []);

  // Memoize select options to prevent re-renders
  const vehicleOptions = useMemo<SearchableSelectItem[]>(() => {
    return vehicles.map((vehicle) => ({
      value: String(vehicle.vehicleId),
      label: getVehicleLabel(vehicle),
      secondaryLabel: vehicle.model
    }));
  }, [vehicles, getVehicleLabel]);

  const adhocServiceItems = useMemo<SearchableSelectItem[]>(() => {
    return adhocServices.map((service) => ({
      value: String(service.adhocServiceId),
      label: service.adhocName || `ADHOC Service ${service.adhocServiceId}`,
    }));
  }, [adhocServices]);

  if (!assignment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col p-0 bg-white border border-slate-200 shadow-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0 px-4 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <DialogTitle className="text-slate-800 text-base font-semibold">Edit Assignment</DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            Edit vehicle and sort settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 px-4 pb-3">
          {/* Read-only Assignment Info */}
          <div className="space-y-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vendor</Label>
              <p className="text-sm font-semibold mt-1 text-slate-900">{assignment.name || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Route</Label>
              <p className="text-sm font-semibold mt-1 text-slate-900">{assignment.route || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</Label>
              <p className="text-sm font-semibold mt-1 text-slate-900">{assignment.date || 'Unknown'}</p>
            </div>
          </div>

          {/* ADHOC Service Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="adhoc-service-select" className="text-sm">
              ADHOC Service (optional)
            </Label>
            <SearchableSelect
              items={adhocServiceItems}
              value={selectedAdhocServiceId || "none"}
              onValueChange={(value) => handleAdhocServiceChange(value)}
              loading={isLoading}
              disabled={isSaving || isDeleting}
              placeholder="Select an ADHOC service"
              searchPlaceholder="Search service..."
              title="ADHOC Services"
            />
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="vehicle-select" className="text-sm">Vehicle *</Label>
            <SearchableSelect
              items={vehicleOptions}
              value={selectedVehicleId}
              onValueChange={(value) => handleVehicleChange(value)}
              loading={isLoading}
              disabled={isSaving || isDeleting}
              placeholder="Select a vehicle"
              searchPlaceholder="Search vehicle..."
              title="Vehicles"
            />
          </div>

          {/* Sort Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="sort-select" className="text-sm">Sort</Label>
            <Select
              value={routeSort}
              onValueChange={handleSortChange}
              disabled={isLoading || isSaving || isDeleting}
            >
              <SelectTrigger id="sort-select" className="w-full">
                <SelectValue placeholder="Select sort status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t border-slate-200 bg-slate-50 pt-3 px-4 pb-4">
          <div className="w-full flex flex-wrap gap-2">
            {/* Assign Week Button - Always visible */}
            <Button
              type="button"
              onClick={handleAssignWeek}
              disabled={!canAssignWeek || isAssigningWeek || isSaving || isLoading || isDeleting}
              className="flex-1 min-w-[110px] bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 text-xs py-2"
            >
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate text-xs font-medium">
                {isAssigningWeek 
                  ? 'Assigning...' 
                  : `Assign Week${!showWeekends ? ' (Mon-Fri)' : ''}`
                }
              </span>
            </Button>

            {/* Remove Button - Always visible */}
            <Button
              type="button"
              onClick={handleDeleteClick}
              disabled={!assignment || isDeleting || isSaving || isAssigningWeek}
              className="flex-1 min-w-[90px] bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 text-xs py-2"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate text-xs font-medium">
                Remove
              </span>
            </Button>

            {/* Cancel Button - Always visible */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isAssigningWeek || isDeleting}
              className="flex-1 min-w-[80px] border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all duration-200 text-xs py-2"
            >
              <span className="text-xs font-medium">Cancel</span>
            </Button>

            {/* Save Button - Always visible */}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading || !selectedVehicleId || !effectiveCostModelId || isAssigningWeek || isDeleting}
              className="flex-1 min-w-[100px] bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 text-xs py-2"
            >
              <span className="text-xs font-medium">
                {isSaving ? 'Saving...' : 'Save'}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Remove Options Modal */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent
          className="sm:max-w-md bg-white border border-slate-200 shadow-xl p-0 rounded-xl overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="bg-slate-50 border-b border-slate-200 px-4 pt-4 pb-3 rounded-t-xl">
            <DialogTitle className="text-slate-800 text-base font-semibold">Remove Assignment</DialogTitle>
            <DialogDescription className="text-slate-600 text-xs">
              Choose what you want to remove
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 px-4">
            {assignment && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1.5">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vendor</Label>
                    <p className="text-sm font-semibold mt-1 text-slate-900">{assignment.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Route</Label>
                    <p className="text-sm font-semibold mt-1 text-slate-900">{assignment.route || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</Label>
                    <p className="text-sm font-semibold mt-1 text-slate-900">
                      {assignment.date ? formatDate(assignment.date, 'dd/mm/yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {onRemoveDay && assignment && (
                <Button
                  type="button"
                  onClick={handleRemoveDayClick}
                  disabled={isDeleting}
                  className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 h-auto py-2.5 px-3 rounded-lg"
                >
                  <Calendar className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">Remove this record on this day</div>
                    <div className="text-xs text-white/90 mt-0.5">
                      Remove this assignment only on {assignment.date ? formatDate(assignment.date, 'dd/mm/yyyy') : 'this day'}
                    </div>
                  </div>
                </Button>
              )}

              {onRemoveWeek && assignment && (
                <Button
                  type="button"
                  onClick={handleRemoveWeekClick}
                  disabled={isDeleting}
                  className="w-full justify-start bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 h-auto py-2.5 px-3 rounded-lg"
                >
                  <CalendarClock className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">Remove this record for the entire week</div>
                    <div className="text-xs text-white/90 mt-0.5">Remove this assignment on all days of the week</div>
                  </div>
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-slate-50 pt-3 px-4 pb-4 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRemoveModal(false)}
              disabled={isDeleting}
              className="border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all duration-200 font-medium"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default EditVehicleModal;


