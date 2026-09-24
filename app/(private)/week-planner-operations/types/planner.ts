/**
 * Type definitions for the Week Planner system
 */

export interface Vendor {
  id: number;
  name: string;
  type?: string;
  status?: 'available' | 'off' | 'hold' | 'assigned';
}

export interface Route {
  id: number;
  name: string;
  variant?: string;
  type: 'loop' | 'rota' | 'management' | 'ad-hoc' | 'flex';
  depot?: 'DCY' | 'LSE' | 'MSE';
  loopType?: 'DY1' | 'DY2' | 'LSE' | 'MSE';
}

export interface Vehicle {
  id: number;
  registrationPlate: string;
  type?: string;
}

export interface Assignment {
  id: string | number;
  date: string; // YYYY-MM-DD
  userId: number;
  userName: string;
  routeId: number;
  routeName: string;
  vehicleId?: number;
  vehicleRegistration?: string;
  costModel?: string;
  rate?: number;
  routeCost?: number;
  routeSort?: number;
  adhocSort?: number;
  extras?: number;
  notes?: string;
  status?: string;
  paymentMode?: string;
}

export interface DayOffEntry {
  id?: string | number;
  userId: number;
  userName: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (for period)
  reason?: string;
  notes?: string;
}

export interface FlexRoute {
  id: string | number;
  name: string;
  loopType: 'DY1' | 'DY2' | 'LSE' | 'MSE';
  depot: 'DCY' | 'LSE' | 'MSE';
}

export interface AdHocService {
  id: string | number;
  name: string;
  depot: 'DCY' | 'LSE' | 'MSE';
  date: string;
  userId?: number;
  userName?: string;
}

export interface PlannerState {
  currentDate: Date;
  displayDate: Date;
  loopRoutes: Route[];
  rotaRoutes: Route[];
  managementRoles: Route[];
  adHocServices: AdHocService[];
  flexRouteTemplates: FlexRoute[];
  allVendors: Vendor[];
  assignments: Assignment[];
  dayOffEntries: DayOffEntry[];
  isWeekendVisible: boolean;
  draggedItem: Assignment | Vendor | null;
  draggedFromCell: { routeId: number; date: string } | null;
  currentView: 'weekly' | 'daily';
  hiddenLoopSections: Set<string>;
  hiddenAdHocSections: Set<string>;
  selectedDate?: Date;
  weekDates: Date[];
}

export interface PlannerMetrics {
  assignments: number;
  vendors: number;
  weekRange: string;
  weekNumber: string;
}

export interface DragDropState {
  draggedItem: Assignment | Vendor | null;
  draggedFromCell: { routeId: number; date: string } | null;
  isDragging: boolean;
}

export type PlannerAction =
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_DISPLAY_DATE'; payload: Date }
  | { type: 'TOGGLE_WEEKEND_VISIBILITY' }
  | { type: 'SWITCH_VIEW'; payload: 'weekly' | 'daily' }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string | number }
  | { type: 'SET_VENDORS'; payload: Vendor[] }
  | { type: 'SET_ROUTES'; payload: Route[] }
  | { type: 'SET_DAY_OFF_ENTRIES'; payload: DayOffEntry[] }
  | { type: 'ADD_DAY_OFF'; payload: DayOffEntry }
  | { type: 'DELETE_DAY_OFF'; payload: string | number }
  | { type: 'SET_DRAGGED_ITEM'; payload: Assignment | Vendor | null }
  | { type: 'SET_DRAGGED_FROM_CELL'; payload: { routeId: number; date: string } | null }
  | { type: 'TOGGLE_LOOP_SECTION'; payload: string }
  | { type: 'TOGGLE_ADHOC_SECTION'; payload: string }
  | { type: 'SET_WEEK_DATES'; payload: Date[] };

