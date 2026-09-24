"use client";

import React from 'react';
import { TableHeader } from '@/components/table-header';

// Re-export the types from the proper module if available, or define fallback types if needed.
// If '../page' doesn't export these types, provide compatible local definitions below.

export type WeekPlannerField =
  | 'date'
  | 'name'
  | 'route'
  | 'costModel'
  | 'rate'
  | 'routeCost'
  | 'routeSort'
  | 'adhocSort'
  | 'extras'
  | 'notes'
  | 'registrationPlate'
  | 'status';

export type SortConfig = {
  key: WeekPlannerField;
  direction: 'asc' | 'desc';
};

export type WeekPlannerRecord = {
  id: number;
  date: string;
  name: string;
  route: string;
  costModel: string;
  rate: number;
  routeCost: number;
  routeSort: number;
  adhocSort: number;
  extras: string;
  notes: string;
  registrationPlate: string;
  status: string;
};

// Helper function to determine column width based on content
// Using percentage-based widths to ensure table fits without horizontal scroll
const getColumnWidth = (key: string): string => {
  const widthMap: Record<string, string> = {
    date: '8%',
    name: '11%',
    route: '8%',
    costModel: '10%',
    rate: '7%',
    routeCost: '8%',
    routeSort: '7%',
    adhocSort: '9%',
    extras: '7%',
    notes: '13%',
    registrationPlate: '11%',
    status: '8%',
  };
  return widthMap[key] || 'auto';
};

type TableHeader = {
  key: WeekPlannerField;
  label: string;
};

type WeekPlannerTableProps = {
  loading: boolean;
  data: WeekPlannerRecord[];
  headers: readonly TableHeader[];
  sortConfig: SortConfig;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onSort: (key: WeekPlannerField) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEdit: (item: WeekPlannerRecord) => void;
  onDelete: (id: number) => void;
};

export const WeekPlannerTable = React.memo(function WeekPlannerTable({
  loading,
  data,
  headers,
  sortConfig,
  currentPage,
  totalPages,
  totalRecords,
  onSort,
  onPrevPage,
  onNextPage,
  onEdit,
  onDelete,
}: WeekPlannerTableProps) {
  const currentPageClamped = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden w-full backdrop-blur-sm">
      <div className="w-full overflow-visible">
        <table className="w-full" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/80 border-b border-slate-200/60">
            <tr>
              {headers.map((header) => (
                <TableHeader
                  key={header.key}
                  variant="minimal"
                  sortable
                  sortDirection={sortConfig.key === header.key ? sortConfig.direction : null}
                  onClick={() => onSort(header.key)}
                  style={{ width: getColumnWidth(header.key) }}
                >
                  {header.label}
                </TableHeader>
              ))}
              <TableHeader variant="minimal" style={{ width: '7%' }}>
                Actions
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-5 py-12 text-center text-slate-500 text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>Loading week planners...</span>
                  </div>
                </td>
              </tr>
            ) : !loading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-5 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-500 text-base font-medium">
                      No week planners found.
                    </p>
                    <p className="text-slate-400 text-sm">
                      Try changing the date or search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={`${item.id ?? index}`}
                  className={`transition-colors duration-150 ease-out ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  } hover:!bg-slate-200`}
                >
                  {headers.map((header) => (
                    <td
                      key={header.key}
                      className="px-5 py-3.5 text-sm font-medium text-slate-700 truncate"
                      title={item[header.key] ? String(item[header.key]) : "-"}
                    >
                      {item[header.key] ? (item[header.key] as string) : <span className="text-slate-400">-</span>}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100/80 border-t border-slate-200/60">
        <span className="text-sm font-medium text-slate-600">
          Page {currentPageClamped} of {totalPages}{" "}
          {totalRecords > 0 && `(${totalRecords} total records)`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1 || loading || totalPages === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages || totalPages === 0 || loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

