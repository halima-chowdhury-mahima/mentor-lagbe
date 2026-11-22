
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Wallet,
  Loader2,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  classLevel?: string;
  subjects?: string[] | string;
  location?: string;
  area?: string;
  salary?: number | string;
  status?: string;
  medium?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
  tuitions?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTuition(value: unknown): value is Tuition {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string")
  );
}

function getTuitions(result: unknown): Tuition[] {
  if (Array.isArray(result)) {
    return result.filter(isTuition);
  }

  if (!isRecord(result)) return [];

  if (Array.isArray(result.tuitions)) {
    return result.tuitions.filter(isTuition);
  }

  if (Array.isArray(result.data)) {
    return result.data.filter(isTuition);
  }

  if (isRecord(result.data)) {
    if (Array.isArray(result.data.tuitions)) {
      return result.data.tuitions.filter(isTuition);
    }

    if (Array.isArray(result.data.data)) {
      return result.data.data.filter(isTuition);
    }
  }

  return [];
}

async function readResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getErrorMessage(result: unknown, fallback: string): string {
  if (!isRecord(result)) return fallback;

  if (typeof result.message === "string") return result.message;
  if (typeof result.error === "string") return result.error;

  return fallback;
}

function getTuitionId(tuition: Tuition): string {
  return tuition._id || tuition.id || "";
}

function getSubjects(subjects: Tuition["subjects"]): string {
  if (Array.isArray(subjects)) return subjects.join(", ");
  return subjects || "Not specified";
}

export default function TutorDashboardPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTuitions = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again.");
        setTuitions([]);
        return;
      }

      const response = await fetch(`${API_URL}/api/tutor/my-tuitions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Failed to load your tuitions.")
        );
      }

      if (isRecord(result) && result.success === false) {
        throw new Error(
          getErrorMessage(result, "Failed to load your tuitions.")
        );
      }

      setTuitions(getTuitions(result));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTuitions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTuitions]);

  const handleDelete = async (tuitionId: string) => {
    if (!tuitionId) {
      toast.error("Tuition ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      setDeletingId(tuitionId);

      const response = await fetch(
        `${API_URL}/api/tutor/my-tuitions/${encodeURIComponent(tuitionId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await readResponse(response);

      if (!response.ok || (isRecord(result) && result.success === false)) {
        throw new Error(
          getErrorMessage(result, "Could not delete this tuition.")
        );
      }

      setTuitions((previous) =>
        previous.filter((tuition) => getTuitionId(tuition) !== tuitionId)
      );

      toast.success("Tuition deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
              <LayoutDashboard size={17} />
              MENTORLAGBE TUTOR PANEL
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Tutor Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your tuition posts and student applications.
            </p>
          </div>

          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-400"
          >
            <Plus size={18} />
            Post New Tuition
          </Link>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Tuition Posts
                </p>
                <p className="mt-2 text-3xl font-extrabold">
                  {tuitions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
                <BookOpen size={26} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Dashboard
                </p>
                <p className="mt-2 text-lg font-extrabold">
                  Manage Applications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Review applicants from each tuition post.
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
                <Users size={26} />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">My Tuition Posts</h2>
            <p className="mt-1 text-sm text-slate-500">
              View, edit, delete and manage your tuition listings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadTuitions()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/dashboard/tutor/my-tuitions"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <BookOpen size={16} />
              All My Tuitions
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Loader2 size={34} className="mb-3 animate-spin text-amber-600" />
            <p className="font-semibold text-slate-600">
              Loading your tuition posts...
            </p>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <BookOpen size={30} />
            </div>

            <h3 className="text-xl font-extrabold">No Tuition Posts Yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not posted any tuition opportunities. Create your first
              tuition post to connect with students.
            </p>

            <Link
              href="/dashboard/tutor/post-tuition"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
            >
              <Plus size={18} />
              Post Your First Tuition
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {tuitions.map((tuition) => {
              const tuitionId = getTuitionId(tuition);
              const isDeleting = deletingId === tuitionId;

              return (
                <article
                  key={tuitionId}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                        {tuition.status || "Active"}
                      </span>
                      <h3 className="mt-3 text-xl font-extrabold">
                        {tuition.title || "Untitled Tuition"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {tuition.classLevel || "Class not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                      <BookOpen size={21} />
                    </div>
                  </div>

                  <div className="grid gap-3 border-y border-slate-100 py-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <BookOpen size={17} className="mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Subjects:</strong>{" "}
                        {getSubjects(tuition.subjects)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={17} className="mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Location:</strong>{" "}
                        {[tuition.area, tuition.location]
                          .filter(Boolean)
                          .join(", ") || "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Wallet size={17} className="mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-800">Salary:</strong>{" "}
                        {tuition.salary
                          ? `৳${tuition.salary}`
                          : "Negotiable"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/tutor/applicants/${encodeURIComponent(tuitionId)}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      <Users size={16} />
                      Applicants
                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      href={`/dashboard/tutor/edit-tuition/${encodeURIComponent(tuitionId)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleDelete(tuitionId)}
                      disabled={isDeleting || !tuitionId}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-6">
          <Link
            href="/"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-amber-700"
          >
            Home
          </Link>
          <Link
            href="/browse"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-amber-700"
          >
            Browse Tuitions
          </Link>
          <Link
            href="/dashboard/tutor/post-tuition"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-amber-700"
          >
            Post Tuition
          </Link>
        </div>
      </div>
    </main>
  );
}
