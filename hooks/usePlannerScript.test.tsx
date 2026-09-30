import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePlannerScript } from './usePlannerScript';

const mocks = vi.hoisted(() => {
  const dispose = vi.fn();
  const create = () => {
    const ctor = vi.fn(function () { return { dispose }; });
    return Object.assign(ctor, { getInstance: vi.fn() });
  };
  return { dispose, Tooltip: create(), Modal: create(), Collapse: create() };
});
vi.mock('bootstrap/dist/js/bootstrap.bundle.min.js', () => mocks);

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('planner Bootstrap initialization', () => {
  it('preserves collapsed sections and disposes owned instances', async () => {
    document.body.innerHTML = '<div data-bs-toggle="tooltip"></div><div class="modal"></div><div class="collapse"></div>';
    const { unmount } = renderHook(usePlannerScript);
    await waitFor(() => expect(mocks.Collapse).toHaveBeenCalledOnce());
    expect(mocks.Collapse).toHaveBeenCalledWith(document.querySelector('.collapse'), { toggle: false });
    unmount();
    expect(mocks.dispose).toHaveBeenCalledTimes(3);
  });

  it('does not initialize widgets after unmount during loading', async () => {
    document.body.innerHTML = '<div class="modal"></div>';
    const { unmount } = renderHook(usePlannerScript);
    unmount();
    await act(async () => { await Promise.resolve(); });
    expect(mocks.Modal).not.toHaveBeenCalled();
  });
});
