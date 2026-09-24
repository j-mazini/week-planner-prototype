'use client';

import { useVehicleTypes } from '../hooks/useVehicleTypes';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { VehicleTypeCard } from './VehicleTypeCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import type { VehicleType } from '@/lib/types-config-api';

interface VehicleTypeTabProps {
  onNewVehicleType: () => void;
  onEditVehicleType: (vehicleType: VehicleType) => void;
  onDeleteVehicleType?: (vehicleType: VehicleType) => void;
}

export const VehicleTypeTab: React.FC<VehicleTypeTabProps> = ({
  onNewVehicleType,
  onEditVehicleType,
  onDeleteVehicleType: _onDeleteVehicleType,
}) => {
  const {
    filteredVehicleTypes,
    isLoading,
    error,
    filter,
    setFilter,
  } = useVehicleTypes();

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={onNewVehicleType}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Vehicle Type
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel
            onClear={() => setFilter({ search: '' })}
            exportButton={
              <ExportButton
                data={filteredVehicleTypes.map((v) => ({
                  id: v.vehicleTypeId,
                  name: v.typeName,
                }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Type Name' },
                ]}
                filename={`vehicle-types-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="Vehicle Types"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search vehicle types..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading vehicle types..." />
          ) : filteredVehicleTypes.length === 0 ? (
            <EmptyState
              icon="🚛"
              title="No vehicle types found"
              subtitle="Try adjusting the filters or creating a new vehicle type."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredVehicleTypes.map((vehicleType) => (
                <VehicleTypeCard
                  key={vehicleType.vehicleTypeId}
                  vehicleType={vehicleType}
                  onEdit={() => onEditVehicleType(vehicleType)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

