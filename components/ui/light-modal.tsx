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
      <style dangerouslySetInnerHTML={{__html: `
        .light-modal-backdrop {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e8f0f5 50%, #f1f5f9 75%, #f8fafc 100%);
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
          background-attachment: fixed;
          background-position: 0 0;
        }

        .light-modal-backdrop::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          min-width: 100vw;
          height: 100%;
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08), transparent 50%),
                      radial-gradient(circle at 80% 10%, rgba(236, 72, 153, 0.08), transparent 45%),
                      radial-gradient(circle at 75% 80%, rgba(14, 165, 233, 0.08), transparent 50%),
                      linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.03) 50%, rgba(236, 72, 153, 0.02) 100%);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: -1;
        }
      `}} />
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
            "light-modal-backdrop fixed inset-0 backdrop-blur-sm transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Modal */}
        <div
          className={cn(
            "relative z-50 bg-white rounded-xl shadow-2xl w-full mx-4",
            "ring-1 ring-black/5",
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title ? (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-600" />
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

