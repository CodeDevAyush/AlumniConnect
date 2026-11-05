"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, UserCheck } from "lucide-react";
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
import { loginAccount } from "@/services/api-client";

const SAVED_CREDENTIALS_KEY = "alumniconnect_remembered_credentials";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restore stored credentials on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_CREDENTIALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.password) setPassword(parsed.password);
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
      await loginAccount({ email, password });

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem(
          SAVED_CREDENTIALS_KEY,
          JSON.stringify({ email, password }),
        );
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }

      router.push("/candidate-validation");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const fillDemoStudent = () => {
    setEmail("student.alex@university.edu");
    setPassword("DemoPassword2026!");
    setRememberMe(true);
  };

  const fillDemoAdmin = () => {
    setEmail("admin@alumniconnect.edu");
    setPassword("AdminSecure2026!");
    setRememberMe(true);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm mb-2 font-bold text-xl">
            AC
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to AlumniConnect
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your candidate evaluation and campus network.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-500" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-500" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {/* Remember Me / Store Credentials Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Remember &amp; store credentials on this device</span>
              </label>
            </div>

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In to Candidate Dashboard"}
            </Button>

            {/* 1-Click Demo Credentials Pill */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">
                Instant Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoStudent}
                  className="text-xs gap-1.5 border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Pre-fill Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoAdmin}
                  className="text-xs gap-1.5 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pre-fill Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
