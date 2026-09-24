import React, { memo } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = memo<SearchInputProps>(({
  value,
  onChange,
  placeholder = "Search by ID or Vendor..."
}) => {
  return (
    <div className="relative group min-w-[200px] flex-shrink-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-600" />
      <input
        type="text"
        className="
          border-2 border-gray-200 rounded-lg bg-white
          transition-all duration-300 text-sm h-11 pl-10 pr-3.5 w-full
          focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100
          hover:border-blue-400 hover:shadow-md hover:shadow-blue-100
          hover:-translate-y-0.5
        "
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

