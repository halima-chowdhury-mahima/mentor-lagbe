
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  GraduationCap,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  Globe2,
  Target,
  Award,
  BookMarked,
} from "lucide-react";

import ThemeToggle from "@/components/shared/theme-toggle";
import AnimatedStats from "@/components/home/animated-stats";
import FeaturedTuitionsSection from "@/components/home/featured-tuitions";

const categories = [
  {
    title: "Academic",
    description: "School, college & university",
    icon: BookOpen,
  },
  {
    title: "Admission",
    description: "University admission preparation",
    icon: GraduationCap,
  },
  {
    title: "Language",
    description: "English & other languages",
    icon: Globe2,
  },
  {
    title: "Skills",
    description: "Programming, design & more",
    icon: Target,
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register as a student or tutor and complete your profile in just a few minutes.",
    icon: Users,
  },
  {
    number: "02",
    title: "Explore opportunities",
    description:
      "Browse tuition listings, use filters and find the right learning opportunity.",
    icon: Search,
  },
  {
    number: "03",
    title: "Connect and grow",
    description:
      "Apply for tuition or connect with a tutor to begin your learning journey.",
    icon: GraduationCap,
  },
];

const benefits = [
  {
    title: "Verified profiles",
    description: "Discover tutors and students through detailed profiles.",
    icon: ShieldCheck,
  },
  {
    title: "Easy applications",
    description: "Apply for tuition opportunities through a simple process.",
    icon: CheckCircle2,
  },
  {
    title: "Flexible learning",
    description: "Find online and in-person learning opportunities.",
    icon: Globe2,
  },
  {
    title: "Transparent pricing",
    description: "Explore clear plans and choose what works for you.",
    icon: Wallet,
  },
];

const testimonials = [
  {
    name: "Ayesha Rahman",
    role: "University Student",
    review:
      "The platform makes it easier to discover tuition opportunities and manage applications.",
    rating: 5,
  },
  {
    name: "Tanvir Hasan",
    role: "Private Tutor",
    review:
      "I like having tuition information and applications organized in one place.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Parent",
    review:
      "Finding suitable learning support feels more convenient with MentorLagbe.",
    rating: 5,
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div
      className={
        centered
          ? "mx-auto mb-12 max-w-2xl text-center"
          : "mb-12 max-w-2xl"
      }
    >
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#159A79]">
        {eyebrow}
      </p>

      <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101F32] text-[#D9B66F]">
            <GraduationCap size={24} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Mentor<span className="text-[#159A79]">Lagbe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/" className="text-sm font-semibold text-[#159A79]">
            Home
          </Link>

          <Link
            href="/browse"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Browse Tuitions
          </Link>

          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Pricing
          </Link>

          <Link
            href="/how-it-works"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-accent sm:inline-flex"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full !bg-[#101F32] px-5 py-2.5 text-sm font-bold !text-white transition hover:!bg-[#1c3552]"
          >
            Get Started <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#101F32] text-white">
      <div className="absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full bg-[#159A79]/15 blur-3xl" />
      <div className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full bg-[#D9B66F]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#E8D4A7]">
            <Sparkles size={16} />
            Your learning journey starts here
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.13] tracking-tight sm:text-5xl lg:text-6xl">
            Find the right
            <span className="block text-[#D9B66F]">
              mentor. Build your
            </span>
            <span className="block">bright future.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Connect with trusted tutors, discover tuition opportunities and
            make learning more accessible with MentorLagbe.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full !bg-[#D9B66F] px-7 py-3.5 font-bold !text-[#101F32] transition hover:!bg-[#ebcb87]"
            >
              Explore Tuitions <ArrowRight size={18} />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 !bg-transparent px-7 py-3.5 font-bold !text-white transition hover:!bg-white/10"
            >
              Become a Tutor
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#D9B66F]" />
              Easy registration
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-[#D9B66F]" />
              Flexible opportunities
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#D9B66F]/10 blur-2xl" />

          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  Discover opportunities
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Find your next tuition
                </h3>
              </div>

              <span className="rounded-xl bg-[#D9B66F]/15 p-3 text-[#D9B66F]">
                <BookOpen size={25} />
              </span>
            </div>

            <form action="/browse" method="GET" className="mt-7 space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3.5">
                <Search size={19} className="text-[#D9B66F]" />

                <input
                  name="search"
                  type="search"
                  placeholder="Search subject or class..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3.5">
                <MapPin size={19} className="text-[#D9B66F]" />

                <input
                  name="location"
                  type="text"
                  placeholder="Enter your location..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl !bg-[#D9B66F] py-4 font-bold !text-[#101F32] transition hover:!bg-[#ebcb87]"
              >
                Search Tuitions <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-2xl font-extrabold text-[#D9B66F]">
                  500+
                </p>
                <p className="text-xs text-slate-300">Opportunities</p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-[#D9B66F]">
                  850+
                </p>
                <p className="text-xs text-slate-300">Tutors</p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-[#D9B66F]">
                  4.9/5
                </p>
                <p className="text-xs text-slate-300">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="bg-background px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Explore categories"
          title="Learning opportunities for every goal"
          description="Explore different subjects and learning categories to find an opportunity that matches your goals."
          centered
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={`/browse?category=${encodeURIComponent(category.title)}`}
                className="group rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-[#159A79]/40 hover:shadow-xl"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#159A79]/10 text-[#159A79] transition group-hover:bg-[#159A79] group-hover:text-white">
                  <Icon size={27} />
                </span>

                <h3 className="mt-6 text-lg font-bold text-foreground">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#159A79]">
                  Explore <ArrowUpRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-background px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Simple process"
          title="Getting started is easy"
          description="A simple journey from creating your account to finding the right learning connection."
          centered
        />

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold text-[#D9B66F]">
                    {step.number}
                  </span>

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
                    <Icon size={27} />
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-[#101F32] px-5 py-20 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#D9B66F]">
            Why MentorLagbe
          </p>

          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            A smarter way to connect, teach and learn.
          </h2>

          <p className="mt-5 max-w-xl leading-8 text-slate-300">
            MentorLagbe brings students and tutors together through a convenient
            platform designed to make learning connections easier.
          </p>

          <Link
            href="/how-it-works"
            className="mt-8 inline-flex items-center gap-2 rounded-full !bg-[#D9B66F] px-6 py-3 font-bold !text-[#101F32] transition hover:!bg-[#ebcb87]"
          >
            Learn more <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
              >
                <Icon size={27} className="text-[#D9B66F]" />

                <h3 className="mt-5 font-bold">{benefit.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const starterFeatures = [
    "Up to 2 tuition posts (Tutor)",
    "Up to 5 tuition bookmarks (Student)",
    "Direct tuition applications",
    "Basic profile & search filters",
  ];

  const proFeatures = [
    "Unlimited tuition posts & bookmarks",
    "Golden PRO verification badge",
    "Priority listing in search & category filters",
    "Priority applicant notifications & reviews",
  ];

  return (
    <section
      id="pricing"
      className="bg-[#F7F5EF] px-5 py-20 dark:bg-[#0c1420] sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Simple & transparent pricing"
          title="Choose the plan that helps you grow"
          description="Start for free or unlock more opportunities with MentorLagbe PRO."
          centered
        />

        <div className="mx-auto grid max-w-5xl items-stretch gap-7 lg:grid-cols-2">
          {/* Starter Plan */}
          <article className="flex flex-col rounded-[2rem] border border-border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#101F32]/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#101F32] dark:bg-white/10 dark:text-[#E8D4A7]">
                <BookOpen size={14} />
                Starter Plan
              </span>

              <h3 className="mt-5 text-2xl font-extrabold text-foreground">
                Start your journey
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Everything you need to get started on MentorLagbe.
              </p>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tight text-foreground">
                $0
              </span>

              <span className="pb-2 text-sm font-medium text-muted-foreground">
                / free forever
              </span>
            </div>

            <div className="my-8 border-t border-border" />

            <p className="mb-5 text-sm font-bold text-foreground">
              Included features
            </p>

            <ul className="flex-1 space-y-5">
              {starterFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#159A79]/10 text-[#159A79]">
                    <Check size={13} strokeWidth={3} />
                  </span>

                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-9 flex min-h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-[#101F32] !bg-[#101F32] px-6 py-3.5 text-center text-sm font-extrabold !text-white transition hover:!bg-[#1c3552] dark:border-[#D9B66F] dark:!bg-transparent dark:!text-[#E8D4A7] dark:hover:!bg-white/10"
            >
              Get Started Free
              <ArrowRight size={17} />
            </Link>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              No payment required. Start today.
            </p>
          </article>

          {/* MentorLagbe PRO */}
          <article className="relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-[#D9B66F] bg-[#101F32] p-7 text-white shadow-2xl shadow-[#101F32]/15 transition duration-300 hover:-translate-y-1 sm:p-9">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D9B66F]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#159A79]/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#D9B66F] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#101F32]">
                  <Sparkles size={14} />
                  MentorLagbe PRO
                </span>

                <span className="rounded-full border border-[#D9B66F]/50 bg-[#D9B66F]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#E8D4A7]">
                  Recommended
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold">
                Unlock your full potential
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                More visibility, more opportunities and a better experience.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4">
                  <div className="flex items-center gap-2 text-[#E8D4A7]">
                    <GraduationCap size={18} />
                    <span className="text-xs font-bold">Student</span>
                  </div>

                  <p className="mt-3 text-3xl font-extrabold text-white">
                    $10
                  </p>

                  <p className="mt-1 text-xs text-slate-400">per month</p>
                </div>

                <div className="rounded-2xl border border-[#D9B66F]/40 bg-[#D9B66F]/10 p-4">
                  <div className="flex items-center gap-2 text-[#E8D4A7]">
                    <Users size={18} />
                    <span className="text-xs font-bold">Tutor</span>
                  </div>

                  <p className="mt-3 text-3xl font-extrabold text-[#E8D4A7]">
                    $15
                  </p>

                  <p className="mt-1 text-xs text-slate-400">per month</p>
                </div>
              </div>

              <div className="my-8 border-t border-white/15" />

              <p className="mb-5 text-sm font-bold text-white">
                Everything in Starter, plus
              </p>

              <ul className="space-y-5">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9B66F]/15 text-[#D9B66F]">
                      <Check size={13} strokeWidth={3} />
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-9 flex min-h-13 w-full items-center justify-center gap-2 rounded-full !bg-[#D9B66F] px-6 py-3.5 text-center text-sm font-extrabold !text-[#101F32] shadow-lg shadow-black/10 transition hover:!bg-[#ebcb87]"
              >
                Upgrade to Pro
                <ArrowRight size={17} />
              </Link>

              <p className="mt-4 text-center text-xs text-slate-400">
                Choose your account type during registration.
              </p>
            </div>
          </article>
        </div>

        <p className="mt-9 text-center text-sm text-muted-foreground">
          Need help choosing?{" "}
          <Link
            href="/how-it-works"
            className="font-bold text-[#159A79] underline-offset-4 hover:underline"
          >
            Learn how MentorLagbe works
          </Link>
        </p>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-background px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Community stories"
          title="What our community says"
          description="A platform built around better connections between learners and tutors."
          centered
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-2xl border border-border bg-card p-7"
            >
              <div className="flex gap-1 text-[#D9B66F]">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star
                    key={index}
                    size={17}
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="mt-5 leading-7 text-muted-foreground">
                “{testimonial.review}”
              </p>

              <div className="mt-7 border-t border-border pt-5">
                <p className="font-bold text-foreground">
                  {testimonial.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="bg-background px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#101F32] px-7 py-14 text-center text-white sm:px-14 sm:py-16">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#D9B66F]">
          <Award size={29} />
        </span>

        <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Ready to find your perfect learning connection?
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
          Join MentorLagbe and take the next step in your teaching or learning
          journey.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full !bg-[#D9B66F] px-7 py-3.5 font-bold !text-[#101F32] transition hover:!bg-[#ebcb87]"
          >
            Join MentorLagbe <ArrowRight size={18} />
          </Link>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 !bg-transparent px-7 py-3.5 font-bold !text-white transition hover:!bg-white/10"
          >
            Browse Tuitions
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0B1726] px-5 pb-8 pt-16 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F] text-[#101F32]">
              <GraduationCap size={24} />
            </span>

            <span className="text-xl font-extrabold">
              Mentor<span className="text-[#D9B66F]">Lagbe</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
            Connecting students and tutors to make learning opportunities more
            accessible.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-slate-300 transition hover:border-[#D9B66F] hover:text-[#D9B66F]"
            >
              f
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-slate-300 transition hover:border-[#D9B66F] hover:text-[#D9B66F]"
            >
              ◎
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs font-bold text-slate-300 transition hover:border-[#D9B66F] hover:text-[#D9B66F]"
            >
              in
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-slate-300 transition hover:border-[#D9B66F] hover:text-[#D9B66F]"
            >
              𝕏
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold">Explore</h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/" className="transition hover:text-[#D9B66F]">
                Home
              </Link>
            </li>

            <li>
              <Link href="/browse" className="transition hover:text-[#D9B66F]">
                Browse Tuitions
              </Link>
            </li>

            <li>
              <Link href="/pricing" className="transition hover:text-[#D9B66F]">
                Pricing
              </Link>
            </li>

            <li>
              <Link
                href="/how-it-works"
                className="transition hover:text-[#D9B66F]"
              >
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Account</h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/login" className="transition hover:text-[#D9B66F]">
                Sign In
              </Link>
            </li>

            <li>
              <Link
                href="/register"
                className="transition hover:text-[#D9B66F]"
              >
                Create Account
              </Link>
            </li>

            <li>
              <Link
                href="/profile"
                className="transition hover:text-[#D9B66F]"
              >
                My Profile
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/student"
                className="transition hover:text-[#D9B66F]"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Our platform</h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} /> Trusted connections
            </li>

            <li className="flex items-center gap-2">
              <BookMarked size={16} /> Learning opportunities
            </li>

            <li className="flex items-center gap-2">
              <Wallet size={16} /> Flexible plans
            </li>

            <li className="flex items-center gap-2">
              <Heart size={16} /> Built for learners
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-7 text-sm text-slate-500 sm:flex-row">
        <p>© 2026 MentorLagbe. All rights reserved.</p>
        <p>Made with care for learners and tutors.</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <AnimatedStats />
        <CategoriesSection />
        <FeaturedTuitionsSection />
        <HowItWorksSection />
        <BenefitsSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>

      <Footer />
    </>
  );
}
