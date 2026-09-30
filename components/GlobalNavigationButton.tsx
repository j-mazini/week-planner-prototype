"use client";

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isPathAllowed, USER_TYPE_3_ALLOWED } from "@/lib/route-permissions";
import {
  ArrowRightLeft,
  Calendar,
  Building2,
  Truck,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  Route,
  Package,
  FileSpreadsheet,
  Home,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavigationData {
  projects: NavItem[];
  financial: NavItem[];
}

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

export function GlobalNavigationButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isDriver = user?.userTypeId === 2 || (user?.roles ?? []).includes("driver");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const showVendorRequests = !(user?.roles ?? []).includes("supervisor") && !isDriver;

  const getIsActive = React.useCallback((url: string) => {
    return pathname === url || pathname?.startsWith(url + '/');
  }, [pathname]);

  const handleLinkClick = React.useCallback((url: string) => {
    setIsOpen(false);
    router.push(url);
  }, [router]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Botão Flutuante de Navegação - Oculto em mobile (<=767px) pois BeamSidebar já tem seu próprio botão */}
      <div className="fixed bottom-6 left-6 z-50 max-md:bottom-[5.75rem] max-md:left-5 hidden md:hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative overflow-hidden rounded-full w-16 h-16 inline-flex items-center justify-center transition-transform duration-180 ease-in-out outline-none hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_22px_54px_rgba(15,23,42,0.22)]"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.14) 45%, rgba(255, 255, 255, 0.06) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(18px) saturate(180%)',
              WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              boxShadow: '0 18px 42px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 10px 24px rgba(0, 0, 0, 0.10), 0 0 0 6px rgba(99, 102, 241, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.24) 0%, rgba(139, 92, 246, 0.18) 45%, rgba(255, 255, 255, 0.08) 100%)';
              e.currentTarget.style.boxShadow = '0 22px 54px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.14) inset, 0 12px 28px rgba(0, 0, 0, 0.12), 0 0 0 6px rgba(99, 102, 241, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.14) 45%, rgba(255, 255, 255, 0.06) 100%)';
              e.currentTarget.style.boxShadow = '0 18px 42px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 10px 24px rgba(0, 0, 0, 0.10), 0 0 0 6px rgba(99, 102, 241, 0.05)';
            }}
            aria-label="Open navigation menu"
          >
            <span className="sr-only">Open navigation menu</span>
            {/* Ícone */}
            <Menu className="relative z-2 w-7 h-7" style={{ color: 'rgba(99, 102, 241, 0.95)', filter: 'drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22))' }} />
          </button>
        </div>
      </div>

      {/* Menu de Navegação */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="!w-[300px] sm:!w-[350px] overflow-y-auto !p-0 !rounded-r-2xl border-r border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.30) 0%, rgba(167, 139, 250, 0.25) 40%, rgba(196, 181, 253, 0.20) 72%, rgba(255, 255, 255, 0.50) 100%) !important',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-2 min-h-full">
            {isDriver && <button
              onClick={() => handleLinkClick("/daily-performance-insight")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left bg-white hover:bg-gray-50 text-gray-800"
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span>My Performance</span>
            </button>}

            {/* Home */}
            {!isDriver && <>
            <button
              onClick={() => handleLinkClick("/home")}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors text-left relative
                ${getIsActive("/home") 
                  ? "bg-indigo-600 text-white font-medium" 
                  : "bg-white hover:bg-gray-50 text-gray-800"
                }
              `}
            >
              {getIsActive("/home") && (
                <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-gray-800" />
              )}
              <Home className={`w-5 h-5 flex-shrink-0 ${getIsActive("/home") ? "text-white" : "text-gray-700"}`} />
              <span>Home</span>
            </button>
            </>}

            {/* Requests Inbox */}
            {showVendorRequests && (
              <button
                onClick={() => handleLinkClick("/requests-inbox")}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors text-left relative
                  ${getIsActive("/requests-inbox") 
                    ? "bg-indigo-600 text-white font-medium" 
                    : "bg-white hover:bg-gray-50 text-gray-800"
                  }
                `}
              >
                {getIsActive("/requests-inbox") && (
                  <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-gray-800" />
                )}
                <Inbox className={`w-5 h-5 flex-shrink-0 ${getIsActive("/requests-inbox") ? "text-white" : "text-gray-700"}`} />
                <span>Requests Inbox</span>
              </button>
            )}

            {/* Operations Section */}
            {operationsProjects.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
                  Operations
                </h3>
                <div className="space-y-1">
                  {operationsProjects.map((item) => {
                    const isActive = getIsActive(item.url);
                    return (
                      <button
                        key={item.url}
                        onClick={() => handleLinkClick(item.url)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg
                          transition-colors text-left relative
                          ${isActive 
                            ? "bg-indigo-600 text-white font-medium" 
                            : "bg-white hover:bg-gray-50 text-gray-800"
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-gray-800" />
                        )}
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-700"}`} />
                        <span className="break-words">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Financial Section */}
            {financialProjects.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 mb-3">
                  Financial
                </h3>
                <div className="space-y-1">
                  {financialProjects.map((item) => {
                    const isActive = getIsActive(item.url);
                    return (
                      <button
                        key={item.url}
                        onClick={() => handleLinkClick(item.url)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg
                          transition-colors text-left relative
                          ${isActive 
                            ? "bg-indigo-600 text-white font-medium" 
                            : "bg-white hover:bg-gray-50 text-gray-800"
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-gray-800" />
                        )}
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-700"}`} />
                        <span className="break-words">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
