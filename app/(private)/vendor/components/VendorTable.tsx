"use client";

import { useMemo, useState, type ReactNode } from "react";
import { formatDateForDisplay, getDocumentsBadge, getTrainingBadge, isVendorActive } from "../utils/vendorHelpers";
import type { OptionModel, VendorModel } from "../types";

type SortField = "name" | "vendorType" | "paymentModel" | "status" | "startDate" | "training" | "documents";

function Badge({ badge }: { badge: { tone: string; label: string } }) {
  return <span className={`v-badge ${badge.tone}`}>{badge.label}</span>;
}

export default function VendorTable({
  vendors,
  vendorTypes,
  costModelTypes,
  servicePartners,
  onEdit,
  onShowTraining,
  onShowDocuments,
}: {
  vendors: VendorModel[];
  vendorTypes: OptionModel[];
  costModelTypes: OptionModel[];
  servicePartners: OptionModel[];
  onEdit: (vendor: VendorModel) => void;
  onShowTraining: (vendor: VendorModel) => void;
  onShowDocuments: (vendor: VendorModel) => void;
}) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const vendorTypeMap = useMemo(() => new Map(vendorTypes.map((v) => [v.id, v.name])), [vendorTypes]);
  const costModelMap = useMemo(() => new Map(costModelTypes.map((c) => [c.id, c.name])), [costModelTypes]);
  const servicePartnerMap = useMemo(() => new Map(servicePartners.map((s) => [s.id, s.name])), [servicePartners]);

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const sorted = useMemo(() => {
    if (!sortField) return vendors;
    const value = (v: VendorModel): string | number => {
      switch (sortField) {
        case "name": return `${v.firstName} ${v.lastName}`.toLowerCase();
        case "vendorType": return vendorTypeMap.get(v.vendorTypeId) ?? "";
        case "paymentModel": return costModelMap.get(v.paymentModelId) ?? "";
        case "status": return isVendorActive(v) ? 0 : 1;
        case "startDate": return v.startDate ? new Date(v.startDate).getTime() : 0;
        case "training": return getTrainingBadge(v).label;
        case "documents": return getDocumentsBadge(v).label;
        default: return "";
      }
    };
    return [...vendors].sort((a, b) => {
      const av = value(a), bv = value(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [vendors, sortField, sortDir, vendorTypeMap, costModelMap]);

  function SortHeader({ field, children }: { field: SortField; children: ReactNode }) {
    return (
      <th onClick={() => handleSort(field)} title={`Sort by ${children}`}>
        {children}
        {sortField === field && <span className="v-arrow">{sortDir === "asc" ? "▾" : "▴"}</span>}
      </th>
    );
  }

  return (
    <div className="v-tablewrap">
      <table className="v-table">
        <thead>
          <tr>
            <SortHeader field="name">Name</SortHeader>
            <SortHeader field="vendorType">Vendor Type</SortHeader>
            <SortHeader field="paymentModel">Payment Model</SortHeader>
            <SortHeader field="status">Status</SortHeader>
            <SortHeader field="startDate">Start Date</SortHeader>
            <SortHeader field="training">Training</SortHeader>
            <SortHeader field="documents">Documents</SortHeader>
            <th className="v-nosort">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={8} className="v-emptyrow">No vendors match the current filters.</td></tr>
          ) : (
            sorted.map((vendor) => {
              const servicePartnerName = vendor.servicePartnerId ? servicePartnerMap.get(vendor.servicePartnerId) : null;
              return (
                <tr key={vendor.id}>
                  <td>
                    <div className="v-namecell">
                      <span>
                        <b>{vendor.firstName} {vendor.lastName}</b>
                        {servicePartnerName && <span className="v-sp-badge">{servicePartnerName}</span>}
                      </span>
                      <small>{vendor.email || "N/A"}</small>
                    </div>
                  </td>
                  <td>{vendorTypeMap.get(vendor.vendorTypeId) ?? "—"}</td>
                  <td>{costModelMap.get(vendor.paymentModelId) ?? "—"}</td>
                  <td><Badge badge={isVendorActive(vendor) ? { tone: "active", label: "Active" } : { tone: "inactive", label: "Inactive" }} /></td>
                  <td>{vendor.startDate ? formatDateForDisplay(vendor.startDate) : "—"}</td>
                  <td>
                    <button type="button" className="v-badgebtn" onClick={() => onShowTraining(vendor)}>
                      <Badge badge={getTrainingBadge(vendor)} />
                    </button>
                  </td>
                  <td>
                    <button type="button" className="v-badgebtn" onClick={() => onShowDocuments(vendor)}>
                      <Badge badge={getDocumentsBadge(vendor)} />
                    </button>
                  </td>
                  <td>
                    <button type="button" className="v-editbtn" title="Edit" aria-label="Edit vendor" onClick={() => onEdit(vendor)}>✎</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
