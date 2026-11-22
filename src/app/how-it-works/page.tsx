
import Link from "next/link";
import { UserPlus, Search, MessageCircle, ArrowRight, ShieldCheck, CheckCircle2, GraduationCap } from "lucide-react";
import PublicLayout from "@/components/layout/public-layout";

const steps = [
  { number: "01", title: "Create your account", description: "Register as a student or tutor and complete your profile.", icon: UserPlus },
  { number: "02", title: "Explore opportunities", description: "Browse tuition listings and find the right learning opportunity.", icon: Search },
  { number: "03", title: "Connect and grow", description: "Apply for tuition or connect with a tutor to start learning.", icon: MessageCircle },
];

const features = [
  { title: "Verified profiles", description: "Explore detailed student and tutor profiles.", icon: ShieldCheck },
  { title: "Simple applications", description: "Apply for tuition opportunities through a clear process.", icon: CheckCircle2 },
  { title: "Learning for everyone", description: "Find online and in-person learning opportunities.", icon: GraduationCap },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="bg-[#101F32] px-5 py-16 text-center text-white">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#D9B66F]">Your journey starts here</p>
        <h1 className="text-4xl font-extrabold sm:text-5xl">How MentorLagbe Works</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">A simple way to find tuition opportunities and connect with the right people.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="rounded-3xl border border-border bg-card p-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-black text-[#D9B66F]">{step.number}</span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]"><Icon size={26} /></span>
                </div>
                <h2 className="text-xl font-extrabold">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/40 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#B58A39]">Why MentorLagbe</p>
            <h2 className="mt-3 text-3xl font-extrabold">Designed to make learning easier</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-border bg-card p-7">
                  <Icon size={28} className="text-[#B58A39]" />
                  <h3 className="mt-5 font-extrabold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center">
        <h2 className="text-3xl font-extrabold">Ready to get started?</h2>
        <p className="mt-3 text-muted-foreground">Join MentorLagbe and take your next step.</p>
        <Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-7 py-3.5 font-bold text-white hover:bg-[#1c3552]">
          Create Account <ArrowRight size={18} />
        </Link>
      </section>
    </PublicLayout>
  );
}
