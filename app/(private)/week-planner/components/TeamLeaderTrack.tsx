"use client";

import { LEADERS } from "../constants";

export default function TeamLeaderTrack({
  selectedIndex,
  onSelect,
  onOpenRail,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onOpenRail: () => void;
}) {
  return (
    <div className="tltrack">
      <span className="cat">Team Leader</span>
      <div className="tlscroll">
        {LEADERS.map((name, index) => (
          <button
            key={name}
            type="button"
            className="tlchip"
            aria-pressed={index === selectedIndex}
            onClick={() => onSelect(index)}
          >
            {name}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="chip-nav"
        aria-label="Open planning panel"
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
