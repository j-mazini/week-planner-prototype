// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

import AdminLoginPage from './page';

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

afterEach(() => {
  cleanup();
  push.mockClear();
  window.matchMedia = realMatchMedia;
});

describe('sign-in page', () => {
  it('sends the operator to the home page once the form is submitted', async () => {
    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'ops@logixsphere.local');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'sesame');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/home'), { timeout: 6000 });
  });

  it('holds the navigation until the exit sequence has finished', async () => {
    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'ops@logixsphere.local');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'sesame');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(push).not.toHaveBeenCalled();
  });

  it('navigates straight away when the operator prefers reduced motion', async () => {
    preferReducedMotion();
    render(<AdminLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'ops@logixsphere.local');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'sesame');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(push).toHaveBeenCalledWith('/home');
  });
});
