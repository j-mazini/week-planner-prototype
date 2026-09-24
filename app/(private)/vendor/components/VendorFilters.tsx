import React, { memo, useCallback } from 'react';
import ExportButton from '@/components/export-button';
import NewButton from '@/components/new-button';
import type { Vendor, VendorType, CostModel } from '@/lib/vendors-api';
import { loadXlsx } from '@/lib/lazy-imports';
import { vendorStyles } from '../styles';

interface Filter {
  search: string;
  status: string;
  vendorType: string;
  servicePartnerId: string;
}

interface VendorFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onNewClick: () => void;
  vendors?: Vendor[];
  vendorTypes?: VendorType[];
  costModels?: CostModel[];
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
}

const VendorFilters = memo(({
  filter,
  onFilterChange,
  onNewClick,
  vendors = [],
  vendorTypes = [],
  costModels = [],
  servicePartners = [],
}: VendorFiltersProps) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  }, [filter, onFilterChange]);

  const handleStatusChange = useCallback((status: string) => {
    onFilterChange({ ...filter, status });
  }, [filter, onFilterChange]);

  const handleVendorTypeChange = useCallback((vendorType: string) => {
    onFilterChange({ ...filter, vendorType });
  }, [filter, onFilterChange]);

  const handleServicePartnerChange = useCallback((value: string) => {
    onFilterChange({ ...filter, servicePartnerId: value });
  }, [filter, onFilterChange]);

  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv'): Promise<Blob | null> => {
    if (format === 'pdf') {
      const { exportVendorsToPDF } = await import('../utils/pdfExport');
      return await exportVendorsToPDF(
        vendors,
        vendorTypes,
        costModels,
        filter.status,
        filter.vendorType,
        filter.search,
        servicePartners
      );
    } else if (format === 'xlsx') {
      const XLSX = await loadXlsx();
      // Create maps for lookup
      const vendorTypeMap = new Map<string, string>();
      vendorTypes.forEach((vt) => {
        if (vt.vendorTypeId && vt.nameType) {
          vendorTypeMap.set(String(vt.vendorTypeId), vt.nameType);
        }
      });

      const costModelMap = new Map<string, string>();
      costModels.forEach((cm) => {
        if (cm.costModelId && cm.name) {
          costModelMap.set(String(cm.costModelId), cm.name);
        }
      });

      const servicePartnerMap = new Map<number, string>();
      servicePartners.forEach((sp) => {
        servicePartnerMap.set(sp.servicePartnerId, sp.partnerName);
      });

      const getStatusText = (vendor: Vendor): string => {
        if (vendor.status) return vendor.status;
        const today = new Date();
        if (!vendor.finishDate || new Date(vendor.finishDate) > today) {
          return 'Active';
        }
        return 'Inactive';
      };

      const worksheetData = vendors.map((vendor) => ({
        'Name': `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
        'Email': vendor.email || '-',
        'Vendor Type': vendor.vendorType
          ? (vendorTypeMap.get(String(vendor.vendorType)) || vendor.vendorType)
          : '-',
        'Payment Model': vendor.paymentModel
          ? (costModelMap.get(String(vendor.paymentModel)) || vendor.paymentModel)
          : '-',
        'Service Partner': vendor.servicePartnerId
          ? (servicePartnerMap.get(vendor.servicePartnerId) || String(vendor.servicePartnerId))
          : '-',
        'Status': getStatusText(vendor),
        'Start Date': vendor.startDate || '-',
        'Finish Date': vendor.finishDate || '-',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      ws['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    }
    return null;
  };

  return (
    <div className={vendorStyles.filtersCard}>
      <div className={vendorStyles.filtersContainer}>
        <div className={vendorStyles.searchInputWrapper}>
          <input
            type="search"
            className={vendorStyles.searchInput}
            placeholder="Search by name or email..."
            value={filter.search}
            onChange={handleSearchChange}
          />
        </div>
        {vendorTypes.length > 0 && (
          <div className="w-56 flex-shrink-0">
            <select
              className={vendorStyles.formSelectInput}
              value={filter.vendorType}
              onChange={(e) => handleVendorTypeChange(e.target.value)}
            >
              <option value="all">All Vendor Types</option>
              {vendorTypes.map((vt) => (
                <option key={vt.vendorTypeId} value={String(vt.vendorTypeId)}>
                  {vt.nameType}
                </option>
              ))}
            </select>
          </div>
        )}
        {servicePartners.length > 0 && (
          <div className="w-56 flex-shrink-0">
            <select
              className={vendorStyles.formSelectInput}
              value={filter.servicePartnerId}
              onChange={(e) => handleServicePartnerChange(e.target.value)}
            >
              <option value="">All Service Partners</option>
              {servicePartners.map((sp) => (
                <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={vendorStyles.statusFilterContainer}>
          <strong className={vendorStyles.statusFilterLabel}>Status:</strong>
          <div className={vendorStyles.statusFilterButtons}>
            {['all', 'active', 'inactive', 'expiring', 'pending'].map((status) => (
              <button
                key={status}
                className={`${vendorStyles.statusFilterButton} ${filter.status === status
                  ? vendorStyles.statusFilterButtonActive
                  : vendorStyles.statusFilterButtonInactive
                  }`}
                onClick={() => handleStatusChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={vendorStyles.actionsContainer}>
          <NewButton
            onClick={onNewClick}
            label="New"
            variant="primary"
          />
          <ExportButton
            filename={`vendors-export-${new Date().toISOString().split('T')[0]}`}
            onExport={handleExport}
            variant="outline"
            label="Export"
            showOnlyExcelAndPdf={true}
            hasActiveFilters={filter.status !== 'all' || filter.vendorType !== 'all' || filter.search !== '' || filter.servicePartnerId !== ''}
          />
        </div>
      </div>
    </div>
  );
});

VendorFilters.displayName = 'VendorFilters';

export default VendorFilters;


