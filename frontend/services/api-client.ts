import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  ApiResponse,
  AuthResult,
  CandidateAssessment,
  CandidateValidationProfile,
  CodingPlatform,
  ConnectionEligibility,
  ConnectionRequest,
  UserRole,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

export async function registerAccount(input: {
  email: string;
  password: string;
  role: Extract<UserRole, "STUDENT" | "ALUMNI">;
}): Promise<AuthResult> {
  const res = await apiClient.post<ApiResponse<AuthResult>>("/auth/register", input);
  localStorage.setItem("alumniconnect_access_token", res.data.data.accessToken);
  return res.data.data;
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const res = await apiClient.post<ApiResponse<AuthResult>>("/auth/login", input);
  localStorage.setItem("alumniconnect_access_token", res.data.data.accessToken);
  return res.data.data;
}

export async function evaluateProject(repoUrl: string) {
  const res = await apiClient.post<ApiResponse<any>>("/project-eval", { repoUrl });
  return res.data.data ?? res.data;
}

export async function getCandidateValidationProfile(): Promise<CandidateValidationProfile | null> {
  const res = await apiClient.get<ApiResponse<CandidateValidationProfile | null>>(
    "/candidate-validation/me",
  );
  return res.data.data;
}

export async function saveCandidateValidationProfile(input: {
  githubUsername: string;
  topRepoUrl?: string;
  codingPlatform: CodingPlatform;
  codingHandle: string;
  consent: true;
}): Promise<CandidateValidationProfile> {
  const res = await apiClient.put<ApiResponse<CandidateValidationProfile>>(
    "/candidate-validation/profiles",
    input,
  );
  return res.data.data;
}

export async function deleteCandidateValidationProfile(): Promise<{ deleted: boolean }> {
  const res = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
    "/candidate-validation/profiles",
  );
  return res.data.data;
}

export async function assessCandidate(input?: { topRepoUrl?: string }): Promise<CandidateAssessment> {
  const res = await apiClient.post<ApiResponse<CandidateAssessment>>(
    "/candidate-validation/assessments",
    input ?? {},
  );
  return res.data.data;
}

export async function downloadLatestEvaluationJson(): Promise<Blob> {
  const res = await apiClient.get("/candidate-validation/evaluations/download-json", {
    responseType: "blob",
  });
  return res.data;
}

export async function getConnectionEligibility(): Promise<ConnectionEligibility> {
  const res = await apiClient.get<ApiResponse<ConnectionEligibility>>("/connections/eligibility");
  return res.data.data;
}

export async function requestAlumniConnection(receiverId: string): Promise<ConnectionRequest> {
  const res = await apiClient.post<ApiResponse<ConnectionRequest>>("/connections/requests", {
    receiverId,
  });
  return res.data.data;
}

export async function getMyConnections(): Promise<ConnectionRequest[]> {
  const res = await apiClient.get<ApiResponse<ConnectionRequest[]>>("/connections/me");
  return res.data.data;
}
