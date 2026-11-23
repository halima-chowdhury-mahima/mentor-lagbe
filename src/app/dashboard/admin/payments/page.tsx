
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  RefreshCw,
  Search,
  Loader2,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RotateCcw,
  Clock3,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

type Payment = {
  _id: string;
  amount?: number;
  currency?: string;
  status?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  refundStatus?: "pending" | "succeeded" | "failed";
  method?: string;
  planName?: string;
  userRole?: string;
  createdAt?: string;
  student?: {
    name?: string;
    email?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
  transactionId?: string;
};

type FilterType = "all" | "pending" | "approved" | "rejected";

type ApiErrorResponse = {
  message?: string;
};

const PAYMENT_LIST_ENDPOINT = "/api/payments/admin/all";

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    return axiosError.response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function getPaymentArray(responseData: unknown): Payment[] {
  if (Array.isArray(responseData)) {
    return responseData as Payment[];
  }

  if (
    typeof responseData === "object" &&
    responseData !== null
  ) {
    const payload = responseData as {
      data?: unknown;
      payments?: unknown;
    };

    if (Array.isArray(payload.data)) {
      return payload.data as Payment[];
    }

    if (Array.isArray(payload.payments)) {
      return payload.payments as Payment[];
    }
  }

  return [];
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  // Load and refresh payments from the correct backend endpoint.
  const fetchPayments = useCallback(
    async (showToast = false): Promise<void> => {
      try {
        const response = await axiosInstance.get(
          PAYMENT_LIST_ENDPOINT
        );

        const data = getPaymentArray(response.data);

        setPayments(data);

        if (showToast) {
          toast.success("Payment records refreshed.");
        }
      } catch (error: unknown) {
        console.error("Payment loading error:", error);

        toast.error(
          getErrorMessage(
            error,
            "Unable to load payment records."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

 useEffect(() => {
  let cancelled = false;

  const loadInitialPayments = async () => {
    try {
      const response = await axiosInstance.get(
        PAYMENT_LIST_ENDPOINT
      );

      const data = getPaymentArray(response.data);

      if (!cancelled) {
        setPayments(data);
      }
    } catch (error: unknown) {
      console.error("Payment loading error:", error);

      if (!cancelled) {
        toast.error(
          getErrorMessage(
            error,
            "Unable to load payment records."
          )
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadInitialPayments();

  return () => {
    cancelled = true;
  };
}, []);
  const handleRefresh = async (): Promise<void> => {
    if (processingId) return;

    setLoading(true);
    await fetchPayments(true);
  };

  const getApprovalStatus = (payment: Payment): string => {
    return payment.approvalStatus?.toLowerCase() || "pending";
  };

  const getRefundStatus = (payment: Payment): string => {
    return payment.refundStatus?.toLowerCase() || "";
  };

  const isPaid = (payment: Payment): boolean => {
    const status = payment.status?.toLowerCase();

    return (
      status === "paid" ||
      status === "completed" ||
      status === "succeeded"
    );
  };

  const getStatusLabel = (payment: Payment): string => {
    const approval = getApprovalStatus(payment);
    const refund = getRefundStatus(payment);

    if (refund === "pending") {
      return "Refund Processing";
    }

    if (refund === "failed") {
      return "Refund Failed";
    }

    if (refund === "succeeded") {
      return "Refunded";
    }

    if (approval === "approved") {
      return "Approved · PRO Active";
    }

    if (approval === "rejected") {
      return "Rejected";
    }

    if (isPaid(payment)) {
      return "Paid · Pending Approval";
    }

    return payment.status || "Pending";
  };

  const getUserName = (payment: Payment): string => {
    return (
      payment.student?.name ||
      payment.user?.name ||
      "User"
    );
  };

  const getUserEmail = (payment: Payment): string => {
    return (
      payment.student?.email ||
      payment.user?.email ||
      "No email available"
    );
  };

  const formatAmount = (payment: Payment): string => {
    const currency = payment.currency?.toUpperCase() || "BDT";
    const amount = Number(payment.amount || 0);

    try {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString("en-BD")}`;
    }
  };

  const statusStyle = (payment: Payment): string => {
    const approval = getApprovalStatus(payment);
    const refund = getRefundStatus(payment);

    if (refund === "failed") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (refund === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }

    if (refund === "succeeded") {
      return "border-slate-200 bg-slate-100 text-slate-700";
    }

    if (approval === "approved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (approval === "rejected") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (isPaid(payment)) {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
  };

  // Approve payment and activate PRO through the backend.
  const handleApprove = async (paymentId: string): Promise<void> => {
    if (processingId) return;

    const confirmed = window.confirm(
      "Approve this payment?\n\nThe user's PRO subscription will be activated after approval."
    );

    if (!confirmed) return;

    setProcessingId(paymentId);

    try {
      await axiosInstance.post(
        `/api/payments/admin/${paymentId}/approve`
      );

      toast.success(
        "Payment approved. PRO activation confirmed."
      );

      await fetchPayments();
    } catch (error: unknown) {
      console.error("Payment approval error:", error);

      toast.error(
        getErrorMessage(
          error,
          "Unable to approve payment."
        )
      );

      await fetchPayments();
    } finally {
      setProcessingId(null);
    }
  };

  // Reject payment, cancel Stripe subscription and refund.
  const handleReject = async (paymentId: string): Promise<void> => {
    if (processingId) return;

    const confirmed = window.confirm(
      "Reject this payment?\n\nThe Stripe subscription will be cancelled and the initial payment will be refunded."
    );

    if (!confirmed) return;

    setProcessingId(paymentId);

    try {
      const response = await axiosInstance.post(
        `/api/payments/admin/${paymentId}/reject`
      );

      const refundFailed =
        response.data?.success === false ||
        response.data?.refundStatus === "failed";

      if (refundFailed) {
        toast.error(
          response.data?.message ||
            "Refund failed. Please check the payment record."
        );
      } else if (
        response.data?.refundStatus === "pending"
      ) {
        toast.success(
          "Payment rejected. Refund is being processed."
        );
      } else {
        toast.success(
          "Payment rejected and refund processed successfully."
        );
      }

      await fetchPayments();
    } catch (error: unknown) {
      console.error(
        "Payment rejection/refund error:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Rejection or refund failed. Please check the payment record."
        )
      );

      await fetchPayments();
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchableText = [
        getUserName(payment),
        getUserEmail(payment),
        payment.status,
        payment.approvalStatus,
        payment.refundStatus,
        payment.transactionId,
        payment.method,
        payment.planName,
        payment.userRole,
        payment._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        search.toLowerCase().trim()
      );

      const approval = getApprovalStatus(payment);

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" &&
          approval === "pending" &&
          isPaid(payment)) ||
        (filter === "approved" &&
          approval === "approved") ||
        (filter === "rejected" &&
          approval === "rejected");

      return matchesSearch && matchesFilter;
    });
  }, [payments, search, filter]);

  const pendingPayments = payments.filter(
    (payment) =>
      isPaid(payment) &&
      getApprovalStatus(payment) === "pending" &&
      !getRefundStatus(payment)
  );

  const approvedPayments = payments.filter(
    (payment) =>
      getApprovalStatus(payment) === "approved"
  );

  const total = payments
    .filter((payment) => isPaid(payment))
    .reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-7 sm:px-6 lg:px-9">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#B58A39]">
              Admin Workspace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#101F32]">
              Payment Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review payments, approve subscriptions and manage refunds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading || !!processingId}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#B58A39] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Transactions"
            value={payments.length}
            icon={<CreditCard size={19} />}
          />

          <StatCard
            label="Pending Approval"
            value={pendingPayments.length}
            icon={<Clock3 size={19} />}
          />

          <StatCard
            label="Approved Payments"
            value={approvedPayments.length}
            icon={<ShieldCheck size={19} />}
          />

          <StatCard
            label="Recorded Paid Amount"
            value={`৳${total.toLocaleString("en-BD")}`}
            icon={<Wallet size={19} />}
          />
        </div>

        {/* Search and filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, transaction or plan..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-[#B58A39] focus:ring-4 focus:ring-[#D6B36C]/15"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All Payments"],
                ["pending", "Pending Approval"],
                ["approved", "Approved"],
                ["rejected", "Rejected"],
              ] as [FilterType, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
                  filter === value
                    ? "bg-[#101F32] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment records */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-extrabold text-[#101F32]">
              Payment Records ({filteredPayments.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3 text-sm font-bold text-slate-500">
              <Loader2
                size={22}
                className="animate-spin text-[#B58A39]"
              />
              Loading payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Wallet
                size={34}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-extrabold text-[#101F32]">
                No Payment Records Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => {
                const approval = getApprovalStatus(payment);
                const refund = getRefundStatus(payment);
                const isProcessing = processingId === payment._id;

                const canTakeAction =
                  isPaid(payment) &&
                  approval === "pending" &&
                  !refund;

                return (
                  <div
                    key={payment._id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  >
                    {/* User and transaction details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-[#101F32]">
                        {getUserName(payment)}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {getUserEmail(payment)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        {payment.userRole && (
                          <span>Role: {payment.userRole}</span>
                        )}

                        {payment.planName && (
                          <span>Plan: {payment.planName}</span>
                        )}

                        {payment.method && (
                          <span>Method: {payment.method}</span>
                        )}
                      </div>

                      <p className="mt-2 break-all text-xs text-slate-400">
                        Transaction: {payment.transactionId || payment._id}
                      </p>

                      {payment.createdAt && (
                        <p className="mt-1 text-xs text-slate-400">
                          Date:{" "}
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Amount, status and actions */}
                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-extrabold text-[#101F32]">
                          {formatAmount(payment)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusStyle(
                            payment
                          )}`}
                        >
                          {getStatusLabel(payment)}
                        </span>
                      </div>

                      {refund === "failed" && (
                        <p className="text-xs font-bold text-red-600">
                          <XCircle
                            size={13}
                            className="mr-1 inline"
                          />
                          Refund requires attention
                        </p>
                      )}

                      {refund === "pending" && (
                        <p className="text-xs font-bold text-amber-700">
                          <Clock3
                            size={13}
                            className="mr-1 inline"
                          />
                          Waiting for refund confirmation
                        </p>
                      )}

                      {canTakeAction ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!!processingId}
                            onClick={() =>
                              void handleApprove(payment._id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Approve & Activate PRO
                          </button>

                          <button
                            type="button"
                            disabled={!!processingId}
                            onClick={() =>
                              void handleReject(payment._id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <RotateCcw size={14} />
                            )}
                            Reject & Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          <CheckCircle2
                            size={13}
                            className="mr-1 inline"
                          />
                          No action available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="mt-6 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} MentorLagbe · Secure Payment Administration
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">
          {label}
        </p>

        <span className="rounded-xl bg-[#101F32] p-2 text-[#D9B66F]">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-2xl font-extrabold text-[#101F32]">
        {value}
      </p>
    </div>
  );
}
