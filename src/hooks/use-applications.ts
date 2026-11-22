
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applicationService,
  type TuitionApplication,
  type ApplyPayload,
} from "@/services/application.service";

export function useApplications() {
  const [applications, setApplications] = useState<TuitionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch {
      setError("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const data = await applicationService.getMyApplications();

        if (active) {
          setApplications(data);
          setError("");
        }
      } catch {
        if (active) {
          setError("Unable to load applications.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadApplications();

    return () => {
      active = false;
    };
  }, []);

  const apply = async (payload: ApplyPayload) => {
    const application = await applicationService.apply(payload);
    await fetchApplications();
    return application;
  };

  const cancel = async (applicationId: string) => {
    await applicationService.cancel(applicationId);
    await fetchApplications();
  };

  return {
    applications,
    loading,
    error,
    apply,
    cancel,
    refresh: fetchApplications,
  };
}
