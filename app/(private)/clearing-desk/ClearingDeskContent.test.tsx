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
