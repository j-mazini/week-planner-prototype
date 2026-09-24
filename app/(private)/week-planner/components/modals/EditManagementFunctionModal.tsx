"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Loader2 } from 'lucide-react';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';

type EditManagementFunctionModalProps = {
  open: boolean;
  onClose: () => void;
  functionTitle: string;
  assignments: WeekPlannerRecord[];
  onSave: (newTitle: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

const EditManagementFunctionModal: React.FC<EditManagementFunctionModalProps> = ({
  open,
  onClose,
  functionTitle,
  assignments,
  onSave,
  onDelete,
}) => {
  const [newTitle, setNewTitle] = useState(functionTitle);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setNewTitle(functionTitle);
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [open, functionTitle]);

  const handleSave = async () => {
    if (!newTitle.trim()) {
      setError('Function name cannot be empty');
      return;
    }

    if (newTitle.trim() === functionTitle) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await onSave(newTitle.trim());
      onClose();
    } catch (err) {
      console.error('Error saving function:', err);
      setError(err instanceof Error ? err.message : 'Failed to save function');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting function:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete function');
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

  const assignmentsCount = assignments.length;
  const dates = Array.from(new Set(assignments.map(a => a.date))).sort();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Management Function</DialogTitle>
          <DialogDescription>
            Edit the function name or delete all assignments for this function.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Function Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Current Function:</span>
              <span className="text-sm font-semibold text-slate-900">{functionTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Assignments:</span>
              <span className="text-sm font-semibold text-slate-900">{assignmentsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Dates:</span>
              <span className="text-sm font-semibold text-slate-900">{dates.length} day(s)</span>
            </div>
          </div>

          {/* Edit Function Name */}
          {!showDeleteConfirm && (
            <div className="space-y-2">
              <Label htmlFor="function-name">Function Name</Label>
              <Input
                id="function-name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter function name"
                disabled={isSaving}
                className="w-full"
              />
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <Alert variant="destructive">
              <AlertDescription>
                Are you sure you want to delete all {assignmentsCount} assignment(s) for this function?
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!showDeleteConfirm ? (
            <>
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
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving || isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting || !newTitle.trim()}
                className="gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditManagementFunctionModal;

