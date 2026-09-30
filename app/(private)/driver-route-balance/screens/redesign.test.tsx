// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/driver-route-balance',
}));

import { AuthProvider } from '@/hooks/useAuth';
import { AppContext, type DriverRouteData } from '../state';
import AccidentReport from './AccidentReport';
import ReportIssue from './ReportIssue';
import FinishRoute from './FinishRoute';

const route = {
  assignment: { date: '2026-09-29', name: 'João Silva', route: 'L001', raw: {} },
  operation: {},
  stops: [],
  postcodes: [],
  totalStops: 18,
  paidStops: 18,
  unpaidStops: 0,
  deliveries: 12,
  pickups: 6,
  pre12: 2,
} as unknown as DriverRouteData;

const renderScreen = (Screen: () => JSX.Element) =>
  render(
    <AuthProvider>
      <AppContext.Provider
        value={{
          navigate: () => {},
          finish: () => {},
          submit: async () => {},
          driverName: 'João Silva',
          routes: [route],
          routeIndex: 0,
          routeLoading: false,
          routeError: '',
          selectRoute: () => {},
        }}
      >
        <Screen />
      </AppContext.Provider>
    </AuthProvider>
  );

afterEach(() => cleanup());

describe('the report screens', () => {
  it('carries the urgency of the button that opened it', () => {
    renderScreen(AccidentReport);
    expect(document.querySelector('[data-urgency="accident"]')).not.toBeNull();
    cleanup();
    renderScreen(ReportIssue);
    expect(document.querySelector('[data-urgency="issue"]')).not.toBeNull();
    cleanup();
    renderScreen(FinishRoute);
    expect(document.querySelector('[data-urgency="finish"]')).not.toBeNull();
  });

  it('starts with no photos attached, so nothing false is submitted', () => {
    renderScreen(AccidentReport);
    expect(document.querySelectorAll('.photo-card')).toHaveLength(0);
  });

  it('keeps the footer the other screens still carry', () => {
    renderScreen(AccidentReport);
    expect(document.body.textContent).toContain('LOGIXSPHERE OPERATIONAL SYSTEMS');
  });

  it('asks for the description in plain English', () => {
    renderScreen(ReportIssue);
    expect(screen.getByPlaceholderText('Describe what happened')).toBeInTheDocument();
  });
});

describe('the finish screen', () => {
  it('reports the real route instead of a placeholder', () => {
    renderScreen(FinishRoute);
    const text = document.body.textContent ?? '';
    expect(text).toContain('L001');
    expect(text).not.toContain('Route 123');
  });

  it('reports the real stop figures', () => {
    renderScreen(FinishRoute);
    const text = document.body.textContent ?? '';
    expect(text).toContain('18');
    expect(text).toContain('12');
  });
});
