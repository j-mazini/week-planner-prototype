// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import PaymentSchedule from './PaymentSchedule';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const methods = () => within(screen.getByLabelText('Payment methods'));
const strip = () => within(screen.getByLabelText('Upcoming payment runs'));
const run = () => within(screen.getByLabelText('Selected payment run'));

describe('the payment schedule desk', () => {
  it('shows both ways the company pays, with the bank run selected first', () => {
    render(<PaymentSchedule />);
    expect(methods().getByRole('button', { name: /Weekly · Bank/ })).toHaveAttribute('aria-pressed', 'true');
    expect(methods().getByRole('button', { name: /Monthly · Self-billing/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the other method when its card is picked', () => {
    render(<PaymentSchedule />);
    fireEvent.click(methods().getByRole('button', { name: /Monthly · Self-billing/ }));
    expect(run().getByText(/Monthly · Self-billing/)).toBeInTheDocument();
    expect(methods().getByRole('button', { name: /Monthly · Self-billing/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('lists the dates ahead of both methods in one strip', () => {
    render(<PaymentSchedule />);
    const dates = strip().getAllByRole('button');
    expect(dates.length).toBeGreaterThan(1);
    // Both cadences are in the one strip, not two lists.
    expect(strip().getAllByText(/BANK/).length).toBeGreaterThan(0);
    expect(strip().getAllByText(/SELF-BILLING/).length).toBeGreaterThan(0);
  });

  it('opens a run when its date is picked from the strip', () => {
    render(<PaymentSchedule />);
    const dates = strip().getAllByRole('button');
    fireEvent.click(dates[dates.length - 1]);
    expect(dates[dates.length - 1]).toHaveAttribute('aria-pressed', 'true');
  });
});

const held = () => within(screen.getByLabelText('Held invoices'));

describe('working the run', () => {
  it('lists each invoice with the money its document carries', () => {
    render(<PaymentSchedule />);
    const row = run().getByRole('row', { name: /REC-2025005/ });
    expect(within(row).getByText('Emma Wilson')).toBeInTheDocument();
    expect(within(row).getByText('£1,670.29')).toBeInTheDocument();
  });

  it('holds an invoice out of the run and into its own block', () => {
    render(<PaymentSchedule />);
    const row = run().getByRole('row', { name: /REC-2025005/ });
    fireEvent.click(within(row).getByRole('button', { name: /HOLD/i }));

    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();
    expect(held().getByText('REC-2025005')).toBeInTheDocument();
  });

  it('releases a held invoice back into the run', () => {
    render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /HOLD/i }));
    fireEvent.click(held().getByRole('button', { name: /RELEASE/i }));

    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Held invoices')).not.toBeInTheDocument();
  });

  it('pushes a rescheduled invoice to the next date of the same method', () => {
    render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /RESCHEDULE/i }));
    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();

    // The desk reads the real clock, so the strip's order shifts with the day.
    // Pick the second BANK slot by its method rather than by position.
    const bankDates = strip().getAllByRole('button').filter(slot => within(slot).queryByText('BANK'));
    fireEvent.click(bankDates[1]);
    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
    // Still a bank run — rescheduling never changes the method.
    expect(run().getByText(/Weekly · Bank/)).toBeInTheDocument();
  });

  it('remembers what it was told, across a remount', () => {
    const first = render(<PaymentSchedule />);
    fireEvent.click(within(run().getByRole('row', { name: /REC-2025005/ })).getByRole('button', { name: /HOLD/i }));
    first.unmount();

    render(<PaymentSchedule />);
    expect(held().getByText('REC-2025005')).toBeInTheDocument();
  });
});
