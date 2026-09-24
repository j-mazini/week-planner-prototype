"use client";

import React, { memo, useMemo } from 'react';
import { InsightRow } from '../types';
import { formatCurrency, formatDateForDisplay, calculateRow } from '../utils';
import VrnPlate from '@/components/vrn-plate';
import ServicePartnerBadge from '@/components/service-partner-badge';
import { useServicePartnerNameByUserId } from '@/hooks/useServicePartnerNameByUserId';
import { FSRInfoIcon } from './FSRInfoIcon';
import { CostModel } from '@/lib/cost-models';
import { getCostModelIdFromPaymentMode, canEditOrDeleteOperationRow, isBandedPaymentMode, isDafPaymentMode, getFixedPriceByMode, PAYMENT_MODE, isOffPaymentMode } from '../utils';
import { Pencil, Trash2 } from 'lucide-react';

interface MobileCardProps {
  row: InsightRow;
  index: number;
  costModels: CostModel[];
  badgeVariant?: 'green' | 'blue';
  onEditRow?: (row: InsightRow) => void;
  onDeleteRow?: (row: InsightRow) => void;
}

export const MobileCard = memo<MobileCardProps>(function MobileCard({
  row,
  costModels,
  badgeVariant = 'blue',
  onEditRow,
  onDeleteRow,
}) {
  const { total } = calculateRow(row);
  const servicePartnerMap = useServicePartnerNameByUserId();
  const spName = row.userId ? servicePartnerMap.get(Number(row.userId)) ?? null : null;
  const canMutate = canEditOrDeleteOperationRow(row);
  const isDaf = isDafPaymentMode(row.paymentMode);
  const isBanded = isBandedPaymentMode(row.paymentMode);
  const isOff = isOffPaymentMode(row.paymentMode);
  const fixedPrice = getFixedPriceByMode(row.costModel, row.paymentMode);
  const paymentLabel = useMemo(() => {
    if (row.paymentMode === PAYMENT_MODE.HOURLY) return 'Hourly Rate';
    const id = getCostModelIdFromPaymentMode(row.paymentMode);
    const cm = costModels.find((c) => c.costModelId === id);
    return cm?.name ?? row.paymentMode ?? '–';
  }, [row.paymentMode, costModels]);

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700">{formatDateForDisplay(row.date)}</p>
          <p className="text-[10px] text-indigo-600 font-medium truncate">{row.route || '–'}</p>
        </div>
        <div className={`shrink-0 font-semibold text-sm rounded px-1.5 py-0.5 ${
          isDaf
            ? 'text-amber-800 bg-amber-100 ring-1 ring-amber-300'
            : 'text-indigo-700'
        }`}>
          {isOff ? (
            '-'
          ) : isDaf ? (
            <FSRInfoIcon
              paymentMode={row.paymentMode}
              stops={row.stops}
              fixedPrice={fixedPrice}
              costModel={row.costModel}
              date={row.date}
            >
              {formatCurrency(total)}
            </FSRInfoIcon>
          ) : (
            formatCurrency(total)
          )}
        </div>
      </div>
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Vendor</span>
          <span className="flex items-center gap-1.5 ml-2 min-w-0">
            <span className="text-gray-700 truncate">{row.courier || '–'}</span>
            {spName !== null && (
              <ServicePartnerBadge partnerName={spName} size="xs" className="flex-shrink-0" />
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">VRN</span>
          <VrnPlate vrn={row.vrm ?? 'N/A'} size="xs" badgeVariant={badgeVariant} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Payment</span>
          <span className="text-gray-700">{paymentLabel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Rate</span>
          {isOff ? (
            <span className="text-gray-700">-</span>
          ) : (
            <div className="flex items-center gap-1">
              {!isBanded && (
                <span className="text-gray-700">
                  {row.rate ? `£${row.rate.toFixed(2)}` : '–'}
                </span>
              )}
              {isBanded && !isDaf && (
                <FSRInfoIcon
                  paymentMode={row.paymentMode}
                  stops={row.stops}
                  fixedPrice={fixedPrice}
                  costModel={row.costModel}
                  date={row.date}
                />
              )}
              {isDaf && (
                <FSRInfoIcon
                  paymentMode={row.paymentMode}
                  stops={row.stops}
                  fixedPrice={fixedPrice}
                  costModel={row.costModel}
                  date={row.date}
                />
              )}
            </div>
          )}
        </div>
        <div className={`flex justify-between ${row.isSpms === false ? 'bg-orange-100 px-1 rounded' : ''}`}>
          <span className="text-gray-500">Stops</span>
          <span className="text-gray-700 font-medium">{isOff ? '-' : (row.stops ?? '–')}</span>
        </div>
        {canMutate && onEditRow && onDeleteRow ? (
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => onEditRow(row)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
              onClick={() => onDeleteRow(row)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

