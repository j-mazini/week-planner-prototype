import { useDeposits } from '@/hooks/useDeposits';
import { useVendorTypes } from '@/hooks/useVendorTypes';
import { useUserTypes } from '@/hooks/useUserTypes';
import { useRoutes } from '@/hooks/useRoutes';
import { useVehicles } from '@/hooks/useVehicles';
import { useCostModels } from '@/hooks/useCostModels';

export const useSelectData = () => {
  const { data: deposits = [], isLoading: loadingDeposits } = useDeposits();
  const { data: vendorTypes = [], isLoading: loadingVendorTypes } = useVendorTypes();
  const { data: userTypes = [], isLoading: loadingUserTypes } = useUserTypes();
  const { data: routes = [], isLoading: loadingRoutes } = useRoutes();
  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: costModels = [], isLoading: loadingCostModels } = useCostModels();

  const isLoading = 
    loadingDeposits || 
    loadingVendorTypes || 
    loadingUserTypes || 
    loadingRoutes || 
    loadingVehicles || 
    loadingCostModels;

  return {
    deposits,
    vendorTypes,
    userTypes,
    routes,
    vehicles,
    costModels,
    isLoading,
  };
};

