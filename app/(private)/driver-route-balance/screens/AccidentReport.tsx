"use client";

import { useApp } from "../state";
import { ReportForm } from "../components/ReportForm";
import { RouteScreen } from "../components/RouteScreen";

export default function AccidentReport() {
  const { navigate } = useApp();
  return (
    <RouteScreen
      urgency="accident"
      title="Accident report"
      band="Accident — reported to operations immediately"
      onBack={() => navigate("overview")}
    >
      <ReportForm kind="accident" />
    </RouteScreen>
  );
}
