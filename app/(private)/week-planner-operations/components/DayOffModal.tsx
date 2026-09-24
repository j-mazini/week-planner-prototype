"use client";

import React, { useState, useEffect } from 'react';
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
import { formatDate } from '../utils/dateUtils';

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
  const [userId, setVendorId] = useState<string>('');
  const [mode, setMode] = useState<'single' | 'period'>('single');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Initialize dates when modal opens
  useEffect(() => {
    if (open) {
      const dateStr = formatDate(currentDate, 'yyyy-mm-dd');
      setStartDate(dateStr);
      setEndDate(dateStr);
      setVendorId('');
      setReason('');
      setNotes('');
      setError('');
      setMode('single');
    }
  }, [open, currentDate]);

  // Update end date when start date changes in single mode
  useEffect(() => {
    if (mode === 'single' && startDate) {
      setEndDate(startDate);
    } else if (mode === 'period' && startDate && (!endDate || endDate < startDate)) {
      setEndDate(startDate);
    }
  }, [mode, startDate, endDate]);

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

    setSaving(true);
    try {
      await onSave({
        userId: parseInt(userId, 10),
        dates,
        reason: reason.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register day off. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const eligibleVendors = vendors.filter(d => d.status !== 'inactive');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Day Off</DialogTitle>
          <DialogDescription>
            Register a day off for a vendor. You can select a single day or a period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vendor Selection */}
          <div>
            <Label htmlFor="day-off-vendor">Vendor</Label>
            <Select value={userId} onValueChange={setVendorId} disabled={eligibleVendors.length === 0}>
              <SelectTrigger id="day-off-vendor">
                <SelectValue placeholder={eligibleVendors.length === 0 ? "No vendors available" : "Select a vendor"} />
              </SelectTrigger>
              <SelectContent>
                {[...eligibleVendors]
                  .sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? '', undefined, { sensitivity: 'base' }))
                  .map((vendor, index) => (
                  <SelectItem key={`${vendor.userId}-${vendor.userId}-${index}`} value={String(vendor.userId)}>
                    {vendor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-2">
            <Label>Day Off Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('single')}
                className="flex-1"
              >
                Single Day
              </Button>
              <Button
                type="button"
                variant={mode === 'period' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('period')}
                className="flex-1"
              >
                Period
              </Button>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day-off-start-date">Start Date</Label>
              <Input
                id="day-off-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={mode === 'single' ? 'opacity-50' : ''}>
              <Label htmlFor="day-off-end-date">End Date</Label>
              <Input
                id="day-off-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={mode === 'single'}
                min={startDate}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="day-off-reason">Reason</Label>
            <Input
              id="day-off-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Sick leave, Holiday"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="day-off-notes">Notes</Label>
            <Textarea
              id="day-off-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional context (optional)"
              className="bg-[#fffef0] border-[#f5e6a3] focus:border-[#e8d48f] focus:ring-[#f5e6a3]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || eligibleVendors.length === 0}>
            {saving ? 'Saving...' : 'Save Day Off'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayOffModal;
export type { DayOffEntry };



