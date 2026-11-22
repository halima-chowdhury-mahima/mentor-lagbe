
import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Browse Tuitions", href: "/browse" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  account: [
    { label: "Sign In", href: "/login" },
    { label: "Create Account", href: "/register" },
    { label: "Student Dashboard", href: "/dashboard/student" },
  ],
};

export default function SiteFooter() {
  return (
    <footer className="bg-[#0B1726] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-5 inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F] text-[#101F32]">
              <BookOpen size={22} />
            </span>
            <span className="text-xl font-extrabold">
              Mentor<span className="text-[#D9B66F]">Lagbe</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-7 text-slate-300">
            Connecting students with trusted tutors and meaningful learning
            opportunities across Bangladesh.
          </p>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-[#D9B66F]">Platform</h3>
          <ul className="space-y-3">
            {footerLinks.platform.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-300 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-[#D9B66F]">Your Account</h3>
          <ul className="space-y-3">
            {footerLinks.account.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-300 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-[#D9B66F]">Contact</h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Mail size={17} className="text-[#D9B66F]" />
              support@mentorlagbe.com
            </li>
            <li className="flex items-center gap-3">
              <Phone size={17} className="text-[#D9B66F]" />
              +880 1XXX-XXXXXX
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={17} className="text-[#D9B66F]" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-6 text-xs text-slate-400 sm:px-8 md:flex-row">
          <p>© 2026 MentorLagbe. All rights reserved.</p>
          <p>Learn better. Grow together.</p>
        </div>
      </div>
    </footer>
  );
}
