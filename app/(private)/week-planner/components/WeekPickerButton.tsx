"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_WEEK_ID, WEEK_OPTIONS } from "../constants";
import type { WeekOption } from "../types";
import { useToast } from "./Toast";
import WeekPickerPopover from "./WeekPickerPopover";

export default function WeekPickerButton({ week, onPick }: { week: WeekOption; onPick: (week: WeekOption) => void }) {
  const [open, setOpen] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function pick(nextWeek: WeekOption) {
    onPick(nextWeek);
    setOpen(false);
    showToast(`Semana ${nextWeek.label} carregada.`);
  }

  const currentWeek = WEEK_OPTIONS.find((w) => w.id === DEFAULT_WEEK_ID)!;

  return (
    <div className="pickwrap" ref={wrapRef}>
      <button type="button" className="weekbtn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="wk disp">{week.label}</span>
        <span className="rg">{week.range.toUpperCase()} 2024</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <WeekPickerPopover
          monthIndex={monthIndex}
          onMonthChange={setMonthIndex}
          onPick={pick}
          onGoToCurrent={() => pick(currentWeek)}
        />
      )}
    </div>
  );
}
