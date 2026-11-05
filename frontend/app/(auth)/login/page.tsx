"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Users,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loginAccount } from "@/services/api-client";
import { UserRole } from "@/types";

const SAVED_CREDENTIALS_KEY = "alumniconnect_remembered_credentials";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoleParam = searchParams.get("role");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "ALUMNI">(
    initialRoleParam === "ALUMNI" ? "ALUMNI" : "STUDENT",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialRoleParam === "ALUMNI") {
      setSelectedRole("ALUMNI");
    } else if (initialRoleParam === "STUDENT") {
      setSelectedRole("STUDENT");
    }
  }, [initialRoleParam]);

  // Restore stored credentials on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.password) setPassword(parsed.password);
        if (parsed.role) setSelectedRole(parsed.role);
        setRememberMe(true);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const auth = await loginAccount({ email, password, role: selectedRole });

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem(
          SAVED_CREDENTIALS_KEY,
          JSON.stringify({ email, password, role: selectedRole }),
        );
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }

      // Route according to user role
      if (auth.user.role === "ALUMNI") {
        router.push("/connections"); // Alumni sees Candidate Requests raised by students!
      } else {
        router.push("/candidate-validation"); // Student judges their score!
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const fillDemoStudent = () => {
    setSelectedRole("STUDENT");
    setEmail("student.alex@university.edu");
    setPassword("DemoPassword2026!");
    setRememberMe(true);
    setError("");
  };

  const fillDemoAlumni = () => {
    setSelectedRole("ALUMNI");
    setEmail("alumni.sarah@google.com");
    setPassword("DemoPassword2026!");
    setRememberMe(true);
    setError("");
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-slate-50/50">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm mb-1 font-bold text-xl">
            AC
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to AlumniConnect
          </CardTitle>
          <CardDescription className="text-xs">
            Select your account type to access candidate score evaluations or mentor tools.
          </CardDescription>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold mt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("STUDENT");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                selectedRole === "STUDENT"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("ALUMNI");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
                selectedRole === "ALUMNI"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Alumni Portal</span>
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

            {/* Role Helper Banner */}
            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              selectedRole === "STUDENT"
                ? "bg-blue-50/70 border-blue-200 text-blue-800"
                : "bg-purple-50/70 border-purple-200 text-purple-800"
            }`}>
              <div className="flex items-center gap-2">
                {selectedRole === "STUDENT" ? (
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                ) : (
                  <Briefcase className="h-4 w-4 text-purple-600 shrink-0" />
                )}
                <span>
                  {selectedRole === "STUDENT"
                    ? "Candidate Mode: Score assessment & alumni discovery"
                    : "Mentor Mode: Community posts & candidate request review"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={selectedRole === "STUDENT" ? "student.alex@university.edu" : "alumni.sarah@google.com"}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="h-10 text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember my login credentials
              </label>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick Demo Accounts:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoStudent}
                  className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Student (Alex)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoAlumni}
                  className="text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Alumni (Sarah @ Google)
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className={`w-full font-semibold ${
                selectedRole === "STUDENT"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {submitting ? "Signing In..." : `Sign In as ${selectedRole === "STUDENT" ? "Student" : "Alumni"}`}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?role=${selectedRole}`}
                className="font-semibold text-brand-orange hover:underline"
              >
                Create a {selectedRole.toLowerCase()} account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[85vh] items-center justify-center text-sm text-slate-500">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
