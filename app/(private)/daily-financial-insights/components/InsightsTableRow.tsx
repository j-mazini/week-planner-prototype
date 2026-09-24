import React, { useMemo } from 'react';
import { InsightRow } from '../types';
import { formatCurrency, formatDateForDisplay, calculateRow, calculateTotalPaidStops, isFlexRoute, getCostModelIdFromPaymentMode, canEditOrDeleteOperationRow, PAYMENT_MODE, isBandedPaymentMode, isDafPaymentMode, getFixedPriceByMode, isOffPaymentMode } from '../utils';
import { NoteIcon } from './NoteIcon';
import { FSRInfoIcon } from './FSRInfoIcon';
import { CostModel } from '@/lib/cost-models';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import VrnPlate from '@/components/vrn-plate';
import ServicePartnerBadge from '@/components/service-partner-badge';
import { useServicePartnerNameByUserId } from '@/hooks/useServicePartnerNameByUserId';
import { Pencil, Trash2 } from 'lucide-react';

interface InsightsTableRowProps {
  row: InsightRow;
  index: number;
  costModels: CostModel[];
  getVrnBadgeVariant?: (vrn?: string | null) => 'green' | 'blue';
  onEditRow?: (row: InsightRow) => void;
  onDeleteRow?: (row: InsightRow) => void;
}

export const InsightsTableRow: React.FC<InsightsTableRowProps> = React.memo(({
  row,
  index,
  costModels,
  getVrnBadgeVariant,
  onEditRow,
  onDeleteRow,
}) => {
  const servicePartnerMap = useServicePartnerNameByUserId();
  const spName = row.userId ? servicePartnerMap.get(Number(row.userId)) ?? null : null;
  const canMutate = canEditOrDeleteOperationRow(row);
  const { total, avgPerStop } = calculateRow(row);
  const formattedDate = formatDateForDisplay(row.date);
  const totalPaidStops = calculateTotalPaidStops(row);
  const badgeVariant = getVrnBadgeVariant ? getVrnBadgeVariant(row.vrm) : 'blue';

  // Mapear paymentMode para costModelName (cost model 7 = "Hourly Rate")
  const paymentModeDisplay = useMemo(() => {
    const rawPaymentMode = String(row.paymentMode ?? '').trim();
    const costModelId = getCostModelIdFromPaymentMode(rawPaymentMode);
    const costModel = costModels.find(cm => cm.costModelId === costModelId);

    if (costModel?.name) return costModel.name;

    switch (costModelId) {
      case BUSINESS_RULES.COST_MODEL.DAF:
        return 'DAF';
      case BUSINESS_RULES.COST_MODEL.DR:
        return 'DR';
      case BUSINESS_RULES.COST_MODEL.FSR:
        return 'FSR';
      case BUSINESS_RULES.COST_MODEL.VSR:
        return 'VSR';
      case BUSINESS_RULES.COST_MODEL.HOURLY_RATE:
        return 'Hourly Rate';
      case BUSINESS_RULES.COST_MODEL.OFF:
        return 'OFF';
      default:
        return rawPaymentMode || '-';
    }
  }, [row.paymentMode, costModels]);

  const isDaf = isDafPaymentMode(row.paymentMode);
  const isBanded = isBandedPaymentMode(row.paymentMode);
  const fixedPrice = getFixedPriceByMode(row.costModel, row.paymentMode);
  const isOff = isOffPaymentMode(row.paymentMode);

  const getRateDisplay = () => {
    // VSR e FSR: mostra '-' (o ícone de bands será exibido via FSRInfoIcon)
    // SP_VSR: também mostra '-' (o ícone de bands será exibido via FSRInfoIcon)
    if (row.paymentMode === PAYMENT_MODE.VSR || row.paymentMode === PAYMENT_MODE.FSR || row.paymentMode === PAYMENT_MODE.SP_VSR) {
      return '-';
    }
    if (row.paymentMode === PAYMENT_MODE.DR || isDaf) {
      return formatCurrency(row.rate || 0);
    }
    return `£${(row.rate || 0).toFixed(2)}/stop`;
  };

  return (
    <tr
      key={`${row.date}-${row.vrm}-${row.courier}-${row.route}-${index}`}
      className={`transition-colors duration-150 ease-out border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
        } hover:bg-indigo-50/30`}
    >
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
        {formattedDate}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[120px]">
        <div className="flex items-center justify-center gap-2">
          <VrnPlate vrn={row.vrm || 'N/A'} size="sm" badgeVariant={badgeVariant} />
        </div>
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-normal break-words">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>{row.courier}</span>
          {spName !== null && (
            <ServicePartnerBadge partnerName={spName} size="xs" />
          )}
        </div>
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
        <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 no-underline font-medium hover:text-blue-700 transition-colors">
          {isFlexRoute(row.route) && !row.route.trim().toUpperCase().startsWith('FLEX')
            ? `Flex ${row.route}`
            : row.route}
        </a>
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[100px]">
        {paymentModeDisplay}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[90px]">
        {isOff ? (
          <span>-</span>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            {!isBanded && (
              <span>{getRateDisplay()}</span>
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
      </td>
      <td className={`py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[90px] ${row.isSpms === false ? 'bg-orange-100' : ''}`}>
        {isOff ? '-' : (
          <a href="#" className="text-blue-600 no-underline font-medium hover:text-blue-700 transition-colors">
            {row.stops}
          </a>
        )}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[120px]">
        {isOff ? '-' : totalPaidStops.toFixed(2)}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[85px]">
        {isOff || !row.sort ? '-' : formatCurrency(row.sort)}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[90px]">
        {isOff || !row.adhoc ? '-' : formatCurrency(row.adhoc)}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
        {isOff || row.paymentMode === '7' ? '-' : (row.extras ? formatCurrency(row.extras) : '-')}
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle text-center overflow-visible relative">
        {isOff ? '-' : <NoteIcon note={row.notes} />}
      </td>
      <td className="py-2.5 px-2 align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap font-semibold pl-[14px] text-[0.95rem] min-w-[100px] transition-all text-indigo-700 bg-indigo-50/50 border-l-2 border-l-indigo-400 hover:bg-indigo-50">
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
      </td>
      <td className="py-2.5 px-2 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap min-w-[120px]">
        {isOff ? '-' : formatCurrency(avgPerStop)}
      </td>
      <td className="py-2.5 px-1 text-[0.85rem] align-middle text-center whitespace-nowrap">
        {canMutate && onEditRow && onDeleteRow ? (
          <div className="flex items-center justify-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
              aria-label="Edit operation"
              onClick={() => onEditRow(row)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete operation"
              onClick={() => onDeleteRow(row)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
});

InsightsTableRow.displayName = 'InsightsTableRow';


