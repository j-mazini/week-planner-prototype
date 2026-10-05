import { StatusBadge } from "@/components/status-badge";
import type { VehicleOutOfOperation } from "../types";

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
            <div className="shp-vp-row" key={vehicle.registration}>
              <span>
                <span className="shp-vp-name">{vehicle.registration}</span>
                <br />
                <small>{vehicle.reason}</small>
              </span>
              <StatusBadge status="maintenance">{vehicle.since}</StatusBadge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
