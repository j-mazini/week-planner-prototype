import type { Payee } from '../types';

export default function ClearedSession({ payees, clearedIds, total, onReturn }: {
  payees: Payee[]; clearedIds: string[]; total: number; onReturn: (id: string) => void;
}) {
  const byId = new Map(payees.map(payee => [payee.id, payee]));
  const done = clearedIds.length === payees.length && payees.length > 0;

  return (
    <aside className="history" aria-label="Cleared history">
      <div className="cleared-counter">
        <h2>{clearedIds.length} / {payees.length} CLEARED</h2>
        <div>
          <span style={{ width: `${(clearedIds.length / payees.length) * 100}%` }} />
        </div>
      </div>
      <div className="history-heading">
        CLEARED SESSION
        {done && <span data-testid="cleared-total">TOTAL: £{total.toFixed(2)}</span>}
      </div>
      <div className="history-list">
        {clearedIds.map(id => {
          const payee = byId.get(id);
          if (!payee) return null;
          return (
            <article className="cleared-card" key={id}>
              <div className="cleared-person">
                <span className="route-id">{payee.id}</span>
                <span className="vehicle-id">{payee.vehicle ?? 'NOVEHICLE'}</span>
                <h3>{payee.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => onReturn(id)}
                aria-label={`Return ${payee.name} to queue`}
              >
                RETURN TO QUEUE
              </button>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
