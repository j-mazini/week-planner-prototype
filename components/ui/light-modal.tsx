"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  /** Overrides the default z-50 stacking, e.g. to render above another modal (like a form modal at z-[1050]). */
  zIndex?: number;
}

const sizeClasses = {
  xxs: "max-w-xs",
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function LightModal({
  show,
  onClose,
  title,
  children,
  size = "md",
  className,
  closeOnBackdropClick = true,
  showCloseButton = false,
  zIndex = 50,
}: LightModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      // Trigger animation after mount
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = "";
      }, 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [show]);

  if (!isMounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center p-4",
          "transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ zIndex }}
        onClick={() => closeOnBackdropClick && onClose()}
      >
        {/* Backdrop com mesmo estilo das páginas */}
        <div
          className={cn(
          "light-modal-backdrop fixed inset-0 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Modal */}
        <div
          className={cn(
            "logix-light-modal-panel relative z-50 w-full mx-4",
            "transition-all duration-300 ease-out",
            sizeClasses[size],
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="light-modal-header flex items-center justify-between p-6 border-b">
              {title ? (
                <h2 className="text-xl font-semibold">{title}</h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="light-modal-close p-2 transition-all duration-200 focus:outline-none focus:ring-2"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className={cn(
            "max-h-[80vh] overflow-y-auto",
            (size === "xs" || size === "xxs") ? "p-4" : "p-6"
          )}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
