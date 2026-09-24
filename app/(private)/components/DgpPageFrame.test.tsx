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
});
