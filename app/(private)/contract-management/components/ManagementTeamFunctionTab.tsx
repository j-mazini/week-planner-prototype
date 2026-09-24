'use client';

import { useManagementTeamFunctions } from '../hooks/useManagementTeamFunctions';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal';
import type { ManagementTeamFunction } from '@/lib/types-config-api';

interface ManagementTeamFunctionTabProps {
  onNew: () => void;
  onEdit: (item: ManagementTeamFunction) => void;
}

export const ManagementTeamFunctionTab: React.FC<ManagementTeamFunctionTabProps> = ({
  onNew,
  onEdit,
}) => {
  const {
    filteredItems,
    isLoading,
    error,
    filter,
    setFilter,
    handleDelete,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
    getDepositName,
    getVendorName,
    getServicePartnerName,
  } = useManagementTeamFunctions();

  return (
    <>
      <ConfirmDeleteModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Management Team Function"
        message="Are you sure you want to delete this management team function? This action cannot be undone."
      />
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm" />
          Add Management Team Function
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
                data={filteredItems.map((item) => ({
                  id: item.managementTeamFunctionId,
                  name: item.functionName ?? '-',
                  deposit: item.depositId ? getDepositName(item.depositId) : '-',
                  vendor: item.userId ? getVendorName(item.userId) : '-',
                  servicePartner: item.servicePartnerName ?? (item.servicePartnerId ? getServicePartnerName(item.servicePartnerId) : '-'),
                }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Function Name' },
                  { key: 'deposit', label: 'Deposit' },
                  { key: 'vendor', label: 'Vendor' },
                  { key: 'servicePartner', label: 'Service Partner' },
                ]}
                filename={`management-team-functions-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="Management & Support Team"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search by name, deposit, vendor..."
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading management team functions..." />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No management team functions found"
              subtitle="Try adjusting the filters or creating a new one."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredItems.map((item) => (
                <div
                  key={item.managementTeamFunctionId}
                  className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-red-600 to-red-500" aria-hidden />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          {item.functionName || `Function ${item.managementTeamFunctionId}`}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        {item.managementTeamFunctionId && (
                          <span className="inline-flex items-center gap-1">
                            <i className="bi bi-hash text-[10px]" />
                            ID: <span className="font-medium">{item.managementTeamFunctionId}</span>
                          </span>
                        )}
                        {item.depositId && (
                          <span className="inline-flex items-center gap-1">
                            <i className="bi bi-building text-[10px]" />
                            Deposit: <span className="font-medium">{getDepositName(item.depositId)}</span>
                          </span>
                        )}
                        {item.userId && (
                          <span className="inline-flex items-center gap-1">
                            <i className="bi bi-person text-[10px]" />
                            Vendor: <span className="font-medium">{getVendorName(item.userId)}</span>
                          </span>
                        )}
                        {item.servicePartnerId && (
                          <span className="inline-flex items-center gap-1">
                            <i className="bi bi-briefcase text-[10px]" />
                            Service Partner: <span className="font-medium">{item.servicePartnerName ?? getServicePartnerName(item.servicePartnerId)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-blue-200 hover:shadow"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil text-sm" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-800 transition hover:border-red-200 hover:shadow"
                        onClick={() => handleDelete(item.managementTeamFunctionId)}
                        title="Delete"
                      >
                        <i className="bi bi-trash text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

