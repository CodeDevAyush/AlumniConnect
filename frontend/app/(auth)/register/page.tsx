"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { registerAccount } from "@/services/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ALUMNI">("STUDENT");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerAccount({ email, password, role });
      router.push("/candidate-validation");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Register to start your candidate profile assessment.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="role"
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={role}
                onChange={(event) => setRole(event.target.value as "STUDENT" | "ALUMNI")}
              >
                <option value="STUDENT">Student</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-xs text-slate-500">Use at least 12 characters.</p>
            </div>
            <p className="text-xs text-amber-700">
              Email verification is not implemented yet. This authentication is a development
              foundation, not production-ready account security.
            </p>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
