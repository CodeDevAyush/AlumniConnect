"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Users,
  Building,
  Mail,
  Lock,
  User,
  Github,
  Code2,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { registerAccount } from "@/services/api-client";
import { UserRole } from "@/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoleParam = searchParams.get("role");
  const [role, setRole] = useState<"STUDENT" | "ALUMNI">(
    initialRoleParam === "ALUMNI" ? "ALUMNI" : "STUDENT",
  );

  // Common credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [graduationYear, setGraduationYear] = useState<number>(2026);

  // Student Profile Fields
  const [githubUsername, setGithubUsername] = useState("");
  const [codingPlatform, setCodingPlatform] = useState("LeetCode");
  const [codingHandle, setCodingHandle] = useState("");
  const [targetRoles, setTargetRoles] = useState("Software Engineer, Backend Developer");

  // Alumni Profile Fields
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");
  const [skills, setSkills] = useState("Go, Kubernetes, Distributed Systems");
  const [willingToMentor, setWillingToMentor] = useState(true);
  const [willingToRefer, setWillingToRefer] = useState(true);
  const [bio, setBio] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialRoleParam === "ALUMNI") {
      setRole("ALUMNI");
      setGraduationYear(2020);
    } else if (initialRoleParam === "STUDENT") {
      setRole("STUDENT");
      setGraduationYear(2026);
    }
  }, [initialRoleParam]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const targetRolesArray = targetRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      await registerAccount({
        email,
        password,
        role,
        firstName,
        lastName,
        department,
        graduationYear: Number(graduationYear),
        githubUsername: role === "STUDENT" ? githubUsername : undefined,
        codingPlatform: role === "STUDENT" ? codingPlatform : undefined,
        codingHandle: role === "STUDENT" ? codingHandle || githubUsername : undefined,
        targetRoles: role === "STUDENT" ? targetRolesArray : undefined,
        company: role === "ALUMNI" ? company : undefined,
        title: role === "ALUMNI" ? title : undefined,
        location: role === "ALUMNI" ? location : undefined,
        skills: role === "ALUMNI" ? skillsArray : undefined,
        willingToMentor: role === "ALUMNI" ? willingToMentor : undefined,
        willingToRefer: role === "ALUMNI" ? willingToRefer : undefined,
        bio: role === "ALUMNI" ? bio : undefined,
      });

      if (role === "ALUMNI") {
        router.push("/connections"); // Alumni lands on candidate requests
      } else {
        router.push("/candidate-validation"); // Student lands on score judge
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 bg-slate-50/50">
      <Card className="w-full max-w-2xl shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm mb-1 font-bold text-xl">
            AC
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Create Your AlumniConnect Profile
          </CardTitle>
          <CardDescription className="text-xs">
            Complete your profile to generate your campus presence and activate network access.
          </CardDescription>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold mt-4">
            <button
              type="button"
              onClick={() => {
                setRole("STUDENT");
                setGraduationYear(2026);
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md transition-all ${
                role === "STUDENT"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Register as Student / Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("ALUMNI");
                setGraduationYear(2020);
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md transition-all ${
                role === "ALUMNI"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Register as Alumni / Mentor</span>
            </button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div role="alert" className="p-3 text-xs rounded-md bg-red-50 text-red-700 border border-red-200 font-medium">
                {error}
              </div>
            )}

            {/* Section 1: Account Credentials */}
            <div className="border-b border-slate-200 pb-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                1. Account Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === "STUDENT" ? "student@university.edu" : "alumni@company.com"}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Password (min 8 characters)</label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Academic Profile */}
            <div className="border-b border-slate-200 pb-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                2. Basic Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">First Name</label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alex"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Johnson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Department / Major</label>
                  <Input
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & AI"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {role === "STUDENT" ? "Expected Graduation Year" : "Graduation Year"}
                  </label>
                  <Input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Role-Specific Profile Details */}
            {role === "STUDENT" ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-blue-600" />
                  3. Candidate Coding Profiles (For Code Quality Evaluation)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Github className="h-3.5 w-3.5 text-slate-600" />
                      GitHub Username
                    </label>
                    <Input
                      required
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. CodeDevAyush"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Coding Platform Handle (LeetCode)</label>
                    <Input
                      value={codingHandle}
                      onChange={(e) => setCodingHandle(e.target.value)}
                      placeholder="e.g. alex_code"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Target Engineering Roles</label>
                  <Input
                    value={targetRoles}
                    onChange={(e) => setTargetRoles(e.target.value)}
                    placeholder="e.g. Backend Software Engineer, ML Engineer, Distributed Systems"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-purple-600" />
                  3. Professional Alumni & Mentorship Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Current Company</label>
                    <Input
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google, Stripe, Meta, Amazon"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Current Job Title</label>
                    <Input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Staff Software Engineer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      Office Location
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Key Skills (comma separated)</label>
                    <Input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Go, Kubernetes, TypeScript, PyTorch"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mentorship Focus / Bio</label>
                  <Textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share what areas of engineering, system design, or interview prep you guide students on..."
                  />
                </div>

                <div className="flex items-center gap-6 pt-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={willingToMentor}
                      onChange={(e) => setWillingToMentor(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    Willing to Mentor Students
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={willingToRefer}
                      onChange={(e) => setWillingToRefer(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    Willing to Provide Referrals for 80+ Rated Candidates
                  </label>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              disabled={submitting}
              className={`w-full font-semibold ${
                role === "STUDENT"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {submitting ? "Generating Profile..." : `Complete ${role === "STUDENT" ? "Student" : "Alumni"} Registration`}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                href={`/login?role=${role}`}
                className="font-semibold text-brand-orange hover:underline"
              >
                Sign in to your {role.toLowerCase()} account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[90vh] items-center justify-center text-sm text-slate-500">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
