"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { DepositWithRoutesDTO, Route } from "@/lib/api/routes";
import type { Vendor } from "@/lib/vendors";
import type { WeekPlannerRecord } from "../../contexts/PlannerContext";
import type { DragItem } from "../../hooks/useDragAndDrop";
import { getWeekDates } from "../../utils/dateUtils";
import WeekGrid from "./WeekGrid";
import { BAOPAddEntryModal, BAOPAddLineModal, type BAOPLineDefinition, useBaopRoutes } from "./BAOPLineAndEntryModals";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type BAOPServicesSectionProps = {
  deposit: DepositWithRoutesDTO;
  date: string;
  showWeekends: boolean;
  assignmentsByDate: Map<string, WeekPlannerRecord[]>;
  vendors: Vendor[];
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onCreateAdHocService?: (
    userId: number,
    adhocServiceId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
  ) => Promise<void>;
  onCreateBaopService?: (
    userId: number,
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
  ) => Promise<void>;
  onAssignmentDelete?: (assignment: WeekPlannerRecord, options?: { forceDelete?: boolean }) => Promise<void>;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
};

function isBaopServiceForDeposit(record: WeekPlannerRecord, deposit: DepositWithRoutesDTO): boolean {
  const raw = (record.raw ?? {}) as Record<string, unknown>;
  const depositId = raw.depositId !== undefined ? Number(raw.depositId) : NaN;
  if (Number.isFinite(depositId) && depositId > 0) return depositId === deposit.depositId;

  const depositName = String(raw.depositName ?? "").trim().toUpperCase();
  return depositName !== "" && depositName === String(deposit.depositName ?? "").trim().toUpperCase();
}

const BAOPServicesSection = memo<BAOPServicesSectionProps>(
  ({
    deposit,
    date,
    showWeekends,
    assignmentsByDate,
    vendors,
    routes,
    onEdit,
    onCreateAdHocService: _onCreateAdHocService,
    onCreateBaopService,
    onAssignmentDelete,
    draggedItem,
    draggedFromCell,
    onDragStart,
  }) => {
    const weekDates = useMemo(() => getWeekDates(date), [date]);

    const { routes: baopRoutes } = useBaopRoutes(deposit.depositId);

    const [lines, setLines] = useState<BAOPLineDefinition[]>([]);
    const [isAddLineOpen, setIsAddLineOpen] = useState(false);

    const [entryModal, setEntryModal] = useState<{
      open: boolean;
      lineSort: number;
      routeId: number;
      routeName: string;
      dateStr: string;
    } | null>(null);

    const [closeLineModal, setCloseLineModal] = useState<{
      open: boolean;
      lineSort: number;
      title: string;
    } | null>(null);
    const [isClosingLine, setIsClosingLine] = useState(false);

    const filteredAssignmentsByDate = useMemo(() => {
      const filtered = new Map<string, WeekPlannerRecord[]>();
      assignmentsByDate.forEach((items, dateStr) => {
        const kept = (items || []).filter((r) => isBaopServiceForDeposit(r, deposit));
        filtered.set(dateStr, kept);
      });
      return filtered;
    }, [assignmentsByDate, deposit]);

    // Ensure all BAOP routes are present as lines, and auto-discover existing BAOP lines from assignments
    useEffect(() => {
      const discovered = new Map<number, number>(); // lineSort -> routeId
      filteredAssignmentsByDate.forEach((items) => {
        items.forEach((r) => {
          const raw = (r.raw ?? {}) as Record<string, unknown>;
          const sort = raw.adhocSort !== undefined && raw.adhocSort !== null ? Number(raw.adhocSort) : 0;
          const routeId = raw.routeId !== undefined && raw.routeId !== null ? Number(raw.routeId) : 0;
          if (sort > 0 && routeId > 0 && !discovered.has(sort)) discovered.set(sort, routeId);
        });
      });

      setLines((prev) => {
        const bySort = new Map(prev.map((l) => [l.lineSort, l]));

        // 1. Ensure ALL baopRoutes are present as lines (even if they have no assignments)
        baopRoutes.forEach((r) => {
          const rId = Number(r.routeId);
          // Check if this route already has a line (either in state or discovered from assignments)
          const hasLineInState = Array.from(bySort.values()).some((l) => Number(l.routeId) === rId);
          const hasDiscoveredLine = Array.from(discovered.values()).some((rid) => Number(rid) === rId);

          if (!hasLineInState && !hasDiscoveredLine) {
            // Use routeId as the default adhocSort for consistency
            bySort.set(rId, { lineSort: rId, routeId: rId, title: r.routeName || `Route ${rId}` });
          }
        });

        // 2. Add discovered lines from existing assignments (that might use custom adhocSort values)
        discovered.forEach((routeId, sort) => {
          if (bySort.has(sort)) return;
          const r = baopRoutes.find((x) => Number(x.routeId) === Number(routeId));
          const name = r?.routeName || `Route ${routeId}`;
          bySort.set(sort, { lineSort: sort, routeId: routeId, title: name });
        });

        return Array.from(bySort.values()).sort((a, b) => a.lineSort - b.lineSort);
      });
    }, [filteredAssignmentsByDate, baopRoutes]);

    const nextLineSort = useMemo(() => {
      const maxInLines = lines.reduce((m, l) => Math.max(m, l.lineSort), 0);
      let maxInAssignments = 0;
      filteredAssignmentsByDate.forEach((items) => {
        items.forEach((r) => {
          const raw = (r.raw ?? {}) as Record<string, unknown>;
          const sort = raw.adhocSort !== undefined && raw.adhocSort !== null ? Number(raw.adhocSort) : 0;
          if (sort > maxInAssignments) maxInAssignments = sort;
        });
      });
      return Math.max(maxInLines, maxInAssignments) + 1;
    }, [lines, filteredAssignmentsByDate]);

    const routesForLines: Route[] = useMemo(() => {
      return lines.map((l) => ({
        routeId: -l.lineSort, // virtual, unique, avoids collisions
        routeName: l.title,
        active: true,
        depositId: deposit.depositId,
      }));
    }, [lines, deposit.depositId]);

    const openEntry = useCallback(
      (lineSort: number, dateStr: string) => {
        const line = lines.find((l) => l.lineSort === lineSort);
        if (!line) return;
        const r = baopRoutes.find((x) => Number(x.routeId) === Number(line.routeId));
        const routeName = r?.routeName || line.title;
        setEntryModal({
          open: true,
          lineSort,
          routeId: line.routeId,
          routeName,
          dateStr,
        });
      },
      [lines, baopRoutes],
    );

    const getAssignmentsInCell = useCallback(
      (route: Route, dateStr: string, assignmentsForDay: WeekPlannerRecord[]) => {
        // Our virtual routeId is negative: -lineSort
        const lineSort = route.routeId ? -Number(route.routeId) : 0;
        const line = lines.find((l) => l.lineSort === lineSort);
        if (!line) return [];

        return (assignmentsForDay || []).filter((r) => {
          if (!isBaopServiceForDeposit(r, deposit)) return false;
          const raw = (r.raw ?? {}) as Record<string, unknown>;
          const sort = raw.adhocSort !== undefined && raw.adhocSort !== null ? Number(raw.adhocSort) : 0;
          const routeId = raw.routeId !== undefined && raw.routeId !== null ? Number(raw.routeId) : 0;
          return sort === line.lineSort && routeId === line.routeId && r.date === dateStr;
        });
      },
      [lines, deposit],
    );

    const totalServices = useMemo(() => {
      let total = 0;
      filteredAssignmentsByDate.forEach((items) => (total += items.length));
      return total;
    }, [filteredAssignmentsByDate]);

    const requestCloseLine = useCallback((lineSort: number) => {
      const line = lines.find((l) => l.lineSort === lineSort);
      if (!line) return;
      setCloseLineModal({ open: true, lineSort, title: line.title });
    }, [lines]);

    const confirmCloseLine = useCallback(async () => {
      if (!closeLineModal) return;
      const lineSort = closeLineModal.lineSort;
      const line = lines.find((l) => l.lineSort === lineSort);
      if (!line) {
        setCloseLineModal(null);
        return;
      }

      setIsClosingLine(true);
      try {
        // Collect assignments in this line across the whole week
        const toDelete: WeekPlannerRecord[] = [];
        filteredAssignmentsByDate.forEach((items) => {
          items.forEach((a) => {
            const raw = (a.raw ?? {}) as Record<string, unknown>;
            const sort = raw.adhocSort !== undefined && raw.adhocSort !== null ? Number(raw.adhocSort) : 0;
            const routeId = raw.routeId !== undefined && raw.routeId !== null ? Number(raw.routeId) : 0;
            if (sort === line.lineSort && routeId === line.routeId) {
              toDelete.push(a);
            }
          });
        });

        if (onAssignmentDelete && toDelete.length > 0) {
          await Promise.allSettled(toDelete.map((a) => onAssignmentDelete(a)));
        }

        // Remove line from UI (if backend/local deletions succeeded, it won't reappear)
        setLines((prev) => prev.filter((l) => l.lineSort !== lineSort));
        setCloseLineModal(null);
      } finally {
        setIsClosingLine(false);
      }
    }, [closeLineModal, filteredAssignmentsByDate, lines, onAssignmentDelete]);

    return (
      <div className="mt-4 w-full flex flex-col items-center relative">
        {/* Header (igual aos outros blocos) */}
        <div className="w-full">
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border border-slate-200 shadow-sm mb-0">
            <div className="flex items-center gap-4 justify-between w-full">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 m-0">{deposit.depositName} - BAOP Services</h2>
                  <p className="text-sm text-slate-600 m-0 mt-0.5 font-medium">
                    {totalServices} {totalServices === 1 ? "service" : "services"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddLineOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.99]"
                  title="Add line"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add line</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Container */}
        <div className="w-full bg-white rounded-b-2xl p-2 shadow-sm border border-slate-200 border-t-0 mt-0 overflow-hidden transition-all duration-300 ease-out">
          <WeekGrid
            weekDates={weekDates}
            showWeekends={showWeekends}
            routes={routesForLines}
            assignmentsByDate={filteredAssignmentsByDate}
            vendors={vendors}
            allRoutes={routes}
            onEdit={onEdit}
            // BAOP: não usa drag & drop para criar assignment (linhas são manuais)
            onDrop={() => {}}
            draggedItem={draggedItem}
            draggedFromCell={draggedFromCell}
            onDragStart={onDragStart}
            headerBg="from-emerald-600 to-emerald-700"
            headerText="Service"
            emptyMessage="Empty board — add a line"
            onQuickAdd={(routeId, dateStr) => {
              const lineSort = -Number(routeId);
              openEntry(lineSort, dateStr);
            }}
            showQuickAddButton={false}
            getAssignmentsInCell={getAssignmentsInCell}
            renderRouteLabel={({ route }) => {
              const lineSort = route.routeId ? -Number(route.routeId) : 0;
              return (
                <div
                  className="flex items-center justify-between px-3 py-2 bg-background/40 border-r border-border/60 border-b border-border/60 font-semibold text-xs h-[60px] box-border transition-colors duration-200 relative overflow-hidden min-w-0 hover:bg-accent/40 last:border-r-0"
                >
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-foreground">
                    {route.routeName || `Line ${lineSort}`}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive/40 hover:shadow-sm active:scale-95"
                    title="Remove line"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requestCloseLine(lineSort);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            }}
          />
        </div>

        <BAOPAddLineModal
          open={isAddLineOpen}
          onClose={() => setIsAddLineOpen(false)}
          depositId={deposit.depositId}
          onAddLine={(r) => {
            const name = r.routeName || `Route ${r.routeId}`;
            setLines((prev) => [...prev, { lineSort: nextLineSort, routeId: Number(r.routeId), title: name }]);
          }}
        />

        <BAOPAddEntryModal
          open={Boolean(entryModal?.open)}
          onClose={() => setEntryModal(null)}
          title={entryModal ? `${entryModal.routeName} • Linha ${entryModal.lineSort} • ${entryModal.dateStr}` : ""}
          vendors={vendors}
          onConfirm={async ({ userId, notes }) => {
            if (!entryModal) return;
            if (!onCreateBaopService) return;
            await onCreateBaopService(
              userId,
              entryModal.routeId,
              entryModal.dateStr,
              deposit.depositId,
              deposit.depositName,
              notes,
              entryModal.lineSort,
            );
          }}
        />

        <Dialog
          open={Boolean(closeLineModal?.open)}
          onOpenChange={(open) => {
            if (!open && !isClosingLine) setCloseLineModal(null);
          }}
        >
          <DialogContent
            className="w-[calc(100vw-1.5rem)] sm:w-full max-w-sm max-h-[55vh] overflow-y-auto p-2.5 sm:p-3"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader className="pb-1.5">
              <DialogTitle className="text-base">Close BAOP</DialogTitle>
              <DialogDescription className="text-xs leading-tight">
                {closeLineModal
                  ? `Are you sure you want to close the line "${closeLineModal.title}"? All services on this line will be removed.`
                  : "Are you sure you want to close this line? All services will be removed."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isClosingLine}
                onClick={() => setCloseLineModal(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-destructive hover:bg-destructive/90"
                disabled={isClosingLine}
                onClick={confirmCloseLine}
              >
                {isClosingLine ? "Closing..." : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

BAOPServicesSection.displayName = "BAOPServicesSection";

export default BAOPServicesSection;



