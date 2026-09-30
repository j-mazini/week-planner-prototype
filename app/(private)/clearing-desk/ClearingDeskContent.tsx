"use client";

import { useState } from 'react';
import { useClearingDesk } from '@/hooks/useClearingDesk';
import PendingQueue from './components/PendingQueue';
import './styles.css';

export default function ClearingDeskContent() {
  const { board, isLoading, isError, refetch } = useClearingDesk({});
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pending = board ? board.payees.filter(p => !board.cleared.includes(p.id)) : [];
  const active = pending.find(p => p.id === selectedId) ?? pending[0];

  if (isError) {
    return (
      <div className="clearing-desk">
        <p role="alert">Could not load the clearing desk.</p>
        <button type="button" onClick={() => void refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div className="clearing-desk">
      <header className="page-heading">
        <h1>CLEARING DESK</h1>
        <p>Payment authorization &amp; clearing</p>
      </header>
      {isLoading || !board
        ? <p role="status">Loading transactions…</p>
        : (
          <div className="desk-columns">
            <PendingQueue
              payees={pending}
              depot={board.depot}
              selectedId={active?.id ?? null}
              query={query}
              onQueryChange={setQuery}
              onSelect={id => { setSelectedId(id); setEditing(false); }}
            />
          </div>
        )}
    </div>
  );
}
