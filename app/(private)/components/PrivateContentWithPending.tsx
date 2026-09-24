'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationPending } from './NavigationPendingContext';
import { PrivateRouteLoading } from './PrivateRouteLoading';
import { RequireAuthClient } from './RequireAuthClient';
/**
 * Shows skeleton immediately when navigation is pending (sidebar click),
 * then shows the actual page content when the route has loaded.
 * Supervisor: aplica fundo amarelo em todas as telas.
 */
export function PrivateContentWithPending({ children }: { children: React.ReactNode }) {
  const { isPending } = useNavigationPending();
  const { hasRole } = useAuth();
  const isSupervisor = hasRole('supervisor');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const content = <>{children}</>;

  if (isPending) {
    return (
      <>
        <RequireAuthClient />
        {isMounted && isSupervisor && <div className="fixed inset-0 liquid-glass-page-bg liquid-glass-page-bg--supervisor -z-10" aria-hidden />}
        <PrivateRouteLoading />
      </>
    );
  }

  return (
    <>
      <RequireAuthClient />
      {isMounted && isSupervisor && <div className="fixed inset-0 liquid-glass-page-bg liquid-glass-page-bg--supervisor -z-10" aria-hidden />}
      {content}
    </>
  );
}
