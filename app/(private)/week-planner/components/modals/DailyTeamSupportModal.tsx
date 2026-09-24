"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect, type SelectItem as SearchableSelectItem } from '@/components/ui/searchable-select';
import type { Vendor } from '@/lib/vendors';
import type { Route } from '@/lib/api/routes';
import { formatDate } from '../../utils/dateUtils';

export interface DailyTeamSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { userId: number; date: string; routeId: number }) => void;
  vendors: Vendor[];
  date: Date;
  routeId: number;
  routeName?: string;
  availableRoutes?: Route[];
  title?: string;
  description?: string;
  confirmText?: string;
}

const DailyTeamSupportModal: React.FC<DailyTeamSupportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vendors,
  date,
  routeId,
  routeName,
  availableRoutes,
  title,
  description,
  confirmText,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routeId > 0 ? String(routeId) : '');
  const [error, setError] = useState<string>('');

  const vendorItems = React.useMemo<SearchableSelectItem[]>(() => {
    return (vendors || [])
      .filter((d) => d.userId && d.userId > 0)
      .map((v) => ({
        value: String(v.userId),
        label: v.fullName || `Vendor ${v.userId}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [vendors]);

  const routeItems = React.useMemo<SearchableSelectItem[]>(() => {
    return (availableRoutes || [])
      .filter((r) => r.routeId && r.routeId > 0)
      .map((r) => ({
        value: String(r.routeId),
        label: r.routeName || `Route ${r.routeId}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [availableRoutes]);

  const dateStr = formatDate(date, 'yyyy-mm-dd');
  const dateDisplay = formatDate(date, 'dd/mm/yyyy');

  const handleConfirm = () => {
    if (!selectedUserId) {
      setError('Please select a vendor');
      return;
    }

    const userId = Number(selectedUserId);
    if (!userId || !Number.isFinite(userId) || userId <= 0) {
      setError('Invalid vendor selected');
      return;
    }

    const finalRouteId = selectedRouteId ? Number(selectedRouteId) : routeId;
    if (!finalRouteId || !Number.isFinite(finalRouteId) || finalRouteId <= 0) {
      setError('Please select a route');
      return;
    }

    onConfirm({
      userId,
      date: dateStr,
      routeId: finalRouteId,
    });

    // Reset form
    setSelectedUserId('');
    setSelectedRouteId(routeId > 0 ? String(routeId) : '');
    setError('');
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedRouteId(routeId > 0 ? String(routeId) : '');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title || 'Add Daily Team Support'}</DialogTitle>
          <DialogDescription>
            {description || (
              <>
                Add a team support assignment for {dateDisplay}
                {routeName && ` - ${routeName}`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableRoutes && availableRoutes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="route-select">Route *</Label>
              <SearchableSelect
                items={routeItems}
                value={selectedRouteId}
                onValueChange={(value) => {
                  setSelectedRouteId(value);
                  setError('');
                }}
                placeholder="Select a route"
                searchPlaceholder="Search route..."
                title="Routes"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vendor-select">Vendor *</Label>
            <SearchableSelect
              items={vendorItems}
              value={selectedUserId}
              onValueChange={(value) => {
                setSelectedUserId(value);
                setError('');
              }}
              placeholder="Select a vendor"
              searchPlaceholder="Search vendor..."
              title="Vendors"
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          <div className="text-sm text-slate-600">
            <p><strong>Date:</strong> {dateDisplay}</p>
            {routeName && (!availableRoutes || availableRoutes.length === 0) && (
              <p><strong>Route:</strong> {routeName}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {confirmText || 'Add Team Support'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyTeamSupportModal;




