import type { Payee } from '../types';
import { displayVehicle } from '../utils/mappers';
import Icon from './Icon';

export default function ClearedSession({ payees, clearedIds, total, onReturn }: {
  payees: Payee[]; clearedIds: string[]; total: number; onReturn: (id: string) => void;
}) {
  const byId = new Map(payees.map(payee => [payee.id, payee]));
  const done = clearedIds.length === payees.length && payees.length > 0;
  const percent = payees.length > 0 ? (clearedIds.length / payees.length) * 100 : 0;

  return (
    <aside className="history" aria-label="Cleared history">
      <div className="cleared-counter">
        <h2>{clearedIds.length} / {payees.length} CLEARED</h2>
        <div>
          <span style={{ width: `${percent}%` }} />
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
              <div className="cleared-card-top">
                <span className="cleared-icon"><Icon name="cleared" /></span>
                <div className="cleared-person">
                  <div className="card-row">
                    <span className="route-id"><Icon name="clearedRoute" />{payee.id}</span>
                    <span className="vehicle-id">
                      <Icon name="vehicle" />{displayVehicle(payee)}
                    </span>
                  </div>
                  <h3>{payee.name}</h3>
                </div>
              </div>
              <div className="return-row">
                <button
                  type="button"
                  onClick={() => onReturn(id)}
                  aria-label={`Return ${payee.name} to queue`}
                >
                  <span aria-hidden="true">⤺</span> RETURN TO QUEUE
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
