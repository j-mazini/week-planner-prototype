import { memo } from 'react';
import type { ProcessedVendor } from '../utils';

interface MobileVendorCardProps {
  vendor: ProcessedVendor;
  onViewPerformance: (vendor: ProcessedVendor) => void;
}

export const MobileVendorCard = memo(function MobileVendorCard({
  vendor,
  onViewPerformance
}: MobileVendorCardProps) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm mb-0.5 truncate">
            {vendor.firstName} {vendor.lastName}
          </h3>
        </div>
        <button
          onClick={() => onViewPerformance(vendor)}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium ml-2 hover:bg-blue-700 transition-colors"
        >
          View
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-500">TW:</span>
          <span className="text-slate-800 font-medium">{vendor.avgTw}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">SPR:</span>
          <span className="text-slate-800 font-medium">{vendor.avgSpr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">SPOR-H:</span>
          <span className="text-slate-800 font-medium">{vendor.avgSporH}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">AFD:</span>
          <span className="text-slate-800 font-medium">{vendor.avgAfd}</span>
        </div>
      </div>
    </div>
  );
});

