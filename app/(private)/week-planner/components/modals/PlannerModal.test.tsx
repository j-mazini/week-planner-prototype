// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import PlannerModal from './PlannerModal';

afterEach(() => cleanup());

function renderModal(overrides: Partial<React.ComponentProps<typeof PlannerModal>> = {}) {
  return render(
    <div className="week-planner-page">
      <PlannerModal title="Register Day Off" primaryLabel="SAVE" onCancel={() => {}} onSubmit={() => {}} {...overrides}>
        <p>body</p>
      </PlannerModal>
    </div>,
  );
}

describe('PlannerModal overlay hosting', () => {
  /**
   * The scrim is `position: fixed`, so any ancestor carrying a transform becomes
   * its containing block and it stops covering the viewport. The page shell does
   * carry one (its entrance animation), so the overlay has to escape the tree
   * entirely rather than rely on no ancestor ever being transformed.
   */
  it('portals the scrim out of the page shell and onto document.body', () => {
    const { container } = renderModal();

    expect(container.querySelector('.scrim')).toBeNull();

    const scrim = document.body.querySelector('.scrim');
    expect(scrim).not.toBeNull();
    expect(scrim!.parentElement).toBe(document.body);
  });

  it('locks background scrolling through the shared ref-counted lock', () => {
    renderModal();

    expect(document.documentElement).toHaveAttribute('data-scroll-locked', 'true');
    expect(document.body).toHaveAttribute('data-scroll-locked', 'true');
  });

  it('releases the scroll lock when it unmounts', () => {
    const { unmount } = renderModal();
    unmount();

    expect(document.documentElement).not.toHaveAttribute('data-scroll-locked');
    expect(document.body).not.toHaveAttribute('data-scroll-locked');
  });
});

describe('week-planner entrance animations', () => {
  const css = readFileSync(path.join(__dirname, '../../styles.css'), 'utf8');

  /**
   * `animation-fill-mode: both` keeps the final keyframe applied forever. When
   * that keyframe sets a transform — even the identity `translateY(0)` — the
   * element stays a stacking context and a containing block for fixed children,
   * which buried the week-picker popover under the rows below it. `backwards`
   * gives the same motion and lets the element settle back to `transform: none`.
   */
  it('never leaves a transform behind on the animated shell elements', () => {
    const offenders = css
      .split('\n')
      .filter((line) => /animation:\s*planner-(?:in|rise)\b[^;]*\bboth\b/.test(line))
      .map((line) => line.split('{')[0].trim());

    expect(offenders).toEqual([]);
  });

  it('keeps the week-picker popover above the rows that follow the header', () => {
    expect(css).toMatch(/\.header\s*\{[^}]*position:\s*relative/);
    expect(css).toMatch(/\.header\s*\{[^}]*z-index:\s*[1-9]/);
  });
});

describe('week-planner button reset', () => {
  const css = readFileSync(path.join(__dirname, '../../styles.css'), 'utf8');

  /**
   * The reset carries `font` and `color` shorthands, so any specificity it has
   * is inherited by every button on the screen. Scoped with `:is()` it weighed
   * (0,1,1) and silently outranked `.tbtn`, `.tab`, `.tlchip`, `.dayadd`,
   * `.ghost` and `.primary` — they all rendered at 16px/400/24px in the
   * inherited ink. `:where()` drops it to the bare `button` type selector.
   */
  it('scopes the button reset with :where so component rules still win', () => {
    const resetLine = css.split('\n').find((line) => /^\S[^{]*\bbutton\s*\{[^}]*font:\s*inherit/.test(line));

    expect(resetLine).toBeDefined();
    expect(resetLine).toMatch(/^:where\(/);
    expect(resetLine).not.toMatch(/^:is\(/);
  });
});
