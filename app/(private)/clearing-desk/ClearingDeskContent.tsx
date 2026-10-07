"use client";

import { useEffect, useState } from 'react';
import { useClearingDesk } from '@/hooks/useClearingDesk';
import PendingQueue from './components/PendingQueue';
import ClearingPanel from './components/ClearingPanel';
import PayeeEditor from './components/PayeeEditor';
import ApproveButton from './components/ApproveButton';
import RouteBalanceResume from './components/RouteBalanceResume';
import PayableEstimate from './components/PayableEstimate';
import ManagementNotes from './components/ManagementNotes';
import ClearedSession from './components/ClearedSession';
import CompletionPanel from './components/CompletionPanel';
import ProgressNotice from './components/ProgressNotice';
import { computeClearedTotal } from './utils/clearedTotal';
import './styles.css';

export default function ClearingDeskContent() {
  const { board, isLoading, isError, refetch, approve, restore, savePayee, saveNote } = useClearingDesk({});
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [goalDismissed, setGoalDismissed] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const pending = board ? board.payees.filter(p => !board.cleared.includes(p.id)) : [];
  const active = pending.find(p => p.id === selectedId) ?? pending[0];
  const clearedTotal = board
    ? computeClearedTotal(board.payees, board.cleared, board.routeSummary.stops)
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
    <div className="clearing-desk page-stagger">
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
            >
              {board.cleared.length === 3 && !goalDismissed && (
                <ProgressNotice
                  remaining={board.payees.length - board.cleared.length}
                  percent={Math.round((board.cleared.length / board.payees.length) * 100)}
                  onDismiss={() => setGoalDismissed(true)}
                />
              )}
            </PendingQueue>
            <section className="bench" aria-label="Selected transaction">
              {active ? (
                <>
                  {editing ? (
                    <article className="payee-card is-editing">
                      <div className="route-seam">ROUTE: {active.id}</div>
                      <PayeeEditor
                        key={active.id}
                        payee={active}
                        onSave={update => { savePayee(active.id, update); setEditing(false); }}
                      />
                      {/* The design frame keeps the approve column beside the
                          form — present but inert, so the card keeps both panes
                          and its proportions while editing. */}
                      <ApproveButton
                        key={`approve-${active.id}`}
                        payee={active}
                        onApprove={() => approve(active.id)}
                        disabled
                      />
                    </article>
                  ) : (
                    <ClearingPanel
                      // Keyed like the editor beside it: the panel holds a
                      // confirmation state, and without this React reuses the
                      // instance when the next payee takes the panel — leaving
                      // the new payee's button green and swallowing its click.
                      key={active.id}
                      payee={active}
                      onEdit={() => setEditing(true)}
                      onApprove={() => approve(active.id)}
                    />
                  )}
                  <RouteBalanceResume summary={board.routeSummary} />
                  <PayableEstimate perStop={active.perStop} stops={board.routeSummary.stops} />
                  <ManagementNotes
                    payeeId={active.id}
                    onSave={note => saveNote(active.id, note, () => setToast('Note saved.'))}
                  />
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
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
