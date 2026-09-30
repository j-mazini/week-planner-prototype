"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { formatMonthLabel, DAYS_OF_WEEK, FailedCodes } from "./utils";
import { calculateMetrics } from "./metricsCalculator";
import "./Daily.css";

export default function DailyDashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeDayNumber, setActiveDayNumber] = useState<number>(-1);

  const dayRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Compute the list of valid business days for the month (skip Sun=0 and Sat=6)
  const businessDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: { day: number; weekday: number }[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, month, d);
      const weekday = dt.getDay();
      if (weekday === 0 || weekday === 6) continue;
      days.push({ day: d, weekday });
    }
    return days;
  }, [currentDate]);

  // Determine default active day when month changes
  useEffect(() => {
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();

    if (businessDays.length === 0) {
      setActiveDayNumber(-1);
      return;
    }

    if (isCurrentMonth) {
      const isTodayBusinessDay = businessDays.some((d) => d.day === today.getDate());
      setActiveDayNumber(isTodayBusinessDay ? today.getDate() : businessDays[0].day);
    } else {
      setActiveDayNumber(businessDays[0].day);
    }
  }, [currentDate, businessDays]);

  // Scroll active day into view when it changes
  useEffect(() => {
    if (activeDayNumber === -1) return;
    const el = dayRefs.current.get(activeDayNumber);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    }
  }, [activeDayNumber]);

  // Derived metrics from selected day
  const metrics = useMemo(() => calculateMetrics(activeDayNumber), [activeDayNumber]);

  // Indicator index (one dot per group of 7 business-day cards)
  const indicatorIndex = useMemo(() => {
    if (activeDayNumber === -1) return 0;
    const idx = businessDays.findIndex((d) => d.day === activeDayNumber);
    if (idx < 0) return 0;
    return Math.floor(idx / 7);
  }, [activeDayNumber, businessDays]);

  const indicatorDots = useMemo(() => {
    return Array.from({ length: Math.max(1, Math.ceil(businessDays.length / 7)) }, (_, i) => i);
  }, [businessDays.length]);

  const goPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleDayClick = useCallback((day: number) => {
    setActiveDayNumber(day);
  }, []);

  const setDayRef = useCallback((day: number, el: HTMLDivElement | null) => {
    if (el) {
      dayRefs.current.set(day, el);
    } else {
      dayRefs.current.delete(day);
    }
  }, []);

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">
        <div className="month-selector-container">
          <div className="month-selector">
            <i className="bi bi-chevron-left nav-arrow" onClick={goPrevMonth} />
            <span className="month-name">{formatMonthLabel(currentDate)}</span>
            <i className="bi bi-chevron-right nav-arrow" onClick={goNextMonth} />
          </div>
        </div>

        <section className="days-carousel-container">
          <div className="days-carousel">
            {businessDays.map(({ day, weekday }) => {
              const isActive = day === activeDayNumber;
              return (
                <div
                  key={day}
                  ref={(el) => setDayRef(day, el)}
                  className={"day-card" + (isActive ? " active" : "")}
                  data-day={day}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">{day}</div>
                  <div className="day-name">{DAYS_OF_WEEK[weekday]}</div>
                </div>
              );
            })}
          </div>
          <div className="carousel-indicator">
            {indicatorDots.map((i) => (
              <div key={i} className={"indicator-dot" + (indicatorIndex === i ? " active" : "")} />
            ))}
          </div>
        </section>

        <div className="verified-card">LL3X</div>

        <div className="data-card">
          <div className="new-metrics-grid">
            <div className="new-metric-item">
              <span className="label">SPR</span>
              <span className="value" id="sprValue">{metrics.spr}</span>
            </div>
            <div className="new-metric-item">
              <span className="label">SPOR-H</span>
              <span className="value" id="sporValue">{metrics.spor}</span>
            </div>
            <div className="new-metric-item">
              <span className="label">TW</span>
              <span className={"value" + (metrics.twClass ? " " + metrics.twClass : "")} id="twValue">
                {metrics.twPercent}%
              </span>
            </div>
            <div className="new-metric-item">
              <span className="label">AFD</span>
              <span className="value danger" id="afdValue">{metrics.afd}</span>
            </div>
          </div>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-time">Departed<br />{metrics.departed}</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-time">Break<br />{metrics.breakLabel}</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div className={"timeline-time" + (metrics.arrivedDanger ? " danger" : "")}>
                Arrived<br />{metrics.arrived}
              </div>
            </div>
          </div>
        </div>

        <div className="failed-deliveries-card">
          <h3 className="section-title">Attempted Failed Deliveries</h3>
          <div className="failed-grid">
            {(["NR", "FP", "BA", "NH", "SHP", "CM"] as FailedCodes[]).map((code) => {
              const val = metrics.failed[code];
              const hidden = val === 0;
              return (
                <div key={code} className={"failed-item" + (hidden ? " hidden" : "")}>
                  <span className="label">{code}</span>
                  <span className="value">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="notes-section">
          <div className="notes-title">Notes</div>
          <p className="notes-text">{metrics.note}</p>
        </div>
      </div>
    </div>
  );
}
