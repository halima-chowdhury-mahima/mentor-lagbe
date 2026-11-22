
import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? "min-h-screen" : "min-h-48"} px-5`}>
      <LoaderCircle className="animate-spin text-[#B58A39]" size={36} />
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
