"use client";
import { useId, useRef, useState } from "react";
import type { PostcodeAreaModel } from "../../types";
import RouteBalanceModal from "./RouteBalanceModal";

export default function AddPostcodeModal({ areas, onCancel, onAdd }: {
  areas: PostcodeAreaModel[];
  onCancel: () => void;
  onAdd: (count: number) => void;
}) {
  const [areaCode, setAreaCode] = useState(areas[0]?.area ?? "");
  const [selected, setSelected] = useState(() => new Set(areas[0]?.postcodes ?? []));
  const [open, setOpen] = useState(false);
  const listId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const area = areas.find((item) => item.area === areaCode);
  const allSelected = Boolean(area?.postcodes.length && area.postcodes.every((pc) => selected.has(pc)));

  function toggle(postcode: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(postcode)) next.delete(postcode); else next.add(postcode);
      return next;
    });
  }

  return (
    <RouteBalanceModal title="ADD_POSTCODE" variant="postcode" onClose={onCancel}
      footer={<>
        <button type="button" className="rbf-btn ghost" onClick={onCancel}>CANCEL</button>
        <button type="button" className="rbf-btn primary" disabled={!selected.size} onClick={() => onAdd(selected.size)}>ADD</button>
      </>}>
      <label className="rbm-field">
        <span className="rbm-label">AREA</span>
        <select className="rbm-control" value={areaCode} onChange={(event) => {
          setAreaCode(event.target.value);
          setSelected(new Set(areas.find((item) => item.area === event.target.value)?.postcodes ?? []));
          setOpen(false);
        }}>
          {areas.map((item) => <option key={item.area}>{item.area}</option>)}
        </select>
      </label>
      <div onKeyDown={(event) => {
        if (open && event.key === "Escape") { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
      }}>
        <div className="rbm-field">
          <span className="rbm-label" id={listId + "-label"}>POSTCODES</span>
          <div className="rbm-postcode-selection">
            {!allSelected && selected.size > 0 && (
              <div className="rbm-postcode-tags">
                {[...selected].map((postcode) => <button className="rbm-tag" type="button" key={postcode} aria-label={`Remove ${postcode}`} onClick={() => toggle(postcode)}>
                  {postcode}<span aria-hidden="true">×</span>
                </button>)}
              </div>
            )}
            <button className="rbm-postcode-trigger" type="button" aria-label="Select postcodes" aria-expanded={open} aria-controls={listId} ref={trigger} onClick={() => setOpen(!open)}>
              {(allSelected || selected.size === 0) && <span>{allSelected ? "ALL_POSTCODES" : "SELECT_POSTCODES"}</span>}
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>
        </div>
        {open && (
          <div className="rbm-postcode-options" id={listId} role="group" aria-labelledby={listId + "-label"}>
            <label className="rbm-check">
              <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(area?.postcodes ?? []))} />
              ALL_POSTCODES
            </label>
            {area?.postcodes.map((postcode) => <label className="rbm-check" key={postcode}>
              <input type="checkbox" checked={selected.has(postcode)} onChange={() => toggle(postcode)} />{postcode}
            </label>)}
          </div>
        )}
      </div>
    </RouteBalanceModal>
  );
}
