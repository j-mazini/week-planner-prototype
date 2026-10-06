'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, FileText, Search } from 'lucide-react';
import {
  INVOICE_STAGES,
  moveInvoice,
  nextInvoiceStage,
  previousInvoiceStage,
  restoreInvoiceStages,
  type InvoiceStage,
  type WorkflowRecord,
} from '@/lib/invoice-workflow';
// Shared with /clearing-desk on purpose: the two desks work the same way, so a
// card leaving one column and arriving in the other should move identically.
import {
  APPROVE_CONFIRM_MS,
  CARD_ENTER,
  CARD_SETTLED,
  CLEARED_EXIT,
  QUEUE_EXIT,
  cardTransition,
} from '@/app/(private)/clearing-desk/motion';
import InvoiceDocument from './InvoiceDocument';
import seedData from './records.json';
import './desk.css';

const seed = seedData as WorkflowRecord[];
const storageKey = 'logix.invoice-workflow.v1';
const currency = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
const stageOf = (id: InvoiceStage) => INVOICE_STAGES.find(stage => stage.id === id);

type DetailProps = {
  record: WorkflowRecord;
  loaded: boolean;
  reviewed: boolean;
  onReview: (value: boolean) => void;
  confirming: boolean;
  onAdvance: () => void;
};

/** The record itself: facts, the action that moves it on, and where it sits. */
function RecordDetail({ record, loaded, reviewed, onReview, confirming, onAdvance }: DetailProps) {
  const stage = stageOf(record.status);
  const next = nextInvoiceStage(record.status);
  const needsReview = record.status === 'pending';
  const position = INVOICE_STAGES.findIndex(item => item.id === record.status);

  return (
    <>
      <article className="idk-record">
        <div className="idk-record-seam">RECORD: {record.id}</div>
        <div className="idk-record-body">
          <h3>{record.vendor}</h3>
          <dl className="idk-record-facts">
            <div><dt>Period</dt><dd>{record.period}</dd></div>
            <div><dt>Value</dt><dd>{currency(record.amount)}</dd></div>
            <div><dt>Stage</dt><dd>{stage?.label}</dd></div>
          </dl>
        </div>
        <div className="idk-approve">
          <span className="idk-approve-next">
            {stage?.label}
            <ArrowRight size={13} aria-hidden="true" />
            {next && stageOf(next)?.label}
          </span>
          <button
            type="button"
            className={`idk-approve-btn${confirming ? ' is-confirming' : ''}`}
            disabled={!loaded || (needsReview && !reviewed)}
            onClick={onAdvance}
          >
            {confirming ? <><Check size={15} aria-hidden="true" /> Registered</> : stage?.action}
          </button>
        </div>
      </article>

      {needsReview && (
        <label className="idk-review">
          <input type="checkbox" checked={reviewed} onChange={event => onReview(event.target.checked)} />
          I have reviewed the routes, rates and deductions for this record.
        </label>
      )}

      <ol className="idk-stages" aria-label="Workflow stages">
        {INVOICE_STAGES.map((item, index) => (
          <li
            key={item.id}
            className={`idk-stage${index < position ? ' is-done' : ''}${index === position ? ' is-current' : ''}`}
            aria-current={index === position ? 'step' : undefined}
          >
            <span className="idk-stage-dot" aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function InvoiceBoard({ history = false }: { history?: boolean }) {
  const [records, setRecords] = useState(seed);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Records moved on in this session, newest first — the right-hand column. */
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState('');
  const reduced = useReducedMotion() ?? false;
  const { enter, exit } = cardTransition(reduced);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setRecords(restoreInvoiceStages(seed, JSON.parse(stored)));
    } catch { setStorageError('Saved progress could not be loaded. Changes will remain available in this session.'); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(records.map(record => [record.id, record.status]))));
    } catch { setStorageError('Changes could not be saved in this browser. Keep this page open to retain your progress.'); }
  }, [records, loaded]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const byId = useMemo(() => new Map(records.map(record => [record.id, record])), [records]);
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  const invoiced = records.filter(record => record.status === 'invoiced');

  /** The desk holds every record still short of invoiced, whatever stage it is at. */
  const open = records.filter(record => record.status !== 'invoiced');
  const matches = open.filter(record =>
    `${record.id} ${record.vendor} ${record.period}`.toLowerCase().includes(query.trim().toLowerCase()));
  const active = open.find(record => record.id === selectedId) ?? open[0];
  const needsReview = active?.status === 'pending';
  const clearedTotal = clearedIds.reduce((sum, id) => sum + (byId.get(id)?.amount ?? 0), 0);

  function advance() {
    if (!active || confirming) return;
    const to = nextInvoiceStage(active.status);
    if (!to || (needsReview && !reviewed)) return;
    const { id, status } = active;
    // Only invoicing takes a record off the desk. Every stage before it is
    // still work to do, so the card stays in the queue and changes its badge.
    const leaves = to === 'invoiced';
    // The tick stays long enough to read as registered, then the card moves.
    setConfirming(true);
    setTimeout(() => {
      setRecords(current => moveInvoice(current, id, status, to));
      if (leaves) {
        setClearedIds(current => [id, ...current]);
        setSelectedId(null);
      } else {
        // The desk carries on with the same record, one stage further along.
        setSelectedId(id);
      }
      setReviewed(false);
      setConfirming(false);
      setNotice(`${id} moved to ${stageOf(to)?.label}.`);
    }, reduced ? 0 : APPROVE_CONFIRM_MS);
  }

  function restore(id: string) {
    const record = byId.get(id);
    const back = record && previousInvoiceStage(record.status);
    if (!record || !back) return;
    // `moveInvoice` only ever goes forward, so a return steps the record back
    // directly — `previousInvoiceStage` is what keeps it to one stage.
    setRecords(current => current.map(item => item.id === id ? { ...item, status: back } : item));
    setClearedIds(current => current.filter(item => item !== id));
    setSelectedId(id);
    setNotice(`${id} returned to ${stageOf(back)?.label}.`);
  }

  if (history) {
    return (
      <section className="invoice-desk" aria-label="Invoices history">
        <header className="idk-heading">
          <div>
            <p className="idk-eyebrow">FINANCE / INVOICES</p>
            <h1>Invoices history</h1>
            <p>Records that completed the workflow.</p>
          </div>
          <div className="idk-total">
            <span>{invoiced.length} INVOICED / TOTAL VALUE</span>
            <strong>{currency(invoiced.reduce((sum, record) => sum + record.amount, 0))}</strong>
          </div>
        </header>
        <div className="idk-history">
          {invoiced.map(record => (
            <article className="idk-history-row" key={record.id}>
              <FileText size={15} aria-hidden="true" />
              <span className="idk-id">{record.id}</span>
              <h3>{record.vendor}</h3>
              <span className="idk-period">{record.period}</span>
              <strong>{currency(record.amount)}</strong>
            </article>
          ))}
          {!invoiced.length && <p className="idk-empty">No invoices issued yet.</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="invoice-desk" aria-label="Invoice processing desk">
      <header className="idk-heading">
        <div>
          <p className="idk-eyebrow">FINANCE / INVOICES</p>
          <h1>Invoice Processing Workflow</h1>
          <p>Work the queue one record at a time, from the current period to invoicing.</p>
        </div>
        <div className="idk-total">
          <span>{records.length} RECORDS / TOTAL VALUE</span>
          <strong>{currency(total)}</strong>
        </div>
      </header>

      {storageError && <p className="idk-notice" role="alert">{storageError}</p>}
      <p className="idk-announcement" role="status" aria-live="polite">{notice}</p>

      <div className="idk-columns">
        <aside className="idk-queue" aria-label="Records awaiting action">
          <div className="idk-queue-head">
            <h2>AWAITING ACTION</h2>
            <span>{open.length} TOTAL</span>
          </div>
          <label className="idk-search">
            <Search size={15} aria-hidden="true" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="SEARCH..."
              aria-label="Search records"
            />
          </label>
          <div className="idk-queue-scroll">
          <AnimatePresence initial={false}>
            {matches.map(record => (
              <motion.button
                layout
                key={record.id}
                initial={CARD_ENTER}
                animate={{ ...CARD_SETTLED, transition: enter }}
                exit={{ ...QUEUE_EXIT, transition: exit }}
                type="button"
                className={`idk-queue-card${record.id === active?.id ? ' selected' : ''}`}
                aria-pressed={record.id === active?.id}
                onClick={() => { setSelectedId(record.id); setReviewed(false); }}
              >
                <span className="idk-card-row">
                  <span className="idk-id">{record.id}</span>
                  <span className="idk-stage-badge">{stageOf(record.status)?.label}</span>
                </span>
                <span className="idk-card-row">
                  <span>{record.vendor}</span>
                  <strong>{currency(record.amount)}</strong>
                </span>
                <span className="idk-period">{record.period}</span>
              </motion.button>
            ))}
          </AnimatePresence>
          {!matches.length && <p className="idk-empty">{query ? 'No matching records.' : 'Nothing left to action.'}</p>}
          </div>
        </aside>

        <section className="idk-bench" aria-label="Selected record">
          {active ? (
            <>
              <RecordDetail
                record={active}
                loaded={loaded}
                reviewed={reviewed}
                onReview={setReviewed}
                confirming={confirming}
                onAdvance={advance}
              />
              <div className="idk-paper">
                <InvoiceDocument record={active} />
              </div>
              <p className="idk-demo-note">
                Prototype, saved in this browser. No invoice is issued or sent.
              </p>
            </>
          ) : (
            <div className="idk-done">
              <Check size={22} aria-hidden="true" />
              <h3>The queue is clear</h3>
              <p>Every record has been moved on for this session.</p>
            </div>
          )}
        </section>

        <aside className="idk-session" aria-label="Moved on in this session">
          <div className="idk-session-counter">
            <h2>{clearedIds.length} MOVED ON</h2>
            <div><span style={{ width: `${records.length ? (clearedIds.length / records.length) * 100 : 0}%` }} /></div>
          </div>
          <div className="idk-session-head">
            THIS SESSION
            {clearedIds.length > 0 && <span>TOTAL: {currency(clearedTotal)}</span>}
          </div>
          <div className="idk-session-list">
            <AnimatePresence initial={false}>
              {clearedIds.map(id => {
                const record = byId.get(id);
                if (!record) return null;
                return (
                  <motion.article
                    layout
                    key={id}
                    initial={CARD_ENTER}
                    animate={{ ...CARD_SETTLED, transition: enter }}
                    exit={{ ...CLEARED_EXIT, transition: exit }}
                    className="idk-session-card"
                  >
                    <div className="idk-card-row">
                      <span className="idk-id">{record.id}</span>
                      <span className="idk-stage-badge is-done">{stageOf(record.status)?.label}</span>
                    </div>
                    <h3>{record.vendor}</h3>
                    <div className="idk-card-row">
                      <strong>{currency(record.amount)}</strong>
                      <button type="button" onClick={() => restore(id)} aria-label={`Return ${record.vendor} to the queue`}>
                        <span aria-hidden="true">⤺</span> RETURN
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
            {!clearedIds.length && <p className="idk-empty">Nothing moved on yet.</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
