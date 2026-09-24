/**
 * Núcleo (sem React) da proteção contra double-submit. Extraído para permitir
 * teste unitário da invariante de reentrância sem precisar de jsdom/React.
 */

/** Callback opcional notificado quando o estado de "ocupado" muda. */
type OnBusyChange = (busy: boolean) => void;

/** Callback opcional notificado quando um clique reentrante é descartado. */
type OnBlocked = () => void;

/** Guarda de reentrância: executa no máximo uma ação por vez. */
export interface ReentrancyGuard {
  /** `true` enquanto uma ação está em andamento. */
  isLocked: () => boolean;
  /**
   * Executa `fn` se nenhuma ação estiver em andamento; caso contrário retorna
   * `undefined` sem executar (descarta o clique reentrante). A trava é aplicada
   * de forma síncrona antes de qualquer `await`.
   */
  run: <R>(fn: () => R | Promise<R>) => Promise<R | undefined>;
}

/**
 * Cria uma guarda de reentrância. A trava (`locked`) é mutada sincronamente, então
 * um segundo `run` disparado no mesmo "tick" (duplo-clique) é ignorado de imediato.
 *
 * @param onBusyChange - notificado com `true` ao iniciar e `false` ao terminar.
 * @param onBlocked - notificado quando um `run` reentrante é descartado (ex.: para
 *   exibir um aviso "item já enviado").
 */
export function createReentrancyGuard(
  onBusyChange?: OnBusyChange,
  onBlocked?: OnBlocked
): ReentrancyGuard {
  let locked = false;

  return {
    isLocked: () => locked,
    run: async <R>(fn: () => R | Promise<R>): Promise<R | undefined> => {
      if (locked) {
        onBlocked?.();
        return undefined;
      }
      locked = true;
      onBusyChange?.(true);
      try {
        return await fn();
      } finally {
        locked = false;
        onBusyChange?.(false);
      }
    },
  };
}
