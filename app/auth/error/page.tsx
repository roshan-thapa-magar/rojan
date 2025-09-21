"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string; action: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration. Please contact support.",
    action: "Contact Support"
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in. Please contact an administrator.",
    action: "Contact Administrator"
  },
  Verification: {
    title: "Verification Error",
    description: "The verification token has expired or has already been used. Please try signing in again.",
    action: "Try Again"
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
    action: "Try Again"
  }
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorInfo = errorMessages[error as string] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-gray-600">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">
                  Error Code: <code className="font-mono">{error}</code>
                </p>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                If this problem persists, please{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
