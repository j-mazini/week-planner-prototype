"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NavIcon from "./NavIcon";
import "./shell.css";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    try {
      const saved = localStorage.getItem("week-planner.sidebar-collapsed");
      setCollapsed(saved === null ? window.matchMedia("(max-width: 1100px)").matches : saved === "true");
    } catch {
      setCollapsed(window.matchMedia("(max-width: 1100px)").matches);
    }
  }, []);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("week-planner.sidebar-collapsed", String(next)); } catch { /* Storage is optional. */ }
  }
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : "is-expanded"}${pathname?.startsWith("/route-balance") ? " route-balance-shell" : ""}`}>
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-brand" aria-label="LogixSphere">
          <span>LOGIX /</span>
          <span>SPHERE</span>
        </div>
        <button className="sidebar-toggle" type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed} aria-controls="sidebar-navigation" onClick={toggleSidebar}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <nav id="sidebar-navigation" className="app-nav">
          <Link className={`app-navitem${pathname === "/home" ? " active" : ""}`} href="/home" aria-current={pathname === "/home" ? "page" : undefined} title="Home"><NavIcon kind="home" /><span>Home</span></Link>
          <Link className={`app-navitem${pathname === "/week-planner" ? " active" : ""}`} href="/week-planner" aria-current={pathname === "/week-planner" ? "page" : undefined} title="Week Planner"><NavIcon kind="planner" /><span>Week Planner</span></Link>
          <Link className={`app-navitem${pathname?.startsWith("/route-balance") ? " active" : ""}`} href="/route-balance" aria-current={pathname?.startsWith("/route-balance") ? "page" : undefined} title="Route Balance"><NavIcon kind="routes" /><span>Route Balance</span></Link>
          <Link className={`app-navitem${pathname === "/vendor" ? " active" : ""}`} href="/vendor" aria-current={pathname === "/vendor" ? "page" : undefined} title="Vendors"><NavIcon kind="vendor" /><span>Vendors</span></Link>
          <span className="app-navitem" title="Clearing Desk"><NavIcon kind="desk" /><span>Clearing Desk</span></span>
        </nav>
        <div className="app-navbottom">
          <span className="app-navitem" title="Support"><NavIcon kind="help" /><span>SUPPORT</span></span>
          <span className="app-navitem" title="System status"><NavIcon kind="status" /><span>SYSTEM STATUS</span></span>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <h1>{pathname?.startsWith("/route-balance") ? "ROUTE BALANCE" : pathname === "/home" ? "HOME" : pathname === "/vendor" ? "VENDORS" : "WEEK PLANNER"}</h1>
          <div className="app-toptools">
            <label className="app-search">
              <span className="sr-only">Search system</span>
              <input type="search" placeholder="SEARCH SYSTEM..." />
            </label>
            <span className="app-date">19/08/2026 11:20</span>
            <span className="app-divider" aria-hidden="true" />
            <span className="app-user"><NavIcon kind="user" /> João <span aria-hidden="true">⌄</span></span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
