"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame, MobilePageShell } from "@/app/(private)/components";
import { useAuth } from "@/hooks/useAuth";
import { SpDashboardHeader } from "./components/SpDashboardHeader";
import { SpDiscoBlock } from "./components/SpDiscoBlock";
import { SpDayViewBlock } from "./components/SpDayViewBlock";
import { SpOperationsBlock } from "./components/SpOperationsBlock";
import { SpComplianceBlock } from "./components/SpComplianceBlock";
import { SpVehiclesBlock } from "./components/SpVehiclesBlock";
import { MyPerformanceBlock } from "./components/MyPerformanceBlock";
import { DashboardGrid, MobileDashboardBlocks } from "./components/dashboard-grid";
import { fetchSpStatus } from "./sp-api";
import { SpStatusDaily } from "./sp-types";
import type { DashboardDisco } from "./disco-types";
import { formatCurrentDate } from "./utils";
import { useSupervisorRestrictions } from "./hooks/useSupervisorRestrictions";

function HomePageContent() {
  const router = useRouter();
  const [daily, setDaily] = useState<SpStatusDaily | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discoData, setDiscoData] = useState<DashboardDisco | null>(null);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  /** When Operations shows "No operations for the selected date", Compliance/Vehicles render compact. */
  const [operationsHasData, setOperationsHasData] = useState(true);

  const { user, isLoading: authLoading } = useAuth();

  // Today's date for supervisor restrictions
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const { isSupervisor, supervisorDepots } = useSupervisorRestrictions(todayStr);

  // Homepage apenas para admin e supervisor; outros redirecionados.
  useEffect(() => {
    if (typeof window === "undefined" || authLoading) return;
    
    if (!user) {
      setCanAccess(false);
      return;
    }
    
    if (!user.roles.includes("admin") && !user.roles.includes("supervisor") && !user.roles.includes("service_partner")) {
      router.replace("/daily-performance-insight");
      return;
    }
    setCanAccess(true);
  }, [router, user, authLoading]);

  useEffect(() => {
    if (canAccess !== true || typeof window === "undefined") return;
    // O check de isMobileDevice para vendors não é mais necessário aqui pois já foi redirecionado acima
    // Ou se quisermos manter a regra antiga de redirecionar vendors mobile tbm: (já estão redirect)

    setIsLoading(true);
    fetchSpStatus()
      .then((data) => {
        if (data?.status?.daily) setDaily(data.status.daily);
      })
      .catch((err) => console.error("Error fetching SP status:", err))
      .finally(() => setIsLoading(false));
  }, [router, canAccess]);

  if (canAccess !== true) {
    return null;
  }

  const dashboardWidgets = {
    disco: <SpDiscoBlock discoData={discoData} onDiscoDataChange={setDiscoData} />,
    dayview: (
      <SpDayViewBlock
        compact={!operationsHasData}
        isSupervisor={isSupervisor}
        supervisorDepots={supervisorDepots}
      />
    ),
    myperformance: <MyPerformanceBlock compact={!operationsHasData} />,
    operations: (
      <SpOperationsBlock
        daily={daily}
        isLoading={isLoading}
        onOperationsDataChange={setOperationsHasData}
      />
    ),
    compliance: <SpComplianceBlock compact={!operationsHasData} />,
    vehicles: <SpVehiclesBlock compact={!operationsHasData} />,
  };

  const currentDate = formatCurrentDate();

  return (
    <DgpPageFrame
      width="wide"
      containerClassName="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4"
      className="overflow-x-hidden w-full min-h-screen"
    >
      {/* Desktop */}
      <div className="container-fluid px-0 hidden md:block">
        <SpDashboardHeader />
        <div className="mt-6 mb-6">
          <DashboardGrid widgets={dashboardWidgets} />
        </div>
      </div>

      {/* Mobile: blocos em accordion para melhor leitura */}
      <MobilePageShell
        title="Dashboard"
        subtitle={currentDate}
        className="!pt-4"
      >
        <MobileDashboardBlocks widgets={dashboardWidgets} />
      </MobilePageShell>
    </DgpPageFrame>
  );
}

function HomePage() {
  return (
    <NavbarWrapper>
      <HomePageContent />
    </NavbarWrapper>
  );
}

export default memo(HomePage);
