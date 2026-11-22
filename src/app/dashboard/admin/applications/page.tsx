
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Check,
  X,
  Search,
  Loader2,
  FileText,
} from "lucide-react";
import  axiosInstance  from "@/lib/axios";
import toast from "react-hot-toast";

type Application = {
  _id: string;
  status?: string;
  tutor?: {
    name?: string;
    email?: string;
  };
  tuition?: {
    title?: string;
    subject?: string;
  };
  tutorName?: string;
  tuitionTitle?: string;
};

export default function AdminApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [search, setSearch] = useState("");

  // Initial data loading
  useEffect(() => {
    let cancelled = false;

    const fetchApplications = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/admin/applications"
        );

        if (cancelled) return;

        const data =
          response.data?.data ??
          response.data?.applications ??
          response.data;

        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        if (cancelled) return;

        console.error("Applications loading error:", error);
        toast.error("Unable to load applications.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        "/api/admin/applications"
      );

      const data =
        response.data?.data ??
        response.data?.applications ??
        response.data;

      setItems(Array.isArray(data) ? data : []);
      toast.success("Applications refreshed.");
    } catch (error) {
      console.error("Applications refresh error:", error);
      toast.error("Unable to refresh applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update application status
  const updateStatus = async (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this application?`
    );

    if (!confirmed) return;

    setBusy(id);

    try {
      await axiosInstance.patch(
        `/api/admin/applications/${id}/status`,
        { status }
      );

      toast.success(`Application ${status} successfully.`);

      await load();
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
        "Could not update application status.";

      toast.error(message);
    } finally {
      setBusy("");
    }
  };

  // Search filtering
  const filtered = items.filter((item) => {
    const searchableText = [
      item.tutor?.name,
      item.tutorName,
      item.tutor?.email,
      item.tuition?.title,
      item.tuitionTitle,
      item.tuition?.subject,
      item.status,
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
              Application Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor tutor applications submitted for tuition requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
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
              placeholder="Search tutor or tuition..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#B58A39] focus:ring-4 focus:ring-[#D6B36C]/15"
            />
          </div>
        </div>

        {/* Applications */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-extrabold text-[#101F32]">
              Tutor Applications ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-bold text-slate-500">
              <Loader2
                size={22}
                className="animate-spin text-[#B58A39]"
              />
              Loading applications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <FileText
                size={34}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-extrabold text-[#101F32]">
                {search
                  ? "No Matching Applications"
                  : "No Applications Found"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try searching with a different keyword."
                  : "Tutor applications will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const status = (
                  item.status || "pending"
                ).toLowerCase();

                const isBusy = busy === item._id;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  >
                    {/* Application Information */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[#101F32]">
                        {item.tutor?.name ||
                          item.tutorName ||
                          "Tutor"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.tutor?.email ||
                          "Tutor application"}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Tuition:{" "}
                        {item.tuition?.title ||
                          item.tuitionTitle ||
                          "Tuition request"}
                      </p>

                      {item.tuition?.subject && (
                        <p className="mt-1 text-xs text-slate-500">
                          Subject: {item.tuition.subject}
                        </p>
                      )}

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold capitalize ${
                          status === "accepted"
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
                    {status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void updateStatus(
                              item._id,
                              "accepted"
                            )
                          }
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-emerald-700 bg-emerald-700 px-5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={17} />
                          )}
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void updateStatus(
                              item._id,
                              "rejected"
                            )
                          }
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-red-700 bg-red-700 px-5 text-sm font-extrabold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
}
