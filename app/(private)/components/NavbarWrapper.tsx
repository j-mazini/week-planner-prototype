import type { ReactNode } from "react";
import Link from "next/link";
import "./NavbarWrapper.css";

type NavKey = "home" | "week-planner" | "route-balance" | "cleaning-desk";

export default function NavbarWrapper({ children, title, active }: { children: ReactNode; title: string; active: NavKey }) {
  const navClass = (key: NavKey) => `app-navitem${active === key ? " active" : ""}`;
  const navCurrent = (key: NavKey) => (active === key ? "page" : undefined);
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-brand" aria-label="LogixSphere">
          <span>LOGIX /</span>
          <span>SPHERE</span>
        </div>
        <button className="sidebar-toggle" type="button" aria-label="Collapse navigation">‹</button>
        <nav className="app-nav">
          <button className={navClass("home")} type="button" aria-current={navCurrent("home")} aria-label="Home"><span className="nav-icon">⌂</span><span>Home</span></button>
          <Link className={navClass("week-planner")} href="/week-planner" aria-current={navCurrent("week-planner")} aria-label="Week Planner"><span className="nav-icon">▥</span><span>Week Planner</span></Link>
          <Link className={navClass("route-balance")} href="/route-balance" aria-current={navCurrent("route-balance")} aria-label="Route Balance"><span className="nav-icon">☷</span><span>Route Balance</span></Link>
          <button className={navClass("cleaning-desk")} type="button" aria-current={navCurrent("cleaning-desk")} aria-label="Cleaning Desk"><span className="nav-icon">▤</span><span>Cleaning Desk</span></button>
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
              <input type="search" placeholder="SEARCH SYSTEM..." />
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
