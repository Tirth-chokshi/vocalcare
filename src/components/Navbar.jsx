import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfileManagement = React.lazy(() => import('./ProfileManagement'));

export default function MainDashboardNavbar({ userRole }) {
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-16 bg-background"><p>Loading...</p></div>;
  }

  if (!session) {
    return <p className="text-center p-4 bg-background">User not authenticated</p>;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src={resolvedTheme === 'dark' ? '/dark.jpg' : '/light.jpg'}
                alt="VocalCare Logo"
                width={160}
                height={40}
                className="transition-transform duration-300 hover:scale-105"
                priority
              />
            </Link>
            <h1 className="ml-6 text-xl font-semibold text-foreground">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                1
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.username || "User"}
                    />
                    <AvatarFallback>
                      {session.user.username ? session.user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">Role: {userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toggleTheme}>
                  {resolvedTheme === 'dark' ? (
                    <>
                      <SunIcon className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ProfileManagement isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />
      </React.Suspense>
    </header>
  );
}