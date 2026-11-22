
import axios from "axios";
import axiosInstance from "@/lib/axios";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  plan?: "free" | "pro";
  image?: string | null;
  phone?: string;
}

const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

const getJwtToken = async (): Promise<string> => {
  const { data } = await axiosInstance.get("/api/auth/token", {
    withCredentials: true,
  });

  if (!data?.token) {
    throw new Error("Unable to create authentication token.");
  }

  saveToken(data.token);

  return data.token;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong."
    );
  }

  return error instanceof Error ? error.message : "Something went wrong.";
};

const getCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await axiosInstance.get("/api/profile/me");

  const profile = data?.data ?? data?.user ?? data;

  if (!profile?.email || !profile?.role) {
    throw new Error("Unable to load your account information.");
  }

  return {
    ...profile,
    id: profile.id || profile._id?.toString(),
  } as AuthUser;
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    try {
      clearToken();

      // Step 1: Create account through Better Auth.
      await axiosInstance.post(
        "/api/auth/sign-up/email",
        {
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        },
        { withCredentials: true }
      );

      // Step 2: Get an initial JWT from the Better Auth session.
      await getJwtToken();

      // Step 3: Select the requested role through the protected backend route.
      await axiosInstance.patch(
        "/api/profile/role",
        { role: payload.role }
      );
      

      // Step 4: Get a fresh JWT containing the selected role.
      await getJwtToken();

      // Step 5: Load the authenticated profile.
      return await getCurrentUser();
    } catch (error) {
      clearToken();
      throw new Error(getErrorMessage(error));
    }
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    try {
      clearToken();

      // Sign in through Better Auth.
      await axiosInstance.post(
        "/api/auth/sign-in/email",
        {
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          rememberMe: true,
        },
        { withCredentials: true }
      );

      // Get the JWT used by the Express API.
      await getJwtToken();

      return await getCurrentUser();
    } catch (error) {
      clearToken();
      throw new Error(getErrorMessage(error));
    }
  },

  async getMe(): Promise<AuthUser> {
    return getCurrentUser();
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(
        "/api/auth/sign-out",
        {},
        { withCredentials: true }
      );
    } finally {
      clearToken();
    }
  },

  getErrorMessage,
};
