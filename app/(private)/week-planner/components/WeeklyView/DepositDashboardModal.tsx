"use client";

import React, { useMemo } from 'react';
import type { DepositWithRoutesDTO, Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';

interface DepositDashboardModalProps {
  show: boolean;
  deposit: DepositWithRoutesDTO | null;
  assignments: WeekPlannerRecord[];
  vendors: Vendor[];
  onClose: () => void;
}

type ParsedAssignment = {
  routeId?: number;
  userId?: number;
  date?: string;
};

// Extracts routeId, userId, date defensively from different payload shapes
const parseAssignment = (assignment: WeekPlannerRecord): ParsedAssignment => {
  const raw = assignment.raw as Record<string, unknown> | undefined;
  const result: ParsedAssignment = {};

  if (raw) {
    // route id
    if (typeof raw.routeId === 'number') result.routeId = raw.routeId;
    if (!result.routeId && typeof raw.routeDefaultId === 'number') result.routeId = raw.routeDefaultId;
    if (!result.routeId && raw.route && typeof raw.route === 'object') {
      const routeObj = raw.route as Record<string, unknown>;
      if (typeof routeObj.routeId === 'number') result.routeId = routeObj.routeId;
      if (!result.routeId && typeof routeObj.routeDefaultId === 'number') result.routeId = routeObj.routeDefaultId;
    }

    // vendor id
    if (typeof raw.userId === 'number') result.userId = raw.userId;
    if (!result.userId && raw.vendor && typeof raw.vendor === 'object') {
      const vendorObj = raw.vendor as Record<string, unknown>;
      if (typeof vendorObj.userId === 'number') result.userId = vendorObj.userId;
      if (!result.userId && typeof vendorObj.id === 'number') result.userId = vendorObj.id;
    }

    // date
    if (typeof raw.date === 'string') result.date = raw.date;
    if (!result.date && typeof raw.operation_date === 'string') result.date = raw.operation_date;
    if (!result.date && typeof raw.assignment_date === 'string') result.date = raw.assignment_date;
  }

  // fallback to WeekPlannerRecord fields if present
  const a = assignment as WeekPlannerRecord & { routeId?: number; userId?: number; date?: string };
  if (!result.routeId && a.routeId) result.routeId = Number(a.routeId);
  if (!result.userId && a.userId) result.userId = Number(a.userId);
  if (!result.date && a.date) result.date = String(a.date);

  return result;
};

const StatCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({ label, value, accent }) => (
  <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
    <p className="text-xs uppercase tracking-[0.08em] text-slate-500 mb-1">{label}</p>
    <p className={`text-xl font-semibold ${accent ?? 'text-slate-900'}`}>{value}</p>
  </div>
);

type VendorWithId = Vendor & { id?: number; vendorName?: string; name?: string; first_name?: string; lastName?: string };

const DepositDashboardModal: React.FC<DepositDashboardModalProps> = ({ show, deposit, assignments, vendors, onClose }) => {
  const stats = useMemo(() => {
    if (!deposit) {
      return {
        totalRoutes: 0,
        routesWithAssignments: 0,
        flexRoutes: 0,
        adHocRoutes: 0,
        uniqueVendors: 0,
        daysWithOps: 0,
      };
    }

    const routeIds = new Set(deposit.routes.map(r => r.routeId).filter(Boolean) as number[]);
    const parsed = assignments
      .map(parseAssignment)
      .filter(p => p.routeId && routeIds.has(p.routeId!));

    const routesWithAssignments = new Set(parsed.map(p => p.routeId).filter(Boolean) as number[]);
    const userIds = new Set(parsed.map(p => p.userId).filter(Boolean) as number[]);
    const daysWithOps = new Set(parsed.map(p => p.date).filter(Boolean) as string[]);

    const flexRoutes = deposit.routes.filter(r => isFlexRoute(r as unknown as Route)).length;
    const adHocRoutes = deposit.routes.filter(r => r.routeName?.toLowerCase().includes('adhoc') || r.routeName?.toLowerCase().includes('ad-hoc')).length;

    return {
      totalRoutes: deposit.routes.length,
      routesWithAssignments: routesWithAssignments.size,
      flexRoutes,
      adHocRoutes,
      uniqueVendors: userIds.size,
      daysWithOps: daysWithOps.size,
    };
  }, [deposit, assignments]);

  const vendorNames = useMemo(() => {
    if (!vendors || vendors.length === 0) return [];
    return vendors
      .filter((d): d is VendorWithId => !!(d && (d.userId ?? (d as VendorWithId).id)))
      .map(d => ({
        id: d.userId ?? d.id,
        name: d.vendorName || d.name || `${d.first_name ?? ''} ${d.lastName ?? ''}`.trim(),
      }))
      .filter(d => d.name?.trim());
  }, [vendors]);

  if (!show || !deposit) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content shadow-xl">
          <div className="modal-header">
            <div>
              <h5 className="modal-title">Performance - {deposit.depositName || 'Deposit'}</h5>
              <p className="mb-0 text-muted text-sm">Overview of routes, windows (operational days), and associated vendors.</p>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <StatCard label="Total routes" value={stats.totalRoutes} />
              <StatCard label="Routes with roster" value={stats.routesWithAssignments} accent="text-emerald-600" />
              <StatCard label="Flex routes" value={stats.flexRoutes} />
              <StatCard label="AdHoc services" value={stats.adHocRoutes} />
              <StatCard label="Operational days" value={stats.daysWithOps} />
              <StatCard label="Unique vendors" value={stats.uniqueVendors} />
            </div>

            <div className="mt-3">
              <h6 className="mb-2 text-sm text-slate-700 font-semibold">Associated vendors</h6>
              <div className="flex flex-wrap gap-2">
                {vendorNames.length === 0 ? (
                  <span className="text-sm text-muted">No vendors associated in this deposit&apos;s schedules.</span>
                ) : (
                  vendorNames.map((d) => (
                    <span key={d.id} className="badge text-bg-light border border-secondary-subtle px-3 py-2">
                      {d.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default DepositDashboardModal;




