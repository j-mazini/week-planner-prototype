"use client";

import { useApp } from "../state";
import { RouteScreen } from "../components/RouteScreen";

export default function FinishRoute() {
  const { navigate, finish, routes, routeIndex } = useApp();
  const route = routes[routeIndex];
  const assignment = route?.assignment;

  const routeName = assignment?.route || assignment?.notes || "Today's route";
  const scheduled = route?.totalStops ?? 0;
  const delivered = route?.deliveries ?? 0;
  const progress = scheduled > 0 ? Math.round((delivered / scheduled) * 100) : 0;

  return (
    <RouteScreen
      urgency="finish"
      title="Finish route"
      band="Finishing — this closes the route for today"
      onBack={() => navigate("overview")}
    >
      <div className="route-summary">
        <div className="route-summary__top">
          <div>
            <p className="route-summary__name">{routeName}</p>
            <p className="route-summary__date">{assignment?.date ?? "Today"}</p>
          </div>
          <span className="route-summary__progress">{progress}% done</span>
        </div>
        <div className="route-summary__figures">
          <div className="route-summary__figure">
            <span>Scheduled stops</span>
            <strong>{scheduled}</strong>
          </div>
          <div className="route-summary__figure">
            <span>Deliveries completed</span>
            <strong>{delivered}</strong>
          </div>
        </div>
      </div>

      <div className="route-confirm">
        <p className="route-confirm__question">Is everything ok with the route?</p>
        <div className="route-confirm__actions">
          <button type="button" className="is-primary" onClick={finish}>
            Yes, finish route
          </button>
          <button type="button" onClick={() => navigate("report-issue")}>
            No, report an issue
          </button>
        </div>
      </div>
    </RouteScreen>
  );
}
