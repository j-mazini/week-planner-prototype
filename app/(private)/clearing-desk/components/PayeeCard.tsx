import type { Payee } from '../types';

export default function PayeeCard({ payee, selected, onSelect }: {
  payee: Payee; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`pending-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="card-row">
        <span className="route-id">{payee.id}</span>
        <span className="pending-badge">PENDING</span>
      </span>
      <span className="card-row">
        <span>{payee.name}</span>
        <strong>{payee.mode}</strong>
      </span>
      <span className="vehicle-id">{payee.vehicle ?? 'NOVEHICLE'}</span>
    </button>
  );
}
