'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, GripVertical, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { INVOICE_STAGES, nextInvoiceStage, moveInvoice, restoreInvoiceStages, type InvoiceStage, type WorkflowRecord } from '@/lib/invoice-workflow';
import seedData from './records.json';
import './kanban.css';

const seed = seedData as WorkflowRecord[];
const storageKey = 'logix.invoice-workflow.v1';
const currency = (pence: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
type Selection = { id: string; from: InvoiceStage; to?: InvoiceStage };

export default function InvoiceBoard({ history = false }: { history?: boolean }) {
  const [records, setRecords] = useState(seed);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState('');

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

  const filtered = useMemo(() => records.filter(record => `${record.id} ${record.vendor} ${record.period}`.toLowerCase().includes(query.trim().toLowerCase())), [records, query]);
  const selected = records.find(record => record.id === selection?.id);
  const visibleStages = history ? INVOICE_STAGES.filter(stage => stage.id === 'invoiced') : INVOICE_STAGES;
  const dragged = records.find(record => record.id === draggedId);
  const total = records.reduce((sum, record) => sum + record.amount, 0);

  function open(record: WorkflowRecord, to?: InvoiceStage) {
    setReviewed(false);
    setSelection({ id: record.id, from: record.status, to });
  }

  function confirm() {
    if (!selection?.to || !selected || selected.status !== selection.from || (selected.status === 'pending' && !reviewed)) return;
    const { id, from, to } = selection;
    setRecords(current => moveInvoice(current, id, from, to));
    setNotice(`${id} moved to ${INVOICE_STAGES.find(stage => stage.id === to)?.label}.`);
    setSelection(null);
  }

  return (
    <section className="invoice-kanban" aria-label={history ? 'Invoices history' : 'Invoice kanban'}>
      <header className="ik-heading">
        <div><p className="ik-eyebrow">FINANCE / INVOICES</p><h1>{history ? 'Invoices history' : 'Invoice Processing Workflow'}</h1><p>Track each record from the current period to invoicing.</p></div>
        <div className="ik-total"><span>{records.length} RECORDS / TOTAL VALUE</span><strong>{currency(total)}</strong></div>
      </header>
      <div className="ik-toolbar">
        <label className="ik-search"><Search size={16} /><input type="search" aria-label="Search invoice records" placeholder="Search subcontractor or record ID…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <p>{history ? 'Completed invoices' : 'Move records one stage at a time. Drag a card or use its action.'}</p>
        <span className="ik-prototype">PROTOTYPE · SAVED IN THIS BROWSER</span>
      </div>
      {storageError && <p className="ik-notice" role="alert">{storageError}</p>}
      <p className="ik-announcement" role="status" aria-live="polite">{notice}</p>
      <div className={`ik-board ${history ? 'ik-history' : ''}`}>
        {visibleStages.map(stage => {
          const all = records.filter(record => record.status === stage.id);
          const cards = filtered.filter(record => record.status === stage.id);
          const canDrop = Boolean(dragged && nextInvoiceStage(dragged.status) === stage.id);
          return <section key={stage.id} className={`ik-column ik-${stage.id} ${canDrop ? 'ik-drop-allowed' : ''}`} aria-label={stage.label} onDragOver={event => { if (canDrop) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={event => {
            event.preventDefault();
            if (canDrop && dragged) open(dragged, stage.id);
            setDraggedId(null);
          }}>
            <header className="ik-column-heading"><div><span className="ik-step">0{INVOICE_STAGES.indexOf(stage) + 1}</span><h2>{stage.label}</h2><span className="ik-count">{all.length}</span></div><strong>{currency(all.reduce((sum, record) => sum + record.amount, 0))}</strong></header>
            <div className="ik-cards" role="region" aria-label={`${stage.label} records`} tabIndex={0}>
              {cards.map(record => <article key={record.id} className="ik-card" data-record-id={record.id} draggable={loaded && stage.id !== 'invoiced'} onDragStart={event => { setDraggedId(record.id); event.dataTransfer.setData('text/plain', record.id); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDraggedId(null)}>
                <div className="ik-card-top"><span>{record.id}</span>{stage.id !== 'invoiced' ? <GripVertical size={15} aria-hidden="true" /> : <FileText size={15} aria-hidden="true" />}</div>
                <h3>{record.vendor}</h3><div className="ik-card-value"><span>{record.period}</span><strong>{currency(record.amount)}</strong></div>
                <footer><button className="ik-detail" onClick={() => open(record)}>View details</button>{stage.action && <button disabled={!loaded} className="ik-advance" onClick={() => open(record, nextInvoiceStage(record.status))}>{stage.action}<ArrowRight size={13} /></button>}</footer>
              </article>)}
              {!cards.length && <p className="ik-empty">{query ? 'No matching records in this stage.' : 'No records in this stage.'}</p>}
            </div>
          </section>;
        })}
      </div>
      <Dialog open={Boolean(selection)} onOpenChange={isOpen => { if (!isOpen) setSelection(null); }}>
        <DialogContent className="ik-dialog">
          <DialogTitle>{selection?.to ? INVOICE_STAGES.find(stage => stage.id === selection.from)?.action : 'Record details'}</DialogTitle>
          <DialogDescription>{selection?.to ? 'Review this record before moving it to the next stage.' : 'The current status and details of this record.'}</DialogDescription>
          {selected && <>
            <div className="ik-dialog-record"><span>{selected.id}</span><h3>{selected.vendor}</h3><strong>{currency(selected.amount)}</strong><span>{selected.period}</span></div>
            <div className="ik-transition"><span>{INVOICE_STAGES.find(stage => stage.id === selected.status)?.label}</span>{selection?.to && <><ArrowRight size={16} /><strong>{INVOICE_STAGES.find(stage => stage.id === selection.to)?.label}</strong></>}</div>
            {selection?.to && selected.status === 'pending' && <label className="ik-review"><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} />I have reviewed the routes, rates and deductions for this record.</label>}
            {selection?.to === 'invoiced' && <p className="ik-demo-note">This updates the prototype status. No invoice is issued or sent.</p>}
            <div className="ik-dialog-actions"><button onClick={() => setSelection(null)}>{selection?.to ? 'Cancel' : 'Close'}</button>{selection?.to && <button className="ik-confirm" disabled={selected.status === 'pending' && !reviewed} onClick={confirm}>{selected.status === 'pending' ? 'Mark as verified' : INVOICE_STAGES.find(stage => stage.id === selected.status)?.action}<ArrowRight size={14} /></button>}</div>
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
