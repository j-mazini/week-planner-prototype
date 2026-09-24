import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { getUserIdFromToken, getBearerAuthHeader } from "@/lib/auth"
import { DayOverviewResponse } from "../types";

export function useSubcontractorData(date: Date) {
  const [data, setData] = useState<DayOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const fetchingRef = useRef(false);

  // Get user ID on mount
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id !== null) {
      const numericId = Number(id);
      setUserId(numericId);
    } else {
      setUserId(null);
    }
  }, []);

  const fetchDayOverview = useCallback(async () => {
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      if (!userId || userId === 0) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      const numericUserId = Number(userId);
      const url = `${getApiBaseUrl()}/bff/day-overview/${numericUserId}/${formattedDate}?metrics=revenue`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...getBearerAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setData([]);
          setError("No data available for the selected date");
          return;
        }

        if (response.status === 500) {
          const errorData = await response.json();
          if (
            errorData.error &&
            errorData.error.includes("Error retrieving daily overview")
          ) {
            setData([]);
            setError("No data available for the selected date");
            return;
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const operationsData = Array.isArray(responseData) ? responseData : [responseData];

      if (!operationsData || operationsData.length === 0) {
        setData([]);
        setError("No data available for the selected date");
        return;
      }

      // Remove duplicatas baseadas no operationId
      const uniqueOperations = operationsData.filter(
        (operation: DayOverviewResponse, index: number, self: DayOverviewResponse[]) => 
          index === self.findIndex((op: DayOverviewResponse) => op.operationId === operation.operationId)
      );

      setData(uniqueOperations);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No data available for the selected date");
      setData([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [date, userId]);

  useEffect(() => {
    // Manter loading enquanto aguarda userId ou iniciar requisição
    if (userId && userId !== 0) {
      fetchDayOverview();
    } else {
      // Se ainda não temos userId, manter loading
      setLoading(true);
    }
  }, [userId, date, fetchDayOverview]);

  return { data, loading, error };
}
