// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyLock, releaseLock, resetBodyScrollLock } from './useBodyScrollLock';

/**
 * O hook em si exige jsdom/React (não disponível: vitest roda em environment 'node'),
 * então testamos a invariante de ref-counting diretamente nos utilitários internos,
 * stubando um DOM mínimo. Cobre o cenário de modais aninhados que motivou o hook:
 * fechar um modal não pode destravar o scroll enquanto outro ainda está aberto.
 */

interface FakeElement {
  attrs: Map<string, string>;
  style: Record<string, string>;
  clientWidth: number;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  getAttribute(name: string): string | null;
}

function createElement(clientWidth = 0): FakeElement {
  const attrs = new Map<string, string>();
  return {
    attrs,
    style: {},
    clientWidth,
    setAttribute: (name, value) => void attrs.set(name, value),
    removeAttribute: (name) => void attrs.delete(name),
    getAttribute: (name) => attrs.get(name) ?? null,
  };
}

let html: FakeElement;
let body: FakeElement;

const isLocked = () =>
  html.getAttribute('data-scroll-locked') === 'true' &&
  body.getAttribute('data-scroll-locked') === 'true';

beforeEach(() => {
  // innerWidth === clientWidth => scrollbarWidth = 0 (sem padding compensatório)
  html = createElement(1024);
  body = createElement();
  body.style.paddingRight = '8px'; // valor pré-existente que deve ser preservado/restaurado

  const head = { appendChild: () => {} };
  const styles = new Map<string, unknown>();

  (globalThis as unknown as { window: unknown }).window = { innerWidth: 1024 };
  (globalThis as unknown as { document: unknown }).document = {
    documentElement: html,
    body,
    head,
    getElementById: (id: string) => styles.get(id) ?? null,
    createElement: (id: string) => {
      const el = { id: '', textContent: '' };
      styles.set(id, el);
      return el;
    },
  };
});

afterEach(() => {
  resetBodyScrollLock();
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { document?: unknown }).document;
});

describe('useBodyScrollLock ref-counting', () => {
  it('trava o body no primeiro lock', () => {
    applyLock();
    expect(isLocked()).toBe(true);
  });

  it('mantém o body travado enquanto houver locks aninhados ativos', () => {
    applyLock();
    applyLock();
    releaseLock(); // fecha um modal — o outro continua aberto
    expect(isLocked()).toBe(true);
  });

  it('destrava apenas quando o último lock é liberado', () => {
    applyLock();
    applyLock();
    releaseLock();
    releaseLock();
    expect(isLocked()).toBe(false);
  });

  it('restaura o paddingRight original ao destravar totalmente', () => {
    applyLock();
    releaseLock();
    expect(body.style.paddingRight).toBe('8px');
  });

  it('releaseLock sem lock ativo é no-op (não fica com contador negativo)', () => {
    releaseLock();
    applyLock();
    releaseLock();
    expect(isLocked()).toBe(false);
  });

  it('resetBodyScrollLock zera o contador independentemente da profundidade', () => {
    applyLock();
    applyLock();
    applyLock();
    resetBodyScrollLock();
    expect(isLocked()).toBe(false);
    // após o reset, um novo lock deve re-travar (contador realmente zerado)
    applyLock();
    expect(isLocked()).toBe(true);
  });
});
