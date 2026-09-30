import { describe, expect, it, vi } from 'vitest';
import { assignmentsToCSV, assignmentsToTSV } from './exportUtils';
import { getHoldVendors, getOffVendors } from './renderUtils';
import { getRoutesByDepot, getRouteId, getRouteName } from './routeDistributionUtils';
import { createFlexRouteFromTemplate } from './flexRouteUtils';
import { handleMoveAssignment } from './dragDropHandlers';
import type { Assignment, Vendor } from '../types/planner';

const assignment: Assignment = {
  id: 1, date: '2026-09-29', userId: 10, userName: 'Ana', routeId: 20, routeName: 'DY1 Core',
};

describe('planner data compatibility', () => {
  it('exports the vendor name used by assignments', () => {
    expect(assignmentsToCSV([assignment])).toContain('"Ana"');
    expect(assignmentsToTSV([assignment])).toContain('\tAna\t');
  });

  it('separates off, available, assigned and dated leave vendors', () => {
    const vendors: Vendor[] = [
      { id: 10, name: 'Ana', status: 'available' },
      { id: 11, name: 'Bruno', status: 'off' },
      { id: 12, name: 'Carla', status: 'hold' },
      { id: 13, name: 'Davi', status: 'available' },
    ];
    const leave = [{ userId: 13, userName: 'Davi', date: '2026-09-28', endDate: '2026-09-30' }];
    expect(getOffVendors(assignment.date, vendors, leave).map(v => v.id)).toEqual([11, 13]);
    expect(getHoldVendors(assignment.date, vendors, [assignment], leave).map(v => v.id)).toEqual([12]);
  });

  it('groups both API routes and generated flex routes', () => {
    const core = { routeId: 20, routeName: 'DY1 Core' };
    const flex = createFlexRouteFromTemplate({ id: 21, name: 'DY1 Flex', loop: 'dy1', depot: 'DCY' });
    expect(getRouteId(core)).toBe(20);
    expect(getRouteName(flex)).toBe('DY1 Flex');
    expect(getRoutesByDepot([core, flex], [], [], 'dcy')).toHaveLength(2);
  });

  it('resolves vendor names before confirming assignment substitution', async () => {
    const target = { ...assignment, id: 2, userId: 11, userName: 'Bruno', routeId: 30 };
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const update = vi.fn().mockResolvedValue(assignment);
    const remove = vi.fn().mockResolvedValue(undefined);
    const refresh = vi.fn().mockResolvedValue(undefined);
    await handleMoveAssignment(1, 30, assignment.date, [assignment, target], [
      { id: 10, name: 'Ana' }, { id: 11, name: 'Bruno' },
    ], [], update, remove, refresh);
    expect(confirm).toHaveBeenCalledWith('Replace Bruno with Ana?');
    expect(remove).toHaveBeenCalledWith(2);
    expect(update).toHaveBeenCalledWith(1, { routeId: 30, date: assignment.date });
    expect(refresh).toHaveBeenCalledOnce();
    confirm.mockRestore();
  });
});
