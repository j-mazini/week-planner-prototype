import { useQuery } from '@tanstack/react-query';
import { fetchVendorTypes } from '@/lib/vendors-api';

export function useVendorTypes() {
  return useQuery({
    queryKey: ['vendorTypes'],
    queryFn: fetchVendorTypes,
  });
}
