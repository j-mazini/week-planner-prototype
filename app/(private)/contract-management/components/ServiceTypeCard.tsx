'use client';

import React, { memo } from 'react';
import type { ServiceTypeDTO } from '@/lib/serviceTypes';
import { ServicePartnerBadge } from '@/components/service-partner-badge';

interface ServiceTypeCardProps {
  serviceType: ServiceTypeDTO;
  depositName?: string;
  servicePartnerName?: string;
}

export const ServiceTypeCard = memo<ServiceTypeCardProps>(({
  serviceType,
  depositName,
  servicePartnerName,
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${
        serviceType.active 
          ? 'bg-gradient-to-b from-emerald-600 to-emerald-500' 
          : 'bg-gradient-to-b from-rose-600 to-rose-500'
      }`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {serviceType.name || `Service Type ${serviceType.serviceTypeId}`}
            </h3>
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                serviceType.active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {serviceType.active ? 'Active' : 'Inactive'}
            </span>
            {serviceType.servicePartnerId && (
              <ServicePartnerBadge partnerName={servicePartnerName ?? null} />
            )}
          </div>
          {serviceType.description && (
            <p className="text-xs text-slate-600 mb-1.5 line-clamp-1">{serviceType.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            {serviceType.serviceTypeId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{serviceType.serviceTypeId}</span>
              </span>
            )}
            {serviceType.depositId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-building text-[10px]" />
                Deposit: <span className="font-medium">{depositName || `#${serviceType.depositId}`}</span>
              </span>
            )}
            {serviceType.servicePartnerId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-people text-[10px]" />
                Service Partner: <span className="font-medium">{servicePartnerName || `#${serviceType.servicePartnerId}`}</span>
              </span>
            )}
          </div>
          {(serviceType.createdAt || serviceType.createBy || serviceType.updatedAt) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
              {serviceType.createdAt && (
                <span>Created: {new Date(serviceType.createdAt).toLocaleDateString()}</span>
              )}
              {serviceType.createBy && (
                <span>by {serviceType.createBy}</span>
              )}
              {serviceType.updatedAt && (
                <span>Updated: {new Date(serviceType.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ServiceTypeCard.displayName = 'ServiceTypeCard';


