
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  BookOpen,
  MapPin,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  classLevel?: string;
  subjects?: string[];
  subject?: string;
  medium?: string;
  location?: string;
  area?: string;
  salary?: number;
  negotiable?: boolean;
  tuitionType?: string;
  category?: string;
  contactNumber?: string;
  description?: string;
};

type TuitionListResponse = {
  success?: boolean;
  message?: string;
  data?: Tuition[] | {
    tuitions?: Tuition[];
  };
  tuitions?: Tuition[];
};

type UpdateResponse = {
  success?: boolean;
  message?: string;
};

const initialForm = {
  title: "",
  classLevel: "",
  subjects: "",
  medium: "Bangla Medium",
  location: "",
  area: "",
  salary: "",
  negotiable: "Yes",
  tuitionType: "Home",
  contactNumber: "",
  description: "",
};

function getItems(result: TuitionListResponse | Tuition[]): Tuition[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.tuitions)) {
    return result.tuitions;
  }

  if (
    result.data &&
    !Array.isArray(result.data) &&
    Array.isArray(result.data.tuitions)
  ) {
    return result.data.tuitions;
  }

  return [];
}

export default function EditTuitionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200";

  useEffect(() => {
    let cancelled = false;

    const loadTuition = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/tutor/my-tuitions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const result: TuitionListResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Could not load tuition"
          );
        }

        const tuition = getItems(result).find(
          (item) => (item._id || item.id) === id
        );

        if (!tuition) {
          throw new Error("Tuition not found");
        }

        if (cancelled) return;

        setForm({
          title: tuition.title || "",
          classLevel: tuition.classLevel || "",
          subjects:
            tuition.subjects?.join(", ") || tuition.subject || "",
          medium: tuition.medium || "Bangla Medium",
          location: tuition.location || "",
          area: tuition.area || "",
          salary: String(tuition.salary ?? ""),
          negotiable: tuition.negotiable === false ? "No" : "Yes",
          tuitionType: tuition.tuitionType || "Home",
          contactNumber: tuition.contactNumber || "",
          description: tuition.description || "",
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Loading failed"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTuition();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateField = (
    field: keyof typeof initialForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    if (!form.subjects.trim()) {
      toast.error("Please enter at least one subject");
      return;
    }

    if (!form.salary || Number(form.salary) <= 0) {
      toast.error("Please enter a valid salary");
      return;
    }

    setSaving(true);

    try {
      const subjects = form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        classLevel: form.classLevel,
        subjects,
        subject: subjects.join(", "),
        medium: form.medium,
        location: form.location.trim(),
        area: form.area.trim(),
        salary: Number(form.salary),
        negotiable: form.negotiable === "Yes",
        tuitionType: form.tuitionType,
        category:
          form.tuitionType === "Online"
            ? "Online Tuition"
            : form.tuitionType === "Both"
              ? "Private Tuition"
              : "Home Tuition",
        contactNumber: form.contactNumber.trim(),
        description: form.description.trim(),
      };

      const response = await fetch(
        `${API_URL}/api/tutor/my-tuitions/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result: UpdateResponse | null =
        await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Could not update tuition"
        );
      }

      toast.success("Tuition updated successfully!");
      router.push("/dashboard/tutor/my-tuitions");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2
          className="animate-spin text-amber-500"
          size={36}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/tutor/my-tuitions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-300"
        >
          <ArrowLeft size={17} />
          Back to My Tuitions
        </Link>

        <div className="mb-7 rounded-3xl bg-gradient-to-br from-[#101a31] to-[#243d62] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            MentorLagbe · Tutor Panel
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            Edit Tuition
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Update your tuition information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center gap-2">
              <BookOpen className="text-amber-500" size={21} />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Tuition Information
              </h2>
            </div>

            <div>
              <label className={labelClass}>Tuition Title *</label>
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Class / Grade *
                </label>
                <select
                  required
                  value={form.classLevel}
                  onChange={(e) =>
                    updateField("classLevel", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select class</option>
                  {[
                    "Play",
                    "Nursery",
                    "KG",
                    "Class 1",
                    "Class 2",
                    "Class 3",
                    "Class 4",
                    "Class 5",
                    "Class 6",
                    "Class 7",
                    "Class 8",
                    "Class 9",
                    "Class 10",
                    "SSC",
                    "Class 11",
                    "Class 12",
                    "HSC",
                    "Admission",
                    "University",
                    "Other",
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Medium</label>
                <select
                  value={form.medium}
                  onChange={(e) =>
                    updateField("medium", e.target.value)
                  }
                  className={inputClass}
                >
                  <option>Bangla Medium</option>
                  <option>English Version</option>
                  <option>English Medium</option>
                  <option>Madrasa</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Subjects * (Separate with commas)
              </label>
              <input
                required
                value={form.subjects}
                onChange={(e) =>
                  updateField("subjects", e.target.value)
                }
                placeholder="Bangla, English, Mathematics"
                className={inputClass}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500" size={21} />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Location
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  City / District *
                </label>
                <input
                  required
                  value={form.location}
                  onChange={(e) =>
                    updateField("location", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Area / Address *
                </label>
                <input
                  required
                  value={form.area}
                  onChange={(e) =>
                    updateField("area", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tuition Type</label>
              <select
                value={form.tuitionType}
                onChange={(e) =>
                  updateField("tuitionType", e.target.value)
                }
                className={inputClass}
              >
                <option>Home</option>
                <option>Online</option>
                <option>Both</option>
              </select>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center gap-2">
              <Wallet className="text-emerald-500" size={21} />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Salary & Contact
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Monthly Salary (৳) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.salary}
                  onChange={(e) =>
                    updateField("salary", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Negotiable?
                </label>
                <select
                  value={form.negotiable}
                  onChange={(e) =>
                    updateField("negotiable", e.target.value)
                  }
                  className={inputClass}
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Contact Number *
                </label>
                <input
                  required
                  type="tel"
                  value={form.contactNumber}
                  onChange={(e) =>
                    updateField("contactNumber", e.target.value)
                  }
                  placeholder="01XXXXXXXXX"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Description (Optional)
              </label>
              <textarea
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Tuition
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
