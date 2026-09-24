import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useCallback } from "react";
import { getUserIdFromToken, getBearerAuthHeader } from "@/lib/auth"
import { MonthOverview } from "../types";

export function useCurrentMonthData(year: number, month: number) {
  const [monthData, setMonthData] = useState<MonthOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id !== null) {
      setUserId(id);
    }
  }, []);

  const fetchMonthData = useCallback(
    async (year: number, month: number) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const apiMonth = month + 1;

        const response = await fetch(
          `${getApiBaseUrl()}/bff/daily-overview/list/${userId}/${apiMonth}/${year}`,
          {
            headers: {
              ...getBearerAuthHeader(),
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setMonthData(null);
            setError(null);
            return;
          }
          throw new Error("Failed to fetch month overview");
        }

        const data: MonthOverview = await response.json();
        setMonthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setMonthData(null);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      fetchMonthData(year, month);
    }
  }, [year, month, userId, fetchMonthData]);

  return { monthData, loading, error };
}
