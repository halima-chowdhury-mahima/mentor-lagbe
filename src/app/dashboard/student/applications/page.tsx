
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  Wallet,
} from "lucide-react";

import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

interface Application {
  _id: string;
  tuitionId?: string;
  tuitionTitle?: string;
  subject?: string;
  classLevel?: string;
  medium?: string;
  location?: string;
  salary?: number;
  schedule?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string;
  createdAt?: string;
  tuition?: {
    _id?: string;
    title?: string;
    subject?: string;
    classLevel?: string;
    medium?: string;
    location?: string;
    salary?: number;
    schedule?: string;
  };
}

const formatCurrency = (amount = 0) =>
  `৳${Number(amount).toLocaleString("en-BD")}`;

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function StudentApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, isStudent } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axiosInstance.get(
        "/api/applications/my-applications"
      );

      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.applications)
          ? data.applications
          : [];

      setApplications(list);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Unable to load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  if (authLoading) return;

  if (!isAuthenticated || !user) {
    router.replace("/login");
    return;
  }

  if (!isStudent) {
    router.replace(
      user.role === "admin" ? "/dashboard/admin" : "/dashboard/tutor"
    );
  }
}, [authLoading, isAuthenticated, user, isStudent, router]);

useEffect(() => {
  if (authLoading || !isAuthenticated || !isStudent) return;

  const timer = window.setTimeout(() => {
    void loadApplications();
  }, 0);

  return () => window.clearTimeout(timer);
}, [authLoading, isAuthenticated, isStudent, loadApplications]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d6b36c] border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your applications...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !isStudent) return null;

  const pending = applications.filter((item) => item.status === "pending").length;
  const accepted = applications.filter((item) => item.status === "accepted").length;
  const rejected = applications.filter((item) => item.status === "rejected").length;

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/student"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#101b35]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <section className="mb-8 rounded-3xl bg-[#101b35] p-6 text-white shadow-lg sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#d6b36c]">
                Student Dashboard
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">
                My Applications
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Track your tuition applications and stay updated on their
                progress.
              </p>
            </div>

            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d6b36c] px-5 py-3 text-sm font-bold text-[#101b35] transition hover:bg-[#f0d9a1]"
            >
              Explore Tuitions <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Applications", value: applications.length, color: "text-[#101b35]" },
            { label: "Pending", value: pending, color: "text-amber-600" },
            { label: "Accepted", value: accepted, color: "text-emerald-600" },
            { label: "Rejected", value: rejected, color: "text-rose-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#101b35]">
              Application History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All your submitted tuition applications
            </p>
          </div>

          <button
            onClick={() => void loadApplications()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#d6b36c] hover:text-[#101b35]"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              onClick={() => void loadApplications()}
              className="mt-4 rounded-lg bg-[#101b35] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f0e5] text-[#b18b42]">
              <BookOpen size={30} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#101b35]">
              No Applications Yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not applied for any tuition yet. Explore available
              opportunities and submit your first application.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#101b35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b2b4d]"
            >
              Browse Tuitions <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const tuitionId =
                application.tuition?._id || application.tuitionId;

              const title =
                application.tuitionTitle ||
                application.tuition?.title ||
                "Tuition Application";

              const subject =
                application.subject ||
                application.tuition?.subject ||
                "Not specified";

              const salary =
                application.salary ?? application.tuition?.salary ?? 0;

              const location =
                application.location ||
                application.tuition?.location ||
                "Not specified";

              const schedule =
                application.schedule ||
                application.tuition?.schedule ||
                "Not specified";

              return (
                <article
                  key={application._id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#101b35]">
                          {title}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[application.status] ||
                            statusStyles.pending
                          }`}
                        >
                          {application.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#b18b42]">
                        {subject}
                      </p>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      Applied {formatDate(application.createdAt)}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Wallet size={16} className="text-[#b18b42]" />
                      {formatCurrency(salary)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-[#b18b42]" />
                      {location}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={16} className="text-[#b18b42]" />
                      {schedule}
                    </p>
                  </div>

                  {application.message && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Your Message
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {tuitionId && (
                    <div className="mt-5 flex justify-end">
                      <Link
                        href={`/tuitions/${tuitionId}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#d6b36c] px-4 py-2.5 text-sm font-bold text-[#101b35] transition hover:bg-[#f5f0e5]"
                      >
                        View Tuition <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
