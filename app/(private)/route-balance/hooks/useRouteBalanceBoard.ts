import { useQuery } from "@tanstack/react-query";
import { fetchRouteBalanceBoard } from "@/lib/route-balance-api";

export function useRouteBalanceBoard() {
  return useQuery({
    queryKey: ["route-balance-board"],
    queryFn: fetchRouteBalanceBoard,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
