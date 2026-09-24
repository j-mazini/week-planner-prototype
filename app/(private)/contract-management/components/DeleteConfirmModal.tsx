import React, { memo } from 'react';
import type { Route } from './RouteTable';

interface DeleteConfirmModalProps {
  show: boolean;
  route: Route | null;
  loopId: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = memo(({
  show,
  route,
  loopId,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!show || !route) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1040] fade show" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none', zIndex: 1050 }}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="deleteConfirmModalLabel"
        aria-hidden={!show}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title" id="deleteConfirmModalLabel">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                Confirm Deletion
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
                disabled={isDeleting}
              />
            </div>
            <div className="modal-body pt-3">
              <p className="mb-3">
                Are you sure you want to delete this route from loop <strong>{loopId.toUpperCase()}</strong>?
              </p>
              <div className="mb-2">
                <small className="text-muted">
                  Vendor: {route.vendor}
                </small>
              </div>
              <div className="alert alert-warning mt-3 mb-0" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                This action cannot be undone.
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Deleting...
                  </>
                  ) : (
                    <>
                      <i className="bi bi-trash-fill me-2"></i>
                      Delete
                    </>
                  )
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;

