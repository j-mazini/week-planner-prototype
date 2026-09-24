'use client';
import React, { memo } from 'react';
import { TableHeader } from '@/components/table-header';
import { StatusBadge } from '@/components/status-badge';
import { TableLoadingSkeleton } from '@/components/ui/table-loading-skeleton';
import ServicePartnerBadge from '@/components/service-partner-badge';
import { useTableSorting } from '../hooks/useTableSorting';

interface DisplayDeduction {
  id: string;
  dateOfIncident: string;
  courierName: string;
  type: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Disputed';
  backendId: number;
  backendType: 'fix-damage' | 'traffic-penalty' | 'pre-payment' | 'liquidation-damage' | 'other';
  userId: number;
  [key: string]: unknown;
}

interface DeductionsTableProps {
  deductions: DisplayDeduction[];
  onView: (item: DisplayDeduction) => void | Promise<void>;
  onEdit: (item: DisplayDeduction) => void | Promise<void>;
  onDelete: (item: DisplayDeduction) => void;
  totalAmount: number;
  isLoading?: boolean;
  servicePartnerNameByUserId?: Map<number, string>;
}

const formatCurrency = (val: number | string | null | undefined) => {
  if (val === undefined || val === null || val === '') return '£0.00';
  const num = typeof val === 'string' ? parseFloat(val) : Number(val);
  if (isNaN(num)) return '£0.00';
  return `£${num.toFixed(2)}`;
};

const renderStatusBadge = (status: string) => {
  if (status === 'Paid') return <StatusBadge status="paid">Paid</StatusBadge>;
  if (status === 'Pending') return <StatusBadge status="pending">Pending</StatusBadge>;
  if (status === 'Disputed') return <StatusBadge status="disputed">Disputed</StatusBadge>;
  return <StatusBadge status={status}>{status}</StatusBadge>;
};

const DeductionsTableComponent = ({ 
  deductions, 
  onView, 
  onEdit, 
  onDelete, 
  totalAmount,
  isLoading = false,
  servicePartnerNameByUserId,
}: DeductionsTableProps) => {
  const { sortField, sortDirection, handleSort, sortedData } = useTableSorting(deductions);

  if (isLoading) {
    return <TableLoadingSkeleton rows={5} columns={7} showHeader={true} />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'id' ? sortDirection : null}
              onClick={() => handleSort('id')}
            >
              ID
            </TableHeader>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'dateOfIncident' ? sortDirection : null}
              onClick={() => handleSort('dateOfIncident')}
            >
              Date
            </TableHeader>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'courierName' ? sortDirection : null}
              onClick={() => handleSort('courierName')}
            >
              Vendor Name
            </TableHeader>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'type' ? sortDirection : null}
              onClick={() => handleSort('type')}
            >
              Type
            </TableHeader>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'amount' ? sortDirection : null}
              onClick={() => handleSort('amount')}
            >
              Value
            </TableHeader>
            <TableHeader variant="standard">Fee</TableHeader>
            <TableHeader 
              variant="standard" 
              sortable 
              sortDirection={sortField === 'status' ? sortDirection : null}
              onClick={() => handleSort('status')}
            >
              Status
            </TableHeader>
            <TableHeader variant="standard">Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-gray-500 py-4">
                No entries found for the selected criteria.
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr 
                key={item.backendId != null ? `deduction-${item.backendId}-${item.backendType ?? ''}-${index}` : `deduction-${item.id}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3.5 text-sm">
                  <strong className="text-gray-800 font-medium">{item.id}</strong>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">{item.dateOfIncident || 'N/A'}</td>
                <td className="px-4 py-3.5 text-sm text-gray-700">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{item.courierName}</span>
                    {(() => {
                      const spName = item.userId ? servicePartnerNameByUserId?.get(Number(item.userId)) ?? null : null;
                      return spName !== null ? <ServicePartnerBadge partnerName={spName} size="xs" /> : null;
                    })()}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">{item.type}</td>
                <td className="px-4 py-3.5 text-sm">
                  <strong className="text-gray-800 font-semibold">{formatCurrency(item.amount)}</strong>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">
                  {item.backendType === 'pre-payment' && item.fee_value != null
                    ? formatCurrency(item.fee_value)
                    : '–'}
                </td>
                <td className="px-4 py-3.5">{renderStatusBadge(item.status)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                      className="text-gray-500 text-lg p-0 bg-transparent border-0 cursor-pointer hover:text-blue-500 transition-colors"
                    title="View"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onView(item);
                    }}
                  >
                    <i className="bi bi-eye-fill" />
                  </button>
                  <button
                    type="button"
                      className="text-gray-500 text-lg p-0 bg-transparent border-0 cursor-pointer hover:text-blue-500 transition-colors"
                    title="Edit"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <i className="bi bi-pencil-fill" />
                  </button>
                  <button
                    type="button"
                      className="text-gray-500 text-lg p-0 bg-transparent border-0 cursor-pointer hover:text-red-500 transition-colors"
                    title="Delete"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(item);
                    }}
                  >
                    <i className="bi bi-trash-fill" />
                  </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
            <td colSpan={4} className="px-4 py-4 text-right text-gray-800 font-semibold text-sm uppercase tracking-wide">
              Total
            </td>
            <td colSpan={4} className="px-4 py-4 text-[clamp(16px,1.1vw,18px)] text-gray-900 font-bold">
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const DeductionsTable = memo(DeductionsTableComponent);

export default DeductionsTable;
