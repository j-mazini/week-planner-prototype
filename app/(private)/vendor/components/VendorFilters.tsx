"use client";

import { STATUS_FILTERS } from "../constants";
import type { OptionModel, VendorFilterState } from "../types";

export default function VendorFilters({
  filter,
  onFilterChange,
  onNewClick,
  vendorTypes,
  servicePartners,
}: {
  filter: VendorFilterState;
  onFilterChange: (filter: VendorFilterState) => void;
  onNewClick: () => void;
  vendorTypes: OptionModel[];
  servicePartners: OptionModel[];
}) {
  const visibleVendorTypes = vendorTypes.filter((vt) => vt.name.toUpperCase() !== "OFF");

  return (
    <div className="v-filters">
      <input
        type="search"
        className="v-search"
        placeholder="Search by name, email, ID, depot or route…"
        value={filter.search}
        onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
      />
      <select
        className="v-select"
        value={filter.vendorTypeId}
        onChange={(e) => onFilterChange({ ...filter, vendorTypeId: e.target.value as VendorFilterState["vendorTypeId"] })}
      >
        <option value="all">All Vendor Types</option>
        {visibleVendorTypes.map((vt) => <option key={vt.id} value={vt.id}>{vt.name}</option>)}
      </select>
      <select
        className="v-select"
        value={filter.servicePartnerId}
        onChange={(e) => onFilterChange({ ...filter, servicePartnerId: e.target.value })}
      >
        <option value="">All Service Partners</option>
        {servicePartners.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
      </select>
      <div className="v-statusgroup">
        <strong className="v-statuslbl">Status:</strong>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className="v-chip"
            aria-pressed={filter.status === status}
            onClick={() => onFilterChange({ ...filter, status })}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      <button type="button" className="v-newbtn" onClick={onNewClick}>+ New</button>
    </div>
  );
}
