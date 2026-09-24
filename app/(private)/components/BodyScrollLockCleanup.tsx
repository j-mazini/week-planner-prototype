'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resetBodyScrollLock } from '@/hooks/useBodyScrollLock';

/**
 * Rede de segurança contra scroll-lock preso no <body>.
 *
 * Overlays do Radix (Dialog, Select, DropdownMenu, Popover) usam `react-remove-scroll`,
 * que aplica `overflow:hidden`, `pointer-events:none` e o atributo `data-scroll-locked`
 * no <body> enquanto estão abertos. Em transições de rota (ou abre/fecha rápido) esses
 * overlays podem desmontar antes de restaurar o estado, deixando a página seguinte
 * sem scroll — e às vezes sem cliques — até um reload. Ocorre em Chrome e Safari.
 *
 * Este componente roda a cada navegação e limpa qualquer estado preso. É seguro porque
 * a troca de rota já desmonta os overlays abertos; não interfere num dialog legítimo
 * dentro da mesma página.
 */
export function BodyScrollLockCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;

    const clearStuckScrollLock = () => {
      // Zera o contador do useBodyScrollLock de forma autoritativa: a navegação
      // já desmontou qualquer modal aberto, então o estado deve voltar do zero.
      resetBodyScrollLock();

      // Estilos inline deixados por modais manuais e pelo react-remove-scroll.
      body.style.removeProperty('overflow');
      body.style.removeProperty('pointer-events');
      body.style.removeProperty('padding-right');

      // Atributos de scroll-lock (Radix usa data-scroll-locked; nossos scroll-locks
      // manuais usam o mesmo atributo com valor "true").
      html.removeAttribute('data-scroll-locked');
      body.removeAttribute('data-scroll-locked');
    };

    // Limpa imediatamente e novamente no próximo frame, cobrindo o caso em que o
    // overlay restaura o estado de forma assíncrona logo após a navegação.
    clearStuckScrollLock();
    const raf = requestAnimationFrame(clearStuckScrollLock);

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
