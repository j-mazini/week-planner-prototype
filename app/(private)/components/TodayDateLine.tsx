"use client";

import React, { useEffect, useState } from "react";

type TodayDateLineProps = {
  as?: "div" | "span";
  className?: string;
  /**
   * BCP 47 locale tag. Default keeps the UI consistent with the English pages.
   */
  locale?: string;
  /**
   * Optional prefix, e.g. "Today: "
   */
  prefix?: string;
};

export function TodayDateLine({
  as = "div",
  className = "mt-1 text-xs font-medium text-slate-500",
  locale = "en-GB",
  prefix,
}: TodayDateLineProps) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setLabel(formatter.format(new Date()));
  }, [locale]);

  const Comp = as;

  return (
    <Comp className={className}>
      <span suppressHydrationWarning>
        {prefix ? prefix : ""}
        {label}
      </span>
    </Comp>
  );
}

