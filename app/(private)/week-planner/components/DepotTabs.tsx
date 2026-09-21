"use client";

import { DEPOTS } from "../constants";
import { useToast } from "./Toast";

export default function DepotTabs({ selected, onSelect }: { selected: string; onSelect: (depot: string) => void }) {
  const { showToast } = useToast();

  return (
    <div className="tabs">
      {DEPOTS.map((depot) => (
        <button
          key={depot}
          type="button"
          className="tab"
          aria-pressed={depot === selected}
          onClick={() => {
            onSelect(depot);
            showToast(`Depot ${depot} selected.`);
          }}
        >
          {depot}
        </button>
      ))}
    </div>
  );
}
