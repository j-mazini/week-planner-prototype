"use client";

import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * Hook para tornar containers de páginas responsivos ao estado da sidebar
 * Aplica estilos CSS dinâmicos baseados no estado da sidebar (expanded/collapsed)
 */
export function useResponsiveContainer(containerRef: React.RefObject<HTMLElement>) {
  const { state } = useSidebar();
  const isExpanded = state === 'expanded';
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Calcula o max-width baseado no estado da sidebar
    const sidebarWidth = 16 * 16; // 16rem em pixels (256px)
    const padding = 32; // 2rem em pixels
    
    if (isExpanded) {
      // Quando expandida, reduz o espaço disponível
      const maxWidth = `calc(100vw - ${sidebarWidth}px - ${padding * 2}px)`;
      container.style.setProperty('max-width', maxWidth);
      container.style.setProperty('transition', 'max-width 0.3s ease-in-out');
    } else {
      // Quando colapsada, usa mais espaço
      const maxWidth = `min(1600px, calc(100vw - ${padding * 2}px))`;
      container.style.setProperty('max-width', maxWidth);
      container.style.setProperty('transition', 'max-width 0.3s ease-in-out');
    }
  }, [isExpanded, containerRef]);
}

