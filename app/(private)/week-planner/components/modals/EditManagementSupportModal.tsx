"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect, type SelectItem as SearchableSelectItem } from '@/components/ui/searchable-select';
import { Loader2, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import {
  changeDailyTeamSupportUser,
  deleteDailyTeamSupport,
  fetchDailyTeamSupport,
  fetchEmployeesByUserTypeIds,
} from '../../services/apiService';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import {
  fetchManagementTeamFunctions,
  type ManagementTeamFunction,
} from '@/lib/types-config-api';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type EditManagementSupportModalProps = {
  open: boolean;
  onClose: () => void;
  assignment: WeekPlannerRecord | null;
  onSave: () => void;
  onDelete: () => void;
  /** When true, modal is view-only (no edit/delete) - e.g. for admin viewing past dates */
  readOnly?: boolean;
};

const EditManagementSupportModal: React.FC<EditManagementSupportModalProps> = ({
  open,
  onClose,
  assignment,
  onSave,
  onDelete,
  readOnly = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employees, setEmployees] = useState<Array<{
    userId: number;
    fullName: string;
    email?: string;
    userTypeId?: number;
    user_type_name?: string;
  }>>([]);
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [depositIdsUsedByDts, setDepositIdsUsedByDts] = useState<Set<number>>(new Set());
  const [selectedDepositId, setSelectedDepositId] = useState<string>('');
  const [managementFunctions, setManagementFunctions] = useState<ManagementTeamFunction[]>([]);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>('');

  const uniqueEmployees = useMemo(
    () => {
      const seen = new Set<number>();
      return employees.filter((e) => {
        if (seen.has(e.userId)) return false;
        seen.add(e.userId);
        return true;
      });
    },
    [employees],
  );

  const normalizeFunctionName = (value: string): string =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const isBlockedPermissionFunction = useCallback((functionName: string): boolean => {
    const normalized = normalizeFunctionName(functionName);
    if (!normalized) return false;
    return (
      normalized.includes("nao pode criar") ||
      normalized.includes("nao pode editar") ||
      normalized.includes("cannot create") ||
      normalized.includes("cannot edit") ||
      normalized.includes("read only") ||
      normalized.includes("readonly") ||
      normalized.includes("somente leitura")
    );
  }, []);

  const availableManagementFunctions = useMemo(
    () => managementFunctions.filter((fn) => !isBlockedPermissionFunction(String(fn.functionName || ""))),
    [managementFunctions, isBlockedPermissionFunction]
  );

  const functionItems = useMemo<SearchableSelectItem[]>(() => {
    return availableManagementFunctions.map((fn) => ({
      value: String(fn.managementTeamFunctionId),
      label: fn.functionName || `Function ${fn.managementTeamFunctionId}`,
    }));
  }, [availableManagementFunctions]);

  const employeeItems = useMemo<SearchableSelectItem[]>(() => {
    return uniqueEmployees.map((e) => ({
      value: String(e.userId),
      label: e.fullName || `User ${e.userId}`,
    }));
  }, [uniqueEmployees]);

  // Extract dailyTeamSupportId from assignment
  const dailyTeamSupportId = useMemo(() => {
    if (!assignment) return null;
    const raw = assignment.raw as Record<string, unknown> | undefined;
    return raw?.dailyTeamSupportId ? Number(raw.dailyTeamSupportId) : null;
  }, [assignment]);

  // Extract assignment data for stable dependency
  const assignmentUserId = useMemo(() => {
    if (!assignment) return null;
    const raw = assignment.raw as Record<string, unknown> | undefined;
    const nestedDts =
      raw?.dailyTeamSupport && typeof raw.dailyTeamSupport === "object"
        ? (raw.dailyTeamSupport as Record<string, unknown>)
        : undefined;
    const candidate =
      raw?.userId ??
      raw?.userId ??
      nestedDts?.userId ??
      nestedDts?.userId ??
      raw?.userId ??
      raw?.userId ??
      null;
    const parsed = Number(candidate ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [assignment]);

  const assignmentDescription = useMemo(() => {
    return assignment?.notes || '';
  }, [assignment]);

  const assignmentDate = useMemo(() => assignment?.date ?? null, [assignment]);
  const assignmentFunctionId = useMemo(() => {
    if (!assignment) return null;
    const raw = assignment.raw as Record<string, unknown> | undefined;
    const fnId = raw?.managementTeamFunctionId;
    const parsed = Number(fnId ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [assignment]);

  const hasAssignment = assignment !== null;
  const assignmentRaw = assignment?.raw;

  // Initialize form when modal opens
  useEffect(() => {
    if (open && hasAssignment) {
      // Always initialize form values when modal opens
      setDescription(assignmentDescription);
      setError('');

      // Set userId immediately if available
      if (assignmentUserId) {
        setSelectedUserId(String(assignmentUserId));
      } else {
        setSelectedUserId('');
      }

      // Extract depositId from assignment if available
      const raw = assignmentRaw;
      const depositIdValue = raw?.depositId;
      // Handle depositId - can be number, string, or null
      const depositId = depositIdValue !== null && depositIdValue !== undefined && depositIdValue !== ''
        ? Number(depositIdValue)
        : null;
      setSelectedDepositId(depositId !== null && Number.isFinite(depositId) && depositId > 0 ? String(depositId) : '');
      setSelectedFunctionId(
        assignmentFunctionId !== null && Number.isFinite(assignmentFunctionId) && assignmentFunctionId > 0
          ? String(assignmentFunctionId)
          : ''
      );

      // Always fetch deposits when modal opens
      fetchDepositsData();
      fetchManagementFunctionsData();
    } else if (!open) {
      // Reset form when modal closes
      setSelectedUserId('');
      setDescription('');
      setError('');
      setShowDeleteConfirm(false);
      setEmployees([]);
      setDeposits([]);
      setDepositIdsUsedByDts(new Set());
      setSelectedDepositId('');
      setManagementFunctions([]);
      setSelectedFunctionId('');
    }
  }, [open, hasAssignment, assignmentRaw, assignmentUserId, assignmentDescription, assignmentFunctionId]);

  // Fetch employees (`ADMIN` e `SUPERVISOR`) and deposits used by daily-team-support.
  useEffect(() => {
    if (!open || !assignment || !assignmentDate) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch daily-team-support for this date (for deposit filter + user filter)
        const assignedUserIds = new Set<number>();
        const usedDepositIds = new Set<number>();
        try {
          const dtsList = await fetchDailyTeamSupport(assignmentDate, assignmentDate);
          for (const dts of dtsList) {
            const uid = dts.userId;
            if (uid) assignedUserIds.add(Number(uid));
            const depId = dts.depositId;
            if (depId != null && Number.isFinite(Number(depId))) usedDepositIds.add(Number(depId));
          }
          setDepositIdsUsedByDts(usedDepositIds);
        } catch {
          setDepositIdsUsedByDts(new Set());
        }

        // Fetch employees with `ADMIN` and `SUPERVISOR` only.
        const allEmployees = await fetchEmployeesByUserTypeIds([
          BUSINESS_RULES.USER_TYPE.ADMIN,
          BUSINESS_RULES.USER_TYPE.SUPERVISOR,
        ]);

        // Edit modal: show ALL vendors of `ADMIN` or `SUPERVISOR` (no date-based exclusion filter)
        const currentUserId =
          assignmentUserId ??
          (selectedUserId ? Number(selectedUserId) : 0) ??
          0;
        const available = allEmployees;

        // Ensure current user is in the list
        if (currentUserId) {
          const currentInList = available.some((u) => u.userId === currentUserId);
          if (!currentInList) {
            const fullName = assignment.name || 'Unknown';
            available.unshift({
              userId: currentUserId,
              fullName: fullName,
              email: undefined,
              userTypeId: undefined,
              user_type_name: undefined,
            });
          }
        }

        setEmployees(available);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, assignment, assignmentDate, assignmentUserId, selectedUserId]);

  // Ensure selectedUserId is set correctly after employees are loaded
  useEffect(() => {
    if (open && assignmentUserId && employees.length > 0 && !selectedUserId) {
      setSelectedUserId(String(assignmentUserId));
    }
  }, [open, assignmentUserId, employees.length, selectedUserId]);

  const fetchDepositsData = async () => {
    try {
      const data = await fetchDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      // Don't show error for deposits, just log it
    }
  };

  const fetchManagementFunctionsData = async () => {
    try {
      const data = await fetchManagementTeamFunctions();
      setManagementFunctions(data ?? []);
    } catch (err) {
      console.error('Error fetching management team functions:', err);
      setManagementFunctions([]);
    }
  };

  // When functions are loaded, preselect function by current description only if
  // assignment did not provide managementTeamFunctionId. Keep current user/deposit.
  useEffect(() => {
    if (!open || !assignmentDescription || availableManagementFunctions.length === 0 || selectedFunctionId || assignmentFunctionId) return;
    const normalizedDesc = assignmentDescription.trim().toLowerCase();
    const match = availableManagementFunctions.find(
      (fn) => fn.functionName?.trim().toLowerCase() === normalizedDesc
    );
    if (match) {
      setSelectedFunctionId(String(match.managementTeamFunctionId));
    }
  }, [open, assignmentDescription, assignmentFunctionId, availableManagementFunctions, selectedFunctionId]);

  const handleFunctionChange = (value: string) => {
    setSelectedFunctionId(value);
    setError('');
    const fn = availableManagementFunctions.find(
      (f) => String(f.managementTeamFunctionId) === value
    );
    if (fn) {
      setDescription(fn.functionName || '');
      if (fn.userId != null) {
        setSelectedUserId(String(fn.userId));
      }
      if (fn.depositId != null) {
        setSelectedDepositId(String(fn.depositId));
      }
    }
  };

  const handleSave = async () => {
    if (!dailyTeamSupportId) {
      setError('Invalid assignment ID');
      return;
    }

    if (!selectedFunctionId) {
      setError('Please select a function');
      return;
    }

    const isAllowedFunction = availableManagementFunctions.some(
      (fn) => String(fn.managementTeamFunctionId) === selectedFunctionId
    );
    if (!isAllowedFunction) {
      setError('This permission-rule function cannot be assigned to Management & Support');
      return;
    }

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      await changeDailyTeamSupportUser(dailyTeamSupportId, {
        userId: Number(selectedUserId),
        depositId: selectedDepositId ? Number(selectedDepositId) : null,
        description: description.trim(),
      });

      // Call onSave to trigger refresh BEFORE closing modal
      await onSave();

      // Close modal after refresh is triggered
      onClose();
    } catch (err) {
      console.error('Error updating team support:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team support');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dailyTeamSupportId) {
      setError('Invalid assignment ID');
      return;
    }

    try {
      setIsDeleting(true);
      setError('');

      await deleteDailyTeamSupport(dailyTeamSupportId);

      // Call onDelete to trigger refresh before closing
      await onDelete();

      // Reset all states before closing
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedUserId('');
      setDescription('');
      setError('');
      setEmployees([]);

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error deleting team support:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete team support');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      setError('');
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!assignment) {
    return null;
  }

  const currentUserName = assignment.name || 'Unknown';
  const currentDate = assignment.date ? formatDate(new Date(assignment.date), 'dd/mm/yyyy') : 'Unknown';

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-[550px] max-h-[90vh] flex flex-col overflow-x-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{readOnly ? 'View Management and Support' : 'Edit Management and Support'}</DialogTitle>
            <DialogDescription>
              {readOnly ? 'View-only mode for current/past dates. Editing and removal are disabled.' : 'Update the Management and Support assignment details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-y-auto overflow-x-hidden">
            {readOnly && (
              <Alert>
                <AlertDescription>
                  View-only mode for current/past dates. Editing and removal are disabled.
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            )}

            {!isLoading && (
              <>
                {/* Read-only Info */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 min-w-0 overflow-hidden">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</Label>
                    <p className="text-sm font-semibold mt-1 text-slate-900">{currentDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current User</Label>
                    <p className="text-sm font-semibold mt-1 text-slate-900">{currentUserName}</p>
                  </div>
                </div>

                {/* Management & Support Function (from management_team_functions) */}
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="function-select" className="text-sm">Function *</Label>
                  {readOnly ? (
                    <p className="text-sm font-semibold mt-1 text-slate-900 py-2 px-3 bg-slate-100 rounded-md border border-slate-200">
                      {assignmentDescription || '—'}
                    </p>
                  ) : (
                    <SearchableSelect
                      items={functionItems}
                      value={selectedFunctionId}
                      onValueChange={handleFunctionChange}
                      disabled={isSaving || isDeleting || isLoading}
                      placeholder="Select a function"
                      searchPlaceholder="Search function..."
                      title="Functions"
                    />
                  )}
                </div>

                {/* Deposit Selection - after function, as it may be prefilled by it */}
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="deposit-select" className="text-sm">Deposit</Label>
                  {readOnly ? (
                    <p className="text-sm font-semibold mt-1 text-slate-900 py-2 px-3 bg-slate-100 rounded-md border border-slate-200">
                      {(deposits.find((d) => String(d.depositId) === selectedDepositId)?.depositName ?? String((assignment?.raw as Record<string, unknown>)?.depositName ?? '')) || '—'}
                    </p>
                  ) : (
                    <Select
                      value={selectedDepositId || undefined}
                      onValueChange={(value) => {
                        setSelectedDepositId(value);
                        setError('');
                      }}
                      disabled={isSaving || isDeleting || isLoading}
                    >
                      <SelectTrigger id="deposit-select" className="h-9 w-full min-w-0 !transition-none hover:!border-input hover:!bg-white hover:!shadow-none hover:!transform-none focus:!border-input focus:!ring-0 focus:!transform-none focus-visible:!border-input focus-visible:!ring-0 focus-visible:!transform-none active:!border-input active:!bg-white active:!shadow-none active:!transform-none">
                        <SelectValue placeholder="Select a deposit" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none">
                        {deposits.length > 0 ? (
                          deposits
                            .filter((deposit) =>
                              [1, 2, 3, 7].includes(deposit.depositId) ||
                              (deposit.depositName?.trim().toUpperCase() === 'GEN')
                            )
                            .filter(
                              (deposit) =>
                                !depositIdsUsedByDts.has(deposit.depositId) ||
                                deposit.depositId === Number(selectedDepositId || 0)
                            )
                            .map((deposit) => (
                              <SelectItem key={deposit.depositId} value={String(deposit.depositId)} className="!transition-none focus:!bg-background focus:!text-foreground">
                                {deposit.depositName}
                              </SelectItem>
                            ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            No deposits available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* User Selection - only deposit users that don't have daily-team-support for this date */}
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="user-select" className="text-sm">Select User *</Label>
                  {readOnly ? (
                    <p className="text-sm font-semibold mt-1 text-slate-900 py-2 px-3 bg-slate-100 rounded-md border border-slate-200">
                      {currentUserName}
                    </p>
                  ) : (
                    <SearchableSelect
                      items={employeeItems}
                      value={selectedUserId}
                      onValueChange={(value) => {
                        setSelectedUserId(value);
                        setError('');
                      }}
                      disabled={isSaving || isDeleting || isLoading}
                      loading={isLoading}
                      placeholder="Select a user"
                      searchPlaceholder="Search user..."
                      title="Users"
                    />
                  )}
                </div>

                {/* Service Name / Function */}
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="description-input" className="text-sm">Service Name *</Label>
                  {readOnly ? (
                    <p className="text-sm font-semibold mt-1 text-slate-900 py-2 px-3 bg-slate-100 rounded-md border border-slate-200">
                      {assignmentDescription || '—'}
                    </p>
                  ) : (
                    <Input
                      id="description-input"
                      type="text"
                      placeholder="e.g., OPS SERVICE, IT SUPPORT"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setError('');
                      }}
                      className="h-9 w-full min-w-0 !transition-none hover:!border-input hover:!bg-white hover:!shadow-none hover:!transform-none focus:!transform-none focus-visible:!border-input focus-visible:!ring-0 focus-visible:!transform-none"
                      disabled={isSaving || isDeleting}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!readOnly && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving || isDeleting || !dailyTeamSupportId}
                  className="mr-auto !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 hover:!border-red-700 dark:!bg-red-600 dark:hover:!bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedUserId || !description.trim() || isSaving || isDeleting}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            )}
            {readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="ml-auto"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Management and Support
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this Management and Support assignment?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The assignment for <strong>{currentUserName}</strong> on{' '}
              <strong>{currentDate}</strong> will be permanently deleted.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditManagementSupportModal;


