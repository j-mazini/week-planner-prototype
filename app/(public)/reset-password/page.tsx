"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { ScaleIn, FadeIn } from "@/components/animations/page-animation";
import { guardedFetch } from "@/lib/in-flight-guard";

// Define validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { guard } = useSubmitGuard();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMissingParams, setIsMissingParams] = useState(false);

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    // Check for email and token after component mounts
    if (!email || !token) {
      setIsMissingParams(true);
    }
  }, [email, token]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      // Call API to reset password
      const response = await guardedFetch(
        `${getApiBaseUrl()}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email ? decodeURIComponent(email) : "",
            token,
            newPassword: values.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/?passwordReset=true");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
      console.error("Password reset failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // If missing parameters, show error card
  if (isMissingParams) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <ScaleIn className="w-full max-w-[400px]">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Missing required information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-destructive mb-4">
                Email and token are required in the URL.
              </div>
              <div className="mt-4 text-center text-sm">
                <Link
                  href="/send-password-reset-token"
                  className="underline underline-offset-4"
                >
                  Request a new password reset
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                <Link href="/" className="underline underline-offset-4">
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScaleIn>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <ScaleIn className="w-full max-w-[400px]">
        <Card>
          <CardHeader>
            <FadeIn delay={0.1}>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Create a new password for your account
              </CardDescription>
            </FadeIn>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(guard(onSubmit))}
                className="space-y-4"
              >
                {error && (
                  <div className="text-sm font-medium text-destructive mb-4">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm font-medium text-green-600 mb-4">
                    Your password has been reset successfully. Redirecting to
                    login page...
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="password"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      ResetPasswordFormValues,
                      "password"
                    >;
                  }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="********"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      ResetPasswordFormValues,
                      "confirmPassword"
                    >;
                  }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="********"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || success}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <Link href="/" className="underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScaleIn>
    </div>
  );
}
