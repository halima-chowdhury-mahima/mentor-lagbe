
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  Users,
  Mail,
  Phone,
  GraduationCap,
  BriefcaseBusiness,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  UserRound,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

type Applicant = {
  _id?: string;
  id?: string;

  // Student contact information
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;

  // Legacy / alternative field names
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;

  qualification?: string;
  experience?: string;
  message?: string;
  coverLetter?: string;
  status?: string;

  applicant?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  student?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApplicant(value: unknown): value is Applicant {
  return (
    isRecord(value) &&
    (typeof value._id === "string" || typeof value.id === "string")
  );
}

function getApplicants(result: unknown): Applicant[] {
  if (Array.isArray(result)) {
    return result.filter(isApplicant);
  }

  if (!isRecord(result)) return [];

  if (Array.isArray(result.applicants)) {
    return result.applicants.filter(isApplicant);
  }

  if (Array.isArray(result.data)) {
    return result.data.filter(isApplicant);
  }

  if (isRecord(result.data)) {
    if (Array.isArray(result.data.applicants)) {
      return result.data.applicants.filter(isApplicant);
    }

    if (Array.isArray(result.data.data)) {
      return result.data.data.filter(isApplicant);
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

function getMessage(result: unknown, fallback: string): string {
  if (!isRecord(result)) return fallback;

  if (typeof result.message === "string") {
    return result.message;
  }

  if (typeof result.error === "string") {
    return result.error;
  }

  return fallback;
}

function getApplicantName(applicant: Applicant): string {
  return (
    applicant.studentName ||
    applicant.name ||
    applicant.applicant?.name ||
    applicant.student?.name ||
    applicant.user?.name ||
    "Unknown Applicant"
  );
}

function getApplicantEmail(applicant: Applicant): string {
  return (
    applicant.studentEmail ||
    applicant.email ||
    applicant.applicant?.email ||
    applicant.student?.email ||
    applicant.user?.email ||
    ""
  );
}

function getApplicantPhone(applicant: Applicant): string {
  return (
    applicant.studentPhone ||
    applicant.phone ||
    applicant.contactNumber ||
    applicant.applicant?.phone ||
    applicant.student?.phone ||
    applicant.user?.phone ||
    ""
  );
}

export default function ApplicantsPage() {
  const params = useParams<{ id: string }>();
  const tuitionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!tuitionId) {
      setLoading(false);
      toast.error("Tuition ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/tutor/applicants/${encodeURIComponent(tuitionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await readResponse(response);

      if (!response.ok || (isRecord(result) && result.success === false)) {
        throw new Error(
          getMessage(result, "Failed to load applicants.")
        );
      }

      setApplicants(getApplicants(result));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [tuitionId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplicants();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadApplicants]);

  const updateStatus = async (
    applicationId: string,
    status: "accepted" | "rejected"
  ) => {
    if (!applicationId) {
      toast.error("Application ID is missing.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again.");
        return;
      }

      setUpdatingId(applicationId);

      const response = await fetch(
        `${API_URL}/api/tutor/applicants/${encodeURIComponent(applicationId)}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const result = await readResponse(response);

      if (!response.ok || (isRecord(result) && result.success === false)) {
        throw new Error(
          getMessage(result, "Could not update applicant status.")
        );
      }

      setApplicants((previous) =>
        previous.map((applicant) => {
          const id = applicant._id || applicant.id;

          return id === applicationId
            ? { ...applicant, status }
            : applicant;
        })
      );

      toast.success(
        status === "accepted"
          ? "Applicant accepted successfully!"
          : "Applicant rejected successfully!"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/tutor"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <Link
              href="/dashboard/tutor/my-tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <BookOpen size={16} />
              My Tuitions
            </Link>
          </div>
        </div>

        <section className="mb-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-300">
                <Users size={14} />
                TUTOR PANEL
              </div>

              <h1 className="text-3xl font-extrabold sm:text-4xl">
                Tuition Applicants
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Review applications, check applicant information and manage
                your tuition requests.
              </p>
            </div>

            <div className="flex h-20 min-w-32 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5">
              <div className="rounded-xl bg-amber-400/15 p-3 text-amber-300">
                <Users size={23} />
              </div>

              <div>
                <p className="text-2xl font-extrabold">
                  {applicants.length}
                </p>
                <p className="text-xs text-slate-300">Total Applicants</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              All Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review each applicant&apos;s profile and application details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadApplicants()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <Loader2 className="mb-3 animate-spin text-amber-600" size={35} />
            <p className="font-semibold text-slate-600">
              Loading applicants...
            </p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Users size={30} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No Applicants Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not received any applications for this tuition yet.
              Applicants will appear here when students apply.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/tutor/my-tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
              >
                <BookOpen size={17} />
                My Tuitions
              </Link>

              <Link
                href="/dashboard/tutor"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            {applicants.map((applicant, index) => {
              const applicationId = applicant._id || applicant.id || "";
              const name = getApplicantName(applicant);
              const email = getApplicantEmail(applicant);
              const phone = getApplicantPhone(applicant);
              const status = applicant.status || "pending";
              const isUpdating = updatingId === applicationId;

              return (
                <article
                  key={applicationId || index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                        <UserRound size={27} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Applicant #{index + 1}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-xs font-bold capitalize ${
                        status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                        <Mail size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400">
                          Email Address
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-800">
                          {email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                        <Phone size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          Phone Number
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {applicant.qualification && (
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                          <GraduationCap size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-400">
                            Qualification
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {applicant.qualification}
                          </p>
                        </div>
                      </div>
                    )}

                    {applicant.experience && (
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                          <BriefcaseBusiness size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-400">
                            Experience
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {applicant.experience}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(applicant.message || applicant.coverLetter) && (
                    <div className="mx-5 mb-5 rounded-2xl bg-slate-50 p-4 sm:mx-6">
                      <div className="mb-2 flex items-center gap-2 text-slate-600">
                        <MessageSquare size={16} />

                        <p className="text-xs font-bold uppercase tracking-wide">
                          Applicant Message
                        </p>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {applicant.message || applicant.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:px-6">
                    <p className="text-xs text-slate-500">
                      Review this application and update its status.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          isUpdating ||
                          !applicationId ||
                          status === "rejected"
                        }
                        onClick={() =>
                          void updateStatus(applicationId, "rejected")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={
                          isUpdating ||
                          !applicationId ||
                          status === "accepted"
                        }
                        onClick={() =>
                          void updateStatus(applicationId, "accepted")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Accept
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-6">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-amber-700"
          >
            <LayoutDashboard size={17} />
            Tutor Dashboard
          </Link>

          <Link
            href="/dashboard/tutor/my-tuitions"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-amber-700"
          >
            <BookOpen size={17} />
            My Tuitions
          </Link>
        </div>
      </div>
    </main>
  );
}
