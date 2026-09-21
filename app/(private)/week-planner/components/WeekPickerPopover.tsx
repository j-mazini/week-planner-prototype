"use client";

import { MONTH_LABELS, WEEK_OPTIONS } from "../constants";
import type { WeekOption } from "../types";

interface WeekPickerPopoverProps {
  monthIndex: number;
  onMonthChange: (index: number) => void;
  onPick: (week: WeekOption) => void;
  onGoToCurrent: () => void;
}

export default function WeekPickerPopover({ monthIndex, onMonthChange, onPick, onGoToCurrent }: WeekPickerPopoverProps) {
  return (
    <div className="picker">
      <div className="pkhd">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="chip-nav"
            aria-label="Mês anterior"
            onClick={(e) => {
              e.stopPropagation();
              onMonthChange(Math.max(0, monthIndex - 1));
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M6.5 1L2.5 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <span className="pkmonth">{MONTH_LABELS[monthIndex]}</span>
          <button
            type="button"
            className="chip-nav"
            aria-label="Próximo mês"
            onClick={(e) => {
              e.stopPropagation();
              onMonthChange(Math.min(MONTH_LABELS.length - 1, monthIndex + 1));
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M3.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <button type="button" className="gotonow" onClick={onGoToCurrent}>
          [GO TO CURRENT WEEK]
        </button>
      </div>
      <div className="pklist">
        {WEEK_OPTIONS.map((week) => {
          const isCurrent = week.state === "current";
          return (
            <button
              key={week.id}
              type="button"
              className={`pkrow ${isCurrent ? "cur" : week.state}`}
              onClick={() => onPick(week)}
            >
              <span className="l">
                <b>{week.label}</b>
                <em>{week.range}</em>
              </span>
              {isCurrent && <span className="curbadge">CURRENT WEEK</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
