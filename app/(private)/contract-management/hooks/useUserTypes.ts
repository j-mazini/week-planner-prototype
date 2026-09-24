'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchUserTypes,
  createUserType,
  updateUserType,
  type UserType,
  type UserTypeCreateDTO,
  type UserTypeUpdateDTO,
} from '@/lib/types-config-api';

export const useUserTypes = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string }>({ search: '' });

  const loadUserTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserTypes();
      setUserTypes(data || []);
    } catch (err) {
      console.error('Error loading user types:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user types';
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.warn('User types table does not exist yet. The backend may need to create the table first.');
        setUserTypes([]);
        setError('User types feature is not available yet. Please contact the administrator to set up the database tables.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredUserTypes = useMemo(() => {
    if (!filter.search) {
      return userTypes;
    }

    const searchLower = filter.search.toLowerCase();
    return userTypes.filter((ut) => {
      return (
        ut.nameType?.toLowerCase().includes(searchLower) ||
        ut.userTypeId?.toString().includes(searchLower)
      );
    });
  }, [userTypes, filter]);

  const handleSave = useCallback(async (
    userTypeData: UserTypeCreateDTO | UserTypeUpdateDTO,
    selectedUserType: UserType | null
  ) => {
    try {
      if (selectedUserType?.userTypeId) {
        await updateUserType(selectedUserType.userTypeId, userTypeData as UserTypeUpdateDTO);
      } else {
        await createUserType(userTypeData as UserTypeCreateDTO);
      }
      await loadUserTypes();
    } catch (error) {
      console.error('Error saving user type:', error);
      throw error;
    }
  }, [loadUserTypes]);

  // Load automatically when hook is used
  useEffect(() => {
    loadUserTypes();
  }, [loadUserTypes]);

  return {
    userTypes,
    filteredUserTypes,
    isLoading,
    error,
    filter,
    setFilter,
    loadUserTypes,
    handleSave,
  };
};


