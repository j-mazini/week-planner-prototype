'use client';

import React from 'react';
import './status-badge.css';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'paid' 
  | 'disputed' 
  | 'maintenance' 
  | 'expiring' 
  | 'expired'
  | 'completed' 
  | 'delivered' 
  | 'working' 
  | 'in-progress'
  | 'off'
  | 'verified'
  | 'incomplete'
  | 'green'
  | 'default';

interface StatusBadgeProps {
  status: StatusType | string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Componente reutilizável para badges de status com glow e animação
 * Suporta múltiplos tipos de status com estilização consistente
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  children,
  className = '' 
}) => {
  // Normalizar o status para o tipo correto
  const normalizedStatus = normalizeStatus(status);
  
  // Se children for fornecido, usar ele, caso contrário usar o status
  const displayText = children || status;

  return (
    <span 
      className={`status-badge status-badge-${normalizedStatus} ${className}`}
    >
      {displayText}
    </span>
  );
};

/**
 * Normaliza diferentes variações de status para tipos padronizados
 */
function normalizeStatus(status: string): StatusType {
  const lowerStatus = status.toLowerCase().trim();
  
  // Mapeamento de variações comuns
  const statusMap: Record<string, StatusType> = {
    'active': 'active',
    'activo': 'active',
    'ativo': 'active',
    'complete': 'active',
    'completed': 'completed',
    'delivered': 'delivered',
    'verified': 'verified',
    'green': 'green',
    
    'inactive': 'inactive',
    'inativo': 'inactive',
    'off': 'off',
    
    'pending': 'pending',
    'pendente': 'pending',
    'incomplete': 'incomplete',
    'incompleto': 'incomplete',
    
    'paid': 'paid',
    'pago': 'paid',
    
    'disputed': 'disputed',
    'disputado': 'disputed',
    
    'maintenance': 'maintenance',
    'manutenção': 'maintenance',
    
    'expiring': 'expiring',
    'expirando': 'expiring',
    'expired': 'expired',
    'expirado': 'expired',
    
    'working': 'working',
    'trabalhando': 'working',
    
    'in progress': 'in-progress',
    'in-progress': 'in-progress',
    'em progresso': 'in-progress',
  };
  
  return statusMap[lowerStatus] || 'default';
}

export default StatusBadge;

