
"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound, Mail, Phone, MapPin, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    education: "",
  });

  const update = (key: keyof typeof profile, value: string) =>
    setProfile((old) => ({ ...old, [key]: value }));

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-7 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard/student" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#B58A39]">
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>
        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#B58A39]">Student Workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#101F32]">My Profile</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your personal information.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.error("Profile API connection is not configured yet.");
          }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-4 border-b border-slate-100 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
              <UserRound size={28} />
            </div>
            <div>
              <h2 className="font-extrabold text-[#101F32]">Personal Details</h2>
              <p className="mt-1 text-xs text-slate-500">Student account information</p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2">
            {([
              ["name", "Full Name", "Enter your full name", UserRound],
              ["email", "Email Address", "Enter your email", Mail],
              ["phone", "Phone Number", "Enter your phone number", Phone],
              ["location", "Location", "City / Area", MapPin],
              ["education", "Current Education", "e.g. Class 9 / University", UserRound],
            ] as const).map(([key, label, placeholder, Icon]) => (
              <div key={key}>
                <label className="text-sm font-bold text-slate-700">{label}</label>
                <div className="relative mt-2">
                  <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B58A39]" />
                  <input
                    value={profile[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-[#B58A39] focus:ring-4 focus:ring-[#D6B36C]/15"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-5">
            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#101F32] bg-[#101F32] px-6 text-sm font-extrabold text-white hover:bg-[#263E59]">
              <Save size={17} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
