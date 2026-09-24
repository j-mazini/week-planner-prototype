/**
 * Tipos para o grid de blocos da homepage.
 * Layout persistido em localStorage para manter posição e tamanho.
 */

export type DashboardWidgetId =
  | "disco"
  | "dayview"
  | "myperformance"
  | "operations"
  | "compliance"
  | "vehicles";

export interface DashboardLayoutItem {
  i: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export type DashboardLayout = DashboardLayoutItem[];

/**
 * Default layout: 12 cols.
 * Disco 6 | Day view 6 → My Performance 12 → Operations 12 → Compliance 6 | Vehicles 6.
 *
 * My Performance (BAE-490) entra em linha própria acima de Operations: são os números
 * do usuário logado, então ficam antes do panorama operacional do time.
 */
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = [
  { i: "disco", x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 3 },
  { i: "dayview", x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 3 },
  { i: "myperformance", x: 0, y: 4, w: 12, h: 3, minW: 3, minH: 3 },
  { i: "operations", x: 0, y: 7, w: 12, h: 4, minW: 2, minH: 2 },
  { i: "compliance", x: 0, y: 11, w: 6, h: 4, minW: 2, minH: 3 },
  { i: "vehicles", x: 6, y: 11, w: 6, h: 4, minW: 2, minH: 3 },
];

export const DASHBOARD_LAYOUT_STORAGE_KEY = "baop-homepage-dashboard-layout";
