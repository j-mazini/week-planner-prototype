"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LightButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white hover:bg-gray-50",
  ghost: "bg-transparent hover:bg-gray-100",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const LightButton = React.forwardRef<HTMLButtonElement, LightButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

LightButton.displayName = "LightButton";

