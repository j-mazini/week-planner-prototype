'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavigationPendingContextValue = {
  isPending: boolean;
  pendingTarget: string | null;
  setNavigationPending: (target: string | null) => void;
};

const NavigationPendingContext = createContext<NavigationPendingContextValue | null>(null);

export function NavigationPendingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const setNavigationPending = useCallback((target: string | null) => {
    setPendingTarget(target);
  }, []);

  // Clear pending when we've actually landed on the target route (or any route change after a short delay)
  useEffect(() => {
    if (pendingTarget == null) return;
    // Pathname matches the route we're navigating to (or a child of it)
    const isMatch = pathname === pendingTarget || pathname?.startsWith(pendingTarget + '/');
    if (isMatch) {
      setPendingTarget(null);
    }
  }, [pathname, pendingTarget]);

  // Safety: clear stuck pending after 8s (e.g. navigation error or very slow network)
  useEffect(() => {
    if (pendingTarget == null) return;
    const t = setTimeout(() => setPendingTarget(null), 8000);
    return () => clearTimeout(t);
  }, [pendingTarget]);

  const value: NavigationPendingContextValue = {
    isPending: pendingTarget != null,
    pendingTarget,
    setNavigationPending,
  };

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  const ctx = useContext(NavigationPendingContext);
  if (ctx == null) {
    throw new Error('useNavigationPending must be used within NavigationPendingProvider');
  }
  return ctx;
}
