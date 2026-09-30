import { useQuery } from "@tanstack/react-query";
import { fetchHomeDashboard } from "@/lib/home-api";

export function useHomeDashboard() {
  return useQuery({
    queryKey: ["home-dashboard"],
    queryFn: fetchHomeDashboard,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
