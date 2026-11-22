
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Wallet,
  Users,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  AlertCircle,
  Search,
  Eye,
  CheckCircle2,
  Clock3,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

type ApprovalStatus = "pending" | "approved" | "rejected" | "unknown";

type Tuition = {
  _id: string;
  id?: string;
  title: string;
  subject?: string;
  subjects?: string[];
  classLevel?: string;
  mode?: "Online" | "Offline" | string;
  medium?: string;
  location?: string;
  area?: string;
  monthlyFee?: number;
  salary?: number;
  approvalStatus?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isTuition(value: unknown): value is Tuition {
  if (!isRecord(value)) return false;

  return (
    (typeof value._id === "string" ||
      typeof value.id === "string") &&
    typeof value.title === "string"
  );
}

function getItems(result: unknown): Tuition[] {
  if (Array.isArray(result)) {
    return result.filter(isTuition);
  }

  if (!isRecord(result)) return [];

  if (Array.isArray(result.data)) {
    return result.data.filter(isTuition);
  }

  if (Array.isArray(result.tuitions)) {
    return result.tuitions.filter(isTuition);
  }

  if (
    isRecord(result.data) &&
    Array.isArray(result.data.tuitions)
  ) {
    return result.data.tuitions.filter(isTuition);
  }

  return [];
}

function getApprovalStatus(tuition: Tuition): ApprovalStatus {
  const value = tuition.approvalStatus?.toLowerCase();

  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected"
  ) {
    return value;
  }

  const legacyStatus = tuition.status?.toLowerCase();

  if (
    legacyStatus === "pending" ||
    legacyStatus === "approved" ||
    legacyStatus === "rejected"
  ) {
    return legacyStatus;
  }

  return "unknown";
}

function getStatusStyle(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";

    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300";

    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function MyTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH MY TUITIONS
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const loadTuitions = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(
          `${API_URL}/api/tutor/my-tuitions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const result: unknown = await response.json();

        if (!response.ok) {
          const message =
            isRecord(result) &&
            typeof result.message === "string"
              ? result.message
              : "Failed to load tuition posts.";

          throw new Error(message);
        }

        const data = getItems(result);

        if (isMounted) {
          setTuitions(data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadTuitions();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // DELETE TUITION
  // ==========================================
  const deleteTuition = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `${API_URL}/api/tutor/my-tuitions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result: unknown = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        (isRecord(result) && result.success === false)
      ) {
        const message =
          isRecord(result) &&
          typeof result.message === "string"
            ? result.message
            : "Could not delete tuition.";

        throw new Error(message);
      }

      setTuitions((previous) =>
        previous.filter(
          (tuition) => (tuition._id || tuition.id) !== id
        )
      );

      toast.success("Tuition deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Delete failed."
      );
    } finally {
      setDeletingId("");
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  const filteredTuitions = tuitions.filter((tuition) => {
    const query = search.toLowerCase().trim();

    const searchableText = [
      tuition.title,
      tuition.subject,
      ...(tuition.subjects || []),
      tuition.classLevel,
      tuition.location,
      tuition.area,
    ]
      .filter(
        (value): value is string =>
          typeof value === "string"
      )
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  // ==========================================
  // STATISTICS
  // ==========================================
  const pendingCount = tuitions.filter(
    (tuition) =>
      getApprovalStatus(tuition) === "pending"
  ).length;

  const approvedCount = tuitions.filter(
    (tuition) =>
      getApprovalStatus(tuition) === "approved"
  ).length;

  const rejectedCount = tuitions.filter(
    (tuition) =>
      getApprovalStatus(tuition) === "rejected"
  ).length;

  const activeCount = tuitions.filter(
    (tuition) => tuition.isActive !== false
  ).length;

  // ==========================================
  // UI
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/dashboard/tutor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-600 dark:text-slate-300"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-[#101a31] via-[#172747] to-[#243d62] p-6 text-white sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              MentorLagbe · Tutor Panel
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              My Tuition Posts
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              View and manage all your tuition opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Eye size={18} />
              Browse Tuitions
            </Link>

            <Link
              href="/dashboard/tutor/post-tuition"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              <Plus size={18} />
              Add Tuition
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <BookOpen size={19} />
              <span className="text-sm">Total Posts</span>
            </div>

            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {tuitions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-5 dark:border-amber-400/20 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock3 size={19} />
              <span className="text-sm">Pending Approval</span>
            </div>

            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 dark:border-emerald-400/20 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={19} />
              <span className="text-sm">Approved</span>
            </div>

            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 dark:border-blue-400/20 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Power size={19} />
              <span className="text-sm">Active Posts</span>
            </div>

            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {activeCount}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by subject, class or location..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-amber-400/10"
            />
          </div>
        </div>

        {/* Tuition List */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2
              className="animate-spin text-amber-500"
              size={36}
            />
          </div>
        ) : tuitions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <AlertCircle
              className="mx-auto mb-4 text-slate-400"
              size={42}
            />

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Tuition Posts Yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You have not posted any tuition yet.
            </p>

            <Link
              href="/dashboard/tutor/post-tuition"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950"
            >
              <Plus size={17} />
              Create Your First Tuition
            </Link>
          </div>
        ) : filteredTuitions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Search
              className="mx-auto mb-3 text-slate-400"
              size={35}
            />

            <h2 className="font-bold text-slate-900 dark:text-white">
              No matching tuition found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try searching with another keyword.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredTuitions.map((tuition) => {
              const id = tuition._id || tuition.id || "";
              const approval = getApprovalStatus(tuition);
              const isActive = tuition.isActive !== false;
              const fee =
                tuition.monthlyFee ?? tuition.salary ?? 0;

              const subjects =
                tuition.subjects?.join(", ") ||
                tuition.subject ||
                "No subject specified";

              const location = [
                tuition.area,
                tuition.location,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {tuition.title || "Untitled Tuition"}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {tuition.classLevel ||
                          "Class not specified"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(approval)}`}
                      >
                        {approval === "unknown"
                          ? "Approval not set"
                          : approval}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-start gap-2">
                      <BookOpen
                        size={17}
                        className="mt-0.5 shrink-0 text-amber-500"
                      />
                      <span>{subjects}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin
                        size={17}
                        className="shrink-0 text-blue-500"
                      />
                      {location || "Location not specified"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Wallet
                        size={17}
                        className="shrink-0 text-emerald-500"
                      />
                      ৳{Number(fee).toLocaleString("en-BD")} / month
                    </p>

                    {tuition.mode && (
                      <p className="text-xs text-slate-500">
                        Mode: {tuition.mode}
                      </p>
                    )}

                    {!tuition.mode && tuition.medium && (
                      <p className="text-xs text-slate-500">
                        Medium: {tuition.medium}
                      </p>
                    )}

                    {approval === "unknown" && (
                      <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                        This tuition does not have an approvalStatus
                        field in the API response. Check the backend
                        data before treating it as approved.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <Link
                      href={`/dashboard/tutor/edit-tuition/${id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-300"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>

                    <Link
                      href={`/dashboard/tutor/applicants/${id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-2 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300"
                    >
                      <Users size={14} />
                      Applicants
                    </Link>

                    <button
                      type="button"
                      onClick={() => void deleteTuition(id)}
                      disabled={
                        deletingId === id || !id
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-400/10 dark:text-red-300"
                    >
                      {deletingId === id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && tuitions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  All My Tuitions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Showing {filteredTuitions.length} of{" "}
                  {tuitions.length} tuition posts.
                </p>

                {rejectedCount > 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {rejectedCount} tuition post(s) rejected by admin.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:text-slate-200"
                >
                  <Eye size={17} />
                  Browse Tuitions
                </Link>

                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  <Plus size={17} />
                  Create New Tuition
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
