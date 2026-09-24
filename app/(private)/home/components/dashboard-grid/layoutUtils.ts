import type { Layout } from "react-grid-layout";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  DASHBOARD_LAYOUT_STORAGE_KEY,
  type DashboardLayout,
  type DashboardWidgetId,
} from "../../types/dashboard-grid-types";

// Um layout salvo antes de um widget novo (ex.: "myperformance") não passa no check de
// `hasAll` abaixo e é descartado em favor do default — o widget novo aparece em vez de
// sumir para quem já tinha layout persistido.
const WIDGET_IDS: DashboardWidgetId[] = [
  "disco",
  "dayview",
  "myperformance",
  "operations",
  "compliance",
  "vehicles",
];

export function loadLayoutFromStorage(): DashboardLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardLayout;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const hasAll = WIDGET_IDS.every((id) => parsed.some((item) => item.i === id));
    if (!hasAll) return null;
    return parsed.map((item) => ({
      ...item,
      minW: item.minW ?? 3,
      minH: item.minH ?? 3,
    }));
  } catch {
    return null;
  }
}

export function saveLayoutToStorage(layout: DashboardLayout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // ignore
  }
}

export function toRGLayout(dashboardLayout: DashboardLayout): Layout {
  return dashboardLayout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
  }));
}

export function fromRGLayout(layout: Layout): DashboardLayout {
  return layout.map((item) => ({
    i: item.i as DashboardWidgetId,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: typeof item.minW === "number" ? item.minW : 3,
    minH: typeof item.minH === "number" ? item.minH : 3,
    maxW: item.maxW,
    maxH: item.maxH,
  }));
}

export { DEFAULT_DASHBOARD_LAYOUT };
