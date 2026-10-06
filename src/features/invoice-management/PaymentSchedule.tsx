'use client';

import { useEffect, useMemo, useState } from 'react';
import { restoreInvoiceStages } from '@/lib/invoice-workflow';
import {
  PAYMENT_METHODS,
  RUNS_AHEAD,
  buildSchedule,
  closeRun,
  hold,
  release,
  reschedule,
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
  const [loaded, setLoaded] = useState(false);
  /** The run date the user has armed for closing — the one irreversible step. */
  const [closing, setClosing] = useState<number | null>(null);
  // Fixed for the life of the desk: the runs must not slide under the user.
  const [today] = useState(() => new Date());

  useEffect(() => {
    try {
      const stages = localStorage.getItem(workflowKey);
      if (stages) setRecords(restoreInvoiceStages(seed, JSON.parse(stages)) as PayableRecord[]);
      const saved = localStorage.getItem(scheduleKey);
      if (saved) setState(JSON.parse(saved));
    } catch { /* A prototype that cannot read its storage simply starts fresh. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(scheduleKey, JSON.stringify(state)); }
    catch { /* The desk still works for this session without storage. */ }
  }, [state, loaded]);

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
              onClick={() => { setMethod(item.id); setOpenDate(null); setClosing(null); }}
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
            onClick={() => { setMethod(run.method); setOpenDate(run.date.getTime()); setClosing(null); }}
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
          <>
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
            <div className="pay-close">
              {closing === open.date.getTime() ? (
                <>
                  <p className="pay-close-ask">
                    SETTLE {longDate(open.date)} · {open.invoices.length} INVOICES · {money(open.net)}
                  </p>
                  <div className="pay-close-pair">
                    <button
                      type="button"
                      className="pay-close-go"
                      onClick={() => {
                        setState(current => closeRun(current, open));
                        setClosing(null);
                      }}
                    >
                      CONFIRM
                    </button>
                    <button type="button" onClick={() => setClosing(null)}>CANCEL</button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="pay-close-go"
                  disabled={!open.invoices.length}
                  onClick={() => setClosing(open.date.getTime())}
                >
                  CLOSE RUN
                </button>
              )}
            </div>
          </header>

            <table className="pay-table">
              <thead>
                <tr>
                  <th scope="col">INVOICE</th>
                  <th scope="col">SUBCONTRACTOR / PERIOD</th>
                  <th scope="col">PAYMENT DATE</th>
                  <th scope="col" className="pay-right">GROSS</th>
                  <th scope="col" className="pay-right">DEDUCTION</th>
                  <th scope="col" className="pay-right">NET</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {open.invoices.map(invoice => (
                  <tr key={invoice.record.id}>
                    <td className="pay-id">{invoice.record.id}</td>
                    <td>
                      <span className="pay-vendor">{invoice.record.vendor}</span>
                      <span className="pay-period">{invoice.record.period.toUpperCase()}</span>
                    </td>
                    <td className="pay-id">{longDate(invoice.date!)}</td>
                    <td className="pay-right">{money(invoice.gross)}</td>
                    <td className="pay-right">− {money(invoice.deduction)}</td>
                    <td className="pay-right pay-net">{money(invoice.net)}</td>
                    <td>
                      <span className={`pay-status${invoice.shift ? ' is-moved' : ''}`}>
                        {invoice.shift ? 'RESCHEDULED' : 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="pay-actions">
                      <button type="button" onClick={() => setState(current => reschedule(current, invoice.record.id))}>
                        RESCHEDULE
                      </button>
                      <button type="button" onClick={() => setState(current => hold(current, invoice.record.id))}>
                        HOLD
                      </button>
                    </td>
                  </tr>
                ))}
                {!open.invoices.length && (
                  <tr><td colSpan={8} className="pay-empty">Nothing scheduled for this date.</td></tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p className="pay-empty">No runs ahead for this method.</p>
        )}
      </section>

      {schedule.held.length > 0 && (
        <section className="pay-held" aria-label="Held invoices">
          <h2>ON HOLD · {schedule.held.length}</h2>
          <p className="pay-held-note">Held invoices sit under no payment date until they are released.</p>
          {schedule.held.map(invoice => (
            <article className="pay-held-row" key={invoice.record.id}>
              <span className="pay-id">{invoice.record.id}</span>
              <span className="pay-vendor">{invoice.record.vendor}</span>
              <span className="pay-held-method">{labelOf(invoice.method)}</span>
              <strong>{money(invoice.net)}</strong>
              <button type="button" onClick={() => setState(current => release(current, invoice.record.id))}>
                RELEASE
              </button>
            </article>
          ))}
        </section>
      )}

      <p className="pay-note">Prototype, saved in this browser. No payment is made or sent.</p>
    </section>
  );
}
