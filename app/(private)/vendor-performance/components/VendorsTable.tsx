"use client";

import { memo, useMemo } from 'react';
import { getTimeWindowClass, getSporHClass, type ProcessedVendor } from '../utils';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import { PerformanceTableSkeleton } from './PerformanceTableSkeleton';

interface VendorsTableProps {
  vendors: ProcessedVendor[];
  loading: boolean;
  error: string | null;
  onViewPerformance: (vendor: ProcessedVendor) => void;
}

const VendorRow = memo(({ vendor, index, onViewPerformance }: { vendor: ProcessedVendor; index: number; onViewPerformance: (vendor: ProcessedVendor) => void }) => {
  const twClass = getTimeWindowClass(vendor.avgTw);
  const sporHClass = getSporHClass(vendor.avgSporH);
  
  const afdClass = useMemo(() => {
    if (vendor.avgAfd === '--:--' || vendor.avgAfd === 'N/A') return '';
    const afdValue = parseFloat(vendor.avgAfd.replace('%', ''));
    if (!isNaN(afdValue) && afdValue > 4) {
      return 'text-red-600 font-semibold';
    }
    return '';
  }, [vendor.avgAfd]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewPerformance(vendor);
  };

  return (
    <tr className={`transition-colors duration-150 ${
      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
    } hover:bg-gray-100`}>
      <td className="py-2.5 px-2 text-sm align-middle text-center whitespace-nowrap">
        <div className="text-center">
          <strong className="block text-slate-800">{vendor.firstName} {vendor.lastName}</strong>
          {vendor.email && (
            <small className="text-slate-500 block text-xs">{vendor.email}</small>
          )}
        </div>
      </td>
      <td className={`py-2.5 px-2 text-sm align-middle text-center whitespace-nowrap ${twClass}`}>
        {vendor.avgTw}
      </td>
      <td className="py-2.5 px-2 text-sm align-middle text-center whitespace-nowrap text-slate-800">
        {vendor.avgSpr}
      </td>
      <td className={`py-2.5 px-2 text-sm align-middle text-center whitespace-nowrap ${sporHClass}`}>
        {vendor.avgSporH}
      </td>
      <td className={`py-2.5 px-2 text-sm align-middle text-center whitespace-nowrap ${afdClass}`}>
        {vendor.avgAfd}
      </td>
      <td className="py-2.5 px-2 text-sm align-middle text-center overflow-visible relative">
        <button
          className="text-lg cursor-pointer transition-colors duration-150 flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border-none hover:bg-blue-50 active:opacity-80 mx-auto text-blue-600"
          onClick={handleClick}
          title="View Performance"
          type="button"
          aria-label="View Performance"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </td>
    </tr>
  );
});

VendorRow.displayName = 'VendorRow';

export const VendorsTable = memo(function VendorsTable({ 
  vendors, 
  loading, 
  error, 
  onViewPerformance 
}: VendorsTableProps) {
  if (loading) {
    return <PerformanceTableSkeleton />;
  }

  if (error) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-4">
          <ErrorMessage message={error} />
        </td>
      </tr>
    );
  }

  if (vendors.length === 0) {
    return (
      <tr>
        <td colSpan={6}>
          <EmptyState message="No vendors match the current filters." />
        </td>
      </tr>
    );
  }

  return (
    <>
      {vendors.map((vendor, index) => (
        <VendorRow key={vendor.id} vendor={vendor} index={index} onViewPerformance={onViewPerformance} />
      ))}
    </>
  );
});
