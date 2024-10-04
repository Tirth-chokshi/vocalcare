"use client"
import React, { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Bell, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ModeToogle"

export default function MainDashboardNavbar({ userRole }) {
  const { data: session, status } = useSession()
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    console.log('Current theme:', theme)
    console.log('Resolved theme:', resolvedTheme)
  }, [theme, resolvedTheme])

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (!session) {
    return <p>User not authenticated</p>
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" })
  }

  return (
    <header className="bg-background text-foreground shadow">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <div className="relative w-40 h-10">
              <Image
                src={resolvedTheme === 'dark' ? '/dark.jpg' : '/light.jpg'}
                alt="VocalCare Logo"
                fill
                className="object-contain transition-transform duration-300 hover:scale-110"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback>
                    {session.user.name ? session.user.name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Role: {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}