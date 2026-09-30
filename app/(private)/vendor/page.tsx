"use client";

import { useMemo, useState } from "react";
import NavbarWrapper from "../components/NavbarWrapper";
import ToastProvider, { useToast } from "../components/Toast";
import "./styles.css";
import VendorLoading from "./components/VendorLoading";
import VendorFilters from "./components/VendorFilters";
import VendorTable from "./components/VendorTable";
import Pagination from "./components/Pagination";
import VendorInfoModal from "./components/VendorInfoModal";
import VendorFormModal from "./components/VendorFormModal";
import { PAGE_SIZES } from "./constants";
import { useVendorPageData } from "./hooks/useVendorPageData";
import { saveVendor } from "@/lib/vendor-api";
import { isVendorActive, isVendorExpiringSoon90, isVendorPending } from "./utils/vendorHelpers";
import type { VendorFilterState, VendorModel } from "./types";

function VendorDashboard() {
  const { data, isLoading, isError } = useVendorPageData();
  const { showToast } = useToast();

  const [vendors, setVendors] = useState<VendorModel[] | null>(null);
  const [filter, setFilter] = useState<VendorFilterState>({ search: "", status: "all", vendorTypeId: "all", servicePartnerId: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [formModal, setFormModal] = useState<{ mode: "add" | "edit"; vendor: VendorModel | null } | null>(null);
  const [infoModal, setInfoModal] = useState<{ vendor: VendorModel; type: "training" | "documents" } | null>(null);

  const list = useMemo(() => vendors ?? data?.vendors ?? [], [vendors, data]);

  const filtered = useMemo(() => {
    return list.filter((vendor) => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const route = data?.routes.find((r) => r.id === vendor.routeId);
        const haystack = [
          `${vendor.firstName} ${vendor.lastName}`, vendor.email, vendor.supplierId, vendor.depotId, route?.name ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filter.vendorTypeId !== "all" && vendor.vendorTypeId !== filter.vendorTypeId) return false;
      if (filter.servicePartnerId && vendor.servicePartnerId !== filter.servicePartnerId) return false;
      if (filter.status !== "all") {
        const active = isVendorActive(vendor);
        if (filter.status === "active" && !active) return false;
        if (filter.status === "inactive" && active) return false;
        if (filter.status === "pending" && !isVendorPending(vendor)) return false;
        if (filter.status === "expiring" && (!isVendorExpiringSoon90(vendor) || !active)) return false;
      }
      return true;
    });
  }, [list, filter, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const kpis = useMemo(() => {
    let active = 0, inactive = 0, pending = 0;
    for (const v of filtered) {
      if (isVendorActive(v)) active++; else inactive++;
      if (isVendorPending(v)) pending++;
    }
    return { total: filtered.length, active, inactive, pending };
  }, [filtered]);

  function updateFilter(next: VendorFilterState) {
    setFilter(next);
    setPage(1);
  }

  async function handleSave(formData: Partial<VendorModel>) {
    if (formModal?.mode === "add" && formData.email && list.some((v) => v.email.toLowerCase() === formData.email?.toLowerCase())) {
      showToast("This email is already registered. Please use another email.");
      return;
    }
    const saved = await saveVendor(formData);
    setVendors((prev) => {
      const base = prev ?? data?.vendors ?? [];
      const exists = base.some((v) => v.id === saved.id);
      return exists ? base.map((v) => (v.id === saved.id ? saved : v)) : [...base, saved];
    });
    showToast(formModal?.mode === "add" ? "Vendor created (prototype — nothing was saved)." : "Vendor updated (prototype — nothing was saved).");
    setFormModal(null);
  }

  if (isError) {
    return <div className="vendor-page"><div className="v-wrap">Could not load vendors (prototype fetch failure).</div></div>;
  }

  if (isLoading || !data) {
    return <div className="vendor-page"><VendorLoading /></div>;
  }

  return (
    <div className="vendor-page">
      <div className="v-wrap">
        <div className="v-hero">
          <div>
            <h1 className="v-title">Vendors</h1>
            <p className="v-sub">Vendor management and information · Prototype · sample data</p>
          </div>
          <div className="v-kpis">
            <div className="v-kpi"><span className="v-kpi-lbl">Total</span><span className="v-kpi-val">{kpis.total}</span></div>
            <div className="v-kpi"><span className="v-kpi-lbl">Active</span><span className="v-kpi-val">{kpis.active}</span></div>
            <div className="v-kpi"><span className="v-kpi-lbl">Inactive</span><span className="v-kpi-val">{kpis.inactive}</span></div>
            <div className="v-kpi"><span className="v-kpi-lbl">Pending</span><span className="v-kpi-val">{kpis.pending}</span></div>
          </div>
        </div>

        <VendorFilters
          filter={filter}
          onFilterChange={updateFilter}
          onNewClick={() => setFormModal({ mode: "add", vendor: null })}
          vendorTypes={data.vendorTypes}
          servicePartners={data.servicePartners}
        />

        <VendorTable
          vendors={paginated}
          vendorTypes={data.vendorTypes}
          costModelTypes={data.costModelTypes}
          servicePartners={data.servicePartners}
          onEdit={(vendor) => setFormModal({ mode: "edit", vendor })}
          onShowTraining={(vendor) => setInfoModal({ vendor, type: "training" })}
          onShowDocuments={(vendor) => setInfoModal({ vendor, type: "documents" })}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={pageSize}
          onPageChange={setPage}
          onItemsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>

      {formModal && (
        <VendorFormModal
          mode={formModal.mode}
          vendor={formModal.vendor}
          data={{ ...data, vendors: list }}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}

      {infoModal && (
        <VendorInfoModal vendor={infoModal.vendor} type={infoModal.type} onClose={() => setInfoModal(null)} />
      )}
    </div>
  );
}

export default function VendorPage() {
  return (
    <NavbarWrapper>
      <ToastProvider>
        <VendorDashboard />
      </ToastProvider>
    </NavbarWrapper>
  );
}
