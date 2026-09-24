"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { PlannerState, PlannerAction, Route } from '../types/planner';

// Value used only for WeekPlannerField type below
const TABLE_HEADERS = [
  { key: "date", label: "Date" },
  { key: "name", label: "Name" },
  { key: "route", label: "Route" },
  { key: "costModel", label: "Cost Model" },
  { key: "rate", label: "Rate" },
  { key: "routeCost", label: "Route Cost" },
  { key: "routeSort", label: "Sort" },
  { key: "adhocSort", label: "AD-HOC Sort" },
  { key: "extras", label: "Extras" },
  { key: "notes", label: "Notes" },
  { key: "registrationPlate", label: "Registration Plate" },
  { key: "status", label: "Status" },
] as const;

export type WeekPlannerField = (typeof TABLE_HEADERS)[number]["key"] | "isDayOff";

export type WeekPlannerFormData = Record<WeekPlannerField, string> & {
  vehicle: string; // Vehicle model (for form selection, not displayed in table)
  isDayOff: string; // Added for day off field
};

export type WeekPlannerRecord = WeekPlannerFormData & {
  weekPlannerId: number;
  operationId?: number;
  raw: Record<string, unknown>;
};

export type SortConfig = {
  key: WeekPlannerField;
  direction: "asc" | "desc";
};

export type WeekPlannerTypes = {
  vendors?: string[];
  userTypes?: string[];
  paymentModes?: string[];
  routes?: string[];
  vehicles?: string[];
  statuses?: string[];
  costModels?: string[];
};

const initialState: PlannerState = {
  currentDate: new Date(),
  displayDate: new Date(),
  loopRoutes: [],
  rotaRoutes: [],
  managementRoles: [],
  adHocServices: [],
  flexRouteTemplates: [],
  allVendors: [],
  assignments: [],
  dayOffEntries: [],
  isWeekendVisible: false,
  draggedItem: null,
  draggedFromCell: null,
  currentView: 'weekly',
  hiddenLoopSections: new Set(),
  hiddenAdHocSections: new Set(),
  selectedDate: undefined,
  weekDates: [],
};

const plannerReducer = (state: PlannerState, action: PlannerAction): PlannerState => {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, currentDate: action.payload, displayDate: action.payload };
    case 'SET_DISPLAY_DATE':
      return { ...state, displayDate: action.payload };
    case 'TOGGLE_WEEKEND_VISIBILITY':
      return { ...state, isWeekendVisible: !state.isWeekendVisible };
    case 'SWITCH_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(a => a.id !== action.payload),
      };
    case 'SET_VENDORS':
      return { ...state, allVendors: action.payload };
    case 'SET_ROUTES':
      // Separate routes by type
      const loopRoutes: Route[] = [];
      const rotaRoutes: Route[] = [];
      const managementRoles: Route[] = [];
      
      action.payload.forEach(route => {
        if (route.type === 'loop') loopRoutes.push(route);
        else if (route.type === 'rota') rotaRoutes.push(route);
        else if (route.type === 'management') managementRoles.push(route);
      });
      
      return {
        ...state,
        loopRoutes,
        rotaRoutes,
        managementRoles,
      };
    case 'SET_DAY_OFF_ENTRIES':
      return { ...state, dayOffEntries: action.payload };
    case 'ADD_DAY_OFF':
      return { ...state, dayOffEntries: [...state.dayOffEntries, action.payload] };
    case 'DELETE_DAY_OFF':
      return {
        ...state,
        dayOffEntries: state.dayOffEntries.filter(e => e.id !== action.payload),
      };
    case 'SET_DRAGGED_ITEM':
      return { ...state, draggedItem: action.payload };
    case 'SET_DRAGGED_FROM_CELL':
      return { ...state, draggedFromCell: action.payload };
    case 'TOGGLE_LOOP_SECTION':
      const newHiddenLoops = new Set(state.hiddenLoopSections);
      if (newHiddenLoops.has(action.payload)) {
        newHiddenLoops.delete(action.payload);
      } else {
        newHiddenLoops.add(action.payload);
      }
      return { ...state, hiddenLoopSections: newHiddenLoops };
    case 'TOGGLE_ADHOC_SECTION':
      const newHiddenAdHoc = new Set(state.hiddenAdHocSections);
      if (newHiddenAdHoc.has(action.payload)) {
        newHiddenAdHoc.delete(action.payload);
      } else {
        newHiddenAdHoc.add(action.payload);
      }
      return { ...state, hiddenAdHocSections: newHiddenAdHoc };
    case 'SET_WEEK_DATES':
      return { ...state, weekDates: action.payload };
    default:
      return state;
  }
};

const PlannerContext = createContext<{
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
} | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(plannerReducer, initialState);

  return (
    <PlannerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
