import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortField, SortDirection } from '../types';

interface SortableHeaderProps {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  sortField,
  sortDirection,
  onSort,
  children
}) => {
  const isActive = sortField === field;
  
  return (
    <button
      className="flex items-center justify-start cursor-pointer select-none w-full hover:text-blue-600 transition-colors bg-transparent border-0 p-0 text-left"
      onClick={() => onSort(field)}
      type="button"
    >
      {children}
      <span className="ml-2">
        {isActive && sortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : isActive && sortDirection === 'desc' ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </span>
    </button>
  );
};

