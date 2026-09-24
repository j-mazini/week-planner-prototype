'use client';

import React from 'react';
import { StyledButton } from './styled-button';
import { cn } from '@/lib/utils';

export interface NewButtonProps {
  /** Função chamada quando o botão é clicado */
  onClick: () => void;
  /** Texto do botão */
  label?: string;
  /** Classe CSS adicional para o botão */
  className?: string;
  /** Ícone a ser exibido (classe Bootstrap Icons) */
  icon?: string;
  /** Se o botão está desabilitado */
  disabled?: boolean;
  /** Variante do botão */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
}

export const NewButton = React.forwardRef<HTMLButtonElement, NewButtonProps>(({
  onClick,
  label = 'New',
  className,
  icon = 'bi bi-plus-lg',
  disabled = false,
  variant = 'primary',
  size = 'md',
}, ref) => {
  // Mapear variantes para o StyledButton
  const styledVariant: 'primary' | 'outline-secondary' = 
    variant === 'outline-primary' || variant === 'outline-secondary' 
      ? 'outline-secondary' 
      : 'primary';

  return (
    <StyledButton
      ref={ref}
      variant={styledVariant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      useBootstrap={true}
      className={cn('d-flex align-items-center gap-2', className)}
    >
      <i className={icon}></i> {label}
    </StyledButton>
  );
});

NewButton.displayName = 'NewButton';

export default NewButton;

