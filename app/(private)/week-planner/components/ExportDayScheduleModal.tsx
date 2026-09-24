"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, getWeekDates, isWeekend, parseLocalDate } from '../utils/dateUtils';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { DepositWithRoutesDTO } from '@/lib/api/routes';
import { filterAllowedDeposits, isBaopDepositName } from '@/lib/allowedDeposits';

type ExportDayScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedDates: string[], selectedDepositIds: number[] | 'all') => void | Promise<void>;
  currentDate: Date;
  assignments: WeekPlannerRecord[];
  depositsWithRoutes?: DepositWithRoutesDTO[];
};

const ExportDayScheduleModal: React.FC<ExportDayScheduleModalProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
  assignments,
  depositsWithRoutes = [],
}) => {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedDepositIds, setSelectedDepositIds] = useState<Set<number>>(new Set());
  const [selectAllWeek, setSelectAllWeek] = useState(false);
  const [selectAllDepots, setSelectAllDepots] = useState(true);
  const [error, setError] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // Only non-BAOP deposits are selectable in export
  const deposits = useMemo(
    () => filterAllowedDeposits(depositsWithRoutes).filter((d) => !isBaopDepositName(d.depositName)),
    [depositsWithRoutes]
  );

  const weekDates = useMemo(() => {
    const dateObj = currentDate instanceof Date ? currentDate : parseLocalDate(String(currentDate));
    return getWeekDates(dateObj);
  }, [currentDate]);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const weekDays = useMemo(() => {
    return weekDates.map((date, index) => {
      const dateStr = formatDate(date, 'yyyy-mm-dd');
      const dayAssignments = assignments.filter(a => a.date === dateStr);
      return { date, dateStr, index, count: dayAssignments.length };
    });
  }, [weekDates, assignments]);

  useEffect(() => {
    if (open) {
      const dateObj = currentDate instanceof Date ? currentDate : parseLocalDate(String(currentDate));
      const currentDateStr = formatDate(dateObj, 'yyyy-mm-dd');
      setSelectedDays(new Set([currentDateStr]));
      setSelectAllWeek(false);
      setSelectAllDepots(true);
      setSelectedDepositIds(new Set(deposits.map((d) => d.depositId!).filter(Boolean)));
      setError('');
    } else {
      setSelectedDays(new Set());
      setSelectAllWeek(false);
      setSelectAllDepots(true);
      setSelectedDepositIds(new Set());
      setError('');
    }
  }, [open, currentDate, deposits]);

  // Keep selectAllDepots in sync when individual checkboxes change
  useEffect(() => {
    const allIds = deposits.map((d) => d.depositId!).filter(Boolean);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedDepositIds.has(id));
    setSelectAllDepots(allSelected);
  }, [selectedDepositIds, deposits]);

  const handleDayToggle = (dateStr: string) => {
    if (selectAllWeek) setSelectAllWeek(false);
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) newSet.delete(dateStr);
      else newSet.add(dateStr);
      return newSet;
    });
  };

  const handleSelectAllWeek = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setSelectAllWeek(isChecked);
    if (isChecked) {
      setSelectedDays(new Set(weekDates.map(d => formatDate(d, 'yyyy-mm-dd'))));
    } else {
      const dateObj = currentDate instanceof Date ? currentDate : parseLocalDate(String(currentDate));
      setSelectedDays(new Set([formatDate(dateObj, 'yyyy-mm-dd')]));
    }
  };

  const handleDepotToggle = (depositId: number) => {
    setSelectedDepositIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(depositId)) newSet.delete(depositId);
      else newSet.add(depositId);
      return newSet;
    });
  };

  const handleSelectAllDepots = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setSelectAllDepots(isChecked);
    if (isChecked) {
      setSelectedDepositIds(new Set(deposits.map((d) => d.depositId!).filter(Boolean)));
    } else {
      setSelectedDepositIds(new Set());
    }
  };

  const handleConfirm = async () => {
    if (selectedDays.size === 0) {
      setError('Please select at least one day to export.');
      return;
    }
    if (selectedDepositIds.size === 0) {
      setError('Please select at least one depot to export.');
      return;
    }

    try {
      setIsExporting(true);
      setError('');
      const datesArray = Array.from(selectedDays);
      const allIds = deposits.map((d) => d.depositId!).filter(Boolean);
      const isAll = allIds.length > 0 && allIds.every((id) => selectedDepositIds.has(id));
      await Promise.resolve(onConfirm(datesArray, isAll ? 'all' : Array.from(selectedDepositIds)));
      await new Promise(resolve => setTimeout(resolve, datesArray.length * 300));
      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const weekStart = formatDate(weekDates[0], 'dd/mm/yyyy');
  const weekEnd = formatDate(weekDates[6], 'dd/mm/yyyy');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Export Day Schedule</DialogTitle>
          <DialogDescription>
            Select one or more days and depots to export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 flex-1 overflow-y-auto">
          {/* Depot Selection — checkboxes, BAOP excluded */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Depots *</Label>
            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <Checkbox
                id="select-all-depots-export"
                checked={selectAllDepots}
                onCheckedChange={handleSelectAllDepots}
              />
              <Label htmlFor="select-all-depots-export" className="text-sm font-medium cursor-pointer flex-1">
                All depots ({deposits.length})
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-1.5 border-t pt-1.5">
              {deposits.map((d) => {
                const id = d.depositId!;
                const isChecked = selectedDepositIds.has(id);
                return (
                  <div
                    key={id}
                    className={`flex items-center space-x-1.5 p-1.5 rounded border transition-colors ${
                      isChecked ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Checkbox
                      id={`depot-export-${id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleDepotToggle(id)}
                      disabled={selectAllDepots}
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={`depot-export-${id}`}
                      className="text-xs font-medium cursor-pointer flex-1 text-slate-700"
                    >
                      {d.depositName || `Depot ${id}`}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Days *</Label>

            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <Checkbox
                id="select-all-week-export"
                checked={selectAllWeek}
                onCheckedChange={handleSelectAllWeek}
              />
              <Label htmlFor="select-all-week-export" className="text-sm font-medium cursor-pointer flex-1">
                Full Week ({weekStart} to {weekEnd})
              </Label>
            </div>

            <div className="space-y-1.5 border-t pt-1.5">
              <p className="text-xs text-gray-500 mb-1">Or select specific days:</p>
              <div className="grid grid-cols-3 gap-1.5">
                {weekDays.map((dayData) => {
                  const dateStr = dayData.dateStr;
                  const dayDisplay = formatDate(dayData.date, 'dd/mm');
                  const dayName = dayNames[dayData.index].substring(0, 3);
                  const isWeekendDay = isWeekend(dayData.date);
                  const isSelected = selectedDays.has(dateStr);
                  const hasAssignments = dayData.count > 0;

                  return (
                    <div
                      key={dateStr}
                      className={`flex items-center space-x-1.5 p-1.5 rounded border transition-colors ${
                        isSelected
                          ? 'bg-sky-50 border-sky-300'
                          : isWeekendDay
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Checkbox
                        id={`day-export-${dateStr}`}
                        checked={isSelected}
                        onCheckedChange={() => handleDayToggle(dateStr)}
                        disabled={selectAllWeek}
                        className="h-3.5 w-3.5"
                      />
                      <Label
                        htmlFor={`day-export-${dateStr}`}
                        className={`text-xs cursor-pointer flex-1 ${isWeekendDay ? 'text-amber-700' : 'text-slate-700'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{dayName}</span>
                          <span className="text-[10px] opacity-75">{dayDisplay}</span>
                          {hasAssignments && (
                            <span className="text-[9px] opacity-60 mt-0.5">
                              {dayData.count} {dayData.count === 1 ? 'assignment' : 'assignments'}
                            </span>
                          )}
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selectedDays.size === 0 || selectedDepositIds.size === 0 || isExporting}
          >
            {isExporting
              ? 'Exporting...'
              : `Export (${selectedDepositIds.size} depot${selectedDepositIds.size !== 1 ? 's' : ''}, ${selectedDays.size} day${selectedDays.size !== 1 ? 's' : ''})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDayScheduleModal;
