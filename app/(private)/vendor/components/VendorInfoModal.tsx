"use client";

import Modal from "../../components/Modal";
import { formatDateForDisplay, getTrainingExpiryDate, isExpired, isExpiringSoon } from "../utils/vendorHelpers";
import type { VendorModel } from "../types";

type InfoType = "training" | "documents";

function trainingItems(vendor: VendorModel) {
  const item = (label: string, completed: boolean, completedDate: string | null) => {
    const expiry = getTrainingExpiryDate(completedDate);
    let tone = completed ? "active" : "pending";
    if (expiry && isExpired(expiry)) tone = "expired";
    else if (expiry && isExpiringSoon(expiry)) tone = "expiring";
    let detail = completedDate ? `Date: ${formatDateForDisplay(completedDate)}` : null;
    if (expiry) detail = detail ? `${detail} · Expires: ${formatDateForDisplay(expiry)}` : `Expires: ${formatDateForDisplay(expiry)}`;
    return { label, value: completed ? "Completed" : "Pending", tone, detail };
  };
  return [
    item("Cargo Training", vendor.cargoTraining, vendor.cargoTrainingDate),
    item("Dangerous Goods Training", vendor.dangerousGoodsTraining, vendor.dangerousGoodsTrainingDate),
    item("Manual Handling Training", vendor.manualHandlingTraining, vendor.manualHandlingTrainingDate),
    { label: "DHL Training Number", value: vendor.dhlTrainingNumber || "N/A", tone: null, detail: null },
  ];
}

function documentItems(vendor: VendorModel) {
  const expiryItem = (label: string, expiryDate: string | null) => {
    let tone: string | null = null;
    if (expiryDate && isExpired(expiryDate)) tone = "expired";
    else if (expiryDate && isExpiringSoon(expiryDate)) tone = "expiring";
    else if (expiryDate) tone = "verified";
    else tone = "pending";
    return { label, value: expiryDate ? formatDateForDisplay(expiryDate) : "N/A", tone, detail: null };
  };
  return [
    { label: "Criminal Record Check", value: vendor.criminalRecordDate ? formatDateForDisplay(vendor.criminalRecordDate) : "Pending", tone: vendor.criminalRecordDate ? "verified" : "pending", detail: null },
    { label: "DVLA Check", value: vendor.dvlaCheckDate ? formatDateForDisplay(vendor.dvlaCheckDate) : "Pending", tone: vendor.dvlaCheckDate ? "verified" : "pending", detail: null },
    expiryItem("Visa Validity", vendor.visaValidity),
    expiryItem("Driving Licence Expiry", vendor.licenceExpiringDate),
    expiryItem("Passport Expiry", vendor.passportExpiringDate),
  ];
}

export default function VendorInfoModal({ vendor, type, onClose }: { vendor: VendorModel; type: InfoType; onClose: () => void }) {
  const items = type === "training" ? trainingItems(vendor) : documentItems(vendor);

  return (
    <Modal
      title={type === "training" ? "Training Details" : "Documents Details"}
      onClose={onClose}
      classes={{ overlay: "v-scrim", panel: "v-dlg", header: "v-dlghd", body: "v-dlgbody", footer: "v-dlgft", close: "v-xbtn" }}
    >
      <p className="v-infohead">{vendor.firstName} {vendor.lastName} · {vendor.email || "N/A"}</p>
      {items.map((item) => (
        <div className="v-inforow" key={item.label}>
          <div>
            <span className="v-infolbl">{item.label}</span>
            {item.detail && <span className="v-infodetail">{item.detail}</span>}
          </div>
          {item.tone ? <span className={`v-badge ${item.tone}`}>{item.value}</span> : <span className="v-infoval">{item.value}</span>}
        </div>
      ))}
    </Modal>
  );
}
