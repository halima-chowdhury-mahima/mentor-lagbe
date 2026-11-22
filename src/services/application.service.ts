
import axiosInstance from "@/lib/axios";

export interface TuitionApplication {
  _id: string;
  tuition: {
    _id: string;
    title: string;
    subject: string;
    salary: number;
  };
  student: {
    _id: string;
    name: string;
    email: string;
  };
  message?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
}

export interface ApplyPayload {
  tuitionId: string;
  message?: string;
}

export const applicationService = {
  async apply(payload: ApplyPayload): Promise<TuitionApplication> {
    const { data } = await axiosInstance.post("/api/applications", payload);
    return data.application ?? data.data ?? data;
  },

  async getMyApplications(): Promise<TuitionApplication[]> {
    const { data } = await axiosInstance.get("/api/applications/my-applications");
    return data.applications ?? data.data ?? [];
  },

  async getTuitionApplicants(
    tuitionId: string
  ): Promise<TuitionApplication[]> {
    const { data } = await axiosInstance.get(
      `/api/applications/tuition/${tuitionId}`
    );
    return data.applications ?? data.data ?? [];
  },

  async updateStatus(
    applicationId: string,
    status: "accepted" | "rejected"
  ): Promise<TuitionApplication> {
    const { data } = await axiosInstance.patch(
      `/api/applications/${applicationId}/status`,
      { status }
    );
    return data.application ?? data.data ?? data;
  },

  async cancel(applicationId: string): Promise<void> {
    await axiosInstance.patch(`/api/applications/${applicationId}/cancel`);
  },
};
