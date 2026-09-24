"use client";

import { useCallback, useEffect, useState } from "react";
import type { Layout } from "react-grid-layout";
import {
  loadLayoutFromStorage,
  saveLayoutToStorage,
  fromRGLayout,
  DEFAULT_DASHBOARD_LAYOUT,
} from "../components/dashboard-grid/layoutUtils";
import type { DashboardLayout } from "../types/dashboard-grid-types";

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    const stored = loadLayoutFromStorage();
    return stored ?? DEFAULT_DASHBOARD_LAYOUT;
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const stored = loadLayoutFromStorage();
    if (stored) setLayout(stored);
  }, []);

  const onLayoutChange = useCallback((newLayout: Layout) => {
    const next = fromRGLayout(newLayout);
    setLayout(next);
    saveLayoutToStorage(next);
  }, []);

  const resetToDefault = useCallback(() => {
    setLayout(DEFAULT_DASHBOARD_LAYOUT);
    saveLayoutToStorage(DEFAULT_DASHBOARD_LAYOUT);
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  return { layout, setLayout, editMode, setEditMode, onLayoutChange, resetToDefault, toggleEditMode };
}
