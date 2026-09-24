import { useCallback, useState } from "react";
import { fetchAllVendorsOff } from "@/lib/day-off-api";

export interface DayOffItem {
  weekPlannerId?: number;
  userId: number;
  fullName?: string;
  date: string;
  status?: string;
  notes?: string;
}

export function useDayOffItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDayOffItems = useCallback(
    async (startDate: string, endDate: string, routeId: number = 48) => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchAllVendorsOff(startDate, endDate, routeId);
        return items as unknown as DayOffItem[];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch day-off items";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchAllDayOffItems, loading, error };
}
