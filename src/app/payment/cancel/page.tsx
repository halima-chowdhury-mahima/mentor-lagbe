
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-9 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <XCircle size={42} />
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-widest text-red-600">Payment Cancelled</p>
        <h1 className="mt-3 text-3xl font-extrabold">No Payment Was Made</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Your payment process was cancelled. You can return to the pricing page and try again whenever you are ready.
        </p>
        <Link href="/pricing" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#1c3552]">
          <ArrowLeft size={17} /> Back to Pricing
        </Link>
      </div>
    </main>
  );
}
