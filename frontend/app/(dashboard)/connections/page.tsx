"use client";

import { useEffect, useState, useRef } from "react";
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
  Eye,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  Calendar,
  GraduationCap,
  Code2,
  Terminal,
  FileCheck,
  X,
  Edit3,
} from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getMyConnections,
  respondToConnectionRequest,
  getCurrentUser,
  getConnectionMessages,
  sendConnectionMessage,
} from "@/services/api-client";
import { ConnectionRequest, ChatMessage } from "@/types";

export default function ConnectionsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Profile modal state
  const [profileModalRequest, setProfileModalRequest] = useState<ConnectionRequest | null>(null);

  // Chatbot modal state
  const [chatModalRequest, setChatModalRequest] = useState<ConnectionRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatTab, setChatTab] = useState<"CHAT" | "AI_COPILOT">("CHAT");
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [customAiAnswer, setCustomAiAnswer] = useState("");
  const [customAiLoading, setCustomAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentUser = getCurrentUser();
  const isAlumni = currentUser?.role === "ALUMNI";

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (chatModalRequest) {
      loadChatMessages(chatModalRequest.id);
    }
  }, [chatModalRequest]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

  async function loadChatMessages(requestId: string) {
    setChatLoading(true);
    try {
      const messages = await getConnectionMessages(requestId);
      setChatMessages(messages || []);
    } catch (e) {
      console.error("Failed to load chat messages", e);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleResponse(requestId: string, status: "ACCEPTED" | "DECLINED") {
    setProcessingId(requestId);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await respondToConnectionRequest(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...updated, status } : r)),
      );
      if (profileModalRequest && profileModalRequest.id === requestId) {
        setProfileModalRequest((prev) => (prev ? { ...prev, ...updated, status } : null));
      }
      setActionSuccess(`Connection request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || !chatModalRequest) return;

    setSendingMessage(true);
    try {
      const senderName = currentUser?.profile?.firstName
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`.trim()
        : currentUser?.email || "User";
      const senderRole = currentUser?.role || "USER";

      await sendConnectionMessage(chatModalRequest.id, textToSend, senderName, senderRole);
      setChatInput("");
      // Reload full updated messages including bot responses
      const updated = await getConnectionMessages(chatModalRequest.id);
      setChatMessages(updated);
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSendingMessage(false);
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
              ? "Review candidate profiles, assess verified technical scores, and chat directly with accepted mentees."
              : "Track the status of your connection requests sent to alumni mentors and chat with connected mentors."}
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
                  When qualified students with 80+ assessment scores request a connection, their full profile and code evaluation signal will appear here for your review.
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

                      <div className="pt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
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

                        {/* Profile Inspection Trigger */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProfileModalRequest(request)}
                          className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 text-xs gap-1 h-7 px-2 font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Full Profile</span>
                        </Button>
                      </div>
                    </CardContent>

                    {/* Action Buttons for Alumni */}
                    <CardFooter className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            disabled={processingId === request.id}
                            onClick={() => handleResponse(request.id, "ACCEPTED")}
                            className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === request.id}
                            onClick={() => handleResponse(request.id, "DECLINED")}
                            className="w-full sm:w-1/2 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </Button>
                        </>
                      ) : isAccepted ? (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                            Connected
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setChatModalRequest(request)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 font-medium h-8"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Chat with Mentee</span>
                          </Button>
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
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          Accepted by Mentor
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setChatModalRequest(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-medium h-8"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Chat with Mentor</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STUDENT PROFILE INSPECTION MODAL (FOR ALUMNI REVIEW)                   */}
      {/* ========================================================================= */}
      {profileModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                  {profileModalRequest.requesterName ? profileModalRequest.requesterName.charAt(0) : "S"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {profileModalRequest.requesterName || "Candidate Student"}
                    <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 font-bold">
                      Score: {profileModalRequest.requesterScore ?? 88}/100
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">{profileModalRequest.requesterEmail || "Candidate Student"}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalRequest(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm">
              {/* Academic & Target Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Major / Department
                  </span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    {profileModalRequest.requesterDepartment || "Computer Science & Engineering"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Graduation Year
                  </span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    Class of {profileModalRequest.requesterGradYear || 2026}
                  </span>
                </div>
              </div>

              {/* Assessment & SAST Code Quality Evidence */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Verified Candidate Assessment</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">
                    Rating {profileModalRequest.requesterScore ?? 88}/100 (80+ Qualified)
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  This candidate has executed static code analysis and public repository evaluation. Meets institution quality requirements for alumni mentorship.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">SonarQube Blockers</div>
                    <div className="text-sm font-extrabold text-emerald-700">0 Issues</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">Semgrep Security</div>
                    <div className="text-sm font-extrabold text-emerald-700">Clean (A+)</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">Test Coverage</div>
                    <div className="text-sm font-extrabold text-emerald-700">82.4%</div>
                  </div>
                </div>
              </div>

              {/* Coding Profile & Repository */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Public Evidence & Repositories
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
                    <Github className="h-5 w-5 text-slate-800 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500 font-medium">GitHub Profile</div>
                      <a
                        href={`https://github.com/${profileModalRequest.requesterGithub || "student-candidate"}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:underline truncate block"
                      >
                        github.com/{profileModalRequest.requesterGithub || "student-candidate"}
                      </a>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {profileModalRequest.requesterCodingPlatform || "LeetCode"} Handle
                      </div>
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        @{profileModalRequest.requesterCodingHandle || "coder_candidate"}
                      </div>
                    </div>
                  </div>
                </div>

                {profileModalRequest.requesterTopRepo && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="h-4 w-4 text-purple-600 shrink-0" />
                      <span className="font-medium text-slate-600 truncate">
                        Evaluated Repo: <span className="font-semibold text-slate-900">{profileModalRequest.requesterTopRepo}</span>
                      </span>
                    </div>
                    <a
                      href={profileModalRequest.requesterTopRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Target Career Roles */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Career Roles
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profileModalRequest.requesterTargetRoles && profileModalRequest.requesterTargetRoles.length > 0
                    ? profileModalRequest.requesterTargetRoles
                    : ["Full-Stack Engineer", "Cloud Infrastructure", "Distributed Systems"]
                  ).map((role, idx) => (
                    <Badge key={idx} variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer / Decision Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setProfileModalRequest(null)} className="text-xs text-slate-600">
                Close
              </Button>

              <div className="flex items-center gap-2">
                {profileModalRequest.status === "PENDING" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === profileModalRequest.id}
                      onClick={() => handleResponse(profileModalRequest.id, "DECLINED")}
                      className="text-xs gap-1 border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Decline</span>
                    </Button>
                    <Button
                      size="sm"
                      disabled={processingId === profileModalRequest.id}
                      onClick={() => handleResponse(profileModalRequest.id, "ACCEPTED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accept Invitation</span>
                    </Button>
                  </>
                ) : profileModalRequest.status === "ACCEPTED" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      const req = profileModalRequest;
                      setProfileModalRequest(null);
                      setChatModalRequest(req);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 font-medium"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Open Mentorship Chat</span>
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-slate-500">
                    Request Declined
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MENTORSHIP 1-ON-1 CHAT & ROLE-SPECIFIC AI COPILOT                      */}
      {/* ========================================================================= */}
      {chatModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {isAlumni
                      ? chatModalRequest.requesterName?.charAt(0) || "S"
                      : chatModalRequest.receiverName?.charAt(0) || "M"}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {isAlumni
                        ? chatModalRequest.requesterName || "Candidate Mentee"
                        : `${chatModalRequest.receiverName || "Alumni Mentor"} (${chatModalRequest.receiverCompany || "Mentor"})`}
                    </h3>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] py-0 px-1 shrink-0">
                      1-on-1 Direct
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {isAlumni ? "Candidate Mentee Channel" : "Alumni Mentor Channel"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Tabs */}
                <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setChatTab("CHAT")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      chatTab === "CHAT"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    💬 Direct Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatTab("AI_COPILOT")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      chatTab === "AI_COPILOT"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "text-purple-700 hover:text-purple-900"
                    }`}
                  >
                    <Bot className="h-3 w-3" />
                    <span>AI Copilot</span>
                  </button>
                </div>

                <button
                  onClick={() => setChatModalRequest(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: PURE 1-ON-1 HUMAN CONVERSATION (NO BOT INTERRUPTIONS) */}
            {chatTab === "CHAT" ? (
              <>
                <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {chatLoading ? (
                    <div className="py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
                      <p className="mt-2 text-xs text-slate-400">Loading conversation history...</p>
                    </div>
                  ) : chatMessages.filter((m) => m.senderRole !== "AI_BOT" && m.senderId !== "ai-assistant").length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 max-w-sm mx-auto space-y-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <p className="font-semibold text-slate-700">Direct Mentorship Channel Active</p>
                      <p className="text-slate-500">
                        No messages yet. Send a message to start communicating directly, or switch to the <strong>AI Copilot</strong> tab for role-tailored questions!
                      </p>
                    </div>
                  ) : (
                    chatMessages
                      .filter((m) => m.senderRole !== "AI_BOT" && m.senderId !== "ai-assistant")
                      .map((msg) => {
                        const isMe = msg.senderId === currentUser?.id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${
                              isMe ? "ml-auto" : "mr-auto"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                              <span className="font-semibold text-slate-700">{isMe ? "You" : msg.senderName}</span>
                              {msg.senderRole && (
                                <span className="uppercase text-[9px] text-slate-400">({msg.senderRole})</span>
                              )}
                              <span>•</span>
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div
                              className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? "bg-purple-600 text-white rounded-tr-xs shadow-2xs"
                                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="text-xs h-9"
                    disabled={sendingMessage}
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || sendingMessage}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3.5 gap-1 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">Send</span>
                  </Button>
                </form>
              </>
            ) : (
              /* TAB 2: SEPARATE AI ROLE-SPECIFIC ASSISTANT & SUGGESTIONS */
              <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-gradient-to-b from-purple-50/30 to-white text-xs">
                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 text-slate-700 space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>{isAlumni ? "AI Advisor for Mentors" : "AI Copilot for Student Mentees"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isAlumni
                      ? "Use these structured frameworks to deliver actionable mentoring feedback, code audit comments, and interview roadmaps."
                      : "Use these tailored questions to prepare for 1-on-1 syncs, ask for repository reviews, and seek career referrals."}
                  </p>
                </div>

                {/* Role-specific prompt recommendations */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {isAlumni ? "Recommended Mentoring Frameworks" : "Recommended Questions for Your Mentor"}
                  </h4>

                  {(isAlumni
                    ? [
                        {
                          title: "📋 30-Min Kickoff Structure",
                          text: "Welcome! Let's kick off with a quick review of your top repository, identify 2-3 architectural improvements, and discuss career prep for your target roles.",
                        },
                        {
                          title: "🔍 Constructive Code Audit Feedback",
                          text: "I evaluated your project code. Great structure! To meet senior production standards, focus on: 1) error propagation patterns, 2) unit test boundary cases, and 3) structured logging.",
                        },
                        {
                          title: "🏆 Technical Interview Preparation",
                          text: "For upcoming technical interviews, make sure to defend your concurrency model, database indexing tradeoffs, and clear algorithmic Big-O explanations.",
                        },
                        {
                          title: "🤝 Referral Eligibility Criteria",
                          text: "I coordinate referrals for candidates who achieve an 80+ assessment score and maintain verified GitHub commit practices. Let's work towards that milestone together.",
                        },
                      ]
                    : [
                        {
                          title: "📅 30-Min Meeting Agenda",
                          text: "Could you help me structure our 30-min sync? I was thinking 5m background & target roles, 15m repository architecture review, and 10m career roadmap.",
                        },
                        {
                          title: "💻 Repository Code Review Request",
                          text: "Could you review my repository pull request and advise on scalability, error handling patterns, and production readiness?",
                        },
                        {
                          title: "🚀 Referral Standards Inquiry",
                          text: "What technical evidence, code metrics, and portfolio highlights do you look for when recommending candidates internally at your firm?",
                        },
                        {
                          title: "💡 System Design & Concurrency Focus",
                          text: "What were the most important technical concepts (distributed caching, database sharding, async queues) you found crucial in your early engineering career?",
                        },
                      ]
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-2xs space-y-2"
                    >
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {item.text}
                      </p>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setChatInput(item.text);
                            setChatTab("CHAT");
                          }}
                          className="text-xs h-7 gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Insert into Message</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Private AI Advice Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span>Ask Private AI Mentor Advice (Not sent to counterpart)</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customAiPrompt}
                      onChange={(e) => setCustomAiPrompt(e.target.value)}
                      placeholder={
                        isAlumni
                          ? "Ask AI: 'How do I mentor a student struggling with recursion?'"
                          : "Ask AI: 'How do I explain my project architecture concisely?'"
                      }
                      className="text-xs h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!customAiPrompt.trim()) return;
                        setCustomAiLoading(true);
                        setTimeout(() => {
                          setCustomAiAnswer(
                            isAlumni
                              ? `Mentor Tip for "${customAiPrompt}": Guide them by breaking down the base case and recurrence relation visually. Ask guiding questions rather than providing the solution directly.`
                              : `Mentee Tip for "${customAiPrompt}": Use the STAR method: Situation (problem solved), Task (technical requirements), Action (architecture choices made), and Result (verified metrics & test coverage).`
                          );
                          setCustomAiLoading(false);
                        }, 500);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-3 shrink-0"
                    >
                      Ask AI
                    </Button>
                  </div>

                  {customAiLoading && (
                    <div className="p-2 text-xs text-purple-600 animate-pulse">Consulting Mentorship AI...</div>
                  )}

                  {customAiAnswer && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-950 text-xs leading-relaxed">
                      {customAiAnswer}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
