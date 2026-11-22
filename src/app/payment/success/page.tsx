
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-9 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 size={42} />
        </div>
        <p className="mt-7 text-sm font-bold uppercase tracking-widest text-emerald-600">Payment Successful</p>
        <h1 className="mt-3 text-3xl font-extrabold">Thank You!</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Your payment confirmation page is ready. Your subscription will be activated after Stripe integration is completed.
        </p>
        <Link href="/dashboard/student" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#1c3552]">
          Go to Dashboard <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
