import { useState, useEffect, useCallback } from "react";
import { getUserIdFromToken, getBearerAuthHeader } from "@/lib/auth"
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { processMonthData, DayData, MonthOverview } from "../dataProcessor";
import { getTimeWindowClass, getSporHClass } from "../utils";

export function useCurrentPerformanceData(year: number, month: number) {
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [averages, setAverages] = useState({
    avgTw: "--:--",
    avgSpr: "--:--",
    avgSporH: "--:--",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id !== null) {
      setUserId(id.toString());
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
            setMonthData([]);
            setError(null);
            return;
          }
          throw new Error("Failed to fetch month overview");
        }

        const data: MonthOverview = await response.json();
        const today = new Date();

        const mappedData = processMonthData(
          data,
          year,
          month,
          today,
          getSporHClass,
          getTimeWindowClass
        );
        setMonthData(mappedData);

        // Médias já pré-computadas pelo backend (PerformanceCalculationService) no currentMonth.
        setAverages({
          avgTw: data.currentMonth?.avgTw ?? "--:--",
          avgSpr: data.currentMonth?.avgSpr ?? "--:--",
          avgSporH: data.currentMonth?.avgSporH ?? "--:--",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setMonthData([]);
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

  return { monthData, averages, loading, error };
}







