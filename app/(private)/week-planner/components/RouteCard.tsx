import type { RouteCardModel } from "../types";
import StatusDisc from "./StatusDisc";

function VehicleBadge({ route }: { route: RouteCardModel }) {
  if (route.vehicleBadge === "ok") return <span className="veh ok">{route.vehiclePlate}</span>;
  if (route.vehicleBadge === "sub") return <span className="veh sub">{route.vehiclePlate}</span>;
  if (route.vehicleBadge === "none") return <span className="veh none">NO VEHICLE</span>;
  return null;
}

export default function RouteCard({ route, onOpen }: { route: RouteCardModel; onOpen: (route: RouteCardModel) => void }) {
  const isOpen = route.status === "open";
  return (
    <button
      type="button"
      className={`rc${isOpen ? " open" : ""}`}
      onClick={() => onOpen(route)}
      aria-label={`Route ${route.code}${route.driverName ? ` — ${route.driverName}` : " — unassigned"}`}
    >
      <span className="plate">
        {route.isFlex && <span className="flexlbl">FLEX</span>}
        <span className="code">{route.code}</span>
      </span>
      <span className="notchel" aria-hidden="true" />
      <StatusDisc status={route.status} />
      {isOpen ? (
        <span className="drop">
          <span className="assign" role="presentation">Assign</span>
        </span>
      ) : (
        <span className="rcbody">
          <span className="driver">{route.driverName}</span>
          <VehicleBadge route={route} />
        </span>
      )}
    </button>
  );
}
