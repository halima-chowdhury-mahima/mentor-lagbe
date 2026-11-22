
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Monitor,
  Wallet,
  ImageIcon,
  Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";

type Tuition = {
  _id: string;
  title?: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string;
  tutorName?: string;
};

export default function FeaturedTuitionsSection() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchTuitions() {
      try {
        const response = await axiosInstance.get("/api/tuitions", {
          params: {
            page: 1,
            limit: 6,
          },
        });

        if (cancelled) return;

        const data = response.data?.data;

        setTuitions(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error("Featured tuitions fetch error:", error);

        if (!cancelled) {
          setTuitions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTuitions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-background px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-flex items-center rounded-full bg-[#D9B66F]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#A77B2B]">
              Find your perfect match
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Explore Featured{" "}
              <span className="text-[#B58A39]">Tuitions</span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Discover the latest tuition opportunities and find
              the right learning experience for your goals.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#B58A39]/40 px-5 py-3 text-sm font-bold text-[#B58A39] transition hover:bg-[#101F32] hover:text-white"
          >
            Explore All Tuitions
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2
              size={34}
              className="animate-spin text-[#B58A39]"
            />
          </div>
        ) : tuitions.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition) => (
              <article
                key={tuition._id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D9B66F]/60 hover:shadow-xl"
              >
                {/* Large tuition image */}
                <div className="relative h-56 w-full shrink-0 overflow-hidden bg-[#101F32]">
                  {tuition.bannerImage ? (
                    <img
                      src={tuition.bannerImage}
                      alt={tuition.title || tuition.subject}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#101F32] via-[#1c3552] to-[#8d713c]">
                      <div className="flex flex-col items-center gap-3 text-white/80">
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
                          <ImageIcon size={42} strokeWidth={1.4} />
                        </div>
                        <span className="text-sm font-semibold tracking-wide">
                          Tuition Opportunity
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101F32]/70 via-transparent to-transparent" />

                  {/* Mode badge */}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#101F32]/85 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                    {tuition.mode === "Online" ? (
                      <Monitor size={13} />
                    ) : (
                      <MapPin size={13} />
                    )}
                    {tuition.mode || "Offline"}
                  </span>

                  {/* Subject label */}
                  <span className="absolute bottom-4 left-4 rounded-lg bg-[#D9B66F] px-3 py-1.5 text-xs font-extrabold text-[#101F32] shadow-md">
                    {tuition.subject}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-extrabold leading-7 text-foreground transition-colors group-hover:text-[#B58A39]">
                      {tuition.title || `${tuition.subject} Tuition`}
                    </h3>

                    {tuition.tutorName && (
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        Posted by {tuition.tutorName}
                      </p>
                    )}
                  </div>

                  {/* Tuition information */}
                  <div className="flex-1 space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D9B66F]/15 text-[#A77B2B]">
                        <GraduationCap size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Class / Level
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {tuition.classLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D9B66F]/15 text-[#A77B2B]">
                        <MapPin size={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {tuition.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D9B66F]/15 text-[#A77B2B]">
                        <CalendarDays size={17} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Weekly Schedule
                        </p>
                        <p className="font-semibold text-foreground">
                          {tuition.daysPerWeek} Days / Week
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D9B66F]/15 text-[#A77B2B]">
                        <BookOpen size={17} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Subject
                        </p>
                        <p className="font-semibold text-foreground">
                          {tuition.subject}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price and button */}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Monthly Salary
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Wallet
                          size={16}
                          className="shrink-0 text-[#B58A39]"
                        />
                        <p className="truncate text-lg font-extrabold text-[#B58A39]">
                          {formatCurrency(tuition.monthlyFee)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/tuitions/${tuition._id}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#ab9728] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#B58A39] sm:text-sm"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
              <BookOpen size={30} />
            </div>

            <h3 className="text-xl font-bold text-foreground">
              No Featured Tuitions Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              New tuition opportunities will appear here once
              they are approved.
            </p>

            <Link
              href="/tuitions"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B58A39]"
            >
              Browse Tuitions
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
