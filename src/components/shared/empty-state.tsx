
import Link from "next/link";
import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "Nothing found",
  description = "There is no data to display right now.",
  actionLabel,
  actionHref,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-5 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX size={27} />
      </div>
      <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 rounded-xl bg-[#101F32] px-5 py-3 text-sm font-bold text-white hover:bg-[#1c3552]">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
