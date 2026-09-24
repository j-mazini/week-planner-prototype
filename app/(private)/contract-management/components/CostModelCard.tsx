'use client';

import React, { memo } from 'react';
import type { CostModel } from '@/lib/types-config-api';

interface CostModelCardProps {
  costModel: CostModel;
  onEdit: () => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const CostModelCard = memo<CostModelCardProps>(({ costModel, onEdit }) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-xl px-4 py-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-amber-600 to-amber-500" aria-hidden />
      <div className="flex gap-4 pl-1">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {costModel.name ?? 'Unnamed'}
            </h3>
            {costModel.isAdhocCategory && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                Ad-Hoc
              </span>
            )}
          </div>

          {/* Formula (description) – prominent block */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Formula
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words min-h-[2.5rem]">
              {costModel.description && costModel.description.trim() !== ''
                ? costModel.description
                : '—'}
            </p>
          </div>

          {/* Payment Method – prominent block */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Payment Method
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words min-h-[2.5rem]">
              {costModel.paymentMethod && costModel.paymentMethod.trim() !== ''
                ? costModel.paymentMethod
                : '—'}
            </p>
          </div>

          {/* Created only */}
          {costModel.createdAt && (
            <p className="text-[11px] text-slate-400">
              Created: {formatDate(costModel.createdAt)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-700 transition hover:border-blue-300 hover:bg-slate-50 hover:shadow"
            onClick={onEdit}
            title="Edit cost model"
            aria-label="Edit cost model"
          >
            <i className="bi bi-pencil text-sm" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
});

CostModelCard.displayName = 'CostModelCard';

