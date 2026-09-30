"use client";

import React, { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  title?: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Snackbar({
  message,
  title,
  type = "success",
  onClose,
  duration = 5000,
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(show);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icon = type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill";
  const accentStyles =
    type === "success" ? "border-l-emerald-500" : "border-l-red-500";

  return (
    <div
      role="alert"
      className={`fixed top-6 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div
        className={`flex items-start gap-4 rounded-xl border-l-4 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md px-4 py-3.5 ${accentStyles}`}
      >
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
            type === "success" ? "bg-emerald-500/12" : "bg-red-500/12"
          }`}
        >
          <i
            className={`bi ${icon} text-base ${
              type === "success" ? "text-emerald-600" : "text-red-600"
            }`}
            aria-hidden
          />
        </span>
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p className="text-sm font-semibold tracking-tight text-gray-900">
              {title}
            </p>
          )}
          <p
            className={`text-sm text-gray-600 ${title ? "mt-0.5" : ""} leading-snug`}
          >
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 -m-1.5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close"
        >
          <i className="bi bi-x text-lg" />
        </button>
      </div>
    </div>
  );
}
