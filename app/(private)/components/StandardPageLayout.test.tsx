// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('@/components/navbar-wrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/gradient-dots-background', () => ({
  GradientDotsBackground: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/ui/welcome-header', () => ({ WelcomeHeader: () => null }));

import { StandardPageLayout } from './StandardPageLayout';

afterEach(() => cleanup());

const main = () => document.querySelector('main');

describe('StandardPageLayout width', () => {
  it('defaults to narrow — these are phone-first driver screens', () => {
    render(<StandardPageLayout><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-narrow');
  });

  it('accepts a wider token for the admin screens that share the shell', () => {
    render(<StandardPageLayout width="wide"><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-wide');
    expect(main()).not.toHaveClass('max-w-content-narrow');
  });

  it('still centers the column', () => {
    render(<StandardPageLayout><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('mx-auto');
  });

  it('accepts the ultra token through the shared union', () => {
    render(<StandardPageLayout width="ultra"><p>content</p></StandardPageLayout>);
    expect(main()).toHaveClass('max-w-content-ultra');
    expect(main()).not.toHaveClass('max-w-content-narrow');
  });
});
