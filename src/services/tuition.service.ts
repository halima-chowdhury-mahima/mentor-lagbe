
import axiosInstance from "@/lib/axios";

export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  category: string;
  classLevel: string;
  description: string;
  salary: number;
  location: string;
  tuitionType: "Home Tuition" | "Online Tuition" | "Both";
  daysPerWeek: number;
  tutorGender?: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  isActive?: boolean;
  createdAt?: string;
  tutor?: {
    _id: string;
    name: string;
    email?: string;
  };
}

export interface TuitionFilters {
  search?: string;
  category?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  tuitionType?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TuitionListResponse {
  tuitions: Tuition[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateTuitionPayload = Omit<
  Tuition,
  "_id" | "status" | "isActive" | "createdAt" | "tutor"
>;

export const tuitionService = {
  async getAll(filters: TuitionFilters = {}): Promise<TuitionListResponse> {
    const { data } = await axiosInstance.get("/api/tuitions", {
      params: filters,
    });

    return {
      tuitions: data.tuitions ?? data.data ?? [],
      total: data.total ?? 0,
      page: data.page ?? filters.page ?? 1,
      limit: data.limit ?? filters.limit ?? 9,
      totalPages: data.totalPages ?? 1,
    };
  },

  async getById(id: string): Promise<Tuition> {
    const { data } = await axiosInstance.get(`/api/tuitions/${id}`);
    return data.tuition ?? data.data ?? data;
  },

  async create(payload: CreateTuitionPayload): Promise<Tuition> {
    const { data } = await axiosInstance.post("/api/tuitions", payload);
    return data.tuition ?? data.data ?? data;
  },

  async update(
    id: string,
    payload: Partial<CreateTuitionPayload>
  ): Promise<Tuition> {
    const { data } = await axiosInstance.patch(`/api/tuitions/${id}`, payload);
    return data.tuition ?? data.data ?? data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/tuitions/${id}`);
  },

  async toggleStatus(id: string, isActive: boolean): Promise<void> {
    await axiosInstance.patch(`/api/tuitions/${id}/status`, { isActive });
  },

  async getMyTuitions(): Promise<Tuition[]> {
    const { data } = await axiosInstance.get("/api/tuitions/my-tuitions");
    return data.tuitions ?? data.data ?? [];
  },

  async getPending(): Promise<Tuition[]> {
    const { data } = await axiosInstance.get("/api/tuitions/admin/pending");
    return data.tuitions ?? data.data ?? [];
  },

  async review(
    id: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    await axiosInstance.patch(`/api/tuitions/${id}/review`, { status });
  },
};
