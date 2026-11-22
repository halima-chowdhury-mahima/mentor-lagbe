
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function AuthLoading() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-5">
      <LoadingSpinner label="Preparing your account..." />
    </main>
  );
}
