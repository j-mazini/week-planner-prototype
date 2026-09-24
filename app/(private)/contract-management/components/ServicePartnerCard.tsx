'use client';

import React, { memo } from 'react';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { ServicePartnerBadge } from '@/components/service-partner-badge';

interface ServicePartnerCardProps {
  servicePartner: ServicePartnerDTO;
  onEdit: (sp: ServicePartnerDTO) => void;
  onDelete: (sp: ServicePartnerDTO) => void;
}

export const ServicePartnerCard = memo<ServicePartnerCardProps>(({ servicePartner, onEdit, onDelete }) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-blue-500" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {servicePartner.partnerName || `Partner ${servicePartner.servicePartnerId}`}
            </h3>
            <ServicePartnerBadge partnerName={servicePartner.partnerName} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <i className="bi bi-hash text-[10px]" />
              ID: <span className="font-medium">{servicePartner.servicePartnerId}</span>
            </span>
            {servicePartner.companyId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-building text-[10px]" />
                Company: <span className="font-medium">
                  {servicePartner.companyName ?? `#${servicePartner.companyId}`}
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
            {servicePartner.createdAt && (
              <span>Created: {new Date(servicePartner.createdAt).toLocaleDateString()}</span>
            )}
            {servicePartner.createdBy && (
              <span>by {servicePartner.createdBy}</span>
            )}
            {servicePartner.updatedAt && (
              <span>Updated: {new Date(servicePartner.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(servicePartner)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit service partner"
            aria-label="Edit service partner"
          >
            <i className="bi bi-pencil text-xs" />
          </button>
          <button
            onClick={() => onDelete(servicePartner)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete service partner"
            aria-label="Delete service partner"
          >
            <i className="bi bi-trash text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
});

ServicePartnerCard.displayName = 'ServicePartnerCard';
