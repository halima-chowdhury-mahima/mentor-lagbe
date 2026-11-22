
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  BookOpen,
  MapPin,
  Wallet,
  ImagePlus,
  X,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mentorlagbe-server-alpha.vercel.app"
).replace(/\/+$/, "");

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

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
  bannerImage?: string;
};

type TuitionListResponse = {
  success?: boolean;
  message?: string;
  data?:
    | Tuition[]
    | {
        tuitions?: Tuition[];
      };
  tuitions?: Tuition[];
};

type UpdateResponse = {
  success?: boolean;
  message?: string;
};

type ImgBBResponse = {
  success?: boolean;
  data?: {
    url?: string;
    display_url?: string;
  };
  error?: {
    message?: string;
  };
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

function getItems(
  result: TuitionListResponse | Tuition[]
): Tuition[] {
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

  // Image states
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200";

  // Clean up temporary image preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load existing tuition
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

        setCurrentImage(tuition.bannerImage || "");
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

  // Select new image
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setImageFile(file);
    setPreviewUrl(objectUrl);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // Cancel selected image
  const handleCancelImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (
    file: File
  ): Promise<string> => {
    if (!IMGBB_API_KEY) {
      throw new Error(
        "ImgBB API key is missing. Check your environment variables."
      );
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result: ImgBBResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message || "Image upload failed."
      );
    }

    const imageUrl =
      result.data?.display_url || result.data?.url;

    if (!imageUrl) {
      throw new Error("Could not get uploaded image URL.");
    }

    return imageUrl;
  };

  // Submit updated tuition
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Please login again.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please enter a tuition title.");
      return;
    }

    if (!form.subjects.trim()) {
      toast.error("Please enter at least one subject.");
      return;
    }

    if (!form.salary || Number(form.salary) <= 0) {
      toast.error("Please enter a valid salary.");
      return;
    }

    setSaving(true);

    try {
      const subjects = form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      // Keep the existing image if no new image is selected
      let bannerImage = currentImage;

      // Upload only when a new image is selected
      if (imageFile) {
        toast.loading("Uploading new image...", {
          id: "tuition-image-upload",
        });

        bannerImage = await uploadImageToImgBB(imageFile);

        toast.dismiss("tuition-image-upload");
      }

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
        bannerImage,
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
          result?.message || "Could not update tuition."
        );
      }

      toast.dismiss("tuition-image-upload");
      toast.success("Tuition updated successfully!");

      router.push("/dashboard/tutor/my-tuitions");
      router.refresh();
    } catch (error) {
      toast.dismiss("tuition-image-upload");

      toast.error(
        error instanceof Error
          ? error.message
          : "Update failed."
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

  const displayedImage = previewUrl || currentImage;

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
            Update your tuition information and post image.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tuition Information */}
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center gap-2">
              <BookOpen className="text-amber-500" size={21} />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Tuition Information
              </h2>
            </div>

            <div>
              <label className={labelClass}>
                Tuition Title *
              </label>

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

          {/* Post Image */}
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center gap-2">
              <ImagePlus className="text-amber-500" size={21} />

              <h2 className="font-bold text-slate-900 dark:text-white">
                Post Image
              </h2>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your current post image is shown below. Select a new
              image if you want to replace it.
            </p>

            {displayedImage ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <div
                  role="img"
                  aria-label="Tuition post image preview"
                  className="h-56 w-full bg-cover bg-center bg-no-repeat sm:h-72"
                  style={{
                    backgroundImage: `url("${displayedImage}")`,
                  }}
                />

                {imageFile && (
                  <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                    New Image Preview
                  </div>
                )}

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleCancelImage}
                    className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                  >
                    <X size={14} />
                    Cancel Change
                  </button>
                )}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                <ImagePlus size={38} />

                <p className="mt-2 text-sm font-medium">
                  No post image available
                </p>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-6 text-center transition hover:border-amber-500 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/20 dark:hover:bg-amber-950/40">
              <Upload className="text-amber-600" size={25} />

              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {imageFile
                  ? "Choose Another Image"
                  : "Change Post Image"}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP · Maximum 5MB
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imageFile && (
              <p className="text-xs font-medium text-emerald-600">
                Selected: {imageFile.name}
              </p>
            )}
          </section>

          {/* Location */}
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
              <label className={labelClass}>
                Tuition Type
              </label>

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

          {/* Salary & Contact */}
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

          {/* Update Button */}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />

                {imageFile
                  ? "Uploading & Updating..."
                  : "Updating..."}
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
