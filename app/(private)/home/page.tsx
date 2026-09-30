"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, CircleAlert,
  Clock3, Gauge, LayoutGrid, MapPinned, PackageCheck, Plus, RefreshCw, Route, Search, Truck, Users,
} from "lucide-react";
import NavbarWrapper from "@/components/navbar-wrapper";
import DriverHome from "./DriverHome";
import { useAuth } from "@/hooks/useAuth";
import { greet } from "@/lib/greeting";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import "./home-new.css";

const kpis = [
  { label: "Routes today", value: "28", note: "+4 vs yesterday", icon: Route, tone: "lime" },
  { label: "On the road", value: "21", note: "75% dispatched", icon: Truck, tone: "teal" },
  { label: "Open exceptions", value: "06", note: "2 need attention", icon: CircleAlert, tone: "amber" },
  { label: "Service level", value: "96.4%", note: "+1.8% this week", icon: Gauge, tone: "ink" },
] as const;

const schedule = [
  { time: "06:45", route: "MD7C", driver: "Ana Costa", depot: "North Dock", status: "Complete", tone: "done" },
  { time: "07:30", route: "LX12", driver: "João Silva", depot: "Central Hub", status: "On route", tone: "live" },
  { time: "08:10", route: "BR04", driver: "Marta Reis", depot: "South Yard", status: "Preparing", tone: "next" },
  { time: "09:00", route: "NW21", driver: "Pedro Alves", depot: "North Dock", status: "Exception", tone: "alert" },
];

const quickLinks = [
  ["/week-planner", "Week Planner", "Build and review the weekly board", CalendarDays],
  ["/route-balance", "Route Balance", "Compare capacity before dispatch", Route],
  ["/daily-game-plan", "Daily Game Plan", "Review today's operating rhythm", Activity],
  ["/financial-invoices", "Financial Invoices", "Track the current invoice cycle", PackageCheck],
] as const;

const pageGroups = [
  { label: "MY PERFORMANCE", pages: [["/driver-route-balance", "My Route", "View your assigned routes"], ["/daily-performance-insight", "Daily Performance", "Inspect daily detail"], ["/subcontractor", "Subcontractor", "Review subcontractor activity"], ["/deductions", "Deductions", "Manage deductions"], ["/current-month", "Current Month", "Review the monthly overview"], ["/current-performance", "Current Performance", "See current results"], ["/mobile-invoice", "My Invoice", "View and download your invoices"], ["/requests", "Requests", "Create and track requests"]] },
  { label: "MONTHLY & ADHOC", pages: [["/adhoc-works-invoice-management", "Adhoc Work Invoices", "Review adhoc work and payments"]] },
  { label: "OPERATIONS", pages: [["/daily", "Daily", "Daily operations view"], ["/daily-operations-management", "Daily Operations", "Manage today's activity"], ["/daily-operations-reports", "Operations Reports", "Review operating results"], ["/logistics", "Logistics", "Manage logistics flow"], ["/op-dashboard", "Operations Dashboard", "Operational overview"], ["/operations-management", "Operations Management", "Manage the operating model"], ["/schedule", "Schedule", "Manage schedules"], ["/vehicles", "Vehicles", "Manage the fleet"]] },
  { label: "FINANCE", pages: [["/daily-financial-insights", "Financial Insights", "Explore daily financial data"], ["/daily-financials", "Daily Financials", "Review daily numbers"], ["/deductions-disbursements-recharges", "Disbursements & Recharges", "Review financial adjustments"], ["/financial-invoices", "Financial Invoices", "Manage invoice processing"], ["/financial-management", "Financial Management", "Finance workspace"], ["/invoice-history", "Invoice History", "Search invoice history"], ["/invoice-processing-workflow", "Invoice Workflow", "Process invoices"], ["/service-partner-invoices", "Partner Invoices", "Manage partner invoices"]] },
  { label: "CONTROL & PARTNERS", pages: [["/assets", "Assets", "Manage system assets"], ["/contract-management", "Contract Management", "Manage contracts"], ["/requests-admin", "Requests Admin", "Administer requests"], ["/requests-inbox", "Requests Inbox", "Review incoming requests"], ["/vendor", "Vendors", "Manage vendors"], ["/vendor-performance", "Vendor Performance", "Review vendor results"]] },
] as const;

export default function HomePage() {
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState("Today");
  const [refreshed, setRefreshed] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const dateLabel = useMemo(() => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date()), []);

  if (user?.userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER || user?.roles?.includes("driver")) {
    return <DriverHome />;
  }

  return (
    <NavbarWrapper>
      <main className="home-new">
        <section className="home-new__hero">
          <div>
            <div className="home-new__eyebrow"><span className="home-new__pulse" /> OPERATIONS CONTROL / LIVE MOCK DATA</div>
            <h2>{greet(user?.name)}</h2>
            <p>{dateLabel} <span>·</span> One clear view of the day ahead.</p>
          </div>
          <div className="home-new__hero-actions">
            <button className="home-new__refresh" type="button" onClick={() => setRefreshed(true)}><RefreshCw size={14} /> {refreshed ? "Updated" : "Refresh view"}</button>
            <Link prefetch={false} className="home-new__primary" href="/daily-game-plan"><Plus size={15} /> Start daily plan</Link>
          </div>
        </section>

        <section className="home-new__kpis" aria-label="Today's metrics">
          {kpis.map(({ label, value, note, icon: Icon, tone }) => (
            <article className={`home-new__kpi home-new__kpi--${tone}`} key={label}>
              <div className="home-new__kpi-icon"><Icon size={17} /></div>
              <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
            </article>
          ))}
        </section>

        <section className="home-new__hub" aria-label="System pages">
          <div className="home-new__hub-head"><div><span className="home-new__label">SYSTEM HUB</span><h3>Where do you want to go?</h3><p>All workspaces in one place. Choose a page to get moving.</p></div><label className="home-new__hub-search"><Search size={15} /><input value={pageSearch} onChange={(event) => setPageSearch(event.target.value)} placeholder="Search pages..." /></label></div>
          <div className="home-new__hub-groups">{pageGroups.map((group) => { const pages = group.pages.filter(([, name, description]) => `${name} ${description}`.toLowerCase().includes(pageSearch.toLowerCase())); return <div className="home-new__hub-group" key={group.label}><div className="home-new__hub-group-label"><LayoutGrid size={14} /> {group.label}<span>{pages.length}</span></div><div className="home-new__page-grid">{pages.map(([href, name, description]) => <Link prefetch={false} className="home-new__page-card" href={href} key={href}><span className="home-new__page-card-icon"><ArrowUpRight size={14} /></span><span><b>{name}</b><small>{description}</small></span><ChevronRight size={14} /></Link>)}</div></div>; })}</div>
        </section>

        <section className="home-new__workspace">
          <div className="home-new__main-column">
            <div className="home-new__section-heading">
              <div><span className="home-new__label">DISPATCH WINDOW</span><h3>Today at a glance</h3></div>
              <div className="home-new__date-tabs">
                {["Yesterday", "Today", "Tomorrow"].map((day) => <button key={day} className={activeDate === day ? "is-active" : ""} type="button" onClick={() => setActiveDate(day)}>{day}</button>)}
              </div>
            </div>
            <div className="home-new__dispatch-card">
              <div className="home-new__dispatch-summary"><div><span>DISPATCHED</span><strong>75%</strong></div><div className="home-new__progress"><i style={{ width: "75%" }} /></div><small>21 of 28 routes released</small></div>
              <div className="home-new__dispatch-meta"><span><Clock3 size={14} /> Last update 08:32</span><span><MapPinned size={14} /> 4 depots active</span></div>
            </div>
            <div className="home-new__section-heading home-new__section-heading--table"><div><span className="home-new__label">ROUTE BOARD</span><h3>Dispatch activity</h3></div><Link prefetch={false} href="/week-planner">Open planner <ArrowUpRight size={14} /></Link></div>
            <div className="home-new__table-wrap"><table><thead><tr><th>Time</th><th>Route</th><th>Driver</th><th>Depot</th><th>Status</th><th /></tr></thead><tbody>{schedule.map((item) => <tr key={item.route}><td className="home-new__time">{item.time}</td><td><b>{item.route}</b></td><td>{item.driver}</td><td>{item.depot}</td><td><span className={`home-new__status home-new__status--${item.tone}`}>{item.tone === "done" && <CheckCircle2 size={12} />}{item.tone === "alert" && <CircleAlert size={12} />}{item.status}</span></td><td><ChevronRight size={15} /></td></tr>)}</tbody></table></div>
          </div>

          <aside className="home-new__rail">
            <div className="home-new__section-heading"><div><span className="home-new__label">SHORTCUTS</span><h3>Move quickly</h3></div></div>
            <div className="home-new__quick-links">{quickLinks.map(([href, label, description, Icon]) => <Link prefetch={false} href={href} key={href}><span className="home-new__quick-icon"><Icon size={17} /></span><span><b>{label}</b><small>{description}</small></span><ChevronRight size={15} /></Link>)}</div>
            <div className="home-new__team-card"><div className="home-new__team-head"><span className="home-new__label">TEAM PULSE</span><Users size={16} /></div><strong>18 / 22</strong><p>team members active today</p><div className="home-new__avatars"><i>AC</i><i>JS</i><i>MR</i><i>PA</i><span>+14</span></div><Link prefetch={false} href="/vendor">View team <ArrowUpRight size={13} /></Link></div>
            <div className="home-new__notice"><CircleAlert size={17} /><div><b>2 exceptions need review</b><small>One route is missing a vehicle assignment.</small></div><Link prefetch={false} href="/requests-inbox" aria-label="Review exceptions"><ChevronRight size={16} /></Link></div>
          </aside>
        </section>
      </main>
    </NavbarWrapper>
  );
}
