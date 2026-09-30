import type { ClearingDeskBoardDTO } from '@/app/(private)/clearing-desk/utils/mappers';

/**
 * The six payees drawn in the Clearing Desk frames. Terry and Codrin have no
 * financial detail in any frame, so their payment is the design's em dash.
 * A fresh deep copy is returned per call so callers can mutate freely.
 */
export function clearingDeskFixture(): ClearingDeskBoardDTO {
  return structuredClone({
    depot: 'DEPOT_LCY',
    route_summary: { postcodes: ['ME1', 'ME2'], stops: 15, pre_12: 2 },
    cleared: [],
    payees: [
      { id: 'DY1B', name: 'Diego Ferreira', vehicle: 'YF25 OZL', payment_mode: 'DAF', payment: '£160', sort: 'YES', sort_value: '0,00', adhoc_service: '-', per_stop: 2 },
      { id: 'MD7E', name: 'Carlos Silva', vehicle: 'MA26 XWK', payment_mode: 'DAF', payment: '£160.00', sort: 'YES', sort_value: '0,00', adhoc_service: '-', per_stop: 2 },
      { id: 'DHOC', name: 'Lee Roberts', vehicle: 'NOVEHICLE', payment_mode: 'DR', payment: '£145.00 flat', sort: 'YES', sort_value: '0,00', adhoc_service: 'Extra Belt Sort', per_stop: 2 },
      { id: 'DY1A', name: 'Aliu Balde', vehicle: 'LV21 UFC', payment_mode: 'VSR', payment: '£122.50 flat', sort: 'YES', sort_value: '20.00', adhoc_service: 'Extra Belt Sort', per_stop: 1.75 },
      { id: 'LL2A', name: 'Terry Roberts', vehicle: 'CK26 KWJ', payment_mode: 'SP_VSR', payment: '—', sort: 'YES', sort_value: '0.00', adhoc_service: '-', per_stop: 2 },
      { id: 'LL2X', name: 'Codrin Stephan', vehicle: 'CE25 PYX', payment_mode: 'VSR', payment: '—', sort: 'YES', sort_value: '0.00', adhoc_service: '-', per_stop: 2 },
    ],
  });
}
