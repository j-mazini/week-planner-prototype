import React, { memo, useCallback, useMemo, useState } from 'react';
import type { Vendor, VendorType } from '@/lib/vendors-api';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { ModernPageHeader } from '@/components/modern-page-header';
import { vendorStyles } from '../styles';
import { VendorUserCard } from './VendorUserCard';

type KpiMetric = { label: string; value: number; icon?: React.ReactNode };

interface VendorMobileViewProps {
  /** Full filtered list for the vendor selector (mobile shows one record only when selected) */
  vendors: Vendor[];
  vendorTypes: VendorType[];
  isLoading: boolean;
  filter: { search: string; status: string; vendorType: string; servicePartnerId: string };
  onFilterChange: (filter: { search: string; status: string; vendorType: string; servicePartnerId: string }) => void;
  onNewClick: () => void;
  onEdit: (vendor: Vendor) => void;
  getStatusBadge: (vendor: Vendor) => JSX.Element;
  headerMetrics: { total: number; active: number; inactive: number; pending: number };
  kpiMetrics?: KpiMetric[];
  servicePartners?: ServicePartnerDTO[];
}

const VendorMobileViewComponent: React.FC<VendorMobileViewProps> = ({
  vendors,
  vendorTypes,
  isLoading,
  filter,
  onFilterChange,
  onNewClick,
  onEdit,
  getStatusBadge,
  headerMetrics,
  kpiMetrics,
  servicePartners = [],
}) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectorSearch, setSelectorSearch] = useState('');

  const vendorTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    vendorTypes.forEach(vt => {
      map.set(String(vt.vendorTypeId), vt.nameType || String(vt.vendorTypeId));
    });
    return map;
  }, [vendorTypes]);

  const servicePartnerMap = useMemo(() => {
    const m = new Map<number, string>();
    servicePartners.forEach((sp) => m.set(sp.servicePartnerId, sp.partnerName));
    return m;
  }, [servicePartners]);

  const resolveSpName = useCallback((v: Vendor) => {
    const raw = v.servicePartnerId;
    const id = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    if (id == null || Number.isNaN(id)) return null;
    return servicePartnerMap.get(id) ?? null;
  }, [servicePartnerMap]);

  const filteredForSelector = useMemo(() => {
    if (!selectorSearch.trim()) return vendors;
    const q = selectorSearch.toLowerCase().trim();
    return vendors.filter(v => {
      const name = `${v.firstName ?? ''} ${v.lastName ?? ''}`.trim().toLowerCase();
      const email = (v.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [vendors, selectorSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  }, [filter, onFilterChange]);

  const handleStatusChange = useCallback((status: string) => {
    onFilterChange({ ...filter, status });
  }, [filter, onFilterChange]);

  const handleSelectVendor = useCallback((v: Vendor) => {
    setSelectedVendor(v);
    setSelectorSearch('');
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedVendor(null);
  }, []);

  const metrics = kpiMetrics ?? [
    { label: 'Total', value: headerMetrics.total },
    { label: 'Active', value: headerMetrics.active },
    { label: 'Inactive', value: headerMetrics.inactive },
    { label: 'Pending', value: headerMetrics.pending },
  ];

  return (
    <main className={vendorStyles.mobileMain}>
      {/* Dashboard: compact KPIs (4 side by side) */}
      <div className="mb-3">
        <ModernPageHeader
          title="Vendors"
          subtitle="Vendor management and information"
          metrics={metrics}
          gradientFrom="slate-900"
          gradientTo="teal-600"
          metricsLayout="grid4compact"
        />
      </div>

      {/* Filters + New button */}
      <div className={vendorStyles.mobileFiltersCard}>
        <input
          type="search"
          className={vendorStyles.mobileSearchInput}
          placeholder="Search..."
          value={filter.search}
          onChange={handleSearchChange}
        />
        <div className={vendorStyles.mobileStatusButtons}>
          {['all', 'active', 'inactive', 'expiring', 'pending'].map((status) => (
            <button
              key={status}
              className={`${vendorStyles.mobileStatusButton} ${filter.status === status ? vendorStyles.mobileStatusButtonActive : vendorStyles.mobileStatusButtonInactive
                }`}
              onClick={() => handleStatusChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onNewClick} className={vendorStyles.mobileNewButton}>
          <i className="bi bi-plus-lg" />
          <span>New</span>
        </button>
      </div>

      {selectedVendor ? (
        /* Mostrar apenas o registo do vendor selecionado */
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Selected vendor</span>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs font-medium text-[#27676c] hover:text-[#003b3e] px-2 py-1 rounded"
            >
              Change vendor
            </button>
          </div>
          <VendorUserCard
            vendor={selectedVendor}
            vendorTypeName={selectedVendor.vendorType ? (vendorTypeMap.get(String(selectedVendor.vendorType)) ?? undefined) : undefined}
            statusBadge={getStatusBadge(selectedVendor)}
            onClick={onEdit}
            servicePartnerName={resolveSpName(selectedVendor)}
          />
        </div>
      ) : (
        /* Selector: escolher vendor para ver o registo */
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Select a vendor to view</label>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={selectorSearch}
              onChange={(e) => setSelectorSearch(e.target.value)}
              className="w-full border border-[#c7cdbb] rounded-lg px-3 py-2 text-sm bg-[#fffef8] text-[#1a1c16] focus:outline-none focus:ring-0 focus:border-[#27676c]"
              aria-label="Search vendors"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
            ) : filteredForSelector.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">No vendors match</div>
            ) : (
              <>
                <div className="p-2">
                  {/* Cards (blocos) em grid para melhor uso no mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredForSelector.map((v, idx) => {
                      // Alguns ambientes retornam `id` duplicado; garantir key estável e única.
                      const key = `${v.id}-${v.email ?? ''}-${v.userId ?? v.userId ?? ''}-${idx}`;

                      return (
                        <VendorUserCard
                          key={key}
                          vendor={v}
                          vendorTypeName={
                            v.vendorType
                              ? vendorTypeMap.get(String(v.vendorType)) ?? undefined
                              : undefined
                          }
                          statusBadge={getStatusBadge(v)}
                          onClick={handleSelectVendor}
                          servicePartnerName={resolveSpName(v)}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

VendorMobileViewComponent.displayName = 'VendorMobileView';

const areEqual = (prevProps: VendorMobileViewProps, nextProps: VendorMobileViewProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.vendors.length !== nextProps.vendors.length) return false;
  if (prevProps.vendorTypes.length !== nextProps.vendorTypes.length) return false;
  if (prevProps.filter.search !== nextProps.filter.search) return false;
  if (prevProps.filter.status !== nextProps.filter.status) return false;
  if (prevProps.filter.vendorType !== nextProps.filter.vendorType) return false;
  if (prevProps.headerMetrics.total !== nextProps.headerMetrics.total) return false;
  if (prevProps.headerMetrics.active !== nextProps.headerMetrics.active) return false;
  if (prevProps.headerMetrics.inactive !== nextProps.headerMetrics.inactive) return false;
  if (prevProps.headerMetrics.pending !== nextProps.headerMetrics.pending) return false;
  if (prevProps.kpiMetrics !== nextProps.kpiMetrics) return false;
  const prevIds = prevProps.vendors.map(v => v.id).sort().join(',');
  const nextIds = nextProps.vendors.map(v => v.id).sort().join(',');
  if (prevIds !== nextIds) return false;
  return true;
};

const VendorMobileView = memo(VendorMobileViewComponent, areEqual);

export default VendorMobileView;
