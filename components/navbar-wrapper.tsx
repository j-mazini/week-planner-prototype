"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageEnter } from "@/lib/motion";
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
  "/operations-management": "OPERATIONS MANAGEMENT",
  "/requests": "REQUESTS",
  "/requests-inbox": "REQUESTS INBOX",
  "/schedule": "SCHEDULE",
  "/service-partner-invoices": "SERVICE PARTNER INVOICES",
  "/supervisor-home": "HOME",
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
      <Shell title={title}>
        {/* Entrada de página, num sítio só: este div embrulha exactamente o
            conteúdo da page e deixa o navbar de fora. O `key` por rota é o que
            faz o fade repetir a cada navegação — sem ele, o motion.div fica na
            mesma posição da árvore e `initial` só correria no primeiro mount. */}
        <motion.div
          key={route}
          initial={pageEnter.initial}
          animate={pageEnter.animate}
          transition={pageEnter.transition}
          className="app-imported-page"
          data-page={route.slice(1)}
        >
          {children}
        </motion.div>
      </Shell>
    </SidebarProvider>
  );
}
