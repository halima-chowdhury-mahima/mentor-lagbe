
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Loader2,
  Users,
  Mail,
  UserRound,
} from "lucide-react";
import  axiosInstance  from "@/lib/axios";
import toast from "react-hot-toast";

type User = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Initial fetch: state updates happen after the request resolves.
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/users");

        const data =
          response.data?.data ??
          response.data?.users ??
          response.data;

        if (isMounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          toast.error("Unable to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual refresh: called only by the Refresh button.
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get("/api/admin/users");

      const data =
        response.data?.data ??
        response.data?.users ??
        response.data;

      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.role || ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-7 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#B58A39]">
              Admin Workspace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#101F32]">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View registered students, tutors and platform users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#B58A39] hover:bg-[#FFF9EC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or role..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#B58A39] focus:ring-4 focus:ring-[#D6B36C]/15"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-extrabold text-[#101F32]">
              Registered Users ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-bold text-slate-500">
              <Loader2
                size={22}
                className="animate-spin text-[#B58A39]"
              />
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users size={34} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-extrabold text-[#101F32]">
                No Users Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try searching with another name, email or role."
                  : "Registered users will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#101F32] text-[#D9B66F]">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-[#101F32]">
                        {user.name || "Unnamed User"}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 break-all text-sm text-slate-500">
                        <Mail size={13} className="shrink-0" />
                        {user.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[#E8D7B2] bg-[#FFF9EC] px-3 py-1.5 text-xs font-extrabold capitalize text-[#75551D]">
                      {user.role || "user"}
                    </span>

                    <span className="text-xs text-slate-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
