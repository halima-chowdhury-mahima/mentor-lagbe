
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function DashboardLoading() {
  return (
    <main className="min-h-[70vh] bg-background px-5 py-10">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-9 w-64 rounded bg-muted" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-muted" />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="mt-10 h-80 rounded-2xl bg-muted" />
      </div>

      <LoadingSpinner label="Preparing your dashboard..." />
    </main>
  );
}
