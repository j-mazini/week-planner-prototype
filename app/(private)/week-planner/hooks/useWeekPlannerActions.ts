import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateDefaultSchedule, submitPlannerAction, type GenerateScheduleResult } from "@/lib/week-planner-api";
import { useToast } from "../components/Toast";

export function useWeekPlannerActions() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const actionMutation = useMutation({
    mutationFn: (label: string) => submitPlannerAction(label),
    onSuccess: (result) => {
      showToast(result.message);
      queryClient.invalidateQueries({ queryKey: ["week-planner-board"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateDefaultSchedule(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-planner-board"] });
    },
  });

  const runAction = useCallback(
    (label: string) => actionMutation.mutateAsync(label).then(() => undefined),
    [actionMutation],
  );

  const runGenerateWeek = useCallback(
    (): Promise<GenerateScheduleResult> => generateMutation.mutateAsync(),
    [generateMutation],
  );

  return useMemo(() => ({ runAction, runGenerateWeek }), [runAction, runGenerateWeek]);
}
