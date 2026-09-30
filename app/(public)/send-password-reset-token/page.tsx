"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useState } from "react";
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
import { useForm } from "react-hook-form";
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
import { ScaleIn, FadeIn } from "@/components/animations/page-animation";
import { guardedFetch } from "@/lib/in-flight-guard";

// Define validation schema
const resetSchema = z.object({
  email: z.string().email("Invalid email format"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function SendPasswordResetTokenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { guard } = useSubmitGuard();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await guardedFetch(
        `${getApiBaseUrl()}/auth/send-password-reset-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send reset token");
      }

      setSuccess(true);
      form.reset();
    } catch (err: Error | unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset token. Please try again."
      );
      console.error("Reset token error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page flex min-h-dvh w-full items-center justify-center p-4">
      <ScaleIn className="w-full max-w-[400px]">
        <Card>
          <CardHeader>
            <FadeIn delay={0.1}>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your email address to receive a password reset link
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
                    Reset link has been sent to your email
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Remember your password?{" "}
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
