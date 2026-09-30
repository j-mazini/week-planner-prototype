"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Shell from "@/app/(private)/components/NavbarWrapper";
import { SidebarProvider } from "@/components/ui/sidebar";

const TITLES: Record<string, string> = {
  "/home": "HOME",
  "/mobile-invoice": "MY INVOICE",
  "/daily-performance-insight": "MY PERFORMANCE",
  "/current-performance": "MY PERFORMANCE",
  "/assets": "ASSETS",
  "/contract-management": "CONTRACT MANAGEMENT",
  "/daily": "DAILY OPERATIONS",
  "/daily-game-plan": "DAILY GAME PLAN",
  "/daily-financials": "DAILY FINANCIALS",
  "/financial-management": "FINANCIAL MANAGEMENT",
  "/financial-performance": "FINANCIAL PERFORMANCE",
  "/invoice-history": "INVOICE HISTORY",
  "/invoice-processing-workflow": "INVOICE PROCESSING WORKFLOW",
  "/logistics": "LOGISTICS",
  "/operations-management": "OPERATIONS MANAGEMENT",
  "/requests": "REQUESTS",
  "/requests-inbox": "REQUESTS INBOX",
  "/schedule": "SCHEDULE",
  "/service-partner-invoices": "SERVICE PARTNER INVOICES",
  "/vehicles": "VEHICLES",
  "/vendor": "VENDOR",
  "/vendor-performance": "VENDOR PERFORMANCE",
};

/** Shared shell used by the imported BA Express pages. */
export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const route = pathname.replace(/^\/(?:[^/]+\/)?/, "/").replace(/\/$/, "") || "/home";
  const title = TITLES[route] ?? (route.slice(1).replaceAll("-", " ").toUpperCase() || "LOGIX SPHERE");

  return (
    <SidebarProvider defaultOpen={false}>
      <Shell title={title} active="home">
        <div className="app-imported-page" data-page={route.slice(1)}>{children}</div>
      </Shell>
    </SidebarProvider>
  );
}
