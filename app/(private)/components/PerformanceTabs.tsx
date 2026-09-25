"use client";

import { useRef, type KeyboardEvent } from "react";

export type PerformanceView = "daily" | "monthly";

const TABS = [
  { value: "daily", label: "Today" },
  { value: "monthly", label: "Month" },
] as const;

export function PerformanceTabs({ value, onChange }: { value: PerformanceView; onChange: (view: PerformanceView) => void }) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1
      : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    const nextView = TABS[nextIndex].value;
    onChange(nextView);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <nav
      className="performance-tabs"
      role="tablist"
      aria-label="My Performance views"
    >
      {TABS.map((tab, index) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`performance-tab-${tab.value}`}
            aria-controls={`performance-panel-${tab.value}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            ref={(element) => { tabRefs.current[index] = element; }}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={active ? "performance-tab is-active" : "performance-tab"}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
