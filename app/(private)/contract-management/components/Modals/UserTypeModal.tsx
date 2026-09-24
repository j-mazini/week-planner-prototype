'use client';

import React, { useEffect, useState } from 'react';
import { type UserType, type UserTypeCreateDTO, type UserTypeUpdateDTO } from '@/lib/types-config-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface UserTypeModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: UserTypeCreateDTO | UserTypeUpdateDTO, id?: number) => Promise<void>;
  userType: UserType | null;
}

const UserTypeModal: React.FC<UserTypeModalProps> = ({ show, onClose, onSave, userType }) => {
  const [formData, setFormData] = useState<{ nameType: string }>({ nameType: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    if (show) {
      if (userType) {
        setFormData({
          nameType: userType.nameType || '',
        });
      } else {
        setFormData({ nameType: '' });
      }
    }
  }, [show, userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameType.trim()) {
      alert('Name type is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ nameType: formData.nameType.trim() }, userType?.userTypeId);
      onClose();
    } catch (error) {
      console.error('Error saving user type:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save user type'}`);
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
            <h5 className="modal-title">{userType ? 'Edit User Type' : 'Create User Type'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="nameType">Name Type *</label>
                <input
                  type="text"
                  name="nameType"
                  id="nameType"
                  className="form-control"
                  value={formData.nameType}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter user type name"
                />
              </div>

              <p className="text-muted small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : (userType ? 'Update User Type' : 'Create User Type')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default UserTypeModal;


