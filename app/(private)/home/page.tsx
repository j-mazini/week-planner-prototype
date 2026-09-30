"use client";

import NavbarWrapper from "../components/NavbarWrapper";
import ToastProvider from "../components/Toast";
import "./styles.css";
import HomeLoading from "./components/HomeLoading";
import MyDeliveriesPanel from "./components/MyDeliveriesPanel";
import DayViewPanel from "./components/DayViewPanel";
import MyPerformancePanel from "./components/MyPerformancePanel";
import CompliancePanel from "./components/CompliancePanel";
import VehiclesPanel from "./components/VehiclesPanel";
import { useHomeDashboard } from "./hooks/useHomeDashboard";

function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function HomeBoard() {
  const { data, isLoading, isError } = useHomeDashboard();

  if (isError) {
    return (
      <div className="home-page">
        <div className="hp-wrap">Could not load the dashboard (prototype fetch failure).</div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="home-page">
        <HomeLoading />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hp-wrap">
        <div className="hp-hero">
          <div>
            <h1 className="hp-title">Welcome, {data.userName} to LogixSphere</h1>
            <p className="hp-sub">{formatCurrentDate()}</p>
          </div>
          <span className="hp-tag">Prototype · sample data</span>
        </div>

        <MyDeliveriesPanel data={data.myDeliveries} />
        <DayViewPanel dayView={data.dayView} />

        <div className="hp-grid2">
          <MyPerformancePanel data={data.myPerformance} />
          <CompliancePanel categories={data.compliance} />
        </div>

        <VehiclesPanel vehicles={data.vehiclesRequiringAttention} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <NavbarWrapper>
      <ToastProvider>
        <HomeBoard />
      </ToastProvider>
    </NavbarWrapper>
  );
}
