
"use client";

import { getDashboardRoute } from "@/lib/dashboard-route";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Loader2,
 
} from "lucide-react";

import PublicLayout from "@/components/layout/public-layout";
import { useAuth } from "@/hooks/use-auth";
import {
  paymentService,
  type SubscriptionPlan,
} from "@/services/payment.service";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login({ email, password });

      // Preserve the selected PRO plan from the login URL.
      const params = new URLSearchParams(window.location.search);
      const selectedPlan = params.get("plan");

      if (
        selectedPlan === "student-pro" ||
        selectedPlan === "tutor-pro"
      ) {
        const requiredRole =
          selectedPlan === "student-pro" ? "student" : "tutor";

        if (user.role !== requiredRole) {
          setError(
            `This PRO plan is only available for ${requiredRole} accounts. Please sign in with the correct account.`
          );
          return;
        }

        const checkoutUrl =
          await paymentService.createCheckoutSession(
            selectedPlan as SubscriptionPlan
          );

        window.location.assign(checkoutUrl);
        return;
      }

      router.replace(getDashboardRoute(user.role));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleSubmitting(true);

    try {
      // Preserve PRO plan information during Google authentication.
      const currentParams = new URLSearchParams(
        window.location.search
      );

      const callbackParams = new URLSearchParams();

      const selectedPlan = currentParams.get("plan");

      if (
        selectedPlan === "student-pro" ||
        selectedPlan === "tutor-pro"
      ) {
        callbackParams.set("plan", selectedPlan);
      }

      callbackParams.set("source", "login");

      const callbackURL = new URL(
        "/auth/google/callback",
        window.location.origin
      );

      callbackURL.search = callbackParams.toString();

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
            callbackURL: callbackURL.toString(),
            errorCallbackURL: `${window.location.origin}/login?googleError=1`,
            newUserCallbackURL: callbackURL.toString(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.url) {
        throw new Error(
          result?.message ||
            result?.error?.message ||
            "Unable to start Google sign in."
        );
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign in failed. Please try again."
      );

      setGoogleSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <section className="flex min-h-[75vh] items-center justify-center px-5 py-14">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
              <BookOpen size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to MentorLagbe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
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
              disabled={submitting || googleSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101F32] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1c3552] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs font-medium text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting || googleSubmitting}
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
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#B58A39]"
            >
              Create Account
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
