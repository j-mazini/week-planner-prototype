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
    <nav
      aria-label="My Performance"
      className="performance-tabs"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={active ? "performance-tab is-active" : "performance-tab"}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
