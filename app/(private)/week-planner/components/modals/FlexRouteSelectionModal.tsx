"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem as SelectDropdownItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Route } from '@/lib/api/routes';
import { fetchRoutes, fetchDepositsWithRoutesFull } from '@/lib/api/routes';
import { removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { fetchAllActiveVendors, type Vendor } from '@/lib/vendors';
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { getWeekDates, isWeekend, formatDate, parseLocalDate } from '../../utils/dateUtils';

const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface FlexRouteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When addOnly is true, selectedDates (YYYY-MM-DD[]) is passed as second argument; each date must be >= current_date + 1 */
  onConfirm: (selectedRoutes: Route[], selectedDates?: string[], editData?: {
    userId?: number;
    vehicleId?: number;
    routeSort?: string;
    notes?: string;
    registrationPlate?: string;
  }) => void;
  loopKey: string;
  depositId?: number;
  /** Routes already open in the depot (pre-selected in manage mode; add mode still allows adding another item). */
  activeRouteIds?: number[];
  /** When true, show a single flex route selection plus vendor/date fields. Includes date picker (min = tomorrow). */
  addOnly?: boolean;
  /** Base date for calculating the default selected date (YYYY-MM-DD). Used in addOnly mode to default to the first editable day of that week. */
  baseDate?: string;
}

const FlexRouteSelectionModal: React.FC<FlexRouteSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loopKey,
  depositId,
  activeRouteIds = [],
  addOnly = false,
  baseDate,
}) => {
  const [allFlexRoutes, setAllFlexRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<number>>(new Set());
  const [selectedSingleId, setSelectedSingleId] = useState<number | ''>('');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectAllWeek, setSelectAllWeek] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [routeSort, setRouteSort] = useState<string>('yes');
  const [notes, setNotes] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const router = useRouter();

  const todayStr = formatDate(new Date(), 'yyyy-mm-dd');

  const weekDateOptions = useMemo(() => {
    const ref = baseDate ? parseLocalDate(baseDate) : new Date();
    const dates = getWeekDates(ref);
    return dates.map((d, index) => {
      const value = formatDate(d, 'yyyy-mm-dd');
      const label = `${DAY_NAMES_SHORT[index]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
      const isPast = value <= todayStr;
      return { value, label, dateObj: d, isPast };
    });
  }, [baseDate, todayStr]);

  const selectableWeekdayValues = useMemo(() => {
    return weekDateOptions
      .filter((d) => !d.isPast && !isWeekend(d.dateObj))
      .map((d) => d.value);
  }, [weekDateOptions]);

  const fetchFlexRoutes = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let flexRoutes: Route[] = [];

      // If depositId is provided, fetch from deposits/with-routes endpoint
      if (depositId) {
        const depositsWithRoutes = await fetchDepositsWithRoutesFull();
        const deposit = depositsWithRoutes.find(d => d.depositId === depositId);
        
        if (deposit) {
          // Filter only flex routes from this deposit
          flexRoutes = deposit.routes
            .filter(route => {
              if (!route.routeId) return false;
              return isFlexRoute(route);
            })
            .map(route => {
              return {
                ...route,
                routeName: route.routeName,
              } as Route;
            });
        } else {
          console.warn(`Deposit with id ${depositId} not found`);
        }
      } else {
        // Fallback to old behavior: fetch all routes and filter by loopKey
        const allRoutes = await fetchRoutes();
        
        // Filter only flex routes
        flexRoutes = allRoutes.filter(route => {
          // Check if route is a flex route
          if (!isFlexRoute(route)) return false;
          
          // Filter by loop key if provided
          if (loopKey) {
            const rName = route.routeName ?? route.routeDefaultName ?? '';
            const routeName = String(rName).toUpperCase();
            const loopPrefix = loopKey.toUpperCase();
            return routeName.startsWith(loopPrefix);
          }
          
          return true;
        });
      }

      setAllFlexRoutes(flexRoutes);
      setFilteredRoutes(flexRoutes);
      
      // Pre-select routes that are already active
      if (activeRouteIds.length > 0) {
        const activeSet = new Set(activeRouteIds);
        setSelectedRouteIds(activeSet);
      }
    } catch (err) {
      console.error('Error fetching flex routes:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch flex routes';
      const lower = String(message).toLowerCase();

      // If token is invalid/expired, force re-login (consistent with rest of the app)
      if (lower.includes('invalid token') || lower.includes('authentication token')) {
        removeToken();
        router.push('/');
        return;
      }

      setError(message);
      setAllFlexRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [depositId, loopKey, activeRouteIds, router]);

  // In add-only mode the user is adding an item/vendor to a flex route, not just opening
  // the route row. Keep already-active routes available so multiple vendors/items can be
  // added to the same flex route.
  const availableRoutes = React.useMemo(() => {
    if (addOnly || activeRouteIds.length === 0) return allFlexRoutes;
    const activeSet = new Set(activeRouteIds);
    return allFlexRoutes.filter(r => {
      const rid = r.routeId;
      return rid != null && !activeSet.has(Number(rid));
    });
  }, [addOnly, activeRouteIds, allFlexRoutes]);

  // Load vendors and vehicles
  const loadEditingData = useCallback(async () => {
    try {
      const [vendorsData, vehiclesData] = await Promise.all([
        fetchAllActiveVendors(),
        fetchVehicles(),
      ]);
      setVendors(vendorsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Error loading editing data:', err);
    }
  }, []);

  // Fetch flex routes from database; reset selection when opening so user must pick (especially when adding 2nd+ flex)
  useEffect(() => {
    if (isOpen) {
      setSelectedSingleId('');
      setSelectedRouteIds(new Set());
      if (addOnly) {
        loadEditingData();
      }
      fetchFlexRoutes();
    } else {
      // Reset state when modal closes
      setSelectedRouteIds(new Set());
      setSelectedSingleId('');
      setSelectedDays(new Set());
      setSelectAllWeek(false);
      setSearchTerm('');
      setError('');
      setSelectedUserId('');
      setSelectedVehicleId('');
      setRouteSort('yes');
      setNotes('');
    }
  }, [isOpen, fetchFlexRoutes, addOnly, loadEditingData, baseDate]);

  // Filter routes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRoutes(allFlexRoutes);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRoutes(
        allFlexRoutes.filter(route => {
          const name = route.routeName ?? '';
          const routeName = String(name).toLowerCase();
          return routeName.includes(term);
        })
      );
    }
  }, [searchTerm, allFlexRoutes]);

  const handleToggleRoute = (routeId: number) => {
    setSelectedRouteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  const handleVendorChange = (value: string) => {
    setSelectedUserId(value);
    setError('');

    // Auto-select vendor's default vehicle
    const selectedVendor = vendors.find((d) => String(d.userId) === value);
    if (selectedVendor) {
      const defaultVehicleId = Number(selectedVendor.vehicleId ?? 0);
      setSelectedVehicleId(
        Number.isFinite(defaultVehicleId) && defaultVehicleId > 0 ? String(defaultVehicleId) : ''
      );
    } else {
      setSelectedVehicleId('');
    }
  };

  const handleConfirm = () => {
    if (addOnly && selectedSingleId !== '') {
      // Validate required fields for addOnly mode
      if (!selectedUserId) {
        setError('Please select a vendor');
        return;
      }
      if (!selectedVehicleId) {
        setError('Please select a vehicle');
        return;
      }
      if (selectedDays.size === 0) {
        setError('Please select at least one day');
        return;
      }

      const routeIdNum = Number(selectedSingleId);
      const route = availableRoutes.find(r => {
        const rid = r.routeId;
        return Number(rid) === routeIdNum;
      });
      if (route) {
        // Find vehicle info to get registration plate
        const vehicleId = Number(selectedVehicleId);
        const selectedVehicle = vehicles.find(v => Number(v.vehicleId || v.id || 0) === vehicleId);
        const registrationPlate = selectedVehicle
          ? String(
              selectedVehicle.vehicleRegistration_plate ??
              selectedVehicle.vehicleDefaultRegistrationPlate ??
              selectedVehicle.registration_plate ??
              selectedVehicle.registrationPlate ??
              selectedVehicle.registration_plates ??
              selectedVehicle.registrationPlates ??
              ''
            )
          : '';

        const editData = {
          userId: Number(selectedUserId),
          vehicleId: vehicleId,
          routeSort: routeSort,
          notes: notes.trim() || undefined,
          registrationPlate: registrationPlate || undefined,
        };
        onConfirm([route], Array.from(selectedDays), editData);
        setSelectedSingleId('');
        setSelectedUserId('');
        setSelectedVehicleId('');
        setRouteSort('yes');
        setNotes('');
        setSelectedDays(new Set());
        setSelectAllWeek(false);
      }
      return;
    }
    const selectedRoutes = allFlexRoutes.filter(route => {
      const rid = route.routeId;
      return rid !== undefined && selectedRouteIds.has(Number(rid));
    });
    onConfirm(selectedRoutes);
    setSelectedRouteIds(new Set());
    setSearchTerm('');
  };

  const handleSelectAll = () => {
    if (selectedRouteIds.size === filteredRoutes.length) {
      // Deselect all
      setSelectedRouteIds(new Set());
    } else {
      // Select all filtered routes (only those with valid routeId)
      const allIds = new Set(filteredRoutes
        .map(r => r.routeId)
        .filter((id): id is number => id !== undefined)
      );
      setSelectedRouteIds(allIds);
    }
  };

  const canConfirmAddOnly = addOnly && selectedSingleId !== '' && selectedDays.size > 0 && selectedUserId !== '' && selectedVehicleId !== '' && !loading;
  const canConfirmManage = !addOnly && selectedRouteIds.size > 0 && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {addOnly ? `Add New Flex Route - ${loopKey.toUpperCase()}` : `Select Flex Routes - ${loopKey.toUpperCase()}`}
          </DialogTitle>
          <DialogDescription>
            {addOnly
              ? 'Choose a flex route, date, and vendor to add an item to the week planner.'
              : 'Choose which flex routes to display for this loop. Routes already active are pre-selected.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Loading flex routes...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Add-only: Date + Route + Driver + Editing fields */}
          {!loading && !error && addOnly && (
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label htmlFor="flex-route-select" className="text-sm font-medium">
                  Flex route *
                </Label>
                <SearchableSelect
                  items={availableRoutes
                    .filter((route) => {
                      const rid = route.routeId;
                      return rid !== undefined && rid > 0;
                    })
                    .map((route) => ({
                      value: String(route.routeId),
                      label: String(route.routeName ?? route.routeDefaultName ?? `Route ${route.routeId}`),
                    }))}
                  value={selectedSingleId === '' ? '' : String(selectedSingleId)}
                  onValueChange={(value) => setSelectedSingleId(value === '' ? '' : Number(value))}
                  placeholder="Select a flex route..."
                  searchPlaceholder="Search flex route..."
                  title="Flex Routes"
                  loading={loading}
                  emptyText="No flex routes available for this depot."
                />
              </div>

              {/* Vendor Selection */}
              <div className="space-y-2">
                <Label htmlFor="flex-vendor-select" className="text-sm font-medium">
                  Vendor *
                </Label>
                <SearchableSelect
                  items={vendors.map(v => ({
                    value: String(v.userId),
                    label: v.fullName || `Vendor ${v.userId}`,
                  }))}
                  value={selectedUserId}
                  onValueChange={handleVendorChange}
                  placeholder="Select a vendor..."
                  searchPlaceholder="Search vendor..."
                  title="Vendors"
                  emptyText="No vendors available"
                />
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="flex-vehicle-select" className="text-sm font-medium">
                  Vehicle *
                </Label>
                <SearchableSelect
                  items={vehicles
                    .map(v => {
                      const vehicleId = String(v.vehicleId || v.id || 0);
                      // Try all possible registration plate field names (same pattern as EditAssignmentModal)
                      const registrationPlate = String(
                        v.vehicleRegistration_plate ??
                        v.vehicleDefaultRegistrationPlate ??
                        v.registration_plate ??
                        v.registrationPlate ??
                        v.registration_plates ??
                        v.registrationPlates ??
                        ''
                      );
                      const model = String(v.model || '');
                      const label = registrationPlate || model || `Vehicle ${vehicleId}`;
                      return {
                        value: vehicleId,
                        label: label,
                      };
                    })
                    .filter(item => item.value !== '0')}
                  value={selectedVehicleId}
                  onValueChange={setSelectedVehicleId}
                  placeholder="Select a vehicle..."
                  searchPlaceholder="Search vehicle..."
                  title="Vehicles"
                  emptyText="No vehicles available"
                />
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label htmlFor="flex-sort-select" className="text-sm font-medium">
                  Sort
                </Label>
                <Select value={routeSort} onValueChange={setRouteSort}>
                  <SelectTrigger id="flex-sort-select">
                    <SelectValue placeholder="Select sort status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectDropdownItem value="yes">Yes</SelectDropdownItem>
                    <SelectDropdownItem value="no">No</SelectDropdownItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Day-of-week selector */}
              <div className="space-y-2">
                <Label className="text-sm">Select Days *</Label>
                <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Today and past days are view-only. Select from tomorrow onwards.
                </p>
                <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                  <Checkbox
                    id="flex-select-all-week"
                    checked={selectAllWeek}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setSelectAllWeek(enabled);
                      if (enabled) {
                        setSelectedDays(new Set(selectableWeekdayValues));
                      }
                    }}
                    disabled={selectableWeekdayValues.length === 0}
                  />
                  <Label htmlFor="flex-select-all-week" className="text-xs font-medium cursor-pointer flex-1">
                    Select all available weekdays (from tomorrow)
                  </Label>
                </div>
                <div className="space-y-1 border-t pt-1">
                  <p className="text-[10px] text-gray-500 mb-0.5">
                    {selectableWeekdayValues.length === 0
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
                      const jsDay = dayDate.getDay();
                      const dayNamesIdx = jsDay === 0 ? 6 : jsDay - 1;
                      const dayName = DAY_NAMES_SHORT[dayNamesIdx];
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
                            id={`flex-day-${opt.value}`}
                            checked={isSelected}
                            onCheckedChange={() => {
                              if (isDisabled) return;
                              if (selectAllWeek) setSelectAllWeek(false);
                              setSelectedDays((prev) => {
                                const next = new Set(prev);
                                if (next.has(opt.value)) next.delete(opt.value);
                                else next.add(opt.value);
                                return next;
                              });
                            }}
                            disabled={isDisabled}
                            className="h-3 w-3"
                          />
                          <Label
                            htmlFor={`flex-day-${opt.value}`}
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="flex-notes-textarea" className="text-sm font-medium">
                  Notes (optional)
                </Label>
                <Textarea
                  id="flex-notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="min-h-[60px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {notes.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Manage mode: Search + Checkbox list */}
          {!loading && !error && !addOnly && (
            <>
              <div className="relative group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors duration-200 group-focus-within/search:text-sky-500" />
                <Input
                  type="text"
                  placeholder="Search flex routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 bg-white/50 backdrop-blur-md border-slate-200 rounded-xl transition-all duration-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'} found
                </Label>
                {filteredRoutes.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedRouteIds.size === filteredRoutes.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border rounded-md p-4 space-y-2">
                {filteredRoutes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No flex routes found for {loopKey.toUpperCase()}</p>
                    {searchTerm && (
                      <p className="text-sm mt-2">Try a different search term</p>
                    )}
                  </div>
                ) : (
                  filteredRoutes
                    .filter(route => route.routeId !== undefined)
                    .map((route) => {
                      const routeId = route.routeId!;
                      const isSelected = selectedRouteIds.has(Number(routeId));
                      const isActive = activeRouteIds.includes(Number(routeId));
                      
                      return (
                        <div
                          key={String(routeId)}
                          className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 ${
                            isActive ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <Checkbox
                            id={`route-${String(routeId)}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked !== undefined) {
                                handleToggleRoute(Number(routeId));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`route-${String(routeId)}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{route.routeName}</span>
                              {isActive && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">ID: {String(routeId)}</span>
                          </Label>
                        </div>
                      );
                    })
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (addOnly ? !canConfirmAddOnly : !canConfirmManage)}
          >
            {addOnly
              ? 'Add'
              : `Apply (${selectedRouteIds.size} ${selectedRouteIds.size === 1 ? 'route' : 'routes'})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlexRouteSelectionModal;


