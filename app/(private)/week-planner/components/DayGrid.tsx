import type { DayColumnModel, RouteCardModel } from "../types";
import RouteCard from "./RouteCard";

function badgeFor(day: DayColumnModel, selected: boolean): [string, string] | null {
  if (selected) return ["sel", "SELECTED"];
  if (day.reviewBadge === "reviewed") return ["rev", "✓ REV"];
  if (day.reviewBadge === "re-review") return ["rerev", "RE-REV"];
  return null;
}

interface DayGridProps {
  days: DayColumnModel[];
  variant: "main" | "adhoc";
  selectedDate: string | null;
  onSelectDay: (date: string | null) => void;
  onAddInDay: (date: string) => void;
  onOpenRoute: (route: RouteCardModel) => void;
}

export default function DayGrid({ days, variant, selectedDate, onSelectDay, onAddInDay, onOpenRoute }: DayGridProps) {
  return (
    <div className="gridscroll">
      <div className={`grid grid-${variant}`} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((day) => {
          const selected = variant === "main" && day.date === selectedDate;
          const badge = badgeFor(day, selected);
          const routes = variant === "main" ? day.mainRoutes : day.adhocRoutes;

          return (
            <div key={day.date} className={`day${selected ? " sel" : ""}`}>
              <div className="dayhead">
                <button
                  type="button"
                  className="daybtn"
                  onClick={() => onSelectDay(selectedDate === day.date ? null : day.date)}
                >
                  <span className="dayname">{day.name}</span>
                  <span className="daynum">{day.dayNumber}</span>
                  {badge && <span className={`daybadge ${badge[0]}`}>{badge[1]}</span>}
                </button>
                <button
                  type="button"
                  className="dayadd"
                  aria-label={`Add in ${day.name}`}
                  onClick={() => onAddInDay(day.date)}
                >
                  +
                </button>
              </div>
              <div className="route-list">
                {routes.map((route) => (
                  <RouteCard key={route.id} route={route} onOpen={onOpenRoute} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
