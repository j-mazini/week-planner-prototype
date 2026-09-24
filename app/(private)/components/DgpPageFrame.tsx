"use client";

import React, { ReactNode, useState, useEffect } from "react";

export type DgpPageFrameBackgroundVariant = 'default' | 'admin' | 'supervisor';

export type DgpPageFrameWidth = 'narrow' | 'standard' | 'wide' | 'full';

const widthClass: Record<DgpPageFrameWidth, string> = {
  narrow: 'w-full max-w-content-narrow',
  standard: 'w-full max-w-content-standard',
  wide: 'w-full max-w-content-wide',
  full: 'w-full max-w-none',
};

type DgpPageFrameProps = {
  children: ReactNode;
  /**
   * Variante do gradiente de fundo: default/vendor (actual), admin (rosa/azul), supervisor (laranja/amarelo).
   * Usado na página Daily Game Plan para diferenciar por tipo de utilizador.
   */
  backgroundVariant?: DgpPageFrameBackgroundVariant;
  /**
   * Degrau da escala de largura de conteúdo. `full` é para pages que gerem a
   * própria escala (canvas), não para "quero mais espaço".
   */
  width?: DgpPageFrameWidth;
  /**
   * Permite customizar o container interno (padding/spacing) por página,
   * evitando dependência de breakpoints (`md:`, `lg:`) quando desejado.
   */
  containerClassName?: string;
  className?: string;
};

const backgroundVariantClass: Record<DgpPageFrameBackgroundVariant, string> = {
  default: '',
  admin: 'liquid-glass-page-bg--admin',
  supervisor: 'liquid-glass-page-bg--supervisor',
};

export function DgpPageFrame({
  children,
  backgroundVariant = 'default',
  width = 'standard',
  containerClassName = "mx-auto px-4 md:px-[clamp(1.5rem,3vw,3rem)] py-4 md:py-[clamp(1.25rem,2vw,1.75rem)] space-y-4 md:space-y-6",
  className = "",
}: DgpPageFrameProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const bgClass = backgroundVariantClass[backgroundVariant];
  const applyVariant = isMounted && bgClass;
  return (
    <>
      {/* Background layer - fixed to fill entire screen. Variant applied only after mount to avoid hydration mismatch (variant comes from client-only token). */}
      <div
        aria-hidden="true"
        className={`hidden liquid-glass-page-bg${applyVariant ? ` ${bgClass}` : ''}`}
      />
      {/* Content layer */}
      <div className={`relative z-0 min-h-screen ${className}`}>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 767px) {
            .dgp-page-frame-container {
              margin-left: 0 !important;
              margin-right: 0 !important;
              max-width: none !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
          }
        `}} />
        <div className={`${widthClass[width]} ${containerClassName} dgp-page-frame-container`}>
          {children}
        </div>
      </div>
    </>
  );
}
