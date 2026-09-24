'use client';

import { useState, useCallback, useEffect } from 'react';
import { getFullNameFromToken, getUserIdFromToken } from '@/lib/auth';
import type {
  VendorType,
  UserType,
  CostModel,
  VehicleType,
  ManagementTeamFunction,
  VendorTypeCreateDTO,
  VendorTypeUpdateDTO,
  UserTypeCreateDTO,
  UserTypeUpdateDTO,
  CostModelCreateDTO,
  CostModelUpdateDTO,
  VehicleTypeCreateDTO,
  VehicleTypeUpdateDTO,
  ManagementTeamFunctionCreateDTO,
  ManagementTeamFunctionUpdateDTO,
  AdhocCategory,
  AdhocCategoryCreateDTO,
  AdhocCategoryUpdateDTO,
} from '@/lib/types-config-api';
import {
  createVendorType,
  updateVendorType,
  createUserType,
  updateUserType,
  createCostModel,
  updateCostModel,
  createVehicleType,
  updateVehicleType,
  createManagementTeamFunction,
  updateManagementTeamFunction,
  createAdhocCategory,
  updateAdhocCategory,
} from '@/lib/types-config-api';

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function useAssetsPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [userFullName, setUserFullName] = useState('User');
  const [refreshKey, setRefreshKey] = useState(0);

  const [showVendorTypeModal, setShowVendorTypeModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showCostModelModal, setShowCostModelModal] = useState(false);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  const [showManagementTeamFunctionModal, setShowManagementTeamFunctionModal] = useState(false);
  const [showAdhocCategoryModal, setShowAdhocCategoryModal] = useState(false);

  const [selectedVendorType, setSelectedVendorType] = useState<VendorType | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [selectedCostModel, setSelectedCostModel] = useState<CostModel | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedManagementTeamFunction, setSelectedManagementTeamFunction] = useState<ManagementTeamFunction | null>(null);
  const [selectedAdhocCategory, setSelectedAdhocCategory] = useState<AdhocCategory | null>(null);

  useEffect(() => {
    setCurrentDate(formatCurrentDate());
    const name = getFullNameFromToken();
    if (name) setUserFullName(name);
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const closeVendorType = useCallback(() => {
    setShowVendorTypeModal(false);
    setSelectedVendorType(null);
  }, []);
  const closeUserType = useCallback(() => {
    setShowUserTypeModal(false);
    setSelectedUserType(null);
  }, []);
  const closeCostModel = useCallback(() => {
    setShowCostModelModal(false);
    setSelectedCostModel(null);
  }, []);
  const closeVehicleType = useCallback(() => {
    setShowVehicleTypeModal(false);
    setSelectedVehicleType(null);
  }, []);
  const closeManagementTeamFunction = useCallback(() => {
    setShowManagementTeamFunctionModal(false);
    setSelectedManagementTeamFunction(null);
  }, []);
  const closeAdhocCategory = useCallback(() => {
    setShowAdhocCategoryModal(false);
    setSelectedAdhocCategory(null);
  }, []);

  const onSaveVendorType = useCallback(
    async (data: VendorTypeCreateDTO | VendorTypeUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateVendorType(id, data as VendorTypeUpdateDTO);
      } else {
        const payload: VendorTypeCreateDTO = {
          ...data,
          nameType: (data as VendorTypeCreateDTO).nameType || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createVendorType(payload);
      }
      closeVendorType();
      triggerRefresh();
    },
    [closeVendorType, triggerRefresh]
  );
  const onSaveUserType = useCallback(
    async (data: UserTypeCreateDTO | UserTypeUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateUserType(id, data as UserTypeUpdateDTO);
      } else {
        const payload: UserTypeCreateDTO = {
          ...data,
          nameType: (data as UserTypeCreateDTO).nameType || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createUserType(payload);
      }
      closeUserType();
      triggerRefresh();
    },
    [closeUserType, triggerRefresh]
  );
  const onSaveCostModel = useCallback(
    async (data: CostModelCreateDTO | CostModelUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateCostModel(id, data as CostModelUpdateDTO);
      } else {
        const payload: CostModelCreateDTO = {
          ...data,
          name: (data as CostModelCreateDTO).name || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createCostModel(payload);
      }
      closeCostModel();
      triggerRefresh();
    },
    [closeCostModel, triggerRefresh]
  );
  const onSaveVehicleType = useCallback(
    async (data: VehicleTypeCreateDTO | VehicleTypeUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateVehicleType(id, data as VehicleTypeUpdateDTO);
      } else {
        const payload: VehicleTypeCreateDTO = {
          ...data,
          typeName: (data as VehicleTypeCreateDTO).typeName || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createVehicleType(payload);
      }
      closeVehicleType();
      triggerRefresh();
    },
    [closeVehicleType, triggerRefresh]
  );
  const onSaveManagementTeamFunction = useCallback(
    async (data: ManagementTeamFunctionCreateDTO | ManagementTeamFunctionUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateManagementTeamFunction(id, data as ManagementTeamFunctionUpdateDTO);
      } else {
        const payload: ManagementTeamFunctionCreateDTO = {
          ...data,
          functionName: (data as ManagementTeamFunctionCreateDTO).functionName || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createManagementTeamFunction(payload);
      }
      closeManagementTeamFunction();
      triggerRefresh();
    },
    [closeManagementTeamFunction, triggerRefresh]
  );

  const onSaveAdhocCategory = useCallback(
    async (data: AdhocCategoryCreateDTO | AdhocCategoryUpdateDTO, id?: number) => {
      if (id !== undefined) {
        await updateAdhocCategory(id, data as AdhocCategoryUpdateDTO);
      } else {
        const payload: AdhocCategoryCreateDTO = {
          ...data,
          name: (data as AdhocCategoryCreateDTO).name || '',
          createdBy: getUserIdFromToken() ?? undefined,
        };
        await createAdhocCategory(payload);
      }
      closeAdhocCategory();
      triggerRefresh();
    },
    [closeAdhocCategory, triggerRefresh]
  );

  return {
    currentDate,
    userFullName,
    refreshKey,
    showVendorTypeModal,
    showUserTypeModal,
    showCostModelModal,
    showVehicleTypeModal,
    showManagementTeamFunctionModal,
    selectedVendorType,
    selectedUserType,
    selectedCostModel,
    selectedVehicleType,
    selectedManagementTeamFunction,
    setShowVendorTypeModal,
    setShowUserTypeModal,
    setShowCostModelModal,
    setShowVehicleTypeModal,
    setShowManagementTeamFunctionModal,
    setSelectedVendorType,
    setSelectedUserType,
    setSelectedCostModel,
    setSelectedVehicleType,
    setSelectedManagementTeamFunction,
    closeVendorType,
    closeUserType,
    closeCostModel,
    closeVehicleType,
    closeManagementTeamFunction,
    onSaveVendorType,
    onSaveUserType,
    onSaveCostModel,
    onSaveVehicleType,
    onSaveManagementTeamFunction,
    showAdhocCategoryModal,
    setShowAdhocCategoryModal,
    selectedAdhocCategory,
    setSelectedAdhocCategory,
    closeAdhocCategory,
    onSaveAdhocCategory,
  };
}

