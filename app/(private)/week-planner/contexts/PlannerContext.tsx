"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

// Types from week-planner-operations/page.tsx
// Prefixed with `_` because it is only referenced via `typeof` below (type position),
// never as a runtime value — @typescript-eslint/no-unused-vars flags that as unused.
const _TABLE_HEADERS = [
  { key: "date", label: "Date" },
  { key: "name", label: "Name" },
  { key: "route", label: "Route" },
  { key: "routeSort", label: "Sort" },
  { key: "adhocSort", label: "AD-HOC Sort" },
  { key: "notes", label: "Notes" },
  { key: "reason", label: "Reason" },
  { key: "registrationPlate", label: "Registration Plate" },
  { key: "status", label: "Status" },
] as const;

export type WeekPlannerField = (typeof _TABLE_HEADERS)[number]["key"];

export type WeekPlannerFormData = Record<WeekPlannerField, string> & {
  vehicle: string; // Vehicle model (for form selection, not displayed in table)
  isDayOff: string; // Added for day off field
  isSort: string; // Maps to isSort boolean from API
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
  routes?: string[];
  vehicles?: string[];
  statuses?: string[];
};

type PlannerState = {
  // Data
  allOperations: WeekPlannerRecord[];
  selectedDate: string;
  weekPlannerTypes: WeekPlannerTypes;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  refreshTrigger: number;
  
  // Table State
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  sortConfig: SortConfig;
  
  // Modal State
  showModal: boolean;
  showReviewModal: boolean;
  showPendingListModal: boolean;
  showPendingReviewModal: boolean;
  showDeleteModal: boolean;
  showSuccessAnimation: boolean;
  
  // Form State
  editingWeekPlannerId: number | null;
  editingRawData: Record<string, unknown> | null;
  formData: WeekPlannerFormData;
  
  // Pending Review
  pendingReviewDate: string | null;
  mainValidationErrors: string[];
  pendingValidationErrors: string[];
  
  // Actions
  submitting: boolean;
  deleting: boolean;
  weekPlannerToDelete: number | null;
};

type PlannerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPERATIONS'; payload: WeekPlannerRecord[] }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_WEEK_PLANNER_TYPES'; payload: WeekPlannerTypes }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'SET_TOTAL_RECORDS'; payload: number }
  | { type: 'SET_SORT_CONFIG'; payload: SortConfig }
  | { type: 'SET_SHOW_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_REVIEW_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_PENDING_LIST_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_PENDING_REVIEW_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_DELETE_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_SUCCESS_ANIMATION'; payload: boolean }
  | { type: 'SET_EDITING_weekPlannerId'; payload: number | null }
  | { type: 'SET_EDITING_RAW_DATA'; payload: Record<string, unknown> | null }
  | { type: 'SET_FORM_DATA'; payload: WeekPlannerFormData }
  | { type: 'SET_PENDING_REVIEW_DATE'; payload: string | null }
  | { type: 'SET_MAIN_VALIDATION_ERRORS'; payload: string[] }
  | { type: 'SET_PENDING_VALIDATION_ERRORS'; payload: string[] }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_WEEK_PLANNER_TO_DELETE'; payload: number | null }
  | { type: 'INCREMENT_REFRESH_TRIGGER' }
  | { type: 'UPSERT_OPERATION'; payload: WeekPlannerRecord }
  | { type: 'REMOVE_OPERATION'; payload: number };

const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_FORM_STATE = (): WeekPlannerFormData => ({
  date: getLocalDateString(),
  route: "",
  name: "",
  routeSort: "",
  adhocSort: "",
  notes: "",
  reason: "",
  vehicle: "",
  registrationPlate: "",
  status: BUSINESS_RULES.WORKING_STATUS.WORKING,
  isDayOff: "false",
  isSort: "false",
});

const initialState: PlannerState = {
  allOperations: [],
  selectedDate: getLocalDateString(),
  weekPlannerTypes: {},
  loading: false,
  error: null,
  refreshTrigger: 0,
  searchTerm: "",
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  sortConfig: { key: "date", direction: "desc" },
  showModal: false,
  showReviewModal: false,
  showPendingListModal: false,
  showPendingReviewModal: false,
  showDeleteModal: false,
  showSuccessAnimation: false,
  editingWeekPlannerId: null,
  editingRawData: null,
  formData: INITIAL_FORM_STATE(),
  pendingReviewDate: null,
  mainValidationErrors: [],
  pendingValidationErrors: [],
  submitting: false,
  deleting: false,
  weekPlannerToDelete: null,
};

function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_OPERATIONS':
      return { ...state, allOperations: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_WEEK_PLANNER_TYPES':
      return { ...state, weekPlannerTypes: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload };
    case 'SET_TOTAL_RECORDS':
      return { ...state, totalRecords: action.payload };
    case 'SET_SORT_CONFIG':
      return { ...state, sortConfig: action.payload };
    case 'SET_SHOW_MODAL':
      return { ...state, showModal: action.payload };
    case 'SET_SHOW_REVIEW_MODAL':
      return { ...state, showReviewModal: action.payload };
    case 'SET_SHOW_PENDING_LIST_MODAL':
      return { ...state, showPendingListModal: action.payload };
    case 'SET_SHOW_PENDING_REVIEW_MODAL':
      return { ...state, showPendingReviewModal: action.payload };
    case 'SET_SHOW_DELETE_MODAL':
      return { ...state, showDeleteModal: action.payload };
    case 'SET_SHOW_SUCCESS_ANIMATION':
      return { ...state, showSuccessAnimation: action.payload };
    case 'SET_EDITING_weekPlannerId':
      return { ...state, editingWeekPlannerId: action.payload };
    case 'SET_EDITING_RAW_DATA':
      return { ...state, editingRawData: action.payload };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_PENDING_REVIEW_DATE':
      return { ...state, pendingReviewDate: action.payload };
    case 'SET_MAIN_VALIDATION_ERRORS':
      return { ...state, mainValidationErrors: action.payload };
    case 'SET_PENDING_VALIDATION_ERRORS':
      return { ...state, pendingValidationErrors: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'SET_DELETING':
      return { ...state, deleting: action.payload };
    case 'SET_WEEK_PLANNER_TO_DELETE':
      return { ...state, weekPlannerToDelete: action.payload };
    case 'INCREMENT_REFRESH_TRIGGER':
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };
    case 'UPSERT_OPERATION': {
      const exists = state.allOperations.some(
        (op) => op.weekPlannerId === action.payload.weekPlannerId
      );
      if (exists) {
        return {
          ...state,
          allOperations: state.allOperations.map((op) =>
            op.weekPlannerId === action.payload.weekPlannerId ? action.payload : op
          ),
        };
      }
      return {
        ...state,
        allOperations: [...state.allOperations, action.payload],
      };
    }
    case 'REMOVE_OPERATION':
      return {
        ...state,
        allOperations: state.allOperations.filter(
          (op) => op.weekPlannerId !== action.payload
        ),
      };
    default:
      return state;
  }
}

type PlannerContextType = {
  state: PlannerState;
  dispatch: React.Dispatch<PlannerAction>;
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(plannerReducer, initialState);
  return (
    <PlannerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};

