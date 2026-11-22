
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background">
      <LoadingSpinner label="Loading MentorLagbe..." />
    </main>
  );
}
