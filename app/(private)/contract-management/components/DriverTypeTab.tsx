'use client';

import { useVendorTypes } from '../hooks/useVendorTypes';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { VendorTypeCard } from './VendorTypeCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import type { VendorType } from '@/lib/types-config-api';

interface VendorTypeTabProps {
  onNewVendorType: () => void;
  onEditVendorType: (vendorType: VendorType) => void;
  onDeleteVendorType: (vendorType: VendorType) => void;
  exportButton?: React.ReactNode;
}

export const VendorTypeTab: React.FC<VendorTypeTabProps> = ({
  onNewVendorType,
  onEditVendorType,
  onDeleteVendorType: _onDeleteVendorType,
  exportButton,
}) => {
  const {
    filteredVendorTypes,
    isLoading,
    error,
    filter,
    setFilter,
  } = useVendorTypes();

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        {exportButton}
        <button
          onClick={onNewVendorType}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Vendor Type
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel onClear={() => setFilter({ search: '' })}>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search vendor types..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading vendor types..." />
          ) : filteredVendorTypes.length === 0 ? (
            <EmptyState
              icon="🚗"
              title="No vendor types found"
              subtitle="Try adjusting the filters or creating a new vendor type."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredVendorTypes.map((vendorType) => (
                <VendorTypeCard
                  key={vendorType.vendorTypeId}
                  vendorType={vendorType}
                  onEdit={() => onEditVendorType(vendorType)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

