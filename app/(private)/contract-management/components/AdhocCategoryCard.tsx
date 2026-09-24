'use client';

import React, { memo } from 'react';
import type { AdhocCategory } from '@/lib/types-config-api';

interface AdhocCategoryCardProps {
  adhocCategory: AdhocCategory;
  onEdit: () => void;
  onDelete?: () => void;
}

export const AdhocCategoryCard = memo<AdhocCategoryCardProps>(({
  adhocCategory,
  onEdit,
  onDelete
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-blue-500" aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {adhocCategory.name || `Category ${adhocCategory.adhocCategoriesId}`}
            </h3>
            {adhocCategory.active === false && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded">Inactive</span>
            )}
            {adhocCategory.active !== false && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-600 rounded">Active</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-1 line-clamp-1">
            {adhocCategory.description || 'No description provided'}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
            {adhocCategory.adhocCategoriesId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{adhocCategory.adhocCategoriesId}</span>
              </span>
            )}
            {adhocCategory.createdAt && (
              <span>Created: {new Date(adhocCategory.createdAt).toLocaleDateString()}</span>
            )}
            {adhocCategory.createdBy && (
              <span>by {adhocCategory.createdBy}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-blue-200 hover:shadow"
            onClick={onEdit}
            title="Edit category"
          >
            <i className="bi bi-pencil text-sm" />
          </button>
          {onDelete && (
            <button
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-red-600 transition hover:border-red-200 hover:shadow"
              onClick={onDelete}
              title="Delete category"
            >
              <i className="bi bi-trash text-sm" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

AdhocCategoryCard.displayName = 'AdhocCategoryCard';
