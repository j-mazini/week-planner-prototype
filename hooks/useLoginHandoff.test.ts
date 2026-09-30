// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, cleanup, waitFor, act } from '@testing-library/react';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

import { useLoginHandoff } from './useLoginHandoff';

const realMatchMedia = window.matchMedia;

/** Makes the environment report that the operator has asked for reduced motion. */
const preferReducedMotion = () => {
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia;
};

const signInSucceeds = (callbackUrl = '/home') =>
  act(() => {
    window.dispatchEvent(new CustomEvent('login-success', { detail: { callbackUrl } }));
  });

afterEach(() => {
  cleanup();
  push.mockClear();
  window.matchMedia = realMatchMedia;
});

describe('the post-login handoff', () => {
  it('opens the workspace the login asked for', async () => {
    renderHook(() => useLoginHandoff());
    signInSucceeds('/home');

    await waitFor(() => expect(push).toHaveBeenCalledWith('/home'), { timeout: 6000 });
  });

  it('honours a callback url other than the default', async () => {
    renderHook(() => useLoginHandoff());
    signInSucceeds('/week-planner');

    await waitFor(() => expect(push).toHaveBeenCalledWith('/week-planner'), { timeout: 6000 });
  });

  it('holds the navigation until the sequence has played', () => {
    renderHook(() => useLoginHandoff());
    signInSucceeds();

    expect(push).not.toHaveBeenCalled();
  });

  it('goes straight through when the operator prefers reduced motion', () => {
    preferReducedMotion();
    renderHook(() => useLoginHandoff());
    signInSucceeds();

    expect(push).toHaveBeenCalledWith('/home');
  });
});
