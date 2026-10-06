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

describe('closing a run', () => {
  it('asks before settling, naming the date, the count and the net', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    expect(run().getByRole('button', { name: /CONFIRM/i })).toBeInTheDocument();
    // "2 INVOICES" also reads in the run's own meta line, so match the ask.
    expect(run().getByText(/SETTLE .+ 2 INVOICES .+ £/)).toBeInTheDocument();
  });

  it('settles the batch and leaves the run empty', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    expect(run().getByText('Nothing scheduled for this date.')).toBeInTheDocument();
    expect(run().queryByRole('row', { name: /REC-2025005/ })).not.toBeInTheDocument();
  });

  it('leaves the run of the other method untouched', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    fireEvent.click(methods().getByRole('button', { name: /Monthly · Self-billing/ }));
    expect(run().getByRole('row', { name: /REC-2025008/ })).toBeInTheDocument();
  });

  it('backs out when the confirmation is dismissed', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CANCEL/i }));

    expect(run().queryByRole('button', { name: /CONFIRM/i })).not.toBeInTheDocument();
    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
  });
});

const awaiting = () => within(screen.getByLabelText('Bonus awaiting SPMS'));

describe('the bonus behind the weekly run', () => {
  it('shows the week whose SPMS has not arrived, with no payment date', () => {
    render(<PaymentSchedule />);
    expect(awaiting().getByRole('button', { name: /REGISTER SPMS/i })).toBeInTheDocument();
    // It is waiting, so it has no slot on the calendar yet.
    expect(strip().queryAllByText('BONUS')).toHaveLength(0);
  });

  it('never lets the bonus hold up the day rate', () => {
    render(<PaymentSchedule />);
    const before = run().getByText(/NET PAYABLE/).parentElement!.textContent;
    expect(run().getByRole('button', { name: /CLOSE RUN/i })).toBeEnabled();
    expect(before).toBeTruthy();
  });

  it('gives the bonus a date once the SPMS is registered', () => {
    render(<PaymentSchedule />);
    fireEvent.click(awaiting().getByRole('button', { name: /REGISTER SPMS/i }));

    expect(screen.queryByLabelText('Bonus awaiting SPMS')).not.toBeInTheDocument();
    expect(strip().getAllByText('BONUS').length).toBeGreaterThan(0);
  });

  it('opens the bonus run from the strip and settles it on its own', () => {
    render(<PaymentSchedule />);
    fireEvent.click(awaiting().getByRole('button', { name: /REGISTER SPMS/i }));

    const slot = strip().getAllByRole('button').find(item => within(item).queryByText('BONUS'))!;
    fireEvent.click(slot);
    // The rows carry a BONUS status too, so match the run's own line.
    expect(run().getByText(/BONUS · WEEK OF/)).toBeInTheDocument();

    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    // Settled, the bonus run is gone from the calendar and the desk falls back
    // to the day rate run — which is still owed, because a bonus pays no invoice.
    expect(strip().queryAllByText('BONUS')).toHaveLength(0);
    expect(run().getByRole('row', { name: /REC-2025005/ })).toBeInTheDocument();
  });

  it('still owes the bonus after the day rate run is settled', () => {
    render(<PaymentSchedule />);
    fireEvent.click(run().getByRole('button', { name: /CLOSE RUN/i }));
    fireEvent.click(run().getByRole('button', { name: /CONFIRM/i }));

    expect(awaiting().getByRole('button', { name: /REGISTER SPMS/i })).toBeInTheDocument();
  });
});

describe('opening the desk on storage an older version wrote', () => {
  it('renders a settled run that has no date recorded for it', () => {
    // What the previous version saved: the invoice map on its own, with no
    // `paidOn` on a settled invoice and no SPMS log beside it.
    localStorage.setItem('logix.payment-schedule.v1', JSON.stringify({
      'REC-2025005': { held: false, shift: 0, paid: true },
      'REC-2025030': { held: true, shift: 1 },
    }));

    render(<PaymentSchedule />);
    expect(screen.getByLabelText('Schedule for payment')).toBeInTheDocument();
    expect(screen.getByLabelText('Selected payment run')).toBeInTheDocument();
    // The held invoice is still held, and its push survived the version change.
    expect(within(screen.getByLabelText('Held invoices')).getByText('REC-2025030')).toBeInTheDocument();
  });
});
