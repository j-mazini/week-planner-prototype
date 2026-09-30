"use client";

import { useState } from "react";
import { DRIVERS, ROUTE_CODES, VEHICLES } from "../../constants";
import RouteBalanceModal from "./RouteBalanceModal";

export default function AddFlexRouteModal({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [route, setRoute] = useState("");
  const [driver, setDriver] = useState(DRIVERS[0]);
  const [vehicle, setVehicle] = useState(VEHICLES[1]);

  return (
    <RouteBalanceModal
      title="Add New Flex Route"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="rbf-btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="rbf-btn primary" onClick={onSave}>
            Save Route
          </button>
        </>
      }
    >
        <label className="rbm-field">
          <span className="rbm-label">ROUTE_NAME</span>
          <select className="rbm-control" value={route} onChange={(e) => setRoute(e.target.value)}>
            <option value="">ROUTE</option>
            {ROUTE_CODES.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
        <label className="rbm-field">
          <span className="rbm-label">ASSIGNED_DRIVER</span>
          <select className="rbm-control" value={driver} onChange={(e) => setDriver(e.target.value)}>
            <option value="">Select a driver</option>
            {DRIVERS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="rbm-field">
          <span className="rbm-label">VEHICLE</span>
          <select className="rbm-control" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            {VEHICLES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
    </RouteBalanceModal>
  );
}
