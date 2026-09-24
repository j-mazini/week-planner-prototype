"use client";

import React from "react";
import { weekPlannerOperationsStyles } from "../../styles";

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterVendorType: string;
  onFilterVendorTypeChange: (value: string) => void;
  statusOptions: string[];
  vendorTypeOptions: string[];
  filterServicePartnerId?: string;
  onFilterServicePartnerIdChange?: (value: string) => void;
  servicePartners?: Array<{ servicePartnerId: number; partnerName: string }>;
};

export const OperationsFiltersBar = React.memo(function OperationsFiltersBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterVendorType,
  onFilterVendorTypeChange,
  statusOptions,
  vendorTypeOptions,
  filterServicePartnerId = '',
  onFilterServicePartnerIdChange,
  servicePartners = [],
}: Props) {
  return (
    <div
      className={weekPlannerOperationsStyles.filtersBar}
      data-animate="fade-in-up"
    >
      <div className={weekPlannerOperationsStyles.filtersSearchGroup}>
        <label htmlFor="search" className={weekPlannerOperationsStyles.filtersLabel}>
          Search (Vendor, Route, Vehicle)
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to search..."
          className={weekPlannerOperationsStyles.filtersInput}
        />
      </div>

      {servicePartners.length > 0 && (
        <div>
          <label className={weekPlannerOperationsStyles.filtersLabel}>
            Service Partner
          </label>
          <select
            value={filterServicePartnerId}
            onChange={(e) => onFilterServicePartnerIdChange?.(e.target.value)}
            className={weekPlannerOperationsStyles.filtersSelect}
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

      <div>
        <label htmlFor="filterStatus" className={weekPlannerOperationsStyles.filtersLabel}>
          Status
        </label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className={weekPlannerOperationsStyles.filtersSelect}
        >
          <option value="all">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filterVendorType" className={weekPlannerOperationsStyles.filtersLabel}>
          Vendor Type
        </label>
        <select
          id="filterVendorType"
          value={filterVendorType}
          onChange={(e) => onFilterVendorTypeChange(e.target.value)}
          className={weekPlannerOperationsStyles.filtersSelect}
        >
          <option value="all">All</option>
          {vendorTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
