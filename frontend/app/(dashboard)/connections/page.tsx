"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building,
  Github,
  Mail,
  ArrowRight,
  ExternalLink,
  Filter,
  UserCheck,
} from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyConnections, respondToConnectionRequest, getCurrentUser } from "@/services/api-client";
import { ConnectionRequest } from "@/types";

export default function ConnectionsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const isAlumni = currentUser?.role === "ALUMNI";

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    setLoading(true);
    try {
      const data = await getMyConnections();
      setRequests(data || []);
    } catch {
      setError("Sign in to view your connections and requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResponse(requestId: string, status: "ACCEPTED" | "DECLINED") {
    setProcessingId(requestId);
    setActionError("");
    setActionSuccess("");

    try {
      await respondToConnectionRequest(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
      setActionSuccess(`Connection request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setProcessingId(null);
    }
  }

  // Filter for Alumni: requests where candidate sent to this alumni
  const incomingRequests = isAlumni
    ? requests.filter((r) => r.receiverId === currentUser?.id || r.receiverId === "00000000-0000-4000-8000-000000000001")
    : [];

  const pendingIncoming = incomingRequests.filter((r) => r.status === "PENDING");
  const acceptedIncoming = incomingRequests.filter((r) => r.status === "ACCEPTED");

  // For Student: requests sent by student
  const studentSentRequests = !isAlumni
    ? requests.filter((r) => r.requesterId === currentUser?.id || !isAlumni)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {isAlumni ? "Candidate Connection Requests" : "My Network & Sent Requests"}
            </h1>
            <Badge
              variant="outline"
              className={`font-semibold text-xs ${
                isAlumni
                  ? "border-purple-300 text-purple-700 bg-purple-50"
                  : "border-blue-300 text-blue-700 bg-blue-50"
              }`}
            >
              {isAlumni ? "Mentor Review Center" : "Candidate Status"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isAlumni
              ? "Review and respond to candidate connection requests raised by verified 80+ rated students."
              : "Track the status of your connection requests sent to alumni mentors."}
          </p>
        </div>

        <div>
          {isAlumni ? (
            <Link href="/community">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs">
                <span>Share Mentor Update</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/discovery">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs">
                <span>Discover More Alumni</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Notifications */}
      {(actionSuccess || actionError) && (
        <div
          role={actionError ? "alert" : "status"}
          className={`p-3.5 rounded-lg text-sm font-medium border ${
            actionError
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {actionSuccess || actionError}
        </div>
      )}

      {/* Main Body */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading requests...</p>
        </div>
      ) : error ? (
        <Card className="py-12 text-center border-dashed">
          <CardContent>
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">Sign In Required</CardTitle>
            <CardDescription className="mt-1">{error}</CardDescription>
            <Link href="/login">
              <Button className="mt-5">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      ) : isAlumni ? (
        /* ALUMNI VIEW: INCOMING REQUESTS RAISED BY CANDIDATES */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">
              Pending Candidate Requests ({pendingIncoming.length})
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-sm font-medium text-slate-500">
              Accepted Mentees ({acceptedIncoming.length})
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <Card className="text-center py-14 border-dashed">
              <CardContent className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-slate-800">No Candidate Requests Raised Yet</CardTitle>
                <CardDescription className="max-w-md mt-1 text-sm text-slate-500">
                  When qualified students with 80+ assessment scores request a connection, their request with full score proof will appear here.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {incomingRequests.map((request) => {
                const isPending = request.status === "PENDING";
                const isAccepted = request.status === "ACCEPTED";
                const isDeclined = request.status === "DECLINED";

                return (
                  <Card key={request.id} className="border-slate-200 hover:border-purple-300 transition-all shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                            {request.requesterName || "Candidate Student"}
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500 mt-0.5">
                            {request.requesterEmail || "Candidate Student"}
                          </CardDescription>
                        </div>

                        {/* Verified Score Badge */}
                        <div className="flex flex-col items-end">
                          <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1 py-0.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Rating: {request.requesterScore ?? 88}/100</span>
                          </Badge>
                          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">80+ Qualified</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-3 text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          Requested on: {new Date(request.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {request.requesterGithub && (
                        <div className="flex items-center gap-2">
                          <Github className="h-3.5 w-3.5 text-slate-700" />
                          <a
                            href={`https://github.com/${request.requesterGithub}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>github.com/{request.requesterGithub}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      <div className="pt-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Status:</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isAccepted
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : isDeclined
                              ? "border-slate-300 bg-slate-50 text-slate-600"
                              : "border-amber-300 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </CardContent>

                    {/* Action Buttons for Alumni */}
                    <CardFooter className="pt-3 border-t border-slate-100 flex gap-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            disabled={processingId === request.id}
                            onClick={() => handleResponse(request.id, "ACCEPTED")}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === request.id}
                            onClick={() => handleResponse(request.id, "DECLINED")}
                            className="w-1/2 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </Button>
                        </>
                      ) : isAccepted ? (
                        <div className="w-full flex items-center justify-between text-xs text-emerald-800 font-semibold p-1">
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                            Connected as Mentee
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal">Contact info shared</span>
                        </div>
                      ) : (
                        <div className="w-full text-center text-xs text-slate-500 p-1">
                          Request Declined
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* STUDENT VIEW: OUTGOING REQUESTS SENT TO MENTORS */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">
              Sent Connection Requests ({studentSentRequests.length})
            </span>
          </div>

          {studentSentRequests.length === 0 ? (
            <Card className="text-center py-14 border-dashed">
              <CardContent className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-slate-800">No Connection Requests Sent Yet</CardTitle>
                <CardDescription className="max-w-md mt-1 text-sm text-slate-500">
                  Judge your code quality on Candidate Assessment (reach 80+ rating) and explore the directory to connect with alumni from Google, Stripe, and Meta.
                </CardDescription>
                <div className="flex gap-3 mt-5">
                  <Link href="/candidate-validation">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Judge My Score
                    </Button>
                  </Link>
                  <Link href="/discovery">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                      <span>Find Alumni</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {studentSentRequests.map((request) => (
                <Card key={request.id} className="border-slate-200 hover:border-blue-300 transition-all shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          {request.receiverName || "Alumni Mentor"}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-600 mt-0.5">
                          {request.receiverTitle || "Senior Software Engineer"} • {request.receiverCompany || "Alumni Network"}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          request.status === "ACCEPTED"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold"
                            : request.status === "DECLINED"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {request.status === "ACCEPTED" ? "Connected ✓" : request.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 text-xs text-slate-600 pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Sent on {new Date(request.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {request.status === "ACCEPTED" && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2 mt-2 font-medium">
                        Mentor has accepted your connection request! Check your institutional email for intro coordinates.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
