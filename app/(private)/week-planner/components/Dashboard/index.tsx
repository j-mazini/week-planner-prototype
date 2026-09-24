"use client";

import React, { useMemo } from 'react';
import { formatDate, getWeekDates } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import { 
  Calendar, 
  Users, 
  Route as RouteIcon, 
  CheckCircle, 
  AlertCircle,
  DollarSign
} from 'lucide-react';
import StatCard from './StatCard';
import DayCard from './DayCard';
import AlertCard from './AlertCard';
import { useDashboardStats } from './useDashboardStats';

type DashboardProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
};

const Dashboard: React.FC<DashboardProps> = ({ date, data }) => {
  const weekDates = useMemo(() => getWeekDates(date), [date]);
  const stats = useDashboardStats(date, data);

  return (
    <div className="w-full p-6 bg-gradient-to-br from-white/95 to-slate-50/98 rounded-xl shadow-[0_10px_40px_rgba(15,23,42,0.1),0_4px_16px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="mb-8 pb-4 border-b-2 border-slate-300/20">
        <h2 className="text-[1.75rem] font-bold text-slate-800 m-0 mb-2">Week Planner Dashboard</h2>
        <p className="text-[0.9rem] text-slate-500 m-0">
          {formatDate(weekDates[0], 'dd/mm/yyyy')} - {formatDate(weekDates[weekDates.length - 1], 'dd/mm/yyyy')}
        </p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Vendors"
          value={stats.uniqueVendors}
          subtitle={`of ${stats.totalVendors} total`}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Routes"
          value={stats.uniqueRoutes}
          subtitle={`of ${stats.totalRoutes} total`}
          icon={<RouteIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Total Cost"
          value={`£${stats.totalCost.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Assignments by Day */}
      <div className="mb-8">
        <h3 className="flex items-center gap-2 text-[1.1rem] font-bold text-slate-800 m-0 mb-4">
          <Calendar className="w-5 h-5" />
          Assignments by Day
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
          {stats.assignmentsByDay.map((day) => (
            <DayCard
              key={day.date}
              date={day.date}
              dayName={day.dayName}
              count={day.count}
              isWeekend={day.isWeekend}
            />
          ))}
        </div>
      </div>

      {/* Alerts & Warnings */}
      <div className="mb-8">
        <h3 className="flex items-center gap-2 text-[1.1rem] font-bold text-slate-800 m-0 mb-4">
          <AlertCircle className="w-5 h-5" />
          Alerts & Warnings
        </h3>
        <div className="flex flex-col gap-3">
          {stats.routesWithoutAssignments > 0 && (
            <AlertCard
              type="warning"
              message={
                <><strong>{stats.routesWithoutAssignments} routes</strong> without assignments</>
              }
            />
          )}
          {stats.vendorsWithoutAssignments > 0 && (
            <AlertCard
              type="info"
              message={
                <><strong>{stats.vendorsWithoutAssignments} vendors</strong> available without assignments</>
              }
            />
          )}
          {stats.routesWithoutAssignments === 0 && stats.vendorsWithoutAssignments === 0 && (
            <AlertCard
              type="success"
              message="All routes have assignments!"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


