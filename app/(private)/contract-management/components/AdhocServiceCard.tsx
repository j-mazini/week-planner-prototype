'use client';

import React, { memo } from 'react';
import type { AdhocService } from '@/lib/types-config-api';

interface AdhocServiceCardProps {
  adhocService: AdhocService;
  onEdit: () => void;
  servicePartnerName?: string | null;
}

export const AdhocServiceCard = memo<AdhocServiceCardProps>(({
  adhocService,
  onEdit,
  servicePartnerName,
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-pink-600 to-pink-500" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {adhocService.adhocName || `Adhoc Service ${adhocService.adhocServiceId}`}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            {adhocService.adhocServiceId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{adhocService.adhocServiceId}</span>
              </span>
            )}
            {adhocService.adhocReceivedPayment !== undefined && adhocService.adhocReceivedPayment !== null && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-cash-coin text-[10px]" />
                Received: <span className="font-medium">{adhocService.adhocReceivedPayment}</span>
              </span>
            )}
            {adhocService.adhocVendorPayment !== undefined && adhocService.adhocVendorPayment !== null && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-cash-stack text-[10px]" />
                Vendor: <span className="font-medium">{adhocService.adhocVendorPayment}</span>
              </span>
            )}
            {servicePartnerName && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-people text-[10px]" />
                Partner: <span className="font-medium">{servicePartnerName}</span>
              </span>
            )}
          </div>
          {(adhocService.createdAt || adhocService.createdBy || adhocService.updatedAt) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
              {adhocService.createdAt && (
                <span>Created: {new Date(adhocService.createdAt).toLocaleDateString()}</span>
              )}
              {adhocService.createdBy && (
                <span>by {adhocService.createdBy}</span>
              )}
              {adhocService.updatedAt && (
                <span>Updated: {new Date(adhocService.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-blue-200 hover:shadow"
            onClick={onEdit}
            title="Edit adhoc service"
          >
            <i className="bi bi-pencil text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
});

AdhocServiceCard.displayName = 'AdhocServiceCard';




