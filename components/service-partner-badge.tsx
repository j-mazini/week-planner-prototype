"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ServicePartnerBadgeProps = {
  partnerName?: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizeMap = {
  xs: "text-[9px] tracking-[0.12em] px-1.5 py-0.5 rounded",
  sm: "text-[11px] tracking-[0.16em] px-2 py-0.5 rounded-md",
  md: "text-xs tracking-[0.18em] px-2.5 py-1 rounded-md",
};

export function ServicePartnerBadge({
  partnerName,
  size = "xs",
  className,
}: ServicePartnerBadgeProps) {
  const tooltipText = (partnerName ?? "").trim() || "Service Partner";

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="img"
            aria-label={`Service Partner: ${tooltipText}`}
            // Quando o badge fica dentro de um card `draggable` (ex.: week planner),
            // o navegador trata o elemento sob o ponteiro como alça de arraste e
            // suprime o hover do tooltip. Marcar como não-arrastável restaura o hover.
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={cn(
              "inline-flex items-center select-none font-semibold uppercase whitespace-nowrap cursor-help",
              "bg-violet-600 text-white border border-violet-700/40 shadow-sm",
              "outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
              sizeMap[size],
              className
            )}
          >
            SP
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className={cn(
            "z-[1100] max-w-xs px-3 py-2 rounded-lg",
            "bg-slate-900 text-white border border-violet-500/40 shadow-xl",
            "text-xs font-medium tracking-wide"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-violet-600 text-[9px] font-bold tracking-wider shrink-0"
              aria-hidden
            >
              SP
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-[0.15em] text-violet-300/90">
                Service Partner
              </span>
              <span className="text-sm font-semibold text-white">
                {tooltipText}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ServicePartnerBadge;
