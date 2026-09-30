// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/driver-route-balance',
}));

import { AuthProvider } from '@/hooks/useAuth';
import { AppContext, type DriverRouteData } from '../state';
import Overview from './Overview';

/** Shaped like the row the daily-overview endpoint actually returns. */
const routeWith = (operation: Record<string, unknown>) =>
  ({
    assignment: { date: '2026-09-28', name: 'João Silva', raw: {} },
    operation,
    stops: [],
    postcodes: [],
    totalStops: 0,
    paidStops: 0,
    unpaidStops: 0,
    deliveries: 0,
    pickups: 0,
    pre12: 0,
  } as unknown as DriverRouteData);

const renderOverview = (operation: Record<string, unknown>) =>
  render(
    <AuthProvider>
      <AppContext.Provider
        value={{
          navigate: () => {},
          finish: () => {},
          submit: async () => {},
          driverName: 'João Silva',
          routes: [routeWith(operation)],
          routeIndex: 0,
          routeLoading: false,
          routeError: '',
          selectRoute: () => {},
        }}
      >
        <Overview />
      </AppContext.Provider>
    </AuthProvider>
  );

/** The cell that shows the vehicle; several dashes exist elsewhere on the screen. */
const vehicleCell = () =>
  document.querySelector('[data-node-id="322:14644"]')?.textContent;

afterEach(() => cleanup());

describe('the vehicle on the route overview', () => {
  it('shows the plate when the operation carries a vehicle object', () => {
    renderOverview({
      vehicle: { vehicleId: 301, vehicleModel: 'Sprinter', vehicleRegistrationPlate: 'DE01 LOG' },
      vehicleRegistration: 'DE01 LOG',
    });

    expect(document.body.textContent).not.toContain('[object Object]');
    expect(vehicleCell()).toBe('DE01 LOG');
  });

  it('falls back to the flat registration when there is no vehicle object', () => {
    renderOverview({ vehicleRegistration: 'DE02 LOG' });
    expect(vehicleCell()).toBe('DE02 LOG');
  });

  it('shows a dash when the operation says nothing about a vehicle', () => {
    renderOverview({});
    expect(vehicleCell()).toBe('—');
  });
});
