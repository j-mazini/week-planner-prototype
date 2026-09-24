"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft, Building2, Handshake, Inbox, TrendingUp, Wallet, Activity, BarChart3, CalendarDays, CarFront, ClipboardList, FileBarChart,
  FileSpreadsheet, FileText, Gauge, Home, Landmark, LayoutDashboard, ListChecks,
  Menu, Package, Receipt, Route as RouteIcon, Settings2, ShieldCheck, Truck, Users,
} from "lucide-react";
import "./NavbarWrapper.css";

type NavKey = "home" | "week-planner" | "route-balance" | "cleaning-desk";

const importedGroups = [
  {
    label: "MY PERFORMANCE",
    items: [
      ["/daily-performance-insight", "Performance (Today)", BarChart3],
      ["/current-performance", "Performance (Month)", Gauge],
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
      ["/performance", "Performance", Gauge],
      ["/current-month", "Current month", CalendarDays],
      ["/schedule", "Schedule", CalendarDays],
      ["/vehicles", "Vehicles", CarFront], ["/week-planner-operations", "Planner operations", ClipboardList],
    ],
  },
  {
    label: "FINANCE",
    items: [
      ["/daily-financial-insights", "Financial insights", BarChart3], ["/daily-financials", "Daily financials", FileSpreadsheet],
      ["/adhoc-works-invoice-management", "Adhoc invoices", FileText],
      ["/deductions-disbursements-recharges", "Disbursements & recharges", Receipt],
      ["/financial-performance", "Financial performance", BarChart3], ["/mobile-invoice", "Mobile invoice", FileText],
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
      ["/daily-performance-insight", "Today", Gauge],
      ["/current-performance", "Month", BarChart3],
      ["/subcontractor", "Subcontractor", Users],
      ["/deductions", "Deductions", Wallet],
      ["/current-month", "Current month", CalendarDays],
      ["/mobile-invoice", "Mobile invoice", FileText],
      ["/requests", "Requests", ClipboardList],
    ],
  },
  {
    label: "Operations",
    items: [
      ["/vendor", "Vendor", Building2],
      ["/vehicles", "Vehicles", Truck],
      ["/contract-management", "Contract Management", RouteIcon],
      ["/assets", "Assets", Package],
      ["/week-planner", "Week Planner", CalendarDays],
      ["/daily-game-plan", "Daily Game Plan", ListChecks],
      ["/daily-operations-management", "Daily Operations Management", ClipboardList],
      ["/daily-operations-reports", "Daily Operations Insights", ArrowRightLeft],
      ["/vendor-performance", "Vendor performance", BarChart3],
    ],
  },
  {
    label: "Financial",
    items: [
      ["/daily-financial-insights", "Daily Financial Insights", TrendingUp],
      ["/deductions-disbursements-recharges", "Disbursements & recharges", Receipt],
      ["/financial-invoices", "Invoices", Receipt],
      ["/service-partner-invoices", "Service Partner Invoices", Handshake],
      ["/adhoc-works-invoice-management", "Adhoc Works Invoice Management", FileSpreadsheet],
    ],
  },
] as const;

export default function NavbarWrapper({ children, title }: { children: ReactNode; title: string; active: NavKey }) {
  const [collapsed, setCollapsed] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    try { setCollapsed(sessionStorage.getItem("logix-sidebar-expanded") !== "true"); } catch { /* Storage may be unavailable. */ }
  }, []);
  const toggleSidebar = () => {
    setCollapsed(previous => {
      try { sessionStorage.setItem("logix-sidebar-expanded", String(previous)); } catch { /* Keep navigation usable without storage. */ }
      return !previous;
    });
  };
  const closeSidebar = () => {
    setCollapsed(true);
    try { sessionStorage.setItem("logix-sidebar-expanded", "false"); } catch { /* Optional preference. */ }
  };
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 640px)").matches) closeSidebar();
  };
  const pages = [...new Map([
    ...sidebarGroups.flatMap(group => group.items.map(([href, label]) => [href, label] as const)),
    ...primaryItems.map(([href, label]) => [href, label] as const),
    ...importedGroups.flatMap(group => group.items.map(([href, label]) => [href, label] as const)),
    ["/route-balance", "Route Balance"] as const,
  ]).entries()];
  const matches = pages.filter(([, label]) => label.toLowerCase().includes(search.trim().toLowerCase()));
  const pathname = usePathname() ?? "";
  const renderItem = ([href, label, Icon]: (typeof primaryItems)[number] | (typeof sidebarGroups)[number]["items"][number]) => (
    <Link
      prefetch={false}
      key={href}
      className={`app-navitem${pathname === href ? " active" : ""}`}
      href={href}
      aria-label={label}
      title={collapsed ? label : undefined}
      aria-current={pathname === href ? "page" : undefined}
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
          <div className="app-navprimary">{primaryItems.map(renderItem)}</div>
          {sidebarGroups.map(group => (
            <section className="app-navgroup" key={group.label} aria-label={group.label}>
              <h2 className="app-navsection-label">{group.label}</h2>
              {group.items.map(renderItem)}
            </section>
          ))}
        </nav>
        <div className="app-navbottom">
          <button className="app-navitem" type="button" aria-label="Support"><span className="nav-icon">?</span><span>Support</span></button>
          <button className="app-navitem" type="button" aria-label="System status"><span className="nav-icon">▣</span><span>System Status</span></button>
        </div>
      </aside>
      {!collapsed && <button className="app-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={closeSidebar} />}
      <div className="app-main">
        <header className="app-topbar">
          <button className="app-mobile-menu" type="button" aria-label="Open navigation" aria-expanded={!collapsed} onClick={toggleSidebar}>
            <Menu size={20} strokeWidth={1.8} />
          </button>
          <h1>{title}</h1>
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
            <span className="app-date">19/08/2026 11:20</span>
            <span className="app-divider" aria-hidden="true" />
            <button className="app-user" type="button"><span className="user-circle">◎</span> João <span aria-hidden="true">⌄</span></button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
