"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, CalendarDays, CarFront, ClipboardList, FileBarChart,
  FileSpreadsheet, FileText, Gauge, Home, Landmark, LayoutDashboard, ListChecks,
  Package, Receipt, Route as RouteIcon, Settings2, ShieldCheck, Truck, Users,
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
      ["/subcontractor", "Subcontractor", Users], ["/schedule", "Schedule", CalendarDays],
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
      ["/requests", "Requests", ClipboardList], ["/requests-inbox", "Requests inbox", ListChecks],
      ["/requests-admin", "Requests admin", ShieldCheck],
      ["/vendor", "Vendor", Users], ["/vendor-performance", "Vendor performance", BarChart3],
    ],
  },
] as const;

export default function NavbarWrapper({ children, title, active }: { children: ReactNode; title: string; active: NavKey }) {
  const [collapsed, setCollapsed] = useState(true);
  const [search, setSearch] = useState("");
  const pages = [
    ["/home", "Home"], ["/week-planner", "Week Planner"], ["/route-balance", "Route Balance"],
    ...importedGroups.flatMap(group => group.items.map(([href, label]) => [href, label])),
  ];
  const matches = pages.filter(([, label]) => label.toLowerCase().includes(search.trim().toLowerCase()));
  const pathname = usePathname() ?? "";
  const navClass = (key: NavKey) => `app-navitem${pathname === `/${key}` ? " active" : ""}`;
  const navCurrent = (key: NavKey) => (pathname === `/${key}` ? "page" : undefined);
  return (
    <div className={`app-shell${collapsed ? "" : " sidebar-expanded"}`}>
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-brand" aria-label="LogixSphere">
          <span>LOGIX /</span>
          <span>SPHERE</span>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? "›" : "‹"}
        </button>
        <nav className="app-nav">
          <Link prefetch={false} className={navClass("home")} href="/home" aria-current={navCurrent("home")} aria-label="Home"><span className="nav-icon"><Home size={17} /></span><span>Home</span></Link>
          <Link prefetch={false} className={navClass("week-planner")} href="/week-planner" aria-current={navCurrent("week-planner")} aria-label="Week Planner"><span className="nav-icon"><CalendarDays size={17} /></span><span>Week Planner</span></Link>
          <Link prefetch={false} className={navClass("route-balance")} href="/route-balance" aria-current={navCurrent("route-balance")} aria-label="Route Balance"><span className="nav-icon"><RouteIcon size={17} /></span><span>Route Balance</span></Link>
          <button className={navClass("cleaning-desk")} type="button" aria-current={navCurrent("cleaning-desk")} aria-label="Cleaning Desk"><span className="nav-icon"><Package size={17} /></span><span>Cleaning Desk</span></button>
          {importedGroups.map((group) => (
            <div className="app-navgroup" key={group.label}>
              <div className="app-navsection-label">{group.label}</div>
              {group.items.map(([href, label, Icon]) => (
                <Link
                  prefetch={false}
                  key={href}
                  className={`app-navitem${pathname === href ? " active" : ""}`}
                  href={href}
                  aria-label={label}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <span className="nav-icon"><Icon size={17} strokeWidth={1.8} /></span><span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="app-navbottom">
          <button className="app-navitem" type="button" aria-label="Support"><span className="nav-icon">?</span><span>Support</span></button>
          <button className="app-navitem" type="button" aria-label="System status"><span className="nav-icon">▣</span><span>System Status</span></button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <h1>{title}</h1>
          <div className="app-toptools">
            <label className="app-search">
              <span className="sr-only">Search system</span>
              <input type="search" placeholder="SEARCH SYSTEM..." value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setSearch(""); }} aria-controls="system-search-results" />
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
