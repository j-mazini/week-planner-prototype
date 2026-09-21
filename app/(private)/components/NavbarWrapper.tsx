import type { ReactNode } from "react";

export default function NavbarWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-brand" aria-label="LogixSphere">
          <span>LOGIX /</span>
          <span>SPHERE</span>
        </div>
        <button className="sidebar-toggle" type="button" aria-label="Collapse navigation">‹</button>
        <nav className="app-nav">
          <button className="app-navitem" type="button" aria-label="Home"><span className="nav-icon">⌂</span><span>Home</span></button>
          <button className="app-navitem active" type="button" aria-current="page" aria-label="Week Planner"><span className="nav-icon">▥</span><span>Week Planner</span></button>
          <button className="app-navitem" type="button" aria-label="Route Balance"><span className="nav-icon">☷</span><span>Route Balance</span></button>
          <button className="app-navitem" type="button" aria-label="Cleaning Desk"><span className="nav-icon">▤</span><span>Cleaning Desk</span></button>
        </nav>
        <div className="app-navbottom">
          <button className="app-navitem" type="button" aria-label="Support"><span className="nav-icon">?</span><span>Support</span></button>
          <button className="app-navitem" type="button" aria-label="System status"><span className="nav-icon">▣</span><span>System Status</span></button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <h1>WEEK PLANNER</h1>
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
