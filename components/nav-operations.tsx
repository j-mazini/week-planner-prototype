"use client";

import React, { startTransition } from "react";
import {
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function NavOperations({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Memoizar o cálculo de isActive para evitar re-renders desnecessários
  const getIsActive = React.useCallback((url: string) => {
    return pathname === url || pathname?.startsWith(url + '/');
  }, [pathname]);

  // Handler para navegação imediata usando startTransition
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    startTransition(() => {
      router.push(url);
    });
  }, [router]);

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {projects.map((item) => {
            const isActive = getIsActive(item.url);
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                <Link
                  href={item.url}
                  prefetch={false}
                  onClick={(e) => handleClick(e, item.url)}
                  className="no-underline"
                >
                  <item.icon />
                  <span className="break-words overflow-wrap-break-word whitespace-normal leading-[1.3] hyphens-auto">{item.name}</span>
                </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
