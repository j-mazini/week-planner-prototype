'use client';

import { useEffect } from 'react';

/**
 * ID do <style> injetado uma única vez no <head>.
 * Usamos `!important` porque o NavbarWrapper injeta `body { overflow-y: auto !important }`,
 * que venceria um `body.style.overflow = 'hidden'` inline.
 */
const SCROLL_LOCK_STYLE_ID = 'app-body-scroll-lock-style';

/** Contador global de travas ativas (suporta modais aninhados). */
let lockCount = 0;
/** padding-right original do body, capturado quando a primeira trava é aplicada. */
let restorePaddingRight = '';

function ensureStyleElement(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SCROLL_LOCK_STYLE_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = SCROLL_LOCK_STYLE_ID;
  styleEl.textContent = `
    html[data-scroll-locked="true"],
    body[data-scroll-locked="true"] {
      overflow: hidden !important;
      overscroll-behavior: none !important;
    }
  `;
  document.head.appendChild(styleEl);
}

/** @internal Exportado apenas para testes unitários do ref-counting. */
export function applyLock(): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const body = document.body;

  lockCount += 1;
  if (lockCount > 1) return; // já travado por outra trava ativa

  ensureStyleElement();
  restorePaddingRight = body.style.paddingRight;

  // Compensa o desaparecimento da scrollbar para evitar "salto" do layout.
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  html.setAttribute('data-scroll-locked', 'true');
  body.setAttribute('data-scroll-locked', 'true');
}

/** @internal Exportado apenas para testes unitários do ref-counting. */
export function releaseLock(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return; // ainda há travas ativas

  const html = document.documentElement;
  const body = document.body;
  html.removeAttribute('data-scroll-locked');
  body.removeAttribute('data-scroll-locked');
  body.style.paddingRight = restorePaddingRight;
  restorePaddingRight = '';
}

/**
 * Reseta totalmente o estado de scroll-lock, incluindo o contador de referências.
 *
 * Usado pela rede de segurança por rota (`BodyScrollLockCleanup`): a troca de rota
 * desmonta qualquer modal aberto, então o contador deve voltar a zero de forma
 * autoritativa — caso contrário, se o cleanup do React não rodar antes da limpeza
 * de rota, o contador fica dessincronizado e o próximo modal não re-trava o scroll.
 */
export function resetBodyScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;

  lockCount = 0;
  const html = document.documentElement;
  const body = document.body;
  html.removeAttribute('data-scroll-locked');
  body.removeAttribute('data-scroll-locked');
  body.style.paddingRight = restorePaddingRight;
  restorePaddingRight = '';
}

/**
 * Trava o scroll do <body> enquanto `locked` for `true`.
 *
 * Substitui os locks manuais (`document.body.style.overflow = 'hidden'`), que não
 * funcionam no desktop porque perdem para o `!important` do NavbarWrapper e cujo
 * restore é frágil com modais aninhados. Usa contagem de referências, então abrir
 * dois modais ao mesmo tempo só libera o scroll quando ambos fecharem.
 *
 * @param locked - `true` enquanto o modal/overlay estiver aberto.
 *
 * @example
 * useBodyScrollLock(isModalOpen);
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    applyLock();
    return () => releaseLock();
  }, [locked]);
}
