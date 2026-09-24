"use client";

import React from "react";
import { weekPlannerOperationsStyles } from "../styles";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export const BulkSubmitWarningModal = React.memo(function BulkSubmitWarningModal({
  open,
  title = "Submission blocked",
  message,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 animate-backdrop-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-submit-warning-title"
      aria-describedby="bulk-submit-warning-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-slate-200/80 overflow-hidden animate-modal-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-8 pt-10 pb-8 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 shadow-inner ring-1 ring-amber-200/60"
            aria-hidden
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2
            id="bulk-submit-warning-title"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">Submit cannot continue until this is resolved.</p>
        </div>

        <div className="mx-6 mb-8 rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-left">
          <p
            id="bulk-submit-warning-desc"
            className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap"
          >
            {message}
          </p>
        </div>

        <div className="flex justify-center border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`${weekPlannerOperationsStyles.modalButton} ${weekPlannerOperationsStyles.modalButtonPrimary} w-full sm:w-auto min-w-[140px] text-center shadow-sm`}
          >
            Understood
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
});
