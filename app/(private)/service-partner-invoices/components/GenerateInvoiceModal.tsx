"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckSquare, ChevronLeft, ChevronRight, Loader2, Square } from "lucide-react";
import { LightModal } from "@/components/ui/light-modal";
import {
  fetchServicePartnerInvoices,
  fetchServicePartnersWithoutInvoice,
  generateServicePartnerInvoices,
  GenerateSPInvoiceResultDTO,
  ServicePartnerDTO,
  ServicePartnerInvoiceDTO,
} from "@/lib/service-partners-api";
import { DeductionsBlock } from "./DeductionsBlock";
import { VatBlock } from "./VatBlock";
import { formatGbp, formatItemDate, monthYearLabel } from "../utils/format";

interface PreviewState {
  loading: boolean;
  error: string | null;
  data: ServicePartnerInvoiceDTO | null;
}

interface Props {
  show: boolean;
  mode: "single" | "multi";
  onClose: () => void;
  onSuccess: (result: GenerateSPInvoiceResultDTO) => void;
}

export function GenerateInvoiceModal({ show, mode, onClose, onSuccess }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [uninvoicedSPs, setUninvoicedSPs] = useState<ServicePartnerDTO[]>([]);
  const [loadingSPs, setLoadingSPs] = useState(false);
  const [spError, setSpError] = useState<string | null>(null);

  const [selectedSpId, setSelectedSpId] = useState<string>("");
  const [selectedSpIds, setSelectedSpIds] = useState<Set<number>>(new Set());

  // Multi mode: which service partners have been approved for generation, and
  // which one is currently shown in the review carousel.
  const [approvedSpIds, setApprovedSpIds] = useState<Set<number>>(new Set());
  const [reviewIndex, setReviewIndex] = useState(0);

  const [previews, setPreviews] = useState<Record<number, PreviewState>>({});
  const loadedPreviewsRef = useRef<Set<number>>(new Set());

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateSPInvoiceResultDTO | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const month = selectedMonth.getMonth() + 1;
  const year = selectedMonth.getFullYear();

  const changeMonth = (delta: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const loadSPs = useCallback(async () => {
    setLoadingSPs(true);
    setSpError(null);
    try {
      const sps = await fetchServicePartnersWithoutInvoice(month, year);
      setUninvoicedSPs(sps);
      setSelectedSpId("");
      setSelectedSpIds(new Set());
      setApprovedSpIds(new Set());
      setReviewIndex(0);
      setPreviews({});
      loadedPreviewsRef.current.clear();
    } catch (e) {
      setSpError(e instanceof Error ? e.message : "Failed to load service partners");
    } finally {
      setLoadingSPs(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (!show) {
      setResult(null);
      setGenerateError(null);
      setSelectedSpId("");
      setSelectedSpIds(new Set());
      setApprovedSpIds(new Set());
      setReviewIndex(0);
      setPreviews({});
      loadedPreviewsRef.current.clear();
      return;
    }
    loadSPs();
  }, [show, loadSPs]);

  const ensurePreview = useCallback(
    (spId: number) => {
      if (loadedPreviewsRef.current.has(spId)) return;
      loadedPreviewsRef.current.add(spId);
      setPreviews((prev) => ({ ...prev, [spId]: { loading: true, error: null, data: null } }));
      fetchServicePartnerInvoices(month, year, spId)
        .then(([data]) => {
          setPreviews((prev) => ({ ...prev, [spId]: { loading: false, error: null, data: data ?? null } }));
        })
        .catch((e: unknown) => {
          setPreviews((prev) => ({
            ...prev,
            [spId]: {
              loading: false,
              error: e instanceof Error ? e.message : "Failed to load stops",
              data: null,
            },
          }));
        });
    },
    [month, year]
  );

  const toggleSP = (spId: number) => {
    setSelectedSpIds((prev) => {
      const next = new Set(prev);
      if (next.has(spId)) {
        next.delete(spId);
        setApprovedSpIds((approved) => {
          if (!approved.has(spId)) return approved;
          const nextApproved = new Set(approved);
          nextApproved.delete(spId);
          return nextApproved;
        });
      } else {
        next.add(spId);
        ensurePreview(spId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedSpIds.size === uninvoicedSPs.length) {
      setSelectedSpIds(new Set());
      setApprovedSpIds(new Set());
    } else {
      uninvoicedSPs.forEach((sp) => ensurePreview(sp.servicePartnerId));
      setSelectedSpIds(new Set(uninvoicedSPs.map((sp) => sp.servicePartnerId)));
    }
  };

  const toggleApproved = (spId: number) => {
    setApprovedSpIds((prev) => {
      const next = new Set(prev);
      if (next.has(spId)) {
        next.delete(spId);
      } else {
        next.add(spId);
      }
      return next;
    });
  };

  // Keeps the same order as the checkbox list so the review carousel matches what was selected.
  const selectedIds = useMemo(
    () =>
      mode === "single"
        ? selectedSpId
          ? [Number(selectedSpId)]
          : []
        : uninvoicedSPs
            .filter((sp) => selectedSpIds.has(sp.servicePartnerId))
            .map((sp) => sp.servicePartnerId),
    [mode, selectedSpId, selectedSpIds, uninvoicedSPs]
  );

  const previewRows = useMemo(() => {
    const rows: { key: string; item: ServicePartnerInvoiceDTO["itens"][number] }[] = [];
    selectedIds.forEach((id) => {
      const entry = previews[id];
      entry?.data?.itens.forEach((item) => {
        rows.push({ key: `${id}-${item.operationId}`, item });
      });
    });
    return rows;
  }, [selectedIds, previews]);

  const previewLoading = selectedIds.some((id) => previews[id]?.loading);
  const previewError = selectedIds.map((id) => previews[id]?.error).find(Boolean) ?? null;

  const hasUsableSpData = useCallback(
    (spId: number | undefined) => {
      if (spId === undefined) return false;
      const data = previews[spId]?.data;
      if (!data) return false;
      return data.itens.length > 0 || data.deductions.length > 0 || data.amountTotal > 0;
    },
    [previews]
  );

  const safeReviewIndex = Math.min(reviewIndex, Math.max(selectedIds.length - 1, 0));
  const currentSpId: number | undefined = mode === "multi" ? selectedIds[safeReviewIndex] : undefined;
  const currentSp = useMemo(
    () => uninvoicedSPs.find((sp) => sp.servicePartnerId === currentSpId),
    [uninvoicedSPs, currentSpId]
  );
  const currentPreview = currentSpId !== undefined ? previews[currentSpId] : undefined;
  const currentApproved = currentSpId !== undefined && approvedSpIds.has(currentSpId);
  const currentUsable = hasUsableSpData(currentSpId);

  const canGenerate =
    !generating &&
    (mode === "single" ? !!selectedSpId : approvedSpIds.size > 0);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    setResult(null);

    const ids = mode === "single" ? [Number(selectedSpId)] : Array.from(approvedSpIds);

    try {
      const res = await generateServicePartnerInvoices({ service_partner_ids: ids, month, year });
      setResult(res);
      if (res.created > 0) onSuccess(res);
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Failed to generate invoices");
    } finally {
      setGenerating(false);
    }
  };

  const allSelected =
    uninvoicedSPs.length > 0 && selectedSpIds.size === uninvoicedSPs.length;

  const done = !!result;

  return (
    <LightModal
      show={show}
      onClose={onClose}
      title={mode === "single" ? "Generate Invoice" : "Generate Invoices"}
      size={mode === "multi" ? "lg" : "md"}
    >
      <div className="space-y-6">
        {/* Period */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Period
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={done}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-9 flex-1 items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800">
              {monthYearLabel(month, year)}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={done}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* SP selector */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
            {mode === "single" ? "Service Partner" : "Service Partners"}
          </p>

          {loadingSPs ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : spError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {spError}
            </p>
          ) : uninvoicedSPs.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
              All service partners already have an invoice for this period.
            </p>
          ) : mode === "single" ? (
            <select
              value={selectedSpId}
              onChange={(e) => {
                setSelectedSpId(e.target.value);
                if (e.target.value) ensurePreview(Number(e.target.value));
              }}
              disabled={done}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select a service partner…</option>
              {uninvoicedSPs.map((sp) => (
                <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </option>
              ))}
            </select>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={toggleAll}
                disabled={done}
                className="flex w-full items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                Select all ({uninvoicedSPs.length})
              </button>

              <div className="max-h-52 overflow-y-auto">
                {uninvoicedSPs.map((sp) => {
                  const checked = selectedSpIds.has(sp.servicePartnerId);
                  return (
                    <button
                      key={sp.servicePartnerId}
                      type="button"
                      onClick={() => toggleSP(sp.servicePartnerId)}
                      disabled={done}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left text-sm text-gray-800 transition last:border-b-0 hover:bg-blue-50 disabled:pointer-events-none"
                    >
                      {checked ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-gray-300" />
                      )}
                      {sp.partnerName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Single mode: stops + itemized deductions preview, same layout as a normal invoice */}
        {!done && mode === "single" && selectedIds.length > 0 && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Stops Preview
              </p>
              {previewLoading && previewRows.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading stops…
                </div>
              ) : previewError && previewRows.length === 0 ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {previewError}
                </p>
              ) : previewRows.length === 0 ? (
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                  No billable stops found for this period.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr className="text-left text-gray-500">
                          <th className="px-2.5 py-1.5 font-semibold">Route</th>
                          <th className="px-2.5 py-1.5 font-semibold">Note</th>
                          <th className="px-2.5 py-1.5 text-right font-semibold">Stops</th>
                          <th className="px-2.5 py-1.5 text-right font-semibold">Amount</th>
                          <th className="px-2.5 py-1.5 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => (
                          <tr key={row.key} className="border-t border-gray-100">
                            <td className="px-2.5 py-1 font-medium text-gray-700">{row.item.routeName || "-"}</td>
                            <td className="px-2.5 py-1 text-gray-500">{row.item.note || "—"}</td>
                            <td className="px-2.5 py-1 text-right text-gray-500">{row.item.totalStops}</td>
                            <td className="px-2.5 py-1 text-right font-medium text-gray-700">
                              {formatGbp(row.item.amount)}
                            </td>
                            <td className="px-2.5 py-1 text-gray-500">{formatItemDate(row.item.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                    <span>
                      {previewRows.length} stop{previewRows.length !== 1 ? "s" : ""}
                    </span>
                    <span>Subtotal: {formatGbp(previews[Number(selectedSpId)]?.data?.amountTotal ?? 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {previews[Number(selectedSpId)]?.data && (
              <>
                <DeductionsBlock
                  deductions={previews[Number(selectedSpId)]!.data!.deductions}
                  totalDeductions={previews[Number(selectedSpId)]!.data!.totalDeductions}
                  totalReimbursements={previews[Number(selectedSpId)]!.data!.totalReimbursements}
                />
                <VatBlock amount={previews[Number(selectedSpId)]!.data!.totalVat} />
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                  <span>Net Total</span>
                  <span>{formatGbp(previews[Number(selectedSpId)]!.data!.netTotal)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Multi mode: review and approve each service partner individually */}
        {!done && mode === "multi" && selectedIds.length > 0 && currentSpId !== undefined && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Review &amp; Approve
            </p>
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {currentSp?.partnerName ?? `Service Partner #${currentSpId}`}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Service Partner {safeReviewIndex + 1} of {selectedIds.length}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    currentApproved
                      ? "bg-green-100 text-green-800"
                      : !currentUsable
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {currentApproved ? "✓ Approved" : !currentUsable ? "No Data Available" : "Pending Approval"}
                </span>
              </div>

              {currentPreview?.loading ? (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : currentPreview?.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {currentPreview.error}
                </p>
              ) : !currentPreview?.data || !currentUsable ? (
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                  No billable stops or deductions found for this period.
                </p>
              ) : (
                <>
                  {currentPreview.data.itens.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr className="text-left text-gray-500">
                              <th className="px-2.5 py-1.5 font-semibold">Route</th>
                              <th className="px-2.5 py-1.5 font-semibold">Note</th>
                              <th className="px-2.5 py-1.5 text-right font-semibold">Stops</th>
                              <th className="px-2.5 py-1.5 text-right font-semibold">Amount</th>
                              <th className="px-2.5 py-1.5 font-semibold">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPreview.data.itens.map((item) => (
                              <tr key={item.operationId} className="border-t border-gray-100">
                                <td className="px-2.5 py-1 font-medium text-gray-700">{item.routeName || "-"}</td>
                                <td className="px-2.5 py-1 text-gray-500">{item.note || "—"}</td>
                                <td className="px-2.5 py-1 text-right text-gray-500">{item.totalStops}</td>
                                <td className="px-2.5 py-1 text-right font-medium text-gray-700">
                                  {formatGbp(item.amount)}
                                </td>
                                <td className="px-2.5 py-1 text-gray-500">{formatItemDate(item.date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                        <span>
                          {currentPreview.data.itens.length} stop{currentPreview.data.itens.length !== 1 ? "s" : ""}
                        </span>
                        <span>Subtotal: {formatGbp(currentPreview.data.amountTotal)}</span>
                      </div>
                    </div>
                  )}

                  <DeductionsBlock
                    deductions={currentPreview.data.deductions}
                    totalDeductions={currentPreview.data.totalDeductions}
                    totalReimbursements={currentPreview.data.totalReimbursements}
                  />
                  <VatBlock amount={currentPreview.data.totalVat} />

                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                    <span>Net Total</span>
                    <span>{formatGbp(currentPreview.data.netTotal)}</span>
                  </div>
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                    disabled={safeReviewIndex === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewIndex((i) => Math.min(selectedIds.length - 1, i + 1))}
                    disabled={safeReviewIndex === selectedIds.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">
                    {approvedSpIds.size} of {selectedIds.length} approved
                  </span>
                  {currentApproved ? (
                    <button
                      type="button"
                      onClick={() => toggleApproved(currentSpId)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Unapprove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleApproved(currentSpId)}
                      disabled={!currentUsable}
                      className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg border p-4 text-sm ${
              result.failed > 0 && result.created === 0
                ? "border-red-200 bg-red-50"
                : result.failed > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-green-200 bg-green-50"
            }`}
          >
            <p className="font-semibold text-gray-800">
              {result.created} invoice{result.created !== 1 ? "s" : ""} generated
              {result.failed > 0 && `, ${result.failed} failed`}
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    SP {e.service_partner_id}: {e.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {generateError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {generateError}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {done ? "Close" : "Cancel"}
          </button>
          {!done && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating && <Loader2 className="h-4 w-4 animate-spin" />}
              {generating
                ? "Generating…"
                : mode === "single"
                  ? "Generate"
                  : `Generate (${approvedSpIds.size})`}
            </button>
          )}
        </div>
      </div>
    </LightModal>
  );
}
