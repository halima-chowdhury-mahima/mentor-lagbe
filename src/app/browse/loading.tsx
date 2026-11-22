
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function BrowseLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-10 w-64 rounded bg-muted" />
          <div className="mt-4 h-5 w-96 max-w-full rounded bg-muted" />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 rounded-xl bg-muted" />
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>

        <LoadingSpinner label="Finding tuition opportunities..." />
      </div>
    </main>
  );
}
