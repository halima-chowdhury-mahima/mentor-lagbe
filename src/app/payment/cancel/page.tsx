
import Link from "next/link";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-xl sm:p-10">
        {/* Cancel Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <XCircle size={42} strokeWidth={1.8} />
        </div>

        {/* Heading */}
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-red-600">
          Payment Cancelled
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          No Payment Was Made
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
          Your checkout process was cancelled before completion. No
          subscription has been activated. You can return to the pricing
          page and try again whenever you are ready.
        </p>

        {/* Information */}
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-left">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-6 text-muted-foreground">
            Your account remains safe. You can choose a subscription plan
            whenever you are ready to continue.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#101F32] px-6 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-[#1c3552] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101F32] focus-visible:ring-offset-2"
          >
            <RefreshCw size={17} />
            Try Again
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>

        <p className="mt-7 text-xs text-muted-foreground">
          Need help? Contact our support team.
        </p>
      </div>
    </main>
  );
}
