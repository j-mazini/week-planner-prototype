"use client";

import { useState, type ReactNode } from "react";
import { DEPOTS } from "../../constants";

export function SelectField({ label, placeholder, options }: { label: string; placeholder: string; options: readonly string[] }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <select className="ctl" defaultValue="">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function TextField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" placeholder={placeholder} />
    </label>
  );
}

export function DateField({ label, defaultValue, disabled }: { label: string; defaultValue: string; disabled?: boolean }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" type="date" defaultValue={defaultValue} disabled={disabled} />
    </label>
  );
}

export function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input className="ctl" value={value} disabled readOnly />
    </label>
  );
}

export function TextareaField({ label, placeholder, tall }: { label: string; placeholder: string; tall?: boolean }) {
  return (
    <label className="fld span2">
      <span>{label}</span>
      <textarea className={`ctl${tall ? " tall" : ""}`} placeholder={placeholder} />
    </label>
  );
}

export function SegmentedField({ options, onChange }: { options: [string, string]; onChange?: (index: 0 | 1) => void }) {
  const [active, setActive] = useState<0 | 1>(0);
  return (
    <div className="fld">
      <span>Day off mode</span>
      <div className="seg">
        {options.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={active === index}
            onClick={() => {
              setActive(index as 0 | 1);
              onChange?.(index as 0 | 1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DayCardDef {
  code: string;
  label: string;
  date: string;
  count: number;
  weekend: boolean;
}

export function DaySelectorField({ fullWeekLabel, days }: { fullWeekLabel: string; days: DayCardDef[] }) {
  const [selected, setSelected] = useState<string>("full");

  return (
    <div className="fld span2">
      <span>SELECT DAYS</span>
      <div className="fullwk" onClick={() => setSelected("full")}>
        <span className="rad" data-on={selected === "full" ? "1" : "0"} />
        <span>{fullWeekLabel}</span>
      </div>
      <p className="orsel">Or select specific days:</p>
      <div className="daycards">
        {days.map((day) => (
          <div
            key={day.code}
            className={`daycard${selected === day.code ? " on" : ""}${day.weekend ? " we" : ""}`}
            onClick={() => setSelected(day.code)}
          >
            <div className="dctop">
              <span className={`rad${day.weekend ? " we" : ""}`} data-on={selected === day.code ? "1" : "0"} />
              <span>
                <span className="dcname">{day.label}</span>
                <br />
                <span className="dcdate">{day.date}</span>
              </span>
            </div>
            <span className="dccount">{day.count} assignments</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DepotPickerField() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEPOTS));

  function toggle(depot: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(depot)) next.delete(depot);
      else next.add(depot);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === DEPOTS.length ? new Set() : new Set(DEPOTS)));
  }

  return (
    <div className="fld span2">
      <span>DEPOTS</span>
      <div className="chkrow" onClick={toggleAll}>
        <span className="box" data-on={selected.size === DEPOTS.length ? "1" : "0"} />
        <span>All depots ({DEPOTS.length})</span>
      </div>
      <div className="depotrow">
        {DEPOTS.map((depot) => (
          <div key={depot} className="depotchip" onClick={() => toggle(depot)}>
            <span className="box" data-on={selected.has(depot) ? "1" : "0"} />
            <span>{depot}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="two">{children}</div>;
}
