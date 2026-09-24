"use client";

import { useState, useEffect } from 'react';
import { getFullNameFromToken, removeToken } from '@/lib/auth';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserCard() {
  const router = useRouter();
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const { data: company } = useCurrentCompany();
  const companyName = company?.companyName ?? '...';

  useEffect(() => {
    const fullName = getFullNameFromToken();
    if (fullName) {
      setUserFullName(fullName);
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 hover:shadow-md hover:bg-slate-50 transition-all duration-200 cursor-pointer">
          <div className="text-right">
            <div className="font-bold text-xs text-slate-800 leading-tight">{companyName}</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">{userFullName || 'Admin'}</div>
          </div>
          <div className="relative w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <Image
              src="/ba-express-final-logo.png"
              alt="BA Express Logo" 
              fill
              className="object-contain"
              sizes="32px"
              priority
              unoptimized
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

