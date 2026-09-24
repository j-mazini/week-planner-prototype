"use client";

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProcessedVendor } from '../utils';

interface VendorSelectProps {
  vendors: ProcessedVendor[];
  value: ProcessedVendor | null;
  onChange: (vendor: ProcessedVendor | null) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const VendorSelect = memo(function VendorSelect({
  vendors,
  value,
  onChange,
  loading = false,
  disabled = false,
  label = 'Vendor',
  placeholder = 'Select vendor',
  className = '',
}: VendorSelectProps) {
  const sortedVendors = [...vendors].sort((a, b) => {
    const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
    const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
  });

  const handleChange = (id: string) => {
    const vendor = sortedVendors.find((v) => v.id === Number(id)) ?? null;
    onChange(vendor);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor="vendor-select" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      <Select
        value={value?.id != null ? String(value.id) : undefined}
        onValueChange={handleChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id="vendor-select" className="w-full min-w-[200px] max-w-[320px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[280px]">
          <SelectScrollUpButton />
          {sortedVendors.map((d) => (
            <SelectItem key={d.id} value={String(d.id)}>
              {d.firstName} {d.lastName} {d.routeName ? `(${d.routeName})` : ''}
            </SelectItem>
          ))}
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    </div>
  );
});
