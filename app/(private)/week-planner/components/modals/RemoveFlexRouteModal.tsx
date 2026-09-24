"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import type { Route } from '@/lib/api/routes';

interface RemoveFlexRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (routeId: number) => void;
  route: Route | null;
  isLoading?: boolean;
}

const RemoveFlexRouteModal: React.FC<RemoveFlexRouteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  route,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    if (route?.routeId) {
      onConfirm(route.routeId);
      // Modal will close after onConfirm completes
    }
  };

  if (!route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Remove Flex Route
          </DialogTitle>
          <DialogDescription>
            Do you want to remove this flex route from the planner?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Route:</strong>
            </p>
            <p className="text-base font-semibold text-slate-900">
              {route.routeName || `Route ${route.routeId}`}
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> This will remove the flex route from the current planner view. 
              You can add it back later using the &quot;Add Flex Route&quot; button if needed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            {isLoading ? 'Removing...' : 'Remove from Planner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFlexRouteModal;

