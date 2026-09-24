import React, { memo } from 'react';
import { vehiclesStyles } from '../styles';

interface MobileVehicleFiltersProps {
  searchTerm: string;
  statusFilter: string;
  fuelTypeFilter: string;
  availableFuelTypes: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onFuelTypeFilterChange: (value: string) => void;
  onAddClick: () => void;
  servicePartnerFilter?: string;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
  onServicePartnerFilterChange?: (value: string) => void;
}

const MobileVehicleFilters = memo<MobileVehicleFiltersProps>(({
  searchTerm,
  statusFilter,
  fuelTypeFilter,
  availableFuelTypes,
  onSearchChange,
  onStatusFilterChange,
  onFuelTypeFilterChange,
  onAddClick,
  servicePartnerFilter = '',
  servicePartners = [],
  onServicePartnerFilterChange,
}) => {
  return (
    <div className={vehiclesStyles.mobileFiltersCard}>
      {/* Glass highlights */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>
      <div className="relative z-10 space-y-2">
        <input
          type="search"
          className={vehiclesStyles.mobileSearchInput}
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {servicePartners.length > 0 && (
          <select
            className={vehiclesStyles.mobileFilterSelect}
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
        <div className={vehiclesStyles.mobileFiltersGrid}>
          <select
            className={vehiclesStyles.mobileFilterSelect}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            className={vehiclesStyles.mobileFilterSelect}
            value={fuelTypeFilter}
            onChange={(e) => onFuelTypeFilterChange(e.target.value)}
          >
            <option value="all">All Fuel</option>
            {availableFuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType}>{fuelType}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onAddClick}
          className={vehiclesStyles.mobileNewButton}
        >
          <i className="bi bi-plus-lg"></i>
          New
        </button>
      </div>
    </div>
  );
});

MobileVehicleFilters.displayName = 'MobileVehicleFilters';

export default MobileVehicleFilters;

