"use client";

import NavbarWrapper from "../components/NavbarWrapper";
import { useAuth } from "@/hooks/useAuth";
import MobileRouteBalance from "./MobileRouteBalance";
import "../route-balance/fonts.css";
import "./design.css";
import "./styles.css";
import "./page.css";

export default function DriverRouteBalancePage() {
  const { user } = useAuth();
  const driverName = user?.name?.trim() || "Driver";
  const userId = Number(user?.id) || undefined;

  return (
    <NavbarWrapper title="My Route" active="route-balance">
      <main className="driver-route-balance-page">
        <MobileRouteBalance driverName={driverName} userId={userId} />
      </main>
    </NavbarWrapper>
  );
}
