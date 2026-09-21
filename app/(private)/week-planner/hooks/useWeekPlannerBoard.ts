import { useQuery } from "@tanstack/react-query";
import { fetchWeekPlannerBoard } from "@/lib/week-planner-api";

export function useWeekPlannerBoard(depotId: string, weekId: string) {
  return useQuery({
    queryKey: ["week-planner-board", depotId, weekId],
    queryFn: () => fetchWeekPlannerBoard({ depotId, weekId }),
  });
}
