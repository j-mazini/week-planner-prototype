import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import VrnPlate from '@/components/vrn-plate';
import { vehiclesStyles } from '../styles';

interface DeleteVehicleModalProps {
  isOpen: boolean;
  vehicleVrn: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({
  isOpen,
  vehicleVrn,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={vehiclesStyles.modalBackdrop}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={vehiclesStyles.deleteModalContainer}>
        <div className={vehiclesStyles.deleteModalContent}>
          {/* Header */}
          <div className={vehiclesStyles.modalHeader}>
            <h5 className={vehiclesStyles.modalHeaderTitle}>
              Confirm Delete
            </h5>
            <button 
              type="button" 
              className={vehiclesStyles.modalHeaderClose}
              aria-label="Close" 
              onClick={onClose}
              disabled={isDeleting}
            >
              <X className={vehiclesStyles.modalHeaderCloseIcon} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className={vehiclesStyles.modalBodyText}>
              Are you sure you want to delete the vehicle with VRN <VrnPlate vrn={vehicleVrn} size="sm" />?
            </p>
            <p className={vehiclesStyles.modalBodyTextSmall}>This action cannot be undone.</p>
          </div>

          {/* Footer */}
          <div className={vehiclesStyles.modalFooter}>
            <button 
              type="button" 
              className={`${vehiclesStyles.modalButton} ${vehiclesStyles.modalButtonCancel}`}
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className={`${vehiclesStyles.modalButton} ${vehiclesStyles.modalButtonDelete}`}
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className={vehiclesStyles.modalButtonSpinner}></div>
                  Deleting...
                </>
              ) : (
                <>
                  <i className={vehiclesStyles.modalButtonDeleteIcon}></i>
                  Delete Vehicle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
