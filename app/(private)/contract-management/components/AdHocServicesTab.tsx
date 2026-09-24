'use client';

import { useAdHocServices } from '../hooks/useAdHocServices';
import { useNameLookups } from '../hooks/useNameLookups';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { StatusFilter } from './StatusFilter';
import { ServiceTypeCard } from './ServiceTypeCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface AdHocServicesTabProps {
  onNewServiceType: () => void;
  exportButton?: React.ReactNode;
}

export const AdHocServicesTab: React.FC<AdHocServicesTabProps> = ({
  onNewServiceType,
  exportButton,
}) => {
  const { 
    filteredServiceTypes, 
    isLoading, 
    error, 
    filter, 
    setFilter,
  } = useAdHocServices();

  const { depositNameById, servicePartnerNameById } = useNameLookups();

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        {exportButton}
        <button
          onClick={onNewServiceType}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Ad-Hoc Service
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel onClear={() => setFilter({ search: '', active: 'all' })}>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search ad-hoc services..."
            />
            <StatusFilter
              value={filter.active}
              onChange={(value) => setFilter({ ...filter, active: value })}
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading ad-hoc services..." />
          ) : filteredServiceTypes.length === 0 ? (
            <EmptyState
              icon="🧩"
              title="No ad-hoc services found"
              subtitle="Try adjusting the filters or creating a new ad-hoc service."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredServiceTypes.map((serviceType) => (
                <ServiceTypeCard
                  key={serviceType.serviceTypeId}
                  serviceType={serviceType}
                  depositName={serviceType.depositId ? depositNameById.get(serviceType.depositId) : undefined}
                  servicePartnerName={serviceType.servicePartnerId ? servicePartnerNameById.get(serviceType.servicePartnerId) : undefined}




                  />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};


