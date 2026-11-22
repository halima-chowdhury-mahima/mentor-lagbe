
import Link from "next/link";
import { SearchX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#101F32] text-[#D9B66F]">
          <SearchX size={46} />
        </div>
        <p className="mt-8 text-sm font-extrabold tracking-[0.25em] text-[#B58A39]">ERROR 404</p>
        <h1 className="mt-3 text-4xl font-extrabold">Page Not Found</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Sorry! The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101F32] px-6 py-3 font-bold text-white hover:bg-[#1c3552]">
            <Home size={17} /> Go Home
          </Link>
          <Link href="/browse" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 font-bold hover:bg-accent">
            <ArrowLeft size={17} /> Browse Tuitions
          </Link>
        </div>
      </div>
    </main>
  );
}
