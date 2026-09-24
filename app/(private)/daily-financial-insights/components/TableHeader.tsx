import React, { memo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TableHeaderProps {
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

interface HeaderCellProps {
  field: string;
  label: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

const HeaderCell = memo(({ field, label, sortField, sortDirection, onSort, className = '' }: HeaderCellProps) => {
  const isActive = sortField === field;
  
  return (
    <th 
      className={`text-slate-600 font-semibold uppercase text-[11px] tracking-wide border-b border-slate-200 py-3 px-2 text-center bg-slate-50/80 transition-colors cursor-pointer hover:bg-slate-100/80 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {isActive && (
          sortDirection === 'asc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
        )}
      </div>
    </th>
  );
});

HeaderCell.displayName = 'HeaderCell';

export const TableHeader = memo(({ sortField, sortDirection, onSort }: TableHeaderProps) => {
  return (
    <thead>
      <tr>
        <HeaderCell field="date" label="Date" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="vrm" label="VRN" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="courier" label="Vendor" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="route" label="Route" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="paymentMode" label="Payment" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="rate" label="Rate" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="stops" label="Stops" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="totalPaidStops" label="Total Paid" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="sort" label="Route Sort" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="adhoc" label="AD-HOC SERVICE" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <HeaderCell field="extras" label="Extras" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <th className="text-slate-600 font-semibold uppercase text-[11px] tracking-wide border-b border-slate-200 py-3 px-2 text-center bg-slate-50/80">
          Notes
        </th>
        <HeaderCell 
          field="total" 
          label="Total" 
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSort={onSort}
          className="text-indigo-700 bg-indigo-50/80 border-l-2 border-l-indigo-500 hover:bg-indigo-100/80"
        />
        <HeaderCell field="avgPerStop" label="Avg/Stop" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
        <th className="text-slate-600 font-semibold uppercase text-[11px] tracking-wide border-b border-slate-200 py-3 px-2 text-center bg-slate-50/80">
          Actions
        </th>
      </tr>
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

