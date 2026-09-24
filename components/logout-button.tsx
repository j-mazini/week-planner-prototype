"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
}
