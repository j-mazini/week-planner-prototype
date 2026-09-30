"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, ChevronRight, ClipboardList, Eye, EyeOff,
  CirclePoundSterling, Gift, MapPin, Receipt, Truck,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import NavbarWrapper from "@/components/navbar-wrapper";
import { greet } from "@/lib/greeting";
import { PageContent } from "../components";
import { fetchAllWeekPlannersForDate } from "../week-planner/services/apiService";
import type { WeekPlannerRecord } from "../week-planner/contexts/PlannerContext";
import { useCurrentMonthData } from "../current-month/hooks/useCurrentMonthData";
import type { DailyEarning, Operation } from "../current-month/types";
import { useDeductions } from "../deductions/hooks/useDeductions";
import "./driver-home.css";

const parseMoney = (value: string | number | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDailyEarningTotal = (earning: DailyEarning) => {
  const calculatedAmount = parseMoney(earning.calculatedAmount);
  if (calculatedAmount > 0) return calculatedAmount;
  if (earning.operations?.length) {
    const uniqueOperations = earning.operations.filter((operation, index, all) =>
      all.findIndex((candidate) => candidate.operationId === operation.operationId) === index
    );
    return uniqueOperations.reduce((sum, operation) => sum + parseMoney(operation.amountTotal), 0);
  }
  return parseMoney(earning.totalAmount ?? earning.amount);
};

const readPostcodes = (value: unknown, depth = 0): string[] => {
  if (depth > 4 || value == null) return [];
  if (typeof value === "string") return /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(value) ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap((item) => readPostcodes(item, depth + 1));
  if (typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, item]) =>
    /postcode|postal.?code|sub.?postcode/i.test(key) ? readPostcodes(item, depth + 1) :
      typeof item === "object" ? readPostcodes(item, depth + 1) : []
  );
};

const getRouteMetrics = (assignment: WeekPlannerRecord, earnings: DailyEarning[]) => {
  const routeKey = assignment.route.trim().toLowerCase();
  const daily = earnings.find((entry) => entry.date === assignment.date);
  const ops = (daily?.operations ?? []).filter((operation) => {
    const raw = operation as Operation & Record<string, unknown>;
    const routeName = String(raw.routeName ?? "").trim().toLowerCase();
    const rawRouteId = String(raw.routeId ?? "");
    const assignmentRouteId = String(assignment.raw.routeId ?? "");
    return routeKey && (routeName === routeKey || (assignmentRouteId && rawRouteId === assignmentRouteId));
  });
  const allPostcodes = [...new Set(ops.flatMap((operation) => readPostcodes(operation)))];
  const sum = (key: string) => ops.reduce((total, operation) => total + (Number((operation as unknown as Record<string, unknown>)[key]) || 0), 0);
  const paid = sum("totalPaidStops");
  const pickups = ops.reduce((total, operation) => {
    const stops = (operation as unknown as Record<string, unknown>).paidStops as Record<string, unknown> | undefined;
    return total + (Number(stops?.pu) || 0);
  }, 0);
  const pre12 = sum("pre12") || sum("totalPre12");
  const raw = assignment.raw;
  const rawMetric = (key: string) => Number(raw[key]) || 0;
  const stops = sum("totalStops") || rawMetric("totalStops") || rawMetric("stops");
  return {
    stops,
    deliveries: Math.max(0, (paid || rawMetric("deliveries")) - pickups),
    pickups: pickups || rawMetric("pickups"),
    pre12: pre12 || rawMetric("pre12") || rawMetric("totalPre12"),
    postcodes: [...new Set([...allPostcodes, ...readPostcodes(raw)])],
  };
};

export default function DriverHome() {
  const { user } = useAuth();
  const [showAmounts, setShowAmounts] = useState(true);
  const [scheduledDays, setScheduledDays] = useState<string[] | null>(null);
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeekPlannerRecord[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [routeBalanceOpen, setRouteBalanceOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const name = user?.name?.trim().split(/\s+/)[0] || "Driver";
  const fullName = user?.name || "Driver";
  const depot = (user as typeof user & { depotName?: string; homeDepot?: string } | null)?.homeDepot
    || (user as typeof user & { depotName?: string } | null)?.depotName
    || "A- XL - Newcastle - Arrow XL";

  const monthDate = useMemo(() => new Date(), []);
  const { monthData, loading: monthLoading } = useCurrentMonthData(monthDate.getFullYear(), monthDate.getMonth());
  const { deductions, totalDeductions, isLoading: deductionsLoading } = useDeductions(monthDate);
  const currentMonthDeductions = deductions.filter((deduction) => deduction.currentInstallment !== 0);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }), []);
  const monthlyEarnings = useMemo(() => {
    const summaryTotal = parseMoney(monthData?.currentMonth?.total);
    if (summaryTotal > 0) return summaryTotal;
    return (monthData?.dailyEarnings ?? []).reduce((sum, earning) => sum + getDailyEarningTotal(earning), 0);
  }, [monthData]);
  const daysWorked = monthData?.currentMonth?.daysWorked || (monthData?.dailyEarnings ?? []).filter((earning) => getDailyEarningTotal(earning) > 0).length;
  const averagePerDay = parseMoney(monthData?.currentMonth?.averagePerDay) || (daysWorked > 0 ? monthlyEarnings / daysWorked : 0);
  const paymentStats = [
    ["Earnings", currencyFormatter.format(monthlyEarnings)],
    ["Days worked", String(daysWorked)],
    ["Daily average", currencyFormatter.format(averagePerDay)],
  ];
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (!user) return;
    setScheduledDays(null);
    setWeeklyAssignments([]);
    fetchAllWeekPlannersForDate(today)
      .then((records) => {
        if (cancelled) return;
        const userId = Number(user.id);
        const days = records
          .filter((record) => {
            if (!record.date || record.isDayOff === "true") return false;
            const raw = record.raw as Record<string, unknown>;
            const rawUserId = Number(raw.userId ?? (raw.vendor as Record<string, unknown> | undefined)?.userId);
            return rawUserId > 0 ? rawUserId === userId : record.name.trim().toLowerCase() === fullName.trim().toLowerCase();
          });
        setWeeklyAssignments(days);
        const uniqueDates = days
          .map((record) => record.date)
          .filter((date, index, all) => all.indexOf(date) === index)
          .sort();
        setScheduledDays(uniqueDates.map((date) => {
          const [year, month, day] = date.split("-").map(Number);
          return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" })
            .format(new Date(year, month - 1, day));
        }));
      })
      .catch(() => { if (!cancelled) setScheduledDays([]); });

    return () => { cancelled = true; };
  }, [user, fullName]);

  // The wrapper derives the title from the route; it takes no props.
  return (
    <NavbarWrapper>
    <main className="driver-home">
      <PageContent className="driver-home__content">
        <h1 className="driver-home__greeting">{greet(name)}</h1>

        {/* Not a header: the app shell above already names the page and the signed-in
            driver. This strip carries only what the shell does not. */}
        <div className="driver-home__facts">
          <div className="driver-home__fact">
            <span className="driver-home__fact-icon" aria-hidden="true"><Truck size={30} strokeWidth={1.7} /></span>
            <div><span>Vehicle</span><strong>No vehicle</strong></div>
          </div>
          <div className="driver-home__fact">
            <span className="driver-home__fact-icon" aria-hidden="true"><MapPin size={30} strokeWidth={1.7} /></span>
            <div><span>Home depot</span><strong>{depot}</strong></div>
          </div>
        </div>

        {/* Two independent columns: each stacks at its own pace, so a short block
            on one side no longer opens a hole beneath it. */}
        <div className="driver-home__columns">
          <div className="driver-home__column">
          <section className="driver-home__payments" aria-labelledby="driver-payments-title">
            <div className="driver-home__payments-top">
              <div className="driver-home__payments-heading">
                <h1 id="driver-payments-title">Payments</h1>
                <button className="driver-home__visibility" type="button" onClick={() => setShowAmounts((visible) => !visible)} aria-label={showAmounts ? "Hide payment amounts" : "Show payment amounts"} aria-pressed={!showAmounts}>
                  {showAmounts ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
              </div>
              <p>Current month data:</p>
            </div>
            <div className="driver-home__payment-stats">
              {paymentStats.map(([label, value]) => (
                <div key={label}><span>{label}</span><strong>{monthLoading ? "…" : showAmounts ? value : "•••••"}</strong></div>
              ))}
            </div>
            <Link className="driver-home__invoice-link" href="/mobile-invoice"><span>View your invoice here</span><ChevronRight size={22} /></Link>
            <CirclePoundSterling className="driver-home__coin" size={38} aria-hidden="true" />
          </section>

          <section className="driver-home__schedule">
            <div><span className="driver-home__eyebrow">My Route</span><p>See your routes for this week</p></div>
            <CalendarDays className="driver-home__calendar-art" size={50} />
            <button type="button" onClick={() => setRouteBalanceOpen(true)}>View my routes <ChevronRight size={19} /></button>
            <Link className="driver-home__route-mobile-link" href="/driver-route-balance">Open mobile route view <ChevronRight size={17} /></Link>
          </section>
          </div>
          <div className="driver-home__column">
          <section className="driver-home__task-grid" aria-label="Your tasks">
            <button className="driver-home__task driver-home__schedule-trigger" type="button" onClick={() => setScheduleOpen(true)} aria-label="View my schedule this week" aria-haspopup="dialog">
              <span className="driver-home__task-icon"><CalendarDays size={25} /></span>
              <strong>My schedule</strong>
              <span>{scheduledDays === null ? "Loading this week..." : scheduledDays.length ? scheduledDays.join(" · ") : "No days scheduled this week"}</span>
            </button>
          </section>

          <section className="driver-home__quick-access" aria-labelledby="driver-quick-title">
            <h2 id="driver-quick-title">Quick Access</h2>
            <div className="driver-home__quick-links">
              <Link className="driver-home__task driver-home__quick-card driver-home__quick-card--deductions" href="/deductions">
                <span className="driver-home__task-icon"><Receipt size={22} /></span>
                <strong>Deductions</strong>
                <span className="driver-home__quick-card-copy"><strong className="driver-home__quick-card-value">{deductionsLoading ? "…" : showAmounts ? currencyFormatter.format(totalDeductions) : "•••••"}</strong><small>This month · {deductionsLoading ? "Loading" : `${currentMonthDeductions.length} items`}</small></span>
                <ChevronRight className="driver-home__quick-card-arrow" size={17} />
              </Link>
              <Link className="driver-home__task driver-home__quick-card" prefetch={false} href="/current-month">
                <span className="driver-home__task-icon"><MapPin size={21} /></span>
                <strong>Current Month</strong>
                <span className="driver-home__quick-card-copy">Monthly earnings and days worked</span>
                <ChevronRight className="driver-home__quick-card-arrow" size={17} />
              </Link>
              <Link className="driver-home__task driver-home__quick-card" prefetch={false} href="/current-performance">
                <span className="driver-home__task-icon"><ClipboardList size={21} /></span>
                <strong>Current Performance</strong>
                <span className="driver-home__quick-card-copy">Review your latest results</span>
                <ChevronRight className="driver-home__quick-card-arrow" size={17} />
              </Link>
            </div>
          </section>
          </div>
        </div>

        <button className="driver-home__bonus" type="button" onClick={() => setReferralOpen(true)} aria-haspopup="dialog">
          <span><strong>Get £150 bonus!</strong><small>Refer a friend and earn £150</small></span>
          <span className="driver-home__bonus-art" aria-hidden="true"><Gift size={22} /></span>
          <ChevronRight size={20} />
        </button>
      </PageContent>
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="driver-home__schedule-modal">
          <DialogHeader>
            <DialogTitle className="driver-home__schedule-modal-title">My schedule</DialogTitle>
            <DialogDescription className="driver-home__schedule-modal-description">Your Week Planner assignments for this week.</DialogDescription>
          </DialogHeader>
          <div className="driver-home__schedule-list">
            {scheduledDays === null ? (
              <p className="driver-home__schedule-empty">Loading your schedule...</p>
            ) : (
              weekDates.map((date) => {
                const [year, month, day] = date.split("-").map(Number);
                const dateLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })
                  .format(new Date(year, month - 1, day));
                const dayAssignments = weeklyAssignments.filter((assignment) => assignment.date === date);
                const isToday = date === todayKey;
                return (
                  <section className="driver-home__schedule-day" key={date}>
                    <h3>{dateLabel}{isToday && <span className="driver-home__schedule-today">Today</span>}</h3>
                    {dayAssignments.length ? dayAssignments.map((assignment) => (
                        <div className="driver-home__schedule-assignment" key={`${date}-${assignment.weekPlannerId}`}>
                          <strong>{assignment.route || assignment.notes || "Scheduled"}</strong>
                          <span>{[assignment.status, assignment.vehicle, assignment.registrationPlate].filter(Boolean).join(" · ") || "Assigned in Week Planner"}</span>
                        </div>
                      )) : <p className="driver-home__schedule-empty driver-home__schedule-empty--day">No assignment in Week Planner</p>}
                  </section>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
        <DialogContent className="driver-home__referral-modal">
          <div className="driver-home__referral-art" aria-hidden="true"><Gift size={25} /></div>
          <DialogHeader>
            <DialogTitle className="driver-home__schedule-modal-title">Refer a friend</DialogTitle>
            <DialogDescription className="driver-home__schedule-modal-description">
              If they are hired, you will receive a £150 bonus.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={routeBalanceOpen} onOpenChange={setRouteBalanceOpen}>
        <DialogContent className="driver-home__route-balance-modal">
          <DialogHeader>
            <DialogTitle className="driver-home__schedule-modal-title">My Route</DialogTitle>
            <DialogDescription className="driver-home__schedule-modal-description">Your assigned routes for this week.</DialogDescription>
          </DialogHeader>
          {scheduledDays === null ? (
            <p className="driver-home__schedule-empty">Loading your routes...</p>
          ) : (
            <>
              <div className="driver-home__route-summary">
                <div><span>Routes this week</span><strong>{weeklyAssignments.length}</strong></div>
                <div><span>Days scheduled</span><strong>{new Set(weeklyAssignments.map((assignment) => assignment.date)).size}</strong></div>
              </div>
              <div className="driver-home__schedule-list">
                {weeklyAssignments.length === 0 ? (
                  <p className="driver-home__schedule-empty">No routes assigned this week.</p>
                ) : (
                  [...new Set(weeklyAssignments.map((assignment) => assignment.date))].sort().map((date) => {
                    const [year, month, day] = date.split("-").map(Number);
                    const dateLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })
                      .format(new Date(year, month - 1, day));
                    const dayRoutes = weeklyAssignments.filter((assignment) => assignment.date === date);
                    return (
                      <section className="driver-home__schedule-day" key={date}>
                        <h3>{dateLabel}</h3>
                        {dayRoutes.map((assignment) => (
                          <div className="driver-home__schedule-assignment" key={`${date}-${assignment.weekPlannerId}`}>
                            <strong>{assignment.route || assignment.notes || "Route assignment"}</strong>
                            <span>{[assignment.status, assignment.vehicle, assignment.registrationPlate].filter(Boolean).join(" · ") || "Assigned in Week Planner"}</span>
                            {(() => {
                              const metrics = getRouteMetrics(assignment, monthData?.dailyEarnings ?? []);
                              return <div className="driver-home__route-metrics">
                                <div><span>Stops</span><strong>{metrics.stops || "—"}</strong></div>
                                <div><span>Deliveries</span><strong>{metrics.deliveries || "—"}</strong></div>
                                <div><span>Pickups</span><strong>{metrics.pickups || "—"}</strong></div>
                                <div><span>Pre-12</span><strong>{metrics.pre12 || "—"}</strong></div>
                                <div className="driver-home__route-postcodes"><span>Postcodes</span><strong>{metrics.postcodes.length ? metrics.postcodes.join(", ") : "Not provided"}</strong></div>
                              </div>;
                            })()}
                          </div>
                        ))}
                      </section>
                    );
                  })
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
    </NavbarWrapper>
  );
}
