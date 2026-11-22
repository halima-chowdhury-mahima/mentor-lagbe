
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Menu,
  X,
  UserRound,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

import ThemeToggle from "@/components/shared/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
];

function getDashboardRoute(role: string) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "tutor":
      return "/dashboard/tutor";
    case "student":
      return "/dashboard/student";
    default:
      return "/profile";
  }
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileImage =
    user && "image" in user && typeof user.image === "string"
      ? user.image
      : "";

  const dashboardRoute = user
    ? getDashboardRoute(user.role)
    : "/login";

  async function handleLogout() {
    const toastId = toast.loading("Signing out...");

    try {
      await logout();

      setMenuOpen(false);
      setProfileMenuOpen(false);

      toast.success("Logged out successfully!", {
        id: toastId,
      });

      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.", {
        id: toastId,
      });
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101F32] text-[#D9B66F]">
            <BookOpen size={22} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Mentor<span className="text-[#C69D4D]">Lagbe</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#B58A39]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded={profileMenuOpen}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 transition hover:bg-accent"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border-2 border-[#D9B66F] object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101F32] text-[#D9B66F]">
                    <UserRound size={19} />
                  </span>
                )}

                <span className="max-w-[120px] truncate text-sm font-bold">
                  {user.name}
                </span>

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-xl">
                  <div className="border-b border-border px-3 py-3">
                    <p className="truncate text-sm font-bold">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-[#D9B66F]/15 px-2.5 py-1 text-xs font-bold capitalize text-[#B58A39]">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-accent"
                  >
                    <UserRound size={17} />
                    My Profile
                  </Link>

                  <Link
                    href={dashboardRoute}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-accent"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-accent"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#b1ae28] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3f7ac3]"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-accent ${
                  pathname === link.href
                    ? "text-[#B58A39]"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <div className="my-2 border-t border-border" />

                {/* Mobile User Info */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-11 w-11 rounded-full border-2 border-[#D9B66F] object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101F32] text-[#D9B66F]">
                      <UserRound size={22} />
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>

                    <p className="text-xs font-semibold capitalize text-[#B58A39]">
                      {user.role}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent"
                >
                  <UserRound size={18} />
                  My Profile
                </Link>

                <Link
                  href={dashboardRoute}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-accent"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#b1ae28] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
