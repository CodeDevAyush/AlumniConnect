"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Sign In to AlumniConnect</CardTitle>
          <CardDescription>
            Enter your university or verified alumni credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <Input type="email" placeholder="name@university.edu" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Sign In</Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
