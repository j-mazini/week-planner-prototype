'use client';

import { useCostModels } from '../hooks/useCostModels';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { CostModelCard } from './CostModelCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import type { CostModel } from '@/lib/types-config-api';

interface CostModelTabProps {
  onNewCostModel?: () => void;
  onEditCostModel: (costModel: CostModel) => void;
  onDeleteCostModel?: (costModel: CostModel) => void;
  /** When false, hides the "Add Cost Model" button. Default true. */
  showAddButton?: boolean;
}

export const CostModelTab: React.FC<CostModelTabProps> = ({
  onNewCostModel,
  onEditCostModel,
  onDeleteCostModel: _onDeleteCostModel,
  showAddButton = true,
}) => {
  const {
    filteredCostModels,
    isLoading,
    error,
    filter,
    setFilter,
  } = useCostModels();

  const showAdd = showAddButton && onNewCostModel;

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        {showAdd && (
          <button
            onClick={onNewCostModel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
          >
            <i className="bi bi-plus-lg text-sm"></i>
            Add Cost Model
          </button>
        )}
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
                data={filteredCostModels.map((c) => ({
                  id: c.costModelId,
                  name: c.name ?? '-',
                  description: c.description ?? '-',
                  paymentMethod: c.paymentMethod ?? '-',
                }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Name' },
                  { key: 'description', label: 'Description' },
                  { key: 'paymentMethod', label: 'Payment Method' },
                ]}
                filename={`cost-models-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="Cost Models"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search cost models..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading cost models..." />
          ) : filteredCostModels.length === 0 ? (
            <EmptyState
              icon="💰"
              title="No cost models found"
              subtitle="Try adjusting the filters or creating a new cost model."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredCostModels.map((costModel) => (
                <CostModelCard
                  key={costModel.costModelId}
                  costModel={costModel}
                  onEdit={() => onEditCostModel(costModel)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};


