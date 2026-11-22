
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Check,
  X,
  Search,
  Loader2,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

type Tuition = {
  _id: string;
  title?: string;
  subject?: string;
  location?: string;
  salary?: number;
  monthlyFee?: number;
  status?: string;
  approvalStatus?: string;
  student?: {
    name?: string;
  };
};

type ActionStatus = "approved" | "rejected";

type Confirmation = {
  id: string;
  title: string;
  status: ActionStatus;
};

export default function AdminTuitionsPage() {
  const [items, setItems] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] =
    useState<Confirmation | null>(null);

  // Fetch tuition requests
  const load = useCallback(async (showToast = true) => {
    setLoading(true);

    try {
      const response = await axiosInstance.get("/api/admin/tuitions");

      const data =
        response.data?.data ??
        response.data?.tuitions ??
        response.data;

      setItems(Array.isArray(data) ? data : []);

      if (showToast) {
        toast.success("Tuition requests refreshed!");
      }
    } catch (error) {
      console.error("Tuition loading error:", error);

      if (showToast) {
        toast.error("Unable to load tuition requests.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading
  // Initial loading
useEffect(() => {
  let cancelled = false;

  const fetchInitialTuitions = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/tuitions");

      if (cancelled) return;

      const data =
        response.data?.data ??
        response.data?.tuitions ??
        response.data;

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      if (cancelled) return;

      console.error("Tuition loading error:", error);
      toast.error("Unable to load tuition requests.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void fetchInitialTuitions();

  return () => {
    cancelled = true;
  };
}, []);

  // Open confirmation modal
  const openConfirmation = (
    id: string,
    title: string,
    status: ActionStatus
  ) => {
    setConfirmation({
      id,
      title,
      status,
    });
  };

  // Approve or reject tuition
  const updateStatus = async () => {
    if (!confirmation) return;

    const { id, status } = confirmation;

    setBusy(id);

    try {
      await axiosInstance.patch(
        `/api/admin/tuitions/${id}/status`,
        { status }
      );

      // Close modal after successful update
      setConfirmation(null);

      if (status === "approved") {
        toast.success("Tuition approved successfully!");
      } else {
        toast.success("Tuition rejected successfully!");
      }

      // Refresh data without showing another toast
      await load(false);
    } catch (error: unknown) {
      const message =
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ||
        `Could not ${status} this tuition. Please try again.`;

      toast.error(message);
    } finally {
      setBusy("");
    }
  };

  // Search filtering
  const filtered = items.filter((item) => {
    const status = (
      item.approvalStatus || item.status || "pending"
    ).toLowerCase();

    const searchableText = [
      item.title,
      item.subject,
      item.location,
      item.student?.name,
      status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.trim().toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-7 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#B58A39]">
              Admin Workspace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#101F32]">
              Tuition Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review student tuition requests and manage approval decisions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading || Boolean(busy)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#B58A39] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tuition, subject or location..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#B58A39] focus:ring-4 focus:ring-[#D6B36C]/15"
            />
          </div>
        </div>

        {/* Tuition Records */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-extrabold text-[#101F32]">
              All Tuition Requests
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {filtered.length} requests
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-bold text-slate-500">
              <Loader2
                size={22}
                className="animate-spin text-[#B58A39]"
              />
              Loading tuition requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <BookOpen
                size={34}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-extrabold text-[#101F32]">
                {search
                  ? "No Matching Tuition Requests"
                  : "No Tuition Requests Found"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try searching with a different keyword."
                  : "Student tuition requests will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const status = (
                  item.approvalStatus ||
                  item.status ||
                  "pending"
                ).toLowerCase();

                const pending = status === "pending";
                const isBusy = busy === item._id;

                const fee = item.monthlyFee ?? item.salary ?? 0;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  >
                    {/* Tuition Information */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[#101F32]">
                        {item.title || "Tuition Request"}
                      </h3>

                      {item.student?.name && (
                        <p className="mt-1 text-sm text-slate-500">
                          Student: {item.student.name}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-slate-500">
                        {item.subject || "Subject not specified"}
                        {" · "}
                        {item.location || "Location not specified"}
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-700">
                        ৳{Number(fee).toLocaleString("en-BD")}
                        {" / month"}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold capitalize ${
                          status === "approved"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : status === "rejected"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Actions */}
                    {pending && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            openConfirmation(
                              item._id,
                              item.title || "this tuition",
                              "approved"
                            )
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-emerald-700 bg-emerald-700 px-5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={17} />
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            openConfirmation(
                              item._id,
                              item.title || "this tuition",
                              "rejected"
                            )
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-red-700 bg-red-700 px-5 text-sm font-extrabold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={17} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08111F]/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !busy
            ) {
              setConfirmation(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="p-6 text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  confirmation.status === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {confirmation.status === "approved" ? (
                  <ShieldCheck size={32} />
                ) : (
                  <AlertTriangle size={32} />
                )}
              </div>

              <h2
                id="confirmation-title"
                className="mt-5 text-xl font-extrabold text-[#101F32]"
              >
                {confirmation.status === "approved"
                  ? "Approve Tuition?"
                  : "Reject Tuition?"}
              </h2>

              <p className="mt-3 break-words text-sm font-semibold text-slate-700">
                {confirmation.title}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {confirmation.status === "approved"
                  ? "This tuition will be approved and become eligible to appear in Browse Tuitions."
                  : "This tuition request will be rejected and will not appear in Browse Tuitions."}
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => setConfirmation(null)}
                  className="min-h-12 flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => void updateStatus()}
                  className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirmation.status === "approved"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  {busy ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : confirmation.status === "approved" ? (
                    <Check size={17} />
                  ) : (
                    <X size={17} />
                  )}

                  {busy
                    ? "Processing..."
                    : confirmation.status === "approved"
                      ? "Yes, Approve"
                      : "Yes, Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
