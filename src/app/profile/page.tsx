
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";

import axiosInstance from "@/lib/axios";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [image, setImage] = useState("");
  const [imageData, setImageData] = useState("");
  const [imageRemoved, setImageRemoved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  // Load existing profile.
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setMessage("Please sign in to view your profile.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/api/profile/me");
        const profile: ProfileData = response.data?.data;

        if (!profile) {
          throw new Error("Unable to load profile information.");
        }

        if (active) {
          setName(profile.name || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
          setAddress(profile.address || "");
          setImage(profile.image || "");
        }
      } catch (error) {
        if (active) {
          const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message ||
              "Failed to load profile. Please sign in again."
            : error instanceof Error
              ? error.message
              : "Failed to load profile.";

          setMessage(errorMessage);
          setMessageType("error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Select and preview profile image.
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WEBP image.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Image size must be less than 8 MB.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageData(reader.result);
        setImageRemoved(false);
        setMessage("Image selected. Save your profile to upload it.");
        setMessageType("success");
      }
    };

    reader.onerror = () => {
      setMessage("Unable to read this image. Please try again.");
      setMessageType("error");
    };

    reader.readAsDataURL(file);
  }

  // Remove selected or saved profile image.
  function handleRemoveImage() {
    setImage("");
    setImageData("");
    setImageRemoved(true);
    setMessage("Image removed. Save your profile to confirm.");
    setMessageType("success");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Save profile and upload image when selected.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Full name is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      let updatedImage = image;

      // Upload selected image to ImgBB.
      if (imageData) {
        setMessage("Uploading profile image...");
        setMessageType("success");

        const uploadResponse = await axiosInstance.post(
          "/api/uploads/image",
          { image: imageData }
        );

        updatedImage = uploadResponse.data?.data?.url;

        if (!updatedImage) {
          throw new Error("Image upload failed. Please try again.");
        }
      }

      // Update profile information in MongoDB.
      const profilePayload: {
        name: string;
        phone: string;
        address: string;
        image?: string;
      } = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (imageData || imageRemoved) {
        profilePayload.image = imageRemoved ? "" : updatedImage;
      }

      const response = await axiosInstance.patch(
        "/api/profile/me",
        profilePayload
      );

      const updatedProfile: ProfileData = response.data?.data;

      if (updatedProfile) {
        setName(updatedProfile.name || "");
        setEmail(updatedProfile.email || email);
        setPhone(updatedProfile.phone || "");
        setAddress(updatedProfile.address || "");
        setImage(updatedProfile.image || "");
      } else if (imageData) {
        setImage(updatedImage);
      }

      setImageData("");
      setImageRemoved(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(
        response.data?.message || "Profile updated successfully!"
      );
      setMessageType("success");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "Unable to save profile. Please try again."
        : error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const previewImage = imageData || image;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={35}
            className="animate-spin text-[#B58A39]"
          />
          <p className="text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <section className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101F32] text-[#D9B66F]">
              <UserRound size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your personal information.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Image */}
            <div className="flex flex-col items-center border-b border-border pb-7">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#D9B66F]/40 bg-[#101F32] text-[#D9B66F]">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={55} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  aria-label="Change profile image"
                  className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-card bg-[#D9B66F] text-[#101F32] transition hover:bg-[#c6a052] disabled:opacity-50"
                >
                  <Camera size={18} />
                </button>

                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    aria-label="Remove profile image"
                    className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-red-500 text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <h2 className="mt-4 text-base font-bold">
                Profile Picture
              </h2>

              <p className="mt-1 text-center text-xs text-muted-foreground">
                JPG, PNG or WEBP · Maximum 8 MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#D9B66F] px-4 py-2 text-sm font-bold text-[#B58A39] transition hover:bg-[#D9B66F]/10 disabled:opacity-50"
              >
                <Camera size={16} />
                {previewImage ? "Change Photo" : "Upload Photo"}
              </button>
            </div>

            {/* Full Name */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Full Name
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <UserRound
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  required
                  minLength={2}
                  maxLength={60}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            {/* Email */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Email Address
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4">
                <Mail
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  readOnly
                  type="email"
                  value={email}
                  placeholder="Email address"
                  className="h-12 w-full cursor-not-allowed bg-transparent text-sm outline-none"
                />
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Email address cannot be changed here.
              </span>
            </label>

            {/* Phone */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Phone Number
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <Phone
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  maxLength={20}
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            {/* Address */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                Address
              </span>

              <span className="flex items-center gap-3 rounded-xl border border-border px-4">
                <MapPin
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Your location"
                  maxLength={200}
                  className="h-12 w-full bg-transparent text-sm outline-none"
                />
              </span>
            </label>

            {/* Success / Error Message */}
            {message && (
              <div
                role="alert"
                className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                  messageType === "success"
                    ? "bg-green-500/10 text-green-700"
                    : "bg-red-500/10 text-red-600"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                )}

                <span>{message}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving || !email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101F32] py-3.5 text-sm font-bold text-white transition hover:bg-[#1c3552] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
