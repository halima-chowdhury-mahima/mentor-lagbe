
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  ArrowRight,
  FileText,
  BookOpen,
  Users,
  Wallet,
  GraduationCap,
  Inbox,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type WorkspaceItem = {
  title: string;
  description: string;
  status?: string;
  meta?: string;
  href?: string;
};

type WorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  stats?: { label: string; value: string; icon: LucideIcon }[];
  items?: WorkspaceItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
};

export default function WorkspacePage({
  eyebrow,
  title,
  description,
  icon: PageIcon,
  actionLabel,
  actionHref,
  stats = [],
  items = [],
  emptyTitle = "Nothing to show yet",
  emptyDescription = "Your information will appear here when available.",
  searchPlaceholder = "Search...",
}: WorkspacePageProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.description} ${item.status || ""} ${item.meta || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <div className="min-h-screen w-full bg-[#F5F6F8] px-4 py-7 sm:px-6 lg:px-9">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#B58A39]">
              {eyebrow}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101F32] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F] shadow-lg">
            <PageIcon size={28} />
          </div>
        </div>

        {stats.length > 0 && (
          <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-500">
                      {stat.label}
                    </p>
                    <span className="rounded-xl bg-[#101F32] p-2 text-[#D9B66F]">
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-extrabold text-[#101F32]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#B58A39] focus:bg-white focus:ring-4 focus:ring-[#D6B36C]/15"
            />
          </div>

          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#101F32] bg-[#101F32] px-5 text-sm font-extrabold text-white transition hover:border-[#263E59] hover:bg-[#263E59]"
            >
              <Plus size={17} />
              {actionLabel}
            </Link>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
              <Inbox size={29} />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-[#101F32]">
              {search ? "No matching results" : emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try another keyword to find what you are looking for."
                : emptyDescription}
            </p>
            {actionLabel && actionHref && !search && (
              <Link
                href={actionHref}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#101F32] bg-[#101F32] px-6 text-sm font-extrabold text-white transition hover:bg-[#263E59]"
              >
                <Plus size={18} />
                {actionLabel}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D6B36C] hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-extrabold text-[#101F32]">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  {item.status && (
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold capitalize text-amber-800">
                      {item.status}
                    </span>
                  )}
                </div>

                {item.meta && (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    {item.meta}
                  </p>
                )}

                {item.href && (
                  <div className="mt-5">
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border-2 border-[#101F32] bg-[#b1ae28] px-4 text-xs font-extrabold text-white transition hover:bg-[#3268a5]"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
