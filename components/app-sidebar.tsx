"use client";

import * as React from "react";
import { BUSINESS_RULES } from "@/src/constants/businessRules";

import { useState, useEffect, startTransition } from "react";

import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { 

  ArrowRightLeft, 

  Calendar, 

  Building2, 

  Truck,  

  TrendingUp, 

  Receipt,

  Wallet,

  Home,

  BarChart3,

  ClipboardList,

  ClipboardCheck,

  Route,

  Package,

  Inbox,

  X,

  FileSpreadsheet,

  type LucideIcon

} from "lucide-react";



import { NavOperations } from "@/components/nav-operations";

import { NavFinancial } from "@/components/nav-financial";

import { FloatingNavbar } from "@/components/floating-navbar";

import { useAuth } from "@/hooks/useAuth";
import { isPathAllowed, USER_TYPE_3_ALLOWED } from "@/lib/route-permissions";

import { fetchVendorRequests, type VendorRequest } from "@/lib/vendor-requests-api";

import {

  Sidebar,

  SidebarContent,

  SidebarMenu,

  SidebarMenuButton,

  SidebarMenuItem,

  SidebarGroup,

  SidebarHeader,

  useSidebar,

} from "@/components/ui/sidebar";



// Types

interface NavItem {

  name: string;

  url: string;

  icon: LucideIcon;

}



interface NavigationData {

  projects: NavItem[];

  financial: NavItem[];

}






// Constants

const NAVIGATION_DATA: NavigationData = {

  projects: [

    { name: "Vendor", url: "/vendor", icon: Building2 },

    { name: "Vehicles", url: "/vehicles", icon: Truck },

    { name: "Contract Management", url: "/contract-management", icon: Route },

    { name: "Assets", url: "/assets", icon: Package },

    { name: "Week Planner", url: "/week-planner", icon: Calendar },

    { name: "Daily Game Plan", url: "/daily-game-plan", icon: ClipboardCheck },

    { name: "Daily Operations Management", url: "/daily-operations-management", icon: ClipboardList },

    { name: "Daily Operations Insights", url: "/daily-operations-reports", icon: ArrowRightLeft },

    { name: "Vendor performance", url: "/vendor-performance", icon: BarChart3 },

  ],

  financial: [

    { name: "Daily Financial Insights", url: "/daily-financial-insights", icon: TrendingUp },

    { name: "Deductions", url: "/deductions-disbursements-recharges", icon: Wallet },
    { name: "Invoices", url: "/financial-invoices", icon: Receipt },
    { name: "Adhoc Works Invoice Management", url: "/adhoc-works-invoice-management", icon: FileSpreadsheet },

  ],

};


// Custom Hooks



function useMounted() {

  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {

    setIsMounted(true);

  }, []);



  return isMounted;

}



// Sub-components



function SidebarHeaderComponent() {

  const { toggleSidebar, state } = useSidebar();

  const isSidebarOpen = state === "expanded";

  return (

    <SidebarHeader className="flex items-center px-6 py-4 border-b gap-3 bg-transparent">

      <div className="flex items-center gap-3 flex-1 min-w-0">

        <div className="relative">

          <Image

            src="/Logo-small.png"

            alt="BA Express Logo"

            width={40}

            height={40}

            className="flex-shrink-0 rounded-lg shadow-sm"

            style={{ width: "auto" }}

            priority

          />

          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg" />

        </div>

        <div className="min-w-0">

          <h1 className="text-xl font-bold text-gray-900 truncate">

            BA Express

          </h1>

          <p className="text-sm text-gray-500 truncate">

            Management Portal

          </p>

        </div>

      </div>

      <button

        onClick={toggleSidebar}

        className={`flex-shrink-0 p-1 md:p-1.5 rounded-md hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 ${
          isSidebarOpen 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}

        aria-label="Close sidebar"

      >

        <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />

      </button>

    </SidebarHeader>

  );

}



function NavigationSection({ title, children }: { title: string; children: React.ReactNode }) {

  return (

    <div className="px-3 py-1">

      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">

        {title}

      </div>

      {children}

    </div>

  );

}



/** Same pending statuses as requests-inbox page (pending, created, sent, open). */
function isPendingRequestStatus(s: string | undefined): boolean {
  if (!s) return false;
  const lower = String(s).toLowerCase();
  return lower === "pending" || lower === "created" || lower === "sent" || lower === "open";
}

/** Month key YYYY-MM for a vendor request (same logic as requests-inbox so badge matches page). */
function getVendorRequestMonthKey(r: VendorRequest): string {
  const isPrePayment = r.requestType === "PrePayment" || String(r.requestType).toLowerCase().replace(/_/g, "") === "prepayment";
  if (isPrePayment) {
    const d = new Date(r.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const dateStr = r.startDate || r.createdAt?.split?.("T")?.[0] || "";
  if (!dateStr) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Main Component

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { state, toggleSidebar } = useSidebar();

  const isMounted = useMounted();

  const isSidebarOpen = state === "expanded";

  const router = useRouter();

  const { user } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Operations: supervisor vê apenas o subconjunto operacional permitido.
  const operationsProjects = React.useMemo(() => {
    const list = NAVIGATION_DATA.projects;
    const roles = user?.roles ?? [];
    if (roles.includes("supervisor")) {
      return list.filter((item) => isPathAllowed(item.url, USER_TYPE_3_ALLOWED));
    }
    if (roles.includes("driver")) return [];
    return list;
  }, [user]);

  // Financial: supervisor não vê itens financeiros; vendor não vê Adhoc.
  const financialProjects = React.useMemo(() => {
    const list = NAVIGATION_DATA.financial;
    const roles = user?.roles ?? [];
    if (roles.includes("supervisor")) return [];
    if (roles.includes("driver")) return [];
    if (roles.includes("admin")) return list;
    return list.filter((item) => item.name !== "Adhoc Works Invoice Management");
  }, [user]);

  const showVendorRequests = !(user?.roles ?? []).includes("supervisor") && !(user?.roles ?? []).includes("driver");
  const isDriver = user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER || (user?.roles ?? []).includes("driver");

  const fetchPendingCount = React.useCallback(() => {
    const roles = user?.roles ?? [];
    if (!roles.includes("admin") && !roles.includes("supervisor")) return;
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      fetchVendorRequests()
        .then((list) => {
          const count = list.filter(
            (r) => getVendorRequestMonthKey(r) === currentMonthKey && isPendingRequestStatus(r.status)
          ).length;
          setPendingRequestsCount(count);
        })
        .catch(() => setPendingRequestsCount(0));
    } catch {
      setPendingRequestsCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!isMounted) return;
    fetchPendingCount();
  }, [isMounted, fetchPendingCount]);

  useEffect(() => {
    const handler = () => fetchPendingCount();
    window.addEventListener("vendor-requests-updated", handler);
    return () => window.removeEventListener("vendor-requests-updated", handler);
  }, [fetchPendingCount]);

  // Handler para navegação imediata usando startTransition
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push("/home");
    });
  };

  if (!isMounted) return null;



  return (

    <>

      <FloatingNavbar 

        onToggle={toggleSidebar} 

        isSidebarOpen={isSidebarOpen} 

      />

      

      <Sidebar

        variant="sidebar"

        collapsible="offcanvas"

        {...props}

        className="bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-sm"

      >

        <SidebarHeaderComponent />

        

        <SidebarContent className="space-y-0">

          <div className="px-3 py-1">

            <SidebarGroup>

              <SidebarMenu>

                {!isDriver && <SidebarMenuItem>

                  <SidebarMenuButton asChild>

                    <Link 
                      href="/home" 
                      prefetch={false}
                      onClick={handleHomeClick}
                      style={{ textDecoration: 'none' }}
                    >

                      <Home className="w-5 h-5" />

                      <span>Home</span>

                    </Link>

                  </SidebarMenuButton>

                </SidebarMenuItem>}

                {isDriver && <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/home" prefetch={false} style={{ textDecoration: 'none' }}>
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>}
                {isDriver && <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/daily-performance-insight" prefetch={false} style={{ textDecoration: 'none' }}>
                      <BarChart3 className="w-5 h-5" />
                      <span>My Performance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>}

                {showVendorRequests && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link 
                        href="/requests-inbox" 
                        prefetch={false}
                        style={{ textDecoration: 'none' }}
                      >
                        <Inbox className="w-5 h-5 shrink-0" />
                        <span className="truncate">Vendor requests</span>
                        <span
                          className={`ml-auto shrink-0 min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold text-white ${pendingRequestsCount > 0 ? "bg-amber-500" : "bg-slate-400"}`}
                          aria-label={`${pendingRequestsCount} pending requests`}
                        >
                          {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

              </SidebarMenu>

            </SidebarGroup>

          </div>

          

          <NavigationSection title="Operations">

            <NavOperations projects={operationsProjects} />

          </NavigationSection>

          

          {financialProjects.length > 0 && (
            <NavigationSection title="Financial">
              <NavFinancial projects={financialProjects} />
            </NavigationSection>
          )}

        </SidebarContent>

      </Sidebar>

    </>

  );

}
