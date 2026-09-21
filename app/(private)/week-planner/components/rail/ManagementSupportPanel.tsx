import type { ManagementDayModel } from "../../types";

export default function ManagementSupportPanel({ days }: { days: ManagementDayModel[] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>MANAGEMENT &amp; SUPPORT</b> <span>DEEP MATERIAL · RUNS THE DAY</span></h3>
      <div className="mgrid">
        {days.map((day) => (
          <div key={day.dayLabel} className="mday">
            <b>{day.dayLabel}</b>
            {day.cells.map((cell, index) => (
              <div key={`${day.dayLabel}-${index}`} className={`mcard${cell.isMuted ? " muted" : ""}${cell.tooltip ? " hastip" : ""}`} tabIndex={cell.tooltip ? 0 : -1}>
                <div className="mband">TL·SORT</div>
                <div className="mname">{cell.managerName}</div>
                {cell.tooltip && <span className="tip">{cell.tooltip}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
