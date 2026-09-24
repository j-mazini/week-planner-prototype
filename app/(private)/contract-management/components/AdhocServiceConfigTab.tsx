'use client';

import { useEffect, useState } from 'react';
import { useAdhocServicesConfig } from '../hooks/useAdhocServicesConfig';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import ExportButton from '@/components/export-button';
import type { AdhocService } from '@/lib/types-config-api';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';

interface AdhocServiceConfigTabProps {
  onNewAdhocService: () => void;
  onEditAdhocService: (adhocService: AdhocService) => void;
  onDeleteAdhocService?: (adhocService: AdhocService) => void;
}

export const AdhocServiceConfigTab: React.FC<AdhocServiceConfigTabProps> = ({
  onNewAdhocService,
  onEditAdhocService,
  onDeleteAdhocService: _onDeleteAdhocService,
}) => {
  const {
    filteredAdhocServices,
    isLoading,
    error,
    filter,
    setFilter,
  } = useAdhocServicesConfig();

  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);

  useEffect(() => {
    fetchServicePartners()
      .then((data) => setServicePartners(data ?? []))
      .catch((err) => {
        console.error('Error loading service partners:', err);
        setServicePartners([]);
      });
  }, []);

  const getPartnerName = (id?: number) =>
    id != null ? servicePartners.find((sp) => sp.servicePartnerId === id)?.partnerName ?? null : null;

  return (
    <div className="w-full min-w-0">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <button
          onClick={onNewAdhocService}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Adhoc Service
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,minmax(0,1fr)] gap-6 w-full min-w-0">
        {/* Control column */}
        <aside className="space-y-4 min-w-0">
          <FiltersPanel
            onClear={() => setFilter({ search: '', servicePartnerId: 'all' })}
            exportButton={
              <ExportButton
                data={filteredAdhocServices.map((a) => ({
                  id: a.adhocServiceId,
                  name: a.adhocName,
                  received: a.adhocReceivedPayment ?? '-',
                  vendor: a.adhocVendorPayment ?? '-',
                }))}
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Service Name' },
                  { key: 'received', label: 'Received Payment' },
                  { key: 'vendor', label: 'Vendor Payment' },
                ]}
                filename={`adhoc-services-${new Date().toISOString().split('T')[0]}`}
                variant="outline"
                size="sm"
                label="Export"
                showOnlyExcelAndPdf={true}
                hasActiveFilters={!!filter.search?.trim()}
                reportTitle="Adhoc Service Config"
              />
            }
          >
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search adhoc services..."
            />
            <div className="space-y-1">
              <label htmlFor="adhoc-service-partner-filter" className="text-xs font-medium text-slate-600">
                Service Partner
              </label>
              <select
                id="adhoc-service-partner-filter"
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={
                  filter.servicePartnerId == null || filter.servicePartnerId === 'all'
                    ? 'all'
                    : String(filter.servicePartnerId)
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setFilter({
                    ...filter,
                    servicePartnerId: v === 'all' ? 'all' : Number(v),
                  });
                }}
              >
                <option value="all">All service partners</option>
                {servicePartners.map((sp) => (
                  <option key={sp.servicePartnerId} value={sp.servicePartnerId}>
                    {sp.partnerName}
                  </option>
                ))}
              </select>
            </div>
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4 min-w-0">
          {isLoading ? (
            <LoadingSpinner message="Loading adhoc services..." />
          ) : filteredAdhocServices.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No adhoc services found"
              subtitle="Try adjusting the filters or creating a new adhoc service."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">ID</th>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-right font-semibold">Received</th>
                    <th className="px-3 py-2 text-right font-semibold">Vendor</th>
                    <th className="px-3 py-2 text-center font-semibold">Adhoc Sort</th>
                    <th className="px-3 py-2 text-left font-semibold">Category</th>
                    <th className="px-3 py-2 text-left font-semibold">Service Partner</th>
                    <th className="px-3 py-2 text-left font-semibold">Created By</th>
                    <th className="px-3 py-2 text-left font-semibold">Created At</th>
                    <th className="px-3 py-2 text-left font-semibold">Updated At</th>
                    <th className="px-3 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdhocServices.map((adhocService) => {
                    const partnerName =
                      adhocService.servicePartnerName ?? getPartnerName(adhocService.servicePartnerId);
                    return (
                      <tr key={adhocService.adhocServiceId} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-xs text-slate-500">
                          {adhocService.adhocServiceId}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {adhocService.adhocName ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {adhocService.adhocReceivedPayment ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {adhocService.adhocVendorPayment ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {adhocService.isAdhocSort ? (
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {adhocService.adhocCategoryId ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {partnerName ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {adhocService.createdBy ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {adhocService.createdAt
                            ? new Date(adhocService.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {adhocService.updatedAt
                            ? new Date(adhocService.updatedAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                            onClick={() => onEditAdhocService(adhocService)}
                            title="Edit adhoc service"
                          >
                            <i className="bi bi-pencil text-xs" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};



