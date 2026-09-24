"use client"

import { useEffect, useState } from "react"
import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { removeToken, getFullNameFromToken } from "@/lib/auth"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavUser({
  user,
}: {
  user: {
    name: string
    avatar: string
  }
}) {
  const router = useRouter()
  const [fullName, setFullName] = useState<string | null>(null)

  useEffect(() => {
    const name = getFullNameFromToken()
    setFullName(name)
  }, [])

  const handleLogout = () => {
    removeToken()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} className="object-contain" />
            <AvatarFallback className="rounded-lg">BA</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-gray-500">{fullName || "Loading..."}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} className="object-contain" />
              <AvatarFallback className="rounded-lg">BA</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-gray-500">{fullName || "Loading..."}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
