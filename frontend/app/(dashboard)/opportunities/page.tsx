"use client";

import { Briefcase, Building, MapPin, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_OPPORTUNITIES = [
  {
    id: "1",
    title: "Cloud Systems Software Engineer Intern - Summer 2026",
    company: "Google",
    location: "Sunnyvale, CA (Hybrid)",
    type: "INTERNSHIP",
    author: "Sarah Chen (Class of '19)",
    requirements: ["Go", "Distributed Systems", "Data Structures"],
    description: "Work on high-throughput backend services powering Google Cloud infrastructure.",
  },
  {
    id: "2",
    title: "Junior Backend Engineer - Distributed Core",
    company: "Stripe",
    location: "Seattle, WA",
    type: "FULL_TIME",
    author: "Marcus Vance (Class of '20)",
    requirements: ["TypeScript", "Node.js", "PostgreSQL", "System Design"],
    description: "Design resilient payment orchestration APIs processing billions in transactions.",
  },
];

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni-Posted Opportunities</h1>
          <p className="text-sm text-slate-500">Vetted internships and entry-level positions backed by alumni champions</p>
        </div>
        <Button size="sm">Post an Opportunity</Button>
      </div>

      <div className="mt-8 space-y-4">
        {MOCK_OPPORTUNITIES.map((opp) => (
          <Card key={opp.id} className="hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                    <Badge variant={opp.type === "INTERNSHIP" ? "secondary" : "default"}>
                      {opp.type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-3 mt-1 text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Building className="h-3.5 w-3.5" />
                      {opp.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {opp.location}
                    </span>
                    <span>•</span>
                    <span className="text-xs text-blue-600 font-medium">Shared by {opp.author}</span>
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-1.5 self-start sm:self-auto">
                  Apply / Request Referral
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{opp.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {opp.requirements.map((req) => (
                  <Badge key={req} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
