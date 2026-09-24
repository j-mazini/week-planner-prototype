import { useState, useCallback } from 'react';
import { FilterState } from '../types';
import { getInitialFilters } from '../utils';

interface UseFiltersReturn {
  filters: FilterState;
  searchInput: string;
  handleDateChange: (key: keyof FilterState) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleToggle: (key: keyof FilterState, value: string) => void;
  applySearch: () => void;
  clearSearch: () => void;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}

export const useFilters = (): UseFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(getInitialFilters());
  const [searchInput, setSearchInput] = useState('');

  const handleDateChange = useCallback(
    (key: keyof FilterState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFilters((prev) => {
        // Ao mudar a primeira data, voltamos para modo "dia" limpando dateTo.
        if (key === 'dateFrom') {
          return {
            ...prev,
            dateFrom: value,
            dateTo: ''
          };
        }

        if (key === 'dateTo') {
          // Garantir que dateTo não fique antes de dateFrom
          if (value && prev.dateFrom && value < prev.dateFrom) {
            return {
              ...prev,
              dateTo: prev.dateFrom
            };
          }

          return {
            ...prev,
            dateTo: value
          };
        }

        return {
          ...prev,
          [key]: value
        };
      });
    },
    []
  );

  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  }, []);

  const applySearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput
    }));
  }, [searchInput]);

  const handleSearchKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applySearch();
    }
  }, [applySearch]);

  const handleToggle = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      if (key === 'depot') {
        return {
          ...prev,
          depot: value,
          loop: 'All'
        };
      }
      return {
        ...prev,
        [key]: value
      };
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setFilters((prev) => ({ ...prev, search: '' }));
  }, []);

  return {
    filters,
    searchInput,
    handleDateChange,
    handleSearchInputChange,
    handleSearchKeyPress,
    handleToggle,
    applySearch,
    clearSearch,
    setSearchInput,
  };
};

