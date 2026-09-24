'use client';

import React, { useEffect, useState } from 'react';
import { type AdhocCategory, type AdhocCategoryCreateDTO, type AdhocCategoryUpdateDTO } from '@/lib/types-config-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface AdhocCategoryModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: AdhocCategoryCreateDTO | AdhocCategoryUpdateDTO, id?: number) => Promise<void>;
  item: AdhocCategory | null;
}

const AdhocCategoryModal: React.FC<AdhocCategoryModalProps> = ({ show, onClose, onSave, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    if (show) {
      if (item) {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          active: item.active !== false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          active: true,
        });
      }
    }
  }, [show, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        active: formData.active,
      };
      await onSave(payload, item?.adhocCategoriesId);
      onClose();
    } catch (error) {
      console.error('Error saving adhoc category:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save category'}`);
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
            <h5 className="modal-title">{item ? 'Edit Adhoc Category' : 'Create Adhoc Category'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="name">Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter category name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Enter category description"
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  className="form-check-input"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label className="form-label text-slate-700 font-medium" htmlFor="active">Active</label>
              </div>

              {/* Informational fields (read-only) */}
              {item && (item.createdBy || item.createdAt || item.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {item.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{item.createdBy}</span>
                      </div>
                    )}
                    {item.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                    {item.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(item.updatedAt).toLocaleString()}</span>
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
                {isSubmitting ? 'Saving...' : (item ? 'Update Category' : 'Create Category')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default AdhocCategoryModal;
