
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkX,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Wallet,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

interface Application {
  _id: string;
  tuitionId: string;
  tuitionTitle?: string;
  subject?: string;
  classLevel?: string;
  medium?: string;
  location?: string;
  salary?: number;
  schedule?: string;
  status: string;
  createdAt?: string | Date;
}

interface SavedTuition {
  _id: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  medium?: string;
  location?: string;
  salary?: number;
  schedule?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "rejected":
      return "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    case "pending":
      return "border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400";

    default:
      return "border-border bg-muted text-foreground";
  }
};

const formatDate = (date?: string | Date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl !bg-[#101F32] px-5 py-3 text-sm font-bold !text-white shadow-sm transition hover:!bg-[#1c3552] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#101F32]/20 !bg-white px-5 py-3 text-sm font-bold !text-[#101F32] shadow-sm transition hover:border-[#B58A39] hover:!bg-[#F8F5ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:border-white/20 dark:!bg-[#17263A] dark:!text-white dark:hover:!bg-[#223650]";

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [savedTuitions, setSavedTuitions] = useState<SavedTuition[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setPageLoading(true);
    }

    setError("");

    try {
      const [applicationsResult, savedResult] = await Promise.allSettled([
        axiosInstance.get<ApiResponse<Application[]>>(
          "/api/applications/my-applications"
        ),
        axiosInstance.get<ApiResponse<SavedTuition[]>>("/api/bookmarks"),
      ]);

      let hasError = false;

      if (applicationsResult.status === "fulfilled") {
        const response = applicationsResult.value.data;

        if (response?.success && Array.isArray(response.data)) {
          setApplications(response.data);
        } else {
          setApplications([]);
          hasError = true;
        }
      } else {
        setApplications([]);
        hasError = true;
      }

      if (savedResult.status === "fulfilled") {
        const response = savedResult.value.data;

        if (response?.success && Array.isArray(response.data)) {
          setSavedTuitions(response.data);
        } else {
          setSavedTuitions([]);
          hasError = true;
        }
      } else {
        setSavedTuitions([]);
        hasError = true;
      }

      if (hasError) {
        setError(
          "Some dashboard information could not be loaded. Please try again."
        );

        if (isRefresh) {
          toast.error("Some information could not be refreshed.");
        }
      } else if (isRefresh) {
        toast.success("Dashboard refreshed successfully.");
      }
    } catch {
      setError("Unable to load your dashboard. Please try again.");

      if (isRefresh) {
        toast.error("Dashboard refresh failed.");
      }
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || user?.role !== "student") return;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadDashboard();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role, loadDashboard]);

  const handleRemoveSaved = async (tuitionId: string) => {
    if (!tuitionId || removingId) return;

    setRemovingId(tuitionId);

    try {
      await axiosInstance.delete(`/api/bookmarks/${tuitionId}`);

      setSavedTuitions((previous) =>
        previous.filter((tuition) => tuition._id !== tuitionId)
      );

      toast.success("Tuition removed from saved list.");
    } catch {
      toast.error("Could not remove this saved tuition.");
    } finally {
      setRemovingId(null);
    }
  };

  const pendingCount = applications.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (item) => item.status?.toLowerCase() === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status?.toLowerCase() === "rejected"
  ).length;

  const recentApplications = applications.slice(0, 4);
  const recentSaved = savedTuitions.slice(0, 3);

  if (authLoading || (user?.role === "student" && pageLoading)) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <div className="h-48 rounded-3xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="h-80 rounded-3xl bg-muted" />
        <div className="h-64 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
          <GraduationCap size={30} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold">
          Sign in required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in to access your student dashboard.
        </p>

        <Link href="/login" className={`${primaryButton} mt-6`}>
          Sign In
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
          <GraduationCap size={30} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold">
          Student access only
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard is available only to student accounts.
        </p>

        <Link
          href={
            user.role === "admin"
              ? "/dashboard/admin"
              : "/dashboard/tutor"
          }
          className={`${primaryButton} mt-6`}
        >
          Go to your dashboard
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: FileText,
      color: "text-[#A77925] dark:text-[#D9B66F]",
      background: "bg-[#D9B66F]/15",
      description: "All your applications",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock3,
      color: "text-amber-700 dark:text-amber-400",
      background: "bg-amber-500/10",
      description: "Waiting for a response",
    },
    {
      label: "Accepted",
      value: acceptedCount,
      icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-400",
      background: "bg-emerald-500/10",
      description: "Successfully accepted",
    },
    {
      label: "Saved Tuitions",
      value: savedTuitions.length,
      icon: Bookmark,
      color: "text-blue-700 dark:text-blue-400",
      background: "bg-blue-500/10",
      description: "Your bookmarked listings",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome section */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#0B1728] p-6 text-white shadow-xl shadow-[#101F32]/10 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-[#D9B66F]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
  <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B66F]/30 bg-[#D9B66F]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E5C783]">
    <Sparkles size={13} />
    Student Workspace
  </div>

  {user.plan === "pro" && (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5C783]/50 bg-gradient-to-r from-[#D9B66F] to-[#F0D9A1] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#101F32] shadow-md shadow-[#D9B66F]/20">
      <Crown size={14} fill="currentColor" />
      PRO MEMBER
    </div>
  )}
</div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <span className="text-[#E5C783]">
                {user.name?.split(" ")[0] || "Student"}
              </span>
              !
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Your learning journey starts here. Explore tuition
              opportunities, manage your applications and find the right
              tutor for your goals.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-xl !bg-[#D9B66F] px-5 py-3 text-sm font-extrabold !text-[#101F32] shadow-sm transition hover:!bg-[#E8CA8C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Search size={17} />
                Explore Tuitions
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 !bg-white/10 px-5 py-3 text-sm font-bold !text-white transition hover:border-white/50 hover:!bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B66F]"
              >
                View Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 lg:flex">
            <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] border border-[#D9B66F]/20 bg-white/[0.04]">
              <GraduationCap
                size={76}
                strokeWidth={1.2}
                className="text-[#D9B66F]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A77925] dark:text-[#D9B66F]">
              Your Activity
            </p>

            <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">
              Dashboard Overview
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            className={`${secondaryButton} px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D9B66F]/50 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {stat.label}
                  </span>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                  >
                    <Icon size={21} />
                  </span>
                </div>

                <p className="mt-5 text-3xl font-extrabold tracking-tight">
                  {stat.value.toString().padStart(2, "0")}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Application status summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/25 bg-amber-50/70 p-5 dark:bg-amber-500/[0.04]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Clock3 size={21} />
          </span>

          <div>
            <p className="text-2xl font-extrabold">{pendingCount}</p>
            <p className="text-xs font-medium text-muted-foreground">
              Awaiting response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-5 dark:bg-emerald-500/[0.04]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={21} />
          </span>

          <div>
            <p className="text-2xl font-extrabold">{acceptedCount}</p>
            <p className="text-xs font-medium text-muted-foreground">
              Accepted applications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-red-500/25 bg-red-50/70 p-5 dark:bg-red-500/[0.04]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-700 dark:text-red-400">
            <XCircle size={21} />
          </span>

          <div>
            <p className="text-2xl font-extrabold">{rejectedCount}</p>
            <p className="text-xs font-medium text-muted-foreground">
              Rejected applications
            </p>
          </div>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-500/25 bg-red-50 p-5 dark:bg-red-500/[0.06] sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            className="w-fit rounded-lg border border-red-500/30 !bg-white px-4 py-2 text-xs font-bold !text-red-700 transition hover:!bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:!bg-red-500/10 dark:!text-red-400 dark:hover:!bg-red-500/20"
          >
            {refreshing ? "Trying again..." : "Try Again"}
          </button>
        </div>
      )}

      {/* Recent applications */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A77925] dark:text-[#D9B66F]">
              Application Tracking
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Track the latest tuition requests you have submitted.
            </p>
          </div>

          <Link
            href="/dashboard/student/applications"
            className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold !text-[#8C6827] transition hover:!bg-[#D9B66F]/10 hover:!text-[#6F4E19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9B66F]/10 text-[#A77925] dark:text-[#D9B66F]">
              <FileText size={26} />
            </span>

            <h3 className="mt-4 font-extrabold">
              No applications yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Once you apply for a tuition, your application details and
              status will appear here.
            </p>

            <Link href="/browse" className={`${primaryButton} mt-5`}>
              Find Your First Tuition
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentApplications.map((application) => (
              <div
                key={application._id}
                className="flex flex-col justify-between gap-4 p-5 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:px-7"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">
                      {application.tuitionTitle ||
                        application.subject ||
                        "Tuition Application"}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold capitalize ${getStatusStyle(
                        application.status || "pending"
                      )}`}
                    >
                      {application.status || "Pending"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.subject || "Subject not specified"}
                    {application.classLevel
                      ? ` · ${application.classLevel}`
                      : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {application.location || "Location unavailable"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-sm font-extrabold text-[#8C6827] dark:text-[#D9B66F]">
                    {formatCurrency(Number(application.salary) || 0)}
                    <span className="ml-1 text-[10px] font-medium text-muted-foreground">
                      / month
                    </span>
                  </p>

                  <Link
                    href="/dashboard/student/applications"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold !text-[#475569] transition hover:!bg-[#D9B66F]/10 hover:!text-[#8C6827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-slate-300 dark:hover:!text-[#E5C783]"
                  >
                    Details
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved tuitions */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D9B66F]/15 text-[#A77925] dark:text-[#D9B66F]">
              <Bookmark size={21} />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A77925] dark:text-[#D9B66F]">
                Your Collection
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Saved Tuitions
              </h2>
            </div>
          </div>

          <Link
            href="/dashboard/student/saved"
            className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold !text-[#8C6827] transition hover:!bg-[#D9B66F]/10 hover:!text-[#6F4E19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
          >
            View All Saved
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentSaved.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9B66F]/10 text-[#A77925] dark:text-[#D9B66F]">
              <Bookmark size={26} />
            </span>

            <h3 className="mt-4 font-extrabold">
              No saved tuitions
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Save interesting tuition opportunities from the Browse page
              to find them here later.
            </p>

            <Link href="/browse" className={`${primaryButton} mt-5`}>
              <Search size={16} />
              Explore Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
            {recentSaved.map((tuition) => (
              <article
                key={tuition._id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-[#D9B66F]/50 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/15 text-[#A77925] dark:text-[#D9B66F]">
                    <BookOpen size={19} />
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleRemoveSaved(tuition._id)}
                    disabled={
                      removingId === tuition._id ||
                      removingId !== null
                    }
                    title="Remove saved tuition"
                    aria-label={`Remove ${tuition.title || tuition.subject || "tuition"} from saved list`}
                    className="rounded-lg border border-transparent p-2 !text-[#475569] transition hover:border-red-500/20 hover:!bg-red-50 hover:!text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:!text-slate-300 dark:hover:!bg-red-500/10 dark:hover:!text-red-400"
                  >
                    {removingId === tuition._id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <BookmarkX size={16} />
                    )}
                  </button>
                </div>

                <h3 className="mt-4 line-clamp-2 font-extrabold">
                  {tuition.title ||
                    tuition.subject ||
                    "Tuition Opportunity"}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {tuition.subject || "Subject not specified"}
                  {tuition.classLevel
                    ? ` · ${tuition.classLevel}`
                    : ""}
                </p>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin size={13} />
                    {tuition.location || "Location unavailable"}
                  </p>

                  <p className="flex items-center gap-2">
                    <Wallet size={13} />
                    {formatCurrency(Number(tuition.salary) || 0)} / month
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <Link
                    href={`/tuitions/${tuition._id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-extrabold !text-[#8C6827] transition hover:!bg-[#D9B66F]/10 hover:!text-[#6F4E19] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
                  >
                    View Tuition
                    <ArrowUpRight size={14} />
                  </Link>

                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Saved
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Boost Your Success Rate */}
      <section className="overflow-hidden rounded-3xl border border-[#D9B66F]/35 !bg-white p-6 shadow-sm dark:border-[#D9B66F]/20 dark:!bg-[#111E30] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9B66F]/40 bg-[#D9B66F]/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] !text-[#76551D] dark:!text-[#F0D9A1]">
              <Target size={14} />
              Student success tips
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight !text-[#101F32] dark:!text-white">
              Boost Your Success Rate
            </h2>

            <p className="mt-2 text-sm leading-6 !text-slate-600 dark:!text-slate-300">
              A few simple steps can help you make a stronger impression and
              find the right tuition opportunity.
            </p>
          </div>

          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D9B66F]/15 !text-[#8C6827] dark:!text-[#E5C783] sm:flex">
            <Sparkles size={26} />
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 !bg-slate-50 p-5 dark:border-white/10 dark:!bg-white/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/20 !text-[#76551D] dark:!text-[#F0D9A1]">
              <GraduationCap size={20} />
            </span>

            <h3 className="mt-4 font-extrabold !text-[#101F32] dark:!text-white">
              Complete Your Profile
            </h3>

            <p className="mt-2 text-sm leading-6 !text-slate-600 dark:!text-slate-300">
              Add your education, preferred subjects, location and contact
              details so tutors can understand your requirements.
            </p>

            <Link
              href="/profile"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-extrabold !text-[#76551D] transition hover:!text-[#A77925] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
            >
              Update Profile
              <ArrowUpRight size={15} />
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 !bg-slate-50 p-5 dark:border-white/10 dark:!bg-white/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/20 !text-[#76551D] dark:!text-[#F0D9A1]">
              <Search size={20} />
            </span>

            <h3 className="mt-4 font-extrabold !text-[#101F32] dark:!text-white">
              Apply for Relevant Tuitions
            </h3>

            <p className="mt-2 text-sm leading-6 !text-slate-600 dark:!text-slate-300">
              Choose opportunities that match your preferred class, subject,
              schedule and budget. Read each listing before applying.
            </p>

            <Link
              href="/browse"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-extrabold !text-[#76551D] transition hover:!text-[#A77925] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
            >
              Explore Tuitions
              <ArrowUpRight size={15} />
            </Link>
          </article>

          <article className="rounded-2xl border border-slate-200 !bg-slate-50 p-5 dark:border-white/10 dark:!bg-white/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/20 !text-[#76551D] dark:!text-[#F0D9A1]">
              <CheckCircle2 size={20} />
            </span>

            <h3 className="mt-4 font-extrabold !text-[#101F32] dark:!text-white">
              Track Your Applications
            </h3>

            <p className="mt-2 text-sm leading-6 !text-slate-600 dark:!text-slate-300">
              Check your application status regularly and keep your information
              up to date when your preferences change.
            </p>

            <Link
              href="/dashboard/student/applications"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-extrabold !text-[#76551D] transition hover:!text-[#A77925] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] dark:!text-[#E5C783] dark:hover:!text-[#F0D9A1]"
            >
              My Applications
              <ArrowUpRight size={15} />
            </Link>
          </article>
        </div>
      </section>

      {/* Bottom call to action */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-[#D9B66F]/30 bg-[#D9B66F]/10 p-6 sm:flex-row sm:items-center sm:p-8 dark:bg-[#D9B66F]/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-[#8C6827] dark:text-[#D9B66F]">
            <Sparkles size={17} />

            <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
              Keep Growing
            </span>
          </div>

          <h2 className="mt-2 text-xl font-extrabold">
            Ready for your next learning opportunity?
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Discover suitable tutors and tuition opportunities for your needs.
          </p>
        </div>

        <Link
          href="/browse"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl !bg-[#101F32] px-5 py-3.5 text-sm font-bold !text-white shadow-sm transition hover:!bg-[#1c3552] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          Browse Tuitions
          <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
