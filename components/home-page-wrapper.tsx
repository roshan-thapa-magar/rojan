"use client";

import { AuthRedirectHandler } from "@/components/auth-redirect-handler";
import { useSession } from "next-auth/react";

interface HomePageWrapperProps {
  children: React.ReactNode;
}

export function HomePageWrapper({ children }: HomePageWrapperProps) {
  const { status } = useSession();

  return (
    <>
      {/* Only show redirect handler if user is authenticated */}
      {status === "authenticated" && <AuthRedirectHandler />}
      {children}
    </>
  );
}
