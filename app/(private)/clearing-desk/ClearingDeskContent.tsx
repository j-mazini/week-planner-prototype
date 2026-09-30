"use client";

import { useState } from 'react';
import { useClearingDesk } from '@/hooks/useClearingDesk';
import PendingQueue from './components/PendingQueue';
import ClearingPanel from './components/ClearingPanel';
import PayeeEditor from './components/PayeeEditor';
import RouteBalanceResume from './components/RouteBalanceResume';
import PayableEstimate from './components/PayableEstimate';
import ManagementNotes from './components/ManagementNotes';
import ClearedSession from './components/ClearedSession';
import CompletionPanel from './components/CompletionPanel';
import './styles.css';

export default function ClearingDeskContent() {
  const { board, isLoading, isError, refetch, approve, restore, savePayee, saveNote } = useClearingDesk({});
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pending = board ? board.payees.filter(p => !board.cleared.includes(p.id)) : [];
  const active = pending.find(p => p.id === selectedId) ?? pending[0];
  const clearedTotal = board
    ? board.cleared.reduce((sum, id) => {
        const payee = board.payees.find(p => p.id === id);
        return payee ? sum + payee.perStop * board.routeSummary.stops : sum;
      }, 0)
    : 0;

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
            <section className="bench" aria-label="Selected transaction">
              {active ? (
                <>
                  {editing ? (
                    <article className="payee-card is-editing">
                      <div className="route-seam">ROUTE: {active.id}</div>
                      <PayeeEditor
                        key={active.id}
                        payee={active}
                        onCancel={() => setEditing(false)}
                        onSave={update => { savePayee(active.id, update); setEditing(false); }}
                      />
                    </article>
                  ) : (
                    <ClearingPanel
                      payee={active}
                      onEdit={() => setEditing(true)}
                      onApprove={() => approve(active.id)}
                    />
                  )}
                  <RouteBalanceResume summary={board.routeSummary} />
                  <PayableEstimate perStop={active.perStop} stops={board.routeSummary.stops} />
                  <ManagementNotes payeeId={active.id} onSave={note => saveNote(active.id, note)} />
                </>
              ) : (
                <CompletionPanel />
              )}
            </section>
            <ClearedSession
              payees={board.payees}
              clearedIds={board.cleared}
              total={clearedTotal}
              onReturn={restore}
            />
          </div>
        )}
    </div>
  );
}
