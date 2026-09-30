import { describe, expect, it } from 'vitest';
import { mockPayload } from '../mock-api';
import { createPageFixtures } from './page-fixtures';
import type { DailyOverviewListResponse, OverviewDTO } from '../vendor-performance-api';

describe('demo page data', () => {
  it('keeps personal overviews scoped to the requested account', () => {
    const rows = mockPayload('/bff/daily-overview/201/2026/9/24') as { userId: number }[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.userId === 201)).toBe(true);
    expect(mockPayload('/bff/day-overview/999999/2026-09-24')).toEqual([]);
    expect(mockPayload('/bff/daily-overview/999999/2026/9/24')).toEqual([]);
    expect(mockPayload('/bff/daily-overview/list/999999/9/2026')).toEqual({ currentMonth: null, dailyEarnings: [] });
  });
  it('links all operations to existing drivers, vehicles, routes and depots', () => {
    const d = createPageFixtures('2026-09-24');
    for (const operation of d.operations) {
      expect(d.vendors.some(v => v.userId === operation.userId)).toBe(true);
      expect(d.vehicles.some(v => v.vehicleId === operation.vehicleId)).toBe(true);
      expect(d.routes.some(r => r.routeId === operation.routeId)).toBe(true);
      expect(d.deposits.some(dp => dp.depositId === operation.depositId)).toBe(true);
    }
    for (const r of d.reports) expect(r.total).toBe(r.rate + r.extra + r.routeSort - r.dailyServiceCharge);
  });
  it('supports the pagination parameters used by vehicle screens without repeated pages', () => {
    const first = mockPayload('/bff/vehicles?currentPage=1&totalItensPerPage=5') as { data: { vehicleId: number }[]; pagination: { totalItems: number; totalPages: number } };
    const second = mockPayload('/bff/vehicles?currentPage=2&totalItensPerPage=5') as typeof first;
    expect(first.data).toHaveLength(5);
    expect(first.pagination).toMatchObject({ totalItems: 12, totalPages: 3 });
    expect(new Set([...first.data, ...second.data].map(v => v.vehicleId)).size).toBe(10);
  });
  it('filters before paginating and can show a real empty result', () => {
    expect(mockPayload('/bff/vehicles?search=no-match-qa&currentPage=1&totalItensPerPage=5')).toMatchObject({ data: [], pagination: { totalItems: 0 } });
    const d = mockPayload('/bff/operations/paginated?depositId=1') as { data: { depositId: number }[] };
    expect(d.data).toHaveLength(4);
    expect(d.data.every(r => r.depositId === 1)).toBe(true);
  });
  it('follows the requested date and preserves nested performance fields', () => {
    const rows = mockPayload('/bff/day-overview/101/2027-02-15?metrics=performance') as OverviewDTO[];
    expect(rows[0].operationDate).toBe('2027-02-15');
    expect(rows[0].deliveryDetails.paidStops.ok).toBeGreaterThan(0);
    expect(rows[0].dailyMetrics.totalStops).toBeGreaterThan(0);
    const month = mockPayload('/bff/daily-overview/list/101/2/2027') as DailyOverviewListResponse;
    expect(month.dailyEarnings).toHaveLength(20);
    expect(month.dailyEarnings.every(day => day.date.startsWith('2027-02'))).toBe(true);
    expect(month.currentMonth.totalAmount).toBe(month.dailyEarnings.reduce((sum, day) => sum + Number(day.amount), 0));
  });
  it('preserves depot trees and numeric subresource paths', () => {
    const depots = mockPayload('/bff/deposits/with-loops-and-routes') as { loops: { routes: unknown[] }[] }[];
    expect(depots[0].loops[0].routes.length).toBeGreaterThan(0);
    const types = mockPayload('/bff/service-types/with-deposits-and-routes') as { deposits: { routes: unknown[] }[] }[];
    expect(types[0].deposits[0].routes.length).toBeGreaterThan(0);
    expect(mockPayload('/bff/service-partners/without-invoice/09/2026')).toHaveLength(2);
    expect(mockPayload('/bff/vendors/by-deposit/1')).toHaveLength(4);
  });
  it('uses the deduction screen contract and selected month', () => {
    const rows = mockPayload('/bff/deductions/101/02/2027') as { date: string; amount: string; deductionType: string }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: '2027-02-01', amount: '25', deductionType: 'OTHER' });
  });
  it('keeps invoice details consistent with the list and user scope', () => {
    const invoices = mockPayload('/bff/invoices/user/101/last-12-months') as { invoiceId: number; totalPayment: number; userId: number }[];
    expect(invoices).toHaveLength(1);
    const detail = mockPayload(`/bff/invoices/${invoices[0].invoiceId}/details`) as { total: string; details: { total: number }[]; vendor: { vendorId: number } };
    expect(Number(detail.total)).toBe(invoices[0].totalPayment);
    expect(detail.details.reduce((sum, row) => sum + row.total, 0)).toBe(invoices[0].totalPayment);
    expect(detail.vendor.vendorId).toBe(101);
  });
  it('preserves the user envelope expected by invoice dialogs', () => {
    const result = mockPayload('/bff/users/by-company/1/without-invoice?month=9&year=2026&servicePartnerId=501') as { users: { userName: string; userLastName: string; servicePartnerId: number }[] };
    expect(result.users).toHaveLength(6);
    expect(result.users[0].userName).toBe('João');
    expect(result.users.every(user => user.servicePartnerId === 501)).toBe(true);
  });
  it.each(['/bff/vendor', '/bff/routes', '/bff/deposits', '/bff/invoices', '/bff/service-partner-invoices', '/bff/adhoc-works', '/bff/reports', '/bff/vendor-requests', '/bff/week-planners', '/bff/service-types'])('populates %s', path => {
    const rows = mockPayload(path);
    expect(Array.isArray(rows)).toBe(true);
    expect((rows as unknown[]).length).toBeGreaterThan(0);
  });
});
