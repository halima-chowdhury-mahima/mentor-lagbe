
import axiosInstance from "@/lib/axios";

export type SubscriptionPlan = "student-pro" | "tutor-pro";

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
  paymentStatus: "paid" | "pending" | "failed";
  paidAt: string;
  createdAt: string;
}

export const paymentService = {
  // Create Student PRO ($10/month) or Tutor PRO ($15/month) checkout
  async createCheckoutSession(plan: SubscriptionPlan): Promise<string> {
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

  // Verify Stripe Checkout Session
  async verifyCheckoutSession(sessionId: string): Promise<void> {
    if (!sessionId) {
      throw new Error("Stripe session ID is missing.");
    }

    await axiosInstance.post("/api/payments/verify-session", {
      sessionId,
    });
  },

  // Logged-in user's payment history
  async getMyPayments(): Promise<PaymentRecord[]> {
    const { data } = await axiosInstance.get("/api/payments/my-payments");

    return data.payments ?? data.data ?? [];
  },

  // Admin payment history
  async getAllPayments(): Promise<PaymentRecord[]> {
    const { data } = await axiosInstance.get("/api/admin/payments");

    return data.payments ?? data.data ?? [];
  },
};
