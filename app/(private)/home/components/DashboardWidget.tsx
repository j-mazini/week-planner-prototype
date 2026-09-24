"use client";

import React from "react";

interface DashboardWidgetProps {
  children: React.ReactNode;
  /** Classe adicional no container (ex.: bordas, sombra) */
  className?: string;
}

/**
 * Wrapper para cada bloco do dashboard.
 * Garante que o conteúdo seja responsivo ao tamanho do bloco:
 * - Ocupa 100% da altura/largura da célula da grid
 * - Layout em coluna: primeiro filho (handle) fixo, resto com scroll
 */
export function DashboardWidget({ children, className = "" }: DashboardWidgetProps) {
  return (
    <div
      className={`h-full w-full min-h-0 flex flex-col overflow-hidden bg-transparent ${className}`}
    >
      {children}
    </div>
  );
}
