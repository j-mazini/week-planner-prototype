'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationPending } from '@/app/(private)/components/NavigationPendingContext';
import {
  Menu, 
  X, 
  Home,
  Building2,
  Truck,
  Route,
  Package,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  ArrowRightLeft,
  BarChart3,
  TrendingUp,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Handshake,
  Inbox,
  Gauge,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getBeamSidebarAccess,
  isPathAllowed,
  USER_TYPE_3_ALLOWED,
  USER_TYPE_5_ALLOWED,
} from '@/lib/route-permissions';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import { fetchVendorRequests, type VendorRequest } from '@/lib/vendor-requests-api';

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
    { name: "Service Partner Invoices", url: "/service-partner-invoices", icon: Handshake },
    { name: "Adhoc Works Invoice Management", url: "/adhoc-works-invoice-management", icon: FileSpreadsheet },
  ],
};

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

export function BeamSidebar() {
  const { user } = useAuth();
  const userTypeId = user?.userTypeId;
  const sidebarAccess = getBeamSidebarAccess(userTypeId);
  const isVendor = userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER;
  const canSeeNav = sidebarAccess.canSeeSidebar;
  const [isOpen, setIsOpen] = useState(false);
  const [, setPendingRequestsCount] = useState(0);
  const [maxHeight, setMaxHeight] = useState<string>('calc(100vh - 8rem)');
  const pathname = usePathname();
  const router = useRouter();
  const { setNavigationPending } = useNavigationPending();
  const navigationContainerRef = useRef<HTMLDivElement>(null);
  const mobileNavigationContainerRef = useRef<HTMLDivElement>(null);

  // Recalcular maxHeight quando a window for redimensionada
  useEffect(() => {
    const updateMaxHeight = () => {
      setMaxHeight('calc(100vh - 8rem)');
    };

    window.addEventListener('resize', updateMaxHeight);
    updateMaxHeight(); // Call initially

    return () => {
      window.removeEventListener('resize', updateMaxHeight);
    };
  }, []);

  const fetchPendingCount = useCallback(() => {
    if (!sidebarAccess.canSeeVendorRequests) return;
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
  }, [sidebarAccess.canSeeVendorRequests]);

  // Fetch pending count only when sidebar opens (avoids request on every page load)
  useEffect(() => {
    if (isOpen) fetchPendingCount();
  }, [isOpen, fetchPendingCount]);

  useEffect(() => {
    const handler = () => fetchPendingCount();
    window.addEventListener("vendor-requests-updated", handler);
    return () => window.removeEventListener("vendor-requests-updated", handler);
  }, [fetchPendingCount]);

  const operationsProjects = useMemo(() => {
    const list = NAVIGATION_DATA.projects;
    if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
      return list.filter((item) => isPathAllowed(item.url, USER_TYPE_3_ALLOWED));
    }
    if (userTypeId === BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER) {
      return list.filter((item) => isPathAllowed(item.url, USER_TYPE_5_ALLOWED));
    }
    if (userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER) return [];
    return list;
  }, [userTypeId]);

  const financialProjects = useMemo(() => {
    const list = NAVIGATION_DATA.financial;
    return sidebarAccess.canSeeFinancial ? list : [];
  }, [sidebarAccess.canSeeFinancial]);

  const showVendorRequests = sidebarAccess.canSeeVendorRequests;

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-beam-sidebar]')) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSidebar]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeSidebar]);

  // Scroll para o topo quando a modal abrir
  useEffect(() => {
    if (isOpen && navigationContainerRef.current) {
      // Pequeno delay para garantir que a animação de abertura tenha iniciado
      const timeoutId = setTimeout(() => {
        if (navigationContainerRef.current) {
          navigationContainerRef.current.scrollTop = 0;
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const isActive = useCallback((url: string) => {
    return pathname === url || pathname?.startsWith(url + '/');
  }, [pathname]);

  const handleNavigate = useCallback((url: string) => {
    if (isActive(url)) {
      closeSidebar();
      return;
    }
    setNavigationPending(url);
    closeSidebar();
    router.push(url);
  }, [isActive, closeSidebar, setNavigationPending, router]);

  // Esconde toda a bean bar (mobile + desktop) para quem não é admin/supervisor.
  if (!canSeeNav) return null;

  return (
    <>
      {/* Botão para abrir sidebar mobile - aparece apenas em telas <= 767px.
          Escondido para vendors (motoristas). */}
      {!isVendor && (
        <div className={`md:hidden fixed bottom-6 left-6 z-[10000] max-md:bottom-[5.75rem] max-md:left-5 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
          <div className="relative">
            <button
              onClick={toggleSidebar}
              className="relative overflow-hidden rounded-full w-14 h-14 inline-flex items-center justify-center transition-transform duration-180 ease-in-out outline-none hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_22px_54px_rgba(15,23,42,0.22)]"
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
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
              
              {/* Menu Icon */}
              <Menu
                className={`
                relative z-2 w-7 h-7
                transition-all duration-250
                ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
              `}
                style={{ color: 'rgba(99, 102, 241, 0.95)', filter: 'drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22))' }}
              />
              
              {/* X Icon */}
              <X
                className={`
                absolute w-7 h-7 text-white
                transition-all duration-250
                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              `}
                style={{ filter: 'drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22))' }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar - aparece apenas em telas <= 767px.
          Escondido para vendors (motoristas). */}
      {!isVendor && (
        <div className="md:hidden fixed inset-y-0 left-0 z-[9999] pointer-events-none">
          {/* Overlay para mobile */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9998] transition-opacity duration-300"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}
          
          {/* Sidebar Panel para mobile */}
          <div
            className={`
            fixed inset-y-0 left-0 w-[280px] max-w-[85vw]
            bg-transparent
            transform transition-transform duration-300 ease-out
            z-[9999]
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            pointer-events-auto
          `}
          >
              <div
                ref={mobileNavigationContainerRef}
                className="relative overflow-x-hidden rounded-r-2xl p-4 flex flex-col gap-3 h-full"
                style={{
                  maxHeight: '100vh',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.26)',
                  borderLeft: 'none',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 40%, rgba(236, 72, 153, 0.05) 72%, rgba(255, 255, 255, 0.18) 100%)',
                  backdropFilter: 'blur(18px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 8px 18px rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const spans = target.querySelectorAll('span[aria-hidden]') as NodeListOf<HTMLElement>;
                  if (spans[2]) {
                    spans[2].style.animation = 'liquidGlassSheen 900ms ease-out';
                  }
                  if (spans[1]) {
                    spans[1].style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  const spans = target.querySelectorAll('span[aria-hidden]') as NodeListOf<HTMLElement>;
                  if (spans[1]) {
                    spans[1].style.opacity = '0.75';
                  }
                }}
              >
                {/* Liquid blobs (::after) */}
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: 0.75,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(240px 160px at 12% 20%, rgba(99, 102, 241, 0.24), transparent 62%), radial-gradient(260px 180px at 88% 70%, rgba(236, 72, 153, 0.18), transparent 66%), radial-gradient(220px 160px at 55% 8%, rgba(14, 165, 233, 0.14), transparent 62%)',
                    filter: 'blur(16px)',
                    mixBlendMode: 'screen',
                  }}
                />
                {/* Liquid glass sheen effect */}
                <span
                  aria-hidden
                  className="absolute top-0 left-[-40%] w-[40%] h-full opacity-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(191, 219, 254, 0.55), transparent)',
                  }}
                />
                
                {/* Close button para mobile */}
                <button
                  onClick={closeSidebar}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Navigation Content - mesma estrutura do desktop */}
                <div className="mt-12 flex flex-col gap-3">
                  {/* Home */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigate("/home");
                    }}
                    className={`
                    flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                    bg-white border border-gray-200
                    transition-all duration-300
                    hover:shadow-lg
                    ${isActive("/home")
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                      : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                    }
                    group
                    `}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div
                      className={`
                      w-1.5 h-1.5 rounded-full
                      ${isActive("/home")
                        ? 'bg-white' 
                        : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                      }
                    `}
                    />
                    <Home
                      className={`
                      w-5 h-5 flex-shrink-0
                      ${isActive("/home") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                      transition-colors
                    `}
                    />
                    <span className="font-medium text-sm whitespace-nowrap">
                      Home
                    </span>
                  </button>

                  {/* MY PERFORMANCE */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigate("/daily-performance-insight");
                    }}
                    className={`
                    flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                    bg-white border border-gray-200
                    transition-all duration-300
                    hover:shadow-lg
                    ${isActive("/daily-performance-insight")
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                      : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                    }
                    group
                    `}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div
                      className={`
                      w-1.5 h-1.5 rounded-full
                      ${isActive("/daily-performance-insight")
                        ? 'bg-white' 
                        : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                      }
                    `}
                    />
                    <Gauge
                      className={`
                      w-5 h-5 flex-shrink-0
                      ${isActive("/daily-performance-insight") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                      transition-colors
                    `}
                    />
                    <span className="font-medium text-sm whitespace-nowrap">
                      MY PERFORMANCE
                    </span>
                  </button>

                  {/* Vendor Requests */}
                  {showVendorRequests && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigate("/requests-inbox");
                      }}
                      className={`
                      flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                      bg-white border border-gray-200
                      transition-all duration-300
                      hover:shadow-lg
                      ${isActive("/requests-inbox")
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                        : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                        }
                        group
                      `}
                    >
                      <div
                        className={`
                        w-1.5 h-1.5 rounded-full
                        ${isActive("/requests-inbox")
                          ? 'bg-white' 
                          : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                        }
                      `}
                      />
                      <Inbox
                        className={`
                        w-5 h-5 flex-shrink-0
                        ${isActive("/requests-inbox") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                        transition-colors
                      `}
                      />
                      <span className="font-medium text-sm whitespace-nowrap">
                        Vendor Requests
                      </span>
                    </button>
                  )}

                  {/* Operations Section */}
                  {operationsProjects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="px-4 py-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Operations
                        </span>
                      </div>
                      {operationsProjects.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.url);
                        const isDailyOpsManagement = item.name === "Daily Operations Management";

                        return (
                          <button
                            key={item.url}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavigate(item.url);
                            }}
                            className={`
                            flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                            bg-white border border-gray-200
                            transition-all duration-300
                            hover:shadow-lg
                            ${active 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg' 
                              : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                              }
                              group
                            `}
                            style={{
                              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                          >
                            <div
                              className={`
                              w-1.5 h-1.5 rounded-full
                              ${active 
                                ? 'bg-white' 
                                : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                              }
                            `}
                            />
                            <Icon
                              className={`
                              w-5 h-5 flex-shrink-0
                              ${active ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                              transition-colors
                            `}
                            />
                            <span 
                              className="font-medium text-sm whitespace-nowrap"
                              style={isDailyOpsManagement ? { fontSize: 'calc(0.875rem * 0.98)' } : {}}
                            >
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Financial Section */}
                  {financialProjects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="px-4 py-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Financial
                        </span>
                      </div>
                      {financialProjects.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.url);
                        const isAdhocWorks = item.name === "Adhoc Works Invoice Management";

                        return (
                          <button
                            key={item.url}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNavigate(item.url);
                            }}
                            className={`
                            flex items-center ${isAdhocWorks ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-xl w-full ${isAdhocWorks ? 'text-left' : 'text-center'}
                            bg-white border border-gray-200
                            transition-all duration-300
                            hover:shadow-lg
                            ${active 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg' 
                              : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                              }
                              group
                            `}
                            style={{
                              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                          >
                            <div
                              className={`
                              w-1.5 h-1.5 rounded-full
                              ${active 
                                ? 'bg-white' 
                                : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                              }
                            `}
                            />
                            <Icon
                              className={`
                              w-5 h-5 flex-shrink-0
                              ${active ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                              transition-colors
                            `}
                            />
                            <span 
                              className={`font-medium text-sm ${isAdhocWorks ? 'break-words text-left' : 'whitespace-nowrap'}`}
                              style={isAdhocWorks ? { fontSize: 'calc(0.875rem * 0.98)' } : {}}
                            >
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Desktop Beam Sidebar Container - aparece apenas em telas >= 768px */}
      {/* Overlay */}
      {isOpen && (
        <div
          className="hidden md:block fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[9998] transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Beam Sidebar Container */}
      <div
        data-beam-sidebar
        data-state={isOpen ? 'open' : 'closed'}
        className="fixed bottom-6 left-6 z-[9999] pointer-events-none hidden md:block"
      >
        {/* Navigation Plates */}
        <div
          ref={navigationContainerRef}
          className={`relative overflow-x-hidden rounded-2xl p-4 flex flex-col gap-3 mb-3 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            maxHeight: isOpen ? maxHeight : '0',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
            transition: 'max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflowY: isOpen ? 'auto' : 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            border: '1px solid rgba(255, 255, 255, 0.26)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.10) 0%, rgba(139, 92, 246, 0.08) 40%, rgba(236, 72, 153, 0.05) 72%, rgba(255, 255, 255, 0.18) 100%)',
            backdropFilter: 'blur(18px) saturate(180%)',
            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
            boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 8px 18px rgba(0, 0, 0, 0.06)',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            const spans = target.querySelectorAll('span[aria-hidden]') as NodeListOf<HTMLElement>;
            // Animate sheen (second span)
            if (spans[2]) {
              spans[2].style.animation = 'liquidGlassSheen 900ms ease-out';
            }
            // Increase liquid blobs opacity on hover (third span)
            if (spans[1]) {
              spans[1].style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            const spans = target.querySelectorAll('span[aria-hidden]') as NodeListOf<HTMLElement>;
            // Reset liquid blobs opacity on leave (third span)
            if (spans[1]) {
              spans[1].style.opacity = '0.75';
            }
          }}
        >
          {/* Liquid blobs (::after) */}
          <span
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.75,
              borderRadius: 'inherit',
              background: 'radial-gradient(240px 160px at 12% 20%, rgba(99, 102, 241, 0.24), transparent 62%), radial-gradient(260px 180px at 88% 70%, rgba(236, 72, 153, 0.18), transparent 66%), radial-gradient(220px 160px at 55% 8%, rgba(14, 165, 233, 0.14), transparent 62%)',
              filter: 'blur(16px)',
              mixBlendMode: 'screen',
            }}
          />
          {/* Liquid glass sheen effect */}
          <span
            aria-hidden
            className="absolute top-0 left-[-40%] w-[40%] h-full opacity-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(191, 219, 254, 0.55), transparent)',
            }}
          />
          {/* Home */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigate("/home");
            }}
            className={`
              flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
              bg-white border border-gray-200
              transition-all duration-300
              hover:shadow-lg
              ${isActive("/home")
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
              }
              group
            `}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                ${isActive("/home")
                  ? 'bg-white' 
                  : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                }
              `}
            />
            <Home
              className={`
                w-5 h-5 flex-shrink-0
                ${isActive("/home") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                transition-colors
              `}
            />
            <span className="font-medium text-sm whitespace-nowrap">
              Home
            </span>
          </button>

          {/* MY PERFORMANCE */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigate("/daily-performance-insight");
            }}
            className={`
              flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
              bg-white border border-gray-200
              transition-all duration-300
              hover:shadow-lg
              ${isActive("/daily-performance-insight")
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
              }
              group
            `}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                ${isActive("/daily-performance-insight")
                  ? 'bg-white' 
                  : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                }
              `}
            />
            <Gauge
              className={`
                w-5 h-5 flex-shrink-0
                ${isActive("/daily-performance-insight") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                transition-colors
              `}
            />
            <span className="font-medium text-sm whitespace-nowrap">
              MY PERFORMANCE
            </span>
          </button>

          {/* Vendor Requests */}
          {showVendorRequests && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigate("/requests-inbox");
              }}
              className={`
                flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                bg-white border border-gray-200
                transition-all duration-300
                hover:shadow-lg
                ${isActive("/requests-inbox")
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                  : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                }
                group
              `}
            >
              <div
                className={`
                  w-1.5 h-1.5 rounded-full
                  ${isActive("/requests-inbox")
                    ? 'bg-white' 
                    : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                  }
                `}
              />
              <Inbox
                className={`
                  w-5 h-5 flex-shrink-0
                  ${isActive("/requests-inbox") ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                  transition-colors
                `}
              />
              <span className="font-medium text-sm whitespace-nowrap">
                Vendor Requests
              </span>
            </button>
          )}

          {/* Operations Section */}
          {operationsProjects.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Operations
                </span>
              </div>
              {operationsProjects.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                const isDailyOpsManagement = item.name === "Daily Operations Management";

                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigate(item.url);
                    }}
                    className={`
                      flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-center
                      bg-white border border-gray-200
                      transition-all duration-300
                      hover:shadow-lg
                      ${active 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg' 
                        : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                      }
                      group
                    `}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div
                      className={`
                        w-1.5 h-1.5 rounded-full
                        ${active 
                          ? 'bg-white' 
                          : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                        }
                      `}
                    />
                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0
                        ${active ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                        transition-colors
                      `}
                    />
                    <span 
                      className="font-medium text-sm whitespace-nowrap"
                      style={isDailyOpsManagement ? { fontSize: 'calc(0.875rem * 0.98)' } : {}}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Financial Section */}
          {financialProjects.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Financial
                </span>
              </div>
              {financialProjects.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                const isAdhocWorks = item.name === "Adhoc Works Invoice Management";

                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigate(item.url);
                    }}
                    className={`
                      flex items-center ${isAdhocWorks ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-xl w-full ${isAdhocWorks ? 'text-left' : 'text-center'}
                      bg-white border border-gray-200
                      transition-all duration-300
                      hover:shadow-lg
                      ${active 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg' 
                        : 'text-gray-700 hover:border-indigo-200 hover:shadow-md'
                      }
                      group
                    `}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <div
                      className={`
                        w-1.5 h-1.5 rounded-full
                        ${active 
                          ? 'bg-white' 
                          : 'bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity'
                        }
                      `}
                    />
                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0
                        ${active ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}
                        transition-colors
                      `}
                    />
                    <span 
                      className={`font-medium text-sm ${isAdhocWorks ? 'break-words text-left' : 'whitespace-nowrap'}`}
                      style={isAdhocWorks ? { fontSize: 'calc(0.875rem * 0.98)' } : {}}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Circular Button */}
        <button
          onClick={toggleSidebar}
          className={`
            w-14 h-14 rounded-full
            bg-gradient-to-br from-indigo-500 to-purple-500
            shadow-lg
            flex items-center justify-center
            transition-all duration-300
            hover:scale-[1.08] hover:shadow-xl
            pointer-events-auto
            relative
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          `}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
        >
          {/* Menu Icon */}
          <Menu
            className={`
              absolute w-6 h-6 text-white
              transition-all duration-250
              ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
            `}
          />
          
          {/* X Icon */}
          <X
            className={`
              absolute w-6 h-6 text-white
              transition-all duration-250
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          />
        </button>
      </div>

      {/* Animations for liquid glass effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquidGlassFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        @keyframes liquidGlassSheen {
          0% { transform: translateX(-120%) opacity: 0; }
          20% { opacity: 0.55; }
          60% { opacity: 0.35; }
          100% { transform: translateX(220%) opacity: 0; }
        }
      `}} />
    </>
  );
}
