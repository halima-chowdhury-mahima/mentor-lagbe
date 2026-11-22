
export type UserRole = "student" | "tutor" | "admin";

export type SubscriptionPlan = "free" | "pro";

export type TuitionMode = "Online" | "Offline";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected";

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: string;
}

export interface TuitionApplication {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface Payment {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}

export interface TuitionReview {
  _id: string;
  tuitionId: string;
  studentEmail: string;
  studentName: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}
