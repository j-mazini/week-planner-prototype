"use client";

import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServicePartners } from "@/hooks/useServicePartners";
import { useServicePartnerInvoicesTable } from "@/hooks/useServicePartnerInvoicesTable";
import { useServicePartnerDeductions } from "@/hooks/useServicePartnerDeductions";
import { useAuth } from "@/hooks/useAuth";
import { ServicePartnerMonthView } from "./components/ServicePartnerMonthView";
import { GenerateInvoiceModal } from "./components/GenerateInvoiceModal";
import { DeductionsTabView } from "./components/DeductionsTabView";
import { DeductionFormModal } from "./components/DeductionFormModal";
import { DeleteDeductionModal } from "./components/DeleteDeductionModal";
import { monthYearLabel } from "./utils/format";
import type { ServicePartnerDeductionDTO } from "@/lib/service-partner-deductions-api";
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { UserCard } from "@/components/user-card";
import { Plus } from "lucide-react";

export default function ServicePartnerInvoicesPage() {
  const queryClient = useQueryClient();
  const { servicePartnerItems, servicePartners, loading: spLoading } = useServicePartners();
  const [selectedSpId, setSelectedSpId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "deductions">("invoices");
  const [deductionModalOpen, setDeductionModalOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<ServicePartnerDeductionDTO | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDeduction, setDeletingDeduction] = useState<ServicePartnerDeductionDTO | null>(null);

  const { user } = useAuth();
  const canManageDeductions = user?.userTypeId !== BUSINESS_RULES.USER_TYPE.SERVICE_PARTNER;

  const month = selectedMonth.getMonth() + 1;
  const year = selectedMonth.getFullYear();
  const servicePartnerId = selectedSpId ? Number(selectedSpId) : undefined;

  const { data: invoices = [], isLoading, isError, error } = useServicePartnerInvoicesTable({
    month,
    year,
    servicePartnerId,
  });

  const {
    data: deductions = [],
    isLoading: deductionsLoading,
    isError: deductionsError,
    error: deductionsErrorObj,
  } = useServicePartnerDeductions({ month, year, servicePartnerId });

  // Client-side filter as a reliable fallback: covers cases where the API returns
  // all service partners regardless of the servicePartnerId query param.
  const filteredInvoices = useMemo(() => {
    if (!servicePartnerId) return invoices;
    return invoices.filter((inv) => inv.servicePartnerId === servicePartnerId);
  }, [invoices, servicePartnerId]);

  const monthLabel = useMemo(() => monthYearLabel(month, year), [month, year]);

  const changeMonth = (delta: number) => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleGenerateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["service-partner-invoices-table"] });
  };

  const handleAddDeduction = () => {
    setEditingDeduction(null);
    setDeductionModalOpen(true);
  };

  const handleEditDeduction = (deduction: ServicePartnerDeductionDTO) => {
    if (deduction.service_partner_invoice_id) return;
    setEditingDeduction(deduction);
    setDeductionModalOpen(true);
  };

  const handleDeductionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["service-partner-deductions"] });
  };

  const handleDeleteDeduction = (deduction: ServicePartnerDeductionDTO) => {
    if (deduction.service_partner_invoice_id) return;
    setDeletingDeduction(deduction);
    setDeleteModalOpen(true);
  };

  return (
    <NavbarWrapper>
      <div className="w-full min-w-0 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50">
        <DgpPageFrame
          maxWidthClassName="w-full max-w-5xl"
          className="font-sans text-slate-800 text-sm"
        >
          <div className="space-y-6 py-6">
            {/* Header with Glassmorphism */}
            <div className="backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Service Partner Invoices</h1>
                  <p className="text-sm text-gray-600 mt-1">Monthly invoice summary by service partner.</p>
                </div>
                <UserCard />
              </div>
            </div>

            {/* Filters (shared by both tabs) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-64">
                <SearchableSelect
                  items={servicePartnerItems}
                  value={selectedSpId}
                  onValueChange={setSelectedSpId}
                  placeholder={spLoading ? "Loading service partners..." : "All Service Partners"}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <span className="flex h-9 min-w-[160px] items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-3 text-center font-semibold text-slate-700">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "invoices" | "deductions")}>
              <div className="rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 shadow-md">
                <TabsList className="h-auto gap-0 rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="invoices"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 data-[state=active]:border-blue-900 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 data-[state=active]:shadow-none"
                  >
                    Invoices
                  </TabsTrigger>
                  <TabsTrigger
                    value="deductions"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 data-[state=active]:border-blue-900 data-[state=active]:bg-transparent data-[state=active]:text-blue-900 data-[state=active]:shadow-none"
                  >
                    Deductions & Reimbursements
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="invoices" className="space-y-6 pt-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSingleModal(true)}
                    className="rounded-lg border border-blue-900 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
                  >
                    Single Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMultiModal(true)}
                    className="rounded-lg border border-blue-900 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
                  >
                    Multi Invoice
                  </button>
                </div>

                {isLoading ? (
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-400">
                    Loading invoices…
                  </div>
                ) : isError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-600">
                    {error instanceof Error ? error.message : "Failed to load invoices."}
                  </div>
                ) : (
                  <ServicePartnerMonthView invoices={filteredInvoices} servicePartners={servicePartners} />
                )}
              </TabsContent>

              <TabsContent value="deductions" className="space-y-6 pt-4">
                {canManageDeductions && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleAddDeduction}
                      className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      Add New
                    </button>
                  </div>
                )}

                <DeductionsTabView
                  deductions={deductions}
                  isLoading={deductionsLoading}
                  isError={deductionsError}
                  error={deductionsErrorObj}
                  canManage={canManageDeductions}
                  onEdit={handleEditDeduction}
                  onDelete={handleDeleteDeduction}
                />
              </TabsContent>
            </Tabs>
          </div>
        </DgpPageFrame>
      </div>
      <GenerateInvoiceModal
        show={showSingleModal}
        mode="single"
        onClose={() => setShowSingleModal(false)}
        onSuccess={handleGenerateSuccess}
      />
      <GenerateInvoiceModal
        show={showMultiModal}
        mode="multi"
        onClose={() => setShowMultiModal(false)}
        onSuccess={handleGenerateSuccess}
      />
      <DeductionFormModal
        show={deductionModalOpen}
        deduction={editingDeduction}
        deductions={deductions}
        servicePartners={servicePartners}
        defaultServicePartnerId={servicePartnerId}
        month={month}
        year={year}
        onClose={() => setDeductionModalOpen(false)}
        onSuccess={handleDeductionSuccess}
      />
      <DeleteDeductionModal
        show={deleteModalOpen}
        deduction={deletingDeduction}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeductionSuccess}
      />
    </NavbarWrapper>
  );
}
