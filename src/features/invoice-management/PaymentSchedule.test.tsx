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
