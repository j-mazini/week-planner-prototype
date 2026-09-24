import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
// Removido PageAnimation para melhor performance - a página já tem animações próprias

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
