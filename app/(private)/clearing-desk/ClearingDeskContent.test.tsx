// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mapBoard } from './utils/mappers';
import { clearingDeskFixture } from '@/lib/mocks/clearing-desk-fixtures';

const hook = vi.hoisted(() => ({
  value: {} as ReturnType<typeof import('@/hooks/useClearingDesk').useClearingDesk>,
}));
vi.mock('@/hooks/useClearingDesk', () => ({ useClearingDesk: () => hook.value }));

import ClearingDeskContent from './ClearingDeskContent';

/**
 * The editor's cost-model select is a real useQuery, so the tree needs a client.
 * It resolves through MOCK_MODE to the repo's own page fixtures — the same path
 * the page takes offline — rather than a mock of the hook, so the wiring from
 * select to /bff/cost-models is actually exercised.
 */
function renderDesk() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = () => (
    <QueryClientProvider client={client}><ClearingDeskContent /></QueryClientProvider>
  );
  const result = render(tree());
  // A fresh element each time — re-rendering the same element reference lets
  // React bail out, and the point here is to pick up a changed board. The client
  // is reused so this is not a remount for the cost-model query.
  return { ...result, rerenderDesk: () => result.rerender(tree()) };
}

const queue = () => within(screen.getByLabelText('Pending authorizations'));
const bench = () => within(screen.getByLabelText('Selected transaction'));
const history = () => within(screen.getByLabelText('Cleared history'));

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
    renderDesk();
    expect(screen.getByText('6 TOTAL')).toBeInTheDocument();
    expect(queue().getByRole('button', { name: /Diego Ferreira/ })).toBeInTheDocument();
    expect(queue().getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('filters by name, by route and by vehicle', async () => {
    renderDesk();
    const search = screen.getByLabelText('Search pending transactions');

    fireEvent.change(search, { target: { value: 'aliu' } });
    expect(queue().getByRole('button', { name: /Aliu Balde/ })).toBeInTheDocument();
    // Awaited, not loosened: cards leave through AnimatePresence, so a filtered
    // card is unmounted a tick later than the state change. The assertion is the
    // same one — that it is gone — and it still fails if the filter stops working.
    await waitFor(() =>
      expect(queue().queryByRole('button', { name: /Diego Ferreira/ })).toBeNull());

    fireEvent.change(search, { target: { value: 'DHOC' } });
    expect(queue().getByRole('button', { name: /Lee Roberts/ })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'CE25 PYX' } });
    expect(queue().getByRole('button', { name: /Codrin Stephan/ })).toBeInTheDocument();
  });

  it('says so when nothing matches', () => {
    renderDesk();
    fireEvent.change(screen.getByLabelText('Search pending transactions'), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText('No matching transactions.')).toBeInTheDocument();
  });

  it('hides payees already cleared', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    renderDesk();
    expect(queue().queryByRole('button', { name: /Diego Ferreira/ })).toBeNull();
    expect(screen.getByText('5 TOTAL')).toBeInTheDocument();
  });
});

describe('the clearing panel', () => {
  it('shows the first pending payee by default', () => {
    renderDesk();
    expect(bench().getByRole('heading', { name: 'Diego Ferreira' })).toBeInTheDocument();
    expect(bench().getByText('YF25 OZL')).toBeInTheDocument();
    expect(bench().getByText('£160.00')).toBeInTheDocument();
  });

  it('renders an unknown amount as an em dash', () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: /Terry Roberts/ }));
    expect(bench().getByRole('heading', { name: 'Terry Roberts' })).toBeInTheDocument();
    expect(bench().getByTestId('payment-amount')).toHaveTextContent('—');
  });

  it('computes the estimate from per-stop and stops, not a fixed figure', () => {
    renderDesk();
    expect(bench().getByTestId('estimate-per-stop')).toHaveTextContent('£ 2.00');
    expect(bench().getByTestId('estimate-total')).toHaveTextContent('£ 30.00');
    fireEvent.click(screen.getByRole('button', { name: /Aliu Balde/ }));
    expect(bench().getByTestId('estimate-per-stop')).toHaveTextContent('£ 1.75');
    expect(bench().getByTestId('estimate-total')).toHaveTextContent('£ 26.25');
  });

  it('carries the route summary from the board', () => {
    renderDesk();
    expect(bench().getByText('ME1, ME2')).toBeInTheDocument();
    expect(bench().getByTestId('summary-stops')).toHaveTextContent('15');
    expect(bench().getByTestId('summary-pre12')).toHaveTextContent('2');
  });

  it('approves the selected payee', async () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'Approve Diego Ferreira' }));
    // Awaited, not loosened: the button holds a short green confirmation before
    // handing the approval on. Same assertion, same argument — it still fails if
    // the click stops approving.
    await waitFor(() => expect(hook.value.approve).toHaveBeenCalledWith('DY1B'));
  });

  it('shows the confirmation before it hands the approval on', () => {
    renderDesk();
    const approve = screen.getByRole('button', { name: 'Approve Diego Ferreira' });
    expect(approve).not.toHaveClass('is-approving');

    fireEvent.click(approve);
    // The window the green check lives in: marked, and not yet approved.
    expect(approve).toHaveClass('is-approving');
    expect(hook.value.approve).not.toHaveBeenCalled();
  });

  it('does not carry the confirmation over to the next payee', async () => {
    const { rerenderDesk } = renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'Approve Diego Ferreira' }));
    await waitFor(() => expect(hook.value.approve).toHaveBeenCalledWith('DY1B'));

    // Diego is cleared, so Carlos takes the panel.
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    rerenderDesk();

    const next = screen.getByRole('button', { name: 'Approve Carlos Silva' });
    expect(next).not.toHaveClass('is-approving');
    // And the stale confirmation must not be swallowing his click either.
    fireEvent.click(next);
    await waitFor(() => expect(hook.value.approve).toHaveBeenCalledWith('MD7E'));
  });

  it('cannot be approved twice by a double click', async () => {
    renderDesk();
    const approve = screen.getByRole('button', { name: 'Approve Diego Ferreira' });
    fireEvent.click(approve);
    fireEvent.click(approve);
    await waitFor(() => expect(hook.value.approve).toHaveBeenCalledTimes(1));
  });

  it('saves a note against the selected payee', () => {
    renderDesk();
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE NOTE' }));
    expect(hook.value.saveNote).toHaveBeenCalledWith(
      'DY1B', 'checked with depot', expect.any(Function),
    );
  });

  it('confirms with a toast once the note is saved', async () => {
    hook.value = {
      ...hook.value,
      saveNote: vi.fn((_id, _note, onSuccess?: () => void) => onSuccess?.()),
    };
    renderDesk();
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE NOTE' }));
    expect(await screen.findByText('Note saved.')).toBeInTheDocument();
  });

  it('clears the notes draft when a different payee is selected', () => {
    renderDesk();
    fireEvent.change(screen.getByLabelText('MANANGEMENT NOTES'), {
      target: { value: 'checked with depot' },
    });
    fireEvent.click(queue().getByRole('button', { name: /Terry Roberts/ }));
    expect(screen.getByLabelText('MANANGEMENT NOTES')).toHaveValue('');
  });
});

describe('the payee editor', () => {
  it('opens on EDITAR with the payee already filled in', () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Diego Ferreira');
    expect(screen.getByLabelText('Vehicle')).toHaveValue('YF25 OZL');
    expect(screen.getByLabelText('Sort value')).toHaveValue(0);
  });

  it('saves the edited payee as typed values, not strings', () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'D. Ferreira' } });
    fireEvent.change(screen.getByLabelText('Sort value'), { target: { value: '12.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(hook.value.savePayee).toHaveBeenCalledWith('DY1B', expect.objectContaining({
      name: 'D. Ferreira', vehicle: 'YF25 OZL', sortValue: 12.5, adhoc: null,
    }));
  });

  it('offers the cost models from the API, labelled with their rate', async () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    const select = await screen.findByLabelText('Cost model');
    await waitFor(() =>
      expect(within(select).getByRole('option', { name: 'DR — £185.00 fixed' }))
        .toBeInTheDocument());
  });

  it('brings the chosen cost model data onto the payee', async () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    const select = await screen.findByLabelText('Cost model');
    await waitFor(() =>
      expect(within(select).getByRole('option', { name: /DR/ })).toBeInTheDocument());
    fireEvent.change(select, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));

    expect(hook.value.savePayee).toHaveBeenCalledWith('DY1B', expect.objectContaining({
      costModelId: 2,
      mode: 'DR',
      payment: { amount: 185, flat: true },
      perStop: 0,
    }));
  });

  it('keeps the approve column beside the form, as the design frame does', () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    expect(bench().getByRole('button', { name: 'Approve Diego Ferreira' })).toBeInTheDocument();
  });

  it('puts each dropdown chevron inside its own field, not on the label line', () => {
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    // .select-wrap is the positioning context the stylesheet anchors the chevron
    // to. On the whole .form-field it lands on the label; it has to wrap the
    // select alone.
    for (const field of ['Cost model', 'Sort', 'Adhoc service']) {
      const select = screen.getByLabelText(field);
      expect(select.parentElement).toHaveClass('select-wrap');
      expect(select.parentElement).not.toHaveClass('form-field');
    }
  });

  it('abandons the draft when another payee is picked', () => {
    // The design frame has no CANCEL: picking someone else in the queue is the
    // way out of the form, and it must not save what was typed.
    renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'EDITAR' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'typed but abandoned' } });

    fireEvent.click(queue().getByRole('button', { name: /Carlos Silva/ }));

    expect(hook.value.savePayee).not.toHaveBeenCalled();
    expect(bench().getByRole('heading', { name: 'Carlos Silva' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).toBeNull();
  });
});

describe('the cleared session', () => {
  it('counts nothing cleared at the start', () => {
    renderDesk();
    expect(screen.getByRole('heading', { name: '0 / 6 CLEARED' })).toBeInTheDocument();
  });

  it('lists a cleared payee and counts it', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B', 'MD7E'] } };
    renderDesk();
    expect(screen.getByRole('heading', { name: '2 / 6 CLEARED' })).toBeInTheDocument();
    expect(history().getByRole('button', { name: 'Return Diego Ferreira to queue' }))
      .toBeInTheDocument();
  });

  it('returns a cleared payee to the queue', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B'] } };
    renderDesk();
    fireEvent.click(history().getByRole('button', { name: 'Return Diego Ferreira to queue' }));
    expect(hook.value.restore).toHaveBeenCalledWith('DY1B');
  });

  it('shows the completion panel, not a generic empty state, once the queue drains', () => {
    const board = hook.value.board!;
    hook.value = {
      ...hook.value,
      board: { ...board, cleared: board.payees.map(p => p.id) },
    };
    renderDesk();
    expect(screen.getByRole('heading', { name: /ZERO QUEUE/ })).toBeInTheDocument();
    expect(screen.getByText('100% EXCELLENCE')).toBeInTheDocument();
  });

  it('hides the total until every payee is cleared', () => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ['DY1B', 'DY1A'] } };
    renderDesk();
    expect(screen.queryByTestId('cleared-total')).toBeNull();
  });

  it('totals the cleared payees instead of the design constant', () => {
    const board = hook.value.board!;
    hook.value = {
      ...hook.value,
      board: { ...board, cleared: board.payees.map(p => p.id) },
    };
    renderDesk();
    // 2·15 + 2·15 + 2·15 + 1.75·15 + 2·15 + 2·15 = 176.25
    expect(screen.getByTestId('cleared-total')).toHaveTextContent('£176.25');
    expect(screen.queryByText('£21,420.00')).toBeNull();
  });
});

describe('the progress notice', () => {
  const withCleared = (ids: string[]) => {
    hook.value = { ...hook.value, board: { ...hook.value.board!, cleared: ids } };
  };

  it('stays hidden below three cleared', () => {
    withCleared(['DY1B', 'MD7E']);
    renderDesk();
    expect(screen.queryByText('GOAL IN SIGHT!')).toBeNull();
  });

  it('appears at three cleared, with the remaining count', () => {
    withCleared(['DY1B', 'MD7E', 'DHOC']);
    renderDesk();
    expect(screen.getByText('GOAL IN SIGHT!')).toBeInTheDocument();
    expect(screen.getByText('ONLY 3 APPROVALS LEFT!')).toBeInTheDocument();
  });

  it('can be dismissed and stays dismissed', () => {
    withCleared(['DY1B', 'MD7E', 'DHOC']);
    const { rerenderDesk } = renderDesk();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss goal' }));
    expect(screen.queryByText('GOAL IN SIGHT!')).toBeNull();

    // Re-render with a changed (but still length-3) `cleared` list: the
    // notice must stay hidden, not just absent because nothing re-rendered.
    withCleared(['MD7E', 'DY1B', 'DHOC']);
    rerenderDesk();
    expect(screen.queryByText('GOAL IN SIGHT!')).toBeNull();
  });
});

describe('the error state', () => {
  it('lets the operator retry', () => {
    hook.value = { ...hook.value, isError: true };
    renderDesk();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(hook.value.refetch).toHaveBeenCalled();
  });
});
