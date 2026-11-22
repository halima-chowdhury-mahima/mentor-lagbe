
"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertCircle size={32} />
        </div>

        <h2 className="mt-6 text-2xl font-black">
         Dashboard couldn&apos;t load
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Something interrupted your dashboard. Please try loading it again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c3552]"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </main>
  );
}
