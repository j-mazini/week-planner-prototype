"use client";

import React from "react";
import { OperationsReviewTable } from "./OperationsReviewTable";
import { ValidationError } from "./ValidationError";
import type { FrontendOperationRecord } from "../../types/operations-management";
import { weekPlannerOperationsStyles } from "../../styles";

type Props = {
  open: boolean;
  errors: string[];
  data: FrontendOperationRecord[];
  validatedKeys: Set<string>;
  loading?: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const OperationsReviewModal = React.memo(function OperationsReviewModal({
  open,
  errors,
  data,
  validatedKeys,
  loading = false,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;
  const getItemKey = (item: FrontendOperationRecord) => {
    const normalizedDate = String(item.Date || "").split("T")[0] || String(item.Date || "");
    if (item.weekPlannerId != null && Number.isFinite(Number(item.weekPlannerId))) {
      return `wp:${Number(item.weekPlannerId)}`;
    }
    if (item.operationId != null && Number.isFinite(Number(item.operationId))) {
      return `op:${Number(item.operationId)}`;
    }
    return `fallback:${normalizedDate}|${String(item.Route || "").trim().toLowerCase()}|${String(item.Name || "").trim().toLowerCase()}|${String(item.Vehicle || "").trim().toLowerCase()}`;
  };
  const pendingCount = data.filter((item) => !item.operationId).length;
  const selectedCount = data.filter((item) => !item.operationId && validatedKeys.has(getItemKey(item))).length;

  return (
    <div className={weekPlannerOperationsStyles.modalBackdrop}>
      <div className={`${weekPlannerOperationsStyles.modalContent} ${weekPlannerOperationsStyles.modalContentLarge}`}>
        <div className={weekPlannerOperationsStyles.modalHeaderZ}>
          <h2 className={weekPlannerOperationsStyles.modalTitle}>Review and Submit (Current Day)</h2>
          <button onClick={onClose} className={weekPlannerOperationsStyles.modalCloseButton} type="button">
            <svg className={weekPlannerOperationsStyles.modalCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={weekPlannerOperationsStyles.modalBody}>
          <ValidationError errors={errors} />
          <p className={weekPlannerOperationsStyles.reviewModalText}>Please review the data. Only the active records below will be submitted.</p>
          {loading ? (
            <div className={weekPlannerOperationsStyles.reviewModalLoading}>
              <div className={weekPlannerOperationsStyles.reviewModalLoadingSpinner} />
              <span className={weekPlannerOperationsStyles.reviewModalLoadingText}>Loading all records...</span>
            </div>
          ) : (
            <OperationsReviewTable
              data={data}
              title="Active Records to Save"
              validatedKeys={validatedKeys}
              getItemKey={getItemKey}
            />
          )}
        </div>

        <div className={weekPlannerOperationsStyles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${weekPlannerOperationsStyles.modalButton} ${weekPlannerOperationsStyles.modalButtonCancelAlt}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || (!loading && pendingCount > 0 && selectedCount === 0)}
            className={`${weekPlannerOperationsStyles.modalButton} ${weekPlannerOperationsStyles.modalButtonSubmit}`}
          >
            {isSubmitting && <span className={weekPlannerOperationsStyles.modalButtonSpinner} />}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
});



