import React from 'react';
import ExportButton from '@/components/export-button';
import NewButton from '@/components/new-button';
import type { Vehicle } from '../utils/vehicleMappers';
import { exportVehiclesToPDF } from '../utils/pdfExport';
import { fetchAllVehiclesWithFilters } from '@/lib/vehicles';
import { mapBackendToFrontend } from '../utils/vehicleMappers';
import { loadXlsx } from '@/lib/lazy-imports';
import { vehiclesStyles } from '../styles';

interface VehicleFiltersProps {
  searchTerm: string;
  statusFilter: string;
  fuelTypeFilter: string;
  availableFuelTypes: string[];
  filteredVehicles: Vehicle[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onFuelTypeFilterChange: (value: string) => void;
  onAddClick: () => void;
  servicePartnerFilter?: string;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
  onServicePartnerFilterChange?: (value: string) => void;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  searchTerm,
  statusFilter,
  fuelTypeFilter,
  availableFuelTypes,
  filteredVehicles: _filteredVehicles,
  onSearchChange,
  onStatusFilterChange,
  onFuelTypeFilterChange,
  onAddClick,
  servicePartnerFilter = '',
  servicePartners = [],
  onServicePartnerFilterChange,
}) => {
  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv'): Promise<Blob | null> => {
    try {
      // Buscar todos os veículos com os filtros aplicados (sem paginação)
      const filters = {
        search: searchTerm.trim() || undefined,
        active: statusFilter === 'all' ? undefined : statusFilter === 'Active' ? true : false,
        fuelType: fuelTypeFilter !== 'all' ? fuelTypeFilter : undefined,
      };

      const allBackendVehicles = await fetchAllVehiclesWithFilters(filters);
      const allVehicles = allBackendVehicles.map(mapBackendToFrontend);

      if (format === 'pdf') {
        return await exportVehiclesToPDF(allVehicles, statusFilter, fuelTypeFilter, searchTerm);
      } else if (format === 'xlsx') {
      const XLSX = await loadXlsx();
      const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
          const [year, month, rest] = dateString.split('-');
          if (!year || !month || !rest) return dateString;
          const day = rest.split('T')[0]?.split(' ')[0];
          if (!day) return dateString;
          return `${day}/${month}/${year}`;
        } catch (_err) {
          return dateString;
        }
      };

      const worksheetData = allVehicles.map((vehicle) => ({
        'VRN': vehicle.vrn || '-',
        'Manufacturer': vehicle.brand || '-',
        'Model': vehicle.model || '-',
        'Registration Date': formatDate(vehicle.registrationDate),
        'Fuel Type': vehicle.fuelType || '-',
        'Status': vehicle.status || '-',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      ws['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } else {
      // CSV
      const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
          const [year, month, rest] = dateString.split('-');
          if (!year || !month || !rest) return dateString;
          const day = rest.split('T')[0]?.split(' ')[0];
          if (!day) return dateString;
          return `${day}/${month}/${year}`;
        } catch (_err) {
          return dateString;
        }
      };

      const headers = ['VRN', 'Manufacturer', 'Model', 'Registration Date', 'Fuel Type', 'Status'];
      const rows = allVehicles.map((vehicle) => [
        vehicle.vrn || '',
        vehicle.brand || '',
        vehicle.model || '',
        formatDate(vehicle.registrationDate),
        vehicle.fuelType || '',
        vehicle.status || '',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const BOM = '\uFEFF';
      return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    }
    } catch (error) {
      console.error('Error exporting vehicles:', error);
      alert(`Error exporting vehicles: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  };

  return (
    <nav className={vehiclesStyles.filtersNav}>
      {/* Glass highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>
      <div className={vehiclesStyles.filtersContainer}>
        <div className={vehiclesStyles.filtersInputs}>
          <input
            type="search"
            className={vehiclesStyles.searchInput}
            id="searchFilter"
            placeholder="Search VRN, model, manufacturer, color, fuel, size..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          {servicePartners.length > 0 && (
            <select
              className={vehiclesStyles.filterSelect}
              value={servicePartnerFilter}
              onChange={(e) => onServicePartnerFilterChange?.(e.target.value)}
            >
              <option value="">All Service Partners</option>
              {servicePartners.map((sp) => (
                <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </option>
              ))}
            </select>
          )}

          <select
            className={vehiclesStyles.filterSelect}
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className={vehiclesStyles.filterSelect}
            id="fuelTypeFilter"
            value={fuelTypeFilter}
            onChange={(e) => onFuelTypeFilterChange(e.target.value)}
          >
            <option value="all">All Fuel Types</option>
            {availableFuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType}>{fuelType}</option>
            ))}
          </select>
        </div>

        <div className={vehiclesStyles.filtersActions}>
          <NewButton
            onClick={onAddClick}
            label="New"
            variant="primary"
            className="flex items-center gap-2"
          />
          <ExportButton
            filename={`vehicles-report-${new Date().toISOString().split('T')[0]}`}
            onExport={handleExport}
            className="flex items-center gap-2"
            variant="outline"
            label="Export"
            showOnlyExcelAndPdf={true}
            hasActiveFilters={statusFilter !== 'all' || fuelTypeFilter !== 'all' || searchTerm !== '' || servicePartnerFilter !== ''}
          />
        </div>
      </div>
    </nav>
  );
};


