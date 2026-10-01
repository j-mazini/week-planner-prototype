import { useState, type FormEvent } from 'react';
import type { CostModel } from '@/lib/api/cost-models';
import { useCostModels } from '@/hooks/useCostModels';
import type { Payee, PayeeUpdate } from '../types';
import Icon from './Icon';

const ADHOC_OPTIONS = ['NONE', 'Extra Belt Sort'];

/** "DR — £185.00 fixed", so the rate is visible before the model is chosen. */
function costModelLabel(model: CostModel): string {
  const name = model.name ?? `Cost model ${model.costModelId}`;
  if (model.fixedPrice != null && model.fixedPrice > 0) {
    return `${name} — £${model.fixedPrice.toFixed(2)} fixed`;
  }
  if (model.pricePerStop != null && model.pricePerStop > 0) {
    return `${name} — £${model.pricePerStop.toFixed(2)} per stop`;
  }
  return name;
}

/**
 * A fixed price is flat by definition; a per-stop model carries no single
 * figure, so the amount stays unknown and the card keeps its em dash.
 */
function paymentFromCostModel(model: CostModel) {
  const fixed = model.fixedPrice ?? null;
  return fixed != null && fixed > 0
    ? { amount: fixed, flat: true }
    : { amount: null, flat: false };
}

export default function PayeeEditor({ payee, onSave }: {
  payee: Payee; onSave: (update: PayeeUpdate) => void;
}) {
  const { data: costModels = [] } = useCostModels();
  const [draft, setDraft] = useState<PayeeUpdate>({
    name: payee.name,
    vehicle: payee.vehicle,
    mode: payee.mode,
    costModelId: null,
    payment: payee.payment,
    perStop: payee.perStop,
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
          <span>COST MODEL</span>
          <span className="select-wrap">
            <select
              aria-label="Cost model"
              value={draft.costModelId ?? ''}
              onChange={e => {
                const chosen = costModels.find(m => String(m.costModelId) === e.target.value);
                if (!chosen) return;
                setDraft({
                  ...draft,
                  costModelId: chosen.costModelId,
                  mode: chosen.name ?? draft.mode,
                  payment: paymentFromCostModel(chosen),
                  perStop: chosen.pricePerStop ?? 0,
                });
              }}
            >
              {draft.costModelId === null && <option value="">{draft.mode}</option>}
              {costModels.map(model => (
                <option key={model.costModelId} value={model.costModelId}>
                  {costModelLabel(model)}
                </option>
              ))}
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
