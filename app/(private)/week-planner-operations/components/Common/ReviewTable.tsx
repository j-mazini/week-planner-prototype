"use client";

import React from 'react';
import type { WeekPlannerRecord, WeekPlannerField } from '../../contexts/PlannerContext';

const TABLE_HEADERS = [
  { key: "date" as WeekPlannerField, label: "Date" },
  { key: "name" as WeekPlannerField, label: "Name" },
  { key: "route" as WeekPlannerField, label: "Route" },
  { key: "costModel" as WeekPlannerField, label: "Cost Model" },
  { key: "rate" as WeekPlannerField, label: "Rate" },
  { key: "routeCost" as WeekPlannerField, label: "Route Cost" },
  { key: "routeSort" as WeekPlannerField, label: "Sort" },
  { key: "adhocSort" as WeekPlannerField, label: "AD-HOC Sort" },
  { key: "extras" as WeekPlannerField, label: "Extras" },
  { key: "notes" as WeekPlannerField, label: "Notes" },
  { key: "registrationPlate" as WeekPlannerField, label: "Registration Plate" },
  { key: "status" as WeekPlannerField, label: "Status" },
  { key: "isDayOff" as WeekPlannerField, label: "Day Off" },
] as const;

type ReviewTableProps = {
  data: WeekPlannerRecord[];
  title: string;
};

export const ReviewTable: React.FC<ReviewTableProps> = ({ data, title }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      {title} ({data.length})
    </h3>
    {data.length === 0 ? (
      <p className="text-slate-500">No records.</p>
    ) : (
      <div className="max-h-[60vh] overflow-auto border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/80 border-b border-slate-200/60 sticky top-0 z-10">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header.key}
                  className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {data.map((item, index) => (
              <tr 
                key={`${item.weekPlannerId}-${index}`} 
                className={`transition-colors duration-150 ease-out ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                } hover:!bg-slate-200`}
              >
                {TABLE_HEADERS.map((header) => (
                  <td
                    key={header.key}
                    className="px-5 py-3.5 text-sm font-medium text-slate-700 whitespace-nowrap"
                  >
                    {item[header.key] ? item[header.key] : <span className="text-slate-400">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

