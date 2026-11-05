import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  ApiResponse,
  AuthResult,
  CandidateAssessment,
  CandidateValidationProfile,
  CodingPlatform,
  CommunityPost,
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

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alumniconnect_auth_change"));
  }
}

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
      localStorage.removeItem("alumniconnect_access_token");
      localStorage.removeItem("alumniconnect_user");
      notifyAuthChange();
    }
    return Promise.reject(error);
  },
);

export function getCurrentUser(): { id: string; email: string; role: UserRole } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("alumniconnect_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("alumniconnect_access_token");
    localStorage.removeItem("alumniconnect_user");
    notifyAuthChange();
  }
}

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
  if (typeof window !== "undefined") {
    localStorage.setItem("alumniconnect_access_token", res.data.data.accessToken);
    localStorage.setItem("alumniconnect_user", JSON.stringify(res.data.data.user));
    notifyAuthChange();
  }
  return res.data.data;
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const res = await apiClient.post<ApiResponse<AuthResult>>("/auth/login", input);
  if (typeof window !== "undefined") {
    localStorage.setItem("alumniconnect_access_token", res.data.data.accessToken);
    localStorage.setItem("alumniconnect_user", JSON.stringify(res.data.data.user));
    notifyAuthChange();
  }
  return res.data.data;
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

export async function getAnnouncements(): Promise<CommunityPost[]> {
  const res = await apiClient.get<ApiResponse<CommunityPost[]>>("/announcements");
  return res.data.data;
}

export async function createCommunityPost(input: {
  title: string;
  content: string;
  category?: string;
  authorName?: string;
  authorRole?: string;
  authorCompany?: string;
  tags?: string[];
}): Promise<CommunityPost> {
  const res = await apiClient.post<ApiResponse<CommunityPost>>("/announcements", input);
  return res.data.data;
}

export async function likeCommunityPost(postId: string): Promise<{ success: boolean }> {
  const res = await apiClient.post<ApiResponse<{ success: boolean }>>(`/announcements/${postId}/like`);
  return res.data.data;
}
