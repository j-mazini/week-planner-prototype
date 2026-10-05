import { StatusBadge } from "@/components/status-badge";
import type { VehicleOutOfOperation } from "../types";

export default function VehiclesOutCard({ vehicles }: { vehicles: VehicleOutOfOperation[] }) {
  return (
    <section className="shp-card">
      <h2>Veículos fora de operação</h2>
      <p className="shp-card__sub">Seu depósito · manutenção ou sem driver atribuído</p>

      {vehicles.length === 0 ? (
        <p className="shp-empty">Todos os veículos do depósito estão ativos.</p>
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
