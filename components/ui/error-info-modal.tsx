"use client";

import React from "react";
import { LightModal } from "./light-modal";
import { XCircle } from "lucide-react";

interface ErrorInfoModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  closeLabel?: string;
}

export function ErrorInfoModal({
  show,
  onClose,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  closeLabel = "OK",
}: ErrorInfoModalProps) {
  return (
    <LightModal show={show} onClose={onClose} size="xxs" zIndex={1100}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="w-full pt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ring-offset-2 shadow-lg shadow-red-200"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </LightModal>
  );
}
