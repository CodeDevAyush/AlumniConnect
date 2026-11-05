"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  GraduationCap,
  Github,
  Linkedin,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Award,
  CheckCircle2,
  TrendingUp,
  Terminal,
  Edit3,
  Code2,
  GitBranch,
  Star,
  Lock,
  Unlock,
  Building,
  Check,
  X,
  Sparkles,
  Camera,
  Layers,
  FileCheck,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, searchAlumni, notifyAuthChange } from "@/services/api-client";

// Comprehensive Technical Skills Catalog for Manual Selection
const SKILLS_CATALOG = {
  Languages: ["TypeScript", "JavaScript", "Python", "Go", "Java", "C++", "Rust", "SQL"],
  Frameworks: ["React", "Next.js", "Node.js", "NestJS", "FastAPI", "Spring Boot", "Express", "Django"],
  "Cloud & Databases": ["PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Prisma"],
  "Systems & Core CS": ["Distributed Systems", "Microservices", "REST APIs", "GraphQL", "CI/CD", "Kafka", "Linux", "Data Structures"],
};

// Historical Score Growth Data for Student Audit Progression
const DEFAULT_AUDIT_HISTORY = [
  { date: "Aug 12", score: 54, label: "Initial Repo Evaluation" },
  { date: "Sep 02", score: 66, label: "Refactoring & Architecture" },
  { date: "Sep 24", score: 75, label: "Semgrep SAST Clean" },
  { date: "Oct 15", score: 82, label: "SonarQube 0 Blockers" },
  { date: "Nov 04", score: 88, label: "Verified 80+ Qualified" },
];

function ProfileInner() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editGradYear, setEditGradYear] = useState(2026);
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editExperienceLevel, setEditExperienceLevel] = useState("Staff Level (7+ Years)");
  const [editLinkedinUrl, setEditLinkedinUrl] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editCodingPlatform, setEditCodingPlatform] = useState("LeetCode");
  const [editCodingHandle, setEditCodingHandle] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  useEffect(() => {
    loadProfile();
  }, [requestedId]);

  async function loadProfile() {
    const current = getCurrentUser();

    if (requestedId && requestedId !== current?.id) {
      try {
        const list = await searchAlumni();
        const found = list.find((a) => a.id === requestedId);
        if (found) {
          setUser({
            id: found.id,
            email: `${found.name.toLowerCase().replace(/\s+/g, ".")}@alumni.edu`,
            role: "ALUMNI",
            profile: {
              firstName: found.name.split(" ")[0],
              lastName: found.name.split(" ").slice(1).join(" "),
              photoUrl: "",
              company: found.company,
              title: found.title,
              experienceLevel: "Senior / Staff (6+ Years)",
              department: found.department,
              graduationYear: found.gradYear,
              location: found.location,
              skills: found.skills,
              linkedinUrl: `https://linkedin.com/in/${found.name.toLowerCase().replace(/\s+/g, "-")}`,
              githubUsername: found.name.toLowerCase().replace(/\s+/g, ""),
              bio: `Senior Staff Software Engineer at ${found.company} specializing in ${found.skills.slice(0, 3).join(", ")}. Passionate about mentoring students and reviewing high-quality architecture.`,
            },
          });
          return;
        }
      } catch {
        // Fallback
      }
    }

    if (current) {
      setUser(current);
      setEditFirstName(current.profile?.firstName || "");
      setEditLastName(current.profile?.lastName || "");
      setEditBio(
        current.profile?.bio ||
          (current.role === "ALUMNI"
            ? "Senior Staff Engineer with expertise in distributed systems, high-availability architecture, and institutional career mentoring."
            : "Computer Science student specializing in distributed systems, full-stack development, and verifiable software quality.")
      );
      setEditPhotoUrl(current.profile?.photoUrl || "");
      setEditDepartment(current.profile?.department || "Computer Science & Engineering");
      setEditGradYear(current.profile?.graduationYear || (current.role === "ALUMNI" ? 2020 : 2026));
      setEditCompany(current.profile?.company || (current.role === "ALUMNI" ? "Google" : ""));
      setEditTitle(current.profile?.title || (current.role === "ALUMNI" ? "Senior Staff Software Engineer" : ""));
      setEditExperienceLevel(current.profile?.experienceLevel || "Staff Level (7+ Years)");
      setEditLinkedinUrl(current.profile?.linkedinUrl || `https://linkedin.com/in/${current.email?.split("@")[0] || "member"}`);
      setEditGithub(current.profile?.githubUsername || "CodeDevAyush");
      setEditCodingPlatform(current.profile?.codingPlatform || "LeetCode");
      setEditCodingHandle(current.profile?.codingHandle || "alex_code");
      setSelectedSkills(
        current.profile?.skills && current.profile.skills.length > 0
          ? current.profile.skills
          : current.role === "ALUMNI"
          ? ["Distributed Systems", "Kubernetes", "Go", "Cloud & Databases", "PostgreSQL"]
          : ["TypeScript", "Next.js", "Node.js", "Docker", "PostgreSQL", "Python"]
      );
    }
  }

  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  }

  function addCustomSkill() {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput("");
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        bio: editBio.trim(),
        photoUrl: editPhotoUrl.trim(),
        department: editDepartment.trim(),
        graduationYear: Number(editGradYear),
        company: editCompany.trim(),
        title: editTitle.trim(),
        experienceLevel: editExperienceLevel.trim(),
        linkedinUrl: editLinkedinUrl.trim(),
        githubUsername: editGithub.trim(),
        codingPlatform: editCodingPlatform,
        codingHandle: editCodingHandle.trim(),
        skills: selectedSkills,
      },
    };

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("alumniconnect_user", JSON.stringify(updatedUser));
      notifyAuthChange();
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  const isOwnProfile = !requestedId || requestedId === user?.id;
  const isAlumni = user?.role === "ALUMNI";
  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.email || "Campus Member";

  const studentScore = 88;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>AlumniConnect profile updated successfully!</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: IDENTITY & ESSENTIAL CREDENTIALS                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 space-y-5">
              {/* Profile Photo / Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {user?.profile?.photoUrl ? (
                    <img
                      src={user.profile.photoUrl}
                      alt={fullName}
                      className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div
                      className={`h-24 w-24 rounded-full flex items-center justify-center font-extrabold text-3xl text-white uppercase shadow-md ${
                        isAlumni
                          ? "bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600"
                          : "bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-600"
                      }`}
                    >
                      {user?.profile?.firstName ? user.profile.firstName.charAt(0) : user?.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <span
                    title="Verified Institutional AlumniConnect ID"
                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mt-3">{fullName}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isAlumni
                    ? `${user?.profile?.title || "Senior Staff Software Engineer"} at ${user?.profile?.company || "Google"}`
                    : `@${user?.profile?.codingHandle || "alex_code"} • Candidate Student`}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  <Badge
                    className={`text-[10px] font-bold ${
                      isAlumni ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
                    }`}
                  >
                    {isAlumni ? "Alumni Mentor" : "Student Candidate"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800 bg-emerald-50">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600 inline" />
                    Verified Campus ID
                  </Badge>
                </div>

                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="mt-4 w-full text-xs gap-1.5 border-slate-300 hover:border-slate-400 font-semibold h-8"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit AlumniConnect Profile</span>
                  </Button>
                )}
              </div>

              {/* Description / Bio */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  About & Overview
                </span>
                <p>
                  {user?.profile?.bio ||
                    (isAlumni
                      ? "Staff engineer focused on reliable distributed systems, architectural consistency, and helping university students transition into top technology roles."
                      : "Computer Science student specializing in distributed systems, full-stack engineering, and verified code maintainability.")}
                </p>
              </div>

              {/* Academic & Professional Specs */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Academic & Career Background
                </span>

                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">Branch / Department:</span>{" "}
                    <span>{user?.profile?.department || "Computer Science & Engineering"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">Passing Year:</span>{" "}
                    <span>
                      {isAlumni
                        ? `Class of ${user?.profile?.graduationYear || 2020} (Graduated)`
                        : `Class of ${user?.profile?.graduationYear || 2026} (Expected)`}
                    </span>
                  </div>
                </div>

                {isAlumni && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Building className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Currently Working Company:</span>{" "}
                        <span className="font-bold text-slate-900">{user?.profile?.company || "Google"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-slate-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Current Position:</span>{" "}
                        <span>{user?.profile?.title || "Senior Staff Software Engineer"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Experience Level:</span>{" "}
                        <span>{user?.profile?.experienceLevel || "Staff Level (7+ Years of Industry Experience)"}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{user?.profile?.location || "San Francisco, CA • Campus Network"}</span>
                </div>
              </div>

              {/* Connected Profiles (LinkedIn for Both, GitHub, Coding Platform for Student) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Connected Network Profiles
                </span>

                {/* LinkedIn (Both Profiles) */}
                <a
                  href={user?.profile?.linkedinUrl || "https://linkedin.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs text-blue-900 border border-blue-200/80 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Linkedin className="h-4 w-4 text-blue-700 shrink-0" />
                    <span className="font-semibold truncate">
                      {user?.profile?.linkedinUrl ? user.profile.linkedinUrl.replace(/^https?:\/\//, "") : "LinkedIn Profile"}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-blue-500 group-hover:text-blue-700 shrink-0" />
                </a>

                {/* GitHub (Both Profiles) */}
                <a
                  href={`https://github.com/${user?.profile?.githubUsername || "CodeDevAyush"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-700 border border-slate-200/80 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Github className="h-4 w-4 text-slate-900 shrink-0" />
                    <span className="font-medium truncate">github.com/{user?.profile?.githubUsername || "CodeDevAyush"}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-700 shrink-0" />
                </a>

                {/* Coding Platform Profile (For Students) */}
                {!isAlumni && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/40 text-xs text-slate-700 border border-amber-200/80">
                    <div className="flex items-center gap-2 truncate">
                      <Terminal className="h-4 w-4 text-amber-600 shrink-0" />
                      <span className="font-medium truncate">
                        {user?.profile?.codingPlatform || "LeetCode"}: @{user?.profile?.codingHandle || "alex_code"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[9px] py-0 border-amber-300 text-amber-800 bg-amber-50">
                      Linked
                    </Badge>
                  </div>
                )}
              </div>

              {/* Technical Skills Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isAlumni ? "Mentorship Domain Expertise" : "Technical Skills & Stack"}
                  </span>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      + Add Skills
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(user?.profile?.skills && user.profile.skills.length > 0
                    ? user.profile.skills
                    : isAlumni
                    ? ["Distributed Systems", "Kubernetes", "Go", "Cloud Reliability", "PostgreSQL"]
                    : ["TypeScript", "Next.js", "Node.js", "Docker", "PostgreSQL", "Python"]
                  ).map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[11px] bg-slate-100 text-slate-800 border border-slate-200/60"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: ROLE-SPECIFIC CONTENT                                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {!isAlumni ? (
            /* ===================================================================== */
            /* STUDENT VIEW: SCORING DETAILS, INCREASING AUDIT GRAPH & REPOS         */
            /* ===================================================================== */
            <>
              {/* 1. Scoring Details Card */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        <span>Candidate Scoring & Assessment Rating</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Verified static analysis, SonarQube SAST, and repository audit
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5">
                      Rating: {studentScore}/100
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Rating Highlight Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-2xs">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                        <span className="text-2xl font-black">{studentScore}</span>
                        <span className="text-[9px] font-semibold tracking-wider uppercase opacity-90">/100</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-base">Top Alumni Tier: UNLOCKED</span>
                          <Unlock className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Score exceeds the <strong>80+ rating threshold</strong>. Qualified to request mentorship from Senior & Staff Alumni at Google, Stripe, and Meta.
                        </p>
                      </div>
                    </div>

                    <Link href="/candidate-validation">
                      <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs shrink-0 whitespace-nowrap font-semibold">
                        Re-Run Audit
                      </Button>
                    </Link>
                  </div>

                  {/* 4 Core SAST Scoring Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SonarQube SAST</span>
                      <span className="text-lg font-black text-emerald-700">0 Blockers</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Passed (Grade A)</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semgrep Security</span>
                      <span className="text-lg font-black text-emerald-700">Clean</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">0 Vulnerabilities</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintainability</span>
                      <span className="text-lg font-black text-blue-700">Grade A</span>
                      <span className="text-[10px] text-blue-600 font-semibold block">Low Complexity</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Test Coverage</span>
                      <span className="text-lg font-black text-purple-700">82.4%</span>
                      <span className="text-[10px] text-purple-600 font-semibold block">20/20 Unit Tests</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Graph of Increasing Audit Score Over Time */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <span>Audit Score Growth Trajectory Over Time</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Progression from initial commit audit to 80+ qualified threshold
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs font-bold">
                      +34 Pt Increase
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* SVG Area Line Chart */}
                  <div className="w-full bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                    <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* 80 Threshold Line */}
                      <line x1="30" y1="50" x2="480" y2="50" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.5" />
                      <text x="485" y="53" fill="#d97706" fontSize="10" fontWeight="bold">80 Threshold</text>

                      {/* Area Fill */}
                      <polygon
                        points="50,140 140,105 230,82 320,65 420,45 420,160 50,160"
                        fill="url(#scoreGradient)"
                      />

                      {/* Score Growth Line */}
                      <polyline
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="50,140 140,105 230,82 320,65 420,45"
                      />

                      {/* Data Points */}
                      {[
                        { cx: 50, cy: 140, score: 54, date: "Aug 12" },
                        { cx: 140, cy: 105, score: 66, date: "Sep 02" },
                        { cx: 230, cy: 82, score: 75, date: "Sep 24" },
                        { cx: 320, cy: 65, score: 82, date: "Oct 15" },
                        { cx: 420, cy: 45, score: 88, date: "Nov 04" },
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.cx} cy={pt.cy} r="5.5" fill="#ffffff" stroke="#059669" strokeWidth="3" />
                          <text x={pt.cx} y={pt.cy - 10} textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="bold">
                            {pt.score}
                          </text>
                          <text x={pt.cx} y={175} textAnchor="middle" fill="#64748b" fontSize="10">
                            {pt.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Audit Milestone Progression List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">First Audit</span>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">Score: 54 / 100</div>
                      <p className="text-slate-500 text-[11px] mt-1">Initial public commit assessment with code smells identified.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">SAST Security Pass</span>
                      <div className="font-bold text-blue-800 text-sm mt-0.5">Score: 75 / 100</div>
                      <p className="text-slate-500 text-[11px] mt-1">Semgrep security scan passed with 0 vulnerabilities.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-semibold text-emerald-700 uppercase">Current Verified Status</span>
                      <div className="font-bold text-emerald-900 text-sm mt-0.5">Score: 88 / 100 (Passed)</div>
                      <p className="text-emerald-800 text-[11px] mt-1">Qualified for senior alumni mentorship & direct referral network.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Evaluated Public Repositories */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    <span>Evaluated Public Repositories</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Repository verified by AlumniConnect automated SAST analysis
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-purple-600 shrink-0" />
                        <a
                          href={`https://github.com/${user?.profile?.githubUsername || "CodeDevAyush"}/AlumniConnect`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>{user?.profile?.githubUsername || "CodeDevAyush"}/AlumniConnect</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Audit Score: 88/100</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Institutional alumni engagement platform uniting students and graduates through verified mentorship, intelligent matching, and candidate evaluation.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        TypeScript (68.4%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        JavaScript (21.2%)
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        14 Stars
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* ===================================================================== */
            /* ALUMNI VIEW: CAREER POSITION, EXPERIENCE LEVEL & MENTORSHIP HUB       */
            /* (NO AUDIT SCORE OR GRAPH AS PER USER SPECIFICATION)                   */
            /* ===================================================================== */
            <>
              {/* 1. Alumni Experience & Company Leadership Spotlight */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Building className="h-5 w-5 text-purple-600" />
                        <span>Professional Experience & Industry Position</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Verified employment & senior alumni engineering credentials
                      </CardDescription>
                    </div>
                    <Badge className="bg-purple-600 text-white font-bold text-xs px-2 py-0.5">
                      Verified Mentor
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-slate-900">
                          {user?.profile?.title || "Senior Staff Software Engineer"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-purple-800">
                        {user?.profile?.company || "Google"} • Core Infrastructure & Cloud Reliability
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Senior technical leader guiding distributed architecture, container orchestration, and university mentorship.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-purple-100 text-center shadow-xs shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</div>
                      <div className="text-sm font-extrabold text-purple-900 mt-0.5">
                        {user?.profile?.experienceLevel || "Staff Level (7+ Years)"}
                      </div>
                    </div>
                  </div>

                  {/* Career Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Graduation Branch</span>
                      <span className="text-sm font-bold text-slate-900 block">{user?.profile?.department || "Computer Science & Engineering"}</span>
                      <span className="text-[11px] text-slate-500">Alumni Class of {user?.profile?.graduationYear || 2020}</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mentorship Status</span>
                      <span className="text-sm font-bold text-emerald-700 block">Open for 1-on-1 Syncs</span>
                      <span className="text-[11px] text-slate-500">Reviews 80+ rated candidates</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Referral Channel</span>
                      <span className="text-sm font-bold text-blue-700 block">Internal Referrals Active</span>
                      <span className="text-[11px] text-slate-500">Google, Stripe & Meta pipeline</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Mentorship Capacity & Candidate Guidelines */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>Mentorship Focus & Candidate Expectations</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    What this alumni mentor evaluates when reviewing connection requests
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs text-slate-700">
                  <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
                    <h4 className="font-bold text-purple-900 text-sm">Mentoring Principles & Guidance</h4>
                    <p className="leading-relaxed text-slate-600">
                      "I help aspiring software engineers master distributed systems design, clean code architecture, and high-impact technical interview communication. Candidates requesting connection should demonstrate verifiable repository evidence and an 80+ audit score."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Specialized Mentorship Areas
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                        <span className="font-semibold text-slate-900 block">System Design & Architecture</span>
                        <span className="text-slate-500 text-[11px]">Scalability, caching tradeoffs, message queues, and microservice decoupling.</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                        <span className="font-semibold text-slate-900 block">Mock Interviews & Referrals</span>
                        <span className="text-slate-500 text-[11px]">Targeted mock sessions and internal referral submissions for qualified graduates.</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL (WITH MANUAL SKILLS SELECTOR & PHOTO & LINKEDIN)       */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span>Edit AlumniConnect Profile</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Photo & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">First Name</label>
                  <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Last Name</label>
                  <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                </div>
              </div>

              {/* Profile Photo URL */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-slate-500" />
                  <span>Profile Photo URL</span>
                </label>
                <Input
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or avatar link"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description / Overview</label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Write a clear bio about your engineering focus, project goals, or mentoring style..."
                />
              </div>

              {/* Branch & Passing Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Branch / Academic Department</label>
                  <Input value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Passing Year Details</label>
                  <Input
                    type="number"
                    value={editGradYear}
                    onChange={(e) => setEditGradYear(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Alumni-specific: Company, Position, Experience */}
              {isAlumni && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Currently Working Company</label>
                    <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} placeholder="e.g. Google" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Position / Title</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="e.g. Senior Staff Engineer" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Experience Level</label>
                    <Input value={editExperienceLevel} onChange={(e) => setEditExperienceLevel(e.target.value)} placeholder="e.g. Staff Level (7+ Years)" />
                  </div>
                </div>
              )}

              {/* Social / Dev Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <Input
                    value={editLinkedinUrl}
                    onChange={(e) => setEditLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-slate-800" />
                    <span>GitHub Username</span>
                  </label>
                  <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} />
                </div>
              </div>

              {/* Student Coding Platform */}
              {!isAlumni && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Coding Platform</label>
                    <select
                      value={editCodingPlatform}
                      onChange={(e) => setEditCodingPlatform(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="LeetCode">LeetCode</option>
                      <option value="Codeforces">Codeforces</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="CodeChef">CodeChef</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Coding Platform Handle (@)</label>
                    <Input value={editCodingHandle} onChange={(e) => setEditCodingHandle(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Manual Technical Skills Multi-Selection Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Select Technical Skills (Click to toggle)
                  </label>
                  <span className="text-[11px] text-slate-500">{selectedSkills.length} selected</span>
                </div>

                {/* Categorized Skills Picker */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {Object.entries(SKILLS_CATALOG).map(([category, skills]) => (
                    <div key={category} className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-2xs"
                                  : "bg-white text-slate-700 border border-slate-200 hover:border-blue-400"
                              }`}
                            >
                              <span>{skill}</span>
                              {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2 pt-1">
                  <Input
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="Add custom skill (e.g. PyTorch, WebRTC)..."
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    onClick={addCustomSkill}
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-9 text-xs"
                  >
                    Add Skill
                  </Button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save AlumniConnect Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading Profile...</div>}>
      <ProfileInner />
    </Suspense>
  );
}
