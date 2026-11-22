
"use client";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  GraduationCap,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ClipboardList,
  Search,
  MapPin,
  Wallet,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";

/* =====================================================
   TYPES
===================================================== */

type Tuition = {
  _id: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  medium?: string;
  location?: string;
  salary?: number | string;
  schedule?: string;
  status?: string;
  tutorName?: string;
  tutor?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
};

type Application = {
  _id: string;
  tuitionTitle?: string;
  studentName?: string;
  studentEmail?: string;
  subject?: string;
  status?: string;
  createdAt?: string;
};

type Payment = {
  _id: string;
  userId?: string;
  name?: string;
  email?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  role?: string;
  plan?: string;
  planName?: string;
  amount?: number;
  total?: number;
  price?: number;
  currency?: string;
  transactionId?: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus?: string;
  status?: string;
  subscriptionStatus?: string;
  refundStatus?: string;
  stripeRefundId?: string;
  refundId?: string;
  refundedAmount?: number;
  paidAt?: string;
  refundedAt?: string;
  rejectedAt?: string;
  createdAt?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  total?: number;
  data?: T[];
  message?: string;
};

type Tab =
  | "overview"
  | "tuitions"
  | "applications"
  | "users"
  | "payments";

type TuitionFilter = "all" | "pending" | "approved" | "rejected";

type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

/* =====================================================
   HELPERS
===================================================== */

const formatCurrency = (amount?: number | string) => {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeStatus = (status?: string) =>
  (status || "pending").toLowerCase().trim();

const getStatusStyle = (status?: string) => {
  const value = normalizeStatus(status);

  if (
    ["approved", "accepted", "completed", "paid", "success"].includes(value)
  ) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (
    ["rejected", "cancelled", "canceled", "failed"].includes(value)
  ) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
};

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const getPaymentStatus = (payment: Payment) =>
  payment.paymentStatus || payment.status || "pending";

const getPaymentUserName = (payment: Payment) =>
  payment.userName || payment.name || "Unknown User";

const getPaymentEmail = (payment: Payment) =>
  payment.userEmail || payment.email || "—";

const getPaymentCurrency = (payment: Payment) => {
  const currency = (payment.currency || "usd").toUpperCase();

  return currency === "BDT" ? "BDT" : currency;
};

const formatPaymentAmount = (
  amount?: number,
  currency?: string
) => {
  const value = Number(amount ?? 0);
  const code = (currency || "USD").toUpperCase();

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
};

const getRefundLabel = (status?: string) => {
  const value = (status || "not_refunded").toLowerCase();

  if (value === "succeeded" || value === "refunded") {
    return "Refunded";
  }

  if (value === "pending" || value === "processing") {
    return "Refund Pending";
  }

  if (value === "failed") {
    return "Refund Failed";
  }

  return "Not Refunded";
};

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D9B66F] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <h3 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#101827] sm:text-3xl">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D9B66F]/15 text-[#A77D32] transition group-hover:bg-[#D9B66F]/25">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
        status
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Pending"}
    </span>
  );
}

function SearchBox({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D6B36C] focus:bg-white focus:ring-2 focus:ring-[#D6B36C]/20"
      />
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ClipboardList size={25} />
      </div>

      <h3 className="mt-4 font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

/* =====================================================
   TUITION TABLE
===================================================== */

function TuitionTable({
  items,
  updatingId,
  onUpdateStatus,
  limit,
}: {
  items: Tuition[];
  updatingId: string | null;
  onUpdateStatus: (
    id: string,
    status: "approved" | "rejected"
  ) => void;
  limit?: number;
}) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return (
      <EmptyState
        title="No tuition found"
        description="No tuition records match your search or filter."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {[
              "Tuition details",
              "Tutor",
              "Salary",
              "Status",
              "Posted",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {visibleItems.map((tuition) => {
            const status = normalizeStatus(tuition.status);
            const isUpdating = updatingId === `tuition:${tuition._id}`;

            return (
              <tr key={tuition._id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="max-w-[220px] truncate font-bold text-slate-800">
                    {tuition.title || tuition.subject || "Untitled Tuition"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {tuition.subject || "Subject not specified"}
                    {tuition.classLevel ? ` · ${tuition.classLevel}` : ""}
                  </p>

                  {tuition.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {tuition.location}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {tuition.tutor?.name || tuition.tutorName || "Unknown Tutor"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {tuition.tutor?.email || "—"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm font-bold text-slate-700">
                  {formatCurrency(tuition.salary)}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={tuition.status} />
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(tuition.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onUpdateStatus(tuition._id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onUpdateStatus(tuition._id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        No action available
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   APPLICATION TABLE
===================================================== */

function ApplicationTable({
  items,
  updatingId,
  onUpdateStatus,
  limit,
}: {
  items: Application[];
  updatingId: string | null;
  onUpdateStatus: (
    id: string,
    status: "accepted" | "rejected"
  ) => void;
  limit?: number;
}) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  if (visibleItems.length === 0) {
    return (
      <EmptyState
        title="No applications found"
        description="Applications will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {["Student", "Tuition", "Status", "Applied", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {visibleItems.map((application) => {
            const status = normalizeStatus(application.status);
            const isUpdating =
              updatingId === `application:${application._id}`;

            return (
              <tr key={application._id} className="hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-800">
                    {application.studentName || "Unknown Student"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {application.studentEmail || "—"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {application.tuitionTitle ||
                      application.subject ||
                      "Tuition Application"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={application.status} />
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(application.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            onUpdateStatus(application._id, "accepted")
                          }
                          className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {isUpdating ? "Updating..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            onUpdateStatus(application._id, "rejected")
                          }
                          className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No action available
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   USERS TABLE
===================================================== */

function UsersTable({ items }: { items: AdminUser[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="No registered users match your search."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {["User", "Email", "Role", "Joined"].map((heading) => (
              <th
                key={heading}
                className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.map((adminUser) => (
            <tr key={adminUser._id} className="hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101827] text-xs font-bold text-[#E8CA89]">
                    {getInitials(adminUser.name)}
                  </div>
                  <span className="font-semibold text-slate-800">
                    {adminUser.name || "Unnamed User"}
                  </span>
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-slate-500">
                {adminUser.email || "—"}
              </td>

              <td className="px-5 py-4">
                <span className="rounded-full bg-[#F7F0DF] px-3 py-1 text-xs font-bold capitalize text-[#8B6A2F]">
                  {adminUser.role || "user"}
                </span>
              </td>

              <td className="px-5 py-4 text-sm text-slate-500">
                {formatDate(adminUser.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   PAYMENTS TABLE
===================================================== */

function PaymentsTable({
  items,
  rejectingId,
  onReject,
}: {
  items: Payment[];
  rejectingId: string | null;
  onReject: (payment: Payment) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No payments found"
        description="No Stripe payment records match your search."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {[
              "Customer",
              "Plan",
              "Amount",
              "Payment",
              "Subscription",
              "Refund",
              "Transaction ID",
              "Date",
              "Action",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.map((payment) => {
            const paymentStatus = getPaymentStatus(payment);
            const refundStatus = (
              payment.refundStatus || "not_refunded"
            ).toLowerCase();

            const isRefunded = [
              "succeeded",
              "refunded",
            ].includes(refundStatus);

            const isRejecting = rejectingId === payment._id;

            const isPaid = [
              "paid",
              "succeeded",
              "success",
              "completed",
            ].includes(paymentStatus.toLowerCase());

            const canRefund =
              isPaid &&
              !isRefunded &&
              Boolean(payment.stripeSubscriptionId) &&
              Boolean(
                payment.stripePaymentIntentId ||
                payment.transactionId
              );

            return (
              <tr
                key={payment._id}
                className="transition hover:bg-slate-50/80"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-800">
                    {getPaymentUserName(payment)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {getPaymentEmail(payment)}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold capitalize text-slate-600">
                    {payment.userRole || payment.role || "User"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-slate-800">
                    {payment.planName || payment.plan || "Pro Plan"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-extrabold text-slate-800">
                    {formatPaymentAmount(
                      payment.amount ?? payment.total ?? payment.price,
                      getPaymentCurrency(payment)
                    )}
                  </p>

                  {typeof payment.refundedAmount === "number" &&
                    payment.refundedAmount > 0 && (
                      <p className="mt-1 text-xs text-rose-600">
                        Refunded:{" "}
                        {formatPaymentAmount(
                          payment.refundedAmount,
                          getPaymentCurrency(payment)
                        )}
                      </p>
                    )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={paymentStatus} />
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    status={
                      payment.subscriptionStatus ||
                      (isRefunded ? "canceled" : "active")
                    }
                  />
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={getRefundLabel(refundStatus)} />

                  {payment.refundedAt && (
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(payment.refundedAt)}
                    </p>
                  )}

                  {payment.stripeRefundId && (
                    <p
                      className="mt-1 max-w-[130px] truncate font-mono text-[10px] text-slate-400"
                      title={payment.stripeRefundId}
                    >
                      {payment.stripeRefundId}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <p
                    className="max-w-[160px] truncate font-mono text-xs text-slate-500"
                    title={
                      payment.transactionId ||
                      payment.stripePaymentIntentId ||
                      "Unavailable"
                    }
                  >
                    {payment.transactionId ||
                      payment.stripePaymentIntentId ||
                      "Unavailable"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(payment.paidAt || payment.createdAt)}
                </td>

                <td className="px-5 py-4">
                  {isRefunded ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Refunded
                    </span>
                  ) : canRefund ? (
                    <button
                      type="button"
                      disabled={isRejecting}
                      onClick={() => onReject(payment)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRejecting ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle size={14} />
                      )}

                      {isRejecting ? "Processing..." : "Reject & Refund"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Not available
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
/* =====================================================
   MAIN ADMIN DASHBOARD
===================================================== */

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tuitionFilter, setTuitionFilter] =
    useState<TuitionFilter>("all");

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rejectingPaymentId, setRejectingPaymentId] =
  useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* LOAD DATA */

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const results = await Promise.allSettled([
        axiosInstance.get<ApiResponse<Tuition>>("/api/admin/tuitions"),
        axiosInstance.get<ApiResponse<AdminUser>>("/api/admin/users"),
        axiosInstance.get<ApiResponse<Application>>(
          "/api/admin/applications"
        ),
        axiosInstance.get<ApiResponse<Payment>>("/api/admin/payments"),
      ]);

      const failedSections: string[] = [];

      if (results[0].status === "fulfilled") {
        const data = results[0].value.data?.data;
        setTuitions(Array.isArray(data) ? data : []);
      } else {
        failedSections.push("Tuitions");
      }

      if (results[1].status === "fulfilled") {
        const data = results[1].value.data?.data;
        setUsers(Array.isArray(data) ? data : []);
      } else {
        failedSections.push("Users");
      }

      if (results[2].status === "fulfilled") {
        const data = results[2].value.data?.data;
        setApplications(Array.isArray(data) ? data : []);
      } else {
        failedSections.push("Applications");
      }

      if (results[3].status === "fulfilled") {
        const data = results[3].value.data?.data;
        setPayments(Array.isArray(data) ? data : []);
      } else {
        failedSections.push("Payments");
      }

      if (failedSections.length > 0) {
        setError(
          `Unable to load: ${failedSections.join(
            ", "
          )}. Please check your API connection and admin permissions.`
        );
      }
    } catch {
      setError("Something went wrong while loading admin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return;

    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authLoading, isAuthenticated, isAdmin, loadDashboard]);

  /* STATISTICS */

  const pendingTuitions = useMemo(
    () =>
      tuitions.filter(
        (tuition) => normalizeStatus(tuition.status) === "pending"
      ),
    [tuitions]
  );

  const approvedTuitions = useMemo(
    () =>
      tuitions.filter(
        (tuition) => normalizeStatus(tuition.status) === "approved"
      ),
    [tuitions]
  );

  const rejectedTuitions = useMemo(
    () =>
      tuitions.filter(
        (tuition) => normalizeStatus(tuition.status) === "rejected"
      ),
    [tuitions]
  );

  const pendingApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          normalizeStatus(application.status) === "pending"
      ),
    [applications]
  );

  const acceptedApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          normalizeStatus(application.status) === "accepted"
      ),
    [applications]
  );

  const totalPaymentAmount = useMemo(
    () =>
      payments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount ?? payment.total ?? payment.price ?? 0),
        0
      ),
    [payments]
  );

  /* SEARCH AND FILTERS */

  const filteredTuitions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return tuitions.filter((tuition) => {
      const status = normalizeStatus(tuition.status);
      const matchesFilter =
        tuitionFilter === "all" || status === tuitionFilter;

      const matchesSearch = [
        tuition.title,
        tuition.subject,
        tuition.classLevel,
        tuition.medium,
        tuition.location,
        tuition.tutorName,
        tuition.tutor?.name,
        tuition.tutor?.email,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        );

      return matchesFilter && matchesSearch;
    });
  }, [tuitions, tuitionFilter, searchTerm]);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return applications.filter((application) =>
      [
        application.studentName,
        application.studentEmail,
        application.tuitionTitle,
        application.subject,
        application.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [applications, searchTerm]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return users.filter((adminUser) =>
      [adminUser.name, adminUser.email, adminUser.role]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [users, searchTerm]);

  const filteredPayments = useMemo(() => {
  const search = searchTerm.toLowerCase().trim();

  return payments.filter((payment) =>
    [
      payment._id,
      payment.name,
      payment.userName,
      payment.email,
      payment.userEmail,
      payment.userRole,
      payment.plan,
      payment.planName,
      payment.status,
      payment.paymentStatus,
      payment.subscriptionStatus,
      payment.refundStatus,
      payment.transactionId,
      payment.stripePaymentIntentId,
      payment.stripeSubscriptionId,
      payment.stripeRefundId,
      payment.amount,
      payment.currency,
    ]
      .filter((value) => value !== undefined && value !== null)
      .some((value) =>
        String(value).toLowerCase().includes(search)
      )
  );
}, [payments, searchTerm]);

  /* UPDATE TUITION */

  const updateTuitionStatus = async (
  tuitionId: string,
  status: "approved" | "rejected"
) => {
  const tuition = tuitions.find((item) => item._id === tuitionId);

  if (!tuition) {
    toast.error("Tuition record not found.");
    return;
  }

  const action = status === "approved" ? "approve" : "reject";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this tuition?`
  );

  if (!confirmed) return;

  setUpdatingId(`tuition:${tuitionId}`);
  setError("");
  setNotice("");

  const toastId = toast.loading(
    status === "approved"
      ? "Approving tuition..."
      : "Rejecting tuition..."
  );

  try {
    const response = await axiosInstance.patch(
      `/api/admin/tuitions/${tuitionId}/status`,
      { status }
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data?.message || "Unable to update tuition."
      );
    }

    toast.success(
      status === "approved"
        ? "Tuition approved successfully!"
        : "Tuition rejected successfully!",
      { id: toastId }
    );

    await loadDashboard(true);
  } catch (err: unknown) {
    const message = getApiErrorMessage(
      err,
      "Unable to update tuition status."
    );

    toast.error(message, { id: toastId });
  } finally {
    setUpdatingId(null);
  }
};

  /* UPDATE APPLICATION */

  /* UPDATE APPLICATION */

const updateApplicationStatus = async (
  applicationId: string,
  status: "accepted" | "rejected"
) => {
  const application = applications.find(
    (item) => item._id === applicationId
  );

  if (!application) {
    toast.error("Application record not found.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to ${status} this application?`
  );

  if (!confirmed) return;

  setUpdatingId(`application:${applicationId}`);
  setError("");
  setNotice("");

  const toastId = toast.loading(
    status === "accepted"
      ? "Accepting application..."
      : "Rejecting application..."
  );

  try {
    const response = await axiosInstance.patch(
      `/api/admin/applications/${applicationId}/status`,
      { status }
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data?.message || "Unable to update application."
      );
    }

    toast.success(
      status === "accepted"
        ? "Application accepted successfully!"
        : "Application rejected successfully!",
      { id: toastId }
    );

    await loadDashboard(true);
  } catch (err: unknown) {
    const message = getApiErrorMessage(
      err,
      "Unable to update application status."
    );

    toast.error(message, { id: toastId });
  } finally {
    setUpdatingId(null);
  }
};


const rejectAndRefundPayment = async (payment: Payment) => {
  if (!payment._id) {
    toast.error("Payment ID is missing.");
    return;
  }

  const confirmed = window.confirm(
    `Reject ${getPaymentUserName(payment)}'s ${payment.planName || "Pro"} subscription and refund the initial payment?`
  );

  if (!confirmed) return;

  setRejectingPaymentId(payment._id);

  const toastId = toast.loading(
    "Canceling subscription and processing refund..."
  );

  try {
    // This endpoint is from the payment.routes.ts version
    // previously shared in our conversation.
    const response = await axiosInstance.post(
      `/api/payments/admin/${payment._id}/reject`
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          "Unable to reject and refund this payment."
      );
    }

    toast.success(
      response.data?.message ||
        "Subscription cancellation and refund request completed.",
      { id: toastId }
    );

    await loadDashboard(true);
  } catch (error: unknown) {
    toast.error(
      getApiErrorMessage(
        error,
        "Unable to process the refund. Please check the payment record."
      ),
      { id: toastId }
    );
  } finally {
    setRejectingPaymentId(null);
  }
};

  /* NAVIGATION */

  const navigation: {
    id: Tab;
    label: string;
    icon: LucideIcon;
  }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tuitions", label: "Tuition Management", icon: BookOpen },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "users", label: "Users", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
  ];

  const managementLinks = [
    {
      label: "Manage Tuitions",
      href: "/dashboard/admin/tuitions",
      icon: BookOpen,
    },
    {
      label: "Manage Applications",
      href: "/dashboard/admin/applications",
      icon: ClipboardList,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Manage Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
  ];

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setMobileMenuOpen(false);
  };

  /* AUTHENTICATION */

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#B58A39]" />
          <p className="mt-4 text-sm text-slate-500">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9B66F]/15 text-[#B58A39]">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[#101827]">
            Admin Access Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            You must sign in with an administrator account to access this
            dashboard.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#101827] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d2a40]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#B58A39]" />
          <p className="mt-4 text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE UI
===================================================== */

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-800">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[265px] flex-col bg-[#0d336c] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6B36C] text-[#101827]">
                <GraduationCap size={23} />
              </div>

              <div>
                <p className="text-lg font-extrabold tracking-tight">
                  Mentor<span className="text-[#D6B36C]">Lagbe</span>
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin workspace
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-8">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Main menu
            </p>

            <nav className="mt-4 space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-[#D6B36C] text-[#152137] shadow-lg"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>

                    {item.id === "tuitions" &&
                      pendingTuitions.length > 0 && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-[#101827] text-[#E8CA89]"
                              : "bg-amber-400/15 text-amber-300"
                          }`}
                        >
                          {pendingTuitions.length}
                        </span>
                      )}

                    {item.id === "applications" &&
                      pendingApplications.length > 0 && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-[#101827] text-[#E8CA89]"
                              : "bg-amber-400/15 text-amber-300"
                          }`}
                        >
                          {pendingApplications.length}
                        </span>
                      )}
                  </button>
                );
              })}
            </nav>

            {/* DEDICATED MANAGEMENT PAGE LINKS */}

            <div className="my-6 border-t border-white/10 pt-5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Dedicated Management Pages
              </p>

              <nav className="mt-3 space-y-1.5">
                {managementLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-[#E8CA89]"
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      <ChevronRight size={15} className="ml-auto" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6B36C]/15 text-sm font-bold text-[#E8CA89]">
                  {getInitials(user?.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-xs text-[#D6B36C]">Administrator</p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] text-slate-600">
              © {new Date().getFullYear()} MentorLagbe
            </p>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  MentorLagbe / Admin
                </p>

                <h1 className="mt-0.5 text-lg font-bold text-[#213457] sm:text-xl">
                  {navigation.find((item) => item.id === activeTab)?.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Admin access active
              </span>

              <button
                type="button"
                onClick={async () => {
  const toastId = toast.loading("Refreshing dashboard...");

  try {
    await loadDashboard(true);
    toast.success("Dashboard refreshed successfully!", {
      id: toastId,
    });
  } catch {
    toast.error("Unable to refresh dashboard.", {
      id: toastId,
    });
  }
}}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#D6B36C] hover:text-[#8B6A2F] disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </header>

          <div className="w-full max-w-none space-y-7 px-5 py-6 sm:px-7 lg:px-9">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1">{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* OVERVIEW */}

            {activeTab === "overview" && (
              <>
                <section className="relative overflow-hidden rounded-3xl bg-[#101827] p-7 text-white shadow-xl sm:p-9">
                  <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-[#D6B36C]/10" />
                  <div className="pointer-events-none absolute -bottom-28 right-48 h-56 w-56 rounded-full bg-[#D6B36C]/10 blur-3xl" />

                  <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#D6B36C]/30 bg-[#D6B36C]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8CA89]">
                        <ShieldCheck size={14} />
                        Administration panel
                      </div>

                      <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Welcome back,{" "}
                        <span className="text-[#E8CA89]">
                          {user?.name?.split(" ")[0] || "Admin"}
                        </span>
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                        Manage tuition requests, review applications, monitor
                        registered users and keep your platform running
                        smoothly.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => changeTab("tuitions")}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D6B36C] px-5 py-3 text-sm font-bold text-[#101827] shadow-lg transition hover:bg-[#E8CA89]"
                      >
                        Review Tuitions
                        <ArrowUpRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => changeTab("applications")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#D6B36C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E8CA89]"
                      >
                        Applications
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-[#101827]">
                      Platform overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Live information retrieved from your database.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Total Users"
                      value={users.length}
                      description="Registered platform accounts"
                      icon={Users}
                    />
                    <StatCard
                      label="Tuition Listings"
                      value={tuitions.length}
                      description="All submitted tuition posts"
                      icon={BookOpen}
                    />
                    <StatCard
                      label="Pending Reviews"
                      value={pendingTuitions.length}
                      description="Waiting for admin approval"
                      icon={Clock3}
                    />
                    <StatCard
                      label="Applications"
                      value={applications.length}
                      description={`${pendingApplications.length} pending applications`}
                      icon={ClipboardList}
                    />
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard
                    label="Approved Tuitions"
                    value={approvedTuitions.length}
                    description="Successfully approved listings"
                    icon={CheckCircle2}
                  />
                  <StatCard
                    label="Rejected Tuitions"
                    value={rejectedTuitions.length}
                    description="Rejected tuition requests"
                    icon={XCircle}
                  />
                  <StatCard
                    label="Payment Records"
                    value={payments.length}
                    description={`Recorded amount: ${formatCurrency(totalPaymentAmount)}`}
                    icon={Wallet}
                  />
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-bold text-[#101827]">
                        Pending tuition approvals
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Review newly submitted tuition requests.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => changeTab("tuitions")}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#9A783E] hover:text-[#6F5325]"
                    >
                      View all tuitions
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <TuitionTable
                    items={pendingTuitions}
                    updatingId={updatingId}
                    onUpdateStatus={updateTuitionStatus}
                    limit={5}
                  />
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-bold text-[#101827]">
                        Recent applications
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Latest student applications.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => changeTab("applications")}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#9A783E] hover:text-[#6F5325]"
                    >
                      View applications
                      <ArrowUpRight size={16} />
                    </button>
                  </div>

                  <ApplicationTable
                    items={applications}
                    updatingId={updatingId}
                    onUpdateStatus={updateApplicationStatus}
                    limit={5}
                  />
                </section>
              </>
            )}

            {/* TUITION MANAGEMENT */}

            {activeTab === "tuitions" && (
              <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A77D32]">
                      Manage listings
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#101827]">
                      Tuition Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review, approve and reject tuition submissions.
                    </p>
                  </div>

                  <SearchBox
                    placeholder="Search tuition, tutor, location..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["all", "All Tuitions", tuitions.length],
                      ["pending", "Pending", pendingTuitions.length],
                      ["approved", "Approved", approvedTuitions.length],
                      ["rejected", "Rejected", rejectedTuitions.length],
                    ] as [TuitionFilter, string, number][]
                  ).map(([filter, label, count]) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTuitionFilter(filter)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        tuitionFilter === filter
                          ? "border-[#D6B36C] bg-[#101827] text-white shadow-lg"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#D6B36C]"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          tuitionFilter === filter
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold">{count}</p>
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                    <div>
                      <h3 className="font-bold text-[#101827]">
                        {tuitionFilter === "all"
                          ? "All tuition requests"
                          : `${tuitionFilter} tuitions`}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {filteredTuitions.length} result(s)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTuitionFilter("all");
                        setSearchTerm("");
                      }}
                      className="text-xs font-bold text-[#9A783E] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>

                  <TuitionTable
                    items={filteredTuitions}
                    updatingId={updatingId}
                    onUpdateStatus={updateTuitionStatus}
                  />
                </div>
              </section>
            )}

            {/* APPLICATION MANAGEMENT */}

            {activeTab === "applications" && (
              <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A77D32]">
                      Student requests
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#101827]">
                      Application Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review applications and update their status.
                    </p>
                  </div>

                  <SearchBox
                    placeholder="Search student or tuition..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Total Applications"
                    value={applications.length}
                    description="All submitted applications"
                    icon={ClipboardList}
                  />
                  <StatCard
                    label="Pending"
                    value={pendingApplications.length}
                    description="Waiting for review"
                    icon={Clock3}
                  />
                  <StatCard
                    label="Accepted"
                    value={acceptedApplications.length}
                    description="Accepted applications"
                    icon={CheckCircle2}
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <h3 className="font-bold text-[#101827]">
                      All applications
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {filteredApplications.length} result(s)
                    </p>
                  </div>

                  <ApplicationTable
                    items={filteredApplications}
                    updatingId={updatingId}
                    onUpdateStatus={updateApplicationStatus}
                  />
                </div>
              </section>
            )}

            {/* USERS */}

            {activeTab === "users" && (
              <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A77D32]">
                      Platform accounts
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#101827]">
                      User Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      View all registered students, tutors and admins.
                    </p>
                  </div>

                  <SearchBox
                    placeholder="Search customer, email, plan or transaction..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Total Users"
                    value={users.length}
                    description="All registered accounts"
                    icon={Users}
                  />
                  <StatCard
                    label="Registered Tutors"
                    value={
                      users.filter(
                        (adminUser) =>
                          normalizeStatus(adminUser.role) === "tutor"
                      ).length
                    }
                    description="Tutor accounts"
                    icon={GraduationCap}
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <h3 className="font-bold text-[#101827]">
                      Registered users
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {filteredUsers.length} user(s)
                    </p>
                  </div>

                  <UsersTable items={filteredUsers} />
                </div>
              </section>
            )}

            {/* PAYMENTS */}

            {activeTab === "payments" && (
              <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A77D32]">
                      Financial records
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#101827]">
                      Payment Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Review payment records stored in your database.
                    </p>
                  </div>

                  <SearchBox
                    placeholder="Search payment ID or status..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Payment Records"
                    value={payments.length}
                    description="Total recorded payments"
                    icon={CreditCard}
                  />
                  <StatCard
                    label="Recorded Amount"
                    value={formatCurrency(totalPaymentAmount)}
                    description="Sum of available amount fields"
                    icon={Wallet}
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <h3 className="font-bold text-[#101827]">
                      Payment history
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {filteredPayments.length} payment record(s)
                    </p>
                  </div>

                  <PaymentsTable
  items={filteredPayments}
  rejectingId={rejectingPaymentId}
  onReject={rejectAndRefundPayment}
/>
                </div>

                <p className="text-xs leading-5 text-slate-400">
                  Note: The amount shown is the sum of the amount fields
                  returned by your API. It should not be treated as confirmed
                  revenue unless your payment records distinguish successful
                  transactions.
                </p>
              </section>
            )}

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center">
              <p>
                © {new Date().getFullYear()} MentorLagbe. Admin Dashboard.
              </p>
              <p className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#B18B4B]" />
                Secure administration workspace
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
