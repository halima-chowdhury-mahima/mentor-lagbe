
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TuitionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tuition details error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[65vh] items-center justify-center px-5 py-12">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto text-red-500" size={42} />

        <h2 className="mt-5 text-2xl font-black">
          Unable to load tuition
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We couldn&apos;t retrieve this tuition&apos;s details.Please try again.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white"
          >
            <RefreshCw size={16} /> Retry
          </button>

          <Link
            href="/browse"
            className="rounded-xl border border-border px-5 py-3 text-sm font-bold"
          >
            Browse Tuitions
          </Link>
        </div>
      </div>
    </main>
  );
}
