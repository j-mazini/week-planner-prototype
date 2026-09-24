'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface LoopModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: { loopName: string; depositId: number; description?: string; customerId?: number; active?: boolean; isAdhocCategory?: boolean }) => Promise<void>;
  depositId?: number;
  loop?: { loopId?: number; loopName?: string; description?: string; customerId?: number; active?: boolean; isAdhocCategory?: boolean } | null;
}

const initialState = {
  loopName: '',
  description: '',
  active: true,
  isAdhocCategory: false,
};

const LoopModal: React.FC<LoopModalProps> = ({ show, onClose, onSave, depositId, loop }) => {
  const [formData, setFormData] = useState<typeof initialState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    if (show) {
      if (loop) {
        setFormData({
          loopName: loop.loopName || '',
          description: loop.description || '',
          active: loop.active !== undefined ? loop.active : true,
          isAdhocCategory: loop.isAdhocCategory || false,
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [show, loop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loopName.trim()) {
      alert('Loop name is required');
      return;
    }

    if (!depositId) {
      alert('Deposit ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        loopName: formData.loopName.trim(),
        depositId: depositId,
        description: formData.description.trim() || undefined,
        active: formData.active,
        isAdhocCategory: formData.isAdhocCategory,
      });
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
            <h5 className="modal-title">{loop ? 'Edit Loop' : 'Create Loop'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Loop Name *</label>
                <input
                  type="text"
                  name="loopName"
                  className="form-control"
                  value={formData.loopName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., LL1, LL2, LL3"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Optional description for this loop"
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="active">
                    Active
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isAdhocCategory"
                    id="isAdhocCategory"
                    checked={formData.isAdhocCategory}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="isAdhocCategory">
                    Is Ad-Hoc Category
                  </label>
                </div>
              </div>
              <p className="text-muted small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : loop ? 'Update Loop' : 'Create Loop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default LoopModal;


