
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  UserRound,
  Home,
  ArrowLeft,
} from "lucide-react";

const dashboardLinks = [
  {
    href: "/dashboard/student",
    label: "Student Dashboard",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/tutor",
    label: "Tutor Dashboard",
    icon: BookOpen,
  },
  {
    href: "/dashboard/admin",
    label: "Admin Dashboard",
    icon: Users,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Admin has its own complete dashboard layout.
  const isAdminPage = pathname.startsWith("/dashboard/admin");

  return (
    <>
      
      {isAdminPage ? (
        <div className="min-h-screen w-full bg-[#F5F6F8] text-slate-900">
          {children}
        </div>
      ) : (
        <div className="min-h-screen w-full bg-[#F5F6F8] text-slate-900">
          {/* HEADER */}
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
            <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8">
              <Link
                href="/"
                className="group flex items-center gap-3 rounded-xl"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101827] text-[#E8CA89] shadow-sm transition group-hover:bg-[#1D2A40]">
                  <LayoutDashboard size={21} />
                </span>

                <span className="text-lg font-extrabold tracking-tight text-[#101827]">
                  Mentor
                  <span className="text-[#A77D32]">Lagbe</span>
                </span>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-[#B58A39] hover:bg-[#FBF7ED] hover:text-[#805D20] focus:outline-none focus:ring-2 focus:ring-[#D6B36C] focus:ring-offset-2"
              >
                <Home size={17} />
                <span>Visit Website</span>
              </Link>
            </div>
          </header>

          {/* DASHBOARD BODY */}
          <div className="grid w-full lg:grid-cols-[250px_minmax(0,1fr)]">
            {/* SIDEBAR */}
            <aside className="border-b border-slate-200 bg-white p-5 shadow-sm lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r">
              <p className="mb-4 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                Workspace
              </p>

              <nav className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {dashboardLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6B36C] focus:ring-offset-2 ${
                        isActive
                          ? "border-[#101827] bg-[#a2a236] text-[#F1D99F] shadow-md"
                          : "border-transparent bg-white text-slate-700 hover:border-[#D6B36C] hover:bg-[#FBF7ED] hover:text-[#79591F]"
                      }`}
                    >
                      <Icon
                        size={19}
                        className={
                          isActive ? "text-[#E8CA89]" : "text-slate-500"
                        }
                      />

                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* ACCOUNT LINKS */}
              <div className="mt-8 border-t border-slate-200 pt-5">
                <p className="mb-3 px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Account
                </p>

                <Link
                  href="/profile"
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#D6B36C] hover:bg-[#FBF7ED] hover:text-[#79591F] focus:outline-none focus:ring-2 focus:ring-[#D6B36C] focus:ring-offset-2"
                >
                  <UserRound size={19} className="text-slate-500" />
                  My Profile
                </Link>

                <Link
                  href="/"
                  className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#D6B36C] hover:bg-[#FBF7ED] hover:text-[#79591F] focus:outline-none focus:ring-2 focus:ring-[#D6B36C] focus:ring-offset-2"
                >
                  <ArrowLeft size={19} className="text-slate-500" />
                  Back to Home
                </Link>
              </div>

              {/* SIDEBAR FOOTER */}
              <div className="mt-8 rounded-2xl border border-[#E8D9B8] bg-[#FBF7ED] p-4">
                <p className="text-xs font-extrabold text-[#79591F]">
                  MentorLagbe Workspace
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Manage your learning and tutoring activities from one place.
                </p>
              </div>
            </aside>

            {/* PAGE CONTENT */}
            <main className="min-h-[calc(100vh-73px)] min-w-0 w-full bg-[#F5F6F8] p-5 sm:p-8 lg:p-10">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
