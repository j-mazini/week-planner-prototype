// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/home',
}));

// This jsdom build ships no matchMedia, which components query while rendering.
window.matchMedia = ((query: string) =>
  ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;

import DriverHome from './DriverHome';
import { AuthProvider } from '@/hooks/useAuth';

const renderHome = () =>
  render(
    <AuthProvider>
      <DriverHome />
    </AuthProvider>
  );

afterEach(() => cleanup());

describe('the driver home', () => {
  it('leaves the page header to the app shell', () => {
    renderHome();
    // Only the shell's top bar; the screen used to add a second one of its own.
    expect(document.querySelectorAll('header')).toHaveLength(1);
  });

  it('drops the identity block the top bar already shows', () => {
    renderHome();
    expect(document.querySelector('.driver-home__avatar')).toBeNull();
    expect(document.querySelector('.driver-home__welcome')).toBeNull();
  });

  it('greets the signed-in driver by name', () => {
    renderHome();
    const greeting = document.querySelector('.driver-home__greeting')?.textContent ?? '';
    // Worded from the clock, so the assertion covers every hour rather than one.
    expect(greeting).toMatch(/^(Good (morning|afternoon|evening), João\.|Welcome back\.)$/);
  });

  it('gives the vehicle and the depot the same treatment', () => {
    renderHome();
    // One shared class means one shared style; two blocks means neither was left behind.
    const facts = document.querySelectorAll('.driver-home__fact');
    expect(facts).toHaveLength(2);
    for (const fact of facts) {
      expect(fact.querySelector('.driver-home__fact-icon')).not.toBeNull();
      expect(fact.querySelector('strong')).not.toBeNull();
    }
  });

  it('shows the depot name in full rather than clipped', () => {
    renderHome();
    const depot = [...document.querySelectorAll('.driver-home__fact strong')]
      .map((el) => el.textContent ?? '')
      .find((text) => text.includes('Newcastle'));
    expect(depot).toBe('A- XL - Newcastle - Arrow XL');
  });

  it('keeps the facts the top bar does not carry', () => {
    renderHome();
    const text = document.body.textContent ?? '';
    expect(text).toContain('Vehicle');
    expect(text).toContain('Home depot');
  });
});
