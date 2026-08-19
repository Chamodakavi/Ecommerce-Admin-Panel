"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { authenticateUser } from "@/functions/auth";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage(null);

  if (!email.trim() || !password.trim()) {
    setErrorMessage("Please enter both email and password.");
    return;
  }

  try {
    setLoading(true);
    const sessionUser = await authenticateUser(email, password);

    if (typeof window !== "undefined") {
      // 1. Save local state
      localStorage.setItem("user_session", JSON.stringify(sessionUser));

      // 2. Set cookie for Next.js middleware (7 days lifespan)
      document.cookie = `user_session=${encodeURIComponent(
        JSON.stringify(sessionUser)
      )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }

    // 3. Navigate to dashboard
    window.location.replace("/dashboard");
  } catch (err: any) {
    setErrorMessage(err.message || "Invalid credentials.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-1 flex-col w-full lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10"></div>
      <div className="mx-auto flex flex-1 w-full max-w-md flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to access the portal.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Email Address <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your registered email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying credentials...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}