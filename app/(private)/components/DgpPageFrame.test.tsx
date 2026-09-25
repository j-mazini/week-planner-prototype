// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DgpPageFrame } from './DgpPageFrame';

afterEach(() => cleanup());

const container = () => document.querySelector('.dgp-page-frame-container');

describe('DgpPageFrame width', () => {
  it('defaults to the standard content width', () => {
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-standard');
  });

  it('applies the narrow token', () => {
    render(<DgpPageFrame width="narrow"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-narrow');
  });

  it('applies the wide token', () => {
    render(<DgpPageFrame width="wide"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-wide');
  });

  it('uncaps the container for full-width pages', () => {
    render(<DgpPageFrame width="full"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-none');
    expect(container()).not.toHaveClass('max-w-content-wide');
  });

  it('keeps the children rendered inside the container', () => {
    render(<DgpPageFrame width="wide"><p>content</p></DgpPageFrame>);
    expect(container()).toContainHTML('<p>content</p>');
  });

  it('scales the gutter continuously above md instead of freezing it at xl', () => {
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('md:px-[clamp(1.5rem,3vw,3rem)]');
    expect(container()).not.toHaveClass('xl:px-12');
  });

  it('leaves the sub-md gutter exactly as it was', () => {
    // Global constraint: nada abaixo de `md` muda de renderização.
    render(<DgpPageFrame><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('px-4');
    const tokens = (container()?.className ?? '').split(/\s+/);
    const hasUnprefixedArbitraryPadding = tokens.some((t) =>
      /^(px|py|p)-\[/.test(t)
    );
    expect(hasUnprefixedArbitraryPadding).toBe(false);
  });

  it('lets a page opt out of the default container entirely', () => {
    render(<DgpPageFrame containerClassName="w-full px-0"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('px-0');
    expect(container()).not.toHaveClass('px-[clamp(1rem,3vw,3rem)]');
  });

  it('applies the ultra token', () => {
    render(<DgpPageFrame width="ultra"><p>content</p></DgpPageFrame>);
    expect(container()).toHaveClass('max-w-content-ultra');
    expect(container()).not.toHaveClass('max-w-content-wide');
  });

  it('keeps ultra capped — it is a step on the scale, not an escape from it', () => {
    render(<DgpPageFrame width="ultra"><p>content</p></DgpPageFrame>);
    expect(container()).not.toHaveClass('max-w-none');
  });
});
