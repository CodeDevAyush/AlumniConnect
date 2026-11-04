"use client";

import { User, Mail, GraduationCap, Github, Linkedin, Briefcase } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-sm text-slate-500">Manage your verified university identity and credentials</p>
        </div>
        <Button size="sm">Edit Profile</Button>
      </div>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
              AR
            </div>
            <div>
              <CardTitle className="text-xl">Alex Rivera</CardTitle>
              <CardDescription>Undergraduate CS Junior | Aspiring Backend & Distributed Systems Engineer</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="default">Verified Student</Badge>
                <Badge variant="secondary">Class of 2026</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Academic Department</h4>
              <p className="text-sm font-medium text-slate-800">Computer Science & Engineering</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Verified Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "NestJS", "PostgreSQL", "Docker", "Python", "Redis"].map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
