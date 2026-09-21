"use client";

import type { HorizonWeekModel } from "../../types";
import { useToast } from "../Toast";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PlanHorizonPanel({ weeks }: { weeks: HorizonWeekModel[] }) {
  const { showToast } = useToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>PLAN HORIZON — SIX WEEKS</b> <span>A WEEK SEALS ITSELF WHEN ALL THREE DEPOTS APPROVE</span></h3>
      <div className="hz">
        {weeks.map((week) => (
          <div key={week.weekLabel} className={`hzrow${week.isActive ? " active" : ""}`}>
            <span className="hzwk">
              <b>{week.weekLabel}</b>
              <span>{week.range}</span>
            </span>
            <span className="strip">
              {week.dayStrip.map((mark, index) => (
                <i key={index} className={mark === "ok" ? "ok" : mark === "bad" ? "bad" : "we"}>
                  {DAY_LETTERS[index]}
                </i>
              ))}
            </span>
            <span className="hzact">
              {week.actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className={`hzbtn${action.variant === "primary" ? " pri" : action.variant === "pill" ? " pill" : ""}`}
                  onClick={() => showToast(`${action.label.trim()} — prototype action.`)}
                >
                  {action.label}
                </button>
              ))}
            </span>
            <span className="hzend">
              <span className="depots">
                {week.depots.map((depot) => (
                  <span key={depot.code} className={depot.approved ? "ap" : "pd"}>{depot.code}</span>
                ))}
              </span>
              <span style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {week.stats.map((stat, index) => (
                  <span key={index} className={`stat ${stat.tone}`}>{stat.label}</span>
                ))}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="foot">
        ALL DEPOTS SAFE THROUGH SUN 19 JUL (LSE PENDING APPROVAL) · LCY ALONE REACHES W30 · GENERATE W30 FOR MSE + LSE BY FRI 17
      </p>
    </section>
  );
}
