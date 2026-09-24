"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { removeToken, getFullNameFromToken } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function MobileHeader() {
  const [fullName, setFullName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const name = getFullNameFromToken();
    setFullName(name);
  }, []);

  // Remove estilos inline do body aplicados pelo Radix UI quando dropdown abre
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      const body = document.body;
      const style = body.getAttribute('style');
      
      // Verifica se o Radix UI aplicou os estilos de lock
      if (style && (style.includes('position: fixed') || style.includes('pointer-events: none'))) {
        // Remove os estilos inline aplicados pelo Radix
        body.removeAttribute('style');
      }
    });

    // Observa mudanças no atributo style do body
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  const userData = {
    name: "BA-Express",
    avatar: "/ba-express-final-logo.png",
  };

  return (
    <div className="mobile-header md:hidden">
      <style jsx>{`
        .mobile-header {
          /* Sem margin-bottom: o espaçamento do header é controlado pelo PageHeader.
             O margin extra desalinhava verticalmente o logout em relação ao
             MonthSelector (switch month) nos headers com alignHeader="between". */
          margin-bottom: 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          min-height: 58px;
          padding: 0 2px;
          flex-shrink: 0;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          flex-shrink: 0;
        }
        .user-info {
          text-align: right;
          line-height: 1.3;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          max-width: 140px;
        }
        .company-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-dark, #2c3e50);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-name {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-light, #7f8c8d);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-logo {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .user-info {
            max-width: 100px;
          }
          .company-name {
            font-size: 0.8rem;
          }
          .user-name {
            font-size: 0.7rem;
          }
          .user-logo {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="user-profile">
              <div className="user-info">
                <div className="company-name">{userData.name}</div>
                <div className="user-name">{fullName || "Loading..."}</div>
              </div>
              <Image
                src={userData.avatar}
                alt="BA-Express Logo"
                width={45}
                height={45}
                className="user-logo"
                priority
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <div className="relative h-10 w-20 flex-shrink-0">
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium">{userData.name}</span>
                  <span className="truncate text-xs text-gray-500">
                    {fullName || "Loading..."}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
