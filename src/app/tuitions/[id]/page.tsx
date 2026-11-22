
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock3,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Loader2,
  GraduationCap,
  CalendarDays,
  UserRound,
  Send,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PublicLayout from "@/components/layout/public-layout";
import { formatCurrency } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

interface Tuition {
  _id: string;
  id?: string;
  title?: string;
  subject: string;
  classLevel: string;
  medium?: string;
  location: string;
  salary: number;
  schedule?: string;
  daysPerWeek?: number;
  tuitionType?: string;
  type?: string;
  category?: string;
  description?: string;
  requirements?: string[];
  status?: string;
  tutor?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  tutorName?: string;
  image?: string;
  createdAt?: string;
}

interface Application {
  _id: string;
  tuitionId: string;
  status: string;
}

function getSchedule(tuition: Tuition) {
  if (tuition.schedule) return tuition.schedule;

  if (tuition.daysPerWeek) {
    return `${tuition.daysPerWeek} days / week`;
  }

  return "Flexible schedule";
}

function getTuitionType(tuition: Tuition) {
  return tuition.tuitionType || tuition.type || "Not specified";
}

export default function TuitionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isStudent,
  } = useAuth();

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("");

  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const loadTuition = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setPageError("");

    try {
      const response = await axiosInstance.get(`/api/tuitions/${id}`);
      const result = response.data;

      const item =
        result.tuition ??
        result.data?.tuition ??
        result.data ??
        result;

      if (!item || !item._id) {
        throw new Error("Tuition information could not be found.");
      }

      setTuition(item);
    } catch (error: unknown) {
      console.error("Tuition details error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load tuition details.";

      setPageError(message);
      setTuition(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadStudentData = useCallback(async () => {
    if (!isAuthenticated || !isStudent || !id) {
      setSaved(false);
      setHasApplied(false);
      setApplicationStatus("");
      return;
    }

    try {
      const [bookmarkResponse, applicationResponse] =
        await Promise.allSettled([
          axiosInstance.get("/api/bookmarks"),
          axiosInstance.get("/api/applications/my-applications"),
        ]);

      if (bookmarkResponse.status === "fulfilled") {
        const result = bookmarkResponse.value.data;
        const bookmarks = Array.isArray(result.data)
          ? result.data
          : [];

        const isSaved = bookmarks.some(
          (item: { _id?: string; id?: string; tuitionId?: string }) =>
            item.tuitionId === id ||
            item._id === id ||
            item.id === id
        );

        setSaved(isSaved);
      }

      if (applicationResponse.status === "fulfilled") {
        const result = applicationResponse.value.data;
        const applications: Application[] = Array.isArray(result.data)
          ? result.data
          : [];

        const existingApplication = applications.find(
          (item) => item.tuitionId === id
        );

        if (existingApplication) {
          setHasApplied(true);
          setApplicationStatus(existingApplication.status || "pending");
        } else {
          setHasApplied(false);
          setApplicationStatus("");
        }
      }
    } catch (error) {
      console.error("Student data loading error:", error);
    }
  }, [id, isAuthenticated, isStudent]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;
      await loadTuition();
    });

    return () => {
      cancelled = true;
    };
  }, [loadTuition]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;
      await loadStudentData();
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, loadStudentData]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save this tuition.");
      router.push("/login");
      return;
    }

    if (!isStudent) {
      toast.error("Only student accounts can save tuitions.");
      return;
    }

    if (!id || bookmarkLoading) return;

    setBookmarkLoading(true);

    try {
      if (saved) {
        await axiosInstance.delete(`/api/bookmarks/${id}`);
        setSaved(false);
        toast.success("Tuition removed from saved.");
      } else {
        await axiosInstance.post(`/api/bookmarks/${id}`);
        setSaved(true);
        toast.success("Tuition saved successfully.");
      }
    } catch (error: unknown) {
      console.error("Bookmark error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Bookmark operation failed.";

      toast.error(message);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in with your student account to apply.");
      router.push("/login");
      return;
    }

    if (!isStudent) {
      toast.error("Only students can apply for tuition.");
      return;
    }

    if (!id || applying || hasApplied) return;

    setApplying(true);

    try {
      const response = await axiosInstance.post("/api/applications", {
        tuitionId: id,
        message: message.trim(),
      });

      const result = response.data;

      setHasApplied(true);
      setApplicationStatus(result.data?.status || "pending");
      setMessage("");

      toast.success(
        result.message || "Your application has been submitted successfully!"
      );
    } catch (error: unknown) {
      console.error("Application submission error:", error);

      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      if (axiosError.response?.status === 409) {
        setHasApplied(true);
        setApplicationStatus("pending");
        toast.error(
          axiosError.response.data?.message ||
            "You have already applied for this tuition."
        );
      } else {
        toast.error(
          axiosError.response?.data?.message ||
            "Could not submit your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading || authLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2
            size={38}
            className="animate-spin text-[#B58A39]"
          />
        </div>
      </PublicLayout>
    );
  }

  if (pageError || !tuition) {
    return (
      <PublicLayout>
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
          <AlertCircle size={45} className="mb-4 text-red-500" />

          <h1 className="text-2xl font-extrabold">
            Tuition Not Found
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            {pageError ||
              "This tuition may have been removed or is no longer available."}
          </p>

          <Link
            href="/browse"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1c3552]"
          >
            <ArrowLeft size={17} />
            Back to Browse
          </Link>
        </section>
      </PublicLayout>
    );
  }

  const title = tuition.title || tuition.subject;
  const schedule = getSchedule(tuition);
  const tuitionType = getTuitionType(tuition);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <Link
          href="/browse"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={17} />
          Back to Browse
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <article className="rounded-3xl border border-border bg-card p-7 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-[#D9B66F]/15 px-3 py-1.5 text-xs font-bold text-[#A77B2B]">
                {tuition.category || tuition.medium || "Academic"}
              </span>

              {isStudent && (
                <button
                  type="button"
                  onClick={() => void handleBookmark()}
                  disabled={bookmarkLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold transition hover:border-[#B58A39] hover:text-[#B58A39] disabled:opacity-50"
                >
                  {bookmarkLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : saved ? (
                    <BookmarkCheck size={17} />
                  ) : (
                    <Bookmark size={17} />
                  )}

                  {saved ? "Saved" : "Save Tuition"}
                </button>
              )}
            </div>

            <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2 text-base font-semibold text-[#B58A39]">
              {tuition.subject}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {tuition.classLevel}
            </p>

            <div className="mt-7 grid gap-4 rounded-2xl bg-muted/50 p-5 sm:grid-cols-2">
              <p className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="shrink-0 text-[#B58A39]" />
                {tuition.location}
              </p>

              <p className="flex items-center gap-3 text-sm">
                <CalendarDays size={18} className="shrink-0 text-[#B58A39]" />
                {schedule}
              </p>

              <p className="flex items-center gap-3 text-sm">
                <BookOpen size={18} className="shrink-0 text-[#B58A39]" />
                {tuitionType}
              </p>

              <p className="flex items-center gap-3 text-sm">
                <GraduationCap size={18} className="shrink-0 text-[#B58A39]" />
                {tuition.medium || "Medium not specified"}
              </p>
            </div>

            <h2 className="mt-9 text-xl font-extrabold">
              Tuition Description
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {tuition.description ||
                "No additional description has been provided for this tuition."}
            </p>

            {tuition.requirements && tuition.requirements.length > 0 && (
              <>
                <h2 className="mt-9 text-xl font-extrabold">
                  Tutor Requirements
                </h2>

                <ul className="mt-4 space-y-3">
                  {tuition.requirements.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-emerald-600"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(tuition.tutor?.name || tuition.tutorName) && (
              <div className="mt-9 border-t border-border pt-6">
                <h2 className="text-lg font-extrabold">
                  Posted By
                </h2>

                <p className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <UserRound size={18} className="text-[#B58A39]" />
                  {tuition.tutor?.name || tuition.tutorName}
                </p>
              </div>
            )}
          </article>

          <aside className="h-fit rounded-3xl border border-border bg-card p-7">
            <p className="text-sm text-muted-foreground">
              Monthly salary
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#B58A39]">
              {formatCurrency(tuition.salary)}
            </p>

            <div className="my-6 h-px bg-border" />

            <p className="text-sm leading-7 text-muted-foreground">
              Interested in this tuition? Submit your application using your student account.
            </p>

            {isStudent && hasApplied ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2
                  size={24}
                  className="mx-auto text-emerald-600"
                />

                <p className="mt-2 font-bold text-emerald-800">
                  Application Submitted
                </p>

                <p className="mt-1 text-xs capitalize text-emerald-700">
                  Status: {applicationStatus || "pending"}
                </p>

                <Link
                  href="/dashboard/student/applications"
                  className="mt-4 inline-block text-sm font-bold text-[#A77B2B] underline underline-offset-4"
                >
                  View My Applications
                </Link>
              </div>
            ) : isStudent ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="application-message"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Message to Tutor (Optional)
                  </label>

                  <textarea
                    id="application-message"
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={1000}
                    placeholder="Introduce yourself and explain why you are interested..."
                    className="w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-[#B58A39]"
                  />

                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {message.length}/1000
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleApply()}
                  disabled={applying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101F32] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1c3552] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applying ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Apply for This Tuition
                    </>
                  )}
                </button>
              </div>
            ) : isAuthenticated ? (
              <div className="mt-6 rounded-xl bg-muted p-4 text-center">
                <p className="text-sm font-semibold">
                  You are signed in as {user?.role}.
                </p>

                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  Only student accounts can apply for tuition.
                </p>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="mt-6 block rounded-xl bg-[#b1ae28] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#2f72bd]"
                >
                  Sign In to Apply
                </Link>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  New to MentorLagbe?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-[#B58A39]"
                  >
                    Create an account
                  </Link>
                </p>
              </>
            )}
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
