// app/reset-password/page.tsx
import React, { Suspense } from "react";
import ResetPasswordForm from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading form…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
