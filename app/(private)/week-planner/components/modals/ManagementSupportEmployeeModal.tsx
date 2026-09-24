"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect, type SelectItem } from '@/components/ui/searchable-select';
import { Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export interface ManagementSupportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { employeeId: number; employeeName: string; date: string; routeId: number }) => void;
  date: Date;
  routeId: number;
  routeName?: string;
}

const ManagementSupportEmployeeModal: React.FC<ManagementSupportEmployeeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  date,
  routeId,
  routeName,
}) => {
  const [employees] = useState<Array<{
    userId: number;
    fullName: string;
    email?: string;
    userTypeId?: number;
    userTypeName?: string;
  }>>([]);
  const [loading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [error, setError] = useState('');

  const employeeItems = React.useMemo<SelectItem[]>(() => {
    return (employees || []).map((e) => ({
      value: String(e.userId),
      label: e.fullName || `User ${e.userId}`,
      secondaryLabel: e.email ? `${e.email}${e.userTypeName ? ` - ${e.userTypeName}` : ''}` : e.userTypeName
    }));
  }, [employees]);

  const dateStr = formatDate(date, 'yyyy-mm-dd');
  const dateDisplay = formatDate(date, 'dd/mm/yyyy');

  const handleConfirm = () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    const employeeId = Number(selectedEmployeeId);
    if (!employeeId || !Number.isFinite(employeeId) || employeeId <= 0) {
      setError('Invalid employee selected');
      return;
    }

    const selectedEmployee = employees.find(e => e.userId === employeeId);
    if (!selectedEmployee) {
      setError('Selected employee not found');
      return;
    }

    onConfirm({
      employeeId,
      employeeName: selectedEmployee.fullName,
      date: dateStr,
      routeId,
    });

    // Reset form
    setSelectedEmployeeId('');
    setError('');
  };

  const handleClose = () => {
    setSelectedEmployeeId('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[80vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Associate Employee to Service</DialogTitle>
          <DialogDescription>
            Select a Manager or Admin employee to associate with this service for {dateDisplay}
            {routeName && ` - ${routeName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Loading employees...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Employee Selection */}
          {!loading && !error && (
            <div className="space-y-2">
              <Label htmlFor="employee-select">Employee *</Label>
              <SearchableSelect
                items={employeeItems}
                value={selectedEmployeeId}
                onValueChange={(value) => {
                  setSelectedEmployeeId(value);
                  setError('');
                }}
                placeholder="Select an employee"
                searchPlaceholder="Search employee..."
                title="Employees"
              />
              {error && selectedEmployeeId && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-slate-600 pt-2 border-t">
            <p><strong>Date:</strong> {dateDisplay}</p>
            {routeName && <p><strong>Route:</strong> {routeName}</p>}
            {!loading && employeeItems.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {employeeItems.length} {employeeItems.length === 1 ? 'employee' : 'employees'} available
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedEmployeeId || loading}>
            Associate Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagementSupportEmployeeModal;


