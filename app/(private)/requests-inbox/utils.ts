import type { DayOffEntry } from "@/lib/day-off-api";
import type { DayOffOrHolidayRequest } from "./types";

/**
 * Groups day off entries by vendor and consecutive dates.
 * Single day = Day Off, multiple days = Holiday.
 */
export function groupDayOffEntriesIntoRequests(
  entries: DayOffEntry[],
  defaultStatus: "approved" | "pending" = "approved"
): DayOffOrHolidayRequest[] {
  if (entries.length === 0) return [];

  const byVendor = new Map<number, DayOffEntry[]>();
  for (const e of entries) {
    const list = byVendor.get(e.userId) ?? [];
    list.push(e);
    byVendor.set(e.userId, list);
  }

  const requests: DayOffOrHolidayRequest[] = [];
  byVendor.forEach((list, userId) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    let i = 0;
    while (i < sorted.length) {
      const start = sorted[i];
      let end = start;
      let j = i + 1;
      while (j < sorted.length) {
        const nextDate = new Date(sorted[j].date);
        const prevDate = new Date(end.date);
        prevDate.setDate(prevDate.getDate() + 1);
        if (nextDate.getTime() === prevDate.getTime()) {
          end = sorted[j];
          j++;
        } else break;
      }
      const type = start.date === end.date ? "day_off" : "holiday";
      const id = `do-${userId}-${start.date}-${end.date}`;
      requests.push({
        type,
        id,
        userId,
        startDate: start.date,
        endDate: end.date,
        reason: start.reason,
        notes: start.notes,
        status: defaultStatus,
        createdAt: start.date,
      });
      i = j;
    }
  });

  return requests.sort((a, b) => {
    const dA = a.startDate;
    const dB = b.startDate;
    return dB.localeCompare(dA);
  });
}
