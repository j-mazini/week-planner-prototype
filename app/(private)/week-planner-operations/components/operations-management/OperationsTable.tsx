"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ButtonWithRipple } from "@/components/ui/button-with-ripple";
import type { FrontendOperationRecord } from "../../types/operations-management";
import VrnPlate from "@/components/vrn-plate";
import ServicePartnerBadge from "@/components/service-partner-badge";
import { useServicePartnerNameByUserId } from "@/hooks/useServicePartnerNameByUserId";
import { formatDecimalHoursAsTime, getCleanCostModelName } from "../../utils/operationsManagementMappers";
import { weekPlannerOperationsStyles } from "../../styles";

type SortConfig = { key: string; direction: "asc" | "desc" };

const getHeaderLabel = (header: string) => {
  if (header === "Extras") return "Extras - Qty Hour";
  if (header === "Name" || header === "Vendor") return "Vendor";
  if (header === "AD-HOC Service") return "adhoc-service";
  return header;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

type Props = {
  headers: readonly string[];
  loading: boolean;
  error: string | null;
  showEmptyState: boolean;
  selectedDate: string;
  weekPlannersCount: number;
  data: FrontendOperationRecord[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onEdit: (item: FrontendOperationRecord) => void;
  onDelete: (item: FrontendOperationRecord) => void;
  pagination: Pagination;
  showPagination?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onOpenRateDetails?: (item: FrontendOperationRecord) => void;
  shouldShowRateDetailsIcon?: (item: FrontendOperationRecord) => boolean;
  validatedKeys?: Set<string>;
  getItemKey?: (item: FrontendOperationRecord) => string;
  onToggleValidated?: (item: FrontendOperationRecord, checked: boolean) => void;
  /** Quando false, oculta a coluna Actions por completo (ex.: bloco Not allocated). */
  showActionsColumn?: boolean;
};

export const OperationsTable = React.memo(function OperationsTable({
  headers,
  loading,
  error,
  showEmptyState,
  selectedDate,
  weekPlannersCount,
  data,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  pagination,
  showPagination = true,
  onPrevPage,
  onNextPage,
  onOpenRateDetails,
  shouldShowRateDetailsIcon,
  validatedKeys,
  getItemKey,
  onToggleValidated,
  showActionsColumn = true,
}: Props) {
  const [notesModal, setNotesModal] = useState<{
    text: string;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const closeNotesModal = useCallback(() => setNotesModal(null), []);

  const servicePartnerMap = useServicePartnerNameByUserId();

  useEffect(() => {
    if (!notesModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNotesModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notesModal, closeNotesModal]);

  const renderCellValue = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const str = String(value);
    return str.trim() === "" ? "-" : str;
  };

  const getBadgeVariant = (fuelType?: string): "blue" | "green" => {
    if (!fuelType) return "blue";
    const v = fuelType.trim().toLowerCase();
    return v === "ev" || v.includes("electric") ? "green" : "blue";
  };

  return (
    <div className={weekPlannerOperationsStyles.tableContainer} style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Error Message */}
      {error && (
        <div className={weekPlannerOperationsStyles.tableErrorContainer}>
          <p className={weekPlannerOperationsStyles.tableErrorTitle}>Error:</p>
          <p>{error}</p>
        </div>
      )}
      {loading && (
        <div className={weekPlannerOperationsStyles.tableLoadingContainer}>
          <div className={weekPlannerOperationsStyles.tableLoadingSpinner}></div>
          <p className={weekPlannerOperationsStyles.tableLoadingText}>Loading operations...</p>
        </div>
      )}

      {!loading && showEmptyState && (
        <div className={weekPlannerOperationsStyles.tableEmptyContainer}>
          {weekPlannersCount === 0 ? (
            <>
              <p className={weekPlannerOperationsStyles.tableEmptyTitle}>No data</p>
              <p className={weekPlannerOperationsStyles.tableEmptyText}>No record was returned for the selected date ({selectedDate}).</p>
            </>
          ) : (
            <>
              <p className={weekPlannerOperationsStyles.tableEmptyTitle}>No records to show</p>
              <p className={weekPlannerOperationsStyles.tableEmptyText}>
                The server returned {weekPlannersCount} record(s) for this page/date, but none match the current filters or search. Try changing the date, adjusting the filters or going to the next page.
              </p>
            </>
          )}
        </div>
      )}

      {!loading && !showEmptyState && (
        <>
          <div className={weekPlannerOperationsStyles.tableScrollContainer} style={{ maxWidth: '100%', boxSizing: 'border-box', WebkitOverflowScrolling: 'touch' }}>
            <table className={weekPlannerOperationsStyles.table} style={{ minWidth: '100%', tableLayout: 'auto', width: 'max-content' }}>
              <thead className={weekPlannerOperationsStyles.tableThead}>
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      onClick={() => onSort(header)}
                      className={weekPlannerOperationsStyles.tableTh}
                    >
                      <div className={weekPlannerOperationsStyles.tableThContent}>
                        {getHeaderLabel(header)}
                        {sortConfig.key === header && (
                          <span className={weekPlannerOperationsStyles.tableThSortIndicator}>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {showActionsColumn ? (
                    <th className={weekPlannerOperationsStyles.tableThActions}>
                      <span className="hidden sm:inline">Actions</span>
                      <span className="sm:hidden">Acts</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className={weekPlannerOperationsStyles.tableTbody}>
                {data.map((item, index) => {
                  const status = String(item.Status ?? "").trim().toLowerCase();
                  const isSubmitted =
                    item.isSubmitted === true || status === "submitted";
                  const isOff = status === "off";
                  const isNotAllocated = status === "notallocated";
                  // Not allocated: já foi "retirado da rota"; não mostrar excluir de novo (evita PATCH redundante).
                  const canDelete =
                    (item.weekPlannerId != null ||
                      (item.dailyOperationsManagementId != null &&
                        Number.isFinite(Number(item.dailyOperationsManagementId)))) &&
                    !isNotAllocated;
                  return (
                    <tr
                      key={
                        item.weekPlannerId ??
                        item.dailyOperationsManagementId ??
                        (item.userId != null ? `dom-synth-${item.userId}-${item.Date}` : `${item.Name}-${item.Date}-${index}`)
                      }
                      className={`${weekPlannerOperationsStyles.tableRow} ${isOff
                          ? weekPlannerOperationsStyles.tableRowOff
                          : isNotAllocated
                            ? weekPlannerOperationsStyles.tableRowNotAllocated
                            : isSubmitted
                              ? weekPlannerOperationsStyles.tableRowSubmitted
                              : index % 2 === 0
                                ? weekPlannerOperationsStyles.tableRowEven
                                : weekPlannerOperationsStyles.tableRowOdd
                        } ${!isSubmitted && !isOff && !isNotAllocated ? weekPlannerOperationsStyles.tableRowHover : ""}`}
                    >
                      {headers.map((header) => (
                        <td
                          key={header}
                          className={`${weekPlannerOperationsStyles.tableCell} ${isOff ? weekPlannerOperationsStyles.tableCellOff : ""}`}
                        >
                          {header === "Name" || header === "Vendor" ? (
                            (() => {
                              const spName = item.userId
                                ? servicePartnerMap.get(Number(item.userId)) ?? null
                                : null;
                              return (
                                <span className="inline-flex items-center gap-1.5 flex-wrap">
                                  <span>{renderCellValue(item.Name)}</span>
                                  {spName !== null && (
                                    <ServicePartnerBadge partnerName={spName} size="xs" />
                                  )}
                                </span>
                              );
                            })()
                          ) : header === "Vehicle" ? (
                            (() => {
                              const plate = String(item.Vehicle ?? "").trim();
                              if (!plate) {
                                return <span className={weekPlannerOperationsStyles.tableCellEmpty}>-</span>;
                              }
                              if (plate.toUpperCase() === "NOVEHICLE") {
                                return <span className="font-semibold text-slate-600">NOVEHICLE</span>;
                              }
                              return (
                                <VrnPlate
                                  vrn={plate}
                                  size="sm"
                                  badgeVariant={getBadgeVariant(item.vehicleFuelType)}
                                />
                              );
                            })()
                          ) : header === "Notes" ? (
                            item[header] && String(item[header]).trim() !== "" ? (
                              <button
                                type="button"
                                data-notes-badge
                                className={`${weekPlannerOperationsStyles.tableCellNotesBadge} border-0`}
                                title={String(item[header])}
                                aria-label="View notes"
                                aria-expanded={Boolean(notesModal)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  const noteText = item[header];
                                  if (!noteText || String(noteText).trim() === "") {
                                    return;
                                  }

                                  const text = String(noteText);
                                  const rect = e.currentTarget.getBoundingClientRect();

                                  // Posicionar a modal logo acima do botão (em relação ao viewport)
                                  let modalTop = rect.top - 10 + window.scrollY;
                                  const modalLeft = rect.left + rect.width / 2 + window.scrollX;

                                  // Se muito perto do topo, posicionar abaixo
                                  if (rect.top < 100) {
                                    modalTop = rect.bottom + 10 + window.scrollY;
                                  }

                                  // Calcular width responsiva
                                  let modalWidth = 350;
                                  const minDistance = 20;

                                  // Se perto da esquerda, reduzir width
                                  if (rect.left < 220) {
                                    modalWidth = Math.max(200, (rect.left - minDistance) * 2);
                                  }

                                  // Se perto da direita, reduzir width e reposicionar
                                  if (rect.left + rect.width / 2 > window.innerWidth - 200) {
                                    const availableSpace = window.innerWidth - (rect.left + rect.width / 2);
                                    modalWidth = Math.max(200, availableSpace * 2 - minDistance);
                                  }

                                  setNotesModal({ text, top: modalTop, left: modalLeft, width: modalWidth });
                                }}
                              >
                                <span className="before:content-['!']" aria-hidden />
                              </button>
                            ) : (
                              <span className={weekPlannerOperationsStyles.tableCellEmpty}>-</span>
                            )
                          ) : (header === "Extras" || header === "Extra") &&
                            Number(item.paymentModeId) === 7 ? (
                            formatDecimalHoursAsTime(item.Extras)
                          ) : header === "Extras" || header === "Extra" ? (
                            renderCellValue(item.Extras)
                          ) : header === "Rate" ? (
                            <div className="inline-flex items-center gap-2">
                              {(() => {
                                const modeLabel = getCleanCostModelName(String(item["Payment Mode"] ?? ""));
                                const showRateIcon =
                                  modeLabel !== "DR" &&
                                  modeLabel !== "FSR" &&
                                  Boolean(shouldShowRateDetailsIcon?.(item));
                                const rawRate = item[header];
                                // For banded models (DAF/VSR) always show only the icon; never show 0.00 alongside it.
                                const rateText = showRateIcon ? "" : renderCellValue(rawRate);
                                return (
                                  <>
                                    {rateText ? <span>{rateText}</span> : null}
                                    {showRateIcon ? (
                                      <button
                                        type="button"
                                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        title="View DAF/VSR cost model bands (min/max stops and price per stop)"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenRateDetails?.(item);
                                        }}
                                      >
                                        i
                                      </button>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </div>
                          ) : header === "Sort" ? (
                            (() => {
                              const s = String(item.Sort ?? "").trim().toLowerCase();
                              const late = item.SortLate === true;
                              if (s === "yes" && late) return "Yes (Late)";
                              if (s === "yes") return "Yes";
                              return renderCellValue(item[header]);
                            })()
                          ) : header === "Sort Value" ? (
                            renderCellValue(item.routeSort)
                          ) : header === "AD-HOC Service" ? (
                            renderCellValue(item["AD-HOC Service"])
                          ) : (
                            renderCellValue(item[header])
                          )}
                        </td>
                      ))}
                      {showActionsColumn ? (
                        <td
                          className={`${weekPlannerOperationsStyles.tableCellActions} ${isSubmitted ? "text-center" : ""
                            } ${!isSubmitted && !isOff && !isNotAllocated && index % 2 !== 0 ? weekPlannerOperationsStyles.tableCellActionsOdd : ""
                            }`}
                        >
                          <div className={weekPlannerOperationsStyles.tableCellActionsContainer}>
                            {isSubmitted ? (
                              <div className="w-full flex justify-center">
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold"
                                  title="Submitted"
                                >
                                  Submitted
                                </span>
                              </div>
                            ) : (
                              <>
                                {validatedKeys && getItemKey && onToggleValidated && (() => {
                                  const key = getItemKey(item);
                                  const isValidated = validatedKeys.has(key);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => onToggleValidated(item, !isValidated)}
                                      title={isValidated ? "Validated — click to unmark" : "Mark as validated"}
                                      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border transition-colors ${isValidated
                                          ? "bg-green-100 border-green-400 text-green-700 hover:bg-green-200"
                                          : "bg-white border-slate-300 text-slate-400 hover:border-green-400 hover:text-green-600"
                                        }`}
                                    >
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                  );
                                })()}
                                <button
                                  onClick={() => onEdit(item)}
                                  className={`${weekPlannerOperationsStyles.tableActionButton} ${weekPlannerOperationsStyles.tableActionButtonEdit}`}
                                  title="Edit"
                                >
                                  <svg className={weekPlannerOperationsStyles.tableActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                {canDelete ? (
                                  <button
                                    onClick={() => onDelete(item)}
                                    className={`${weekPlannerOperationsStyles.tableActionButton} ${weekPlannerOperationsStyles.tableActionButtonDelete}`}
                                    title="Delete"
                                  >
                                    <svg className={weekPlannerOperationsStyles.tableActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal de Notas - Portal Posicionado */}
          {notesModal && typeof document !== "undefined"
            ? createPortal(
                <div
                  style={{
                    position: "absolute",
                    top: `${notesModal.top}px`,
                    left: `${notesModal.left}px`,
                    transform: "translate(-50%, -100%)",
                    zIndex: 9999,
                    pointerEvents: "auto",
                    width: `${notesModal.width}px`,
                    maxWidth: "90vw",
                    minWidth: "200px",
                    backgroundColor: "#fffacd",
                    border: "1px solid #fde047",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "1rem",
                    paddingRight: "2.5rem",
                    maxHeight: "40vh",
                    overflow: "auto",
                    display: "block"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Botão Fechar */}
                  <button
                    onClick={closeNotesModal}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      padding: "0.25rem",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1e293b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    type="button"
                    aria-label="Fechar"
                  >
                    <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Conteúdo */}
                  <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#475569", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {notesModal.text}
                  </p>
                </div>,
                document.body
              )
            : null}

          {/* Pagination Controls (oculto quando uma página = um dia) */}
          {showPagination && onPrevPage && onNextPage && (
            <div className={weekPlannerOperationsStyles.tablePagination}>
              <span className={weekPlannerOperationsStyles.tablePaginationText}>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
              </span>
              <div className={weekPlannerOperationsStyles.tablePaginationButtons}>
                <ButtonWithRipple
                  onClick={onPrevPage}
                  disabled={pagination.currentPage === 1 || loading}
                  className={weekPlannerOperationsStyles.tablePaginationButton}
                >
                  Previous
                </ButtonWithRipple>
                <button
                  onClick={onNextPage}
                  disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0 || loading}
                  className={weekPlannerOperationsStyles.tablePaginationButton}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});




