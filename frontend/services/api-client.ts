import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("alumniconnect_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for unified response unwrapping and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear token and optionally redirect on unauthorized
      localStorage.removeItem("alumniconnect_access_token");
    }
    return Promise.reject(error);
  },
);

export async function getHealthStatus(): Promise<{ status: string; service: string }> {
  const res = await apiClient.get<ApiResponse<{ status: string; service: string }>>("/health");
  return res.data.data;
}

export async function getOpportunities() {
  const res = await apiClient.get<ApiResponse<any[]>>("/opportunities");
  return res.data.data;
}

export async function searchAlumni(department?: string, company?: string) {
  const res = await apiClient.get<ApiResponse<any[]>>("/discovery/alumni", {
    params: { department, company },
  });
  return res.data.data;
}
