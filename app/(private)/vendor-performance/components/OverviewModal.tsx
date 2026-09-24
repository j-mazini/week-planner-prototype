"use client";

import { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { StatusBadge } from '@/components/status-badge';
import type { OverviewDTO } from '@/lib/vendor-performance-api';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface OverviewModalProps {
  show: boolean;
  operations: Array<OverviewDTO | Record<string, unknown>>;
  onClose: () => void;
}

interface OperationRow {
  operationDate: string;
  operationId: string | number;
  routeName: string;
  status: string;
  statusType: 'completed' | 'working' | 'default';
  totalStops: string | number;
  sporh: string;
  tw: string;
  vehiclePlate: string;
  vehicleModel: string;
}

const OperationTableRow = memo(({ operation, index }: { operation: OperationRow; index: number }) => {
  const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  
  return (
    <tr className={`${rowBgColor} border-b border-gray-200 hover:bg-gray-100 transition-colors`}>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.operationDate}</td>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.operationId}</td>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.routeName}</td>
      <td className="px-4 py-3 text-sm">
        <StatusBadge status={operation.statusType}>{operation.status}</StatusBadge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.totalStops === '--:--' ? '--:--' : operation.totalStops}</td>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.sporh}</td>
      <td className="px-4 py-3 text-sm text-slate-800">{operation.tw}</td>
      <td className="px-4 py-3 text-sm text-slate-800">
        <div className="flex flex-col">
          <span>{operation.vehiclePlate}</span>
          {operation.vehicleModel && (
            <span className="text-xs text-slate-500 mt-0.5">{operation.vehicleModel}</span>
          )}
        </div>
      </td>
    </tr>
  );
});

OperationTableRow.displayName = 'OperationTableRow';

export const OverviewModal = memo(function OverviewModal({ 
  show, 
  operations, 
  onClose 
}: OverviewModalProps) {
  const processedOperations = useMemo(() => {
    return operations.map((op, idx) => {
      const operation = op as Record<string, unknown>;
      
      const operationDate = (operation.operationDate as string) || (operation.date as string) || '--:--';
      const operationId = (operation.operationId as number) || '--:--';
      const route = operation.route as { routeName?: string } | undefined;
      const routeName = route?.routeName || (operation.routeName as string | undefined) || '--:--';
      const status = (operation.status as string) || '--:--';
      const dailyMetrics = operation.dailyMetrics as { totalStops?: number; sporh?: number } | undefined;
      const totalStops = dailyMetrics?.totalStops ?? (operation.totalStops as number | undefined) ?? '--:--';
      const sporh = dailyMetrics?.sporh ?? (operation.sporh as number | undefined);
      const timeWindows = operation.timeWindows as { percentageOnTime?: number } | undefined;
      const percentageOnTime = timeWindows?.percentageOnTime ?? (operation.percentageOnTime as number | undefined);
      const vehicle = operation.vehicle as { vehicleRegistrationPlate?: string; vehicleModel?: string } | undefined;
      
      const displaySporh = sporh !== undefined && sporh !== null ? sporh.toFixed(1) : '--:--';
      const displayTw = percentageOnTime !== undefined && percentageOnTime !== null ? `${percentageOnTime.toFixed(1)}%` : '--:--';
      const statusType = status === 'Completed' || status === 'DELIVERED' ? 'completed' : 
                        status === 'In Progress' || status === 'Working' ? 'working' : 
                        'default';
      
      return {
        operationDate,
        operationId,
        routeName,
        status,
        statusType,
        totalStops,
        sporh: displaySporh,
        tw: displayTw,
        vehiclePlate: vehicle?.vehicleRegistrationPlate || '--:--',
        vehicleModel: vehicle?.vehicleModel || '',
        key: `${operationId}-${idx}`
      } as OperationRow & { key: string };
    });
  }, [operations]);

  // Control body overflow when modal is open
  useBodyScrollLock(show);

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const modalContent = (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-[1050]"
            onClick={onClose}
          />
          <div
            className="fixed inset-0 z-[1055] overflow-auto flex items-start justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-8 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h5 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Operations Overview ({operations.length})
                </h5>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-6">
                {processedOperations.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <p className="text-sm">No operations found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-blue-600">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Operation ID</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Route</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Stops</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">SPOR-H</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">TW %</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Vehicle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedOperations.map((operation, index) => (
                          <OperationTableRow key={operation.key} operation={operation} index={index} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
});

