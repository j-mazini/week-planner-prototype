"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import SupervisorHomeContent, { type DashboardSource } from "@/app/(private)/supervisor-home/SupervisorHomeContent";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

/**
 * The deposit performance dashboard, shown over the home page instead of
 * navigating away. It renders the same component `/supervisor-home` does, so
 * there is one dashboard, not a copy of it.
 *
 * Deliberately not portalled: the dashboard's styles read the paper/teal/lime
 * tokens declared on `.app-imported-page`, which it would leave behind on
 * document.body.
 */
export default function DepotPerformanceModal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Each section is a smaller read of a real page, so the header link follows
  // whichever one is on screen.
  const [source, setSource] = useState<DashboardSource>({ href: "/supervisor-home", label: "full dashboard" });
  const handleSourceChange = useCallback((next: DashboardSource) => setSource(next), []);
  useBodyScrollLock(true);

  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="depot-modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="depot-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="depot-modal-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="depot-modal__head">
          <h2 id="depot-modal-title">Depot performance</h2>
          <div className="depot-modal__actions">
            <Link prefetch={false} className="depot-modal__full" href={source.href}>
              Open {source.label} <ArrowUpRight size={13} />
            </Link>
            <button type="button" className="depot-modal__close" onClick={onClose} aria-label="Close depot performance">
              <X size={17} />
            </button>
          </div>
        </header>
        <div className="depot-modal__body">
          <SupervisorHomeContent onSourceChange={handleSourceChange} />
        </div>
      </div>
    </div>
  );
}
