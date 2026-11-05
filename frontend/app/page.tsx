import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  Code2,
  FileCheck,
  TrendingUp,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Introduction Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24 bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pb-16">
          <Badge variant="default" className="mb-6 px-4 py-1.5 text-xs font-semibold gap-1.5 inline-flex bg-brand-orange text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Campus Network & Code Quality Intelligence
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto">
            Your Campus Network,{" "}
            <span className="text-brand-orange underline decoration-brand-gold underline-offset-8">
              Activated.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between current students and verified university alumni. Student candidates judge their code quality score to reach an <strong>80+ rating</strong>, while alumni mentors share engineering updates and review connection requests.
          </p>

          {/* Two Distinct Portals (Student vs Alumni) */}
          <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Student Card */}
            <Card className="border-blue-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-blue-50/30 flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 font-semibold text-xs">
                    Candidate Portal
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mt-4">
                  For Students & Candidates
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 mt-1">
                  Evaluate your repository code quality and unlock direct mentorship with top alumni.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm text-slate-700 pb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Connect public GitHub & LeetCode profiles</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>SonarQube & Semgrep SAST security code evaluation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>80+ Rating Gate</strong>: Unlock connection requests to Google, Stripe, and Meta mentors</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-slate-100 flex gap-2">
                <Link href="/login?role=STUDENT" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs">
                    <LogIn className="h-3.5 w-3.5" />
                    Student Sign In
                  </Button>
                </Link>
                <Link href="/register?role=STUDENT" className="flex-1">
                  <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 gap-1 text-xs">
                    <UserPlus className="h-3.5 w-3.5" />
                    Register
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Alumni Card */}
            <Card className="border-purple-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50/30 flex flex-col justify-between">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700 font-semibold text-xs">
                    Mentor Portal
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mt-4">
                  For Alumni & Mentors
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 mt-1">
                  Publish engineering insights to the community feed and review qualified student requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm text-slate-700 pb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Publish tech updates, system design tips & referral cycles</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Review student connection requests with verified 80+ ratings</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>One-click Accept or Decline candidate requests with zero noise</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-slate-100 flex gap-2">
                <Link href="/login?role=ALUMNI" className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs">
                    <LogIn className="h-3.5 w-3.5" />
                    Alumni Sign In
                  </Button>
                </Link>
                <Link href="/register?role=ALUMNI" className="flex-1">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 gap-1 text-xs">
                    <UserPlus className="h-3.5 w-3.5" />
                    Register
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Institutional Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border border-slate-200 bg-white py-6 px-4 max-w-4xl mx-auto rounded-2xl shadow-sm">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Verified Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">80+</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Score Threshold</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">Google • Stripe</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">Mentor Network</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">SAST + Quality</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">SonarQube & Semgrep</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Meaningful, Verified Professional Connections
          </h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto text-sm">
            Traditional alumni networks suffer from unverified cold messages and low response rates. AlumniConnect is merit-validated, noise-free, and outcome-oriented.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Candidate Code Quality Gate</CardTitle>
              <CardDescription>
                Automated SonarQube metrics, cognitive complexity rating, test coverage, and Semgrep SAST security checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Only candidates achieving an 80+ rating unlock connection requests to senior alumni, guaranteeing high-signal interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Exclusive Mentor Community Feed</CardTitle>
              <CardDescription>
                Mentors share real-world engineering updates, system design patterns, and company hiring windows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Students learn directly from staff and senior engineers at leading tech companies and stay informed on referral timelines.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Noise-Free Request Management</CardTitle>
              <CardDescription>
                Alumni receive structured connection requests with full candidate rating proof, GitHub evidence, and clean profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Mentors can accept or decline requests in one click, keeping their mentorship pipeline organized and impactful.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
