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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vendor } from '@/lib/vendors';
import { formatDate, getWeekStart } from '../utils/dateUtils';

type DayOffEntry = {
  id: string;
  userId: number;
  date: string;
  reason?: string;
  notes?: string;
};

type DayOffModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { userId: number; dates: string[]; reason: string; notes: string }) => Promise<void>;
  vendors: Vendor[];
  currentDate: Date;
};

const DayOffModal: React.FC<DayOffModalProps> = ({
  open,
  onClose,
  onSave,
  vendors,
  currentDate,
}) => {
  const [userId, setUserId] = useState<string>('');
  const [mode, setMode] = useState<'single' | 'period'>('single');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Today and tomorrow (system date) - Day Off only allowed from tomorrow onwards
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = formatDate(today, 'yyyy-mm-dd');
  const tomorrowStr = formatDate(tomorrow, 'yyyy-mm-dd');

  // Initialize dates when modal opens - default to the start of the selected week
  useEffect(() => {
    if (open) {
      const weekStart = getWeekStart(currentDate);
      const weekStartStr = formatDate(weekStart, 'yyyy-mm-dd');
      setStartDate(weekStartStr);
      setEndDate(weekStartStr);
      setUserId('');
      setReason('');
      setNotes('');
      setError('');
      setMode('single');
    }
  }, [open, currentDate]);

  // Update end date when mode changes or start date changes
  useEffect(() => {
    if (mode === 'single' && startDate) {
      // In single mode, end date equals start date
      setEndDate(startDate);
    } else if (mode === 'period' && startDate) {
      // In period mode, end date should be start date + 1 day
      const start = new Date(startDate + 'T00:00:00');
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const endDateStr = formatDate(end, 'yyyy-mm-dd');
        setEndDate(endDateStr);
      }
    }
  }, [mode, startDate]);

  const expandDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(formatDate(current, 'yyyy-mm-dd'));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSave = async () => {
    setError('');

    if (!userId) {
      setError('Select a vendor to register the day off.');
      return;
    }

    if (!startDate) {
      setError('Select the start date of the day off.');
      return;
    }

    let dates: string[] = [];
    if (mode === 'single') {
      dates = [startDate];
    } else {
      if (!endDate) {
        setError('Enter the end date for the period.');
        return;
      }
      dates = expandDateRange(startDate, endDate);
      if (dates.length === 0) {
        setError('The specified period is invalid.');
        return;
      }
    }

    // Day Off cannot be created for today or past dates - only from tomorrow onwards
    const hasRetroactiveDate = dates.some((d) => d <= todayStr);
    if (hasRetroactiveDate) {
      setError('Day off cannot be created for today or past dates. Only dates from tomorrow onwards are allowed.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        userId: parseInt(userId, 10),
        dates,
        reason: reason.trim(),
        notes: notes.trim(),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'DAY_OFF_CANCELLED') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to register day off. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filter out inactive vendors, remove duplicates, and sort by name
  const eligibleVendors = useMemo(() => {
    const seenVendorIds = new Set<number>();
    const filtered = vendors.filter((vendor) => {
      if ((vendor as { status?: string }).status === 'inactive') {
        return false;
      }
      if (seenVendorIds.has(vendor.userId)) {
        return false;
      }
      seenVendorIds.add(vendor.userId);
      return true;
    });
    return [...filtered].sort((a, b) =>
      (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' })
    );
  }, [vendors]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
<DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-hidden !grid-rows-[auto_1fr_auto] p-0 flex flex-col bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9] border border-[#e5e7eb] shadow-[0_10px_50px_rgba(15,23,42,0.15)] backdrop-blur-xl rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        style={{
          maxWidth: 'min(100vw - 2rem, 32rem)',
          maxHeight: '90vh',
          width: 'calc(100vw - 2rem)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#22c55e]" />
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-900">Register Day Off</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Register a day off for a vendor. Choose a single day or a period.
          </DialogDescription>
        </DialogHeader>

        <div 
          className="space-y-4 overflow-y-auto flex-1 min-h-0 px-6 pb-5"
          style={{
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}
        >
          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label htmlFor="day-off-vendor" className="text-slate-700">Vendor</Label>
            <Select value={userId} onValueChange={setUserId} disabled={eligibleVendors.length === 0}>
              <SelectTrigger id="day-off-vendor" className="w-full min-w-0 bg-white/70 backdrop-blur border-slate-200 focus:ring-2 focus:ring-[#6366f1]">
                <SelectValue placeholder={eligibleVendors.length === 0 ? "No vendors available" : "Select a vendor"} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-3rem)] bg-white/95 backdrop-blur border-slate-200 shadow-lg">
                {eligibleVendors.map((vendor, index) => (
                  <SelectItem key={`vendor-${vendor.userId}-${index}`} value={String(vendor.userId)} className="break-words">
                    {vendor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-slate-700">Day Off Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('single')}
                className={`flex-1 border-slate-200 transition-colors ${
                  mode === 'single'
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Single Day
              </Button>
              <Button
                type="button"
                variant={mode === 'period' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('period')}
                className={`flex-1 border-slate-200 transition-colors ${
                  mode === 'period'
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Period
              </Button>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-off-start-date" className="text-slate-700">Start Date (from tomorrow onwards)</Label>
              <Input
                id="day-off-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={tomorrowStr}
                className="w-full bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
            <div className={`space-y-2 ${mode === 'single' ? 'opacity-50' : ''}`}>
              <Label htmlFor="day-off-end-date" className="text-slate-700">End Date</Label>
              <Input
                id="day-off-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={mode === 'single'}
                min={startDate}
                className="w-full bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="day-off-reason" className="text-slate-700">Reason</Label>
            <Input
              id="day-off-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Holiday"
              className="w-full bg-white/80 backdrop-blur border-slate-200 focus:ring-2 focus:ring-[#6366f1]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="day-off-notes" className="text-slate-700">Notes</Label>
            <Textarea
              id="day-off-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional context (optional)"
              className="w-full resize-none bg-[#fffef0] border-[#f5e6a3] focus:border-[#e8d48f] focus:ring-2 focus:ring-[#f5e6a3]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="w-full min-w-0 border-red-200 bg-red-50/90 text-red-900">
              <AlertDescription className="break-words overflow-wrap-anywhere">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 flex-shrink-0 border-t border-slate-200 pt-4 px-6 pb-6 mt-0 bg-white/70 backdrop-blur">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={saving}
            className="flex-1 sm:flex-initial min-w-0 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={saving || eligibleVendors.length === 0}
            className="flex-1 sm:flex-initial min-w-0 bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#b91c1c] text-white shadow-lg hover:shadow-red-400/40"
          >
            {saving ? 'Saving...' : 'Save Day Off'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayOffModal;
export type { DayOffEntry };

