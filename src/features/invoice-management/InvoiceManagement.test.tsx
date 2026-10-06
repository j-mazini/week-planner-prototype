// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import InvoiceManagement from './InvoiceManagement';

beforeEach(() => { window.location.hash = ''; });
afterEach(() => { cleanup(); localStorage.clear(); });

describe('the invoice management tabs', () => {
  it('opens the processing desk by default', () => {
    render(<InvoiceManagement />);
    expect(screen.getByLabelText('Invoice processing desk')).toBeInTheDocument();
  });

  it('opens the payment desk on the schedule tab', () => {
    window.location.hash = '#82-7755';
    render(<InvoiceManagement />);
    expect(screen.getByLabelText('Schedule for payment')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment methods')).toBeInTheDocument();
  });
});
