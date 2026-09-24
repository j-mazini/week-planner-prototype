'use client';

import * as React from 'react';

/** API exposta pelo contexto: dispara o aviso global de "item já enviado". */
export interface AlreadySubmittedNotice {
  /**
   * Exibe a modal de aviso. Aceita uma mensagem opcional para sobrepor o texto
   * padrão (ex.: contextualizar por tela).
   */
  notify: (message?: { title?: string; description?: string }) => void;
}

/**
 * Default no-op: permite que `Button`/`useSubmitGuard` chamem `notify()` mesmo
 * fora do provider sem quebrar — simplesmente não exibe nada.
 *
 * Mantido em arquivo próprio (sem importar `Button`) para evitar ciclo de imports
 * entre `components/ui/button` e o provider que usa `Button`.
 */
export const AlreadySubmittedContext = React.createContext<AlreadySubmittedNotice>({
  notify: () => {},
});

/**
 * Acessa o aviso global de "item já enviado". Seguro fora do provider (no-op).
 */
export function useAlreadySubmittedNotice(): AlreadySubmittedNotice {
  return React.useContext(AlreadySubmittedContext);
}
