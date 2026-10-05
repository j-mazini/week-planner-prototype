import { StatusBadge } from "@/components/status-badge";
import type { VehicleIssueType, VehicleOutOfOperation } from "../types";

const ISSUE_LABEL: Record<VehicleIssueType, string> = {
  maintenance: "Maintenance",
  unassigned: "Unassigned",
  inactive: "Inactive",
};

const ISSUE_BADGE_TYPE: Record<VehicleIssueType, string> = {
  maintenance: "maintenance",
  unassigned: "pending",
  inactive: "inactive",
};

export default function VehiclesOutCard({
  vehicles,
  asOfDate,
}: {
  vehicles: VehicleOutOfOperation[];
  asOfDate: string;
}) {
  return (
    <section className="shp-card">
      <h2>Vehicles out of operation</h2>
      <p className="shp-card__sub">Your deposit · now · {asOfDate}</p>

      {vehicles.length === 0 ? (
        <p className="shp-empty">All vehicles in the deposit are active.</p>
      ) : (
        <div className="shp-vp-list">
          {vehicles.map((vehicle) => (
            <div className="shp-route-row" key={vehicle.registration}>
              <span className="shp-route-code">{vehicle.registration}</span>
              <span className="shp-route-body">
                <span className="shp-route-top">
                  <span className="shp-route-driver-name">{vehicle.reason}</span>
                </span>
                <span className="shp-route-meta">
                  <span>Since {vehicle.since}</span>
                  {vehicle.expectedBack && <span>Expected back {vehicle.expectedBack}</span>}
                </span>
              </span>
              <StatusBadge status={ISSUE_BADGE_TYPE[vehicle.issueType]}>{ISSUE_LABEL[vehicle.issueType]}</StatusBadge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
