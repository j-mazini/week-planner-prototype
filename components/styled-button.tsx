'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import '@/styles/buttons.css';

export interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante do botão */
  variant?: 'primary' | 'outline-secondary' | 'success' | 'danger' | 'neo-success' | 'neo-danger' | 'neo-primary' | 'neo-glass' | 'liquid-glass' | 'sidebar';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Se deve usar classes Bootstrap (para compatibilidade) */
  useBootstrap?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo do botão */
  children: React.ReactNode;
}

/**
 * Componente de botão estilizado com animações unificadas
 * 
 * Este componente fornece estilização e animações consistentes
 * para todos os botões da aplicação.
 * 
 * @example
 * ```tsx
 * <StyledButton variant="primary" size="md" onClick={handleClick}>
 *   <i className="bi bi-plus-lg"></i> Novo
 * </StyledButton>
 * ```
 */
export const StyledButton = React.forwardRef<HTMLButtonElement, StyledButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      useBootstrap = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'styled-button';
    const variantClass = `styled-button--${variant}`;
    const sizeClass = `styled-button--${size}`;
    
    // Classes Bootstrap para compatibilidade
    const bootstrapClasses = useBootstrap
      ? variant === 'primary'
        ? 'btn btn-primary'
        : variant === 'success'
          ? 'btn btn-success'
          : variant === 'danger'
            ? 'btn btn-danger'
            : 'btn btn-outline-secondary'
      : '';

    const combinedClasses = cn(
      baseClasses,
      variantClass,
      sizeClass,
      bootstrapClasses,
      className
    );

    const isLiquidGlass = variant === 'liquid-glass';

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled}
        {...props}
      >
        {isLiquidGlass ? <span aria-hidden className="liquid-sheen" /> : null}
        {isLiquidGlass ? (
          <span className="relative z-[2] inline-flex items-center justify-center gap-2">
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

StyledButton.displayName = 'StyledButton';

export default StyledButton;

