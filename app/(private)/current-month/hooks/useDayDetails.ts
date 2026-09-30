import { useAuth } from "@/hooks/useAuth";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useCallback } from "react";
import { getBearerAuthHeader } from "@/lib/auth"
import { DailyOverview, Vehicle, PaidStops, UnpaidStops } from "../types";

export function useDayDetails() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [selectedDays, setSelectedDays] = useState<DailyOverview[]>([]);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [selectedDateName, setSelectedDateName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDayDetails = useCallback(async (date: string, dateName: string) => {
    if (!userId) {
      setError("User ID not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [year, month, day] = date.split("-").map(Number);
      const response = await fetch(
        `${getApiBaseUrl()}/bff/daily-overview/${userId}/${year}/${month}/${day}`,
        {
          headers: {
            ...getBearerAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch day details");
      }

      const data = await response.json();
      const operationsData = data.operations || (Array.isArray(data) ? data : [data]);

      const operationsWithDateName: DailyOverview[] = operationsData.map(
        (operation: Record<string, unknown>) => {
          let amountTotal = "0";
          if (operation.amountTotal) {
            amountTotal = operation.amountTotal.toString();
          } else if (operation.total) {
            amountTotal = operation.total.toString();
          }

          let rate = Number(operation.rate || 0);
          if (rate === 0 && operation.amountTotal && operation.totalStops) {
            const total = Number(operation.amountTotal);
            const stops = Number(operation.totalStops);
            const extras =
              Number(operation.extra || 0) +
              Number(operation.adhocSort || 0) +
              Number(operation.routeSort || 0);
            if (stops > 0) {
              rate = (total - extras) / stops;
            }
          }

          const mappedOperation: DailyOverview = {
            operationId: Number(operation.operationId),
            routeId: Number(operation.routeId),
            routeName: String(operation.routeName || ""),
            amountTotal: amountTotal,
            totalStops: Number(operation.totalStops || 0),
            totalPaidStops: Number(operation.totalPaidStops || operation.paidStopsCount || 0),
            totalUnpaidStops: Number(operation.totalUnpaidStops || 0),
            departTime: operation.departTime as string | null,
            arriveTime: operation.arriveTime as string | null,
            workedHours: operation.workedHours as string | null,
            breakMinutes: Number(operation.breakMinutes || 0),
            extra: Number(operation.extra || 0),
            adhocSort: Number(operation.adhocSort || 0),
            routeSort: Number(operation.routeSort || 0),
            rate: rate,
            operationCostModel: Number(operation.operationCostModel || 0),
            costModelName: String(operation.costModelName || ""),
            status: String(operation.status || ""),
            dateName: dateName,
            vehicle: operation.vehicle as Vehicle | undefined,
            paidStops: operation.paidStops as PaidStops | undefined,
            unpaidStops: operation.unpaidStops as UnpaidStops | undefined,
            isSpms: operation.isSpms as boolean | null | undefined,
            note: operation.note as string | undefined,
          };

          return mappedOperation;
        }
      );

      setSelectedDays(operationsWithDateName);
      setSelectedDateName(dateName);
      setShowDayDetails(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleBack = useCallback(() => {
    setShowDayDetails(false);
    setSelectedDays([]);
    setSelectedDateName("");
  }, []);

  return {
    selectedDays,
    showDayDetails,
    selectedDateName,
    loading,
    error,
    fetchDayDetails,
    handleBack,
  };
}
