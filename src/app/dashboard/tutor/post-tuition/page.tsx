
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Wallet,
  FileText,
  Loader2,
  Plus,
  X,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Phone,
  ImagePlus,
  Trash2,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

const SUBJECTS = [
  "Bangla",
  "English",
  "Mathematics",
  "Higher Mathematics",
  "General Science",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Accounting",
  "Finance & Banking",
  "Economics",
  "Business Studies",
  "General Knowledge",
  "Islamic Studies",
  "Arabic",
  "All Subjects",
];

const CLASSES = [
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
];

const initialForm = {
  title: "",
  classLevel: "",
  subjects: [] as string[],
  medium: "Bangla Medium",
  location: "",
  area: "",
  salary: "",
  negotiable: "Yes",
  mode: "Offline",
  daysPerWeek: "3",
  contactNumber: "",
  description: "",
};

export default function PostTuitionPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isTutor,
    isAdmin,
  } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [customSubject, setCustomSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200";

  const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-950";

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const updateField = (
    field: keyof typeof initialForm,
    value: string | string[]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleSubject = (subject: string) => {
    setForm((previous) => ({
      ...previous,
      subjects: previous.subjects.includes(subject)
        ? previous.subjects.filter((item) => item !== subject)
        : [...previous.subjects, subject],
    }));
  };

  const addCustomSubject = () => {
    const subject = customSubject.trim();

    if (!subject) {
      toast.error("Enter a subject name");
      return;
    }

    if (
      form.subjects.some(
        (item) => item.toLowerCase() === subject.toLowerCase()
      )
    ) {
      toast.error("This subject is already selected");
      return;
    }

    setForm((previous) => ({
      ...previous,
      subjects: [...previous.subjects, subject],
    }));

    setCustomSubject("");
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  
const uploadTuitionImage = async (): Promise<string> => {
  if (!imageFile) return "";

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      "ImgBB API key is missing. Check frontend .env.local file."
    );

    throw new Error(
      "ImgBB API key is missing. Check your frontend .env.local file and restart Next.js."
    );
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error(
      result.error?.message || "Unable to upload tuition image"
    );
  }

  return result.data.url;
};


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated || !isTutor) {
      toast.error("Please login with a tutor account");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please enter a tuition title");
      return;
    }

    if (!form.classLevel) {
      toast.error("Please select a class");
      return;
    }

    if (form.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (!form.location.trim() || !form.area.trim()) {
      toast.error("Please provide your tuition location");
      return;
    }

    const salary = Number(form.salary);

    if (!form.salary || !Number.isFinite(salary) || salary <= 0) {
      toast.error("Please enter a valid monthly salary");
      return;
    }

    const daysPerWeek = Number(form.daysPerWeek);

    if (
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      toast.error("Please select valid days per week");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please provide a tuition description");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Your login session has expired. Please login again.");
      return;
    }

    setSubmitting(true);

    try {
      toast.loading("Uploading tuition image...", {
        id: "tuition-submit",
      });

      const bannerImage = await uploadTuitionImage();

      const payload = {
        title: form.title.trim(),
        subject: form.subjects.join(", "),
        classLevel: form.classLevel,
        location: `${form.area.trim()}, ${form.location.trim()}`,
        monthlyFee: salary,
        mode: form.mode,
        daysPerWeek,
        bannerImage,
        description: form.description.trim(),
      };

      const response = await axiosInstance.post(
        "/api/tuitions",
        payload
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to submit tuition"
        );
      }

      toast.success(
        "Tuition submitted successfully! Waiting for admin approval.",
        { id: "tuition-submit" }
      );

      setForm(initialForm);
      setCustomSubject("");
      setImageFile(null);
      setImagePreview("");

      router.push("/dashboard/tutor");
      router.refresh();
    } catch (error: unknown) {
      console.error("Post tuition error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message, { id: "tuition-submit" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-amber-500" size={36} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-4 text-amber-500" size={42} />

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Login Required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please login to your tutor account before posting a tuition.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (!isTutor || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={42} />

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Only tutor accounts can create tuition posts.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-bold text-white dark:bg-amber-500 dark:text-slate-950"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/tutor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#101a31] via-[#172747] to-[#243d62] p-6 text-white sm:p-9">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
            <GraduationCap size={27} />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            MentorLagbe · Tutor Panel
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Post a New Tuition
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Welcome {user?.name || "Tutor"}. Share a few details to connect
            with suitable students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <BookOpen className="text-amber-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Basic Information
                </h2>

                <p className="text-xs text-slate-500">
                  Essential details about the tuition
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Tuition Title *</label>

                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Need a tutor for Class 9"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Class / Grade *</label>

                  <select
                    required
                    value={form.classLevel}
                    onChange={(e) =>
                      updateField("classLevel", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select class</option>

                    {CLASSES.map((item) => (
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
                    onChange={(e) => updateField("medium", e.target.value)}
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
                <label className={labelClass}>Subjects *</label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SUBJECTS.map((subject) => {
                    const selected = form.subjects.includes(subject);

                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          selected
                            ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
                            : "border-slate-200 text-slate-600 hover:border-amber-400 dark:border-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {subject}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Add another subject (optional)"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={addCustomSubject}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white dark:bg-amber-400 dark:text-slate-950"
                  >
                    <Plus size={17} />
                    Add
                  </button>
                </div>

                {form.subjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:bg-amber-400/10 dark:text-amber-300"
                      >
                        {subject}

                        <button
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          aria-label={`Remove ${subject}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <MapPin className="text-blue-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Location Details
                </h2>

                <p className="text-xs text-slate-500">
                  Where will the tuition take place?
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>City / District *</label>

                <input
                  required
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Dhaka"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Area / Address *</label>

                <input
                  required
                  value={form.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  placeholder="e.g. Uttara, Sector 7"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tuition Mode *</label>

                <select
                  required
                  value={form.mode}
                  onChange={(e) => updateField("mode", e.target.value)}
                  className={inputClass}
                >
                  <option value="Offline">Offline / Home Tuition</option>
                  <option value="Online">Online Tuition</option>
                </select>
              </div>
            </div>
          </section>

          {/* SCHEDULE */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays className="text-purple-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Schedule Details
                </h2>

                <p className="text-xs text-slate-500">
                  Choose how many days per week
                </p>
              </div>
            </div>

            <div className="max-w-sm">
              <label className={labelClass}>Days Per Week *</label>

              <select
                required
                value={form.daysPerWeek}
                onChange={(e) =>
                  updateField("daysPerWeek", e.target.value)
                }
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} {day === 1 ? "Day" : "Days"} per week
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* SALARY */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <Wallet className="text-emerald-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Salary Details
                </h2>

                <p className="text-xs text-slate-500">
                  Set your monthly budget
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Monthly Salary (৳) *</label>

                <input
                  required
                  type="number"
                  min="1"
                  value={form.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                  placeholder="e.g. 5000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Salary Negotiable?</label>

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
            </div>
          </section>

          {/* CONTACT */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <Phone className="text-indigo-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Contact Information
                </h2>

                <p className="text-xs text-slate-500">
                  Contact details for the tuition
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Contact Number *</label>

              <input
                required
                type="tel"
                value={form.contactNumber}
                onChange={(e) =>
                  updateField("contactNumber", e.target.value)
                }
                placeholder="01XXXXXXXXX"
                pattern="01[0-9]{9}"
                title="Enter a valid 11-digit Bangladesh mobile number"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter your 11-digit Bangladesh mobile number.
              </p>
            </div>
          </section>

          {/* IMAGE UPLOAD */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <ImagePlus className="text-amber-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Tuition Banner Image
                </h2>

                <p className="text-xs text-slate-500">
                  Optional · JPG, PNG or WebP · Maximum 5 MB
                </p>
              </div>
            </div>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Tuition banner preview"
                  className="h-56 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  <Trash2 size={15} />
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
                <ImagePlus size={34} className="mb-3 text-amber-500" />

                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  Click to upload an image
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Maximum image size: 5 MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* DESCRIPTION */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <FileText className="text-rose-500" size={24} />

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Additional Information
                </h2>

                <p className="text-xs text-slate-500">
                  Explain the tuition requirements
                </p>
              </div>
            </div>

            <label className={labelClass}>Description *</label>

            <textarea
              required
              rows={5}
              maxLength={2000}
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Describe the tuition requirements, student needs, preferred schedule and other important details..."
              className={inputClass}
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {form.description.length}/2000 characters
            </p>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/dashboard/tutor"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Publish Tuition
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
