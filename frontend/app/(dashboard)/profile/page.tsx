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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser, searchAlumni, notifyAuthChange } from "@/services/api-client";

// Generate realistic LeetCode-style activity heatmap data (52 weeks x 7 days)
function generateHeatmap() {
  const weeks = 40;
  const daysPerWeek = 7;
  const grid: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < daysPerWeek; d++) {
      // Create interesting pattern with higher activity towards weekends and midweeks
      const seed = (w * 7 + d) % 17;
      if (seed === 0 || seed === 3 || seed === 7) week.push(3);
      else if (seed === 2 || seed === 5 || seed === 11) week.push(2);
      else if (seed % 2 === 0) week.push(1);
      else week.push(0);
    }
    grid.push(week);
  }
  return grid;
}

const HEATMAP_COLORS = [
  "bg-slate-100", // 0
  "bg-emerald-200", // 1
  "bg-emerald-400", // 2
  "bg-emerald-600", // 3
];

function ProfileInner() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [heatmap] = useState(generateHeatmap);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editGradYear, setEditGradYear] = useState(2026);
  const [editGithub, setEditGithub] = useState("");
  const [editCodingHandle, setEditCodingHandle] = useState("");
  const [editCodingPlatform, setEditCodingPlatform] = useState("LeetCode");
  const [editSkills, setEditSkills] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [requestedId]);

  async function loadProfile() {
    const current = getCurrentUser();

    if (requestedId && requestedId !== current?.id) {
      // Find requested user in alumni
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
              company: found.company,
              title: found.title,
              department: found.department,
              graduationYear: found.gradYear,
              location: found.location,
              skills: found.skills,
              bio: `Senior engineering alumni at ${found.company} specializing in ${found.skills.slice(0, 3).join(", ")}.`,
              githubUsername: found.name.toLowerCase().replace(/\s+/g, ""),
              codingPlatform: "LeetCode",
              codingHandle: found.name.toLowerCase().replace(/\s+/g, "_"),
            },
          });
          return;
        }
      } catch {
        // Fallback to current
      }
    }

    if (current) {
      setUser(current);
      setEditFirstName(current.profile?.firstName || "");
      setEditLastName(current.profile?.lastName || "");
      setEditBio(current.profile?.bio || "");
      setEditDepartment(current.profile?.department || "Computer Science & Engineering");
      setEditGradYear(current.profile?.graduationYear || (current.role === "ALUMNI" ? 2020 : 2026));
      setEditGithub(current.profile?.githubUsername || "CodeDevAyush");
      setEditCodingHandle(current.profile?.codingHandle || "alex_dev");
      setEditCodingPlatform(current.profile?.codingPlatform || "LeetCode");
      setEditSkills((current.profile?.skills || ["TypeScript", "Go", "Distributed Systems", "PostgreSQL", "Docker"]).join(", "));
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
        department: editDepartment.trim(),
        graduationYear: Number(editGradYear),
        githubUsername: editGithub.trim(),
        codingHandle: editCodingHandle.trim(),
        codingPlatform: editCodingPlatform,
        skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean),
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
    : user?.email || "Community Member";

  const skillsList: string[] = user?.profile?.skills && user.profile.skills.length > 0
    ? user.profile.skills
    : isAlumni
    ? ["Distributed Systems", "Cloud Infrastructure", "Kubernetes", "Go", "PostgreSQL"]
    : ["TypeScript", "Next.js", "Node.js", "Docker", "PostgreSQL", "Python"];

  const candidateScore = isAlumni ? 96 : 88;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main LeetCode-Style Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: USER IDENTITY CARD (LeetCode Profile Sidebar)               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 space-y-5">
              {/* Avatar + Main Details */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center font-extrabold text-3xl text-white uppercase shadow-md ${
                      isAlumni
                        ? "bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600"
                        : "bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-600"
                    }`}
                  >
                    {user?.profile?.firstName ? user.profile.firstName.charAt(0) : user?.email?.charAt(0) || "U"}
                  </div>
                  <span
                    title="Verified Institutional Identity"
                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mt-3 flex items-center gap-1.5">
                  {fullName}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  @{user?.profile?.codingHandle || user?.email?.split("@")[0] || "user"}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  <Badge
                    className={`text-[10px] font-bold ${
                      isAlumni
                        ? "bg-purple-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isAlumni ? "Senior Alumni Mentor" : "Candidate Student"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800 bg-emerald-50">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600 inline" />
                    Verified ID
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
                    <span>Edit Profile</span>
                  </Button>
                )}
              </div>

              {/* Bio summary */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                {user?.profile?.bio || (
                  <span className="italic text-slate-400">
                    {isAlumni
                      ? "Staff Software Engineer passionate about cloud architecture, mentoring aspiring engineers, and high-quality code patterns."
                      : "Computer Science student specializing in distributed systems, full-stack engineering, and clean architecture."}
                  </span>
                )}
              </div>

              {/* Academic & Professional Specs */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">{user?.profile?.department || "Computer Science & Engineering"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>
                    {isAlumni ? "Alumni Class of " : "Expected Graduation: Class of "}
                    {user?.profile?.graduationYear || (isAlumni ? 2020 : 2026)}
                  </span>
                </div>
                {isAlumni && (
                  <div className="flex items-center gap-2.5">
                    <Building className="h-4 w-4 text-slate-600 shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {user?.profile?.title || "Staff Software Engineer"} • {user?.profile?.company || "Google"}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{user?.profile?.location || "San Francisco, CA • Campus Network"}</span>
                </div>
              </div>

              {/* Connected Developer Handles (LeetCode & GitHub) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Connected Platforms
                </span>

                <a
                  href={`https://github.com/${user?.profile?.githubUsername || "CodeDevAyush"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-700 border border-slate-200/80 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Github className="h-4 w-4 text-slate-900 shrink-0" />
                    <span className="font-medium truncate">github.com/{user?.profile?.githubUsername || "CodeDevAyush"}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-700 shrink-0" />
                </a>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/80">
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="font-medium truncate">
                      {user?.profile?.codingPlatform || "LeetCode"}: @{user?.profile?.codingHandle || "alex_dev"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[9px] py-0 border-amber-300 text-amber-800 bg-amber-50">
                    Linked
                  </Badge>
                </div>
              </div>

              {/* Verified Technical Skills */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Technical Skills & Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
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
        {/* RIGHT COLUMN: LEETCODE STATS, CODE AUDIT RATING & HEATMAP                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Candidate Assessment & Contest Rating Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span>Candidate Code Quality & Assessment Rating</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Calculated from static analysis, SonarQube SAST, and commit cadence
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5">
                  Rating: {candidateScore}/100
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Big LeetCode Rating Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                    <span className="text-2xl font-black">{candidateScore}</span>
                    <span className="text-[9px] font-semibold tracking-wider uppercase opacity-90">/100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">Top Alumni Tier: UNLOCKED</span>
                      <Unlock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Percentile: <strong>Top 4.2%</strong> among campus candidate submissions. Eligible to connect with Staff & Senior Mentors.
                    </p>
                  </div>
                </div>

                <Link href="/candidate-validation">
                  <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs shrink-0 whitespace-nowrap">
                    Re-Run Audit
                  </Button>
                </Link>
              </div>

              {/* 4 Core SAST Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SonarQube SAST</span>
                  <span className="text-lg font-black text-emerald-700">0 Blockers</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Pass (A)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semgrep Security</span>
                  <span className="text-lg font-black text-emerald-700">Clean</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">No Leaks / Injection</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintainability</span>
                  <span className="text-lg font-black text-blue-700">Grade A</span>
                  <span className="text-[10px] text-blue-600 font-semibold block">Cyclomatic Low</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Test Coverage</span>
                  <span className="text-lg font-black text-purple-700">82.4%</span>
                  <span className="text-[10px] text-purple-600 font-semibold block">20/20 Passing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. LeetCode Submissions & Activity Heatmap */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>Evaluation & Submission Heatmap</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    142 automated evaluations, PR audits, and mentorship syncs in the past year
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span>Less</span>
                  <div className="h-2.5 w-2.5 rounded-xs bg-slate-100"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-emerald-200"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-emerald-400"></div>
                  <div className="h-2.5 w-2.5 rounded-xs bg-emerald-600"></div>
                  <span>More</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {/* Green Squares Matrix */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-[600px]">
                  {heatmap.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((level, dIdx) => (
                        <div
                          key={dIdx}
                          title={`Day ${wIdx * 7 + dIdx}: ${level > 0 ? `${level * 2} activities` : "No activity"}`}
                          className={`h-3 w-3 rounded-xs ${HEATMAP_COLORS[level]} hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Evaluated Repositories Showcase */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-600" />
                <span>Evaluated Public Repositories</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Repositories audited by AlumniConnect automated SAST pipeline
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
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Audit: 88/100</Badge>
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL                                                        */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span>Edit LeetCode Profile Information</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">First Name</label>
                  <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Last Name</label>
                  <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Bio Summary</label>
                <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Tell mentors or mentees about your engineering focus..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department</label>
                  <Input value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Graduation Year</label>
                  <Input type="number" value={editGradYear} onChange={(e) => setEditGradYear(Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">GitHub Username</label>
                  <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Coding Handle (@)</label>
                  <Input value={editCodingHandle} onChange={(e) => setEditCodingHandle(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Technical Skills (comma-separated)</label>
                <Input value={editSkills} onChange={(e) => setEditSkills(e.target.value)} placeholder="TypeScript, Go, Distributed Systems, PostgreSQL" />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Changes
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
