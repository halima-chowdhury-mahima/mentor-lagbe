
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  tuitionService,
  type Tuition,
  type TuitionFilters,
  type TuitionListResponse,
} from "@/services/tuition.service";

const emptyResult: TuitionListResponse = {
  tuitions: [],
  total: 0,
  page: 1,
  limit: 9,
  totalPages: 1,
};

export function useTuitions(initialFilters: TuitionFilters = {}) {
  const filtersKey = JSON.stringify(initialFilters);

  const stableFilters = useMemo(
    () => JSON.parse(filtersKey) as TuitionFilters,
    [filtersKey]
  );

  const [result, setResult] = useState<TuitionListResponse>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTuitions = useCallback(
    async (filters: TuitionFilters = {}) => {
      setLoading(true);
      setError("");

      try {
        const response = await tuitionService.getAll({
          ...stableFilters,
          ...filters,
        });

        setResult(response);
      } catch {
        setError("Unable to load tuition listings. Please try again.");
        setResult(emptyResult);
      } finally {
        setLoading(false);
      }
    },
    [stableFilters]
  );

  useEffect(() => {
    let active = true;

    const loadTuitions = async () => {
      try {
        const response = await tuitionService.getAll(stableFilters);

        if (active) {
          setResult(response);
          setError("");
        }
      } catch {
        if (active) {
          setError("Unable to load tuition listings. Please try again.");
          setResult(emptyResult);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTuitions();

    return () => {
      active = false;
    };
  }, [stableFilters]);

  return {
    tuitions: result.tuitions,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    loading,
    error,
    fetchTuitions,
    refresh: () => fetchTuitions({ page: result.page }),
  };
}

export function useMyTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyTuitions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await tuitionService.getMyTuitions();
      setTuitions(data);
    } catch {
      setError("Unable to load your tuition posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadMyTuitions = async () => {
      try {
        const data = await tuitionService.getMyTuitions();

        if (active) {
          setTuitions(data);
          setError("");
        }
      } catch {
        if (active) {
          setError("Unable to load your tuition posts.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMyTuitions();

    return () => {
      active = false;
    };
  }, []);

  return {
    tuitions,
    loading,
    error,
    refresh: fetchMyTuitions,
  };
}
