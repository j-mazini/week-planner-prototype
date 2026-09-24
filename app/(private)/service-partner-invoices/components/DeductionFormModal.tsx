"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { LightModal } from "@/components/ui/light-modal";
import { SearchableSelect, type SelectItem } from "@/components/ui/searchable-select";
import type { ServicePartnerDTO } from "@/lib/service-partners-api";
import { useServicePartnerInvoicesTable } from "@/hooks/useServicePartnerInvoicesTable";
import { formatDeductionReference, formatGbp } from "../utils/format";
import {
  createServicePartnerDeduction,
  updateServicePartnerDeduction,
  ServicePartnerDeductionDTO,
} from "@/lib/service-partner-deductions-api";

interface Props {
  show: boolean;
  deduction: ServicePartnerDeductionDTO | null;
  deductions: ServicePartnerDeductionDTO[];
  servicePartners: ServicePartnerDTO[];
  defaultServicePartnerId?: number;
  /** Period used to compute the Daily ServiceCharge quantity (total stops in the period). */
  month?: number;
  year?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClassName =
  "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

function normalizeDateToYYYYMMDD(dateStr?: string | null): string {
  if (!dateStr) return "";
  // Se já está em formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split("T")[0]; // Remove tempo se houver
  }
  // Se está em formato DD/MM/YYYY, converte
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export function DeductionFormModal({
  show,
  deduction,
  deductions,
  servicePartners,
  defaultServicePartnerId,
  month,
  year,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = !!deduction;

  const [selectedSpId, setSelectedSpId] = useState("");
  const [amountType, setAmountType] = useState<"deduction" | "reimbursement" | "daily-service-charge">("deduction");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [reimbursementsAmount, setReimbursementsAmount] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [entryDate, setEntryDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextDeductionId = useMemo(() => {
    const maxId = deductions.reduce((max, item) => {
      return Math.max(max, item.service_partner_deduction_id || 0);
    }, 0);
    return maxId + 1;
  }, [deductions]);

  const deductionAmountValue = Number.parseFloat(deductionAmount);
  const reimbursementAmountValue = Number.parseFloat(reimbursementsAmount);
  const selectedAmountValue = amountType === "deduction" ? deductionAmountValue : reimbursementAmountValue;

  const isDailyServiceCharge = amountType === "daily-service-charge";
  const selectedSp = useMemo(
    () => servicePartners.find((sp) => String(sp.servicePartnerId) === selectedSpId) ?? null,
    [servicePartners, selectedSpId]
  );
  const selectedSpIdNum = selectedSpId ? Number(selectedSpId) : undefined;

  const { data: spInvoices = [], isLoading: isLoadingSpInvoices } = useServicePartnerInvoicesTable({
    month,
    year,
    servicePartnerId: selectedSpIdNum,
    enabled: show && !isEdit && isDailyServiceCharge && !!selectedSpIdNum && !!month && !!year,
  });

  const dailyServiceChargeQuantity = useMemo(() => {
    if (!isDailyServiceCharge) return 0;
    return spInvoices.reduce(
      (sum, inv) => sum + inv.itens.reduce((s, item) => s + (item.totalStops || 0), 0),
      0
    );
  }, [isDailyServiceCharge, spInvoices]);

  const dailyServiceChargeRate = selectedSp?.dailyServiceCharge || 0;
  const congestionReimbursementRate = selectedSp?.reimbursement || 0;
  const dailyServiceChargeAmount = dailyServiceChargeQuantity * dailyServiceChargeRate;
  const congestionReimbursementAmount = dailyServiceChargeQuantity * congestionReimbursementRate;
  const dailyServiceChargeDescription = `Daily ServiceCharge - ${dailyServiceChargeQuantity} x £${dailyServiceChargeRate}`;
  const congestionReimbursementDescription = `Congestion Charge Reimbursement - ${dailyServiceChargeQuantity} x £${congestionReimbursementRate}`;

  const generatedReferenceNumber = useMemo(() => {
    if (isEdit) return referenceNumber;
    return formatDeductionReference({
      service_partner_deduction_id: nextDeductionId,
      reimbursements_amount:
        amountType === "reimbursement" && !Number.isNaN(selectedAmountValue) ? selectedAmountValue : 0,
      deduction_amount:
        amountType === "deduction" && !Number.isNaN(selectedAmountValue) ? selectedAmountValue : 0,
    });
  }, [isEdit, referenceNumber, nextDeductionId, amountType, selectedAmountValue]);

  useEffect(() => {
    if (!show) return;
    setError(null);
    if (deduction) {
      setSelectedSpId(String(deduction.service_partner_id));
      setAmountType((deduction.reimbursements_amount || 0) > 0 ? "reimbursement" : "deduction");
      setReferenceNumber(deduction.reference_number ?? "");
      setDescription(deduction.description ?? "");
      setDeductionAmount(String(deduction.deduction_amount ?? ""));
      setReimbursementsAmount(String(deduction.reimbursements_amount ?? ""));
      setIncidentDate(normalizeDateToYYYYMMDD(deduction.incident_date));
      setEntryDate(normalizeDateToYYYYMMDD(deduction.entry_date));
    } else {
      setSelectedSpId(defaultServicePartnerId ? String(defaultServicePartnerId) : "");
      setAmountType("deduction");
      setReferenceNumber(generatedReferenceNumber);
      setDescription("");
      setDeductionAmount("");
      setReimbursementsAmount("");
      setIncidentDate("");
      setEntryDate(new Date().toISOString().slice(0, 10));
    }
    // generatedReferenceNumber is intentionally excluded: it's kept in sync by the
    // effect below, and including it here would re-run this initializer (and wipe
    // user-entered fields) on every amount/type keystroke.
  }, [show, deduction, defaultServicePartnerId]);

  useEffect(() => {
    if (!show || isEdit) return;
    setReferenceNumber(generatedReferenceNumber);
  }, [show, isEdit, generatedReferenceNumber]);

  const servicePartnerItems: SelectItem[] = servicePartners.map((sp) => ({
    value: String(sp.servicePartnerId),
    label: sp.partnerName,
  }));

  const canSave = isDailyServiceCharge
    ? !saving &&
      !isLoadingSpInvoices &&
      !!selectedSp &&
      dailyServiceChargeQuantity > 0 &&
      dailyServiceChargeRate > 0
    : !saving &&
      !!selectedSpId &&
      !Number.isNaN(selectedAmountValue) &&
      selectedAmountValue > 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isDailyServiceCharge && !isEdit) {
        if (!selectedSp) throw new Error("Select a service partner");
        if (dailyServiceChargeQuantity <= 0) {
          throw new Error("No operations found for this service partner in the selected period");
        }

        await createServicePartnerDeduction({
          reference_number: formatDeductionReference({ service_partner_deduction_id: nextDeductionId }),
          description: dailyServiceChargeDescription,
          deduction_amount: dailyServiceChargeAmount,
          reimbursements_amount: 0,
          incident_date: incidentDate || undefined,
          entry_date: entryDate || undefined,
          company_id: selectedSp.companyId,
          service_partner_id: selectedSp.servicePartnerId,
        });

        await createServicePartnerDeduction({
          reference_number: formatDeductionReference({ service_partner_deduction_id: nextDeductionId + 1 }),
          description: congestionReimbursementDescription,
          deduction_amount: 0,
          reimbursements_amount: congestionReimbursementAmount,
          incident_date: incidentDate || undefined,
          entry_date: entryDate || undefined,
          company_id: selectedSp.companyId,
          service_partner_id: selectedSp.servicePartnerId,
        });

        onSuccess();
        onClose();
        return;
      }

      if (Number.isNaN(selectedAmountValue) || selectedAmountValue <= 0) {
        throw new Error("Enter an amount greater than zero");
      }

      const payloadDeductionAmount = amountType === "deduction" ? selectedAmountValue : 0;
      const payloadReimbursementAmount = amountType === "reimbursement" ? selectedAmountValue : 0;

      if (isEdit && deduction) {
        await updateServicePartnerDeduction(deduction.service_partner_deduction_id, {
          reference_number: referenceNumber.trim() || undefined,
          description: description.trim() || undefined,
          deduction_amount: payloadDeductionAmount,
          reimbursements_amount: payloadReimbursementAmount,
          incident_date: incidentDate || undefined,
          entry_date: entryDate || undefined,
        });
      } else {
        const sp = servicePartners.find((s) => String(s.servicePartnerId) === selectedSpId);
        if (!sp) throw new Error("Select a service partner");
        await createServicePartnerDeduction({
          reference_number: generatedReferenceNumber,
          description: description.trim() || undefined,
          deduction_amount: payloadDeductionAmount,
          reimbursements_amount: payloadReimbursementAmount,
          incident_date: incidentDate || undefined,
          entry_date: entryDate || undefined,
          company_id: sp.companyId,
          service_partner_id: sp.servicePartnerId,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save deduction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LightModal show={show} onClose={onClose} title={isEdit ? "Edit Deduction" : "Add Deduction"}>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Service Partner
          </p>
          <SearchableSelect
            items={servicePartnerItems}
            value={selectedSpId}
            onValueChange={setSelectedSpId}
            placeholder="Select a service partner…"
            disabled={isEdit}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Amount Type
            </p>
            <div className={`grid gap-2 ${isEdit ? "grid-cols-2" : "grid-cols-3"}`}>
              <button
                type="button"
                onClick={() => setAmountType("deduction")}
                className={`h-10 rounded-lg border text-sm font-semibold transition ${amountType === "deduction" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                Deduction
              </button>
              <button
                type="button"
                onClick={() => setAmountType("reimbursement")}
                className={`h-10 rounded-lg border text-sm font-semibold transition ${amountType === "reimbursement" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                Reimbursement
              </button>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => setAmountType("daily-service-charge")}
                  className={`h-10 rounded-lg border text-sm font-semibold transition ${amountType === "daily-service-charge" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  Daily ServiceCharge
                </button>
              )}
            </div>
          </div>

          {isDailyServiceCharge ? (
            <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
              {!selectedSp ? (
                <p className="text-sm text-gray-500">Select a service partner to calculate this charge.</p>
              ) : isLoadingSpInvoices ? (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Calculating operations for the period…
                </p>
              ) : dailyServiceChargeQuantity === 0 ? (
                <p className="text-sm text-amber-700">
                  No operations found for {selectedSp.partnerName} in the selected period.
                </p>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily ServiceCharge</span>
                    <span className="font-semibold text-gray-800">
                      {dailyServiceChargeDescription} = {formatGbp(dailyServiceChargeAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Congestion Charge Reimbursement (auto)</span>
                    <span className="font-semibold text-emerald-700">
                      {congestionReimbursementDescription} = {formatGbp(congestionReimbursementAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : amountType === "deduction" ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Deduction Amount
              </p>
              <input
                type="number"
                step="0.01"
                min="0"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(e.target.value)}
                className={inputClassName}
                placeholder="0.00"
              />
            </div>
          ) : (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Reimbursement Amount
              </p>
              <input
                type="number"
                step="0.01"
                min="0"
                value={reimbursementsAmount}
                onChange={(e) => setReimbursementsAmount(e.target.value)}
                className={inputClassName}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {!isDailyServiceCharge && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Reference Number
            </p>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className={inputClassName}
              readOnly={!isEdit}
              disabled={!isEdit}
            />
          </div>
        )}

        {!isDailyServiceCharge && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Description
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Incident Date
            </p>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Entry Date
            </p>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDailyServiceCharge
                ? "bg-purple-600 hover:bg-purple-700"
                : amountType === "deduction"
                  ? "bg-blue-900 hover:bg-blue-800"
                  : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving
              ? "Saving…"
              : isEdit
                ? "Save Changes"
                : isDailyServiceCharge
                  ? "Add Daily ServiceCharge + Reimbursement"
                  : amountType === "deduction"
                    ? "Add Deduction"
                    : "Add Reimbursement"}
          </button>
        </div>
      </div>
    </LightModal>
  );
}
