"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function LightCard({ className, children, ...props }: LightCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LightCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function LightCardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export function LightCardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-4 border-t border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

