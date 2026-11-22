
"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, GraduationCap, Star, Users } from "lucide-react";

const stats = [
  { value: 1200, suffix: "+", label: "Active Students", icon: Users },
  { value: 850, suffix: "+", label: "Verified Tutors", icon: GraduationCap },
  { value: 500, suffix: "+", label: "Tuition Opportunities", icon: BookOpen },
  { value: 4.9, suffix: "/5", label: "Student Satisfaction", icon: Star },
];

export default function AnimatedStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const duration = 1800;
    let frameId = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setCounts(
        stats.map((stat) =>
          Number((stat.value * eased).toFixed(1))
        )
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [started]);

  return (
    <section
      ref={sectionRef}
      className="border-b border-border bg-background"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-7 px-5 py-10 sm:px-8 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const number =
            index === 3
              ? counts[index].toFixed(1)
              : Math.floor(counts[index]).toLocaleString("en-US");

          return (
            <div key={stat.label} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#159A79]/10 text-[#159A79]">
                <Icon size={23} />
              </span>

              <div>
                <p className="text-2xl font-extrabold tabular-nums text-foreground">
                  {number}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
