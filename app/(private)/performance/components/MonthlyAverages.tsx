"use client";

import { memo } from "react";

interface MonthlyAveragesProps {
  monthLabel: string;
  averages: {
    sporH: string;
    tw: string;
    arrive: string;
  };
}

function classForAverage(value: string, type: "sporH" | "tw" | "arrive") {
  if (value === "N/A") return "text-2xl font-bold text-[#2c3e50]";
  const numeric = parseFloat(value);
  if (type === "sporH") {
    return `text-2xl font-bold ${numeric >= 18.0 ? "text-[#27ae60]" : "text-[#e74c3c]"}`;
  }
  if (type === "tw") {
    return `text-2xl font-bold ${numeric <= 5.0 ? "text-[#27ae60]" : "text-[#e74c3c]"}`;
  }
  return `text-2xl font-bold ${numeric <= 2.0 ? "text-[#27ae60]" : "text-[#e74c3c]"}`;
}

export const MonthlyAverages = memo(function MonthlyAverages({
  monthLabel,
  averages,
}: MonthlyAveragesProps) {
  return (
    <section className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-4">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-2xl font-bold text-[#2c3e50]">{monthLabel} Averages</div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="text-center bg-[#f8f9fa] py-3 px-2 rounded-lg">
          <span className="text-[0.7rem] text-[#7f8c8d] font-semibold uppercase mb-1 tracking-[0.3px] block">
            SPOR-H
          </span>
          <span className={classForAverage(averages.sporH, "sporH")}>{averages.sporH}</span>
        </div>
        <div className="text-center bg-[#f8f9fa] py-3 px-2 rounded-lg">
          <span className="text-[0.7rem] text-[#7f8c8d] font-semibold uppercase mb-1 tracking-[0.3px] block">
            TW
          </span>
          <span className={classForAverage(averages.tw, "tw")}>
            {averages.tw === "N/A" ? "N/A" : averages.tw === "0.0" ? "--:--" : `${averages.tw}%`}
          </span>
        </div>
        <div className="text-center bg-[#f8f9fa] py-3 px-2 rounded-lg">
          <span className="text-[0.7rem] text-[#7f8c8d] font-semibold uppercase mb-1 tracking-[0.3px] block">
            Arrive
          </span>
          <span className={classForAverage(averages.arrive, "arrive")}>
            {averages.arrive === "N/A" ? "N/A" : `${averages.arrive}%`}
          </span>
        </div>
      </div>
    </section>
  );
});

