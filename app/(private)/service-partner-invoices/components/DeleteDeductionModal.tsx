"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { LightModal } from "@/components/ui/light-modal";
import {
  deleteServicePartnerDeduction,
  type ServicePartnerDeductionDTO,
} from "@/lib/service-partner-deductions-api";
import { formatDeductionReference, formatGbp } from "../utils/format";

interface Props {
  show: boolean;
  deduction: ServicePartnerDeductionDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDeductionModal({ show, deduction, onClose, onSuccess }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!deduction) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteServicePartnerDeduction(deduction.service_partner_deduction_id);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete deduction");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <LightModal show={show} onClose={onClose} title="Delete Deduction" size="xs">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            Are you sure you want to delete this deduction? This action cannot be undone.
          </p>
        </div>

        <div className="space-y-1.5 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Reference</span>
            <span className="font-medium text-gray-800">
              {deduction
                ? formatDeductionReference({
                    service_partner_deduction_id: deduction.service_partner_deduction_id,
                    deduction_amount: deduction.deduction_amount,
                    reimbursements_amount: deduction.reimbursements_amount,
                  })
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service Partner</span>
            <span className="font-medium text-gray-800">{deduction?.service_partner_name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-red-600">{formatGbp(deduction?.deduction_amount ?? 0)}</span>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </LightModal>
  );
}
