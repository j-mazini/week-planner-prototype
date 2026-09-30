// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { mapBoard } from './utils/mappers';
import { clearingDeskFixture } from '@/lib/mocks/clearing-desk-fixtures';

const hook = vi.hoisted(() => ({
  value: {} as ReturnType<typeof import('@/hooks/useClearingDesk').useClearingDesk>,
}));
vi.mock('@/hooks/useClearingDesk', () => ({ useClearingDesk: () => hook.value }));

import ClearingDeskContent from './ClearingDeskContent';

const queue = () => within(screen.getByLabelText('Pending authorizations'));
const bench = () => within(screen.getByLabelText('Selected transaction'));

beforeEach(() => {
  cleanup();
  hook.value = {
    board: mapBoard(clearingDeskFixture()),
    isLoading: false, isError: false,
    refetch: vi.fn(), approve: vi.fn(), restore: vi.fn(),
    savePayee: vi.fn(), saveNote: vi.fn(),
  } as typeof hook.value;
});

describe('the pending queue', () => {
  it('lists every pending payee with its total', () => {
    render(<ClearingDeskContent />);
    expect(screen.getByText('6 TOTAL')).toBeInTheDocument();
    expect(queue().getByRole('button', { name: /Diego Ferreira/ })).toBeInTheDocument();
    expect(queue().getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('filters by name, by route and by vehicle', () => {
    render(<ClearingDeskContent />);
    const search = screen.getByLabelText('Search pending transactions');

    fireEvent.change(search, { target: { value: 'aliu' } });
    expect(queue().getByRole('button', { name: /Aliu Balde/ })).toBeInTheDocument();
    expect(queue().queryByRole('button', { name: /Diego Ferreira/ })).toBeNull();

    fireEvent.change(search, { target: { value: 'DHOC' } });
    expect(queue().getByRole('button', { name: /Lee Roberts/ })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'CE25 PYX' } });
    expect(queue().getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('says so when nothing matches', () => {
    render(<ClearingDeskContent />);
    fireEvent.change(screen.getByLabelText('Search pending transactions'), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText('No matching transactions.')).toBeInTheDocument();
  });

  it('hides payees already cleared', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    render(<ClearingDeskContent />);
    expect(queue().queryByRole('button', { name: /Diego Ferreira/ })).toBeNull();
    expect(screen.getByText('5 TOTAL')).toBeInTheDocument();
  });
});

describe('the clearing panel', () => {
  it('shows the first pending payee by default', () => {
    render(<ClearingDeskContent />);
    expect(bench().getByRole('heading', { name: 'Diego Ferreira' })).toBeInTheDocument();
    expect(bench().getByText('YF25 OZL')).toBeInTheDocument();
    expect(bench().getByText('£160.00')).toBeInTheDocument();
  });

  it('renders an unknown amount as an em dash', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: /Terry Roberts/ }));
    expect(bench().getByRole('heading', { name: 'Terry Roberts' })).toBeInTheDocument();
    expect(bench().getByTestId('payment-amount')).toHaveTextContent('—');
  });

  it('computes the estimate from per-stop and stops, not a fixed figure', () => {
    render(<ClearingDeskContent />);
    expect(bench().getByTestId('estimate-per-stop')).toHaveTextContent('£ 2.00');
    expect(bench().getByTestId('estimate-total')).toHaveTextContent('£ 30.00');
    fireEvent.click(screen.getByRole('button', { name: /Aliu Balde/ }));
    expect(bench().getByTestId('estimate-per-stop')).toHaveTextContent('£ 1.75');
    expect(bench().getByTestId('estimate-total')).toHaveTextContent('£ 26.25');
  });

  it('carries the route summary from the board', () => {
    render(<ClearingDeskContent />);
    expect(bench().getByText('ME1, ME2')).toBeInTheDocument();
    expect(bench().getByTestId('summary-stops')).toHaveTextContent('15');
    expect(bench().getByTestId('summary-pre12')).toHaveTextContent('2');
  });

  it('approves the selected payee', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve Diego Ferreira' }));
    expect(hook.value.approve).toHaveBeenCalledWith('DY1B');
  });

  it('saves a note against the selected payee', () => {
    render(<ClearingDeskContent />);
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE NOTE' }));
    expect(hook.value.saveNote).toHaveBeenCalledWith('DY1B', 'checked with depot');
  });

  it('clears the notes draft when a different payee is selected', () => {
    render(<ClearingDeskContent />);
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(queue().getByRole('button', { name: /Terry Roberts/ }));
    expect(screen.getByLabelText('MANANGEMENT NOTES')).toHaveValue('');
  });
});

describe('the payee editor', () => {
  it('opens on EDITAR with the payee already filled in', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Diego Ferreira');
    expect(screen.getByLabelText('Vehicle')).toHaveValue('YF25 OZL');
    expect(screen.getByLabelText('Sort value')).toHaveValue(0);
  });

  it('saves the edited payee as typed values, not strings', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'D. Ferreira' } });
    fireEvent.change(screen.getByLabelText('Sort value'), { target: { value: '12.50' } });
    fireEvent.change(screen.getByLabelText('Payment mode'), { target: { value: 'VSR' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(hook.value.savePayee).toHaveBeenCalledWith('DY1B', {
      name: 'D. Ferreira', vehicle: 'YF25 OZL', mode: 'VSR',
      sort: true, sortValue: 12.5, adhoc: null,
    });
  });

  it('closes without saving on cancel', () => {
    render(<ClearingDeskContent />);
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }));
    expect(hook.value.savePayee).not.toHaveBeenCalled();
    expect(bench().getByRole('heading', { name: 'Diego Ferreira' })).toBeInTheDocument();
  });
});
