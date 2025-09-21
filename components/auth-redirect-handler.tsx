"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AuthRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const redirectByRole = (role: string) => {
        switch (role) {
          case "admin":
          case "barber":
            router.replace("/dashboard");
            break;
          case "user":
            router.replace("/");
            break;
          default:
            router.replace("/");
        }
      };

      // Small delay to ensure session is fully loaded
      const timer = setTimeout(() => {
        redirectByRole(session.user.role);
        toast.success("Welcome back!", {
          description: `Signed in as ${session.user.name}`,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [status, session, router]);

  // Show loading while redirecting
  if (status === "authenticated" && session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
