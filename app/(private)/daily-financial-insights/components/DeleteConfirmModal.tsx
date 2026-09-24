import React from 'react';
import { InsightRow } from '../types';
import { formatDateForDisplay } from '../utils';
import { AlertTriangle, X, Info, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  row: InsightRow | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = React.memo(({
  show,
  row,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!show || !row) return null;

  const formattedDate = formatDateForDisplay(row.date);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[1040] backdrop-blur-sm transition-opacity duration-200" 
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the register for{' '}
              <strong className="text-gray-900">{row.vrm}</strong> on{' '}
              <strong className="text-gray-900">{formattedDate}</strong>?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Vendor</span>
                  <span className="text-sm font-medium text-gray-900">{row.courier}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Route</span>
                  <span className="text-sm font-medium text-gray-900">{row.route}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Date</span>
                  <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Vehicle</span>
                  <span className="text-sm font-medium text-gray-900">{row.vrm}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Register
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

