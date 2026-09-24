import React from 'react';
import type { FrontendOperationRecord } from '../types/operations-management';

interface DeleteConfirmModalProps {
  show: boolean;
  item: FrontendOperationRecord | null;
  /** Quando true: apenas PATCH para NotAllocated (único registo do vendor no dia). Quando false: DELETE real. */
  logicalDeleteOnly?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  item,
  logicalDeleteOnly = false,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-backdrop-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-modal-pop-in">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Confirm deletion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            disabled={isDeleting}
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800">
                {logicalDeleteOnly
                  ? "This vendor’s only record for this day will be set to Not allocated (removed from the route). The row stays in the system."
                  : "This action cannot be undone. The record will be permanently removed from the system."}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
            {item.Name && (
              <div className="text-sm">
                <span className="font-semibold text-slate-700">Vendor:</span>
                <span className="ml-2 text-slate-600">{item.Name}</span>
              </div>
            )}
            {item.Route && (
              <div className="text-sm">
                <span className="font-semibold text-slate-700">Route:</span>
                <span className="ml-2 text-slate-600">{item.Route}</span>
              </div>
            )}
            {item.Date && (
              <div className="text-sm">
                <span className="font-semibold text-slate-700">Date:</span>
                <span className="ml-2 text-slate-600">{item.Date}</span>
              </div>
            )}
            {item.Vehicle && item.Vehicle !== 'NOVEHICLE' && (
              <div className="text-sm">
                <span className="font-semibold text-slate-700">Vehicle:</span>
                <span className="ml-2 text-slate-600">{item.Vehicle}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

