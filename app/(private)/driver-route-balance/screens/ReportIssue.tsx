"use client";

import { useApp } from "../state";
import { ReportForm } from "../components/ReportForm";
import { RouteScreen } from "../components/RouteScreen";

export default function ReportIssue() {
  const { navigate } = useApp();
  return (
    <RouteScreen
      urgency="issue"
      title="Report issue"
      band="Issue — reviewed with your depot"
      onBack={() => navigate("overview")}
    >
      <ReportForm kind="issue" />
    </RouteScreen>
  );
}
