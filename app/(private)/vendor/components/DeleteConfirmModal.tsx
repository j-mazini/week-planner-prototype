'use client';

import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Vendor } from '@/lib/vendors-api';
import { vendorStyles } from '../styles';

interface DeleteConfirmModalProps {
  show: boolean;
  vendor: Vendor | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeactivating?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = memo(({
  show,
  vendor,
  onClose,
  onConfirm,
  isDeactivating = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Avoid rendering on server / before hydration; and don't render unless open
  if (!mounted || !show || !vendor) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={vendorStyles.modalBackdrop}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className={vendorStyles.modalContainer}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="deleteConfirmModalLabel"
        aria-hidden={!show}
        aria-modal="true"
      >
        <div 
          className={vendorStyles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={vendorStyles.modalHeader}>
            <h5 className={vendorStyles.modalHeaderTitle} id="deleteConfirmModalLabel">
              <i className="bi bi-person-x-fill text-[#ffc107]"></i>
              <span>Confirm Deactivation</span>
            </h5>
            <button 
              type="button" 
              className={vendorStyles.modalHeaderClose}
              onClick={onClose}
              aria-label="Close"
              disabled={isDeactivating}
            >
              <i className={vendorStyles.modalHeaderCloseIcon}></i>
            </button>
          </div>

          {/* Modal Body */}
          <div className={vendorStyles.modalBody}>
            <p className={vendorStyles.modalBodyText}>
              Are you sure you want to deactivate the vendor{' '}
              <strong className={vendorStyles.modalBodyTextStrong}>{vendor.firstName} {vendor.lastName}</strong>?
            </p>
            {vendor.email && (
              <p className={vendorStyles.modalBodyTextSmall}>
                Email: {vendor.email}
              </p>
            )}
            <div className={vendorStyles.modalBodyAlert} role="alert">
              <div className={vendorStyles.modalBodyAlertContent}>
                <i className="bi bi-info-circle"></i>
                <span className={vendorStyles.modalBodyAlertText}>The user will be set as inactive (active=false).</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={vendorStyles.modalFooter}>
            <button 
              type="button" 
              className={`${vendorStyles.modalButton} ${vendorStyles.modalButtonCancel}`}
              onClick={onClose}
              disabled={isDeactivating}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className={`${vendorStyles.modalButton} ${vendorStyles.modalButtonDelete}`}
              onClick={onConfirm}
              disabled={isDeactivating}
            >
              {isDeactivating ? (
                <>
                  <div className={vendorStyles.modalButtonDeleteSpinner}></div>
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-person-x-fill"></i>
                  <span>Deactivate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  , document.body);
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;
