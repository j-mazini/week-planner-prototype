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
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>EXCEPTIONS</b> <span>FOLLOW THE SELECTED DAY · AUTO-ALLOCATION</span></h3>
      <div className="exc">
        <article className="excard">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">VEHICLES</span>
            <span className="excount">{exceptions?.vehicles.items.length ?? 0}</span>
          </div>
          {exceptions && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{exceptions.vehicles.utilizationLabel}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "var(--green)" }}>{exceptions.vehicles.utilizationPercent}%</span>
              </div>
              <span style={{ fontSize: "6.5px", letterSpacing: ".65px", color: "var(--ink-faint)" }}>
                UTILIZATION · {exceptions.vehicles.depotLabel} · {dayLabel.slice(0, 3)}
              </span>
              {exceptions.vehicles.items.map((item, index) => (
                <div key={index} className="exrow">
                  <span className="exlbl" style={{ color: item.tag === "VOR" ? "var(--orange)" : "var(--ink-faint)" }}>{item.tag}</span>
                  <span className="plate-chip">{item.plate}</span>
                  {item.usable ? (
                    <button type="button" className="use" onClick={() => showToast("Veículo alocado ao dia (protótipo).")}>Use</button>
                  ) : (
                    <span style={{ width: 34 }} />
                  )}
                </div>
              ))}
              <p className="foot">UNUSED VANS AUTO-TAG AS SPARE · VOR = OFF ROAD, EXCLUDED FROM FLEET COUNT</p>
            </>
          )}
        </article>

        <article className="excard">
          <div className="exhd">
            <span className="daychip">{dayLabel}</span>
            <span className="exkind">DRIVERS</span>
            <span className="excount">{exceptions?.drivers.items.length ?? 0}</span>
          </div>
          {exceptions?.drivers.unallocated && (
            <div className="unall">
              <span className="exlbl" style={{ color: "var(--olive-alt)", fontWeight: 600 }}>UNALL</span>
              <span className="exname">{exceptions.drivers.unallocated.name}</span>
              <button type="button" className="place" onClick={() => showToast(`${exceptions.drivers.unallocated!.name} alocado (protótipo).`)}>
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
          <p className="foot">UNPLACED BY THE ENGINE — EVERYONE ELSE IS ALREADY ON THE BOARD</p>
        </article>
      </div>
    </section>
  );
}
