
type Status = "pending" | "approved" | "rejected" | "accepted" | "cancelled" | "active" | "completed";

const statusStyles: Record<Status, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  cancelled: "bg-slate-500/10 text-slate-500",
  active: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-blue-500/10 text-blue-600",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
