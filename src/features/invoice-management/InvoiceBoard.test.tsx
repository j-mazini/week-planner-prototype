// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import InvoiceBoard from './InvoiceBoard';
import records from './records.json';

const first = records[0];
const second = records[1];
/** The one record that starts a stage short of invoicing. */
const ready = records.find(record => record.status === 'ready')!;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const bench = () => within(screen.getByLabelText('Selected record'));
const queue = () => within(screen.getByLabelText('Records awaiting action'));
const session = () => within(screen.getByLabelText('Moved on in this session'));
const card = (id: string) => queue().queryByRole('button', { name: new RegExp(id) });

describe('invoice desk', () => {
  it('shows the selected record\'s invoice on the bench, not over it', () => {
    render(<InvoiceBoard />);
    const sheet = bench().getByLabelText(/Self billing invoice/);
    expect(sheet).toBeInTheDocument();
    expect(within(sheet).getByText('BA EXPRESS LIMITED')).toBeInTheDocument();
    // Nothing is laid over the desk: the invoice is part of the screen.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('bills the balance the desk is showing for that record', () => {
    render(<InvoiceBoard />);
    const sheet = bench().getByLabelText(/Self billing invoice/);
    const balance = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(first.amount / 100);
    expect(within(sheet).getByText(/BALANCE DUE/)).toBeInTheDocument();
    expect(within(sheet).getAllByText(balance).length).toBeGreaterThan(0);
  });

  it('swaps the invoice in place when another record is picked', () => {
    render(<InvoiceBoard />);
    // The vendor reads twice on the bench — on the record and on its invoice.
    expect(within(bench().getByLabelText(/Self billing invoice/)).getByText(first.vendor)).toBeInTheDocument();

    fireEvent.click(card(second.id)!);

    const sheet = bench().getByLabelText(/Self billing invoice/);
    expect(within(sheet).getByText(second.vendor)).toBeInTheDocument();
    expect(within(sheet).queryByText(first.vendor)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('a record leaves the queue only once it is invoiced', () => {
  it('keeps the card on the left and moves its badge on at every stage before', async () => {
    render(<InvoiceBoard />);
    fireEvent.click(card(first.id)!);
    fireEvent.click(bench().getByRole('checkbox'));
    fireEvent.click(bench().getByRole('button', { name: /Verify record/i }));

    await waitFor(() => expect(within(card(first.id)!).getByText('Ready for Invoicing')).toBeInTheDocument());
    expect(session().getByText('Nothing moved on yet.')).toBeInTheDocument();
    // The desk stays on the record it just moved, one stage further along.
    expect(bench().getByRole('button', { name: /Generate invoice/i })).toBeInTheDocument();
  });

  it('takes the card off the desk when invoicing is the stage it reaches', async () => {
    render(<InvoiceBoard />);
    fireEvent.click(card(ready.id)!);
    fireEvent.click(bench().getByRole('button', { name: /Generate invoice/i }));

    await waitFor(() => expect(card(ready.id)).not.toBeInTheDocument());
    expect(session().getByText(ready.id)).toBeInTheDocument();
  });
});

const invoiced = records.filter(record => record.status === 'invoiced');
const months = () => within(screen.getByLabelText('Invoice months'));
const rows = () => screen.getAllByRole('article');
const gbp = (pence: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pence / 100);
const inMonth = (period: string) => invoiced.filter(record => record.period === period);

describe('the invoices history', () => {
  it('opens on every month there is, and lists what was issued', () => {
    render(<InvoiceBoard history />);
    expect(months().getByRole('button', { name: /ALL MONTHS/ })).toHaveAttribute('aria-pressed', 'true');
    expect(rows()).toHaveLength(invoiced.length);
    expect(screen.getByText(`${invoiced.length} INVOICED / TOTAL VALUE`)).toBeInTheDocument();
  });

  it('offers only the months that have an invoice, newest first', () => {
    render(<InvoiceBoard history />);
    const offered = months().getAllByRole('button').map(button => button.textContent);
    const periods = [...new Set(invoiced.map(record => record.period))];
    expect(offered).toHaveLength(periods.length + 1);
    expect(offered[0]).toMatch(/ALL MONTHS/);
    // Newest first, and by date rather than by spelling: Sep before Aug.
    expect(offered[1]).toMatch(/SEP 2026/);
    expect(offered[2]).toMatch(/AUG 2026/);
    // A month nothing was issued in is not a choice.
    expect(months().queryByRole('button', { name: /JUL 2026/ })).not.toBeInTheDocument();
  });

  it('narrows the list to the month that was picked', () => {
    render(<InvoiceBoard history />);
    fireEvent.click(months().getByRole('button', { name: /AUG 2026/ }));

    const august = inMonth('Aug 2026');
    expect(rows()).toHaveLength(august.length);
    for (const record of august) expect(screen.getByText(record.id)).toBeInTheDocument();
    for (const record of inMonth('Sep 2026')) expect(screen.queryByText(record.id)).not.toBeInTheDocument();
  });

  it('moves the heading total onto the month, so it never reads for another', () => {
    render(<InvoiceBoard history />);
    fireEvent.click(months().getByRole('button', { name: /AUG 2026/ }));

    const august = inMonth('Aug 2026');
    expect(screen.getByText(`${august.length} INVOICED / TOTAL VALUE`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Invoices history/ }).closest('header'))
      .toHaveTextContent(gbp(august.reduce((sum, record) => sum + record.amount, 0)));
  });
});
