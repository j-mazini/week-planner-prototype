// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/home',
}));

// Lets each test pick the signed-in profile; the real provider always mocks an admin.
const auth = vi.hoisted(() => ({
  user: { id: 1, name: 'T', email: 't@t', userTypeId: 1, roles: ['admin'], permissions: [] } as {
    id: number; name: string; email: string; userTypeId: number; roles: string[]; permissions: string[];
  },
}));
vi.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ user: auth.user, login: vi.fn(), logout: vi.fn() }),
}));

import NavbarWrapper from './NavbarWrapper';
import { AuthProvider } from '@/hooks/useAuth';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

const asProfile = (userTypeId: number, roles: string[]) => {
  auth.user = { ...auth.user, userTypeId, roles };
};

/** The sidebar renders a group's links only while that group is expanded. */
const openGroup = (label: string) => {
  const toggle = screen.queryByRole('button', { name: label });
  if (toggle) fireEvent.click(toggle);
};

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
  asProfile(BUSINESS_RULES.USER_TYPE.ADMIN, ['admin']);
});

describe('the operations Route Balance link', () => {
  it('is offered to an admin', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.ADMIN, ['admin']);
    renderShell();
    openGroup('Operations');
    expect(screen.getByRole('link', { name: 'Route Balance' })).toHaveAttribute('href', '/route-balance');
  });

  it('is offered to a supervisor', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.SUPERVISOR, ['supervisor']);
    renderShell();
    openGroup('Operations');
    expect(screen.getByRole('link', { name: 'Route Balance' })).toHaveAttribute('href', '/route-balance');
  });

  it('stays hidden from a driver, who keeps only the personal one', () => {
    asProfile(BUSINESS_RULES.USER_TYPE.DRIVER, ['driver']);
    renderShell();
    openGroup('Operations');
    openGroup('My Performance');
    expect(screen.queryByRole('link', { name: 'Route Balance' })).toBeNull();
    expect(screen.getByRole('link', { name: 'My Route Balance' })).toHaveAttribute('href', '/driver-route-balance');
  });
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
