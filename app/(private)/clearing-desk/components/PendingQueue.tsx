import type { Payee } from '../types';
import PayeeCard from './PayeeCard';

export default function PendingQueue({
  payees, depot, selectedId, query, onQueryChange, onSelect,
}: {
  payees: Payee[]; depot: string; selectedId: string | null;
  query: string; onQueryChange: (value: string) => void; onSelect: (id: string) => void;
}) {
  const matches = payees.filter(p =>
    `${p.id} ${p.name} ${p.vehicle ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="pending-panel" aria-label="Pending authorizations">
      <div className="pending-heading">
        <h2>PENDING AUTH</h2>
        <span>{payees.length} TOTAL</span>
      </div>
      <label className="sr-only" htmlFor="clearing-desk-search">Search pending transactions</label>
      <input
        id="clearing-desk-search"
        aria-label="Search pending transactions"
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder="SEARCH..."
      />
      <div className="depot-heading">{depot}</div>
      {matches.map(payee => (
        <PayeeCard
          key={payee.id}
          payee={payee}
          selected={payee.id === selectedId}
          onSelect={() => onSelect(payee.id)}
        />
      ))}
      {matches.length === 0 && <p className="no-results">No matching transactions.</p>}
    </aside>
  );
}
