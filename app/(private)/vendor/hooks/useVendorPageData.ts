import { useQuery } from "@tanstack/react-query";
import { fetchVendorPageData } from "@/lib/vendor-api";

export function useVendorPageData() {
  return useQuery({
    queryKey: ["vendor-page-data"],
    queryFn: fetchVendorPageData,
  });
}
