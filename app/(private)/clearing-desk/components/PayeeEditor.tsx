import { useState, type FormEvent } from 'react';
import type { Payee, PayeeUpdate, PaymentMode } from '../types';
import Icon from './Icon';

const MODES: PaymentMode[] = ['DAF', 'DR', 'VSR', 'SP_VSR'];
const ADHOC_OPTIONS = ['NONE', 'Extra Belt Sort'];

export default function PayeeEditor({ payee, onSave }: {
  payee: Payee; onSave: (update: PayeeUpdate) => void;
}) {
  const [draft, setDraft] = useState<PayeeUpdate>({
    name: payee.name,
    vehicle: payee.vehicle,
    mode: payee.mode,
    payment: payee.payment,
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
        <label className="form-field">
          <span>PAYMENT MODE</span>
          <span className="select-wrap">
            <select
              aria-label="Payment mode" value={draft.mode}
              onChange={e => setDraft({ ...draft, mode: e.target.value as PaymentMode })}
            >
              {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>
            <Icon name="select" />
          </span>
        </label>
        <label className="form-field">
          <span>PAYMENT VALUE</span>
          <input
            aria-label="Payment value" type="number" min="0" step="0.01"
            value={draft.payment.amount ?? ''}
            onChange={e => setDraft({
              ...draft,
              payment: {
                ...draft.payment,
                // An emptied field means "not known", the same state the design
                // renders as an em dash — not a zero the operator never typed.
                amount: e.target.value === '' ? null : Number(e.target.value),
              },
            })}
          />
        </label>
        <label className="form-field">
          <span>FLAT</span>
          <span className="select-wrap">
            <select
              aria-label="Flat" value={draft.payment.flat ? 'YES' : 'NO'}
              onChange={e => setDraft({
                ...draft,
                payment: { ...draft.payment, flat: e.target.value === 'YES' },
              })}
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
            <Icon name="select" />
          </span>
        </label>
        <label className="form-field">
          <span>SORT</span>
          <span className="select-wrap">
            <select
              aria-label="Sort" value={draft.sort ? 'YES' : 'NO'}
              onChange={e => setDraft({ ...draft, sort: e.target.value === 'YES' })}
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
            <Icon name="select" />
          </span>
        </label>
        <label className="form-field">
          <span>SORT VALUE</span>
          <input
            aria-label="Sort value" type="number" min="0" step="0.01" required
            value={draft.sortValue}
            onChange={e => setDraft({ ...draft, sortValue: Number(e.target.value) })}
          />
        </label>
        <label className="form-field wide">
          <span>ADHOC-SERVICE</span>
          <span className="select-wrap">
            <select
              aria-label="Adhoc service" value={draft.adhoc ?? 'NONE'}
              onChange={e => setDraft({
                ...draft, adhoc: e.target.value === 'NONE' ? null : e.target.value,
              })}
            >
              {ADHOC_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            <Icon name="select" />
          </span>
        </label>
      </div>
    </form>
  );
}
