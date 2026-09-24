"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MOCK_MODE } from "@/lib/mock-api";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { AlreadySubmittedProvider } from "@/components/already-submitted-notice";
import { installApiFetchCredentials } from "@/lib/installApiFetchCredentials";

const ReactQueryDevtools = process.env.NODE_ENV === "development"
  ? dynamic(() => import("@tanstack/react-query-devtools").then(m => m.ReactQueryDevtools), { ssr: false })
  : null;

// Install before child effects run; those effects can fetch on their first mount.
installApiFetchCredentials();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: MOCK_MODE ? 60_000 : 0,
        gcTime: MOCK_MODE ? 300_000 : 0,
        retry: 1,
        refetchOnMount: MOCK_MODE ? true : "always",
        refetchOnWindowFocus: !MOCK_MODE,
        refetchOnReconnect: !MOCK_MODE,
      },
    },
  }));

  useEffect(() => {
    installApiFetchCredentials();
    try {
      localStorage.removeItem("startedOperations");
      sessionStorage.removeItem("startedOperations");
      localStorage.removeItem("auth-token");
    } catch {
      // Storage may be unavailable during static previews.
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlreadySubmittedProvider>{children}</AlreadySubmittedProvider>
      </AuthProvider>
      {ReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
