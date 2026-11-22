
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="section-label mb-4">
          <span className="h-2 w-2 rounded-full bg-[#D9B66F]" />
          {eyebrow}
        </span>
      )}

      <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
