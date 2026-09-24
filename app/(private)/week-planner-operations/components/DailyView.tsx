"use client";

import React from 'react';
import type { Route } from '@/lib/api/routes';
import type { DayOffEntry } from './DayOffModal';
import { BUSINESS_RULES } from '@/src/constants/businessRules';
import type { FrontendOperationRecord } from '../types/operations-management';

/**
 * DailyView — exibe as operações de um dia específico.
 * Usa FrontendOperationRecord (dado por daily-operations-management)
 * em vez de WeekPlannerRecord, pois somente o endpoint de operações
 * carrega campos como Payment Mode (costModel).
 */

type DailyViewProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: FrontendOperationRecord[];
    routes: Route[];
  };
  dayOffEntries?: DayOffEntry[];
  onDrop: (e: React.DragEvent, routeId: number, dateStr: string) => void;
  onEdit?: (assignment: FrontendOperationRecord) => void;
};

const DailyView: React.FC<DailyViewProps> = ({ date, data, dayOffEntries: _dayOffEntries = [], onDrop: _onDrop, onEdit }) => {
  // Filter assignments for the selected date
  const dayAssignments = data.assignments.filter((a) => a.Date === date);

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
                key={assignment.weekPlannerId ?? `${assignment.Date}-${assignment.Route}-${assignment.Name}`}
                className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                onClick={() => onEdit?.(assignment)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {assignment.Name || 'Unknown Vendor'}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Route: {assignment.Route}
                    </div>
                    {assignment.Vehicle && assignment.Vehicle !== 'NOVEHICLE' && (
                      <div className="text-sm text-slate-600">
                        Vehicle: {assignment.Vehicle}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {assignment.Status || BUSINESS_RULES.WORKING_STATUS.WORKING}
                    </div>
                    {assignment['Payment Mode'] && (
                      <div className="text-xs text-slate-500 mt-1">
                        {assignment['Payment Mode']}
                      </div>
                    )}
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

