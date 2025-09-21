"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Settings, User, X, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUserContext } from "@/context/UserContext";

export const items = [
  { title: "My Account", url: "/account", icon: User },
  { title: "Make Appointment", url: "/appointment", icon: Settings },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user } = useUserContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.header
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={headerVariants}
        className={`fixed top-0 left-0 w-full z-50 text-white backdrop-blur-sm ${
          scrolled || !isHomePage ? "bg-neutral-900" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <Link href="/" className="text-2xl font-bold text-white">
              BarberShop
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:text-amber-400">
                Home
              </Link>
              <Link href="/about" className="hover:text-amber-400">
                About
              </Link>
              <Link href="/services" className="hover:text-amber-400">
                Services
              </Link>

              {user?.role === "user" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-6 w-6 cursor-pointer">
                      <AvatarImage
                        src={user?.image}
                        alt={user?.name ?? "User"}
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuLabel className="flex items-center gap-2 font-medium">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.image}
                          alt={user?.name ?? "User"}
                        />
                        <AvatarFallback>
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[calc(100%-2rem)]">
                        {user?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {items.map((item) => (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-500 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login" className="hover:text-amber-400">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Register Account
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="hover:text-amber-400">
                  Home
                </Link>
                <Link href="/about" className="hover:text-amber-400">
                  About
                </Link>
                <Link href="/services" className="hover:text-amber-400">
                  Services
                </Link>

                {user?.role === "user" ? (
                  <>
                    <Link href="/account" className="hover:text-amber-400">
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="text-red-500 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-amber-400">
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors inline-block"
                    >
                      Register Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.header>
    </AnimatePresence>
  );
}
