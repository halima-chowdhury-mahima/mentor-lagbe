
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function TuitionDetailsLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-32 rounded bg-muted" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="mt-5 h-5 w-1/2 rounded bg-muted" />
            <div className="mt-10 h-56 rounded-3xl bg-muted" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>

          <div className="h-72 rounded-3xl border border-border bg-card p-6">
            <div className="h-6 w-1/2 rounded bg-muted" />
            <div className="mt-8 h-10 w-3/4 rounded bg-muted" />
            <div className="mt-8 h-12 rounded-xl bg-muted" />
          </div>
        </div>
      </div>

      <LoadingSpinner label="Loading tuition details..." />
    </main>
  );
}
