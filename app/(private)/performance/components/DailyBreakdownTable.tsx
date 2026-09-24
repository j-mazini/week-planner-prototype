"use client";

import { memo } from "react";

type DayData = {
  day: number;
  dayOfWeek: number;
  stops: number | "N/A";
  sporH: string | "N/A";
  tw: string | "N/A";
  arrive: string | "N/A";
  sporHClass?: string;
  twClass?: string;
  arriveClass?: string;
};

interface DailyBreakdownTableProps {
  monthData: DayData[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getValueClass(className?: string, value?: string | number) {
  if (value === "N/A" || value === "--:--") return "text-[#bbb] italic text-xs";
  if (className === "positive-value") return "text-[#27ae60] font-semibold";
  if (className === "negative-value") return "text-[#e74c3c] font-semibold";
  return "";
}

export const DailyBreakdownTable = memo(function DailyBreakdownTable({
  monthData,
}: DailyBreakdownTableProps) {

  return (
    <section className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-4">
      <h2 className="font-bold text-lg text-[#2c3e50] mb-3">Daily Breakdown</h2>
      <div className="max-h-[50vh] overflow-y-auto">
        <table className="w-full border-collapse border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="py-2.5 px-1.5 text-center font-semibold text-[#3498db] border-b-2 border-[#3498db] whitespace-nowrap">
                Day
              </th>
              <th className="py-2.5 px-1.5 text-center font-semibold text-[#3498db] border-b-2 border-[#3498db] whitespace-nowrap">
                Stops
              </th>
              <th className="py-2.5 px-1.5 text-center font-semibold text-[#3498db] border-b-2 border-[#3498db] whitespace-nowrap">
                SPOR-H
              </th>
              <th className="py-2.5 px-1.5 text-center font-semibold text-[#3498db] border-b-2 border-[#3498db] whitespace-nowrap">
                TW
              </th>
              <th className="py-2.5 px-1.5 text-center font-semibold text-[#3498db] border-b-2 border-[#3498db] whitespace-nowrap">
                Arrive
              </th>
            </tr>
          </thead>
          <tbody>
            {monthData.length === 0 && (
              <tr>
                <td
                  className="text-[#bbb] italic text-xs py-5 text-center"
                  colSpan={5}
                  style={{ padding: 20 }}
                >
                  No data available for this month.
                </td>
              </tr>
            )}
            {monthData
              .slice()
              .reverse()
              .map((dayData) => {
                const dayOfWeekName = WEEKDAYS[dayData.dayOfWeek];
                const isSaturday = dayData.dayOfWeek === 6;
                const sporHClass = dayData.sporH === "N/A" ? "na-value" : dayData.sporHClass || "";
                const twDisplay =
                  dayData.tw === "N/A"
                    ? "N/A"
                    : dayData.tw === "0%" || dayData.tw === "0.0%"
                      ? "--:--"
                      : dayData.tw;
                const twClass =
                  dayData.tw === "N/A" ||
                  dayData.tw === "--:--" ||
                  dayData.tw === "0%" ||
                  dayData.tw === "0.0%"
                    ? "na-value"
                    : dayData.twClass || "";
                const arriveClass =
                  dayData.arrive === "N/A" ? "na-value" : dayData.arriveClass || "";

                return (
                  <tr key={dayData.day} className="even:bg-[#f8f9fa] last:border-b-0">
                    <td className="py-2.5 px-1.5 text-center align-middle border-b border-[#eee]">
                      <strong>{String(dayData.day).padStart(2, "0")}</strong>{" "}
                      <span
                        className={`
                          font-semibold text-[0.7rem] py-1 px-1.5 rounded-md inline-block min-w-[30px]
                          ${
                            isSaturday
                              ? "bg-[#e6f7ff] text-[#096dd9]"
                              : "bg-[#eee] text-[#7f8c8d]"
                          }
                        `}
                      >
                        {dayOfWeekName}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-1.5 text-center align-middle border-b border-[#eee] ${
                        dayData.stops === "N/A" ? "text-[#bbb] italic text-xs" : ""
                      }`}
                    >
                      {dayData.stops}
                    </td>
                    <td
                      className={`py-2.5 px-1.5 text-center align-middle border-b border-[#eee] ${getValueClass(
                        sporHClass,
                        dayData.sporH
                      )}`}
                    >
                      {dayData.sporH}
                    </td>
                    <td
                      className={`py-2.5 px-1.5 text-center align-middle border-b border-[#eee] ${getValueClass(
                        twClass,
                        twDisplay
                      )}`}
                    >
                      {twDisplay}
                    </td>
                    <td
                      className={`py-2.5 px-1.5 text-center align-middle border-b border-[#eee] ${getValueClass(
                        arriveClass,
                        dayData.arrive
                      )}`}
                    >
                      {dayData.arrive === "N/A" ? "N/A" : dayData.arrive}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
});

