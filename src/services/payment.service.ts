
import axiosInstance from "@/lib/axios";

export type SubscriptionPlan = "student-pro" | "tutor-pro";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type RefundStatus =
  | "not_refunded"
  | "pending"
  | "succeeded"
  | "failed";

export interface PaymentRecord {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: "student" | "tutor";
  plan: SubscriptionPlan | "pro_student" | "pro_tutor";
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  approvalStatus: ApprovalStatus;
  refundStatus?: RefundStatus;
  subscriptionStatus?: string;
  paidAt: string;
  createdAt: string;
}

export const paymentService = {
  async createCheckoutSession(
    plan: SubscriptionPlan
  ): Promise<string> {
    const { data } = await axiosInstance.post(
      "/api/payments/create-checkout-session",
      { plan }
    );

    const checkoutUrl = data.url ?? data.sessionUrl;

    if (!checkoutUrl) {
      throw new Error(
        data.message || "Payment checkout URL was not returned."
      );
    }

    return checkoutUrl;
  },

  async verifyCheckoutSession(
    sessionId: string
  ): Promise<{
    approvalStatus: ApprovalStatus;
    plan: string;
    message: string;
  }> {
    if (!sessionId) {
      throw new Error("Stripe session ID is missing.");
    }

    const { data } = await axiosInstance.post(
      "/api/payments/verify-session",
      { sessionId }
    );

    return data;
  },

  async getMyPayments(): Promise<PaymentRecord[]> {
    const { data } = await axiosInstance.get(
      "/api/payments/my-payments"
    );

    return data.payments ?? data.data ?? [];
  },

  async getAllPayments(): Promise<PaymentRecord[]> {
    const { data } = await axiosInstance.get(
      "/api/payments/admin/all"
    );

    return data.payments ?? data.data ?? [];
  },

  async approvePayment(paymentId: string) {
    const { data } = await axiosInstance.post(
      `/api/payments/admin/${paymentId}/approve`
    );

    return data;
  },

  async rejectPayment(paymentId: string) {
    const { data } = await axiosInstance.post(
      `/api/payments/admin/${paymentId}/reject`
    );

    return data;
  },
};
