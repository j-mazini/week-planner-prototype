// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import InvoiceBoard from './InvoiceBoard';
import records from './records.json';

const first = records[0];
const second = records[1];

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const bench = () => within(screen.getByLabelText('Selected record'));

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

    const queue = within(screen.getByLabelText('Records awaiting action'));
    fireEvent.click(queue.getByRole('button', { name: new RegExp(second.id) }));

    const sheet = bench().getByLabelText(/Self billing invoice/);
    expect(within(sheet).getByText(second.vendor)).toBeInTheDocument();
    expect(within(sheet).queryByText(first.vendor)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
