"use client";

import React from "react";
import { RotateCcw, Pencil, X } from "lucide-react";

interface DashboardGridToolbarProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onResetToDefault: () => void;
}

export function DashboardGridToolbar({
  editMode,
  onToggleEditMode,
  onResetToDefault,
}: DashboardGridToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <button
        type="button"
        onClick={onToggleEditMode}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${editMode
            ? "bg-amber-500 text-white hover:bg-amber-600"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          }
        `}
        aria-pressed={editMode}
        aria-label={editMode ? "Exit edit mode" : "Edit layout"}
      >
        {editMode ? (
          <>
            <X className="w-4 h-4" aria-hidden />
            Exit edit
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4" aria-hidden />
            Edit layout
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onResetToDefault}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
        aria-label="Reset to default layout"
      >
        <RotateCcw className="w-4 h-4" aria-hidden />
        Reset to default
      </button>
    </div>
  );
}
