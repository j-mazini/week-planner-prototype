import { useState, type FormEvent } from 'react';
import type { Payee, PayeeUpdate, PaymentMode } from '../types';

const MODES: PaymentMode[] = ['DAF', 'DR', 'VSR', 'SP_VSR'];
const ADHOC_OPTIONS = ['NONE', 'Extra Belt Sort'];

export default function PayeeEditor({ payee, onSave, onCancel }: {
  payee: Payee; onSave: (update: PayeeUpdate) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PayeeUpdate>({
    name: payee.name,
    vehicle: payee.vehicle,
    mode: payee.mode,
    sort: payee.sort,
    sortValue: payee.sortValue,
    adhoc: payee.adhoc,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <form className="payee-info editor" onSubmit={submit}>
      <div className="editor-save">
        <button className="small-button" type="submit">SAVE</button>
        <button className="small-button" type="button" onClick={onCancel}>CANCEL</button>
      </div>
      <div className="form-grid">
        <label className="form-field wide">
          <span>NAME</span>
          <input
            aria-label="Name" required value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="form-field">
          <span>VEHICLE</span>
          <input
            aria-label="Vehicle" value={draft.vehicle ?? ''}
            onChange={e => setDraft({ ...draft, vehicle: e.target.value || null })}
          />
        </label>
        <label className="form-field select-wrap">
          <span>PAYMENT MODE</span>
          <select
            aria-label="Payment mode" value={draft.mode}
            onChange={e => setDraft({ ...draft, mode: e.target.value as PaymentMode })}
          >
            {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="form-field select-wrap">
          <span>SORT</span>
          <select
            aria-label="Sort" value={draft.sort ? 'YES' : 'NO'}
            onChange={e => setDraft({ ...draft, sort: e.target.value === 'YES' })}
          >
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </label>
        <label className="form-field">
          <span>SORT VALUE</span>
          <input
            aria-label="Sort value" type="number" min="0" step="0.01" required
            value={draft.sortValue}
            onChange={e => setDraft({ ...draft, sortValue: Number(e.target.value) })}
          />
        </label>
        <label className="form-field wide select-wrap">
          <span>ADHOC-SERVICE</span>
          <select
            aria-label="Adhoc service" value={draft.adhoc ?? 'NONE'}
            onChange={e => setDraft({
              ...draft, adhoc: e.target.value === 'NONE' ? null : e.target.value,
            })}
          >
            {ADHOC_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
    </form>
  );
}
