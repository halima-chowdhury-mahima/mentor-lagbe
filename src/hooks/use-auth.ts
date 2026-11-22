
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authService,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      setError("");
      return currentUser;
    } catch (err) {
      localStorage.removeItem("accessToken");
      setUser(null);
      setError(
        err instanceof Error ? err.message : "Session expired."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (!localStorage.getItem("accessToken")) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getMe();

        if (active) {
          setUser(currentUser);
          setError("");
        }
      } catch {
        localStorage.removeItem("accessToken");

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError("");

    try {
      const registeredUser = await authService.register(payload);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError("");

    try {
      const loggedInUser = await authService.login(payload);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError("");
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
    isStudent: user?.role === "student",
    isTutor: user?.role === "tutor",
    isAdmin: user?.role === "admin",
  };
}
