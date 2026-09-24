import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Band {
  costModelId: number;
  minStops: number | null;
  maxStops: number | null;
  fixedPrice: number | null;
  pricePerStop: number | null;
  costModelName: string;
  validityStartDate?: string | null;
  validityEndDate?: string | null;
}

interface FSRInfoIconProps {
  paymentMode: string;
  stops: number | null;
  fixedPrice: number | null;
  costModel?: Band[];
  /** Operation date (YYYY-MM-DD) used to filter bands by validity period. */
  date?: string;
  /**
   * Custom trigger content instead of the default Info icon.
   * When guards fail, children are rendered without a tooltip (plain fallback).
   * Without children and guards failing, nothing is rendered.
   */
  children?: React.ReactNode;
}

const SUPPORTED_PAYMENT_MODES = new Set(['FSR', 'VSR', '1', 'SP_VSR']);
const COST_MODEL_ID: Record<string, number> = { FSR: 3, VSR: 4, '1': 1, SP_VSR: 12 };

function isBandValidOnDate(band: Band, operationDate: string): boolean {
  if (!band.validityStartDate) return true;
  const op = new Date(operationDate);
  const start = new Date(band.validityStartDate);
  if (op < start) return false;
  if (band.validityEndDate) {
    const end = new Date(band.validityEndDate);
    if (op > end) return false;
  }
  return true;
}

function deduplicateBands(bands: Band[]): Band[] {
  const seen = new Set<string>();
  return bands.filter(band => {
    const key = `${band.minStops ?? ''}|${band.maxStops ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const FSRInfoIcon: React.FC<FSRInfoIconProps> = ({
  paymentMode, stops, fixedPrice, costModel, date, children,
}) => {
  if (!SUPPORTED_PAYMENT_MODES.has(paymentMode)) {
    return children ? <>{children}</> : null;
  }

  const isFSR = paymentMode === 'FSR';
  const isVSR = paymentMode === 'VSR';
  const isDAF = paymentMode === '1';
  const isSP_VSR = paymentMode === 'SP_VSR';

  const costModelId = COST_MODEL_ID[paymentMode];
  const allBands = costModel?.filter(cm => cm.costModelId === costModelId) ?? [];
  const filtered = date ? allBands.filter(b => isBandValidOnDate(b, date)) : allBands;
  const bands = deduplicateBands(filtered);

  const hasBands = bands.length > 0;
  const hasValidFixedPrice = fixedPrice != null && Number.isFinite(fixedPrice) && fixedPrice > 0;
  const hasValidStops = stops != null && Number.isFinite(stops);

  // FSR: calculation only (stops × fixedPrice). VSR/DAF: prefer bands; fall back to calculation.
  const canShowBands = !isFSR && hasBands;
  const canShowCalculation = hasValidStops && hasValidFixedPrice;

  if (!canShowBands && !canShowCalculation) {
    return children ? <>{children}</> : null;
  }

  const totalValue = hasValidStops && hasValidFixedPrice ? stops! * fixedPrice! : null;

  const triggerNode = children ? (
    <span
      tabIndex={0}
      role="button"
      aria-label="Show cost model band details"
      className="cursor-help outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-500 rounded"
    >
      {children}
    </span>
  ) : (
    <span
      tabIndex={0}
      role="button"
      aria-label="Show cost model band details"
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-[background-color,transform,box-shadow] duration-200 hover:bg-blue-200 hover:scale-110 hover:shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
    >
      <Info className="w-3.5 h-3.5" />
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{triggerNode}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-slate-900 text-white max-w-[320px] whitespace-normal break-words min-w-[220px]"
      >
        <div className="text-center">
          {isFSR && canShowCalculation && (
            <>
              <div className="font-semibold mb-1">Fixed Price Calculation</div>
              <div className="text-xs">
                {stops} stops × £{fixedPrice!.toFixed(2)} = £{totalValue!.toFixed(2)}
              </div>
            </>
          )}

          {isVSR && hasBands && (
            <>
              <div className="font-semibold mb-2">Variable Rate Bands</div>
              <div className="space-y-1">
                {bands.map((band, idx) => (
                  <div key={idx} className="text-xs font-medium">
                    {band.minStops}–{band.maxStops} stops: £{(band.pricePerStop ?? 0).toFixed(2)}/stop
                  </div>
                ))}
              </div>
            </>
          )}
          {isVSR && !hasBands && canShowCalculation && (
            <>
              <div className="font-semibold mb-1">Variable Rate Band</div>
              <div className="text-xs">
                {stops} stops × £{fixedPrice!.toFixed(2)} = £{totalValue!.toFixed(2)}
              </div>
            </>
          )}

          {isDAF && hasBands && (
            <>
              <div className="font-semibold mb-2">DAF Bands</div>
              <div className="space-y-1">
                {bands.map((band, idx) => {
                  const isFlat = band.fixedPrice != null && band.fixedPrice > 0;
                  return (
                    <div key={idx} className="text-xs font-medium">
                      {band.minStops}–{band.maxStops} stops:{' '}
                      {isFlat
                        ? `£${band.fixedPrice!.toFixed(2)} flat`
                        : `£${(band.pricePerStop ?? 0).toFixed(2)}/stop`}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {isDAF && !hasBands && canShowCalculation && (
            <>
              <div className="font-semibold mb-1">DAF Band</div>
              <div className="text-xs">
                {stops} stops × £{fixedPrice!.toFixed(2)} = £{totalValue!.toFixed(2)}
              </div>
            </>
          )}

          {isSP_VSR && hasBands && (
            <>
              <div className="font-semibold mb-2">Service Partner Variable Rate Bands</div>
              <div className="space-y-1">
                {bands.map((band, idx) => (
                  <div key={idx} className="text-xs font-medium">
                    {band.minStops}–{band.maxStops} stops: £{(band.pricePerStop ?? 0).toFixed(2)}/stop
                  </div>
                ))}
              </div>
            </>
          )}
          {isSP_VSR && !hasBands && canShowCalculation && (
            <>
              <div className="font-semibold mb-1">Service Partner Variable Rate</div>
              <div className="text-xs">
                {stops} stops × £{fixedPrice!.toFixed(2)} = £{totalValue!.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
