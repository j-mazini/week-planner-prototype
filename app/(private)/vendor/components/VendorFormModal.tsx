"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import ActionButton from "../../components/ActionButton";
import { FORM_STEPS, IMMIGRATION_STATUSES, type FormStep } from "../constants";
import type { VendorModel, VendorPageDataModel } from "../types";

function generateSupplierId(firstName: string, lastName: string, vendors: VendorModel[]): string {
  if (!firstName || !lastName) return "";
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
  const matching = vendors.filter((v) => v.supplierId.startsWith(`${initials}-`));
  const numbers = matching.map((v) => Number(v.supplierId.split("-")[1])).filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : vendors.length + 1;
  return `${initials}-${String(next).padStart(2, "0")}`;
}

function emptyRate() {
  return {
    band1Stops: null, band1Rate: null, band2Stops: null, band2Rate: null,
    stopRate: null, dayRate: null, hourlyRate: null,
    validityStartDate: null as string | null, validityEndDate: null as string | null,
  };
}

function blankVendor(): Partial<VendorModel> {
  return {
    status: "Active",
    immigrationStatus: "Citizen",
    rate: emptyRate(),
    cargoTraining: false,
    dangerousGoodsTraining: false,
    manualHandlingTraining: false,
  };
}

export default function VendorFormModal({
  mode,
  vendor,
  data,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  vendor: VendorModel | null;
  data: VendorPageDataModel;
  onClose: () => void;
  onSave: (formData: Partial<VendorModel>) => void;
}) {
  const [step, setStep] = useState<FormStep>("personal");
  const [formData, setFormData] = useState<Partial<VendorModel>>(vendor ?? blankVendor());

  useEffect(() => {
    setFormData(vendor ?? blankVendor());
    setStep("personal");
  }, [vendor]);

  function set<K extends keyof VendorModel>(key: K, value: VendorModel[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setRate<K extends keyof NonNullable<VendorModel["rate"]>>(key: K, value: NonNullable<VendorModel["rate"]>[K]) {
    setFormData((prev) => ({ ...prev, rate: { ...(prev.rate ?? emptyRate()), [key]: value } }));
  }

  useEffect(() => {
    if (mode === "add" && formData.firstName && formData.lastName && !vendor) {
      const generated = generateSupplierId(formData.firstName, formData.lastName, data.vendors);
      if (generated !== formData.supplierId) set("supplierId", generated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.firstName, formData.lastName]);

  const stepIndex = FORM_STEPS.findIndex((s) => s.id === step);
  const paymentModel = data.costModelTypes.find((c) => c.id === formData.paymentModelId);
  const rate = formData.rate ?? emptyRate();

  function handleSubmit() {
    onSave({
      ...formData,
      cargoTraining: !!formData.cargoTrainingDate,
      dangerousGoodsTraining: !!formData.dangerousGoodsTrainingDate,
      manualHandlingTraining: !!formData.manualHandlingTrainingDate,
    });
  }

  return (
    <Modal
      title={mode === "add" ? "New Vendor" : "Edit Vendor"}
      onClose={onClose}
      classes={{ overlay: "v-scrim", panel: "v-dlg wide", header: "v-dlghd", body: "v-dlgbody", footer: "v-dlgft", close: "v-xbtn" }}
      footer={
        <>
          <div>
            {stepIndex > 0 && (
              <ActionButton className="v-ghost" onClick={() => setStep(FORM_STEPS[stepIndex - 1].id)}>← Previous</ActionButton>
            )}
          </div>
          <div className="v-dlgft-right">
            {mode === "edit" && <ActionButton className="v-ghost" onClick={handleSubmit}>Save</ActionButton>}
            {stepIndex < FORM_STEPS.length - 1 ? (
              <ActionButton className="v-primary" onClick={() => setStep(FORM_STEPS[stepIndex + 1].id)}>Next →</ActionButton>
            ) : (
              <ActionButton className="v-primary" onClick={handleSubmit}>{mode === "add" ? "Create Vendor" : "Save Vendor"}</ActionButton>
            )}
          </div>
        </>
      }
    >
      <div className="v-steps">
        {FORM_STEPS.map((s, i) => (
          <button key={s.id} type="button" className="v-step" aria-pressed={step === s.id} onClick={() => setStep(s.id)}>
            <span className="v-stepnum">{i + 1}</span>{s.label}
          </button>
        ))}
      </div>

      {step === "personal" && (
        <div className="v-formgrid">
          <div className="v-field"><label>Vendor ID</label><input className="v-ctl" value={formData.supplierId || ""} disabled /></div>
          <div className="v-field">
            <label>Depot *</label>
            <select className="v-ctl" value={formData.depotId || ""} onChange={(e) => set("depotId", e.target.value)}>
              <option value="">Select a depot</option>
              {data.deposits.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="v-field"><label>First Name *</label><input className="v-ctl" value={formData.firstName || ""} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div className="v-field"><label>Last Name *</label><input className="v-ctl" value={formData.lastName || ""} onChange={(e) => set("lastName", e.target.value)} /></div>
          <div className="v-field"><label>Email *</label><input type="email" className="v-ctl" value={formData.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="v-field"><label>Phone *</label><input type="tel" className="v-ctl" value={formData.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="+44 7700 900000" /></div>
          <div className="v-field"><label>Date of Birth *</label><input type="date" className="v-ctl" value={formData.dob || ""} onChange={(e) => set("dob", e.target.value)} /></div>
          <div className="v-field">
            <label>Vendor Type *</label>
            <select className="v-ctl" value={formData.vendorTypeId || ""} onChange={(e) => set("vendorTypeId", e.target.value)}>
              <option value="">Select a vendor type</option>
              {data.vendorTypes.filter((vt) => vt.name.toUpperCase() !== "OFF").map((vt) => <option key={vt.id} value={vt.id}>{vt.name}</option>)}
            </select>
          </div>
          <div className="v-field">
            <label>User Type{mode === "add" ? " *" : ""}</label>
            <select className="v-ctl" value={formData.userTypeId || ""} onChange={(e) => set("userTypeId", e.target.value)}>
              <option value="">Select a user type</option>
              {data.userTypes.map((ut) => <option key={ut.id} value={ut.id}>{ut.name}</option>)}
            </select>
          </div>
          <div className="v-field">
            <label>Service Partner</label>
            <select className="v-ctl" value={formData.servicePartnerId || ""} onChange={(e) => set("servicePartnerId", e.target.value)}>
              <option value="">Select a service partner</option>
              {data.servicePartners.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
          <div className="v-field"><label>VAT</label><input className="v-ctl" value={formData.vat || ""} onChange={(e) => set("vat", e.target.value)} /></div>
        </div>
      )}

      {step === "address" && (
        <div className="v-formgrid">
          <div className="v-field v-span2"><label>Street</label><input className="v-ctl" value={formData.street || ""} onChange={(e) => set("street", e.target.value)} /></div>
          <div className="v-field"><label>City</label><input className="v-ctl" value={formData.city || ""} onChange={(e) => set("city", e.target.value)} /></div>
          <div className="v-field"><label>Postal Code</label><input className="v-ctl" value={formData.postalCode || ""} onChange={(e) => set("postalCode", e.target.value)} /></div>
        </div>
      )}

      {step === "employment" && (
        <div className="v-formgrid">
          <div className="v-field"><label>Start Date *</label><input type="date" className="v-ctl" value={formData.startDate || ""} onChange={(e) => set("startDate", e.target.value)} /></div>
          <div className="v-field"><label>Finish Date</label><input type="date" className="v-ctl" value={formData.finishDate || ""} onChange={(e) => set("finishDate", e.target.value)} /></div>
          {mode === "edit" && (
            <div className="v-field">
              <label>Status</label>
              <select className="v-ctl" value={formData.status || "Active"} onChange={(e) => set("status", e.target.value as VendorModel["status"])}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
          <div className="v-field">
            <label>Route *</label>
            <select className="v-ctl" value={formData.routeId || ""} onChange={(e) => set("routeId", e.target.value)}>
              <option value="">Select a route</option>
              {data.routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="v-field"><label>Sort</label><input className="v-ctl" value={formData.routeSortValue || ""} onChange={(e) => set("routeSortValue", e.target.value)} /></div>
          <div className="v-field">
            <label>Vehicle Registration *</label>
            <select className="v-ctl" value={formData.vehicleId || ""} onChange={(e) => set("vehicleId", e.target.value)}>
              <option value="">Select a vehicle</option>
              {data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.manufacturer}</option>)}
            </select>
          </div>
        </div>
      )}

      {step === "cost" && (
        <div className="v-formgrid">
          <div className="v-field v-span2">
            <label>Payment Model *</label>
            <select className="v-ctl" value={formData.paymentModelId || ""} onChange={(e) => set("paymentModelId", e.target.value)}>
              <option value="">Select Payment Model</option>
              {data.costModelTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {paymentModel && (
            <div className="v-ratebox">
              <span className="v-ratebox-hd">Current rate — {paymentModel.name}</span>
              <div className="v-formgrid v-cols3">
                {paymentModel.kind === "band" && (
                  <>
                    <div className="v-field"><label>Band 1 Max Stops</label><input className="v-ctl" value={rate.band1Stops ?? ""} onChange={(e) => setRate("band1Stops", e.target.value ? Number(e.target.value) : null)} /></div>
                    <div className="v-field"><label>Band 1 Rate (£)</label><input className="v-ctl" value={rate.band1Rate ?? ""} onChange={(e) => setRate("band1Rate", e.target.value ? Number(e.target.value) : null)} /></div>
                    <div className="v-field"><label>Band 2 Rate (£)</label><input className="v-ctl" value={rate.band2Rate ?? ""} onChange={(e) => setRate("band2Rate", e.target.value ? Number(e.target.value) : null)} /></div>
                  </>
                )}
                {paymentModel.kind === "perStop" && (
                  <div className="v-field"><label>Rate per stop (£)</label><input className="v-ctl" value={rate.stopRate ?? ""} onChange={(e) => setRate("stopRate", e.target.value ? Number(e.target.value) : null)} /></div>
                )}
                {paymentModel.kind === "perDay" && (
                  <div className="v-field"><label>Rate per day (£)</label><input className="v-ctl" value={rate.dayRate ?? ""} onChange={(e) => setRate("dayRate", e.target.value ? Number(e.target.value) : null)} /></div>
                )}
                {paymentModel.kind === "perHour" && (
                  <div className="v-field"><label>Rate per hour (£)</label><input className="v-ctl" value={rate.hourlyRate ?? ""} onChange={(e) => setRate("hourlyRate", e.target.value ? Number(e.target.value) : null)} /></div>
                )}
                <div className="v-field"><label>Validity Start Date</label><input type="date" className="v-ctl" value={rate.validityStartDate || ""} onChange={(e) => setRate("validityStartDate", e.target.value)} /></div>
                <div className="v-field"><label>Validity End Date</label><input type="date" className="v-ctl" value={rate.validityEndDate || ""} onChange={(e) => setRate("validityEndDate", e.target.value)} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "training" && (
        <div className="v-formgrid v-cols3">
          <div className="v-field"><label>Cargo Operative Training (CO+T)</label><input type="date" className="v-ctl" value={formData.cargoTrainingDate || ""} onChange={(e) => set("cargoTrainingDate", e.target.value)} /></div>
          <div className="v-field"><label>Dangerous Goods Awareness</label><input type="date" className="v-ctl" value={formData.dangerousGoodsTrainingDate || ""} onChange={(e) => set("dangerousGoodsTrainingDate", e.target.value)} /></div>
          <div className="v-field"><label>Manual Handling Training</label><input type="date" className="v-ctl" value={formData.manualHandlingTrainingDate || ""} onChange={(e) => set("manualHandlingTrainingDate", e.target.value)} /></div>
          <div className="v-field v-span2"><label>DHL Training Number</label><input className="v-ctl" value={formData.dhlTrainingNumber || ""} onChange={(e) => set("dhlTrainingNumber", e.target.value)} /></div>
        </div>
      )}

      {step === "compliance" && (
        <div className="v-formgrid v-cols3">
          <div className="v-field"><label>Criminal Record Date</label><input type="date" className="v-ctl" value={formData.criminalRecordDate || ""} onChange={(e) => set("criminalRecordDate", e.target.value)} /></div>
          <div className="v-field"><label>DVLA Check Date</label><input type="date" className="v-ctl" value={formData.dvlaCheckDate || ""} onChange={(e) => set("dvlaCheckDate", e.target.value)} /></div>
          <div className="v-field">
            <label>Immigration Status</label>
            <select className="v-ctl" value={formData.immigrationStatus || "Citizen"} onChange={(e) => set("immigrationStatus", e.target.value)}>
              {IMMIGRATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="v-field"><label>Visa Validity</label><input type="date" className="v-ctl" value={formData.visaValidity || ""} onChange={(e) => set("visaValidity", e.target.value)} /></div>
          <div className="v-field"><label>Driving Licence Expiring</label><input type="date" className="v-ctl" value={formData.licenceExpiringDate || ""} onChange={(e) => set("licenceExpiringDate", e.target.value)} /></div>
          <div className="v-field"><label>Passport Expiring</label><input type="date" className="v-ctl" value={formData.passportExpiringDate || ""} onChange={(e) => set("passportExpiringDate", e.target.value)} /></div>
        </div>
      )}
    </Modal>
  );
}
