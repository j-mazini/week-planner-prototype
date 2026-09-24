'use client';

import { useCallback, useRef, useState } from 'react';
import { createReentrancyGuard, type ReentrancyGuard } from '@/lib/submit-guard';
import { useAlreadySubmittedNotice } from '@/components/already-submitted-context';

/** Tipo de uma função handler assíncrona (ou síncrona) arbitrária. */
type AnyHandler<Args extends unknown[], R> = (...args: Args) => R | Promise<R>;

/** Opções do {@link useSubmitGuard}. */
export interface UseSubmitGuardOptions {
  /**
   * Chamado quando um clique reentrante é descartado. Por padrão, exibe a modal
   * global "item já enviado". Passe `null` para não exibir nada, ou uma função
   * para customizar.
   */
  onBlocked?: (() => void) | null;
}

/** Valor de retorno do hook {@link useSubmitGuard}. */
export interface SubmitGuard {
  /** `true` enquanto a ação protegida estiver em andamento — use em `disabled`. */
  isSubmitting: boolean;
  /**
   * Envolve um handler com uma trava de reentrância. Cliques subsequentes enquanto
   * a ação está em andamento são ignorados (e disparam o aviso "item já enviado").
   */
  guard: <Args extends unknown[], R>(
    fn: AnyHandler<Args, R>
  ) => (...args: Args) => Promise<R | undefined>;
}

/**
 * Previne double-submit (duplo-clique) em ações assíncronas.
 *
 * A trava é síncrona (via {@link createReentrancyGuard} mantida em `useRef`), então
 * funciona já no segundo clique do mesmo "tick" — ao contrário de depender apenas de
 * `disabled={isSubmitting}`, cujo `setState` é assíncrono. Ao descartar um clique
 * reentrante, exibe por padrão a modal global de "item já enviado".
 *
 * @example
 * const { isSubmitting, guard } = useSubmitGuard();
 * <form onSubmit={guard(handleSubmit)}>...</form>
 */
export function useSubmitGuard(options?: UseSubmitGuardOptions): SubmitGuard {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notice = useAlreadySubmittedNotice();

  // Mantém os callbacks atuais num ref para que a guarda (criada uma única vez)
  // sempre invoque a versão mais recente sem recriar o ReentrancyGuard.
  const onBlockedRef = useRef(options?.onBlocked);
  onBlockedRef.current = options?.onBlocked;
  const noticeRef = useRef(notice);
  noticeRef.current = notice;

  const guardRef = useRef<ReentrancyGuard | null>(null);
  if (guardRef.current === null) {
    guardRef.current = createReentrancyGuard(setIsSubmitting, () => {
      const custom = onBlockedRef.current;
      if (custom === null) return; // explicitamente desativado
      if (custom) {
        custom();
        return;
      }
      noticeRef.current.notify(); // padrão: aviso global
    });
  }

  const guard = useCallback(
    <Args extends unknown[], R>(fn: AnyHandler<Args, R>) =>
      (...args: Args): Promise<R | undefined> =>
        guardRef.current!.run(() => fn(...args)),
    []
  );

  return { isSubmitting, guard };
}
