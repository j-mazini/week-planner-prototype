import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
// Removido PageAnimation para melhor performance - a página já tem animações próprias

export default function Page() {
  return (
    <Suspense fallback={<div className="logix-login-fallback">Loading workspace…</div>}>
      <LoginForm />
    </Suspense>
  );
}
