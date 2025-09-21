"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/toggle-theme";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useUserContext } from "@/context/UserContext";

export const items = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
export function Header() {
  const pathname = usePathname();
  const { user } = useUserContext();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">
          {items.find((item) => pathname.startsWith(item.url))?.title ||
            "Dashboard"}
        </h1>
      </div>
      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationDropdown />
        {/* Profile dropdown inside header */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-6 w-6 cursor-pointer">
              <AvatarImage src={user?.image} alt="User" />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel className="font-medium">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-500 flex items-center gap-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
