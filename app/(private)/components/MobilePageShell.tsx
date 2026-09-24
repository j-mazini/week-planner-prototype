"use client";

import React, { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MobilePageShellProps {
  /** Conteúdo principal (agrupado em cards/listas) */
  children: ReactNode;
  /** Título da página no mobile */
  title?: string;
  /** Subtítulo ou data (opcional) */
  subtitle?: string;
  /** Placeholder do campo de pesquisa. Se não for passado, a barra de pesquisa não é exibida. */
  searchPlaceholder?: string;
  /** Valor controlado do campo de pesquisa */
  searchValue?: string;
  /** Callback quando o utilizador altera o texto de pesquisa */
  onSearchChange?: (value: string) => void;
  /** Elementos adicionais (ex: filtros em chips) entre o título e o conteúdo. Opcional. */
  filters?: ReactNode;
  /** Classe extra no container principal */
  className?: string;
}

/**
 * Layout para vista mobile das páginas privadas: conteúdo agrupado com barra de pesquisa/filtro.
 * Visível apenas em ecrãs &lt; md (block md:hidden). Use em conjunto com a versão desktop (hidden md:block).
 */
export function MobilePageShell({
  children,
  title,
  subtitle,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  filters,
  className,
}: MobilePageShellProps) {
  const showSearch = searchPlaceholder != null && onSearchChange != null;

  return (
    <main
      className={cn(
        "block md:hidden pt-4 pb-20 px-3 sm:px-4 space-y-3 min-h-screen",
        className
      )}
    >
      {/* Safe area top (notch) */}
      <div
        className="h-[env(safe-area-inset-top,0px)] min-h-[env(safe-area-inset-top,0px)]"
        aria-hidden
      />

      {(title || subtitle) && (
        <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl px-4 py-3 shadow-md shadow-black/5">
          {title && (
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {showSearch && (
        <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 shadow-sm">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <i className="bi bi-search text-sm" aria-hidden />
            </span>
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm bg-background border-0 focus-visible:ring-2"
              aria-label={searchPlaceholder}
            />
          </div>
        </div>
      )}

      {filters && (
        <div className="flex flex-wrap gap-2">{filters}</div>
      )}

      <div className="space-y-3">{children}</div>

      {/* Safe area bottom (home indicator) */}
      <div
        className="h-[env(safe-area-inset-bottom,0px)] min-h-[env(safe-area-inset-bottom,0px)]"
        aria-hidden
      />
    </main>
  );
}
