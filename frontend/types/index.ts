export type UserRole = "STUDENT" | "ALUMNI" | "FACULTY" | "ADMIN";

export type AccountStatus = "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type VerificationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  isEmailVerified: boolean;
  createdAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  department?: string;
  degree?: string;
  graduationYear?: number;
  skills: string[];
  interests: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  alumniProfile?: AlumniProfile;
  studentProfile?: StudentProfile;
}

export interface AlumniProfile {
  id: string;
  currentCompany?: string;
  currentTitle?: string;
  industry?: string;
  yearsOfExperience?: number;
  willingToMentor: boolean;
  willingToRefer: boolean;
  maxMentees: number;
  officeLocation?: string;
}

export interface StudentProfile {
  id: string;
  studentIdNumber?: string;
  expectedGraduationYear?: number;
  currentSemester?: number;
  targetRoles: string[];
  targetCompanies: string[];
  resumeUrl?: string;
  githubUsername?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location?: string;
  type: "FULL_TIME" | "INTERNSHIP" | "PART_TIME" | "RESEARCH" | "FREELANCE" | "REFERRAL";
  description: string;
  requirements: string[];
  applyUrl?: string;
  isActive: boolean;
  createdAt: string;
  author?: {
    profile?: Profile;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta: {
    timestamp: string;
    path: string;
    version: string;
  };
}

export interface AuthResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: Pick<User, "id" | "email" | "role">;
}

export type CodingPlatform = "CODEFORCES" | "LEETCODE" | "HACKERRANK" | "CODECHEF";

export type CandidateAssessmentStatus =
  | "READY_FOR_REVIEW"
  | "DEVELOPING"
  | "NEEDS_MORE_EVIDENCE"
  | "MANUAL_REVIEW";

export interface CandidateValidationProfile {
  id: string;
  userId: string;
  githubUsername: string;
  topRepoUrl?: string;
  codingPlatform: CodingPlatform;
  codingHandle: string;
  consentAt: string;
  assessments?: CandidateAssessment[];
}

export interface LeetCodeDifficultyStats {
  solved: number;
  acceptedSubmissions: number;
  totalSubmissions: number;
  acceptanceRate: number | null;
}

export interface CandidateAssessmentEvidence extends Record<string, unknown> {
  codingProfile?: Record<string, unknown> & {
    platform?: CodingPlatform;
    supported?: boolean;
    difficultyStats?: Partial<Record<"Easy" | "Medium" | "Hard", LeetCodeDifficultyStats>>;
  };
}

export interface CandidateAssessment {
  id: string;
  status: CandidateAssessmentStatus;
  score: number | null;
  githubScore: number | null;
  codingScore: number | null;
  evidenceQualityScore: number | null;
  ownershipVerified: boolean;
  evidence: CandidateAssessmentEvidence;
  assessedAt: string;
  topProjectEvaluation?: any;
  storedJsonFilename?: string;
  storedJsonPath?: string;
}

export interface ConnectionEligibility {
  eligible: boolean;
  latestScore: number | null;
  requiredScore: number;
  requirement: string;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterScore?: number | null;
  requesterGithub?: string;
  receiverId: string;
  receiverName?: string;
  receiverCompany?: string;
  receiverTitle?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
  createdAt: string;
}


export type CommunityCategory = "MENTOR_UPDATE" | "TECH_INSIGHT" | "REFERRAL" | "STUDENT_UPDATE" | "EVENT";

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: CommunityCategory;
  authorName: string;
  authorRole: string;
  authorCompany?: string;
  tags: string[];
  likesCount: number;
  publishedAt: string;
}
