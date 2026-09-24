"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/daily-performance-insight", label: "Today" },
  { href: "/current-performance", label: "Month" },
] as const;

export function PerformanceTabs() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="My Performance"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
