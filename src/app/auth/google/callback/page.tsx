
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import PublicLayout from "@/components/layout/public-layout";
import axiosInstance from "@/lib/axios";
import { authService } from "@/services/auth.service";
import {
  paymentService,
  type SubscriptionPlan,
} from "@/services/payment.service";
import { getDashboardRoute } from "@/lib/dashboard-route";

type UserRole = "student" | "tutor";

export default function GoogleCallbackPage() {
  const started = useRef(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;

    started.current = true;

    const completeGoogleAuthentication = async () => {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const oauthError = params.get("error");

        if (oauthError) {
          throw new Error(
            params.get("error_description") ||
              "Google authentication was unsuccessful."
          );
        }

        const source = params.get("source");
        const selectedRole = params.get("role");

        // Step 1: Validate role for a newly registered Google user.
        if (
          source === "register" &&
          selectedRole !== "student" &&
          selectedRole !== "tutor"
        ) {
          throw new Error("Invalid account role selection.");
        }

        // Step 2: Get the initial JWT from Better Auth session.
        const tokenResponse = await axiosInstance.get(
          "/api/auth/token",
          { withCredentials: true }
        );

        const initialToken = tokenResponse.data?.token;

        if (!initialToken) {
          throw new Error(
            "Unable to create your authentication token."
          );
        }

        localStorage.setItem("accessToken", initialToken);

        // Step 3: Set role only for a newly registered Google account.
        if (source === "register") {
          await axiosInstance.patch("/api/profile/role", {
            role: selectedRole as UserRole,
          });

          // Step 4: Refresh JWT with the selected role.
          const refreshedTokenResponse =
            await axiosInstance.get("/api/auth/token", {
              withCredentials: true,
            });

          const refreshedToken =
            refreshedTokenResponse.data?.token;

          if (!refreshedToken) {
            throw new Error(
              "Unable to refresh your authentication token."
            );
          }

          localStorage.setItem(
            "accessToken",
            refreshedToken
          );
        }

        // Step 5: Load the authenticated user profile.
        const user = await authService.getMe();

        if (!user?.email || !user?.role) {
          throw new Error(
            "Unable to load your account information."
          );
        }

        // Step 6: Continue Stripe PRO checkout if requested.
        const selectedPlan = params.get("plan");

        if (
          selectedPlan === "student-pro" ||
          selectedPlan === "tutor-pro"
        ) {
          const requiredRole =
            selectedPlan === "student-pro"
              ? "student"
              : "tutor";

          if (user.role !== requiredRole) {
            throw new Error(
              `This PRO plan is only available for ${requiredRole} accounts. Please use the correct account.`
            );
          }

          const checkoutUrl =
            await paymentService.createCheckoutSession(
              selectedPlan as SubscriptionPlan
            );

          window.location.assign(checkoutUrl);
          return;
        }

        // Step 7: Redirect to the correct dashboard.
        window.location.replace(
          getDashboardRoute(user.role)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Google authentication failed. Please try again."
        );
      }
    };

    void completeGoogleAuthentication();
  }, []);

  return (
    <PublicLayout>
      <section className="flex min-h-[75vh] items-center justify-center px-5 py-14">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl sm:p-10">
          {error ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <ShieldCheck size={28} />
              </div>

              <h1 className="mt-5 text-2xl font-extrabold">
                Authentication Failed
              </h1>

              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
              >
                {error}
              </p>

              <a
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c3552]"
              >
                Back to Sign In
              </a>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
                <Loader2
                  size={28}
                  className="animate-spin"
                />
              </div>

              <h1 className="mt-5 text-2xl font-extrabold">
                Completing Sign In
              </h1>

              <p className="mt-3 text-sm text-muted-foreground">
                Please wait while we securely verify your Google
                account and prepare your dashboard.
              </p>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
