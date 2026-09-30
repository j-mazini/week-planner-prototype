// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/home',
}));

import NavbarWrapper from './NavbarWrapper';
import { AuthProvider } from '@/hooks/useAuth';

const shell = () => document.querySelector('.app-shell');

const renderShell = () =>
  render(
    <AuthProvider>
      <NavbarWrapper>
        <p>content</p>
      </NavbarWrapper>
    </AuthProvider>
  );

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe('the navigation sidebar', () => {
  it('starts collapsed on a fresh visit', () => {
    renderShell();
    expect(shell()).not.toHaveClass('sidebar-expanded');
  });

  it('still starts collapsed after it was left open earlier', () => {
    sessionStorage.setItem('logix-sidebar-expanded', 'true');
    renderShell();
    expect(shell()).not.toHaveClass('sidebar-expanded');
  });
});
