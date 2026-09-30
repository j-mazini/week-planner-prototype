"use client";

export const dynamic = "force-dynamic";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { fetchVendors, type Vendor } from "@/lib/vendors";
import { fetchVehicles, type Vehicle } from "@/lib/vehicles";
import { fetchRoutes, type Route } from "@/lib/api/routes";
import { removeToken, hasAuthSession, getBearerAuthHeader } from "@/lib/auth"
// Nova estrutura
import { PlannerProvider } from "./contexts/PlannerContext";
import Planner from "./components/Planner/Planner";
import { usePlannerScript } from "./hooks/usePlannerScript";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./week-planner.css";

// Helper function
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Componente interno que usa o contexto
function WeekPlannerPageContent() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [_loading, setLoading] = useState<boolean>(false);
  const [_error, _setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [_loadingVendors, setLoadingVendors] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [_loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [_loadingRoutes, setLoadingRoutes] = useState<boolean>(false);

  // Initialize Bootstrap scripts
  usePlannerScript();

  // Helper function to handle 401 errors
  const handleAuthError = useCallback(() => {
    removeToken();
    router.push('/?callbackUrl=/operations-management');
  }, [router]);

  const fetchVendorsData = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const vendorsData = await fetchVendors();
      setVendors(vendorsData);
    } catch (err: unknown) {
      console.error("Error fetching vendors:", err);
      if (err instanceof Error && (err.message?.includes('401') || err.message?.includes('Invalid token'))) {
        handleAuthError();
        return;
      }
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, [handleAuthError]);

  const fetchVehiclesData = useCallback(async () => {
    try {
      setLoadingVehicles(true);
      const vehiclesData = await fetchVehicles();
      setVehicles(vehiclesData);
    } catch (err: unknown) {
      console.error("Error fetching vehicles:", err);
      if (err instanceof Error && (err.message?.includes('401') || err.message?.includes('Invalid token'))) {
        handleAuthError();
        return;
      }
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }, [handleAuthError]);

  const fetchRoutesData = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const routesData = await fetchRoutes();
      setRoutes(routesData);
    } catch (err: unknown) {
      console.error("Error fetching routes:", err);
      if (err instanceof Error && (err.message?.includes('401') || err.message?.includes('Invalid token'))) {
        handleAuthError();
        return;
      }
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  }, [handleAuthError]);

  // Check authentication on mount
  useEffect(() => {
    if (!hasAuthSession()) {
      handleAuthError();
      return;
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchVendorsData();
    fetchVehiclesData();
    fetchRoutesData();
  }, [fetchVendorsData, fetchVehiclesData, fetchRoutesData]);

  const handleDownload = async () => {
    const API_BASE_URL = getApiBaseUrl();
    if (!API_BASE_URL) {
      alert("API URL is not configured.");
      return;
    }

    if (!hasAuthSession()) {
      handleAuthError();
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedDate) {
        params.append("date", selectedDate);
      }

      const url = `${API_BASE_URL}/bff/week-planners/export?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...getBearerAuthHeader(),
          Accept: "text/csv,application/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download week planners");
      }

      const contentType = response.headers.get("content-type") || "";
      const isExcel = contentType.includes("spreadsheet") || contentType.includes("excel");

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        alert("No data available for download");
        return;
      }

      const mimeType = isExcel
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv;charset=utf-8;";

      const blob = new Blob([arrayBuffer], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `week-planners-${selectedDate || 'all'}.${isExcel ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (error: unknown) {
      console.error("Error downloading week planners:", error);
      if (error instanceof Error && (error.message?.includes('401') || error.message?.includes('Invalid token'))) {
        handleAuthError();
        return;
      }
      alert(error instanceof Error ? error.message : "Error downloading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMainReviewModal = useCallback(async () => {
    // TODO: Implement review modal
    alert('Review and submit feature - to be implemented');
  }, []);

  const handleDefaultSchedule = useCallback(async () => {
    alert('Default schedule feature coming soon');
  }, []);

  return (
    <NavbarWrapper>
      <WeekPlannerResponsiveLayout
        error={_error}
        selectedDate={selectedDate}
        vendors={vendors}
        routes={routes}
        vehicles={vehicles}
        onDateChange={setSelectedDate}
        onExport={handleDownload}
        onSubmitWeek={handleOpenMainReviewModal}
        onDefaultSchedule={handleDefaultSchedule}
      />
    </NavbarWrapper>
  );
}

// Export principal com Provider
export default function WeekPlannerPage() {
  return (
    <PlannerProvider>
      <WeekPlannerPageContent />
    </PlannerProvider>
  );
}

type WeekPlannerResponsiveLayoutProps = {
  error: string | null;
  selectedDate: string;
  vendors: Vendor[];
  routes: Route[];
  vehicles: Vehicle[];
  onDateChange: (date: string) => void;
  onExport: () => void;
  onSubmitWeek: () => void;
  onDefaultSchedule: () => void;
};

function WeekPlannerResponsiveLayout({
  error,
  selectedDate,
  vendors,
  routes,
  vehicles,
  onDateChange,
  onExport,
  onSubmitWeek,
  onDefaultSchedule,
}: WeekPlannerResponsiveLayoutProps) {
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <div
      className="week-planner-page-wrapper min-h-screen"
      data-sidebar-state={sidebarState}
      data-sidebar-mobile={isMobile ? "true" : "false"}
    >
      <div className="px-4 pt-6 md:hidden">
      </div>
      <div className="planner-page-container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Week Planner</h1>
            <p className="text-slate-600">Visual planning and scheduling system</p>
            {selectedDate && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                Current date: {selectedDate}
              </span>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>

        <Planner
          date={selectedDate}
          vendors={vendors}
          routes={routes}
          vehicles={vehicles}
          onDateChange={onDateChange}
          onExport={onExport}
          onSubmitWeek={onSubmitWeek}
          onDefaultSchedule={onDefaultSchedule}
        />
      </div>
    </div>
  );
}
