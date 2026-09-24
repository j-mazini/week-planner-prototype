"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavbarWrapper from "@/components/navbar-wrapper";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const needsShell = ["/daily", "/op-management", "/performance"].includes(pathname);
  return <div className="app-global-page">{needsShell ? <NavbarWrapper>{children}</NavbarWrapper> : children}</div>;
}
