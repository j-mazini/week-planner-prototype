import type { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Payee } from '../types';
import { displayVehicle } from '../utils/mappers';
import PayeeCard from './PayeeCard';

export default function PendingQueue({
  payees, depot, selectedId, query, onQueryChange, onSelect, children,
}: {
  payees: Payee[]; depot: string; selectedId: string | null;
  query: string; onQueryChange: (value: string) => void; onSelect: (id: string) => void;
  children?: ReactNode;
}) {
  const matches = payees.filter(p =>
    `${p.id} ${p.name} ${displayVehicle(p)}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <aside className="pending-panel" aria-label="Pending authorizations">
      <div className="pending-heading">
        <h2>PENDING AUTH</h2>
        <span>{payees.length} TOTAL</span>
      </div>
      <label className="sr-only" htmlFor="clearing-desk-search">Search pending transactions</label>
      <input
        id="clearing-desk-search"
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder="SEARCH..."
      />
      <div className="depot-heading">{depot}</div>
      {children}
      <AnimatePresence initial={false}>
        {matches.map(payee => (
          <PayeeCard
            key={payee.id}
            payee={payee}
            selected={payee.id === selectedId}
            onSelect={() => onSelect(payee.id)}
          />
        ))}
      </AnimatePresence>
      {matches.length === 0 && <p className="no-results">No matching transactions.</p>}
    </aside>
  );
}
