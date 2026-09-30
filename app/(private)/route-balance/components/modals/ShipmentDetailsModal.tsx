"use client";
import type { ReactNode } from "react";
import type { RouteDetailModel } from "../../types";
import RouteBalanceModal from "./RouteBalanceModal";

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}

export default function ShipmentDetailsModal({ detail, onClose }: { detail: RouteDetailModel; onClose: () => void }) {
  return (
    <RouteBalanceModal title={`Shipment Details/ ${detail.routeId}`} variant="shipment" onClose={onClose}>
      <dl className="rbm-overview">
        <Cell label="ROUTE ID">{detail.routeId}</Cell>
        <Cell label="DRIVER">{detail.driverName}</Cell>
        <Cell label="VEHICLE">{detail.vehiclePlate}</Cell>
      </dl>
      <dl className="rbm-overview">
        <Cell label="TOTAL STOPS">{detail.deliveries + detail.pickups}</Cell>
        <Cell label="DELIVERIES / PICKUPS">{detail.deliveries} / {detail.pickups}</Cell>
        <Cell label="COMPLETION"><span className="rbm-completion">{detail.completionPercent}%</span></Cell>
      </dl>
      <dl className="rbm-overview">
        <Cell label="TOTAL PIECES">{detail.totalPieces}</Cell>
        <Cell label="SOMA PHYS (KG)">{detail.somaPhysKg.toFixed(2)}</Cell>
        <Cell label="TOTAL SHIPMENTS">{detail.totalShipments}</Cell>
      </dl>
      <h3 className="rbm-breakdown-title">Shipment Breakdown by Type</h3>
      <dl className="rbm-indicators">
        <dt>SPECIAL INDICATORS</dt>
        <dd><span>Pre-12: {detail.pre12Count}</span><span aria-hidden="true">|</span><span>ASR: {detail.asrCount}</span><span aria-hidden="true">|</span><span>DSR: {detail.dsrCount}</span></dd>
      </dl>
      <section>
        <div className="rbm-table-scroll">
          <table className="rbm-table rbm-breakdown">
            <thead><tr><th>TYPE</th><th>PIECES</th><th>SHIPMENTS</th><th>SOMA PHYS (KG)</th><th>% TOTAL</th></tr></thead>
            <tbody>{detail.breakdown.map((row) => <tr key={row.type}>
              <td><span className="rbm-type">{row.type}</span></td><td>{row.pieces}</td><td>{row.shipments}</td><td>{row.somaPhysKg?.toFixed(2) ?? "—"}</td><td>{row.percentTotal}%</td>
            </tr>)}</tbody>
            <tfoot><tr><td>TOTAL</td><td>{detail.totalPieces}</td><td>{detail.totalShipments}</td><td>{detail.somaPhysKg.toFixed(2)}</td><td>100%</td></tr></tfoot>
          </table>
        </div>
      </section>
    </RouteBalanceModal>
  );
}
