
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock3,
  BookOpen,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  GraduationCap,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";

import PublicLayout from "@/components/layout/public-layout";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

const SUBJECTS = [
  "Bangla",
  "English",
  "Mathematics",
  "Higher Mathematics",
  "General Science",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Accounting",
  "Finance & Banking",
  "Business Studies",
  "Economics",
  "Statistics",
  "Geography",
  "History",
  "Islamic Studies",
  "Religion",
  "Spoken English",
  "Web Development",
  "Programming",
  "University Admission",
  "All Subjects",
];

const CLASS_LEVELS = [
  "Play Group",
  "Nursery",
  "KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",
  "HSC 1st Year",
  "HSC 2nd Year",
  "HSC",
  "Admission Candidate",
  "University",
  "Beginner",
  "Professional",
];

const MODES = ["Online", "Offline"] as const;

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject: string;
  classLevel: string;
  location: string;
  description?: string;

  bannerImage?: string;
  monthlyFee?: number;
  daysPerWeek?: number;
  mode?: string;

  tutorName?: string;
  tutorEmail?: string;
  approvalStatus?: string;
  isActive?: boolean;
  createdAt?: string;

  // Legacy fields
  salary?: number;
  schedule?: string;
  medium?: string;
  status?: string;

  tutor?: {
    name?: string;
  };
};

type TuitionForm = {
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  salary: string;
  daysPerWeek: string;
  description: string;
};

const EMPTY_FORM: TuitionForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Offline",
  location: "",
  salary: "",
  daysPerWeek: "3",
  description: "",
};

function getId(item: Tuition) {
  return item._id || item.id || "";
}

function getMonthlyFee(item: Tuition) {
  return Number(item.monthlyFee ?? item.salary ?? 0);
}

function getSchedule(item: Tuition) {
  if (item.daysPerWeek) {
    return `${item.daysPerWeek} days / week`;
  }

  return item.schedule || "Schedule not specified";
}

function getStatus(item: Tuition) {
  return item.approvalStatus || item.status || "Pending";
}

async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
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

  const url = `${API_URL}${endpoint}`;

  try {
    return await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    console.error("MentorLagbe API connection error:", {
      url,
      error,
    });

    throw new Error(
      "Cannot connect to the server. Please check your internet connection or backend CORS settings."
    );
  }
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid server response. Please try again.");
  }
}

export default function BrowsePage() {
  const {
    loading: authLoading,
    isAuthenticated,
    isStudent,
    isTutor,
    isAdmin,
  } = useAuth();

  const canManageTuitions = isTutor || isAdmin;

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [myTuitions, setMyTuitions] = useState<Tuition[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [classLevel, setClassLevel] = useState("All Classes");
  const [mode, setMode] = useState("All Modes");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [showMyTuitions, setShowMyTuitions] = useState(false);

  const [form, setForm] = useState<TuitionForm>(EMPTY_FORM);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load approved and active tuition listings.
  useEffect(() => {
    let cancelled = false;

    async function loadTuitions() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "12",
          search,
          subject: subject === "All Subjects" ? "" : subject,
          classLevel:
            classLevel === "All Classes" ? "" : classLevel,
          mode: mode === "All Modes" ? "" : mode,
        });

        const response = await apiFetch(
          `/api/tuitions?${params.toString()}`
        );

        const result = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            result.message || "Could not load tuitions."
          );
        }

        if (cancelled) return;

        const data = Array.isArray(result.data)
          ? result.data
          : [];

        setTuitions(data);
        setTotal(result.pagination?.total ?? data.length);
        setTotalPages(
          Math.max(1, result.pagination?.totalPages ?? 1)
        );
      } catch (error) {
        if (cancelled) return;

        console.error("Tuition fetch error:", error);

        setTuitions([]);
        setTotal(0);
        setTotalPages(1);

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load tuitions."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTuitions();

    return () => {
      cancelled = true;
    };
  }, [page, search, subject, classLevel, mode, refreshKey]);

  // Fetch student bookmarks.
  const fetchBookmarks = useCallback(async () => {
    if (!isStudent) return;

    try {
      const response = await apiFetch("/api/bookmarks");
      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Could not load bookmarks."
        );
      }

      const items = Array.isArray(result.data)
        ? result.data
        : [];

      const ids = items
        .map((item: Tuition | { tuitionId?: string }) => {
          if ("tuitionId" in item && item.tuitionId) {
            return item.tuitionId;
          }

          return getId(item as Tuition);
        })
        .filter(Boolean);

      setSavedIds(ids);
    } catch (error) {
      console.error("Bookmark fetch error:", error);
    }
  }, [isStudent]);

  // Fetch tutor's own tuition listings.
  const fetchMyTuitions = useCallback(async () => {
    if (!canManageTuitions) return;

    try {
      const response = await apiFetch(
        "/api/tutor/my-tuitions"
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Could not load your tuitions."
        );
      }

      setMyTuitions(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error("My tuitions error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load your tuition listings."
      );
    }
  }, [canManageTuitions]);

  // Load user-specific data.
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadUserData() {
      if (!isAuthenticated) {
        setSavedIds([]);
        setMyTuitions([]);
        return;
      }

      if (cancelled) return;

      await Promise.all([
        fetchBookmarks(),
        fetchMyTuitions(),
      ]);
    }

    void loadUserData();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    fetchBookmarks,
    fetchMyTuitions,
  ]);

  // Filter by location on the current page.
  const filtered = useMemo(() => {
    const searchLocation = location.trim().toLowerCase();

    return tuitions.filter((item) =>
      (item.location || "")
        .toLowerCase()
        .includes(searchLocation)
    );
  }, [tuitions, location]);

  // Save or remove bookmark.
  const toggleBookmark = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save a tuition.");
      return;
    }

    if (!isStudent) {
      toast.error("Only students can save tuition.");
      return;
    }

    if (!id || savingId) return;

    const isSaved = savedIds.includes(id);

    setSavingId(id);

    try {
      const response = await apiFetch(
        `/api/bookmarks/${id}`,
        {
          method: isSaved ? "DELETE" : "POST",
        }
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Bookmark operation failed."
        );
      }

      setSavedIds((previous) =>
        isSaved
          ? previous.filter((savedId) => savedId !== id)
          : [...previous, id]
      );

      toast.success(
        isSaved
          ? "Tuition removed from saved."
          : "Tuition saved successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSavingId("");
    }
  };

  const openAddForm = () => {
    setEditingId("");
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item: Tuition) => {
    setEditingId(getId(item));

    setForm({
      title: item.title || item.subject,
      subject: item.subject,
      classLevel: item.classLevel,
      mode: item.mode || "Offline",
      location: item.location,
      salary: String(getMonthlyFee(item)),
      daysPerWeek: String(item.daysPerWeek || 3),
      description: item.description || "",
    });

    setShowForm(true);
  };

  const updateField = (
    field: keyof TuitionForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Add or edit tuition.
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!canManageTuitions) {
      toast.error(
        "You do not have permission to manage tuitions."
      );
      return;
    }

    if (
      !form.subject ||
      !form.classLevel ||
      !form.location.trim() ||
      !form.salary ||
      !form.description.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const monthlyFee = Number(form.salary);
    const daysPerWeek = Number(form.daysPerWeek);

    if (
      !Number.isFinite(monthlyFee) ||
      monthlyFee <= 0
    ) {
      toast.error("Please enter a valid monthly salary.");
      return;
    }

    if (
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      toast.error("Please select valid days per week.");
      return;
    }

    if (!["Online", "Offline"].includes(form.mode)) {
      toast.error("Please select a valid tuition mode.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title.trim() || form.subject,
      subject: form.subject,
      classLevel: form.classLevel,
      location: form.location.trim(),
      monthlyFee,
      mode: form.mode,
      daysPerWeek,
      description: form.description.trim(),
    };

    try {
      const endpoint = editingId
        ? `/api/tutor/my-tuitions/${editingId}`
        : "/api/tuitions";

      const response = await apiFetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Could not save tuition."
        );
      }

      toast.success(
        editingId
          ? "Tuition updated successfully."
          : "Tuition submitted for admin approval."
      );

      setShowForm(false);
      setEditingId("");
      setForm(EMPTY_FORM);

      await fetchMyTuitions();
      setRefreshKey((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete tuition.
  const handleDelete = async (id: string) => {
    if (!canManageTuitions || !id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await apiFetch(
        `/api/tutor/my-tuitions/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Could not delete tuition."
        );
      }

      toast.success("Tuition deleted successfully.");

      await fetchMyTuitions();
      setRefreshKey((value) => value + 1);
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

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setSubject("All Subjects");
    setClassLevel("All Classes");
    setMode("All Modes");
    setPage(1);
  };

  const filterInputClass =
    "h-12 w-full min-w-0 appearance-none rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-none outline-none ring-0 transition-colors focus:border-[#B58A39] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-[#B58A39] focus-visible:outline-none focus-visible:ring-0";

  const searchInputClass =
    "h-full w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#101F32] px-5 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#D9B66F]">
            Find your opportunity
          </p>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Explore Tuition Opportunities
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Discover tuition opportunities and connect with the
            right learning community.
          </p>

          {canManageTuitions && (
            <button
              type="button"
              onClick={openAddForm}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9B66F] px-5 py-3 text-sm font-bold text-[#101F32] transition hover:bg-[#efcc88]"
            >
              <Plus size={19} />
              Add Tuition
            </button>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Search and filters */}
        <div className="mb-9 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal
              size={19}
              className="text-[#B58A39]"
            />
            <h2 className="font-bold">Find Your Tuition</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-background px-4 shadow-none outline-none transition-colors focus-within:border-[#B58A39]">
              <Search
                size={19}
                className="shrink-0 text-muted-foreground"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search subject or class..."
                className={searchInputClass}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-background px-4 shadow-none outline-none transition-colors focus-within:border-[#B58A39]">
              <MapPin
                size={19}
                className="shrink-0 text-muted-foreground"
              />

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Search location..."
                className={searchInputClass}
              />
            </div>

            {/* Subject */}
            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setPage(1);
              }}
              className={filterInputClass}
            >
              <option>All Subjects</option>

              {SUBJECTS.filter(
                (item) => item !== "All Subjects"
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Class */}
            <select
              value={classLevel}
              onChange={(event) => {
                setClassLevel(event.target.value);
                setPage(1);
              }}
              className={filterInputClass}
            >
              <option>All Classes</option>

              {CLASS_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Tuition Mode */}
            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setPage(1);
              }}
              className={filterInputClass}
            >
              <option>All Modes</option>

              {MODES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-[#B58A39] hover:text-[#B58A39]"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Available tuition heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Available Tuitions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {total} opportunities found
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition hover:border-[#B58A39] hover:text-[#B58A39]"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Tuition cards */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2
              className="animate-spin text-[#B58A39]"
              size={36}
            />
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const id = getId(item);
                const saved = savedIds.includes(id);

                return (
                  <article
                    key={id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-[#D9B66F]/60 hover:shadow-xl"
                  >
                    {/* Tuition Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#101F32] to-[#243D59]">
                      {item.bannerImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.bannerImage}
                          alt={
                            item.title ||
                            `${item.subject} tuition`
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-white">
                          <BookOpen
                            size={42}
                            className="mb-3 text-[#D9B66F]"
                          />
                          <span className="text-sm font-semibold text-slate-300">
                            {item.subject}
                          </span>
                          <span className="mt-1 text-xs text-slate-400">
                            Tuition Opportunity
                          </span>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#101F32] shadow">
                        {item.mode || item.medium || "Academic"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-[#D9B66F]/15 px-3 py-1 text-xs font-bold text-[#A77B2B]">
                          {item.classLevel}
                        </span>

                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={19}
                            className="text-[#B58A39]"
                          />

                          {isStudent && (
                            <button
                              type="button"
                              onClick={() =>
                                void toggleBookmark(id)
                              }
                              disabled={savingId === id || !id}
                              aria-label={
                                saved
                                  ? "Remove saved tuition"
                                  : "Save tuition"
                              }
                              title={
                                saved
                                  ? "Unsave tuition"
                                  : "Save tuition"
                              }
                              className="rounded-lg p-2 text-muted-foreground transition hover:bg-[#D9B66F]/15 hover:text-[#B58A39] disabled:opacity-50"
                            >
                              {savingId === id ? (
                                <Loader2
                                  size={19}
                                  className="animate-spin"
                                />
                              ) : saved ? (
                                <BookmarkCheck
                                  size={20}
                                  className="text-[#B58A39]"
                                />
                              ) : (
                                <Bookmark size={20} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-foreground">
                        {item.title || item.subject}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-[#B58A39]">
                        {item.subject}
                      </p>

                      <div className="mt-5 flex-1 space-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <GraduationCap
                            size={17}
                            className="shrink-0"
                          />
                          {item.classLevel}
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin
                            size={17}
                            className="shrink-0"
                          />
                          {item.location}
                        </p>

                        <p className="flex items-center gap-2">
                          <CalendarDays
                            size={17}
                            className="shrink-0"
                          />
                          {getSchedule(item)}
                        </p>

                        <p className="flex items-center gap-2">
                          <Clock3
                            size={17}
                            className="shrink-0"
                          />
                          {item.mode ||
                            item.medium ||
                            "Mode not specified"}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Monthly salary
                          </p>

                          <p className="text-lg font-extrabold text-[#B58A39]">
                            {formatCurrency(getMonthlyFee(item))}
                          </p>
                        </div>

                        <Link
                          href={`/tuitions/${id}`}
                          className="rounded-xl bg-[#101F32] px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#B58A39]"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((previous) => previous - 1);
                    window.scrollTo({
                      top: 500,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((previous) => previous + 1);
                    window.scrollTo({
                      top: 500,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Search
              className="mx-auto mb-4 text-muted-foreground"
              size={36}
            />

            <h3 className="text-lg font-bold">
              No tuition found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white hover:bg-[#1c3552]"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Tutor / Admin tuition management */}
        {canManageTuitions && (
          <div className="mt-16 border-t border-border pt-10">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold">
                  Manage My Tuitions
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Add, edit and manage your tuition listings.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMyTuitions((value) => !value)
                }
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold transition hover:border-[#B58A39] hover:text-[#B58A39]"
              >
                {showMyTuitions
                  ? "Hide Listings"
                  : "Manage Listings"}
              </button>
            </div>

            {showMyTuitions && (
              <div className="space-y-4">
                {myTuitions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <BookOpen
                      className="mx-auto mb-3 text-muted-foreground"
                      size={30}
                    />

                    <p className="font-semibold">
                      No tuition added yet
                    </p>

                    <button
                      type="button"
                      onClick={openAddForm}
                      className="mt-4 font-bold text-[#B58A39]"
                    >
                      + Add your first tuition
                    </button>
                  </div>
                ) : (
                  myTuitions.map((item) => {
                    const id = getId(item);

                    return (
                      <div
                        key={id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          {item.bannerImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.bannerImage}
                              alt={item.title || item.subject}
                              className="h-20 w-20 rounded-xl object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#101F32] text-[#D9B66F]">
                              <BookOpen size={28} />
                            </div>
                          )}

                          <div>
                            <h3 className="font-bold">
                              {item.title || item.subject}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.classLevel} · {item.location}
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#B58A39]">
                              {formatCurrency(getMonthlyFee(item))}
                            </p>

                            <span className="mt-2 inline-block rounded-full bg-[#D9B66F]/15 px-3 py-1 text-xs font-bold text-[#A77B2B]">
                              {getStatus(item)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:border-[#B58A39] hover:text-[#B58A39]"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(id)}
                            disabled={deletingId === id || !id}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Tuition Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-extrabold">
                  {editingId ? "Edit Tuition" : "Add New Tuition"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Provide accurate information about your tuition.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tuition Title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Example: Mathematics Tutor Needed"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#B58A39] focus:ring-0"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Subject *
                  </label>

                  <select
                    required
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                  >
                    <option value="">Select Subject</option>

                    {SUBJECTS.filter(
                      (item) => item !== "All Subjects"
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Class / Level *
                  </label>

                  <select
                    required
                    value={form.classLevel}
                    onChange={(event) =>
                      updateField("classLevel", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                  >
                    <option value="">Select Class</option>

                    {CLASS_LEVELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Tuition Mode *
                  </label>

                  <select
                    required
                    value={form.mode}
                    onChange={(event) =>
                      updateField("mode", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                  >
                    {MODES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Monthly Salary (BDT) *
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={form.salary}
                    onChange={(event) =>
                      updateField("salary", event.target.value)
                    }
                    placeholder="Example: 8000"
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Location *
                </label>

                <input
                  required
                  value={form.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  placeholder="Example: Uttara, Dhaka"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Days Per Week *
                </label>

                <select
                  required
                  value={form.daysPerWeek}
                  onChange={(event) =>
                    updateField("daysPerWeek", event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={String(day)}>
                      {day === 7
                        ? "Every day (7 days / week)"
                        : `${day} days / week`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description *
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Write tuition details, requirements and additional information..."
                  className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-[#B58A39] focus:ring-0"
                />
              </div>

              <div className="rounded-xl bg-[#D9B66F]/10 p-4 text-sm leading-6 text-muted-foreground">
                Your tuition will be submitted for admin approval.
                It will appear in Browse Tuitions after approval.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101F32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1c3552] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      {editingId
                        ? "Update Tuition"
                        : "Submit Tuition"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
