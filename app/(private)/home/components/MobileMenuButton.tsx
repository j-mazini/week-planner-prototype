"use client";

import * as React from "react";
import { Menu, Home, Inbox } from "lucide-react";
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

/**
 * Componente de menu para abrir a sidebar em telas menores que 720px
 * Usa a mesma estilização do DailyGamePlanStatus (liquid-glass-surface)
 */
export function MobileMenuButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [shouldShow, setShouldShow] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setShouldShow(window.innerWidth <= 767);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Operations: supervisor vê apenas o subconjunto operacional permitido.
  const operationsProjects = React.useMemo(() => {
    const list = NAVIGATION_DATA.projects;
    const roles = user?.roles ?? [];
    if (roles.includes("supervisor")) {
      return list.filter((item) => isPathAllowed(item.url, USER_TYPE_3_ALLOWED));
    }
    return list;
  }, [user]);

  // Financial: supervisor não vê itens financeiros; vendor não vê Adhoc.
  const financialProjects = React.useMemo(() => {
    const list = NAVIGATION_DATA.financial;
    const roles = user?.roles ?? [];
    if (roles.includes("supervisor")) return [];
    if (roles.includes("admin")) return list;
    return list.filter((item) => item.name !== "Adhoc Works Invoice Management");
  }, [user]);

  const showVendorRequests = !(user?.roles ?? []).includes("supervisor");

  const getIsActive = React.useCallback((url: string) => {
    return pathname === url || pathname?.startsWith(url + '/');
  }, [pathname]);

  const handleLinkClick = React.useCallback((url: string) => {
    setIsOpen(false);
    router.push(url);
  }, [router]);

  // Só renderizar após o mount e em telas menores ou iguais a 767px
  if (!isMounted || !shouldShow) {
    return null;
  }

  return (
    <>
      <div className="liquid-glass-surface rounded-2xl overflow-hidden hover:shadow-xl relative group min-h-0">
        {/* Glass highlight overlay (static) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-5 md:p-6">
          <button
            onClick={() => setIsOpen(true)}
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-3
              bg-gradient-to-r from-indigo-500 to-purple-500
              hover:from-indigo-600 hover:to-purple-600
              text-white
              font-semibold
              rounded-lg
              shadow-lg
              transition-all duration-300
              hover:shadow-xl
              active:scale-[0.98]
            "
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm sm:text-base">Open Menu</span>
          </button>
        </div>
      </div>

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
            {/* Home */}
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

