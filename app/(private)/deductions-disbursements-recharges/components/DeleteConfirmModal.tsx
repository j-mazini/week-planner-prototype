import React, { memo } from 'react';
import { IconRenderer } from './IconRenderer';
import type { DisplayDeduction } from '../types';

interface DeleteConfirmModalProps {
  show: boolean;
  item: DisplayDeduction | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  formatCurrency: (val: number | string | null | undefined) => string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = memo(({
  show,
  item,
  onClose,
  onConfirm,
  isDeleting = false,
  formatCurrency,
}) => {
  if (!show || !item) return null;

  if (!show || !item) return null;

  return (
    <>
      {/* Modal with backdrop */}
      <div 
        className="fixed inset-0 z-[1050] overflow-y-auto bg-black/60 backdrop-blur-sm"
      >
      <div 
          className="flex min-h-full items-center justify-center px-[10%] py-4"
      >
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h5 className="flex items-center gap-2 text-lg font-semibold text-gray-900" id="deleteModalLabel">
                <IconRenderer iconName="bi-exclamation-triangle-fill" className="text-red-500 text-xl" />
                Confirm Delete
              </h5>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center" 
                onClick={onClose}
                aria-label="Close"
                disabled={isDeleting}
              >
                <IconRenderer iconName="bi-x-lg" className="text-2xl" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="mb-3 text-gray-700">Are you sure you want to delete this deduction? This action cannot be undone.</p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <small className="text-gray-500 block mb-1 text-xs">Reference Number</small>
                    <strong className="block text-gray-900">{item.id || 'N/A'}</strong>
                  </div>
                  <div className="col-span-1">
                    <small className="text-gray-500 block mb-1 text-xs">Type</small>
                    <strong className="block text-gray-900">{item.type || 'N/A'}</strong>
                  </div>
                  <div className="col-span-1">
                    <small className="text-gray-500 block mb-1 text-xs">Amount</small>
                    <strong className="block text-red-600">{formatCurrency(item.amount)}</strong>
                  </div>
                  {item.courierName && (
                    <div className="col-span-2">
                      <small className="text-gray-500 block mb-1 text-xs">Vendor</small>
                      <strong className="block text-gray-900">{item.courierName}</strong>
                    </div>
                  )}
                  {item.dateOfIncident && (
                    <div className="col-span-2">
                      <small className="text-gray-500 block mb-1 text-xs">Date</small>
                      <strong className="block text-gray-900">{item.dateOfIncident}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                type="button" 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <IconRenderer iconName="bi-trash" />
                    <span>Delete</span>
                  </>
                )}
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

