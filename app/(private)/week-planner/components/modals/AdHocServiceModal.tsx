"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect, type SelectItem as SearchableSelectItem } from '@/components/ui/searchable-select';
import { Loader2 } from 'lucide-react';
import type { Vendor } from '@/lib/vendors';
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { Checkbox } from '@/components/ui/checkbox';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { formatDate, getWeekDates, isWeekend } from '../../utils/dateUtils';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import { fetchAllWeekPlannersForDate } from '../../services/apiService';

export interface AdHocServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (service: {
    name: string;
    type: string;
    depot: string;
    notes?: string;
    routeId?: number;
    userId: number;
    date: string;
    adhocServiceId?: number;
    adhocSort?: number;
    vehicleId?: number;
    depositId?: number;
    depositName?: string;
    dates?: string[];
  }) => void;
  depotKey: string;
  depotName: string;
  depositId?: number | null;
  serviceTypes?: Array<{ value: string; label: string }>;
  vendors?: Vendor[];
  date?: Date | string;
  /** When true (e.g. opened from "Add ADHOC Service" button), only show Add/Create. Update is only when opened from clicking an existing item in the table. */
  addOnly?: boolean;
  /** Quando true, esconde o campo Adhoc Sort (para `SUPERVISOR`) */
  hideAdhocSort?: boolean;
}

const AdHocServiceModal: React.FC<AdHocServiceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  depotKey,
  depotName,
  depositId,
  serviceTypes: _serviceTypes = [],
  vendors = [],
  date,
  addOnly = true,
  hideAdhocSort = false,
}) => {
  const [availableServices, setAvailableServices] = useState<AdhocServiceDTO[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [vehicleFieldError, setVehicleFieldError] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [vendorsFromWeekPlanners, setVendorsFromWeekPlanners] = useState<{ userId: number; fullName: string }[]>([]);
  const [weekPlannersForWeek, setWeekPlannersForWeek] = useState<{ date?: string; raw?: Record<string, unknown> }[]>([]);
  const [selectedDateInModal, setSelectedDateInModal] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectAllWeek, setSelectAllWeek] = useState(false);

  const todayStr = formatDate(new Date(), 'yyyy-mm-dd');
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDate(d, 'yyyy-mm-dd');
  })();
  const dateStr = date
    ? (typeof date === 'string' ? (date.includes('T') ? date.split('T')[0] : date) : formatDate(date, 'yyyy-mm-dd'))
    : todayStr;
  const isToday = (d: string) => d === todayStr;
  const getNextDay = (d: string) => {
    const [y, m, day] = d.split('-').map(Number);
    const next = new Date(y, m - 1, day + 1);
    return formatDate(next, 'yyyy-mm-dd');
  };
  const weekDatesArr = useMemo(() => getWeekDates(dateStr).map((d) => formatDate(d, 'yyyy-mm-dd')), [dateStr]);
  // Add ADHOC: only allow from tomorrow onwards; initial date = tomorrow (or first valid day in week)
  const initialDateStr = addOnly
    ? (weekDatesArr.find((d) => d >= tomorrowStr) ?? tomorrowStr)
    : isToday(dateStr)
      ? (weekDatesArr.includes(getNextDay(dateStr)) ? getNextDay(dateStr) : dateStr)
      : dateStr;

  // Week-planners for the selected date only (for pre-fill)
  const weekPlannersForDate = useMemo(() => {
    const effectiveDate = selectedDateInModal || dateStr;
    return weekPlannersForWeek.filter((wp) => {
      const d = (wp.raw ?? {}).date ?? wp.date;
      const norm = typeof d === 'string' ? d.split('T')[0] : '';
      return norm === effectiveDate;
    });
  }, [weekPlannersForWeek, selectedDateInModal, dateStr]);

  // Dates of the current week for the date select (Mon–Sun).
  // All 7 days are always shown; past days and today are flagged as `isPast` (disabled, greyed out).
  const weekDateOptions = useMemo(() => {
    const dates = getWeekDates(dateStr);
    const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return dates.map((d, index) => {
      const value = formatDate(d, 'yyyy-mm-dd');
      const label = `${dayNamesShort[index]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
      const isPast = addOnly ? value <= todayStr : false;
      return { value, label, dateObj: d, isPast };
    });
  }, [dateStr, addOnly, todayStr]);

  // For "Select all available days" in add-only mode: select only weekdays from tomorrow onwards.
  const selectableWeekdayValues = useMemo(() => {
    return weekDateOptions
      .filter((d) => !d.isPast && !isWeekend(d.dateObj))
      .map((d) => d.value);
  }, [weekDateOptions]);

  // When vendor has at least one week-planner in the week, show date select
  const vendorHasWeekPlannerInWeek = useMemo(() => {
    if (!selectedUserId || weekPlannersForWeek.length === 0) return false;
    const userIdNum = Number(selectedUserId);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) return false;
    return weekPlannersForWeek.some((w) => Number((w.raw ?? {}).userId ?? (w.raw ?? {}).userId ?? 0) === userIdNum);
  }, [selectedUserId, weekPlannersForWeek]);

  // Merge vendors prop with vendors from week planners for this deposit+date (same as daily-game-plan vendorVendorsAdhoc)
  const vendorVendors = useMemo(() => {
    const byId = new Map<number, Vendor & { userId: number; fullName: string }>();
    vendors.forEach((d) => {
      if (d.userId) byId.set(d.userId, { ...d, userId: d.userId, fullName: d.fullName ?? '' });
    });
    vendorsFromWeekPlanners.forEach((d) => {
      if (d.userId && !byId.has(d.userId)) {
        byId.set(d.userId, { userId: d.userId, fullName: d.fullName || '' } as unknown as Vendor & { userId: number; fullName: string });
      }
    });
    return Array.from(byId.values()).sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
  }, [vendors, vendorsFromWeekPlanners]);

  const vendorItems = useMemo<SearchableSelectItem[]>(() => {
    return vendorVendors.map((v) => ({
      value: String(v.userId),
      label: v.fullName || `Vendor ${v.userId}`,
    }));
  }, [vendorVendors]);

  const serviceItems = useMemo<SearchableSelectItem[]>(() => {
    return availableServices
      .filter((s) => Number.isFinite(Number(s.adhocServiceId)) && s.adhocServiceId > 0)
      .map((s) => ({
        value: String(s.adhocServiceId),
        label: s.adhocName || `Adhoc Service ${s.adhocServiceId}`,
      }));
  }, [availableServices]);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return availableServices.find((s) => String(s.adhocServiceId) === selectedServiceId) ?? null;
  }, [availableServices, selectedServiceId]);

  const requiresVehicleSelection = selectedService?.isAdhocSort === false;

  const vehicleItems = useMemo<SearchableSelectItem[]>(() => {
    return availableVehicles.flatMap<SearchableSelectItem>((vehicle) => {
        const raw = vehicle as unknown as Record<string, unknown>;
        const id = Number(raw.vehicleId ?? raw.vehicle_id ?? raw.id ?? 0);
        if (!Number.isFinite(id) || id <= 0) return [];
        const plate = String(
          raw.registrationPlates ??
          raw.registration_plates ??
          raw.vehicleRegistrationPlate ??
          raw.vehicleRegistration_plate ??
          raw.vehicleDefaultRegistrationPlate ??
          raw.vehicle_default_registrationPlate ??
          raw.registrationPlate ??
          raw.registration_plate ??
          ''
        ).trim();
        const model = String(raw.vehicleModel ?? raw.model ?? raw.manufacturer ?? '').trim();
        return [{
          value: String(id),
          label: plate || model || `Vehicle ${id}`,
          secondaryLabel: plate && model ? model : undefined,
        }];
      });
  }, [availableVehicles]);

  // True when the selected vendor already has a week-planner for the selected date (update instead of create). When addOnly (e.g. from "Add ADHOC" button), never show update.
  const isUpdateMode = useMemo(() => {
    if (addOnly) return false;
    if (!selectedUserId || weekPlannersForDate.length === 0) return false;
    const userIdNum = Number(selectedUserId);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) return false;
    return weekPlannersForDate.some((w) => Number((w.raw ?? {}).userId ?? (w.raw ?? {}).userId ?? 0) === userIdNum);
  }, [addOnly, selectedUserId, weekPlannersForDate]);

  // Adhoc Sort (read-only): from selected adhoc service's adhocVendorPayment
  const adhocSortDisplay = useMemo(() => {
    if (!selectedServiceId) return '';
    const service = availableServices.find((s) => String(s.adhocServiceId) === selectedServiceId);
    const val = service?.adhocVendorPayment;
    return val !== undefined && val !== null ? String(Number(val)) : '';
  }, [selectedServiceId, availableServices]);

  // Fetch adhoc services and week planners when modal opens (same as daily-game-plan)
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setSelectedServiceId('');
      setSelectedVehicleId('');
      setSelectedDateInModal('');
      setNotes('');
      setSelectedDays(new Set());
      setSelectAllWeek(false);
      setError('');
      setVehicleFieldError('');
      setVendorsFromWeekPlanners([]);
      setWeekPlannersForWeek([]);
      return;
    }
    setSelectedDateInModal(initialDateStr);
    setSelectedDays(new Set([initialDateStr]));
    setSelectAllWeek(false);
    let cancelled = false;
    setLoading(true);
    setError('');

    const load = async () => {
      try {
        const [adhocServices, vehicles, weekPlanners] = await Promise.all([
          fetchAdhocServices(),
          fetchVehicles().catch(() => []),
          depositId && dateStr
            ? fetchAllWeekPlannersForDate(dateStr, depositId ?? null)
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setAvailableServices(adhocServices);
        setAvailableVehicles(vehicles);
        const list = (weekPlanners as { date?: string; raw?: Record<string, unknown> }[]) ?? [];
        setWeekPlannersForWeek(list);
        const seen = new Set<number>();
        const extracted: { userId: number; fullName: string }[] = [];
        list.forEach((wp) => {
          const raw = wp.raw ?? {};
          const userId = Number(raw.userId ?? raw.userId ?? 0);
          // New DTO has no fullName in raw; use the normalised name field on the record instead
          const fullName = String((wp as Record<string, unknown>).name ?? raw.fullName ?? raw.fullName ?? '').trim();
          if (userId && !seen.has(userId)) {
            seen.add(userId);
            extracted.push({ userId: userId, fullName: fullName || 'Unknown' });
          }
        });
        setVendorsFromWeekPlanners(extracted);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading adhoc modal data:', err);
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, depositId, dateStr, initialDateStr]);

  // When user selects a vendor in UPDATE mode (addOnly=false), pre-fill the adhoc service from the existing week-planner.
  // In ADD mode (addOnly=true), we always start with a blank service field so the user picks a NEW service
  // without being influenced by whatever the vendor already has — which was causing a PATCH instead of POST.
  useEffect(() => {
    if (!selectedUserId || availableServices.length === 0) return;
    // In addOnly mode, never auto-fill the service — the user must explicitly choose one.
    if (addOnly) {
      setSelectedServiceId('');
      setSelectedVehicleId('');
      return;
    }
    const userIdNum = Number(selectedUserId);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) return;
    const wp = weekPlannersForDate.find((w) => {
      const raw = w.raw ?? {};
      return Number(raw.userId ?? raw.userId ?? 0) === userIdNum;
    });
    if (!wp?.raw) {
      setSelectedServiceId('');
      return;
    }
    const raw = wp.raw as Record<string, unknown>;
    const adhocSortRaw = raw.adhocSort;
    const adhocServiceObj = raw.adhocService && typeof raw.adhocService === 'object' ? (raw.adhocService as Record<string, unknown>) : null;
    const adhocServiceIdRaw = raw.adhocServiceId ?? adhocServiceObj?.adhocServiceId;
    const adhocSortNum = adhocSortRaw != null ? Number(adhocSortRaw) : NaN;
    const adhocServiceIdNum = adhocServiceIdRaw != null ? Number(adhocServiceIdRaw) : NaN;
    const vehicleIdRaw = Number(raw.vehicleId ?? 0);
    if (Number.isFinite(adhocServiceIdNum) && adhocServiceIdNum > 0) {
      const exists = availableServices.some((s) => s.adhocServiceId === adhocServiceIdNum);
      if (exists) {
        setSelectedServiceId(String(adhocServiceIdNum));
        setSelectedVehicleId(Number.isFinite(vehicleIdRaw) && vehicleIdRaw > 0 ? String(vehicleIdRaw) : '');
        return;
      }
    }
    if (Number.isFinite(adhocSortNum) && adhocSortNum > 0) {
      const match = availableServices.find(
        (s) => s.adhocVendorPayment != null && Number(s.adhocVendorPayment) === adhocSortNum
      );
      if (match) {
        setSelectedServiceId(String(match.adhocServiceId));
        setSelectedVehicleId(Number.isFinite(vehicleIdRaw) && vehicleIdRaw > 0 ? String(vehicleIdRaw) : '');
      }
    }
  }, [selectedUserId, availableServices, weekPlannersForDate, addOnly]);

  useEffect(() => {
    if (!requiresVehicleSelection) {
      setSelectedVehicleId('');
    }
  }, [requiresVehicleSelection]);

  const handleConfirm = () => {
    setVehicleFieldError('');

    if (!selectedUserId) {
      setError('Please select a vendor.');
      return;
    }
    if (!selectedServiceId) {
      setError('Please select an adhoc service.');
      return;
    }

    const getServiceId = (s: AdhocServiceDTO | Record<string, unknown>) => {
      const r = s as Record<string, unknown>;
      const id = r.adhocServiceId ?? r.adhocServiceId ?? r.id;
      return id != null && Number.isFinite(Number(id)) ? Number(id) : 0;
    };
    const selectedServiceIdNum = Number(selectedServiceId);
    const selectedService = availableServices.find((s) => getServiceId(s) === selectedServiceIdNum);
    if (!selectedService) {
      setError('Selected service not found.');
      return;
    }
    if (selectedService.isAdhocSort === false && (!selectedVehicleId || Number(selectedVehicleId) <= 0)) {
      setError('');
      setVehicleFieldError('Please select a vehicle.');
      return;
    }

    const userId = Number(selectedUserId);
    if (!userId || !Number.isFinite(userId) || userId <= 0) {
      setError('Invalid vendor selected.');
      return;
    }

    const serviceRaw = selectedService as unknown as Record<string, unknown>;
    const adhocSort = Number(serviceRaw.adhocVendorPayment ?? serviceRaw.adhocVendorPayment ?? 0) || 0;
    const serviceDepositId = (serviceRaw.depositId ?? serviceRaw.depositId ?? depositId) as number | undefined;
    const serviceDepositName = (serviceRaw.depositName ?? serviceRaw.depositName ?? depotName) as string | undefined;
    const routeId = BUSINESS_RULES.ROUTE.DHOC; // DHOC — rota padrão para todos os itens Adhoc

    const effectiveDate = selectedDateInModal || dateStr;
    const dates = selectAllWeek 
      ? [...selectableWeekdayValues].sort()
      : (selectedDays.size > 0 ? Array.from(selectedDays).sort() : [effectiveDate]);

    const futureDates = dates.filter((d) => d >= tomorrowStr);
    if (addOnly && futureDates.length === 0) {
      setError('Select at least one date from tomorrow onwards.');
      return;
    }

    const confirmPayload = {
      name: String(serviceRaw.adhocName ?? `Service ${getServiceId(selectedService)}`),
      type: String(serviceRaw.adhocName ?? selectedServiceId),
      depot: depotKey,
      notes: notes.trim() || undefined,
      routeId,
      userId: userId,
      date: addOnly ? (futureDates[0]!) : effectiveDate,
      adhocServiceId: getServiceId(selectedService),
      adhocSort,
      vehicleId: selectedService.isAdhocSort === false ? Number(selectedVehicleId) : undefined,
      depositId: serviceDepositId,
      depositName: serviceDepositName,
      dates: addOnly ? futureDates : dates,
    };

    onConfirm(confirmPayload);

    setSelectedUserId('');
    setSelectedServiceId('');
    setSelectedVehicleId('');
    setSelectedDays(new Set());
    setSelectAllWeek(false);
    setNotes('');
    setError('');
    setVehicleFieldError('');
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedServiceId('');
    setSelectedVehicleId('');
    setSelectedDateInModal('');
    setSelectedDays(new Set());
    setSelectAllWeek(false);
    setNotes('');
    setError('');
    setVehicleFieldError('');
    onClose();
  };

  const handleDayToggle = (day: string) => {
    // Never allow toggling past days or today in addOnly mode
    if (addOnly && day <= todayStr) return;
    if (selectAllWeek) setSelectAllWeek(false);
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleSelectAllWeek = (checked: boolean | 'indeterminate') => {
    const enabled = checked === true;
    setSelectAllWeek(enabled);
    if (enabled) {
      // Only select future weekdays (Mon–Fri), excluding weekends.
      const selectableDays = selectableWeekdayValues;
      setSelectedDays(new Set(selectableDays));
    }
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // weekDateOptions always has 7 entries (Mon–Sun), so index 0 = Mon and index 6 = Sun.
  const weekStart = weekDateOptions[0]?.dateObj ? formatDate(weekDateOptions[0].dateObj, 'dd/mm/yyyy') : '';
  const weekEnd = weekDateOptions[weekDateOptions.length - 1]?.dateObj
    ? formatDate(weekDateOptions[weekDateOptions.length - 1].dateObj, 'dd/mm/yyyy')
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-3">
          <DialogTitle className="text-base">{isUpdateMode ? 'Update' : 'Add'} ADHOC Service - {depotName}</DialogTitle>
          <DialogDescription className="text-xs">
            {isUpdateMode
              ? 'Update the existing ad-hoc service for this vendor.'
              : 'Create a new ad-hoc service for this depot.'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-2">
        <div className="space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
              <span className="text-xs text-gray-600">Loading...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {!loading && (
            <>
              {/* 1. Vendor (Vendor) - same label as daily-game-plan */}
              <div className="space-y-1">
                <Label htmlFor="vendor-select" className="text-xs">Vendor *</Label>
                <SearchableSelect
                  items={vendorItems}
                  value={selectedUserId}
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    if (!value) setSelectedServiceId('');
                    setError('');
                  }}
                  loading={loading}
                  placeholder="Select a vendor"
                  searchPlaceholder="Search vendor..."
                  title="Vendors"
                />
                {vendorVendors.length === 0 && !loading && (
                  <p className="text-xs text-gray-500 mt-1">No vendors available for this deposit.</p>
                )}
              </div>

              {/* 1b. Date select - when vendor already has a week-planner in the week, choose which date (weekPlannerId) to update.
                  For "Add ADHOC Service" flow (addOnly=true, e.g. LCY button), this select should not appear. */}
              {!addOnly && vendorHasWeekPlannerInWeek && (
                <div className="space-y-1">
                  <Label htmlFor="date-select" className="text-xs">Date</Label>
                  <Select
                    value={selectedDateInModal || dateStr}
                    onValueChange={(value) => {
                      setSelectedDateInModal(value);
                      setError('');
                    }}
                  >
                    <SelectTrigger id="date-select">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDateOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 2. Adhoc Service - enabled only when vendor selected (same as daily-game-plan) */}
              <div className="space-y-1">
                <Label htmlFor="service-select" className="text-xs">Adhoc Service *</Label>
                <SearchableSelect
                  items={serviceItems}
                  value={selectedServiceId}
                  onValueChange={(value) => {
                    setSelectedServiceId(value);
                    setSelectedVehicleId('');
                    setError('');
                  }}
                  loading={loading}
                  disabled={!selectedUserId}
                  placeholder={!selectedUserId ? "Select a vendor first" : "Select an adhoc service"}
                  searchPlaceholder="Search service..."
                  title="ADHOC Services"
                />
                {availableServices.length === 0 && selectedUserId && !loading && (
                  <p className="text-xs text-gray-500 mt-1">No ADHOC services available for this deposit.</p>
                )}
              </div>

              {requiresVehicleSelection && (
                <div className="space-y-1">
                  <Label htmlFor="vehicle-select" className="text-xs">Vehicle *</Label>
                  <SearchableSelect
                    items={vehicleItems}
                    value={selectedVehicleId}
                    onValueChange={(value) => {
                      setSelectedVehicleId(value);
                      setVehicleFieldError('');
                      setError('');
                    }}
                    loading={loading}
                    placeholder="Select a vehicle"
                    searchPlaceholder="Search vehicle..."
                    title="Vehicles"
                    emptyText="No vehicles available"
                    error={vehicleFieldError || undefined}
                  />
                  {vehicleFieldError && (
                    <p className="text-[11px] text-red-600">{vehicleFieldError}</p>
                  )}
                </div>
              )}

              {/* 3. Adhoc Sort - read-only, from selected service (hidden for `SUPERVISOR`) */}
              {!hideAdhocSort && (
                <div className="space-y-2">
                  <Label htmlFor="adhoc-sort">Adhoc Sort</Label>
                  <input
                    type="text"
                    id="adhoc-sort"
                    value={adhocSortDisplay}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600 text-sm"
                  />
                </div>
              )}

              {/* 4. Notes */}
              <div className="space-y-2">
                <Label htmlFor="service-notes">Notes (Optional)</Label>
                <Textarea
                  id="service-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="resize-none bg-[#fffef0] border-[#f5e6a3] focus:border-[#e8d48f] focus:ring-[#f5e6a3]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Select Days *</Label>
                {addOnly && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    Today and past days are view-only. Select from tomorrow onwards.
                  </p>
                )}
                <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                  <Checkbox
                    id="select-all-week-adhoc"
                    checked={selectAllWeek}
                    onCheckedChange={handleSelectAllWeek}
                    disabled={addOnly && selectableWeekdayValues.length === 0}
                  />
                  <Label htmlFor="select-all-week-adhoc" className="text-xs font-medium cursor-pointer flex-1">
                    {addOnly ? `Select all available weekdays (from tomorrow)` : `Full Week (${weekStart} to ${weekEnd})`}
                  </Label>
                </div>
                <div className="space-y-1 border-t pt-1">
                  <p className="text-[10px] text-gray-500 mb-0.5">
                    {addOnly && selectableWeekdayValues.length === 0
                      ? 'No weekdays available from tomorrow in this week.'
                      : 'Or select specific days:'}
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {weekDateOptions.map((opt) => {
                      const dayDate = opt.dateObj;
                      const isWeekendDay = isWeekend(dayDate);
                      const isSelected = selectedDays.has(opt.value);
                      const isDisabled = opt.isPast;
                      const dayDisplay = formatDate(dayDate, 'dd/mm');
                      // Derive day name from the actual date object.
                      // JS getDay(): 0=Sun,1=Mon,...,6=Sat → map to Mon=0,...,Sun=6
                      const jsDay = dayDate.getDay();
                      const dayNamesIdx = jsDay === 0 ? 6 : jsDay - 1;
                      const dayName = dayNames[dayNamesIdx].substring(0, 3);

                      return (
                        <div
                          key={opt.value}
                          className={`flex items-center space-x-1 p-1 rounded border transition-colors ${
                            opt.isPast
                              ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-sky-50 border-sky-300'
                              : isWeekendDay
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <Checkbox
                            id={`adhoc-day-${opt.value}`}
                            checked={isSelected}
                            onCheckedChange={() => handleDayToggle(opt.value)}
                            disabled={isDisabled}
                            className="h-3 w-3"
                          />
                          <Label
                            htmlFor={`adhoc-day-${opt.value}`}
                            className={`text-[10px] flex-1 ${
                              opt.isPast
                                ? 'cursor-not-allowed text-slate-400'
                                : isWeekendDay
                                ? 'cursor-pointer text-amber-700'
                                : 'cursor-pointer text-slate-700'
                            }`}
                          >
                            <span className="font-medium">{dayName}</span> {dayDisplay}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedDays.size > 0 && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {selectedDays.size} {selectedDays.size === 1 ? 'day' : 'days'} selected
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-slate-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              loading ||
              !selectedUserId ||
              !selectedServiceId ||
              vendorVendors.length === 0 ||
              availableServices.length === 0 ||
              (requiresVehicleSelection && (!selectedVehicleId || Number(selectedVehicleId) <= 0)) ||
              (addOnly && selectableWeekdayValues.length === 0)
            }
          >
            {loading ? 'Loading...' : isUpdateMode ? 'Update Service' : 'Create Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdHocServiceModal;




