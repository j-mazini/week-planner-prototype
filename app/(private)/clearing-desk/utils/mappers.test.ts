import { describe, expect, it } from 'vitest';
import { mapPayee, mapBoard, formatMoney } from './mappers';

const dto = {
  id: 'DY1B', name: 'Diego Ferreira', vehicle: 'YF25 OZL',
  payment_mode: 'DAF', payment: '£160', sort: 'YES',
  sort_value: '0,00', adhoc_service: '-', per_stop: 2,
};

describe('mapPayee', () => {
  it('reads a plain amount', () => {
    expect(mapPayee(dto).payment).toEqual({ amount: 160, flat: false });
  });

  it('reads a flat amount and keeps the flag', () => {
    expect(mapPayee({ ...dto, payment: '£145.00 flat' }).payment)
      .toEqual({ amount: 145, flat: true });
  });

  it('treats the em dash as an absent amount', () => {
    expect(mapPayee({ ...dto, payment: '—' }).payment)
      .toEqual({ amount: null, flat: false });
  });

  it('accepts both decimal separators', () => {
    expect(mapPayee({ ...dto, sort_value: '0,00' }).sortValue).toBe(0);
    expect(mapPayee({ ...dto, sort_value: '20.00' }).sortValue).toBe(20);
  });

  it('turns the NOVEHICLE placeholder into null', () => {
    expect(mapPayee({ ...dto, vehicle: 'NOVEHICLE' }).vehicle).toBeNull();
  });

  it('turns the hyphen adhoc placeholder into null', () => {
    expect(mapPayee({ ...dto, adhoc_service: '-' }).adhoc).toBeNull();
    expect(mapPayee({ ...dto, adhoc_service: 'Extra Belt Sort' }).adhoc)
      .toBe('Extra Belt Sort');
  });

  it('reads sort as a boolean', () => {
    expect(mapPayee(dto).sort).toBe(true);
    expect(mapPayee({ ...dto, sort: 'NO' }).sort).toBe(false);
  });

  it('handles thousands separators in payment amounts', () => {
    expect(mapPayee({ ...dto, payment: '£1,600.00' }).payment)
      .toEqual({ amount: 1600, flat: false });
  });

  it('treats a lone comma followed by three digits as a thousands separator', () => {
    expect(mapPayee({ ...dto, payment: '£1,600' }).payment)
      .toEqual({ amount: 1600, flat: false });
  });

  it('treats a lone comma followed by two digits as a decimal separator', () => {
    expect(mapPayee({ ...dto, sort_value: '0,00' }).sortValue).toBe(0);
  });

  it('handles negative payment amounts', () => {
    expect(mapPayee({ ...dto, payment: '-£20.00' }).payment)
      .toEqual({ amount: -20, flat: false });
  });

  it('returns null for empty payment strings', () => {
    expect(mapPayee({ ...dto, payment: '' }).payment)
      .toEqual({ amount: null, flat: false });
  });

  it('returns null for malformed payment strings', () => {
    expect(mapPayee({ ...dto, payment: '£1.2.3' }).payment)
      .toEqual({ amount: null, flat: false });
  });

  it('handles thousands separators in sort value', () => {
    expect(mapPayee({ ...dto, sort_value: '1,600.00' }).sortValue).toBe(1600);
  });

  it('passes an unfamiliar payment mode through untouched', () => {
    // The mode is a cost model's name now, and that catalogue is data. Rejecting
    // an unknown one here would break the page on a model the backend added.
    expect(mapPayee({ ...dto, payment_mode: 'NEW_MODEL' }).mode).toBe('NEW_MODEL');
  });
});

describe('formatMoney', () => {
  it('renders an amount with two decimals', () => {
    expect(formatMoney(160, false)).toBe('£160.00');
  });

  it('appends the flat suffix', () => {
    expect(formatMoney(145, true)).toBe('£145.00 flat');
  });

  it('renders an absent amount as an em dash', () => {
    expect(formatMoney(null, false)).toBe('—');
  });
});

describe('mapBoard', () => {
  it('maps every payee and carries the route summary', () => {
    const board = mapBoard({
      depot: 'DEPOT_LCY',
      route_summary: { postcodes: ['ME1', 'ME2'], stops: 15, pre_12: 2 },
      payees: [dto],
      cleared: [],
    });
    expect(board.depot).toBe('DEPOT_LCY');
    expect(board.routeSummary).toEqual({ postcodes: ['ME1', 'ME2'], stops: 15, pre12: 2 });
    expect(board.payees).toHaveLength(1);
    expect(board.payees[0].name).toBe('Diego Ferreira');
  });
});
