"use client";

import { LEADERS } from "../constants";

export default function TeamLeaderTrack({
  selectedIndex,
  onSelect,
  onOpenRail,
  railOpen,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onOpenRail: () => void;
  railOpen: boolean;
}) {
  return (
    <div className="tltrack">
      <span className="cat">Team Leader</span>
      <select className="tlleader" aria-label="Team leader" value={selectedIndex} onChange={(event) => onSelect(Number(event.target.value))}>
        {LEADERS.map((name, index) => <option key={name} value={index}>{name}</option>)}
      </select>
      <button
        type="button"
        className="chip-nav"
        aria-label={railOpen ? "Close planning panel" : "Open planning panel"}
        aria-expanded={railOpen}
        aria-controls="week-planner-details"
        title="Exceptions, Management & Support, Off · Holiday, Plan Horizon, Notes"
        onClick={onOpenRail}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M3.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
