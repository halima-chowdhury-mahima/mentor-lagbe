
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PublicLayout from "@/components/layout/public-layout";

const starterFeatures = [
  "Up to 2 tuition posts (Tutor)",
  "Up to 5 tuition bookmarks (Student)",
  "Direct tuition applications",
  "Basic profile and search filters",
];

const proFeatures = [
  "Unlimited tuition posts and bookmarks",
  "Golden PRO verification badge",
  "Priority listing in search and category filters",
  "Priority applicant notifications and reviews",
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#101F32] px-5 py-20 text-center text-white sm:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D9B66F]/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9B66F]/30 bg-[#D9B66F]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E5C783]">
              <Sparkles size={14} />
              Simple and transparent pricing
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Choose the Right Plan
              <span className="block text-[#D9B66F]">
                Grow with MentorLagbe
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Start for free or unlock more opportunities with MentorLagbe
              PRO. Choose the plan that fits your learning or tutoring goals.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B58A39]">
              Membership plans
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
              Simple plans. Better opportunities.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              No complicated pricing. Start with the essentials and upgrade
              whenever you are ready.
            </p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {/* Starter Plan */}
            <article className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32]/10 text-[#B58A39]">
                <GraduationCap size={29} />
              </div>

              <div className="mt-7">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Get started
                </p>

                <div className="mt-2 flex items-baseline gap-3">
  <h3 className="text-2xl font-semibold text-foreground">
    Starter Plan
  </h3>

  <h6 className="text-sm font-normal text-muted-foreground">
    Free Forever
  </h6>
</div>
                

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Everything you need to start exploring teaching and learning
                  opportunities.
                </p>
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  ৳0
                </span>

                <span className="mb-2 text-sm font-medium text-muted-foreground">
                  / month
                </span>
              </div>

              <div className="my-8 h-px bg-border" />

              <p className="mb-5 text-sm font-bold text-foreground">
                What&apos;s included:
              </p>

              <ul className="flex-1 space-y-5">
                {starterFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-10 flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-[#a6a64b] bg-[#809cc1] px-5 py-4 text-center text-sm font-extrabold text-white transition hover:border-[#243F60] hover:bg-[#243F60] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B66F]/40"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Free forever. No subscription required.
              </p>
            </article>

            {/* MentorLagbe PRO */}
            <article className="relative flex flex-col rounded-3xl border-2 border-[#D9B66F] bg-[#101F32] p-7 text-white shadow-2xl shadow-[#101F32]/15 transition duration-300 hover:-translate-y-1 sm:p-9">
              <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-[#D9B66F] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#101F32] shadow-lg">
                <Crown size={14} />
                Recommended
              </div>

              <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#E5C783]">
                <ShieldCheck size={29} />
              </div>

              <div className="mt-7">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-extrabold">
                    MentorLagbe PRO
                  </h3>

                  <span className="rounded-md border border-[#D9B66F]/50 bg-[#D9B66F]/15 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-[#E5C783]">
                    PRO
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Unlock premium benefits, get noticed faster, and make the
                  most of every opportunity.
                </p>
              </div>

              {/* Separate prices */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <GraduationCap size={17} className="text-[#D9B66F]" />
                    Student
                  </div>

                  <div className="mt-3 flex flex-wrap items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white sm:text-4xl">
                      $10
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9B66F]/50 bg-[#D9B66F]/10 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Crown size={17} className="text-[#E5C783]" />
                    Tutor
                  </div>

                  <div className="mt-3 flex flex-wrap items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#E5C783] sm:text-4xl">
                      $15
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                </div>
              </div>

              <div className="my-8 h-px bg-white/15" />

              <p className="mb-5 text-sm font-bold text-white">
                Everything in Starter, plus:
              </p>

              <ul className="flex-1 space-y-5">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9B66F]/15 text-[#E5C783]">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* PRO Checkout Buttons */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/login?plan=student-pro"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#D9B66F] px-4 py-4 text-center text-sm font-extrabold text-[#101F32] transition hover:bg-[#EBCB87] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B66F]/40"
                >
                  Student PRO
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/login?plan=tutor-pro"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#D9B66F] bg-transparent px-4 py-4 text-center text-sm font-extrabold text-[#E5C783] transition hover:bg-[#D9B66F]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9B66F]/40"
                >
                  Tutor PRO
                  <ArrowRight size={17} />
                </Link>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Login with your existing account to purchase PRO.
              </p>
            </article>
          </div>

          {/* Bottom note */}
          <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <ShieldCheck size={19} className="text-[#B58A39]" />

            <p className="text-sm text-muted-foreground">
              Your learning and tutoring journey deserves the right support.
              Start with MentorLagbe today.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
