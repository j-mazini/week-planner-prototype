"use client";

import { useRef } from "react";
import { LEADERS } from "../constants";

export default function TeamLeaderTrack({ selectedIndex, onSelect }: { selectedIndex: number; onSelect: (index: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tltrack">
      <span className="cat">Team Leader</span>
      <div className="tlscroll" ref={trackRef}>
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
        aria-label="Próximos team leaders"
        onClick={() => trackRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M3.5 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
