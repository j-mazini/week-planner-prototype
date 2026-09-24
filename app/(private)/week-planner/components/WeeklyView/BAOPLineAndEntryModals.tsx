"use client";



import React, { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import type { Vendor } from "@/lib/vendors";

import { useRoutes } from "@/hooks/useRoutes";

import { type Route } from "@/lib/api/routes";

import { isFlexRoute } from "../../utils/depotOrganizationUtils";



export type BAOPLineDefinition = {

  lineSort: number; // stored as adhocSort

  routeId: number;

  title: string;

};



export function useBaopRoutes(depositId: number | undefined | null) {

  const { data: all, isLoading, error } = useRoutes({

    enabled: !!depositId,

  });



  const routes = useMemo(() => {

    if (!all || !depositId) return [];

    return all

      // Apenas rotas do BAOP (depositId)

      .filter((r) => Number(r.depositId) === Number(depositId))

      // Apenas ativas

      .filter((r) => r.active !== false)

      // BAOP não tem ADHOC/Flex: excluir BRTE e rotas adhoc/flex

      .filter((r) => {

        const name = String(r.routeName || "").toLowerCase();

        if (Number(r.routeId) === 55) return false; // BRTE

        if (name.includes("adhoc") || name.includes("ad-hoc")) return false;

        return !isFlexRoute(r);

      });

  }, [all, depositId]);



  return { 

    routes, 

    loading: isLoading, 

    error: error ? (error instanceof Error ? error.message : String(error)) : "" 

  };

}



function RouteCombobox(props: {

  routes: Route[];

  loading: boolean;

  error?: string;

  value: string;

  onChange: (routeId: string) => void;

  placeholder?: string;

}) {

  const { routes, loading, error, value, onChange, placeholder } = props;

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");



  useEffect(() => {

    if (!open) setQuery("");

  }, [open]);



  const sorted = useMemo(() => {

    const list = [...routes];

    list.sort((a, b) => {

      const an = String(a.routeName || "").toLowerCase();

      const bn = String(b.routeName || "").toLowerCase();

      return an.localeCompare(bn);

    });

    return list;

  }, [routes]);



  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    if (!q) return sorted;

    return sorted.filter((r) => {

      const name = String(r.routeName || "").toLowerCase();

      const id = String(r.routeId || "");

      return name.includes(q) || id.includes(q);

    });

  }, [sorted, query]);



  const selected = useMemo(() => routes.find((r) => String(r.routeId) === String(value)), [routes, value]);



  return (

    <Popover open={open} onOpenChange={setOpen} modal={false}>

      <PopoverTrigger asChild>

        <button

          type="button"

          className={cn(

            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",

            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

            "disabled:cursor-not-allowed disabled:opacity-50",

          )}

          disabled={loading}

        >

          <span className={cn("truncate", !selected && "text-muted-foreground")}>

            {selected ? `#${selected.routeId} — ${selected.routeName || ""}` : (placeholder || "Select a route")}

          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />

        </button>

      </PopoverTrigger>

      <PopoverContent

        className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 flex flex-col max-h-[12rem] z-[100]"

        align="start"

        side="bottom"

        sideOffset={6}

        avoidCollisions={false}

        onWheel={(e) => e.stopPropagation()}

        onTouchMove={(e) => e.stopPropagation()}

      >

        <div className="p-2 border-b bg-gradient-to-b from-emerald-50/70 to-white flex-shrink-0">

          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">

            <div className="min-w-0">

              <div className="text-xs font-semibold text-slate-800">BAOP routes</div>

              <div className="text-[11px] text-slate-600 truncate">

                {loading ? "Loading..." : `Showing ${filtered.length} of ${routes.length}`}

              </div>

            </div>

            <div className="w-full sm:w-48 shrink-0">

              <Input

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                placeholder="Search by ID or name..."

                autoFocus

                className="h-8 text-xs"

              />

            </div>

          </div>

          {error ? (

            <div className="mt-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-1.5">

              Failed to load routes: {error}

            </div>

          ) : null}

        </div>

        <div className="overflow-y-auto p-0.5 max-h-[calc(12rem-5rem)]">

          {loading ? (

            <div className="p-2 text-xs text-slate-600">Loading...</div>

          ) : filtered.length === 0 ? (

            <div className="p-2 text-xs text-slate-600">No routes found.</div>

          ) : (

            filtered.map((r) => {

              const isSelected = String(r.routeId) === String(value);

              return (

                <button

                  key={`route-${r.routeId}`}

                  type="button"

                  className={cn(

                    "w-full flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors",

                    isSelected && "bg-emerald-50",

                  )}

                  onClick={() => {

                    onChange(String(r.routeId));

                    setOpen(false);

                  }}

                >

                  <Check className={cn("h-4 w-4 text-emerald-700", !isSelected && "opacity-0")} />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 min-w-0">

                      <span className="font-mono text-xs text-slate-600">#{r.routeId}</span>

                      <span className="truncate font-medium text-slate-900">{r.routeName || `Route ${r.routeId}`}</span>

                    </div>

                    <div className="text-[11px] text-slate-600 mt-0.5">

                      {r.serviceTypeId ? `Service type: ${r.serviceTypeId}` : " "}

                    </div>

                  </div>

                </button>

              );

            })

          )}

        </div>

      </PopoverContent>

    </Popover>

  );

}



function VendorCombobox(props: {

  vendors: Vendor[];

  value: string;

  onChange: (userId: string) => void;

  disabled?: boolean;

  placeholder?: string;

}) {

  const { vendors, value, onChange, disabled, placeholder } = props;

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");



  useEffect(() => {

    if (!open) setQuery("");

  }, [open]);



  const list = useMemo(() => vendors.filter((d) => d.userId && d.userId > 0), [vendors]);

  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    if (!q) return list;

    return list.filter((d) => {

      const name = String(d.fullName || "").toLowerCase();

      const id = String(d.userId || "");

      return name.includes(q) || id.includes(q);

    });

  }, [list, query]);



  const selected = useMemo(() => list.find((d) => String(d.userId) === String(value)), [list, value]);



  return (

    <Popover open={open} onOpenChange={setOpen} modal={false}>

      <PopoverTrigger asChild>

        <button

          type="button"

          className={cn(

            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",

            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

            "disabled:cursor-not-allowed disabled:opacity-50",

          )}

          disabled={disabled}

        >

          <span className={cn("truncate", !selected && "text-muted-foreground")}>

            {selected ? `#${selected.userId} — ${selected.fullName || ""}` : (placeholder || "Select a vendor")}

          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />

        </button>

      </PopoverTrigger>

      <PopoverContent

        className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0 flex flex-col max-h-[12rem] z-[100]"

        align="start"

        side="bottom"

        sideOffset={6}

        avoidCollisions={false}

        onWheel={(e) => e.stopPropagation()}

        onTouchMove={(e) => e.stopPropagation()}

      >

        <div className="p-2 border-b bg-gradient-to-b from-slate-50 to-white flex-shrink-0">

          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">

            <div className="min-w-0">

              <div className="text-xs font-semibold text-slate-800">Vendors</div>

              <div className="text-[11px] text-slate-600 truncate">{`Showing ${filtered.length} of ${list.length}`}</div>

            </div>

            <div className="w-full sm:w-48 shrink-0">

              <Input

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                placeholder="Search by ID or name..."

                autoFocus

                className="h-8 text-xs"

              />

            </div>

          </div>

        </div>

        <div className="overflow-y-auto p-0.5 max-h-[calc(12rem-5rem)]">

          {filtered.length === 0 ? (

            <div className="p-2 text-xs text-slate-600">No vendors found.</div>

          ) : (

            filtered.map((d) => {

              const isSelected = String(d.userId) === String(value);

              return (

                <button

                  key={`vendor-${d.userId}`}

                  type="button"

                  className={cn(

                    "w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors",

                    isSelected && "bg-emerald-50",

                  )}

                  onClick={() => {

                    onChange(String(d.userId));

                    setOpen(false);

                  }}

                >

                  <Check className={cn("h-4 w-4 text-emerald-700", !isSelected && "opacity-0")} />

                  <span className="font-mono text-xs text-slate-600">#{d.userId}</span>

                  <span className="truncate font-medium text-slate-900">{d.fullName || `Vendor ${d.userId}`}</span>

                </button>

              );

            })

          )}

        </div>

      </PopoverContent>

    </Popover>

  );

}



export function BAOPAddLineModal(props: {

  open: boolean;

  onClose: () => void;

  depositId?: number | null;

  onAddLine: (route: Route) => void;

}) {

  const { open, onClose, depositId, onAddLine } = props;

  const { routes, loading, error } = useBaopRoutes(depositId);

  const [selectedRouteId, setSelectedRouteId] = useState<string>("");



  useEffect(() => {

    if (!open) {

      setSelectedRouteId("");

    }

  }, [open]);



  const selected = useMemo(

    () => routes.find((r) => String(r.routeId) === String(selectedRouteId)),

    [routes, selectedRouteId],

  );



  return (

    <Dialog open={open} onOpenChange={() => onClose()}>

      <DialogContent

        className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md max-h-[60vh] overflow-y-auto p-2.5 sm:p-3"

        onInteractOutside={(e) => e.preventDefault()}

        onPointerDownOutside={(e) => e.preventDefault()}

      >

        <DialogHeader className="pb-1.5">

          <DialogTitle className="text-base">Create line (BAOP)</DialogTitle>

          <DialogDescription className="text-xs break-words leading-tight">

            Select an available BAOP route (ROUTES table). Duplicates are allowed.

          </DialogDescription>

        </DialogHeader>



        <div className="space-y-2 py-0.5">

          <div className="space-y-1.5">

            <Label>Route *</Label>

            <RouteCombobox

              routes={routes}

              loading={loading}

              error={error}

              value={selectedRouteId}

              onChange={setSelectedRouteId}

              placeholder="Select a BAOP route"

            />

            {selected ? (

              <div className="rounded-md border bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">

                <div className="font-semibold">Selected</div>

                <div className="mt-0.5">

                  <span className="font-mono">#{selected.routeId}</span> — {selected.routeName || "-"}

                </div>

              </div>

            ) : null}

          </div>

        </div>



        <DialogFooter>

          <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">

            Cancel

          </Button>

          <Button

            className="bg-emerald-600 hover:bg-emerald-700"

            disabled={!selected || loading}

            onClick={() => {

              if (!selected) return;

              onAddLine(selected);

              onClose();

            }}

          >

            Create line

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}



export function BAOPAddEntryModal(props: {

  open: boolean;

  onClose: () => void;

  title: string;

  vendors: Vendor[];

  onConfirm: (data: { userId: number; notes?: string }) => Promise<void> | void;

}) {

  const { open, onClose, title, vendors, onConfirm } = props;

  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  const [notes, setNotes] = useState<string>("");

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    if (!open) {

      setSelectedVendorId("");

      setNotes("");

      setSaving(false);

    }

  }, [open]);



  const canSave = useMemo(() => {

    const id = Number(selectedVendorId);

    return Number.isFinite(id) && id > 0;

  }, [selectedVendorId]);



  return (

    <Dialog open={open} onOpenChange={() => onClose()}>

      <DialogContent

        className="w-[calc(100vw-1.5rem)] sm:w-full max-w-md max-h-[60vh] overflow-y-auto p-2.5 sm:p-3"

        onInteractOutside={(e) => e.preventDefault()}

        onPointerDownOutside={(e) => e.preventDefault()}

      >

        <DialogHeader className="pb-1.5">

          <DialogTitle className="text-base">Open service</DialogTitle>

          <DialogDescription className="text-xs break-words leading-tight">

            {title}

          </DialogDescription>

        </DialogHeader>



        <div className="space-y-2 py-0.5">

          <div className="space-y-1.5">

            <Label className="text-sm">Vendor *</Label>

            <VendorCombobox

              vendors={vendors}

              value={selectedVendorId}

              onChange={setSelectedVendorId}

              disabled={saving}

              placeholder="Select a vendor"

            />

          </div>



          <div className="space-y-1.5">

            <Label className="text-sm">Notes (optional)</Label>

            <Textarea

              value={notes}

              onChange={(e) => setNotes(e.target.value.slice(0, 500))}

              placeholder="Notes..."

              className="min-h-[60px] text-sm"

            />

            <div className="text-xs text-slate-500">{notes.length}/500</div>

          </div>

        </div>



        <DialogFooter>

          <Button variant="outline" onClick={onClose} disabled={saving} className="w-full sm:w-auto">

            Cancel

          </Button>

          <Button

            className="bg-emerald-600 hover:bg-emerald-700"

            disabled={!canSave || saving}

            onClick={async () => {

              const userId = Number(selectedVendorId);

              if (!Number.isFinite(userId) || userId <= 0) return;

              setSaving(true);

              try {

                await onConfirm({ userId, notes: notes.trim() || undefined });

                onClose();

              } finally {

                setSaving(false);

              }

            }}

          >

            {saving ? "Saving..." : "Save"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}







