"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect, type SelectItem as SearchableSelectItem } from '@/components/ui/searchable-select';
import { Loader2 } from 'lucide-react';
import { formatDate, getWeekDates, isWeekend, parseLocalDate } from '../../utils/dateUtils';
import {
  fetchEmployeesByUserTypeIds,
} from '../../services/apiService';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import {
  fetchManagementTeamFunctions,
  type ManagementTeamFunction,
} from '@/lib/types-config-api';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { VendorCostModel } from '@/lib/vendors';

export interface ManagementSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    userId: number;
    vendorName: string;
    title: string;
    dates: string[]; // Array of dates in YYYY-MM-DD format
    depositId?: number | null; // Selected deposit ID
    vendorCostModel?: VendorCostModel | null;
    managementTeamFunctionId?: number | null;
  }) => void;
  date: Date; // The selected date (can be any day of the week)
  routeName?: string;
  /** When opening from deposit supervisor row, pre-select and lock this deposit */
  initialDepositId?: number;
  initialDepositName?: string;
  /** Optional prefill when opening from an existing Management row */
  initialFunctionId?: number;
  initialUserId?: number;
  initialTitle?: string;
}

const ManagementSupportModal: React.FC<ManagementSupportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  date,
  routeName,
  initialDepositId,
  initialDepositName,
  initialFunctionId,
  initialUserId,
  initialTitle,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectAllWeek, setSelectAllWeek] = useState(false);
  const [error, setError] = useState<string>('');
  const [employees, setEmployees] = useState<Array<{
    userId: number;
    fullName: string;
    email?: string;
    userTypeId?: number;
    userTypeName?: string;
  }>>([]);

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

  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [, setDepositIdsUsedByDts] = useState<Set<number>>(new Set());
  const [selectedDepositId, setSelectedDepositId] = useState<string>('');
  const [managementFunctions, setManagementFunctions] = useState<ManagementTeamFunction[]>([]);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>('');

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

  // Keep track of all depositIds referenced by management team functions
  // so they are always available in the Deposit dropdown (even if normally filtered out)
  const functionDepositIds = useMemo(() => {
    const ids = new Set<number>();
    availableManagementFunctions.forEach((fn) => {
      if (fn.depositId != null && Number.isFinite(Number(fn.depositId))) {
        ids.add(Number(fn.depositId));
      }
    });
    return ids;
  }, [availableManagementFunctions]);

  // Get week dates - memoized to prevent infinite loops
  // Ensure date is properly parsed to avoid timezone issues
  const weekDates = useMemo(() => {
    const dateObj = date instanceof Date ? date : parseLocalDate(String(date));
    return getWeekDates(dateObj);
  }, [date]);


  // Initialize selected days and deposit when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError('');

      const baseDateObj = date instanceof Date ? date : parseLocalDate(String(date));
      const baseDateStr = formatDate(baseDateObj, 'yyyy-mm-dd');
      const weekYmd = weekDates.map((d) => formatDate(d, 'yyyy-mm-dd'));

      // If the modal was opened from a specific cell/day (we always pass that cell date),
      // we must respect exactly that date as the initial selection.
      // Only use "current_date + 1" behaviour when the base date is *not* inside this week.
      const isBaseDateInWeek = weekYmd.includes(baseDateStr);
      const defaultDateStr = isBaseDateInWeek ? baseDateStr : baseDateStr;

      setSelectedDays(new Set([defaultDateStr]));
      setSelectAllWeek(false);
      setSelectedFunctionId(
        initialFunctionId != null && Number.isFinite(Number(initialFunctionId)) && Number(initialFunctionId) > 0
          ? String(initialFunctionId)
          : ''
      );
      setSelectedUserId(
        initialUserId != null && Number.isFinite(Number(initialUserId)) && Number(initialUserId) > 0
          ? String(initialUserId)
          : ''
      );
      if (initialDepositId != null) {
        setSelectedDepositId(String(initialDepositId));
        setTitle(
          initialTitle?.trim()
            ? initialTitle.trim()
            : (initialDepositName?.trim() ? `Team Leader - ${initialDepositName.trim()}` : 'Team Leader')
        );
      } else {
        setSelectedDepositId('');
        setTitle(initialTitle?.trim() || '');
      }
      fetchDepositsData();
    } else {
      setLoading(false);
      setSelectedUserId('');
      setTitle('');
      setSelectedDays(new Set());
      setSelectAllWeek(false);
      setError('');
      setEmployees([]);
      setDeposits([]);
      setDepositIdsUsedByDts(new Set());
      setSelectedDepositId('');
      setManagementFunctions([]);
      setSelectedFunctionId('');
    }
  }, [isOpen, date, weekDates, initialDepositId, initialDepositName, initialFunctionId, initialUserId, initialTitle]);

  // Fetch employees (`ADMIN` e `SUPERVISOR`) once when modal opens.
  // All vendors with these tipos de utilizador are always listed regardless of allocation status.
  // Duplicate-assignment validation is handled at confirm time, not here.
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const allEmployees = await fetchEmployeesByUserTypeIds([
          BUSINESS_RULES.USER_TYPE.ADMIN,
          BUSINESS_RULES.USER_TYPE.SUPERVISOR,
        ]);
        setEmployees(allEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, availableManagementFunctions]);

  const fetchDepositsData = async () => {
    try {
      const data = await fetchDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Error fetching deposits:', err);
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

  // Load management & support functions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagementFunctionsData();
    }
  }, [isOpen]);

  const handleFunctionChange = useCallback((value: string) => {
    setSelectedFunctionId(value);
    setError('');
    const fn = availableManagementFunctions.find(
      (f) => String(f.managementTeamFunctionId) === value
    );
    if (fn) {
      setTitle(fn.functionName || '');
      if (fn.userId != null) {
        setSelectedUserId(String(fn.userId));
      }
      if (fn.depositId != null) {
        setSelectedDepositId(String(fn.depositId));
      }
    } else {
      setTitle('');
    }
  }, [availableManagementFunctions]);

  // When opened from a specific deposit (+ Supervisor), auto-select the function
  // whose depositId matches that deposit (e.g. LCY=1, MSE=2, LSE=3)
  useEffect(() => {
    if (!isOpen) return;
    if (selectedFunctionId) return; // don't override user choice
    if (initialFunctionId != null) return; // explicit prefill has priority
    if (initialDepositId == null) return;
    if (availableManagementFunctions.length === 0) return;

    const fn = availableManagementFunctions.find(
      (f) => f.depositId === initialDepositId
    );
    if (fn) {
      handleFunctionChange(String(fn.managementTeamFunctionId));
    }
  }, [isOpen, initialDepositId, initialFunctionId, availableManagementFunctions, selectedFunctionId, handleFunctionChange]);

  // When opened from an empty Management table cell, `initialTitle` identifies
  // the row/function. In this flow we must prefill from management-team-functions
  // defaults (functionId, userId, depositId), not from existing assignments.
  useEffect(() => {
    if (!isOpen) return;
    if (!initialTitle?.trim()) return;
    if (availableManagementFunctions.length === 0) return;

    const normalize = (value: string) => value.trim().toUpperCase();
    const targetTitle = normalize(initialTitle);
    const matchedFunction = availableManagementFunctions.find(
      (fn) => normalize(String(fn.functionName || "")) === targetTitle
    );
    if (!matchedFunction) return;

    setSelectedFunctionId(String(matchedFunction.managementTeamFunctionId));
    setTitle(String(matchedFunction.functionName || initialTitle).trim());
    setSelectedUserId(
      matchedFunction.userId != null && Number.isFinite(Number(matchedFunction.userId))
        ? String(matchedFunction.userId)
        : ''
    );
    setSelectedDepositId(
      matchedFunction.depositId != null && Number.isFinite(Number(matchedFunction.depositId))
        ? String(matchedFunction.depositId)
        : ''
    );
  }, [isOpen, initialTitle, availableManagementFunctions]);

  // If function is preselected, fill missing fields from the function config
  // without overriding explicit prefilled manager/deposit/title.
  useEffect(() => {
    if (!isOpen) return;
    if (!selectedFunctionId) return;
    if (availableManagementFunctions.length === 0) return;
    const fn = availableManagementFunctions.find(
      (f) => String(f.managementTeamFunctionId) === selectedFunctionId
    );
    if (!fn) return;

    if (!title?.trim() && fn.functionName) {
      setTitle(fn.functionName);
    }
    if (!selectedUserId && fn.userId != null) {
      setSelectedUserId(String(fn.userId));
    }
    if (!selectedDepositId && fn.depositId != null) {
      setSelectedDepositId(String(fn.depositId));
    }
  }, [isOpen, selectedFunctionId, availableManagementFunctions, title, selectedUserId, selectedDepositId]);

  const handleConfirm = async () => {
    if (!selectedFunctionId) {
      setError('Please select a Management & Support function');
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
      setError('Please select a vendor');
      return;
    }

    if (!title || title.trim() === '') {
      setError('Please select a function');
      return;
    }

    const userId = Number(selectedUserId);
    if (!userId || !Number.isFinite(userId) || userId <= 0) {
      setError('Invalid vendor selected');
      return;
    }

    const selectedEmployee = employees.find(e => e.userId === userId);
    if (!selectedEmployee) {
      setError('Selected vendor not found');
      return;
    }

    // Get selected dates
    if (selectedDays.size === 0) {
      setError('Please select at least one day');
      return;
    }

    const dates = Array.from(selectedDays);

    setLoading(true);

    onConfirm({
      userId: userId,
      vendorName: selectedEmployee.fullName,
      title: title.trim(),
      dates,
      depositId: selectedDepositId ? Number(selectedDepositId) : null,
      managementTeamFunctionId: selectedFunctionId ? Number(selectedFunctionId) : null,
    });

    // Fecha a modal imediatamente após disparar a confirmação
    onClose();
  };

  const handleClose = () => {
    // Always allow closing, reset all states
    setLoading(false);
    setSelectedUserId('');
    setTitle('');
    setSelectedDays(new Set());
    setSelectAllWeek(false);
    setError('');
    setSelectedDepositId('');
    onClose();
  };

  // Datas passadas e hoje não podem ser selecionadas
  const todayStr = formatDate(new Date(), 'yyyy-mm-dd');
  const isPastOrToday = (dateStr: string) => dateStr <= todayStr;

  const handleDayToggle = (dateStr: string) => {
    if (isPastOrToday(dateStr)) return; // bloqueia passadas e hoje
    // Uncheck "select all week" when manually selecting days
    if (selectAllWeek) {
      setSelectAllWeek(false);
    }

    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };


  const handleSelectAllWeek = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setSelectAllWeek(isChecked);
    if (isChecked) {
      // Seleciona apenas datas futuras (a partir de amanhã)
      const futureDates = weekDates
        .map(d => formatDate(d, 'yyyy-mm-dd'))
        .filter(d => !isPastOrToday(d));
      setSelectedDays(new Set(futureDates));
    } else {
      // Ao desmarcar Full Week, mantém apenas o dia atual (se for futuro)
      const dateObj = date instanceof Date ? date : parseLocalDate(String(date));
      const currentDateStr = formatDate(dateObj, 'yyyy-mm-dd');
      setSelectedDays(new Set(!isPastOrToday(currentDateStr) ? [currentDateStr] : []));
    }
  };

  // Get week date range for display
  const weekStart = formatDate(weekDates[0], 'dd/mm/yyyy');
  const weekEnd = formatDate(weekDates[6], 'dd/mm/yyyy');

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Associate Management and Support</DialogTitle>
          <DialogDescription>
            Associate an Admin or Team Leader vendor to Management and Support
            {routeName && ` - ${routeName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 flex-1 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Loading vendors...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Management & Support Function (from management_team_functions) */}
              <div className="space-y-1.5">
                <Label htmlFor="function-select" className="text-sm">Function *</Label>
                <SearchableSelect
                  items={functionItems}
                  value={selectedFunctionId}
                  onValueChange={handleFunctionChange}
                  disabled={initialDepositId != null}
                  placeholder="Select a function"
                  searchPlaceholder="Search function..."
                  title="Functions"
                />
              </div>

              {/* Vendor Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="vendor-select" className="text-sm">Select the manager *</Label>
                <SearchableSelect
                  items={employeeItems}
                  value={selectedUserId}
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    setError('');
                  }}
                  loading={loading}
                  placeholder="Select the manager"
                  searchPlaceholder="Search manager..."
                  title="Managers"
                />
              </div>

              {/* Deposit Selection - locked when opened from supervisor row (initialDepositId) */}
              <div className="space-y-1.5">
                <Label htmlFor="deposit-select" className="text-sm">Deposit</Label>
                {initialDepositId != null && initialDepositName ? (
                  <div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
                    {initialDepositName}
                  </div>
                ) : (
                  <Select
                    value={selectedDepositId}
                    onValueChange={(value) => {
                      setSelectedDepositId(value);
                      setError('');
                    }}
                  >
                    <SelectTrigger id="deposit-select" className="h-9 !transition-none hover:!border-input hover:!bg-white hover:!shadow-none hover:!transform-none focus:!border-input focus:!ring-0 focus:!transform-none focus-visible:!border-input focus-visible:!ring-0 focus-visible:!transform-none active:!border-input active:!bg-white active:!shadow-none active:!transform-none">
                      <SelectValue placeholder="Select a deposit" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none">
                      {deposits.length > 0 ? (
                        deposits
                          .filter((deposit) => {
                            // Exibir todos os depósitos principais + GEN + depósitos referenciados por funções
                            return (
                              [1, 2, 3, 7].includes(deposit.depositId) ||
                              deposit.depositName?.trim().toUpperCase() === 'GEN' ||
                              functionDepositIds.has(deposit.depositId)
                            );
                          })
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

              {/* Day Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Select Days *</Label>

                {/* Select All Week Option */}
                <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                  <Checkbox
                    id="select-all-week"
                    checked={selectAllWeek}
                    onCheckedChange={handleSelectAllWeek}
                  />
                  <Label
                    htmlFor="select-all-week"
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    Full Week ({weekStart} to {weekEnd})
                  </Label>
                </div>

                {/* Individual Day Selection */}
                <div className="space-y-1.5 border-t pt-1.5">
                  <p className="text-xs text-gray-500 mb-1">Or select specific days:</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {weekDates.map((dayDate, index) => {
                      const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                      const dayDisplay = formatDate(dayDate, 'dd/mm');
                      const dayName = dayNames[index].substring(0, 3); // Mon, Tue, Wed, etc.
                      const isWeekendDay = isWeekend(dayDate);
                      const isSelected = selectedDays.has(dateStr);
                      const isDisabled = isPastOrToday(dateStr);

                      return (
                        <div
                          key={dateStr}
                          className={`flex items-center space-x-1.5 p-1.5 rounded border transition-colors ${isDisabled
                            ? 'bg-slate-50 border-slate-200 opacity-45 cursor-not-allowed'
                            : isSelected
                              ? 'bg-sky-50 border-sky-300'
                              : isWeekendDay
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-white border-slate-200'
                            }`}
                        >
                          <Checkbox
                            id={`day-${dateStr}`}
                            checked={isSelected && !isDisabled}
                            onCheckedChange={() => handleDayToggle(dateStr)}
                            disabled={selectAllWeek || isDisabled}
                            className="h-3.5 w-3.5"
                          />
                          <Label
                            htmlFor={`day-${dateStr}`}
                            className={`text-xs cursor-pointer flex-1 ${isWeekendDay ? 'text-amber-700' : 'text-slate-700'
                              }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{dayName}</span>
                              <span className="text-[10px] opacity-75">{dayDisplay}</span>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDays.size > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedDays.size} {selectedDays.size === 1 ? 'day' : 'days'} selected
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUserId || !title.trim() || loading}>
            Associate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagementSupportModal;


