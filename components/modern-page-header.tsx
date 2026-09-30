"use client";

import React from 'react';
import { UserCard } from "@/components/user-card";

export type Metric = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

type ModernPageHeaderProps = {
  title: string;
  subtitle?: string;
  metrics?: Metric[];
  /** Optional dashboard block rendered below title/metrics, full width */
  dashboard?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional footer actions rendered below UserCard, aligned to left */
  footerActions?: React.ReactNode;
  showUserCard?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  /** Layout for metrics: 'horizontal' (default), 'grid2x2', or 'grid4compact' (4 in one row, smaller) */
  metricsLayout?: 'horizontal' | 'grid2x2' | 'grid4compact';
};

export const ModernPageHeader: React.FC<ModernPageHeaderProps> = ({
  title,
  subtitle,
  metrics = [],
  dashboard,
  actions,
  footerActions,
  showUserCard = false,
  metricsLayout = 'horizontal',
}) => {
  return (
    <div
      className={[
        "relative min-w-0 flex flex-col gap-3 rounded-md border border-border",
        "bg-card",
        "px-4 py-3 sm:px-5 sm:py-4 text-foreground",
      ].join(" ")}
    >
      <div className="relative z-10 flex flex-col gap-3 sm:gap-3 md:gap-4">
        {/* First row: Title + User Card */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          {/* Title */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="m-0 text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Actions + User Card */}
          <div className="flex min-w-0 flex-wrap items-start justify-start sm:justify-end gap-2 sm:gap-3">
            {actions && (
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                {actions}
              </div>
            )}
            {showUserCard && <UserCard />}
          </div>
        </div>

        {/* Second row: Metrics aligned to left */}
        {metrics.length > 0 && (
          <div className="flex flex-col items-start">
            {metricsLayout === 'grid4compact' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-full">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 min-h-0 justify-center backdrop-blur-sm shadow-sm"
                  >
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      {metric.icon && <span className="flex-shrink-0 text-[10px]">{metric.icon}</span>}
                      <span className="break-words">{metric.label}</span>
                    </span>
                    <span className="text-xs sm:text-sm break-words font-bold tabular-nums text-foreground leading-tight">{metric.value}</span>
                  </div>
                ))}
              </div>
            ) : metricsLayout === 'grid2x2' ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 w-full min-w-0">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex min-w-0 flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 min-h-[52px] sm:min-h-[56px] justify-center backdrop-blur-sm shadow-sm"
                  >
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      {metric.icon && <span className="flex-shrink-0">{metric.icon}</span>}
                      {metric.label}
                    </span>
                    <span className="text-sm sm:text-base md:text-lg break-words font-bold tabular-nums text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 w-full">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex min-w-0 flex-1 basis-[120px] flex-col gap-0.5 rounded-lg border border-border/60 bg-background/55 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 backdrop-blur-md shadow-sm"
                  >
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {metric.icon && <span className="inline-block mr-0.5 sm:mr-1 md:mr-1.5">{metric.icon}</span>}
                      {metric.label}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg break-words font-bold text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional dashboard block (full width below title row) */}
      {dashboard && (
        <div className="relative z-10 mt-3 border-t border-border/40 pt-3">
          {dashboard}
        </div>
      )}

      {/* Optional footer actions (below UserCard, aligned to left) */}
      {footerActions && (
        <div className="relative z-10 mt-3 border-t border-border/40 pt-3 flex flex-wrap gap-2 justify-start">
          {footerActions}
        </div>
      )}
    </div>
  );
};
