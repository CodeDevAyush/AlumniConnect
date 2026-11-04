import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Users,
  Compass,
  GraduationCap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6 px-4 py-1.5 text-xs font-semibold gap-1.5 inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Alumni Intelligence Engine
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto">
            Your Campus Network,{" "}
            <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">
              Activated.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Bridge the gap between current students and verified university alumni. Discover industry mentors, unlock internal referrals, and accelerate career trajectories.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Join the Network
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/discovery">
              <Button variant="outline" size="lg" className="gap-2">
                <Compass className="h-5 w-5" />
                Explore Directory
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-slate-200 bg-white/50 backdrop-blur py-8 max-w-5xl mx-auto rounded-2xl shadow-sm">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Verified Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">3.8x</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Faster Referral Rate</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">500+</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Partner Companies</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">AI Match</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Skill Gap Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Meaningful Professional Connections
          </h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Traditional alumni networks suffer from outdated emails and low response rates. AlumniConnect is active, verified, and outcome-oriented.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>Institutional Verification</CardTitle>
              <CardDescription>
                Every alumni profile is authenticated through university degree records and official email credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Eliminate spam and unverified outreach. Guaranteed genuine campus affiliation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle>AI Capability & Skill Matching</CardTitle>
              <CardDescription>
                Our AI service evaluates student competencies, GitHub commits, and career goals to match with relevant alumni.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Actionable skill-gap diagnostics and automated mentor recommendations powered by TF-IDF and machine learning.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle>Referral & Opportunity Pipeline</CardTitle>
              <CardDescription>
                Alumni post vetted internships, full-time openings, and express direct willingness to refer qualified students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Streamline job searches by tapping directly into alumni champions within top tech, finance, and engineering firms.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
