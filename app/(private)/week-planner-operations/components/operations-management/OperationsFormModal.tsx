"use client";

import React, { useEffect, useMemo, useRef } from "react";
import type { CostModel } from "@/lib/cost-models";
import type { Vendor } from "@/lib/vendors";
import type { Route } from "@/lib/api/routes";
import type { Vehicle } from "@/lib/vehicles";
import type { VendorType } from "@/lib/vendors-api";
import type { AdhocServiceDTO } from "@/lib/adhoc-services-api";
import type { DepositDTO } from "@/lib/api/deposits";
import type { ServicePartnerDTO } from "@/lib/service-partners-api";
import { Check, Clock3 } from "lucide-react";
import { FORM_FIELDS } from "../../types/operations-management";
import type { FrontendOperationRecord } from "../../types/operations-management";
import { buildPaymentModeOptions, normalizeSortSelectValue } from "../../utils/operationsManagementMappers";
import { weekPlannerOperationsStyles } from "../../styles";
import { filterAllowedDeposits } from "@/lib/allowedDeposits";
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

/** Campos e ordem: Add Adhoc Service / editar linha AD-HOC (Daily Operations Management). */
const ADHOC_MODAL_FIELD_ORDER: Array<(typeof FORM_FIELDS)[number]> = [
  "Name",
  "Route",
  "Deposit Name",
  "AD-HOC Service",
  "AD-HOC Sort",
  "Extras",
  "Notes",
  "Vehicle",
];

/** Campos para edição de OFF (somente dados permitidos). */
const OFF_EDIT_MODAL_FIELD_ORDER: Array<(typeof FORM_FIELDS)[number]> = [
  "Name",
  "Vehicle",
  "Notes",
  "Vendor type",
];

/** Convert decimal hours (e.g. 8.5) to "HH:MM" for time input. Capped at 23:59 for type="time". */
function decimalHoursToTimeString(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0) return "";
  let h = Math.floor(n);
  let m = Math.min(59, Math.max(0, Math.round((n - h) * 60)));
  if (h >= 24) {
    h = 23;
    m = 59;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert "HH:MM" or "H:MM" to decimal hours (e.g. "8:30" → 8.5). Rounded to 2 decimals for payload. */
function timeStringToDecimalHours(s: string): number | undefined {
  if (!s || typeof s !== "string") return undefined;
  const trimmed = s.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return undefined;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes >= 60) return undefined;
  const decimal = hours + minutes / 60;
  return Math.round(decimal * 100) / 100;
}

type Props = {
  open: boolean;
  editing: boolean;
  /** Daily Operations Management: hide Status and Deposit (derived from route/vendor / existing row). */
  omitStatusAndDeposit?: boolean;
  showDayOffCategory?: boolean;
  showAdhocCategory?: boolean;
  /** Modo edição OFF: mostrar somente Vendor, Vehicle, Notes e Vendor type. */
  showOffEditCategory?: boolean;
  /**
   * Daily Operations Management: não mostrar AD-HOC Service / AD-HOC Sort na linha do Sort ao editar
   * linhas da tabela principal do depósito — apenas no fluxo AD-HOC (showAdhocCategory) ou week planner.
   */
  suppressInlineAdhocFieldsInSortRow?: boolean;
  formData: FrontendOperationRecord;
  vendors: Vendor[];
  sortedRoutes: Route[];
  vehicles: Vehicle[];
  costModels: CostModel[];
  vendorTypes: VendorType[];
  adhocServices: AdhocServiceDTO[];
  deposits: DepositDTO[];
  servicePartners: ServicePartnerDTO[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string | number) => void;
  onNumericChange: (field: string, value: string) => void;
};

export const OperationsFormModal = React.memo(function OperationsFormModal({
  open,
  editing,
  omitStatusAndDeposit,
  showDayOffCategory,
  showAdhocCategory,
  showOffEditCategory,
  suppressInlineAdhocFieldsInSortRow,
  formData,
  vendors,
  sortedRoutes,
  vehicles,
  costModels,
  vendorTypes,
  adhocServices,
  deposits,
  servicePartners: _servicePartners,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
  onNumericChange,
}: Props) {
  const paymentModeOptions = useMemo(() => buildPaymentModeOptions(costModels), [costModels]);
  const { guard } = useSubmitGuard();
  const sortedVendors = useMemo(() => {
    const seenNames = new Set<string>();
    const uniqueVendors = vendors.filter((vendor) => {
      const normalizedName = String(vendor.fullName ?? "").trim().toLowerCase();
      if (!normalizedName) return false;
      if (seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    });
    return uniqueVendors.sort((a, b) =>
      String(a.fullName ?? "").localeCompare(String(b.fullName ?? ""), undefined, { sensitivity: "base" })
    );
  }, [vendors]);

  const vendorItems = useMemo<SelectItem[]>(() => {
    return sortedVendors.map((v) => ({
      value: v.fullName || "",
      label: v.fullName || `Vendor ${v.userId}`,
    }));
  }, [sortedVendors]);

  const routeItems = useMemo<SelectItem[]>(() => {
    const offItem: SelectItem = { value: "OFF", label: "OFF", secondaryLabel: "No route" };
    const items = sortedRoutes
      .filter((r) => (r.routeName || "").toUpperCase() !== "OFF")
      .map((r) => ({
        value: r.routeName || "",
        label: r.routeName || `Route ${r.routeId}`,
      }));
    return [offItem, ...items];
  }, [sortedRoutes]);

  const vehicleItems = useMemo<SelectItem[]>(() => {
    const seen = new Set<string>();
    const items = vehicles
      .filter((v) => v.registrationPlates && v.registrationPlates !== "NOVEHICLE")
      .filter((v) => {
        const plate = v.registrationPlates as string;
        if (seen.has(plate)) return false;
        seen.add(plate);
        return true;
      })
      .map((v) => ({
        value: v.registrationPlates || "",
        label: v.registrationPlates || `Vehicle ${v.vehicleId}`,
        secondaryLabel: v.model,
      }));
    return [
      { value: "NOVEHICLE", label: "NOVEHICLE", secondaryLabel: "No vehicle assigned" },
      ...items,
    ];
  }, [vehicles]);

  const adhocServiceItems = useMemo<SelectItem[]>(() => {
    return adhocServices.map((s) => ({
      value: String(s.adhocServiceId),
      label: s.adhocName || `AD-HOC Service ${s.adhocServiceId}`,
    }));
  }, [adhocServices]);

  const depositItems = useMemo<SelectItem[]>(() => {
    return filterAllowedDeposits(deposits).map((d) => ({
      value: d.depositName || "",
      label: d.depositName || `Depot ${d.depositId}`,
    }));
  }, [deposits]);

  const timeInputRef = useRef<HTMLInputElement>(null);

  // When costModelId is 7, show time picker for Extras and store as numeric(10,2)
  const paymentModeValue = formData["Payment Mode"] ?? formData.paymentModeId;
  const costModelId = Number(paymentModeValue);
  const isExtraHours = costModelId === 7;
  const isBandedRateModel = costModelId === 1 || costModelId === 4 || costModelId === 12; // DAF / VSR / SP_VSR

  /** Select value is adhocServiceId; the row may only expose name or id in different fields. */
  const adhocServiceLabel = formData["AD-HOC Service"];
  const adHocServiceSelectValue = useMemo(() => {
    const rawId = formData.adhocServiceId;
    if (rawId != null && String(rawId).trim() !== "") {
      const n = Number(rawId);
      if (Number.isFinite(n) && n > 0) return String(n);
    }
    const lbl = adhocServiceLabel;
    if (lbl == null || String(lbl).trim() === "") return "";
    const trimmed = String(lbl).trim();
    const byId = adhocServices.find((s) => String(s.adhocServiceId) === trimmed);
    if (byId) return String(byId.adhocServiceId);
    const byName = adhocServices.find(
      (s) => String(s.adhocName ?? "").trim() === trimmed
    );
    return byName ? String(byName.adhocServiceId) : "";
  }, [formData.adhocServiceId, adhocServiceLabel, adhocServices]);

  const sortSelectValue = useMemo(
    () => normalizeSortSelectValue(formData.Sort),
    [formData.Sort]
  );

  const sortValueDisabled = sortSelectValue === "No";

  // When Sort is No, routeSort must be empty (payload uses 0 from DGP logic). Keeps API/edit edge cases in sync.
  useEffect(() => {
    if (!sortValueDisabled) return;
    const raw = formData.routeSort;
    if (raw == null || String(raw).trim() === "") return;
    onNumericChange("routeSort", "");
  }, [sortValueDisabled, formData.routeSort, onNumericChange]);

  const openTimePicker = () => {
    try {
      timeInputRef.current?.showPicker?.();
    } catch {
      timeInputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div className={weekPlannerOperationsStyles.modalBackdrop}>
      <div className="w-full px-[10%] box-border flex justify-center">
        <div className={`${weekPlannerOperationsStyles.modalContent} ${weekPlannerOperationsStyles.modalContentSmall}`}>
          <div className={weekPlannerOperationsStyles.modalHeader}>
            <h2 className={weekPlannerOperationsStyles.modalTitle}>{editing ? "Edit Record" : "Add New Record"}</h2>
            <button onClick={onClose} className={weekPlannerOperationsStyles.modalCloseButton} type="button">
              <svg className={weekPlannerOperationsStyles.modalCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={guard(onSubmit)} className={weekPlannerOperationsStyles.modalBody}>
            <div className={weekPlannerOperationsStyles.formModalGrid}>
              {/*
              Day Off mode: "Add Day off" only allows choosing the vendor (Name).
              Backend/UI already sets Status=Off, Route=OFF, Vehicle=NOVEHICLE when the modal opens.
            */}
              {(showOffEditCategory
                ? OFF_EDIT_MODAL_FIELD_ORDER
                : showAdhocCategory
                  ? ADHOC_MODAL_FIELD_ORDER
                  : FORM_FIELDS).map((key) => {
                // Date is always controlled by page selectedDate.
                if (!showAdhocCategory && key === "Date") return null;
                // Day Off category: only show vendor (Name). Status is omitted here.
                if (showDayOffCategory) {
                  if (key === "Status") return null;
                  if (key !== "Name") return null;
                }
                // Add New Record (normal flow): hide AD-HOC fields; use "Add Adhoc Service" for those.
                if (!editing && !showAdhocCategory && (key === "AD-HOC Sort" || key === "AD-HOC Service")) {
                  return null;
                }
                // Daily DOM: Status/deposit are implicit (route, vendor, row); no manual selects.
                if (
                  omitStatusAndDeposit &&
                  !showDayOffCategory &&
                  !showAdhocCategory &&
                  (key === "Status" || key === "Deposit Name")
                ) {
                  return null;
                }
                // AD-HOC Sort: no modo AD-HOC da modal é campo próprio; fora disso fica junto ao bloco Sort.
                if (key === "AD-HOC Sort" && !showAdhocCategory) {
                  return null;
                }
                // Edit mode: AD-HOC Service + AD-HOC Sort are rendered in the same full-width row as Sort (see below).
                if (key === "AD-HOC Service" && editing && !showAdhocCategory) {
                  return null;
                }

                if (key === "Sort") {
                  const showAdhocInSortRow =
                    editing &&
                    !showAdhocCategory &&
                    !suppressInlineAdhocFieldsInSortRow;
                  // Align with the 2-col form: left = Payment Mode column (Sort + AD-HOC Service), right = Rate column (Sort value + AD-HOC Sort).
                  return (
                    <div key={key} className="md:col-span-2 w-full min-w-0">
                      <div className="flex w-full flex-col gap-4 md:flex-row md:items-start">
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                          <div className="min-w-0 space-y-2">
                            <label className={weekPlannerOperationsStyles.formLabel}>Sort</label>
                            <select
                              value={sortSelectValue}
                              onChange={(e) => {
                                const v = e.target.value;
                                onChange(key, v);
                                if (v === "No") {
                                  onNumericChange("routeSort", "");
                                }
                              }}
                              className={weekPlannerOperationsStyles.formSelect}
                              title="Sort: Yes / No (same as Daily Game Plan); when Yes, choose On time or Late"
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {sortSelectValue === "Yes" && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Arrival:</span>
                                <button
                                  type="button"
                                  onClick={() => onChange("SortLate", 0)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition border ${!formData.SortLate
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                  <Check className="h-4 w-4" strokeWidth={2.5} />
                                  On time
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onChange("SortLate", 1)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition border ${formData.SortLate
                                      ? "bg-amber-100 text-amber-800 border-amber-300"
                                      : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                  <Clock3 className="h-4 w-4" strokeWidth={2.25} />
                                  Late
                                </button>
                              </div>
                            )}
                          </div>

                          {showAdhocInSortRow ? (
                            <div className="min-w-0">
                              <label className={weekPlannerOperationsStyles.formLabel}>AD-HOC Service</label>
                              <SearchableSelect
                                items={adhocServiceItems}
                                value={adHocServiceSelectValue}
                                onValueChange={(value) => {
                                  onChange("AD-HOC Service", value);
                                  if (!value) {
                                    onChange("AD-HOC Sort", "");
                                    onChange("adhocServiceId", "");
                                  } else {
                                    const selectedService = adhocServices.find(
                                      (s) => String(s.adhocServiceId) === value
                                    );
                                    if (
                                      selectedService &&
                                      selectedService.adhocVendorPayment !== null &&
                                      selectedService.adhocVendorPayment !== undefined
                                    ) {
                                      const vendorPayment =
                                        typeof selectedService.adhocVendorPayment === "number"
                                          ? selectedService.adhocVendorPayment
                                          : Number(String(selectedService.adhocVendorPayment));
                                      if (Number.isFinite(vendorPayment) && vendorPayment > 0) {
                                        onChange("AD-HOC Sort", String(vendorPayment));
                                      }
                                    }
                                    onChange("adhocServiceId", value);
                                  }
                                }}
                                placeholder="Select AD-HOC Service"
                                searchPlaceholder="Search service..."
                                title="AD-HOC Services"
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                          <div className="min-w-0">
                            <label className={weekPlannerOperationsStyles.formLabel}>Sort value</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              step="1"
                              disabled={sortValueDisabled}
                              value={
                                sortValueDisabled
                                  ? ""
                                  : String((formData as FrontendOperationRecord).routeSort ?? "")
                              }
                              onChange={(e) => onNumericChange("routeSort", e.target.value)}
                              className={`${weekPlannerOperationsStyles.formInput}${sortValueDisabled ? " bg-slate-50 text-slate-500 cursor-not-allowed" : ""
                                }`}
                              placeholder="e.g. 0, 1, 20"
                              title={
                                sortValueDisabled
                                  ? "Sort is No — routeSort is not used; enable by setting Sort to Yes."
                                  : "Maps to routeSort. Leave empty to use Sort/Arrival defaults."
                              }
                            />
                          </div>

                          {showAdhocInSortRow ? (
                            <div className="min-w-0">
                              <label className={weekPlannerOperationsStyles.formLabel}>AD-HOC Sort</label>
                              <input
                                type="text"
                                value={String(formData["AD-HOC Sort"] ?? "").trim()}
                                placeholder="e.g. 10.00"
                                onChange={(e) => onNumericChange("AD-HOC Sort", e.target.value)}
                                title="Populated by the selected AD-HOC Service (editable)"
                                className={weekPlannerOperationsStyles.formInput}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className={weekPlannerOperationsStyles.formLabel}>
                      {key === "Extras"
                        ? showAdhocCategory
                          ? "Extra"
                          : "Extras - Qty Hour"
                        : key === "Name"
                          ? "Vendor"
                          : key === "Deposit Name"
                            ? "Depot"
                            : key}
                      {key === "Name" || (key === "AD-HOC Service" && showAdhocCategory) ? " *" : ""}
                    </label>

                    {showDayOffCategory && key === "Status" ? null : key === "Status" ? (
                      <select
                        required
                        value={String(formData[key] || "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange(key, val);
                          if (val === "Off") onChange("Route", "OFF");
                        }}
                        className={weekPlannerOperationsStyles.formSelect}
                      >
                        <option value="Working">Working</option>
                        <option value="Off">Day Off</option>
                        <option value="NotAllocated">NotAllocated</option>
                      </select>
                    ) : key === "Name" ? (
                      <SearchableSelect
                        items={vendorItems}
                        value={String(formData[key] || "")}
                        onValueChange={(value) => onChange(key, value)}
                        placeholder="Select vendor"
                        searchPlaceholder="Search vendor by name or ID..."
                        title="Vendors"
                      />
                    ) : key === "Vendor type" ? (
                      <select
                        value={String(formData[key] || "")}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={weekPlannerOperationsStyles.formSelect}
                      >
                        <option value="">Select type</option>
                        {vendorTypes.map((vendorType) => (
                          <option key={vendorType.vendorTypeId} value={vendorType.nameType || ""}>
                            {vendorType.nameType || `Vendor Type ${vendorType.vendorTypeId}`}
                          </option>
                        ))}
                      </select>
                    ) : key === "Payment Mode" ? (
                      <select
                        value={String(formData[key] || "")}
                        onChange={(e) => {
                          onChange(key, e.target.value);
                          // DAF / VSR / SP_VSR derive the rate from cost model bands, not manual entry —
                          // zero out any rate left over from a previously selected mode.
                          const newCostModelId = Number(e.target.value);
                          if (newCostModelId === 1 || newCostModelId === 4 || newCostModelId === 12) {
                            onNumericChange("Rate", "0");
                          }
                        }}
                        className={weekPlannerOperationsStyles.formSelect}
                      >
                        <option value="">Select mode</option>
                        {paymentModeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : key === "Route" ? (
                      <SearchableSelect
                        items={routeItems}
                        value={String(formData["Status"] === "Off" ? "OFF" : (formData[key] || ""))}
                        onValueChange={(value) => {
                          if (formData["Status"] === "Off") return;
                          onChange(key, value);
                          const selectedRoute = sortedRoutes.find(r => r.routeName === value);
                          if (selectedRoute && selectedRoute.depositId) {
                            const deposit = deposits.find(d => d.depositId === selectedRoute.depositId);
                            if (deposit && deposit.depositName) {
                              onChange('Deposit Name', deposit.depositName);
                            }
                          } else if (!value) {
                            onChange('Deposit Name', '');
                          }
                        }}
                        disabled={formData["Status"] === "Off"}
                        placeholder="Select route"
                        searchPlaceholder="Search route..."
                        title="Routes"
                      />
                    ) : key === "Vehicle" ? (
                      <SearchableSelect
                        items={vehicleItems}
                        value={String(formData[key] || "")}
                        onValueChange={(value) => onChange(key, value)}
                        placeholder="Select vehicle"
                        searchPlaceholder="Search vehicle by plate or model..."
                        title="Vehicles"
                      />
                    ) : key === "AD-HOC Service" ? (
                      <SearchableSelect
                        items={adhocServiceItems}
                        value={adHocServiceSelectValue}
                        onValueChange={(value) => {
                          onChange(key, value);
                          if (!value) {
                            onChange("AD-HOC Sort", "");
                            onChange("adhocServiceId", "");
                          } else {
                            const selectedService = adhocServices.find(
                              (s) => String(s.adhocServiceId) === value
                            );
                            if (
                              selectedService &&
                              selectedService.adhocVendorPayment !== null &&
                              selectedService.adhocVendorPayment !== undefined
                            ) {
                              const vendorPayment =
                                typeof selectedService.adhocVendorPayment === "number"
                                          ? selectedService.adhocVendorPayment
                                          : Number(String(selectedService.adhocVendorPayment));
                              if (Number.isFinite(vendorPayment) && vendorPayment > 0) {
                                onChange("AD-HOC Sort", String(vendorPayment));
                              }
                            }
                            onChange("adhocServiceId", value);
                          }
                        }}
                        placeholder="Select AD-HOC Service"
                        searchPlaceholder="Search service..."
                        title="AD-HOC Services"
                      />
                    ) : key === "AD-HOC Sort" ? (
                      <input
                        type="text"
                        value={String(formData["AD-HOC Sort"] ?? "").trim()}
                        placeholder="e.g. 10.00"
                        onChange={(e) => onNumericChange(key, e.target.value)}
                        title="Populated by the selected AD-HOC Service (editable)"
                        className={weekPlannerOperationsStyles.formInput}
                      />
                    ) : key === "Deposit Name" ? (
                      <SearchableSelect
                        items={depositItems}
                        value={String(formData[key] || "")}
                        onValueChange={(value) => onChange(key, value)}
                        placeholder="Select depot"
                        searchPlaceholder="Search depot..."
                        title="Depots"
                      />
                    ) : key === "Rate" ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={String(formData[key] ?? "")}
                          disabled={isBandedRateModel}
                          placeholder={isBandedRateModel ? "Rate defined by the cost model bands" : ""}
                          onChange={(e) => onNumericChange(key, e.target.value)}
                          className={weekPlannerOperationsStyles.formInput}
                        />
                        {isBandedRateModel && (
                          <p className="text-xs text-blue-600">
                            {costModelId === 12
                              ? "For SP_VSR, the rate is defined by the service partner's cost model bands."
                              : "For DAF/VSR, use the information icon in the Rate column of the table."}
                          </p>
                        )}
                      </div>
                    ) : key === "Extras" && isExtraHours ? (
                      <input
                        ref={timeInputRef}
                        type="time"
                        value={decimalHoursToTimeString(formData.Extras)}
                        onChange={(e) => {
                          const decimal = timeStringToDecimalHours(e.target.value);
                          if (decimal !== undefined) {
                            onNumericChange("Extras", String(decimal));
                          } else if (!e.target.value) {
                            onNumericChange("Extras", "");
                          }
                        }}
                        onFocus={openTimePicker}
                        onClick={openTimePicker}
                        className={weekPlannerOperationsStyles.formInput}
                        title="Hours and minutes (e.g. 8:30 → 8.50 when submitting)"
                      />
                    ) : (
                      <input
                        type="text"
                        required={false}
                        value={String(formData[key] ?? "")}
                        onChange={(e) => {
                          if (key === "Extras") {
                            onNumericChange(key, e.target.value);
                          } else {
                            onChange(key, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (key === "Extras") {
                            const allowedKeys = [
                              "Backspace",
                              "Delete",
                              "Tab",
                              "Escape",
                              "Enter",
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                              "Home",
                              "End",
                            ];
                            const isNumber = /^[0-9]$/.test(e.key);
                            const isDecimal = e.key === "." && !e.currentTarget.value.includes(".");
                            const isMinus = e.key === "-" && e.currentTarget.selectionStart === 0;
                            const isAllowedKey = allowedKeys.includes(e.key);
                            const isCtrlA = e.ctrlKey && e.key === "a";
                            const isCtrlC = e.ctrlKey && e.key === "c";
                            const isCtrlV = e.ctrlKey && e.key === "v";
                            const isCtrlX = e.ctrlKey && e.key === "x";

                            if (
                              !isNumber &&
                              !isDecimal &&
                              !isMinus &&
                              !isAllowedKey &&
                              !isCtrlA &&
                              !isCtrlC &&
                              !isCtrlV &&
                              !isCtrlX
                            ) {
                              e.preventDefault();
                            }
                          }
                        }}
                        className={weekPlannerOperationsStyles.formInput}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={weekPlannerOperationsStyles.formActions}>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {editing ? "Update Record" : "Add Record"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});





