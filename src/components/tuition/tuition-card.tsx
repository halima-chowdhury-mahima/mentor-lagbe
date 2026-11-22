
import Link from "next/link";
import { BookOpen, MapPin, Clock3, ArrowUpRight } from "lucide-react";
import type { Tuition } from "@/services/tuition.service";
import { formatCurrency } from "@/lib/utils";

export default function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-[#D9B66F]/15 px-3 py-1 text-xs font-bold text-[#A77B2B]">
          {tuition.category}
        </span>
        <BookOpen size={20} className="text-[#B58A39]" />
      </div>

      <h3 className="text-xl font-extrabold">{tuition.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{tuition.subject} · {tuition.classLevel}</p>

      <div className="mt-5 flex-1 space-y-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><MapPin size={16} />{tuition.location}</p>
        <p className="flex items-center gap-2"><Clock3 size={16} />{tuition.daysPerWeek} days / week</p>
        <p>{tuition.tuitionType}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <div>
          <p className="text-xs text-muted-foreground">Monthly salary</p>
          <p className="mt-1 text-lg font-extrabold text-[#B58A39]">{formatCurrency(tuition.salary)}</p>
        </div>
        <Link
          href={`/tuitions/${tuition._id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[#101F32] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1c3552]"
        >
          Details <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
