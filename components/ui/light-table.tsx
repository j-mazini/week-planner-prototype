"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  id: string;
  header: string | ((props: { column: SortableColumn }) => React.ReactNode);
  accessor: keyof T | ((row: T) => unknown);
  cell?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  sortingFn?: (a: T, b: T) => number;
}

interface SortableColumn {
  id: string;
  toggleSorting: (asc: boolean) => void;
  getIsSorted: () => SortDirection;
}

interface LightTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  footer?: React.ReactNode;
}

export function LightTable<T extends Record<string, unknown>>({
  data,
  columns,
  className,
  footer,
}: LightTableProps<T>) {
  const [sorting, setSorting] = React.useState<{ id: string; direction: SortDirection } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sorting || !sorting.direction) return data;

    const column = columns.find((col) => col.id === sorting.id);
    if (!column) return data;

    const sorted = [...data].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      if (typeof column.accessor === "function") {
        aValue = column.accessor(a);
        bValue = column.accessor(b);
      } else {
        aValue = a[column.accessor];
        bValue = b[column.accessor];
      }

      if (column.sortingFn) {
        return column.sortingFn(a, b);
      }

      // Default sorting
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }
      return String(aValue).localeCompare(String(bValue));
    });

    return sorting.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sorting, columns]);

  const SortableHeader = ({ column }: { column: SortableColumn }) => {
    const isSorted = column.getIsSorted();
    return (
      <button
        className="flex items-center justify-center cursor-pointer select-none w-full hover:bg-gray-100 rounded px-2 py-1"
        onClick={() => column.toggleSorting(isSorted === "asc")}
        type="button"
      >
        <span className="mr-2">
          {isSorted === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </span>
      </button>
    );
  };

  return (
    <div className={cn("rounded-md border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column) => {
                const sortableColumn: SortableColumn = {
                  id: column.id,
                  toggleSorting: (asc: boolean) => {
                    setSorting({ id: column.id, direction: asc ? "asc" : "desc" });
                  },
                  getIsSorted: () => {
                    if (sorting?.id === column.id) return sorting.direction;
                    return null;
                  },
                };

                return (
                  <th
                    key={column.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {typeof column.header === "function" ? (
                      column.header({ column: sortableColumn })
                    ) : column.sortable ? (
                      <SortableHeader column={sortableColumn} />
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => {
                    let value: unknown;
                    if (typeof column.accessor === "function") {
                      value = column.accessor(row);
                    } else {
                      value = row[column.accessor];
                    }

                    return (
                      <td key={column.id} className="px-4 py-3 text-sm text-gray-900">
                        {column.cell ? column.cell(value, row) : (value as React.ReactNode) ?? "--"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          {footer && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                {footer}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

