"use client";

import React, { useMemo } from "react";
import { GridLayout, useContainerWidth } from "react-grid-layout";
import { toRGLayout } from "./layoutUtils";
import { DashboardGridToolbar } from "./DashboardGridToolbar";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { useDashboardLayout } from "../../hooks/useDashboardLayout";
import type { DashboardLayout as DashboardLayoutType, DashboardWidgetId } from "../../types/dashboard-grid-types";

import "react-grid-layout/css/styles.css";
import "./dashboard-grid.css";

const COLS = 12;
const ROW_HEIGHT_DESKTOP = 64;
const ROW_HEIGHT_MOBILE = 58;
/** Horizontal gap kept for harmony; vertical gap smaller so Compliance/Vehicles sit closer. */
const MARGIN_DESKTOP: [number, number] = [16, 8];
const MARGIN_MOBILE: [number, number] = [12, 6];
const CONTAINER_PADDING: [number, number] = [0, 0];
const BREAKPOINT = 768;

export interface DashboardGridProps {
  widgets: Record<DashboardWidgetId, React.ReactNode>;
}

export function DashboardGrid({ widgets }: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: 1200,
  });
  const setContainerRef = (node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };
  const { layout, editMode, onLayoutChange, resetToDefault, toggleEditMode } = useDashboardLayout();

  const rglLayout = useMemo(() => toRGLayout(layout), [layout]);

  const isNarrow = width < BREAKPOINT;
  const gridConfig = useMemo(
    () => ({
      cols: COLS,
      rowHeight: isNarrow ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP,
      margin: isNarrow ? MARGIN_MOBILE : MARGIN_DESKTOP,
      containerPadding: CONTAINER_PADDING,
      maxRows: Infinity,
    }),
    [isNarrow]
  );

  const dragConfig = useMemo(
    () => ({
      enabled: editMode,
      handle: ".dashboard-widget-drag-handle",
    }),
    [editMode]
  );

  const resizeConfig = useMemo(
    () => ({
      enabled: editMode,
      handles: ["s", "e", "se"] as const,
    }),
    [editMode]
  );

  if (!mounted) {
    return (
      <div
        ref={setContainerRef}
        className="w-full min-h-[320px] rounded-xl bg-slate-50/50 animate-pulse"
        aria-hidden
      />
    );
  }

  return (
    <div ref={setContainerRef} className="w-full min-w-0">
      <DashboardGridToolbar
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        onResetToDefault={resetToDefault}
      />
      <div
        className={editMode ? "dashboard-grid-edit-bg" : "dashboard-grid-wrapper"}
        style={{ width }}
      >
        <GridLayout
          layout={rglLayout}
          onLayoutChange={onLayoutChange}
          width={width}
          gridConfig={gridConfig}
          autoSize
          dragConfig={dragConfig}
          resizeConfig={resizeConfig}
          compactType="vertical"
          className="dashboard-grid"
        >
          {(layout as DashboardLayoutType).map((item) => (
            <div key={item.i}>
              <DashboardWidgetCard showDragHandle={editMode}>
                {widgets[item.i]}
              </DashboardWidgetCard>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
