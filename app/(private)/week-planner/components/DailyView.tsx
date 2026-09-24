"use client";

import React from 'react';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { DayOffEntry } from './DayOffModal';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

type DailyViewProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
  };
  dayOffEntries?: DayOffEntry[];
  onDrop: (e: React.DragEvent, routeId: number, dateStr: string) => void;
  onEdit?: (assignment: WeekPlannerRecord) => void;
};

const DailyView: React.FC<DailyViewProps> = ({ date, data, dayOffEntries: _dayOffEntries = [], onDrop: _onDrop, onEdit }) => {
  // Filter assignments for the selected date
  const dayAssignments = data.assignments.filter((a) => a.date === date);

  return (
    <div id="daily-planner-view" className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Assignments for {date}
        </h2>
        
        {dayAssignments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No assignments for this date.</p>
        ) : (
          <div className="space-y-2">
            {dayAssignments.map((assignment) => (
              <div
                key={assignment.weekPlannerId}
                className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                onClick={() => onEdit?.(assignment)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {assignment.name || 'Unknown Vendor'}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Route: {assignment.route}
                    </div>
                    {assignment.registrationPlate && (
                      <div className="text-sm text-slate-600">
                        Vehicle: {assignment.registrationPlate}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {assignment.status || BUSINESS_RULES.WORKING_STATUS.WORKING}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyView;

