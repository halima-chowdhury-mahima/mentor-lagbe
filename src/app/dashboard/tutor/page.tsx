
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Wallet,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  GraduationCap,
  CalendarDays,
  Clock3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LayoutDashboard,
  ChevronRight,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

const POST_TUITION_URL = "/dashboard/tutor/post-tuition";

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  medium?: string;
  location?: string;
  salary?: number;
  schedule?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicants?: number;
};

type Applicant = {
  _id?: string;
  id?: string;
};

function getId(item: Tuition) {
  return item._id || item.id || "";
}

function getArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.applicants)) return obj.applicants as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }

  return [];
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("Server connection failed. Please try again.");
  }

  const text = await response.text();

  let result: Record<string, unknown> = {};

  if (text) {
    try {
      result = JSON.parse(text) as Record<string, unknown>;
    } catch {
      result = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : typeof result.error === "string"
          ? result.error
          : "Something went wrong. Please try again."
    );
  }

  return result;
}

function getStatus(status?: string) {
  const value = (status || "active").toLowerCase();

  if (value === "active" || value === "published") {
    return {
      label: "Active",
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    };
  }

  if (value === "pending") {
    return {
      label: "Pending",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    };
  }

  if (value === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-500/10 text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    };
  }

  if (value === "closed" || value === "inactive") {
    return {
      label: "Closed",
      className: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      dot: "bg-slate-500",
    };
  }

  return {
    label: status || "Active",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  };
}

function formatDate(date?: string) {
  if (!date) return "Recently posted";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Recently posted";

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TutorDashboardPage() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isTutor,
    isAdmin,
  } = useAuth();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [applicantCounts, setApplicantCounts] = useState<
    Record<string, number>
  >({});
  const [search, setSearch] = useState("");

  const loadDashboard = useCallback(async (showRefresh = false) => {
    await Promise.resolve();

    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const result = await apiFetch("/api/tutor/my-tuitions");

      const items = getArray<Tuition>(result.data ?? result);

      setTuitions(items);

      const counts: Record<string, number> = {};

      await Promise.all(
        items.map(async (item) => {
          const id = getId(item);
          if (!id) return;

          try {
            const applicantResult = await apiFetch(
              `/api/tutor/applicants/${encodeURIComponent(id)}`
            );

            const applicants = getArray<Applicant>(
              applicantResult.data ?? applicantResult
            );

            counts[id] = applicants.length;
          } catch {
            counts[id] = item.applicants ?? 0;
          }
        })
      );

      setApplicantCounts(counts);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || (!isTutor && !isAdmin)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authLoading, isAuthenticated, isTutor, isAdmin, loadDashboard]);

  const totalApplicants = useMemo(
    () =>
      Object.values(applicantCounts).reduce(
        (total, count) => total + count,
        0
      ),
    [applicantCounts]
  );

  const activeTuitions = useMemo(
    () =>
      tuitions.filter((item) => {
        const status = (item.status || "active").toLowerCase();
        return status === "active" || status === "published";
      }),
    [tuitions]
  );

  const monthlyBudget = useMemo(
    () =>
      activeTuitions.reduce(
        (total, item) => total + Number(item.salary || 0),
        0
      ),
    [activeTuitions]
  );

  const filteredTuitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tuitions;

    return tuitions.filter((item) =>
      [
        item.title,
        item.subject,
        item.classLevel,
        item.location,
        item.medium,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [tuitions, search]);

  async function handleDelete(id: string) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition post? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await apiFetch(
        `/api/tutor/my-tuitions/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      setTuitions((previous) =>
        previous.filter((item) => getId(item) !== id)
      );

      setApplicantCounts((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      toast.success("Tuition post deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete tuition."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (
    authLoading ||
    (isAuthenticated && (isTutor || isAdmin) && loading)
  ) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9B66F]/15">
            <Loader2 className="animate-spin text-[#B58A39]" size={28} />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
          <LayoutDashboard size={30} />
        </div>

        <h1 className="text-2xl font-extrabold text-foreground">
          Login Required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Please login to access your tutor dashboard.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B3553] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] focus-visible:ring-offset-2 dark:bg-[#D9B66F] dark:text-[#101F32] dark:hover:bg-[#E9CB8B]"
        >
          Login to Continue <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    );
  }

  if (!isTutor && !isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <AlertCircle size={30} />
        </div>

        <h1 className="text-2xl font-extrabold text-foreground">
          Tutor Access Only
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard is available for tutor accounts.
        </p>

        <Link
          href="/browse"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B3553] dark:bg-[#D9B66F] dark:text-[#101F32] dark:hover:bg-[#E9CB8B]"
        >
          Browse Tuitions <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Posted Tuitions",
      value: tuitions.length.toString().padStart(2, "0"),
      description: "Your total tuition posts",
      icon: BookOpen,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Applicants",
      value: totalApplicants.toString().padStart(2, "0"),
      description: "Students interested in your posts",
      icon: Users,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Active Posts",
      value: activeTuitions.length.toString().padStart(2, "0"),
      description: "Currently active tuition posts",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Monthly Budget",
      value: formatCurrency(monthlyBudget),
      description: "Combined salary of active posts",
      icon: Wallet,
      iconBg: "bg-amber-500/10",
      iconColor: "text-[#B58A39] dark:text-[#D9B66F]",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#101F32] px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-[#D9B66F]/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D9B66F]/30 bg-[#D9B66F]/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-[#E9CB8B]">
              <GraduationCap size={15} />
              TUTOR WORKSPACE
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Manage your tuition posts, track student applications and keep
              your tutoring activities organized from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9CB8B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101F32]"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href={POST_TUITION_URL}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D9B66F] px-5 py-3 text-sm font-extrabold text-[#101F32] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#E9CB8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101F32]"
            >
              <Plus size={18} />
              Post New Tuition
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-[#B58A39]">
          Home
        </Link>
        <ChevronRight size={15} />
        <span className="font-semibold text-foreground">Tutor Dashboard</span>
      </div>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#B58A39]">
              OVERVIEW
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
              Your Performance
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            Updated from your tuition posts
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {stat.label}
                  </p>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                  >
                    <Icon size={21} />
                  </span>
                </div>

                <p className="mt-5 break-words text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#B58A39]">
                CONTENT MANAGEMENT
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
                My Tuition Posts
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                View and manage all your published tuition opportunities.
              </p>
            </div>

            <Link
              href={POST_TUITION_URL}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#9f9f24] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#91b62a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A39] focus-visible:ring-offset-2 dark:bg-[#D9B66F] dark:text-[#101F32] dark:hover:bg-[#E9CB8B]"
            >
              <Plus size={17} />
              Add Tuition
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by subject, class or location..."
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-[#B58A39]/60 focus:border-[#B58A39] focus:ring-2 focus:ring-[#D9B66F]/20"
              />
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {filteredTuitions.length}
              </span>{" "}
              of {tuitions.length} tuition posts
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {filteredTuitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/50 px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
                <BookOpen size={30} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-foreground">
                {search ? "No matching tuition posts" : "No tuition posts yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {search
                  ? "Try another search term to find your tuition post."
                  : "You haven't posted any tuition opportunities yet. Create your first post and start connecting with students."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-[#B58A39] hover:text-[#B58A39]"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href={POST_TUITION_URL}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1B3553] dark:bg-[#D9B66F] dark:text-[#101F32] dark:hover:bg-[#E9CB8B]"
                >
                  <Plus size={17} />
                  Post Your First Tuition
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTuitions.map((item) => {
                const id = getId(item);
                const status = getStatus(item.status);
                const applicantCount =
                  applicantCounts[id] ?? item.applicants ?? 0;

                return (
                  <article
                    key={id || item.title}
                    className="rounded-2xl border border-border bg-background/60 p-5 transition hover:border-[#D9B66F]/70 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#D9B66F]/15 px-3 py-1 text-xs font-bold text-[#A77B2B] dark:text-[#E9CB8B]">
                            {item.subject || "General"}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />
                            {status.label}
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-lg font-extrabold text-foreground sm:text-xl">
                          {item.title ||
                            `${item.subject || "Tuition"} Tutor Needed`}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
                          {item.classLevel && (
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap size={15} />
                              {item.classLevel}
                            </span>
                          )}

                          {item.medium && (
                            <span className="inline-flex items-center gap-1.5">
                              <BookOpen size={14} />
                              {item.medium}
                            </span>
                          )}

                          {item.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {item.location}
                            </span>
                          )}

                          {item.schedule && (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {item.schedule}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-[#D9B66F]/10 px-5 py-3 lg:items-end">
                        <span className="text-xs font-medium text-muted-foreground">
                          Monthly Salary
                        </span>

                        <span className="text-xl font-extrabold text-[#A77B2B] dark:text-[#E9CB8B]">
                          {formatCurrency(Number(item.salary || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          <Users size={17} />
                        </span>

                        <span className="font-bold text-foreground">
                          {applicantCount}
                        </span>

                        <span className="text-muted-foreground">
                          {applicantCount === 1 ? "Applicant" : "Applicants"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/tutor/applicants/${encodeURIComponent(id)}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground transition hover:border-[#B58A39] hover:bg-[#D9B66F]/10 hover:text-[#A77B2B] dark:hover:text-[#E9CB8B]"
                        >
                          <Eye size={15} />
                          Applicants
                        </Link>

                        <Link
                          href={`/dashboard/tutor/edit-tuition/${encodeURIComponent(id)}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-500/20 dark:text-blue-300"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => void handleDelete(id)}
                          disabled={!id || deletingId === id}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
                        >
                          {deletingId === id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/tutor/my-tuitions"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-[#D9B66F]/70 hover:shadow-md sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D9B66F]/15 text-[#B58A39]">
              <BookOpen size={22} />
            </div>

            <div>
              <h3 className="font-extrabold text-foreground">
                All My Tuitions
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                View and manage your tuition posts
              </p>
            </div>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-[#B58A39]"
          />
        </Link>

        <Link
          href={POST_TUITION_URL}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-[#D9B66F]/70 hover:shadow-md sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Plus size={22} />
            </div>

            <div>
              <h3 className="font-extrabold text-foreground">
                Create New Tuition
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Publish a new tuition opportunity
              </p>
            </div>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-[#B58A39]"
          />
        </Link>
      </section>

      <section className="relative isolate overflow-hidden rounded-3xl border border-[#D9B66F]/30 bg-gradient-to-br from-[#101F32] to-[#1D3552] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[30px] border-white/5" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.16em] text-[#E9CB8B]">
              GROW WITH MENTORLAGBE
            </p>

            <h2 className="mt-2 text-2xl font-extrabold">
              Want more visibility?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Explore available plans and discover more ways to grow your
              tutoring opportunities.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D9B66F] px-5 py-3 text-sm font-extrabold text-[#101F32] transition hover:-translate-y-0.5 hover:bg-[#E9CB8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101F32]"
          >
            Explore Plans
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
