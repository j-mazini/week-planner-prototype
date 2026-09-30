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

import Overview from './Overview';
import SpecialDeliveries from './SpecialDeliveries';
import AllStops from './AllStops';
import ShipmentDetails from './ShipmentDetails';
import AccidentReport from './AccidentReport';
import ReportIssue from './ReportIssue';
import FinishRoute from './FinishRoute';

const screens = [
  ['Overview', Overview],
  ['SpecialDeliveries', SpecialDeliveries],
  ['AllStops', AllStops],
  ['ShipmentDetails', ShipmentDetails],
  ['AccidentReport', AccidentReport],
  ['ReportIssue', ReportIssue],
  ['FinishRoute', FinishRoute],
] as const;

afterEach(() => cleanup());

describe('driver route balance screens', () => {
  // The page already sits inside the app shell, which supplies the title bar,
  // the search and the signed-in user. A second header inside the screen is a duplicate.
  it.each(screens)('%s leaves the header to the app shell', (_name, Screen) => {
    render(
      <AuthProvider>
        <Screen />
      </AuthProvider>
    );
    expect(document.querySelector('[data-name="app-header"]')).toBeNull();
  });
});
