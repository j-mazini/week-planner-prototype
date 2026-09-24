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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, getWeekDates } from '../utils/dateUtils';

type DayScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedDate: string) => void;
  currentDate: Date;
};

const DayScheduleModal: React.FC<DayScheduleModalProps> = ({
  open,
  onClose,
  onConfirm,
  currentDate,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Get week dates for the current week
  const weekDates = getWeekDates(currentDate);
  
  // Day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize with current day when modal opens
  useEffect(() => {
    if (open) {
      const today = new Date();
      const currentDayIndex = today.getDay();
      // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      const adjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
      setSelectedDayIndex(adjustedIndex);
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedDayIndex < 0 || selectedDayIndex >= weekDates.length) {
      setError('Please select a valid day of the week.');
      return;
    }

    const selectedDate = formatDate(weekDates[selectedDayIndex], 'yyyy-mm-dd');
    onConfirm(selectedDate);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Generate Day Schedule</DialogTitle>
          <DialogDescription>
            Select a day of the week to generate the schedule for that day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {/* Day Selection */}
          <div>
            <Label className="pb-3" htmlFor="day-schedule-select">Day of the Week</Label>
            <Select 
              value={String(selectedDayIndex)} 
              onValueChange={(value) => setSelectedDayIndex(Number(value))}
            >
              <SelectTrigger id="day-schedule-select">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {weekDates.map((date, index) => {
                  const dateStr = formatDate(date, 'dd/mm/yyyy');
                  const dayName = dayNames[index];
                  return (
                    <SelectItem key={index} value={String(index)}>
                      {dayName} ({dateStr})
                    </SelectItem>
                  );
                })}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Generate Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayScheduleModal;

