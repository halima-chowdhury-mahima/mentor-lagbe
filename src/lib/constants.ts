
export const APP_NAME = "MentorLagbe";

export const APP_DESCRIPTION =
  "Find the right mentor. Build your future.";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const USER_ROLES = {
  STUDENT: "student",
  TUTOR: "tutor",
  ADMIN: "admin",
} as const;

export const TUITION_MODES = {
  ONLINE: "Online",
  OFFLINE: "Offline",
} as const;

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const APPLICATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const PUBLIC_NAV_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Browse Tuitions",
    href: "/tuitions",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "How It Works",
    href: "/about",
  },
];

export const DASHBOARD_LINKS = {
  student: [
    { label: "Overview", href: "/dashboard/student" },
    {
      label: "My Applications",
      href: "/dashboard/student/my-applications",
    },
    {
      label: "Saved Tuitions",
      href: "/dashboard/student/saved-tuitions",
    },
  ],

  tutor: [
    { label: "Overview", href: "/dashboard/tutor" },
    {
      label: "Post a Tuition",
      href: "/dashboard/tutor/post-tuition",
    },
    {
      label: "My Tuitions",
      href: "/dashboard/tutor/my-tuitions",
    },
    {
      label: "Applicants",
      href: "/dashboard/tutor/applicants",
    },
  ],

  admin: [
    { label: "Overview", href: "/dashboard/admin" },
    {
      label: "User Management",
      href: "/dashboard/admin/users",
    },
    {
      label: "Tuition Management",
      href: "/dashboard/admin/tuitions",
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
    },
  ],
};

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Programming",
  "Accounting",
  "Finance",
  "Business Studies",
  "IELTS",
];

export const CLASS_LEVELS = [
  "Primary",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",
  "HSC",
  "Admission",
  "University",
  "Professional",
];

export const PRICING_PLANS = {
  tutor: {
    free: {
      name: "Free Tutor",
      price: 0,
      currency: "USD",
      tuitionLimit: 2,
    },
    pro: {
      name: "Pro Tutor",
      price: 15,
      currency: "USD",
      tuitionLimit: Infinity,
    },
  },

  student: {
    free: {
      name: "Free Student",
      price: 0,
      currency: "USD",
    },
    pro: {
      name: "Pro Student",
      price: 10,
      currency: "USD",
    },
  },
};
