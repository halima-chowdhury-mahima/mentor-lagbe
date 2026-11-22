
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D9B66F]/15 text-[#B58A39]">
          <Icon size={21} />
        </span>
      </div>

      <p className="mt-5 text-3xl font-extrabold tabular-nums">{value}</p>

      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </article>
  );
}
