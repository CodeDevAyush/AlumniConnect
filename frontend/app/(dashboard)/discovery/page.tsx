"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Building, MapPin, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getConnectionEligibility,
  getMyConnections,
  requestAlumniConnection,
} from "@/services/api-client";
import { ConnectionEligibility } from "@/types";

const MOCK_ALUMNI = [
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
  },
];

export default function DiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eligibility, setEligibility] = useState<ConnectionEligibility | null>(null);
  const [eligibilityError, setEligibilityError] = useState("");
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    let active = true;
    getConnectionEligibility()
      .then((result) => {
        if (active) setEligibility(result);
      })
      .catch(() => {
        if (active) setEligibilityError("Sign in to check connection eligibility.");
      });
    getMyConnections()
      .then((connections) => {
        if (active) {
          setRequestedIds(
            connections
              .filter((connection) => connection.status === "PENDING")
              .map((connection) => connection.receiverId),
          );
        }
      })
      .catch(() => {
        if (active) setEligibilityError("Sign in to check connection eligibility.");
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
      setRequestMessage("Connection request sent.");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not send connection request.");
    } finally {
      setRequestingId(null);
    }
  }

  const filteredAlumni = MOCK_ALUMNI.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Directory & Discovery</h1>
          <p className="text-sm text-slate-500">Connect with verified graduates in your target domain</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1 py-1 px-3">
            <Sparkles className="h-3 w-3" />
            AI Smart Match Available
          </Badge>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        {eligibility ? (
          eligibility.eligible ? (
            <p className="text-emerald-800">
              Eligible to connect: your latest assessment score is {eligibility.latestScore}/100.
            </p>
          ) : (
            <p className="text-slate-700">
              An assessment score greater than 80 is required to send connection requests.
              {eligibility.latestScore !== null
                ? ` Your latest score is ${eligibility.latestScore}/100.`
                : " Complete a profile assessment first."}{" "}
              <Link href="/candidate-validation" className="font-semibold text-brand-orange underline">
                Go to candidate assessment
              </Link>
            </p>
          )
        ) : (
          <p role={eligibilityError ? "alert" : "status"} className="text-slate-700">
            {eligibilityError || "Checking connection eligibility..."}
            {eligibilityError && (
              <>
                {" "}
                <Link href="/login" className="font-semibold text-brand-orange underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}
      </div>
      {(requestError || requestMessage) && (
        <p role={requestError ? "alert" : "status"} className={requestError ? "text-sm text-red-600" : "text-sm text-emerald-700"}>
          {requestError || requestMessage}
        </p>
      )}

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, or technical skill (e.g. Google, Kubernetes)..."
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

      {/* Directory Grid */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alumni) => (
          <Card key={alumni.id} className="hover:border-blue-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-1.5">
                    {alumni.name}
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                  <CardDescription className="text-slate-700 font-medium mt-0.5">
                    {alumni.title}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building className="h-3.5 w-3.5" />
                <span>{alumni.company}</span>
                <span>•</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{alumni.location}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {alumni.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[11px]">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                {alumni.willingToMentor && (
                  <Badge variant="success">Mentoring Open</Badge>
                )}
                {alumni.willingToRefer && (
                  <Badge variant="default">Referrals Open</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-slate-100 flex gap-2">
              <Button size="sm" variant="outline" className="w-full">
                View Profile
              </Button>
              <Button
                size="sm"
                className="w-full"
                disabled={!eligibility?.eligible || requestingId !== null || requestedIds.includes(alumni.id)}
                onClick={() => handleConnect(alumni.id)}
                title={
                  eligibility?.eligible
                    ? "Send a connection request"
                    : "Requires a latest assessment score greater than 80"
                }
              >
                {requestedIds.includes(alumni.id)
                  ? "Requested"
                  : requestingId === alumni.id
                    ? "Sending..."
                    : "Connect"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
