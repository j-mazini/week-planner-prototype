import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processImportFile, submitRouteBalanceAction } from "@/lib/route-balance-api";
import { useToast } from "../components/Toast";

export function useRouteBalanceActions() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const actionMutation = useMutation({
    mutationFn: (label: string) => submitRouteBalanceAction(label),
    onSuccess: (result) => {
      showToast(result.message);
      queryClient.invalidateQueries({ queryKey: ["route-balance-board"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: () => processImportFile(),
  });

  return {
    // `mutateAsync` is bound once per MutationObserver instance and stays
    // referentially stable across renders — unlike the mutation object
    // itself, which TanStack Query recreates on every render. Depending on
    // the object here previously caused a real re-fire bug (see the
    // week-planner Generate Week modal's post-mortem).
    runAction: actionMutation.mutateAsync,
    runImport: importMutation.mutateAsync,
  };
}
