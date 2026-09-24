'use client';

import React, { memo } from 'react';
import type { VehicleType } from '@/lib/types-config-api';

interface VehicleTypeCardProps {
  vehicleType: VehicleType;
  onEdit: () => void;
}

export const VehicleTypeCard = memo<VehicleTypeCardProps>(({
  vehicleType,
  onEdit
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-indigo-600 to-indigo-500" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {vehicleType.typeName || `Vehicle Type ${vehicleType.vehicleTypeId}`}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            {vehicleType.vehicleTypeId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{vehicleType.vehicleTypeId}</span>
              </span>
            )}
          </div>
          {(vehicleType.createdAt || vehicleType.createdBy || vehicleType.updatedAt) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
              {vehicleType.createdAt && (
                <span>Created: {new Date(vehicleType.createdAt).toLocaleDateString()}</span>
              )}
              {vehicleType.createdBy && (
                <span>by {vehicleType.createdBy}</span>
              )}
              {vehicleType.updatedAt && (
                <span>Updated: {new Date(vehicleType.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-blue-200 hover:shadow"
            onClick={onEdit}
            title="Edit vehicle type"
          >
            <i className="bi bi-pencil text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
});

VehicleTypeCard.displayName = 'VehicleTypeCard';


