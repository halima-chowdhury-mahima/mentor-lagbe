
"use client";

import { getDashboardRoute } from "@/lib/dashboard-route";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  LockKeyhole,
  GraduationCap,
  Loader2,
  
} from "lucide-react";

import PublicLayout from "@/components/layout/public-layout";
import { useAuth } from "@/hooks/use-auth";

type UserRole = "student" | "tutor";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export default function RegisterPage() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        "Password must contain uppercase, lowercase and a number."
      );
      return;
    }

    setSubmitting(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const dashboardRoute = getDashboardRoute(user.role);

      // Full navigation so the dashboard loads with the saved access token.
      window.location.replace(dashboardRoute);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
      setSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setGoogleSubmitting(true);

    try {
      const callbackURL = new URL(
        "/auth/google/callback",
        window.location.origin
      );

      // Existing Google accounts must not have their role changed.
      const existingAccountURL = new URL(callbackURL);
      existingAccountURL.searchParams.set("source", "login");

      // Only newly created Google accounts receive the selected role.
      const newUserURL = new URL(callbackURL);
      newUserURL.searchParams.set("source", "register");
      newUserURL.searchParams.set("role", role);

      const response = await fetch(
        `${API_URL}/api/auth/sign-in/social`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider: "google",
            callbackURL: existingAccountURL.toString(),
            newUserCallbackURL: newUserURL.toString(),
            errorCallbackURL: `${window.location.origin}/register?googleError=1`,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.url) {
        throw new Error(
          result?.message ||
            result?.error?.message ||
            "Unable to start Google registration."
        );
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google registration failed. Please try again."
      );

      setGoogleSubmitting(false);
    }
  }

  const isBusy = submitting || googleSubmitting;

  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
              <BookOpen size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              Create Your Account
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Join MentorLagbe and start your learning journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Full Name
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <UserRound
                  size={18}
                  className="text-muted-foreground"
                />

                <input
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Email Address
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <Mail size={18} className="text-muted-foreground" />

                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            <div>
              <span className="mb-3 block text-sm font-bold">
                I want to join as
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    role === "student"
                      ? "border-[#B58A39] bg-[#D9B66F]/15 text-[#B58A39]"
                      : "border-border text-muted-foreground hover:border-[#B58A39]"
                  }`}
                >
                  <GraduationCap size={19} />
                  Student
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setRole("tutor")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    role === "tutor"
                      ? "border-[#B58A39] bg-[#D9B66F]/15 text-[#B58A39]"
                      : "border-border text-muted-foreground hover:border-[#B58A39]"
                  }`}
                >
                  <UserRound size={19} />
                  Tutor
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Password
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <LockKeyhole
                  size={18}
                  className="text-muted-foreground"
                />

                <input
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Toggle password visibility"
                  className="text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>

              <span className="mt-2 block text-xs text-muted-foreground">
                Use at least 8 characters with uppercase, lowercase
                and a number.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Confirm Password
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <LockKeyhole
                  size={18}
                  className="text-muted-foreground"
                />

                <input
                  required
                  minLength={8}
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter your password again"
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label="Toggle confirm password visibility"
                  className="text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101F32] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1c3552] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs font-medium text-muted-foreground">
                OR SIGN UP WITH
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3.5 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleSubmitting ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 48 48"
  width="19"
  height="19"
  aria-hidden="true"
>
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.1 13.22l7.98 6.19C13 13.72 18.11 9.5 24 9.5z" transform="translate(0 5)" />
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.72 5.99c4.51-4.17 7.08-10.31 7.08-17.64z" />
  <path fill="#FBBC05" d="M10.08 28.41a14.4 14.4 0 0 1 0-8.82L2.1 13.4a24 24 0 0 0 0 21.2l7.98-6.19z" transform="translate(0 5)" />
  <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.86-5.81l-7.72-5.99c-2.14 1.45-4.88 2.3-8.14 2.3-5.89 0-10.9-3.97-12.69-9.32l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
</svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#B58A39]"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
