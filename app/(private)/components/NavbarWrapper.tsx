"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightLeft, Building2, Handshake, Inbox, TrendingUp, Wallet, Activity, BarChart3, CalendarDays, CarFront, ClipboardList, FileBarChart,
  FileSpreadsheet, FileText, Gauge, Home, Landmark, LayoutDashboard, ListChecks,
  Menu, Package, Receipt, Route as RouteIcon, Scale, Settings2, ShieldCheck, Truck, Users, ChevronDown, LogOut, UserRound, type LucideIcon,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_MODE } from "@/lib/mock-api";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { isPathAllowed, USER_TYPE_2_ALLOWED, USER_TYPE_3_ALLOWED } from "@/lib/route-permissions";
import "./NavbarWrapper.css";

function CurrentDate() {
  const [date, setDate] = useState("");
  useEffect(() => {
    const update = () => setDate(new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <>{date}</>;
}

type NavKey = "home" | "week-planner" | "route-balance" | "cleaning-desk";

const importedGroups = [
  {
    label: "MY PERFORMANCE",
    items: [
      ["/daily-performance-insight", "Performance (Today)", BarChart3],
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      ["/daily", "Daily", Activity], ["/daily-game-plan", "Game plan", ListChecks],
      ["/daily-operations-management", "Daily operations", ClipboardList],
      ["/daily-operations-reports", "Operations reports", FileBarChart], ["/logistics", "Logistics", Truck],
      ["/op-dashboard", "Operations dashboard", LayoutDashboard], ["/operations-management", "Operations management", Settings2],
      ["/op-management", "Operations control", Settings2],
      ["/current-month", "Current month", CalendarDays],
      ["/schedule", "Schedule", CalendarDays],
      ["/vehicles", "Vehicles", CarFront],
    ],
  },
  {
    label: "FINANCE",
    items: [
      ["/daily-financial-insights", "Financial insights", BarChart3], ["/daily-financials", "Daily financials", FileSpreadsheet],
      ["/adhoc-works-invoice-management", "Adhoc invoices", FileText],
      ["/deductions-disbursements-recharges", "Disbursements & recharges", Receipt],
      ["/mobile-invoice", "My invoice", FileText],
      ["/deductions", "Deductions", Receipt], ["/financial-invoices", "Financial invoices", FileText],
      ["/financial-management", "Financial management", Landmark], ["/invoice-history", "Invoice history", FileText],
      ["/invoice-processing-workflow", "Invoice workflow", RouteIcon], ["/service-partner-invoices", "Partner invoices", FileText],
    ],
  },
  {
    label: "CONTROL",
    items: [
      ["/assets", "Assets", Package], ["/contract-management", "Contracts", ShieldCheck],
      ["/requests-inbox", "Requests inbox", ListChecks],
      ["/requests-admin", "Requests admin", ShieldCheck],
      ["/vendor", "Vendor", Users], ["/vendor-performance", "Vendor performance", BarChart3],
    ],
  },
] as const;

// Names, order and destinations follow the original Logixsphere BeamSidebar.
const primaryItems = [
  ["/home", "Home", Home],
  ["/requests-inbox", "Vendor Requests", Inbox],
] as const;

const sidebarGroups = [
  {
    label: "My Performance",
    items: [
      ["/driver-route-balance", "My Route Balance", RouteIcon],
      ["/daily-performance-insight", "Today", Gauge],
      ["/current-performance", "Current Performance", BarChart3],
      ["/subcontractor", "Subcontractor", Users],
      ["/deductions", "Deductions", Wallet],
      ["/current-month", "Current month", CalendarDays],
      ["/mobile-invoice", "My invoice", FileText],
      ["/requests", "Requests", ClipboardList],
    ],
  },
  {
    label: "Operations",
    items: [
      ["/vendor", "Vendor", Building2],
      ["/vehicles", "Vehicles", Truck],
      ["/contract-management", "Contracts", RouteIcon],
      ["/assets", "Assets", Package],
      ["/week-planner", "Week Planner", CalendarDays],
      ["/route-balance", "Route Balance", Scale],
      ["/daily-game-plan", "Daily Game Plan", ListChecks],
      ["/daily-operations-management", "Daily Operations", ClipboardList],
      ["/daily-operations-reports", "Daily Insights", ArrowRightLeft],
      ["/vendor-performance", "Vendor performance", BarChart3],
    ],
  },
  {
    label: "Financial",
    items: [
      ["/daily-financial-insights", "Financial Insights", TrendingUp],
      ["/deductions-disbursements-recharges", "Disbursements & recharges", Receipt],
      ["/financial-invoices", "Invoices", Receipt],
      ["/service-partner-invoices", "Partner Invoices", Handshake],
      ["/adhoc-works-invoice-management", "Adhoc Invoices", FileSpreadsheet],
    ],
  },
] as const;

type NavItem = readonly [string, string, LucideIcon];
type NavGroup = { label: string; items: NavItem[] };

// Keep one destination per menu, merging the imported and original navigation.
const navigationGroups: NavGroup[] = [];
const includedRoutes = new Set<string>(['/home']);
for (const group of [...sidebarGroups, ...importedGroups]) {
  const label = group.label === 'MY PERFORMANCE' ? 'My Performance' :
    group.label === 'OPERATIONS' ? 'Operations' : group.label === 'FINANCE' ? 'Financial' : group.label === 'CONTROL' ? 'Control' : group.label;
  let target = navigationGroups.find(item => item.label === label);
  if (!target) { target = {label, items: []}; navigationGroups.push(target); }
  for (const item of group.items) {
    if (includedRoutes.has(item[0])) continue;
    includedRoutes.add(item[0]);
    target.items.push(item);
  }
}
const groupIcons: Record<string, LucideIcon> = { 'My Performance': Gauge, Operations: Truck, Financial: Wallet, Control: Settings2 };

export default function NavbarWrapper({ children, title }: { children: ReactNode; title?: string; active?: NavKey }) {
  const [collapsed, setCollapsed] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null | undefined>(undefined);
  const router = useRouter();
  const { user, login, logout } = useAuth();
  // Deliberately not remembered: every page load starts collapsed.
  const toggleSidebar = () => setCollapsed(previous => !previous);
  const closeSidebar = () => setCollapsed(true);
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 640px)").matches) closeSidebar();
  };
  const pages = [...new Map([
    ...sidebarGroups.flatMap(group => group.items.map(([href, label]) => [href, label] as const)),
    ...primaryItems.map(([href, label]) => [href, label] as const),
    ...importedGroups.flatMap(group => group.items.map(([href, label]) => [href, label] as const)),
    ["/route-balance", "Route Balance"] as const,
  ]).entries()];
  const pathname = usePathname() ?? "";
  const activePath = pathname === "/week-planner-operations" ? "/daily-operations-management" : pathname;
  useEffect(() => { setExpandedGroup(undefined); }, [pathname]);
  const routeTitles: Record<string, string> = {
    "/home": "Home",
    "/daily-performance-insight": "My Performance",
    "/subcontractor": "Subcontractor",
    "/deductions": "Deductions",
    "/current-month": "Current Month",
    "/current-performance": "Current Performance",
    "/driver-route-balance": "My Route Balance",
    "/mobile-invoice": "My Invoice",
    "/requests": "Requests",
  };
  const navbarTitle = title ?? routeTitles[pathname] ?? "Logixsphere";
  const activeProfile = user?.roles.includes("supervisor") || user?.userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR
    ? "Supervisor"
    : user?.roles.includes("driver") || user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER
      ? "Driver"
      : "Admin";
  const isSupervisor = activeProfile === "Supervisor";
  const isDriver = activeProfile === "Driver";
  const canShowSearchPage = (href: string) =>
    isSupervisor ? isPathAllowed(href, USER_TYPE_3_ALLOWED) :
    isDriver ? isPathAllowed(href, USER_TYPE_2_ALLOWED) : true;
  const matches = pages.filter(([href, label]) => canShowSearchPage(href) && label.toLowerCase().includes(search.trim().toLowerCase()));
  const visibleGroups = navigationGroups.map(group => ({...group, items: group.items.filter(([href]) => canShowSearchPage(href))})).filter(group => group.items.length);
  const activeGroup = visibleGroups.find(group => group.items.some(([href]) => activePath === href || activePath.startsWith(`${href}/`)))?.label;
  const openGroup = expandedGroup === undefined ? activeGroup ?? visibleGroups[0]?.label : expandedGroup;
  const toggleGroup = (label: string) => {
    setExpandedGroup(collapsed || openGroup !== label ? label : null);
    if (collapsed) {
      setCollapsed(false);
    }
  };
  const switchDemoProfile = (profile: "admin" | "supervisor" | "driver") => {
    if (!MOCK_MODE || !user) return;
    const profileData = profile === "admin"
      ? { userTypeId: BUSINESS_RULES.USER_TYPE.ADMIN, roles: ["admin"], permissions: ["all_access"] }
      : profile === "supervisor"
        ? { userTypeId: BUSINESS_RULES.USER_TYPE.SUPERVISOR, roles: ["supervisor"], permissions: [] }
        : { userTypeId: BUSINESS_RULES.USER_TYPE.DRIVER, roles: ["driver"], permissions: [] };
    login({ user: { ...user, ...profileData } });
    router.push(profile === "admin" ? "/home" : profile === "supervisor" ? "/week-planner" : "/home");
  };
  const renderItem = ([href, label, Icon]: NavItem) => (
    <Link
      prefetch={false}
      key={href}
      className={`app-navitem${activePath === href ? " active" : ""}`}
      href={href}
      aria-label={label}
      title={collapsed ? label : undefined}
      aria-current={activePath === href ? "page" : undefined}
      onClick={closeOnMobile}
    >
      <span className="nav-icon"><Icon size={20} strokeWidth={1.8} /></span>
      <span>{label}</span>
    </Link>
  );
  return (
    <div className={`app-shell${collapsed ? "" : " sidebar-expanded"}`}>
      <aside className="app-sidebar" aria-label="Main navigation" onKeyDown={event => { if (event.key === "Escape") { closeSidebar(); event.currentTarget.querySelector<HTMLButtonElement>(".sidebar-toggle")?.focus(); } }}>
        <div className="app-brand" aria-label="LogixSphere">
          <span>LOGIX /</span>
          <span>SPHERE</span>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          aria-controls="sidebar-navigation"
          onClick={toggleSidebar}
        >
          {collapsed ? "›" : "‹"}
        </button>
        <nav className="app-nav" id="sidebar-navigation">
          <div className="app-navprimary">{primaryItems.filter(([href]) => href === "/home" && canShowSearchPage(href)).map(renderItem)}</div>
          {visibleGroups.map(group => {
            const Icon = groupIcons[group.label] ?? Menu;
            const open = !collapsed && openGroup === group.label;
            const id = `nav-group-${group.label.toLowerCase().replaceAll(' ', '-')}`;
            return <section className="app-navgroup" key={group.label} aria-label={group.label}>
              <button className={`app-navgroup-toggle${activeGroup === group.label ? ' is-current' : ''}`} type="button"
                title={collapsed ? group.label : undefined} aria-label={group.label} aria-expanded={open} aria-controls={id}
                onClick={() => toggleGroup(group.label)}>
                <Icon size={18} aria-hidden="true" />
                <span>{group.label}</span>
                <ChevronDown size={14} className="app-navgroup-chevron" aria-hidden="true" />
              </button>
              <div id={id} hidden={!open}>{open && group.items.map(renderItem)}</div>
            </section>;
          })}
        </nav>
        {!isSupervisor && !isDriver && <div className="app-navbottom">
          <button className="app-navitem" type="button" aria-label="Support"><span className="nav-icon">?</span><span>Support</span></button>
          <button className="app-navitem" type="button" aria-label="System status"><span className="nav-icon">▣</span><span>System Status</span></button>
        </div>}
      </aside>
      {!collapsed && <button className="app-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
      <div className="app-main">
        <header className="app-topbar">
          <button className="app-mobile-menu" type="button" aria-label="Open navigation" aria-expanded={!collapsed} onClick={toggleSidebar}>
            <Menu size={20} strokeWidth={1.8} />
          </button>
          <h1>{navbarTitle}</h1>
          <div className="app-toptools">
            <label className="app-search">
              <span className="sr-only">Search system</span>
              <input type="search" aria-label="Search system" placeholder="SEARCH SYSTEM..." value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setSearch(""); }} aria-controls="system-search-results" />
              {search.trim() && (
                <span id="system-search-results" className="app-search-results" role="region" aria-label="Matching pages">
                  {matches.length ? matches.map(([href, label]) => <Link prefetch={false} key={href} href={href} onClick={() => setSearch("")}>{label}</Link>) : <span role="status">No pages found.</span>}
                </span>
              )}
            </label>
            <span className="app-date"><CurrentDate /></span>
            <span className="app-divider" aria-hidden="true" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="app-user" type="button" aria-label={`Account: ${user?.name ?? "João Silva"}, ${activeProfile}`}>
                  <span className="user-circle"><UserRound size={18} strokeWidth={1.8} /></span>
                  <span className="app-user-details"><span>{user?.name ?? "João Silva"}</span><small>{activeProfile}</small></span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56">
                <DropdownMenuLabel>{user?.email ?? "Signed in"}</DropdownMenuLabel>
                {MOCK_MODE && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
                    <DropdownMenuItem disabled={activeProfile === "Admin"} onClick={() => switchDemoProfile("admin")}>
                      <ShieldCheck size={16} className="mr-2" /> Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={activeProfile === "Supervisor"} onClick={() => switchDemoProfile("supervisor")}>
                      <ShieldCheck size={16} className="mr-2" /> Supervisor
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={activeProfile === "Driver"} onClick={() => switchDemoProfile("driver")}>
                      <Truck size={16} className="mr-2" /> Driver
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut size={16} className="mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
