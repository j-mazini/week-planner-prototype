'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search...' 
}) => {
  return (
    <div className="relative group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-focus-within:text-sky-500" />
      <Input
        type="text"
        className="h-12 pl-12 pr-4 bg-white/60 backdrop-blur-md border-slate-200 rounded-xl transition-all duration-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 font-medium w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

