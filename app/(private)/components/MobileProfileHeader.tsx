"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeToken, getFullNameFromToken } from "@/lib/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function MobileProfileHeader() {
  const [fullName, setFullName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const name = getFullNameFromToken();
    setFullName(name);
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
    <>
      <style jsx global>{`
        .dashboard-header { 
          margin-bottom: 8px; 
          display: flex; 
          justify-content: flex-end;
          align-items: center; 
          min-height: 58px; /* Altura fixa: 50px logo + 8px margin-bottom */
        }
        .user-profile { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer;
        }
        .user-info { 
          text-align: right; 
          line-height: 1.3; 
        }
        .company-name { 
          font-weight: 700; 
          font-size: 1rem; 
          color: #2c3e50; 
        }
        .user-name { 
          font-size: 0.85rem; 
          font-weight: 500; 
          color: #7f8c8d; 
        }
        .user-logo { 
          width: 50px; 
          height: 50px; 
          border-radius: 10px; 
          object-fit: cover; 
        }
      `}</style>
      <div className="dashboard-header">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="user-profile">
              <div className="user-info">
                <div className="company-name">{userData.name}</div>
                <div className="user-name">{fullName || "Loading..."}</div>
              </div>
              <Image
                src={userData.avatar}
                alt="BA-Express Logo"
                width={50}
                height={50}
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
    </>
  );
}
