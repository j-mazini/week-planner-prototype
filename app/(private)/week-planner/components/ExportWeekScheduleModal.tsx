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
import { formatDate, getWeekDates, parseLocalDate } from '../utils/dateUtils';
import type { DepositWithRoutesDTO } from '@/lib/api/routes';
import { filterAllowedDeposits, isBaopDepositName } from '@/lib/allowedDeposits';

type ExportWeekScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (deposits: Array<{ depositId: number; depositName: string }>, meta?: { includeWeekends: boolean }) => void | Promise<void>;
  currentDate: Date;
  depositsWithRoutes?: DepositWithRoutesDTO[];
  showWeekends?: boolean;
};

const ExportWeekScheduleModal: React.FC<ExportWeekScheduleModalProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
  depositsWithRoutes = [],
  showWeekends = false,
}) => {
  const [selectedDepositIds, setSelectedDepositIds] = useState<Set<number>>(new Set());
  const [selectAllDepots, setSelectAllDepots] = useState(true);
  const [includeWeekends, setIncludeWeekends] = useState(showWeekends);
  const [error, setError] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const dateObj = currentDate instanceof Date ? currentDate : parseLocalDate(String(currentDate));
  const weekDates = getWeekDates(dateObj);
  const weekStart = formatDate(weekDates[0], 'dd/mm/yyyy');
  const weekEnd = formatDate(weekDates[includeWeekends ? 6 : 4], 'dd/mm/yyyy');

  // Only non-BAOP deposits selectable in export
  const deposits = useMemo(
    () => filterAllowedDeposits(depositsWithRoutes).filter((d) => !isBaopDepositName(d.depositName)),
    [depositsWithRoutes]
  );

  useEffect(() => {
    if (open) {
      setSelectAllDepots(true);
      setSelectedDepositIds(new Set(deposits.map((d) => d.depositId!).filter(Boolean)));
      setIncludeWeekends(showWeekends);
      setError('');
    }
  }, [open, deposits, showWeekends]);

  // Keep selectAllDepots in sync
  useEffect(() => {
    const allIds = deposits.map((d) => d.depositId!).filter(Boolean);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedDepositIds.has(id));
    setSelectAllDepots(allSelected);
  }, [selectedDepositIds, deposits]);

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
    if (deposits.length === 0) {
      setError('No depots available to export.');
      return;
    }
    if (selectedDepositIds.size === 0) {
      setError('Please select at least one depot.');
      return;
    }
    const toExport = deposits.filter((d) => d.depositId != null && selectedDepositIds.has(d.depositId));
    if (toExport.length === 0) {
      setError('Selected depot not available.');
      return;
    }
    try {
      setIsExporting(true);
      setError('');
      const depositsPayload = toExport.map((d) => ({ depositId: d.depositId!, depositName: d.depositName! }));
      await Promise.resolve(onConfirm(depositsPayload, { includeWeekends }));
      onClose();
    } catch (err) {
      console.error('Error exporting week PDF:', err);
      setError('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="sm:max-w-[420px]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Export Week Schedule</DialogTitle>
          <DialogDescription>
            Select one or more depots to export. One PDF will be generated per depot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Depot checkboxes — BAOP excluded */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Depots *</Label>
            <div className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200">
              <Checkbox
                id="select-all-depots-week"
                checked={selectAllDepots}
                onCheckedChange={handleSelectAllDepots}
              />
              <Label htmlFor="select-all-depots-week" className="text-sm font-medium cursor-pointer flex-1">
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
                      id={`depot-week-${id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleDepotToggle(id)}
                      disabled={selectAllDepots}
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={`depot-week-${id}`}
                      className="text-xs font-medium cursor-pointer flex-1 text-slate-700"
                    >
                      {d.depositName || `Depot ${id}`}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekends toggle */}
          <div className={`flex items-center space-x-2 p-2 rounded-md border transition-colors ${includeWeekends ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
            <Checkbox
              id="include-weekends-week"
              checked={includeWeekends}
              onCheckedChange={(v) => setIncludeWeekends(v === true)}
            />
            <Label htmlFor="include-weekends-week" className="text-sm font-medium cursor-pointer flex-1">
              Include weekends (Sat & Sun)
            </Label>
          </div>

          <p className="text-xs text-muted-foreground">
            Week: {weekStart} to {weekEnd}
          </p>
          {selectedDepositIds.size > 0 && (
            <p className="text-sm text-muted-foreground">
              Will generate {selectedDepositIds.size} PDF{selectedDepositIds.size !== 1 ? 's' : ''}: {
                deposits
                  .filter((d) => d.depositId != null && selectedDepositIds.has(d.depositId))
                  .map((d) => d.depositName)
                  .join(', ')
              }
            </p>
          )}

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
            disabled={deposits.length === 0 || selectedDepositIds.size === 0 || isExporting}
          >
            {isExporting
              ? `Exporting ${selectedDepositIds.size} PDF(s)...`
              : `Export Week (${selectedDepositIds.size} PDF${selectedDepositIds.size !== 1 ? 's' : ''})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportWeekScheduleModal;
