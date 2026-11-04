"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MentorshipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Mentorship Programs</h1>
        <p className="text-sm text-slate-500">1-on-1 career guidance, mock interviews, and technical reviews</p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Mentorship Matcher
            </CardTitle>
            <CardDescription>
              Let our AI analyze your coursework, projects, and target companies to pair you with the best alumni mentor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start AI Assessment</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Active Mentorships
            </CardTitle>
            <CardDescription>
              Track your scheduled check-ins, action plans, and milestones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">You currently have no active mentorship cycles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
