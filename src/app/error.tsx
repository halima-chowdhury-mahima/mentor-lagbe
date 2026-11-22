
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertTriangle size={32} />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#B58A39]">
          Something went wrong
        </p>

        <h1 className="mt-3 text-3xl font-black">Oops! An error occurred.</h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We couldn&apos;t load this page. Please try again. If the problem continues,
          come back later.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground">
            Error reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c3552]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold hover:bg-accent"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
