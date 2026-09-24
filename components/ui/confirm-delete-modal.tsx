"use client";

import React from "react";
import { LightModal } from "./light-modal";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <LightModal show={show} onClose={onClose} size="xxs">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl",
              "hover:bg-red-700 active:scale-[0.98] transition-all",
              "focus:outline-none focus:ring-2 focus:ring-red-500 ring-offset-2",
              "flex items-center justify-center gap-2 shadow-lg shadow-red-200",
              isDeleting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </LightModal>
  );
}
