
import type { AuthUser } from "@/services/auth.service";

export function getDashboardRoute(role: AuthUser["role"]): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";

    case "tutor":
      return "/dashboard/tutor";

    case "student":
      return "/dashboard/student";

    default:
      return "/login";
  }
}
