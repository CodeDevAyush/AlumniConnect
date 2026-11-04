"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join your university's verified alumni & student community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <Input placeholder="Alex" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <Input placeholder="Rivera" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Institutional Email</label>
            <Input type="email" placeholder="name@university.edu" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
              <option value="FACULTY">Faculty Member</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Create Account</Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
