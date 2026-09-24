'use client';

import React, { useEffect, useState } from 'react';
import { type VehicleType, type VehicleTypeCreateDTO, type VehicleTypeUpdateDTO } from '@/lib/types-config-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface VehicleTypeModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: VehicleTypeCreateDTO | VehicleTypeUpdateDTO, id?: number) => Promise<void>;
  vehicleType: VehicleType | null;
}

const VehicleTypeModal: React.FC<VehicleTypeModalProps> = ({ show, onClose, onSave, vehicleType }) => {
  const [formData, setFormData] = useState<{ typeName: string }>({ typeName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    if (show) {
      if (vehicleType) {
        setFormData({
          typeName: vehicleType.typeName || '',
        });
      } else {
        setFormData({ typeName: '' });
      }
    }
  }, [show, vehicleType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeName.trim()) {
      alert('Type name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ typeName: formData.typeName.trim() }, vehicleType?.vehicleTypeId);
      onClose();
    } catch (error) {
      console.error('Error saving vehicle type:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save vehicle type'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content" style={{ zIndex: 1057 }}>
          <div className="modal-header">
            <h5 className="modal-title">{vehicleType ? 'Edit Vehicle Type' : 'Create Vehicle Type'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="typeName">Type Name *</label>
                <input
                  type="text"
                  name="typeName"
                  id="typeName"
                  className="form-control"
                  value={formData.typeName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter vehicle type name"
                />
              </div>

              {/* Informational fields (read-only) */}
              {vehicleType && (vehicleType.createdBy || vehicleType.createdAt || vehicleType.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {vehicleType.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{vehicleType.createdBy}</span>
                      </div>
                    )}
                    {vehicleType.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(vehicleType.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    {vehicleType.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(vehicleType.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-muted small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : (vehicleType ? 'Update Vehicle Type' : 'Create Vehicle Type')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default VehicleTypeModal;


