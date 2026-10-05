import { StatusBadge } from "@/components/status-badge";
import type { DepositRoute } from "../types";

const STATUS_LABEL: Record<DepositRoute["status"], string> = {
  completed: "Concluída",
  incomplete: "Incompleta",
};

const STATUS_BADGE_TYPE: Record<DepositRoute["status"], string> = {
  completed: "active",
  incomplete: "pending",
};

export default function DepositRoutesCard({
  routes,
  notAllocated,
}: {
  routes: DepositRoute[];
  notAllocated: string[];
}) {
  return (
    <section className="shp-card">
      <h2>Resumo das rotas</h2>
      <p className="shp-card__sub">Dia anterior · stops, falhas e sort por rota</p>

      {routes.length === 0 ? (
        <p className="shp-empty">Nenhuma rota registrada no dia anterior.</p>
      ) : (
        routes.map((route) => (
          <div className="shp-route-row" key={route.routeCode}>
            <span className="shp-route-code">{route.routeCode}</span>
            <span className="shp-route-driver">
              <span>{route.driverName}</span>
              <small>
                {route.stops} stops · {route.failed} falha{route.failed === 1 ? "" : "s"} · Sort: {route.sort === "Yes" ? "Sim" : "Não"}
                {route.note ? ` · ${route.note}` : ""}
              </small>
            </span>
            <StatusBadge status={STATUS_BADGE_TYPE[route.status]}>{STATUS_LABEL[route.status]}</StatusBadge>
          </div>
        ))
      )}

      {notAllocated.length > 0 && (
        <>
          <div className="shp-divider" />
          <p className="shp-card__sub">Não alocados ({notAllocated.length})</p>
          <div className="shp-chip-row">
            {notAllocated.map((name) => (
              <span className="shp-chip" key={name}>
                {name}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
