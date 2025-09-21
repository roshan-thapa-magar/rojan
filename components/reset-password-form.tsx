"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordFormSchema, ResetPasswordFormInputs } from "@/lib/validation-schemas";
import PasswordStrengthIndicator from "./password-strength-indicator";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onChange",
  });

  const watchedPassword = watch("newPassword");
  const watchedConfirmPassword = watch("confirmPassword");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  // Trigger validation when both passwords are filled
  useEffect(() => {
    if (watchedPassword && watchedConfirmPassword) {
      trigger();
    }
  }, [watchedPassword, watchedConfirmPassword, trigger]);



  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          newPassword: data.newPassword 
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(responseData.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Password Reset Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Reset Your Password</CardTitle>
        <p className="text-sm text-gray-600">
          Enter your new password below.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.newPassword.message}
              </p>
            )}
            
            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={watchedPassword} />
            
            {/* Helpful message */}
            {watchedPassword && (
              <p className="text-xs text-gray-500">
                Make sure both password fields are filled and match to enable the Reset Password button.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isValid || !watchedPassword || !watchedConfirmPassword}
            title={
              !watchedPassword ? "Please enter a password" :
              !watchedConfirmPassword ? "Please confirm your password" :
              !isValid ? "Please fix validation errors" :
              "Reset Password"
            }
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          


          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
