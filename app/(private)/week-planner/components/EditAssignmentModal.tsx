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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect, type SelectItem as SearchableSelectItem } from "@/components/ui/searchable-select";
import { fetchDepositsWithRoutesFull, type DepositWithRoutesFullDTO } from '@/lib/api/routes';
import { fetchVehicles, type Vehicle } from '@/lib/vehicles';
import { fetchVendors, fetchVendorsByDeposit, Vendor } from '@/lib/vendors';
import { fetchAdhocServices, type AdhocServiceDTO } from '@/lib/adhoc-services-api';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { CalendarDays, Trash2, Calendar, CalendarClock } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';
import { normalizeVendorsToVendors } from '../utils/vendorUtils';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type EditAssignmentModalProps = {
  open: boolean;
  onClose: () => void;
  assignment: WeekPlannerRecord | null;
  readOnly?: boolean;
  /**
   * Quando true, os botões de operação semanal (Assign Week / Remove Week) são exibidos
   * mesmo que readOnly seja true. Útil quando a data da célula é hoje: o dia atual é
   * somente-leitura para edições individuais, mas operações semanais ainda devem ser
   * permitidas (elas filtram internamente para amanhã em diante).
   */
  allowWeekOps?: boolean;
  /** Quando true, esconde os campos de ADHOC (para `VENDOR`) */
  hideAdhocFields?: boolean;
  /** Quando true, esconde o campo Adhoc Sort (para `SUPERVISOR`) */
  hideAdhocSort?: boolean;
  onSave: (
    weekPlannerId: number,
    userId: number,
    vehicleId: number,
    costModelId: number,
    routeSort?: string,
    notes?: string,
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
  /** All assignments for the current week/context; used to pre-fill sort and adhoc service when user selects a vendor who already has a week-planner for the same date */
  allAssignments?: WeekPlannerRecord[];
  /** Vendors from GET /bff/vendor; when provided and assignment is a flex draft, vendor select is populated from this instead of GET /bff/vendors */
  vendors?: Record<string, unknown>[] | null;
};

/** Resolve vehicle ID from API response (snake_case or camelCase) */
const getVehicleId = (v: Vehicle | Record<string, unknown>): number => {
  const r = v as Record<string, unknown>;
  const id = r.vehicleId ?? r.vehicleId ?? r.id;
  return id != null && Number.isFinite(Number(id)) ? Number(id) : 0;
};

/** Resolve vendor ID from API response (userId only - pure transformation) */
const getVendorId = (d: Vendor | Record<string, unknown>): number => {
  const r = d as Record<string, unknown>;
  const id = r.userId ?? r.id;
  return id != null && Number.isFinite(Number(id)) ? Number(id) : 0;
};

// vendorsToVendors removido — substituído por normalizeVendorsToVendors (vendorUtils.ts)

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  open,
  onClose,
  assignment,
  readOnly = false,
  allowWeekOps = false,
  hideAdhocFields = false,
  hideAdhocSort = false,
  onSave,
  showWeekends = true,
  onAssignWeek,
  onRemoveDay,
  onRemoveWeek,
  allAssignments = [],
  vendors: providedVendors,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [routeSort, setRouteSort] = useState<string>('yes');
  const [notes, setNotes] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adhocServices, setAdhocServices] = useState<AdhocServiceDTO[]>([]);
  const [, setDeposits] = useState<DepositWithRoutesFullDTO[]>([]);
  const [selectedAdhocServiceId, setSelectedAdhocServiceId] = useState<string>('');
  const [routeDepositId, setRouteDepositId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigningWeek, setIsAssigningWeek] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [vehicleFieldError, setVehicleFieldError] = useState<string>('');
  const interactionDisabled = readOnly || isLoading || isSaving || isDeleting;

  // Use ref to track if we've already initialized for this assignment (number for saved, string for draft key)
  const initializedAssignmentId = useRef<number | string | null>(null);
  const isInitializing = useRef(false);
  const lastAssignmentRef = useRef<WeekPlannerRecord | null>(null);

  // Memoize assignment ID to avoid unnecessary re-initializations
  // For drafts (weekPlannerId=0), use __draft_key to distinguish different flex/adhoc drafts
  const assignmentRawForId = assignment?.raw as Record<string, unknown> | undefined;
  const assignmentDraftKeyCamel = assignmentRawForId?.__draftKey;
  const assignmentDraftKeySnake = assignmentRawForId?.__draft_key;
  const assignmentId = useMemo((): number | string | null => {
    const draftKey =
      typeof assignmentDraftKeyCamel === 'string'
        ? assignmentDraftKeyCamel
        : (typeof assignmentDraftKeySnake === 'string' ? assignmentDraftKeySnake : null);
    if (draftKey) return draftKey;
    return assignment?.weekPlannerId ?? null;
  }, [assignment?.weekPlannerId, assignmentDraftKeyCamel, assignmentDraftKeySnake]);

  // Check if assignment actually changed
  const assignmentChanged = useMemo(() => {
    if (!assignment || !lastAssignmentRef.current) return true;
    const raw = assignment.raw as Record<string, unknown> | undefined;
    const lastRaw = lastAssignmentRef.current?.raw as Record<string, unknown> | undefined;
    const draftKey =
      typeof raw?.__draftKey === 'string'
        ? raw.__draftKey
        : (typeof raw?.__draft_key === 'string' ? raw.__draft_key : null);
    const lastDraftKey =
      typeof lastRaw?.__draftKey === 'string'
        ? lastRaw.__draftKey
        : (typeof lastRaw?.__draft_key === 'string' ? lastRaw.__draft_key : null);
    if (draftKey || lastDraftKey) return draftKey !== lastDraftKey;
    return assignment.weekPlannerId !== lastAssignmentRef.current.weekPlannerId;
  }, [assignment]);

  // Load data without client-side cache.
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vendorsResult, vehiclesResult, adhocServicesResult, depositsResult] = await Promise.allSettled([
        fetchVendors(),
        fetchVehicles(),
        fetchAdhocServices(),
        fetchDepositsWithRoutesFull({ onlyNonFlex: true }),
      ]);

      const vendorsData = vendorsResult.status === 'fulfilled' ? vendorsResult.value : [];
      const vehiclesData = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : [];
      const adhocServicesData = adhocServicesResult.status === 'fulfilled' ? adhocServicesResult.value : [];
      const depositsDataRaw = depositsResult.status === 'fulfilled' ? depositsResult.value : [];
      const depositsData = filterAllowedDeposits(depositsDataRaw);

      setVendors(vendorsData);
      setVehicles(vehiclesData);
      setAdhocServices(adhocServicesData);
      setDeposits(depositsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize form when modal opens
  useEffect(() => {
    if (!open) {
      setShowRemoveModal(false);
      initializedAssignmentId.current = null;
      lastAssignmentRef.current = null;
      // Reset form state when modal closes
      setSelectedUserId('');
      setSelectedVehicleId('');
      setSelectedAdhocServiceId('');
      setRouteSort('yes');
      setNotes('');
      setRouteDepositId(null);
      setError('');
      setVehicleFieldError('');
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
      setError('');

      try {
        let vendorsData: Vendor[] = [];
        let vehiclesData: Vehicle[] = [];
        let adhocServicesData: AdhocServiceDTO[] = [];
        let depositsData: DepositWithRoutesFullDTO[] = [];

        setIsLoading(true);
        const [vendorsResult, vehiclesResult, adhocServicesResult, depositsResult] = await Promise.allSettled([
          fetchVendors(),
          fetchVehicles(),
          fetchAdhocServices(),
          fetchDepositsWithRoutesFull({ onlyNonFlex: true }),
        ]);

        vendorsData = vendorsResult.status === 'fulfilled' ? vendorsResult.value : [];
        vehiclesData = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : [];
        adhocServicesData = adhocServicesResult.status === 'fulfilled' ? adhocServicesResult.value : [];
        const depositsDataRaw = depositsResult.status === 'fulfilled' ? depositsResult.value : [];
        depositsData = filterAllowedDeposits(depositsDataRaw);

        setIsLoading(false);

        // Update state in both cases (cache or fresh load)
        setVendors(vendorsData);
        setVehicles(vehiclesData);
        setAdhocServices(adhocServicesData);
        setDeposits(depositsData);

        const raw = assignment.raw as Record<string, unknown>;

        // Extract user ID - pure userId transformation (backend unified)
        let userIdCandidate: number | string | null = null;

        // Try raw.userId first
        if (raw.userId !== null && raw.userId !== undefined) {
          const rawUserId = raw.userId;
          if (typeof rawUserId === 'number' || typeof rawUserId === 'string') {
            userIdCandidate = rawUserId;
          }
        }

        // Try nested vendor object
        if (!userIdCandidate && raw.vendor && typeof raw.vendor === 'object') {
          const vendorObj = raw.vendor as Record<string, unknown>;
          const userIdFromObj = vendorObj.userId ?? vendorObj.id;
          if (userIdFromObj !== null && userIdFromObj !== undefined) {
            if (typeof userIdFromObj === 'number' || typeof userIdFromObj === 'string') {
              userIdCandidate = userIdFromObj;
            }
          }
        }

        // Try assignment properties directly
        if (!userIdCandidate) {
          const assignmentRecord = assignment as Record<string, unknown>;
          const assignmentUserId = assignmentRecord.userId;
          if (assignmentUserId !== null && assignmentUserId !== undefined) {
            if (typeof assignmentUserId === 'number' || typeof assignmentUserId === 'string') {
              userIdCandidate = assignmentUserId;
            }
          }
        }

        // If userId still not found, try to find by name using the freshly loaded vendors
        if (!userIdCandidate && assignment.name && vendorsData.length > 0) {
          const foundVendor = vendorsData.find(d => {
            const vendorName = d.fullName || '';
            const assignmentName = assignment.name || '';
            return vendorName === assignmentName ||
              vendorName.toLowerCase() === assignmentName.toLowerCase() ||
              vendorName.toLowerCase().trim() === assignmentName.toLowerCase().trim();
          });
          userIdCandidate = foundVendor?.userId ?? null;
        }

        // Normalize to number and resolve to userId for Select (vendors list uses userId as value)
        let userId: number | null = userIdCandidate !== null && userIdCandidate !== undefined
          ? Number(userIdCandidate)
          : null;

        // Resolve: if userId doesn't match any vendor, try match by userId
        if (userId && Number.isFinite(userId) && userId > 0 && vendorsData.length > 0) {
          const matchedVendor = vendorsData.find((d) => getVendorId(d) === userId || d.userId === userId);
          if (matchedVendor) {
            userId = getVendorId(matchedVendor) || matchedVendor.userId; // Use same ID as SelectItem value
          }
        }

        // Extract vehicle ID (snake_case or camelCase)
        const vehicleId = raw.vehicleId ?? (raw as Record<string, unknown>).vehicleId ??
          (raw.vehicle && typeof raw.vehicle === 'object'
            ? ((raw.vehicle as Record<string, unknown>).vehicleId ?? (raw.vehicle as Record<string, unknown>).vehicleId)
            : null);

        // Determine depositId - try multiple sources including looking up from route
        let depositFromRaw = raw.depositId ?? (raw as Record<string, unknown>).depositId ?? (raw.route && typeof raw.route === "object" ? (raw.route as Record<string, unknown>).depositId : undefined);

        // If depositId not found directly, try to find it from the routeId using deposits data
        if (depositFromRaw === null || depositFromRaw === undefined) {
          const routeId = raw.routeId ?? (raw.route && typeof raw.route === 'object' ? (raw.route as Record<string, unknown>).routeId : null);
          if (routeId != null && Number.isFinite(Number(routeId)) && depositsData.length > 0) {
            const routeIdNum = Number(routeId);
            for (const deposit of depositsData) {
              const foundRoute = deposit.routes?.find(r => r.routeId === routeIdNum);
              if (foundRoute) {
                depositFromRaw = deposit.depositId;
                break;
              }
            }
          }
          // Flex routes are excluded from onlyNonFlex deposits; fetch deposits with flex routes to resolve
          if (
            (depositFromRaw === null || depositFromRaw === undefined) &&
            routeId != null &&
            (raw.__is_flex_draft === true || raw.__isFlex_draft === true)
          ) {
            try {
              const depositsWithFlex = await fetchDepositsWithRoutesFull();
              const filteredDeposits = filterAllowedDeposits(depositsWithFlex);
              for (const deposit of filteredDeposits) {
                const foundRoute = deposit.routes?.find(r => r.routeId === Number(routeId));
                if (foundRoute) {
                  depositFromRaw = deposit.depositId;
                  break;
                }
              }
            } catch {
              // Ignore; depositFromRaw stays undefined
            }
          }
        }
        const depositIdFromRaw = depositFromRaw !== null && depositFromRaw !== undefined ? Number(depositFromRaw) : NaN;

        // Extract adhoc service ID (from raw or infer from adhocSort when API does not return adhocServiceId)
        const adhocServiceObj = raw.adhocService as Record<string, unknown> | undefined;
        let adhocServiceId =
          raw.adhocServiceId != null || (raw as Record<string, unknown>).adhocServiceId != null || adhocServiceObj?.adhocServiceId != null
            ? Number(raw.adhocServiceId ?? (raw as Record<string, unknown>).adhocServiceId ?? adhocServiceObj?.adhocServiceId)
            : NaN;
        if ((!Number.isFinite(adhocServiceId) || adhocServiceId <= 0) && raw.adhocSort != null && Number(raw.adhocSort) > 0) {
          const adhocSortNum = Number(raw.adhocSort);
          const match = adhocServicesData.find(
            (s) => s.adhocVendorPayment != null && Number(s.adhocVendorPayment) === adhocSortNum
          );
          if (match) adhocServiceId = match.adhocServiceId;
        }

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

        // Extract notes
        const notesValue = String(assignment.notes || raw.notes || '');

        // Batch all state updates
        // Ensure vendor is set only after vendors are loaded
        const finalUserId = userId && Number.isFinite(userId) && userId > 0
          ? String(userId)
          : '';

        if (!finalUserId) {
          console.warn('[EditAssignmentModal] User ID not found:', {
            rawUserId: raw.userId,
            vendorObject: raw.vendor,
            assignmentName: assignment.name,
            vendorsLoaded: vendorsData.length,
            foundByName: assignment.name ? vendorsData.find(d => d.fullName === assignment.name || d.fullName?.toLowerCase() === assignment.name?.toLowerCase()) : null
          });
        }

        setSelectedUserId(finalUserId || '');
        setSelectedVehicleId(vehicleId ? String(vehicleId) : '');
        setRouteDepositId(Number.isFinite(depositIdFromRaw) && depositIdFromRaw > 0 ? depositIdFromRaw : null);
        setSelectedAdhocServiceId(
          !hideAdhocFields && Number.isFinite(adhocServiceId) && adhocServiceId > 0
            ? String(adhocServiceId)
            : ''
        );
        setRouteSort(sortValue);
        setNotes(notesValue);

        // Add Flex + Edit: populate vendor select from GET /bff/vendor (vendors prop) when available
        if (providedVendors && Array.isArray(providedVendors) && providedVendors.length > 0) {
          let fromVendors = normalizeVendorsToVendors(providedVendors);
          // Ensure assignment's vendor is in the list when editing (match by userId)
          if (userId) {
            const currentVendor = vendorsData.find((d) => getVendorId(d) === userId)
              ?? fromVendors.find((d) => getVendorId(d) === userId);
            if (currentVendor && !fromVendors.some((d) => getVendorId(d) === getVendorId(currentVendor))) {
              fromVendors = [currentVendor, ...fromVendors];
            }
          }
          setVendors(fromVendors);
        } else if (Number.isFinite(depositIdFromRaw) && depositIdFromRaw > 0) {
          try {
            const depositVendors = await fetchVendorsByDeposit(Number(depositIdFromRaw));
            let toSet = depositVendors.length > 0 ? depositVendors : vendorsData;
            const currentVendor = userId
              ? (vendorsData.find((d) => getVendorId(d) === userId) ?? toSet.find((d) => getVendorId(d) === userId))
              : null;
            if (currentVendor && !toSet.some((d) => getVendorId(d) === getVendorId(currentVendor))) {
              toSet = [currentVendor, ...toSet];
            }
            setVendors(toSet);
          } catch (depositVendorsErr) {
            console.warn('[EditAssignmentModal] Failed to fetch vendors by deposit, using all vendors:', depositVendorsErr);
            setVendors(vendorsData);
          }
        }

        // Mark as initialized
        initializedAssignmentId.current = assignmentId;
        lastAssignmentRef.current = assignment;
      } catch (err) {
        console.error("Error initializing form:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        isInitializing.current = false;
      }
    };

    initializeForm();
  }, [open, assignment, assignmentId, assignmentChanged, loadData, providedVendors, hideAdhocFields]);

  // Ensure vendor is selected when vendors are loaded
  useEffect(() => {
    if (!open || !assignment || isLoading || !selectedUserId) {
      return;
    }

    // If vendors are loaded and we have a vendor ID but it's not in the list, try to find it
    if (vendors.length > 0 && selectedUserId) {
      const vendorExists = vendors.some(d => String(d.userId) === selectedUserId);
      if (!vendorExists && assignment.name) {
        // Try to find by name
        const foundVendor = vendors.find(d =>
          d.fullName === assignment.name ||
          d.fullName?.toLowerCase() === assignment.name?.toLowerCase()
        );
        if (foundVendor) {
          setSelectedUserId(String(foundVendor.userId));
        }
      }
    }
  }, [open, assignment, vendors, isLoading, selectedUserId]);

  /** Cost model no longer editable in UI — derive from selected vendor or existing assignment raw */
  const effectiveCostModelId = useMemo(() => {
    if (!assignment) return 0;
    if (selectedUserId) {
      const sid = Number(selectedUserId);
      const d = vendors.find(
        (x) => getVendorId(x) === sid || x.userId === sid
      );
      if (d) {
        // 1. Direct costModelId field
        const cid = Number(d.costModelId ?? 0);
        if (Number.isFinite(cid) && cid > 0) return cid;

        // 2. Fallback: first valid costModelId from the vendor's costModels array
        if (Array.isArray(d.costModels)) {
          for (const cm of d.costModels) {
            const cmId = Number(cm?.costModelId ?? 0);
            if (Number.isFinite(cmId) && cmId > 0) return cmId;
          }
        }
      }
    }
    const raw = assignment.raw as Record<string, unknown> | undefined;
    if (!raw) return 0;
    const co =
      raw.costModel && typeof raw.costModel === "object"
        ? (raw.costModel as Record<string, unknown>)
        : null;
    const cid = Number(
      raw.costModelId ??
      (raw as Record<string, unknown>).costModelId ??
      co?.costModelId ??
      co?.costModelId ??
      0
    );
    return Number.isFinite(cid) && cid > 0 ? cid : 0;
  }, [assignment, selectedUserId, vendors]);

  const effectiveCostModelName = useMemo(() => {
    const raw = assignment?.raw as Record<string, unknown> | undefined;
    if (!raw) return "";
    const co =
      raw.costModel && typeof raw.costModel === "object"
        ? (raw.costModel as Record<string, unknown>)
        : null;
    return String(co?.costModelName ?? co?.name ?? "");
  }, [assignment]);

  const hideVehicleForAdhocService = useMemo(() => {
    if (selectedAdhocServiceId && selectedAdhocServiceId !== "none") {
      const selectedService = adhocServices.find((s) => String(s.adhocServiceId) === selectedAdhocServiceId);
      // Service found in list — hide vehicle when isAdhocSort=true (sort-only, no vehicle needed)
      if (selectedService) return selectedService.isAdhocSort === true;
      // ID set but not yet in list (still loading) — don't hide
      return false;
    }
    // No service selected: fall back to the raw assignment's saved service
    const raw = assignment?.raw as Record<string, unknown> | undefined;
    const serviceRaw = raw?.adhocService && typeof raw.adhocService === "object"
      ? raw.adhocService as Record<string, unknown>
      : null;
    const value = serviceRaw?.isAdhocSort ?? serviceRaw?.is_adhoc_sort;
    return value === true || value === "true";
  }, [adhocServices, assignment, selectedAdhocServiceId]);

  const handleSave = useCallback(async () => {
    if (readOnly) {
      return;
    }

    if (!assignment) {
      setError('Invalid assignment');
      return;
    }

    if (!selectedUserId) {
      setError('Please select a vendor');
      return;
    }

    if (!hideVehicleForAdhocService && !selectedVehicleId) {
      setError('');
      setVehicleFieldError('Please select a vehicle');
      return;
    }

    setVehicleFieldError('');

    if (!effectiveCostModelId) {
      setError('Cost model could not be resolved for this vendor. Check vendor cost model in master data.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Sort-only adhoc items never carry a real vehicle — always pin to the NOVEHICLE/BAOP
      // placeholder on save, regardless of whatever vehicleId is currently sitting in raw
      // (never trust it as a fallback: it may have been set to the vendor's own default vehicle).
      const selectedVehicleIdNum = hideVehicleForAdhocService
        ? BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER
        : Number(selectedVehicleId);
      const selectedVehicle = vehicles.find(v => getVehicleId(v) === selectedVehicleIdNum);
      const rawVehicle = selectedVehicle as Record<string, unknown> | undefined;
      const vehicleName: string = String(rawVehicle?.model ?? rawVehicle?.manufacturer ?? '');
      const registrationPlate: string = String(
        rawVehicle?.vehicleRegistration_plate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.registration_plate ??
        rawVehicle?.registrationPlate ??
        rawVehicle?.registration_plates ??
        rawVehicle?.registrationPlates ??
        ''
      );
      const sortValue = routeSort === 'yes' ? 'yes' : 'no';

      const costModelName = effectiveCostModelName;

      const weekPlannerId = typeof assignment.weekPlannerId === 'number' && assignment.weekPlannerId > 0
        ? assignment.weekPlannerId
        : 0;

      const adhocServiceId =
        !hideAdhocFields && selectedAdhocServiceId && Number(selectedAdhocServiceId) > 0
          ? Number(selectedAdhocServiceId)
          : null;

      await onSave(
        weekPlannerId,
        Number(selectedUserId),
        selectedVehicleIdNum,
        effectiveCostModelId,
        sortValue,
        notes.trim() || undefined,
        assignment,
        vehicleName,
        registrationPlate,
        costModelName,
        adhocServiceId,
        routeDepositId,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update assignment");
    } finally {
      setIsSaving(false);
    }
  }, [assignment, selectedUserId, selectedVehicleId, effectiveCostModelId, effectiveCostModelName, routeSort, notes, selectedAdhocServiceId, routeDepositId, vehicles, onSave, onClose, readOnly, hideAdhocFields, hideVehicleForAdhocService]);

  const handleAssignWeek = useCallback(async () => {
    if (!assignment || !onAssignWeek) {
      setError('Cannot assign week: missing assignment or handler');
      return;
    }

    if (!selectedUserId) {
      setError('Please select a vendor');
      return;
    }

    if (!effectiveCostModelId) {
      setError('Cost model could not be resolved for this vendor. Check vendor cost model in master data.');
      return;
    }

    if (!hideVehicleForAdhocService && !selectedVehicleId) {
      setError('');
      setVehicleFieldError('Please select a vehicle');
      return;
    }

    setVehicleFieldError('');

    setIsAssigningWeek(true);
    setError('');

    try {
      // Sort-only adhoc items never carry a real vehicle — always pin to the NOVEHICLE/BAOP
      // placeholder, never trusting whatever vehicleId is currently sitting in raw.
      const selectedVehicleIdNum = hideVehicleForAdhocService
        ? BUSINESS_RULES.VEHICLE.BAOP_DEFAULT_PLACEHOLDER
        : Number(selectedVehicleId);
      const selectedVehicle = vehicles.find(v => getVehicleId(v) === selectedVehicleIdNum);
      const rawVehicle = selectedVehicle as Record<string, unknown> | undefined;
      const vehicleName: string = String(rawVehicle?.model ?? rawVehicle?.manufacturer ?? assignment.vehicle ?? '');
      const registrationPlate: string = String(
        rawVehicle?.vehicleRegistration_plate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.vehicleDefaultRegistrationPlate ??
        rawVehicle?.registration_plate ??
        rawVehicle?.registrationPlate ??
        rawVehicle?.registration_plates ??
        rawVehicle?.registrationPlates ??
        assignment.registrationPlate ??
        ''
      );
      const sortValue = routeSort === 'yes' ? 'yes' : 'no';

      const costModelName = effectiveCostModelName;

      const selectedUserIdNum = Number(selectedUserId);
      const selectedVendor = vendors.find(d => getVendorId(d) === selectedUserIdNum);
      const vendorName = selectedVendor?.fullName || assignment.name || '';

      const updatedAssignment: WeekPlannerRecord = {
        ...assignment,
        name: vendorName,
        vehicle: vehicleName,
        registrationPlate,
        routeSort: sortValue,
        notes: notes.trim() || assignment.notes || '',
        raw: {
          ...(assignment.raw ?? {}),
          userId: Number(selectedUserId),
          vehicleId: selectedVehicleIdNum || (assignment.raw as Record<string, unknown>)?.vehicleId as number | undefined,
          costModelId: effectiveCostModelId,
          isSort: sortValue === 'yes',
          routeSort: sortValue,
          notes: notes.trim() || undefined,
          adhocServiceId:
            !hideAdhocFields && selectedAdhocServiceId && Number(selectedAdhocServiceId) > 0
              ? Number(selectedAdhocServiceId)
              : undefined,
          depositId: routeDepositId ?? undefined,
          costModel: {
            ...((assignment.raw as Record<string, unknown>)?.costModel && typeof (assignment.raw as Record<string, unknown>).costModel === 'object'
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
  }, [assignment, onAssignWeek, showWeekends, selectedUserId, effectiveCostModelId, effectiveCostModelName, selectedVehicleId, vehicles, vendors, routeSort, notes, routeDepositId, selectedAdhocServiceId, hideAdhocFields, hideVehicleForAdhocService, onClose]);

  const handleDeleteClick = useCallback(() => {
    // Block only if truly readonly AND week ops are also not allowed.
    if (readOnly && !allowWeekOps) {
      return;
    }
    if (!assignment) {
      setError('Invalid assignment');
      return;
    }
    setError('');
    setShowRemoveModal(true);
  }, [assignment, readOnly, allowWeekOps]);

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
  const handleVendorChange = useCallback((value: string) => {
    setSelectedUserId(value);
    setError('');
    setVehicleFieldError('');

    // For draft/new records, selecting a vendor should preload vendor defaults.
    const selectedVendor = vendors.find((d) => String(d.userId) === value);
    if (selectedVendor) {
      const defaultVehicleId = Number(selectedVendor.vehicleId ?? 0);

      setSelectedVehicleId(
        Number.isFinite(defaultVehicleId) && defaultVehicleId > 0 ? String(defaultVehicleId) : ''
      );
    } else {
      setSelectedVehicleId('');
    }

    if (!assignment || !allAssignments?.length || !value) return;
    const userIdNum = Number(value);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) return;
    const assignmentDate = assignment.date ?? (assignment.raw as Record<string, unknown>)?.date;
    const dateStr = typeof assignmentDate === 'string' ? assignmentDate.split('T')[0] : String(assignmentDate ?? '');
    const other = allAssignments.find((a) => {
      const raw = a.raw as Record<string, unknown> | undefined;
      const u = Number(raw?.userId ?? raw?.userId ?? 0);
      const aDate = a.date ?? (raw?.date != null ? String(raw.date).split('T')[0] : '');
      return u === userIdNum && aDate === dateStr && a.weekPlannerId !== assignment.weekPlannerId;
    });
    if (!other?.raw) return;
    const raw = other.raw as Record<string, unknown>;
    const routeSortRaw = raw.routeSort;
    const routeSortVal =
      routeSortRaw !== null && routeSortRaw !== undefined
        ? Number(routeSortRaw) === 1 || String(routeSortRaw).toLowerCase() === 'yes' || String(routeSortRaw) === '1'
          ? 'yes'
          : 'no'
        : undefined;
    if (routeSortVal !== undefined) setRouteSort(routeSortVal);
    if (!hideAdhocFields) {
      const adhocSortRaw = raw.adhocSort;
      const adhocServiceIdRaw = raw.adhocServiceId ?? (raw as Record<string, unknown>).adhocServiceId;
      let adhocId: number | null = adhocServiceIdRaw != null ? Number(adhocServiceIdRaw) : null;
      if (
        (adhocId == null || !Number.isFinite(adhocId) || adhocId <= 0) &&
        adhocSortRaw != null &&
        Number(adhocSortRaw) > 0
      ) {
        const match = adhocServices.find(
          (s) => s.adhocVendorPayment != null && Number(s.adhocVendorPayment) === Number(adhocSortRaw)
        );
        if (match) adhocId = match.adhocServiceId;
      }
      if (adhocId != null && Number.isFinite(adhocId) && adhocId > 0) {
        setSelectedAdhocServiceId(String(adhocId));
      }
    }
    const depId = raw.depositId ?? (raw as Record<string, unknown>).depositId;
    if (depId != null && Number.isFinite(Number(depId))) {
      setRouteDepositId(Number(depId));
    }
  }, [assignment, allAssignments, adhocServices, vendors, hideAdhocFields]);

  const handleAdhocServiceChange = useCallback((value: string) => {
    const nextAdhocServiceId = value === "none" ? "" : value;
    setSelectedAdhocServiceId(nextAdhocServiceId);
  }, []);

  const handleVehicleChange = useCallback((value: string) => {
    setSelectedVehicleId(value);
    setVehicleFieldError('');
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setRouteSort(value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  const getVehicleLabel = useCallback((vehicle: Vehicle): string => {
    const vehicleId = getVehicleId(vehicle);
    const plates = String(
      (vehicle as Record<string, unknown>).registrationPlates ??
      (vehicle as Record<string, unknown>).registration_plates ??
      (vehicle as Record<string, unknown>).vehicleRegistrationPlate ??
      (vehicle as Record<string, unknown>).vehicleRegistration_plate ??
      (vehicle as Record<string, unknown>).vehicleDefaultRegistrationPlate ??
      (vehicle as Record<string, unknown>).vehicle_default_registrationPlate ??
      (vehicle as Record<string, unknown>).registration_plate ??
      (vehicle as Record<string, unknown>).registrationPlate ??
      (vehicle as Record<string, unknown>).registration_plates ??
      (vehicle as Record<string, unknown>).registrationPlates ??
      ''
    );
    if (plates) return String(plates);
    return vehicleId ? `Vehicle ${vehicleId}` : 'Vehicle';
  }, []);

  // Merged vendors list: prefer providedVendors (from /bff/vendor) to match AvailableVendors panel
  const allAvailableVendors = useMemo(() => {
    if (providedVendors && providedVendors.length > 0) {
      return normalizeVendorsToVendors(providedVendors);
    }
    return vendors;
  }, [providedVendors, vendors]);

  // Vendors (vendors) for this deposit only – same logic as daily-game-plan (filter by depositId)
  // For flex route drafts: if filtered by deposit is empty, fall back to all vendors so the select populates
  const isFlexDraft = useMemo(() => {
    const raw = assignment?.raw as Record<string, unknown> | undefined;
    return raw?.__is_flex_draft === true || raw?.__isFlex_draft === true;
  }, [assignment?.raw]);

  const vendorsForDeposit = useMemo(() => {
    let base: Vendor[];
    // Add Flex Route + Edit Assignment: show ALL vendors from GET /bff/vendor (no deposit filter)
    if (isFlexDraft || assignment) {
      base = allAvailableVendors;
    } else if (!routeDepositId || !Number.isFinite(Number(routeDepositId))) {
      base = allAvailableVendors;
    } else {
      const depositNum = Number(routeDepositId);
      const filtered = allAvailableVendors.filter((d) => {
        const record = d as unknown as Record<string, unknown>;
        const depId = record.depositId ?? record.depositId;
        return depId != null && Number(depId) === depositNum;
      });
      const selectedId = selectedUserId ? Number(selectedUserId) : null;
      if (selectedId && !filtered.some((d) => getVendorId(d) === selectedId)) {
        const current = allAvailableVendors.find((d) => getVendorId(d) === selectedId);
        if (current) base = [current, ...filtered.filter((d) => getVendorId(d) !== selectedId)];
        else base = filtered;
      } else {
        base = filtered;
      }
    }

    // Edit (rota/loop/etc): list all eligible vendors for the deposit freely (standardized with Day Off behavior).
    // Vendors are fully visible regardless of them having other allocations on the same date.
    if (!isFlexDraft && assignment?.date && allAssignments?.length) {
      // Filter logic removed purposely here to solve Issue 5.1: Lista de vendors incompleta
    }

    // Add Flex Route (isFlexDraft=true): show all vendors,
    // EXCEPT those who already have a week-planner with route DAY_OFF on the selected date.
    // This prevents double-assigning a vendor to multiple flex routes on the same day.
    if (isFlexDraft && assignment?.date && allAssignments?.length) {
      const assignmentDateNorm = assignment.date.includes('T') ? assignment.date.split('T')[0] : assignment.date;
      const blockedUserIds = new Set<number>();

      allAssignments.forEach((op) => {
        const opDate = op.date ? (op.date.includes('T') ? op.date.split('T')[0] : op.date) : '';
        if (opDate !== assignmentDateNorm) return;
        const raw = op.raw as Record<string, unknown> | undefined;
        if (!raw) return;

        // Extract routeId (priority: routeId > route_defaultId > route.routeId > route.routeDefaultId)
        let routeId: number | null = null;
        if (raw.routeId != null) {
          routeId = Number(raw.routeId);
        } else if (raw.routeDefaultId != null) {
          routeId = Number(raw.routeDefaultId);
        } else if (raw.route && typeof raw.route === 'object') {
          const routeObj = raw.route as Record<string, unknown>;
          if (routeObj.routeId != null) {
            routeId = Number(routeObj.routeId);
          } else if (routeObj.routeDefaultId != null) {
            routeId = Number(routeObj.routeDefaultId);
          }
        }
        if (routeId !== BUSINESS_RULES.ROUTE.DAY_OFF) return;

        const userIdRaw = raw.userId ?? raw.userId;
        const userIdNum = userIdRaw != null ? Number(userIdRaw) : NaN;
        if (Number.isFinite(userIdNum) && userIdNum > 0) {
          blockedUserIds.add(userIdNum);
        }
      });

      if (blockedUserIds.size > 0) {
        base = base.filter((d) => !blockedUserIds.has(getVendorId(d)));
      }
    }

    return base;
  }, [allAvailableVendors, routeDepositId, selectedUserId, isFlexDraft, assignment, allAssignments]);

  // OFF assignment: only Vendor (read-only) and Notes are shown/editable
  const isOffAssignment = useMemo(() => {
    if (!assignment) return false;
    // Primary: use the normalised isDayOff flag (new DTO)
    if (assignment.isDayOff === 'true') return true;
    const route = String(assignment.route ?? '').toUpperCase();
    if (route === 'OFF') return true;
    // Fallback: legacy costModelName === 'OFF' for old cached data
    const raw = assignment.raw as Record<string, unknown> | undefined;
    const cmName = raw?.costModel && typeof raw.costModel === 'object'
      ? String((raw.costModel as Record<string, unknown>).costModelName ?? '').toUpperCase()
      : '';
    return cmName === 'OFF';
  }, [assignment]);

  // Memoize select options for SearchableCombobox (use vendors for this deposit)
  const vendorItems = useMemo<SearchableSelectItem[]>(() => {
    if (isLoading || vendorsForDeposit.length === 0) return [];
    const seen = new Set<number>();
    const unique = vendorsForDeposit.filter((d) => {
      const id = getVendorId(d);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return [...unique]
      .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' }))
      .map((vendor) => {
        const did = getVendorId(vendor);
        return {
          value: String(did),
          label: vendor.fullName || `Vendor ${did}`,
        };
      });
  }, [vendorsForDeposit, isLoading]);

  const adhocServiceItems = useMemo<SearchableSelectItem[]>(() => {
    if (isLoading || adhocServices.length === 0) return [];
    return adhocServices.map((service) => ({
      value: String(service.adhocServiceId),
      label: service.adhocName || `ADHOC Service ${service.adhocServiceId}`,
    }));
  }, [adhocServices, isLoading]);

  const selectedAdhocSortValue = useMemo(() => {
    if (!selectedAdhocServiceId || selectedAdhocServiceId === "none") return "";
    const service = adhocServices.find((s) => String(s.adhocServiceId) === selectedAdhocServiceId);
    if (!service) return "";
    const payment = service.adhocVendorPayment != null ? Number(service.adhocVendorPayment) : null;
    return payment != null && Number.isFinite(payment) ? String(payment) : "";
  }, [selectedAdhocServiceId, adhocServices]);

  const vehicleItems = useMemo<SearchableSelectItem[]>(() => {
    if (isLoading || vehicles.length === 0) return [];
    return vehicles.flatMap<SearchableSelectItem>((vehicle) => {
      const vid = getVehicleId(vehicle);
      if (!vid) return [];
      const rawVehicle = vehicle as Record<string, unknown>;
      const model = String(rawVehicle.vehicleModel ?? rawVehicle.model ?? rawVehicle.manufacturer ?? '').trim();
      return [{
        value: String(vid),
        label: getVehicleLabel(vehicle),
        secondaryLabel: model || undefined
      }];
    });
  }, [vehicles, isLoading, getVehicleLabel]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col p-0 bg-white border border-slate-200 shadow-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0 px-4 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <DialogTitle className="text-slate-800 text-base font-semibold">
            {readOnly
              ? 'View Assignment'
              : (!assignment?.weekPlannerId || assignment.weekPlannerId <= 0)
                ? 'Add Assignment'
                : 'Edit Assignment'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit the assignment details such as vendor, vehicle, and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 px-4 pb-3">
          {readOnly && (
            <Alert>
              <AlertDescription>
                View-only mode for current/past dates. Editing and removal are disabled.
              </AlertDescription>
            </Alert>
          )}

          {/* Read-only Assignment Info */}
          <div className="space-y-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Route</Label>
              <p className="text-sm font-semibold mt-1 text-slate-900">{assignment?.route || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</Label>
              <p className="text-sm font-semibold mt-1 text-slate-900">{assignment?.date || 'Unknown'}</p>
            </div>
          </div>

          {/* Vendor: read-only when OFF, otherwise select */}
          <div className="space-y-1.5">
            <Label htmlFor={isOffAssignment ? "vendor-readonly" : "vendor-select"} className="text-sm">
              Vendor *
            </Label>
            {isOffAssignment ? (
              <input
                id="vendor-readonly"
                type="text"
                value={assignment ? (assignment.name ?? '') : ''}
                disabled
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-700 text-sm cursor-not-allowed"
                aria-label="Vendor (read-only)"
              />
            ) : (
              <SearchableSelect
                items={vendorItems}
                value={selectedUserId}
                onValueChange={handleVendorChange}
                disabled={interactionDisabled}
                loading={isLoading}
                placeholder="Select a vendor"
                searchPlaceholder="Search vendor..."
                title="Vendors"
                emptyText={routeDepositId ? 'No vendors available for this deposit.' : 'No vendors available'}
              />
            )}
          </div>

          {/* Vehicle, Sort, Adhoc (hidden for OFF) */}
          {!isOffAssignment && (
            <>
              {!hideVehicleForAdhocService && (
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle-select" className="text-sm">Vehicle *</Label>
                  <SearchableSelect
                    items={vehicleItems}
                    value={selectedVehicleId}
                    onValueChange={handleVehicleChange}
                    disabled={interactionDisabled}
                    loading={isLoading}
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

              <div className="space-y-1.5">
                <Label htmlFor="sort-select" className="text-sm">Sort</Label>
                <Select
                  value={routeSort}
                  onValueChange={handleSortChange}
                  disabled={interactionDisabled}
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

              {!hideAdhocFields && (
                <div className="space-y-1.5">
                  <Label htmlFor="adhoc-service-select" className="text-sm">
                    Adhoc Service (optional)
                  </Label>
                  <SearchableSelect
                    items={adhocServiceItems}
                    value={selectedAdhocServiceId || "none"}
                    onValueChange={handleAdhocServiceChange}
                    disabled={interactionDisabled}
                    loading={isLoading}
                    placeholder="Select an adhoc service"
                    searchPlaceholder="Search adhoc service..."
                    title="Adhoc Services"
                    emptyText="No adhoc services available"
                  />
                  {selectedAdhocSortValue && !hideAdhocSort && (
                    <div className="space-y-1.5">
                      <Label htmlFor="adhoc-sort-display" className="text-sm">
                        Adhoc Sort
                      </Label>
                      <input
                        id="adhoc-sort-display"
                        type="text"
                        value={selectedAdhocSortValue}
                        readOnly
                        disabled
                        placeholder=""
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600 text-sm"
                        aria-label="Adhoc Sort value"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes-textarea" className="text-sm">Notes (optional)</Label>
            <Textarea
              id="notes-textarea"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add notes for this assignment..."
              disabled={interactionDisabled}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
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
            {/* Assign Week Button (hidden for OFF). Visible even when readOnly if allowWeekOps=true
                (e.g. today's cell: day-level edits blocked, but week ops apply from tomorrow). */}
            {canAssignWeek && !isOffAssignment && (!readOnly || allowWeekOps) && (
              <Button
                type="button"
                onClick={handleAssignWeek}
                disabled={
                  isAssigningWeek ||
                  isSaving ||
                  isLoading ||
                  isDeleting ||
                  !selectedUserId ||
                  !effectiveCostModelId ||
                  (!hideVehicleForAdhocService && !selectedVehicleId)
                }
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
            )}

            {/* Remove Button. Visible in edit/add mode for both saved assignments and drafts. */}
            {!readOnly && assignment && (
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
            )}

            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isAssigningWeek || isDeleting}
              className="flex-1 min-w-[80px] border border-slate-300 hover:border-slate-400 hover:bg-slate-100 transition-all duration-200 text-xs py-2"
            >
              <span className="text-xs font-medium">{readOnly ? 'Close' : 'Cancel'}</span>
            </Button>

            {/* Save Button (for OFF only notes are sent; vendor/vehicle/cost model from vendor/raw) */}
            {!readOnly && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  isSaving || isLoading || isAssigningWeek || isDeleting ||
                  (isOffAssignment ? !selectedUserId : (!selectedUserId || (!hideVehicleForAdhocService && !selectedVehicleId) || !effectiveCostModelId))
                }
                className="flex-1 min-w-[100px] bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow transition-all duration-200 text-xs py-2"
              >
                <span className="text-xs font-medium">
                  {isSaving ? 'Saving...' : 'Save'}
                </span>
              </Button>
            )}
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
              {onRemoveDay && assignment && !readOnly && (
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

export default EditAssignmentModal;




