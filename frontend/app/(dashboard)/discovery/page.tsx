"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Building,
  MapPin,
  Sparkles,
  Filter,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getConnectionEligibility,
  getMyConnections,
  requestAlumniConnection,
  searchAlumni,
  getCurrentUser,
} from "@/services/api-client";
import { ConnectionEligibility } from "@/types";

interface AlumniItem {
  id: string;
  name: string;
  company: string;
  title: string;
  department: string;
  gradYear: number;
  location: string;
  skills: string[];
  willingToMentor: boolean;
  willingToRefer: boolean;
  isTopTier: boolean;
}

const MOCK_ALUMNI: AlumniItem[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Sarah Chen",
    company: "Google",
    title: "Senior Staff Software Engineer",
    department: "Computer Science",
    gradYear: 2019,
    location: "San Francisco, CA",
    skills: ["Go", "Kubernetes", "Distributed Systems", "Cloud Architecture"],
    willingToMentor: true,
    willingToRefer: true,
    isTopTier: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Marcus Vance",
    company: "Stripe",
    title: "Lead Infrastructure Engineer",
    department: "Computer Science",
    gradYear: 2020,
    location: "New York, NY",
    skills: ["TypeScript", "Node.js", "PostgreSQL", "AWS"],
    willingToMentor: true,
    willingToRefer: false,
    isTopTier: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Priya Sharma",
    company: "Meta",
    title: "Machine Learning Engineer",
    department: "Data Science & AI",
    gradYear: 2021,
    location: "Seattle, WA",
    skills: ["Python", "PyTorch", "NLP", "FastAPI"],
    willingToMentor: true,
    willingToRefer: true,
    isTopTier: true,
  },
];

export default function DiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [alumniList, setAlumniList] = useState<AlumniItem[]>(MOCK_ALUMNI);
  const [eligibility, setEligibility] = useState<ConnectionEligibility | null>(null);
  const [eligibilityError, setEligibilityError] = useState("");
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const currentUser = getCurrentUser();

  useEffect(() => {
    let active = true;

    // Load alumni list
    searchAlumni()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setAlumniList(data);
        }
      })
      .catch(() => {
        // Fallback to initial mock alumni
      });

    getConnectionEligibility()
      .then((result) => {
        if (active) setEligibility(result);
      })
      .catch(() => {
        if (active) setEligibilityError("Sign in to check candidate assessment rating & eligibility.");
      });

    getMyConnections()
      .then((connections) => {
        if (active) {
          setRequestedIds(
            connections
              .filter((connection) => connection.status === "PENDING" || connection.status === "ACCEPTED")
              .map((connection) => connection.receiverId),
          );
        }
      })
      .catch(() => {
        // Ignore if unauthenticated
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleConnect(receiverId: string) {
    setRequestError("");
    setRequestMessage("");
    setRequestingId(receiverId);
    try {
      await requestAlumniConnection(receiverId);
      setRequestedIds((current) => [...current, receiverId]);
      setRequestMessage("Connection request successfully sent to top alumni mentor!");
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Could not send connection request. Score of 80+ required.",
      );
    } finally {
      setRequestingId(null);
    }
  }

  const filteredAlumni = alumniList.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.skills && a.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))),
  );

  const candidateScore = eligibility?.latestScore ?? null;
  const isScoreUnlocked = eligibility?.eligible || (candidateScore !== null && candidateScore >= 80);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Directory & Discovery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with verified graduates and industry leaders from Google, Stripe, and Meta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1 py-1 px-3 bg-brand-orange text-white">
            <Sparkles className="h-3 w-3" />
            AI Smart Match Available
          </Badge>
        </div>
      </div>

      {/* Candidate Rating Gate Card (80+ Threshold Status) */}
      <div className="rounded-xl border shadow-sm overflow-hidden">
        {eligibility ? (
          isScoreUnlocked ? (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-300 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Unlock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-900 text-lg">
                      Top Alumni Connect: UNLOCKED
                    </span>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5">
                      Rating: {candidateScore}/100 (80+ Reached)
                    </Badge>
                  </div>
                  <p className="text-sm text-emerald-800 mt-1 max-w-2xl">
                    Outstanding achievement! Your candidate assessment score of <strong>{candidateScore}/100</strong> exceeds the 80+ threshold. You have full access to send connection and mentorship requests to senior alumni.
                  </p>
                </div>
              </div>
              <Link href="/candidate-validation">
                <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-800 hover:bg-emerald-100 whitespace-nowrap">
                  View Assessment Evidence
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-300 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-900 text-lg">
                      Top Alumni Connect: LOCKED (80+ Rating Required)
                    </span>
                    {candidateScore !== null ? (
                      <Badge variant="outline" className="border-amber-500 bg-amber-100 text-amber-900 font-bold text-xs px-2 py-0.5">
                        Current Rating: {candidateScore}/100
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 bg-amber-100 text-amber-900 font-bold text-xs px-2 py-0.5">
                        Not Yet Evaluated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-amber-800 mt-1 max-w-2xl">
                    To connect directly with Top Tier Alumni (Staff & Senior Engineers at Google, Stripe, Meta), a verified candidate rating of <strong>80+</strong> is required.
                    {candidateScore !== null
                      ? ` You are currently at ${candidateScore}/100.`
                      : " Complete your GitHub and Project Code Quality evaluation to calculate your rating."}
                  </p>

                  {/* Progress Indicator towards 80 */}
                  {candidateScore !== null && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-48 bg-amber-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (candidateScore / 80) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-amber-800">
                        {candidateScore} / 80 Target Score
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link href="/candidate-validation">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold whitespace-nowrap gap-1.5 shadow-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Boost Score on Assessment</span>
                </Button>
              </Link>
            </div>
          )
        ) : (
          <div className="bg-slate-50 border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg">
                  Candidate Rating & Top Alumni Access
                </span>
                <p className="text-sm text-slate-600 mt-1">
                  {eligibilityError || "Sign in and evaluate your repository code quality to reach an 80+ rating and connect with top mentors."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/candidate-validation">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Assessment
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Success / Error Messages */}
      {(requestError || requestMessage) && (
        <div
          role={requestError ? "alert" : "status"}
          className={`p-3.5 rounded-lg text-sm font-medium border ${
            requestError
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {requestError || requestMessage}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, or technical skill (e.g. Google, Distributed Systems)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Alumni Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredAlumni.map((alumni) => {
          const isRequested = requestedIds.includes(alumni.id);
          const isRequesting = requestingId === alumni.id;

          return (
            <Card
              key={alumni.id}
              className={`hover:border-blue-400 transition-all flex flex-col justify-between shadow-sm ${
                alumni.isTopTier ? "border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-1.5 text-slate-900">
                      {alumni.name}
                      <span title="Verified Alumni">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      </span>
                    </CardTitle>
                    <CardDescription className="text-slate-700 font-medium mt-0.5">
                      {alumni.title}
                    </CardDescription>
                  </div>

                  {alumni.isTopTier && (
                    <Badge className="bg-amber-500/10 text-amber-800 border-amber-300 font-semibold text-[11px] gap-1 shrink-0 py-0.5">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Top Alumni
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{alumni.company}</span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{alumni.location}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {alumni.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[11px] bg-slate-100 text-slate-700">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  {alumni.willingToMentor && (
                    <Badge variant="success" className="text-[10px]">
                      Mentoring Open
                    </Badge>
                  )}
                  {alumni.willingToRefer && (
                    <Badge variant="default" className="text-[10px]">
                      Referrals Open
                    </Badge>
                  )}
                  {alumni.isTopTier && (
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-800 bg-amber-50/50">
                      Requires 80+ Rating
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-slate-100 flex gap-2">
                <Button size="sm" variant="outline" className="w-1/2 text-xs">
                  View Profile
                </Button>

                {alumni.isTopTier && !isScoreUnlocked ? (
                  <Link href="/candidate-validation" className="w-1/2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs gap-1 border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                      title="An assessment rating of 80+ is required to connect with Top Alumni"
                    >
                      <Lock className="h-3 w-3 text-amber-600" />
                      <span>80+ Needed</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    className={`w-1/2 text-xs font-semibold ${
                      isScoreUnlocked
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={isRequested || isRequesting}
                    onClick={() => handleConnect(alumni.id)}
                  >
                    {isRequested ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Requested
                      </span>
                    ) : isRequesting ? (
                      "Sending..."
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
