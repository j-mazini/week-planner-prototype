'use client';

import { useEffect, useMemo, useState } from 'react';
import { restoreInvoiceStages } from '@/lib/invoice-workflow';
import {
  PAYMENT_METHODS,
  RUNS_AHEAD,
  buildSchedule,
  type PayableRecord,
  type PaymentMethod,
  type ScheduleState,
} from '@/lib/payment-runs';
import seedData from './records.json';
import './schedule.css';

const seed = seedData as PayableRecord[];
const workflowKey = 'logix.invoice-workflow.v1';
const scheduleKey = 'logix.payment-schedule.v1';

const money = (pence: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
const longDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(date).toUpperCase();
const shortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
const weekday = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(date).toUpperCase();
const labelOf = (method: PaymentMethod) => PAYMENT_METHODS.find(item => item.id === method)!.label;

export default function PaymentSchedule() {
  const [records, setRecords] = useState(seed);
  const [state, setState] = useState<ScheduleState>({});
  const [method, setMethod] = useState<PaymentMethod>('weekly-bank');
  const [openDate, setOpenDate] = useState<number | null>(null);
  // Fixed for the life of the desk: the runs must not slide under the user.
  const [today] = useState(() => new Date());

  useEffect(() => {
    try {
      const stages = localStorage.getItem(workflowKey);
      if (stages) setRecords(restoreInvoiceStages(seed, JSON.parse(stages)) as PayableRecord[]);
      const saved = localStorage.getItem(scheduleKey);
      if (saved) setState(JSON.parse(saved));
    } catch { /* A prototype that cannot read its storage simply starts fresh. */ }
  }, []);

  const schedule = useMemo(() => buildSchedule(records, state, today, RUNS_AHEAD), [records, state, today]);
  const forMethod = schedule.runs.filter(run => run.method === method);
  const open = schedule.runs.find(run => run.date.getTime() === openDate) ?? forMethod[0];
  const net = schedule.runs.reduce((sum, run) => sum + run.net, 0);
  const scheduled = schedule.runs.reduce((sum, run) => sum + run.invoices.length, 0);

  return (
    <section className="pay-desk" aria-label="Schedule for payment">
      <header className="pay-heading">
        <div>
          <p className="pay-eyebrow">FINANCE / INVOICES</p>
          <h1>Schedule for Payment</h1>
          <p>{scheduled} invoices scheduled across both payment methods.</p>
        </div>
        <div className="pay-total">
          <span>NET PAYABLE / RUNS AHEAD</span>
          <strong>{money(net)}</strong>
        </div>
      </header>

      <div className="pay-methods" aria-label="Payment methods">
        {PAYMENT_METHODS.map(item => {
          const next = schedule.runs.find(run => run.method === item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`pay-method${item.id === method ? ' selected' : ''}`}
              aria-pressed={item.id === method}
              onClick={() => { setMethod(item.id); setOpenDate(null); }}
            >
              <span className="pay-method-name">{item.label}</span>
              <span className="pay-method-cadence">{item.cadence}</span>
              <span className="pay-method-date">{next ? longDate(next.date) : '—'}</span>
              <span className="pay-method-figures">
                <span>{next?.invoices.length ?? 0} INVOICES</span>
                <strong>{money(next?.net ?? 0)}</strong>
              </span>
            </button>
          );
        })}
      </div>

      <div className="pay-strip" aria-label="Upcoming payment runs">
        {schedule.runs.map(run => (
          <button
            key={`${run.method}-${run.date.toISOString()}`}
            type="button"
            className={`pay-slot${run.date.getTime() === open?.date.getTime() ? ' selected' : ''}`}
            aria-pressed={run.date.getTime() === open?.date.getTime()}
            onClick={() => { setMethod(run.method); setOpenDate(run.date.getTime()); }}
          >
            <span className="pay-slot-date">{shortDate(run.date)}</span>
            <span className="pay-slot-method">
              {run.method === 'weekly-bank' ? 'BANK' : 'SELF-BILLING'}
            </span>
            <span className="pay-slot-count">{run.invoices.length}</span>
          </button>
        ))}
      </div>

      <section className="pay-run" aria-label="Selected payment run">
        {open ? (
          <header className="pay-run-head">
            <div>
              <p className="pay-run-when">{longDate(open.date)}</p>
              <p className="pay-run-meta">
                {weekday(open.date)} · {labelOf(open.method)} · {open.invoices.length} INVOICES
              </p>
            </div>
            <dl className="pay-run-totals">
              <div><dt>GROSS AMOUNT</dt><dd>{money(open.gross)}</dd></div>
              <div><dt>DEDUCTIONS</dt><dd>− {money(open.deductions)}</dd></div>
              <div className="pay-run-net"><dt>NET PAYABLE</dt><dd>{money(open.net)}</dd></div>
            </dl>
          </header>
        ) : (
          <p className="pay-empty">No runs ahead for this method.</p>
        )}
      </section>

      <p className="pay-note">Prototype, saved in this browser. No payment is made or sent.</p>
    </section>
  );
}
