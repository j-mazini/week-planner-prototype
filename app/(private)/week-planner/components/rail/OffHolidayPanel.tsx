import type { AbsenceDayModel } from "../../types";

export default function OffHolidayPanel({ days }: { days: AbsenceDayModel[] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="rhead"><b>OFF · HOLIDAY</b> <span>ABSENCE IS INFORMATION — HATCH SURRENDERS THE DEPOT HUE</span></h3>
      <div className="offgrid">
        {days.map((day) => (
          <div key={day.dayLabel} className="offday">
            <b>{day.dayLabel}</b>
            {day.chips.length === 0 && <span className="disp" style={{ fontSize: 9, color: "#6b6b63" }}>NO ONE OFF</span>}
            {day.chips.map((chip, index) => (
              <span key={`${day.dayLabel}-${index}`} className="hatch">
                <span className="k" style={{ color: chip.kind === "OFF" ? "#a6a69e" : "var(--amber-ink)" }}>{chip.kind}</span>
                <span className="p">{chip.personName}</span>
              </span>
            ))}
            {day.extraCount > 0 && <span className="more">+ {day.extraCount} MORE</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
