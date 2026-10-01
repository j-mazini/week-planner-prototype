"use client";

import type { ExceptionsModel } from "../../types";
import { useToast } from "../Toast";

interface ExceptionsPanelProps {
  exceptions: ExceptionsModel | null;
  fallbackLabel: string;
}

export default function ExceptionsPanel({ exceptions, fallbackLabel }: ExceptionsPanelProps) {
  const { showToast } = useToast();
  const dayLabel = exceptions?.dayLabel ?? fallbackLabel;

  return (
    <section className="exceptions-panel" aria-label="Exceptions">
      <h3 className="rhead"><b>EXCEPTIONS</b> <span>FOLLOW THE SELECTED DAY · AUTO-ALLOCATION</span></h3>
      <div className="exc">
        <article className="excard" aria-label="Vehicle exceptions">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">VEHICLES</span>
            <span className="excount">{exceptions?.vehicles.items.filter((item) => item.usable).length ?? 0}</span>
          </div>
          {exceptions && (
            <>
              <div className="exutilization">
                <strong>{exceptions.vehicles.utilizationLabel}</strong>
                <span>{exceptions.vehicles.utilizationPercent}%</span>
                <small>UTILIZATION · {exceptions.vehicles.depotLabel} · {dayLabel.slice(0, 3)}</small>
              </div>
              <div className="exitems exvehicles">
              {exceptions.vehicles.items.map((item, index) => (
                <div key={index} className={`exrow${item.tag === "VOR" ? " exrow-vor" : ""}`}>
                  <span className="exlbl" style={{ color: item.tag === "VOR" ? "var(--orange)" : "var(--ink-faint)" }}>{item.tag}</span>
                  <span className="plate-chip" title={item.plate}>{item.plate}</span>
                  {item.usable ? (
                    <button type="button" className="use" onClick={() => showToast("Vehicle allocated to the day (prototype).")}>Use</button>
                  ) : null}
                </div>
              ))}
              </div>
              <p className="foot">UNUSED VANS AUTO-TAG AS SPARE · VOR = OFF ROAD, EXCLUDED FROM FLEET COUNT</p>
            </>
          )}
        </article>

        <article className="excard" aria-label="Driver exceptions">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">DRIVERS</span>
            <span className="excount">{exceptions?.drivers.items.length ?? 0}</span>
          </div>
          <div className="exitems exdrivers">
          {exceptions?.drivers.unallocated && (
            <div className="unall">
              <span className="exlbl" style={{ color: "var(--olive-alt)", fontWeight: 600 }}>UNALL</span>
              <span className="exname">{exceptions.drivers.unallocated.name}</span>
              <button type="button" className="place" onClick={() => showToast(`${exceptions.drivers.unallocated!.name} allocated (prototype).`)}>
                Place
              </button>
            </div>
          )}
          {exceptions?.drivers.items.map((item, index) => (
            <div key={index} className="exrow">
              <span className="exlbl" style={{ color: item.tag === "FLEX" ? "var(--flex-blue)" : "var(--ink-faint)" }}>{item.tag}</span>
              <span className="exname">{item.name}</span>
            </div>
          ))}
          </div>
          <p className="foot">UNPLACED BY THE ENGINE — EVERYONE ELSE IS ALREADY ON THE BOARD</p>
        </article>
      </div>
    </section>
  );
}
