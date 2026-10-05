import Sparkline from "./Sparkline";
import { OPERATION_STAGES } from "../mockSupervisorHomeData";
import type { SupervisorHomeSummary } from "../types";

function Delta({
  current,
  previous,
  unit = "",
  goodDirection = "up",
  caption,
}: {
  current: number;
  previous: number;
  unit?: string;
  goodDirection?: "up" | "down";
  caption: string;
}) {
  const diff = Number((current - previous).toFixed(1));
  if (diff === 0) {
    return (
      <span className="shp-delta shp-delta--flat">
        No change <span className="shp-delta__caption">{caption}</span>
      </span>
    );
  }
  const rose = diff > 0;
  const good = rose === (goodDirection === "up");
  return (
    <span className={`shp-delta ${good ? "shp-delta--good" : "shp-delta--bad"}`}>
      <span aria-hidden="true">{rose ? "▲" : "▼"}</span> {Math.abs(diff)}
      {unit} <span className="shp-delta__caption">{caption}</span>
    </span>
  );
}

export default function KpiStrip({ data }: { data: SupervisorHomeSummary }) {
  const driversOff = data.driversOff.length;
  const allocatedPercent = data.totalDrivers ? (data.allocatedDrivers / data.totalDrivers) * 100 : 0;
  const stage = OPERATION_STAGES[data.routeBalance.stage] ?? OPERATION_STAGES[0];

  return (
    <div className="shp-kpis">
      <article className="shp-kpi">
        <span className="shp-kpi__label">Stops delivered</span>
        <span className="shp-kpi__num">{data.stopsDelivered}</span>
        <Delta current={data.stopsDelivered} previous={data.stopsDeliveredPrevious} caption="vs. previous day" />
        <Sparkline series={data.stopsSeries} />
      </article>

      <article className="shp-kpi">
        <span className="shp-kpi__label">Failed deliveries</span>
        <span className="shp-kpi__num">{data.failures}</span>
        <Delta
          current={data.failures}
          previous={data.failuresPrevious}
          goodDirection="down"
          caption="vs. previous day"
        />
        <Sparkline series={data.failuresSeries} tone="risk" />
      </article>

      <article className="shp-kpi">
        <span className="shp-kpi__label">Sort rate</span>
        <span className="shp-kpi__num">
          {data.sortRatePercent}
          <span className="shp-kpi__unit">%</span>
        </span>
        <Delta current={data.sortRatePercent} previous={data.sortRatePrevious} unit="pt" caption="vs. previous day" />
        <Sparkline series={data.sortRateSeries} unit="%" />
      </article>

      <article className="shp-kpi">
        <span className="shp-kpi__label">Drivers on route</span>
        <span className="shp-kpi__num">
          {data.allocatedDrivers}
          <span className="shp-kpi__unit">/{data.totalDrivers}</span>
        </span>
        <span className="shp-delta shp-delta--flat">
          {driversOff} off <span className="shp-delta__caption">on the day</span>
        </span>
        <span className="shp-alloc" role="img" aria-label={`${data.allocatedDrivers} of ${data.totalDrivers} drivers ran a route`}>
          <span className="shp-alloc__fill" style={{ width: `${allocatedPercent}%` }} />
        </span>
      </article>

      <article className="shp-kpi shp-kpi--status">
        <span className="shp-kpi__label">Today&apos;s operation</span>
        <span className="shp-kpi__status">{data.dayFinalized ? "Finalized" : "In progress"}</span>
        <span className="shp-delta shp-delta--flat">
          {stage} <span className="shp-delta__caption">· updated {data.routeBalance.lastUpdated}</span>
        </span>
        <ol className="shp-stages" aria-label="Operation stages">
          {OPERATION_STAGES.map((name, i) => (
            <li
              key={name}
              className={`shp-stage${i <= data.routeBalance.stage ? " shp-stage--done" : ""}`}
              title={name}
            >
              <span className="sr-only">{name}</span>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
