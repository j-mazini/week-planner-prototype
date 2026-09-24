'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasAuthSession } from '@/lib/auth';

/**
 * Client-side auth guard for (private) routes.
 *
 * O middleware protege no servidor (cookie httpOnly `auth-token`). Aqui alinhamos
 * o cliente: sessão válida = cookie `is-authenticated` e/ou legado `localStorage.auth-token`,
 * para não tratar utilizadores só com cookie como "deslogados" no front.
 */
export function RequireAuthClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check immediately first
    if (hasAuthSession()) {
      setChecked(true);
      return;
    }

    // Not authenticated on first check — wait one tick to allow cookies/sessionStorage
    // set during login (saveToken / auth.login) to propagate before deciding to redirect.
    // This prevents a race condition where the private layout mounts and fires the effect
    // before the browser has made the auth state visible to document.cookie.
    const timer = setTimeout(() => {
      if (!hasAuthSession()) {
        const callbackUrl = pathname || '/home';
        const search = new URLSearchParams({ callbackUrl }).toString();
        router.replace(`/?${search}`);
        return;
      }
      setChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  if (!checked) {
    return null;
  }

  return null;
}

