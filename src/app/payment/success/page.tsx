
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { paymentService } from "@/services/payment.service";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Please wait while we verify your payment."
  );

  const verificationStarted = useRef(false);

  // Missing session হলে effect থেকে setState করার প্রয়োজন নেই।
  const currentStatus = !sessionId ? "error" : status;

  const currentMessage = !sessionId
    ? "Payment session ID was not found. Please contact support if your payment was completed."
    : message;

  useEffect(() => {
    if (!sessionId || verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyPayment = async () => {
      try {
        await paymentService.verifyCheckoutSession(sessionId);

        setStatus("success");
        setMessage(
          "Your payment has been verified and your subscription is now activated."
        );
      } catch (error) {
        console.error("Payment verification failed:", error);

        setStatus("error");
        setMessage(
          "We couldn't verify your payment right now. Please try again or contact support."
        );
      }
    };

    void verifyPayment();
  }, [sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-9 text-center shadow-xl">

        {/* Loading State */}
        {currentStatus === "loading" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <Loader2 size={42} className="animate-spin" />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-widest text-blue-600">
              Verifying Payment
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Please Wait...
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {currentMessage}
            </p>
          </>
        )}

        {/* Success State */}
        {currentStatus === "success" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={42} />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-widest text-emerald-600">
              Payment Successful
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Thank You!
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {currentMessage}
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c3552]"
            >
              Go to Dashboard
              <ArrowRight size={17} />
            </Link>
          </>
        )}

        {/* Error State */}
        {currentStatus === "error" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <AlertCircle size={42} />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-widest text-red-600">
              Verification Failed
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Payment Verification
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {currentMessage}
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#285289] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c3552]"
            >
              Go to Dashboard
              <ArrowRight size={17} />
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-muted/30">
          <Loader2
            className="animate-spin text-primary"
            size={36}
          />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
