"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useUserContext } from "@/context/UserContext";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { status } = useSession();
  const { user } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // If authenticated but no user role, wait for user context
    if (status === "authenticated" && !user?.role) return;

    // Check if user has required role
    if (user?.role && !allowedRoles.includes(user.role)) {
      // Redirect to not found page
      router.replace("/not-found");
      return;
    }
  }, [status, user?.role, allowedRoles, router]);

  // Show loading while checking permissions
  if (status === "loading" || (status === "authenticated" && !user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback or redirect if not authorized
  if (status === "unauthenticated" || (user?.role && !allowedRoles.includes(user.role))) {
    return fallback || null;
  }

  // User is authorized, show children
  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["admin"]} fallback={fallback}>{children}</RoleGuard>;
}

export function BarberOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["admin", "barber"]} fallback={fallback}>{children}</RoleGuard>;
}

export function AdminOrBarber({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["admin", "barber"]} fallback={fallback}>{children}</RoleGuard>;
}
