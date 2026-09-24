import React from 'react';
import { InsightRow, PageTotals } from '../types';
import { formatCurrency } from '../utils';
import { InsightsTableRow } from './InsightsTableRow';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { TableHeader } from './TableHeader';
import { CostModel } from '@/lib/cost-models';

interface InsightsTableProps {
  loading: boolean;
  filteredData: InsightRow[];
  pageTotals: PageTotals;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  costModels: CostModel[];
  getVrnBadgeVariant?: (vrn?: string | null) => 'green' | 'blue';
  onEditRow?: (row: InsightRow) => void;
  onDeleteRow?: (row: InsightRow) => void;
}

export const InsightsTable: React.FC<InsightsTableProps> = React.memo(({
  loading,
  filteredData,
  pageTotals,
  sortField,
  sortDirection,
  onSort,
  costModels,
  getVrnBadgeVariant,
  onEditRow,
  onDeleteRow,
}) => {
  return (
    <div className="w-full min-w-[900px] overflow-x-auto overflow-y-visible relative">
      <table className="mb-0 align-middle w-full table-fixed">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '6%' }} />
        </colgroup>
        <TableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        <tbody id="data-table-body">
          {loading ? (
            <LoadingSpinner />
          ) : filteredData.length === 0 ? (
            <EmptyState />
          ) : (
            filteredData.map((row, index) => (
              <InsightsTableRow
                key={`${row.date}-${row.vrm}-${row.courier}-${row.route}-${index}`}
                row={row}
                index={index}
                costModels={costModels}
                getVrnBadgeVariant={getVrnBadgeVariant}
                onEditRow={onEditRow}
                onDeleteRow={onDeleteRow}
              />
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t-2 border-slate-200">
            <td colSpan={12} className="py-3 px-2 text-sm align-middle text-right font-semibold text-slate-700">
              Total
            </td>
            <td id="pageTotal" className="py-3 px-2 text-sm align-middle text-center font-semibold text-indigo-700">
              {formatCurrency(pageTotals.total)}
            </td>
            <td id="pageAvg" className="py-3 px-2 text-sm align-middle text-center font-semibold text-slate-700">
              {formatCurrency(pageTotals.avg)}
            </td>
            <td className="py-3 px-2 text-sm align-middle text-center text-slate-400" aria-hidden />
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

InsightsTable.displayName = 'InsightsTable';

