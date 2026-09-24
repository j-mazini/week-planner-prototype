"use client";

import React from "react";
import type { OperationsHistoryEntry } from "../../types/operations-management";
import { OperationsReviewTable } from "./OperationsReviewTable";

type Props = {
  open: boolean;
  operationsHistory: OperationsHistoryEntry[];
  selectedHistoryIndex: number | null;
  onSelectHistoryIndex: (index: number) => void;
  onClose: () => void;
  onLoadFromDatabase: (date: string) => void;
};

export const OperationsHistoryModal = React.memo(function OperationsHistoryModal({
  open,
  operationsHistory,
  selectedHistoryIndex,
  onSelectHistoryIndex,
  onClose,
  onLoadFromDatabase,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-backdrop-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-modal-pop-in">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Previous Operations</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700" type="button">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            {operationsHistory.length === 0 ? (
              <p className="text-slate-500">No historical report saved yet.</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {operationsHistory.map((day, idx) => (
                  <li key={day.date} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-slate-900 font-medium">{day.date}</p>
                      <p className="text-slate-600 text-sm">{day.data.length} records</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                          selectedHistoryIndex === idx
                            ? "bg-slate-200 text-slate-900"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                        } border-slate-300`}
                        onClick={() => onSelectHistoryIndex(idx)}
                        type="button"
                      >
                        View
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium border bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                        onClick={() => onLoadFromDatabase(day.date)}
                        type="button"
                      >
                        Load from Database
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedHistoryIndex !== null && operationsHistory[selectedHistoryIndex] && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                Report for {operationsHistory[selectedHistoryIndex].date}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Click the date selector above to view the operations for this date in the database.
              </p>
              <OperationsReviewTable
                data={operationsHistory[selectedHistoryIndex].data}
                title={`Records for ${operationsHistory[selectedHistoryIndex].date}`}
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});


