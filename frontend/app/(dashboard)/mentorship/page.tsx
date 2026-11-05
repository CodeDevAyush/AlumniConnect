"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  MessageSquare,
  Building,
  UserCheck,
  Send,
  Bot,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getMyConnections,
  getCurrentUser,
  getConnectionMessages,
  sendConnectionMessage,
} from "@/services/api-client";
import { ConnectionRequest, ChatMessage } from "@/types";

export default function MentorshipPage() {
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat modal state
  const [activeChatRequest, setActiveChatRequest] = useState<ConnectionRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentUser = getCurrentUser();
  const isAlumni = currentUser?.role === "ALUMNI";

  useEffect(() => {
    loadMentorshipData();
  }, []);

  useEffect(() => {
    if (activeChatRequest) {
      loadChatMessages(activeChatRequest.id);
    }
  }, [activeChatRequest]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function loadMentorshipData() {
    setLoading(true);
    try {
      const data = await getMyConnections();
      setConnections(data || []);
    } catch {
      setConnections([]);
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

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || !activeChatRequest) return;

    setSendingMessage(true);
    try {
      const senderName = currentUser?.profile?.firstName
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ""}`.trim()
        : currentUser?.email || "User";
      const senderRole = currentUser?.role || "USER";

      await sendConnectionMessage(activeChatRequest.id, textToSend, senderName, senderRole);
      setChatInput("");
      const updated = await getConnectionMessages(activeChatRequest.id);
      setChatMessages(updated);
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSendingMessage(false);
    }
  }

  // Filter accepted mentorships
  const acceptedMentorships = connections.filter((c) => c.status === "ACCEPTED");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Mentorship Programs & Workspace</h1>
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 font-semibold text-xs">
              {isAlumni ? "Mentor Hub" : "Student Mentee Hub"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isAlumni
              ? "Guide verified candidates, manage 1-on-1 mentorship channels, and review project code."
              : "1-on-1 career guidance, mock interviews, and technical code reviews with verified alumni."}
          </p>
        </div>

        <div>
          {isAlumni ? (
            <Link href="/connections">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs">
                <span>Candidate Requests</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/discovery">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs">
                <span>Discover Alumni Mentors</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Card: AI Mentorship Matcher / Leadership Hub */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              {isAlumni ? "Mentor Leadership & Domain Matcher" : "AI Mentorship Matcher"}
            </CardTitle>
            <CardDescription>
              {isAlumni
                ? "Our system pairs your domain expertise (Distributed Systems, Cloud Reliability, Go) with top candidates reaching an 80+ rating."
                : "Let our AI analyze your coursework, projects, and target companies to pair you with the best alumni mentor."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800">
                {isAlumni ? "Mentorship Focus Areas" : "Institutional Verification Signals"}
              </div>
              <p>
                {isAlumni
                  ? "Open for architecture design reviews, mock system design sessions, and senior referral coordination."
                  : "Static analysis code quality (SonarQube & Semgrep) + GitHub commit cadence verify candidates for senior alumni matching."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            {isAlumni ? (
              <Link href="/connections" className="w-full">
                <Button variant="outline" className="w-full text-xs gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50">
                  <span>Review Incoming Requests</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/candidate-validation" className="w-full">
                <Button className="w-full text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                  <span>Start AI Assessment</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* Right Card: Active Mentorships (Area shown in user photo) */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Active Mentorships
              </CardTitle>
              {acceptedMentorships.length > 0 && (
                <Badge className="bg-emerald-600 text-white font-bold text-[11px] py-0.5 px-2">
                  {acceptedMentorships.length} Active {acceptedMentorships.length === 1 ? "Connection" : "Connections"}
                </Badge>
              )}
            </div>
            <CardDescription>
              Track your scheduled check-ins, action plans, and milestones.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-emerald-600 border-r-transparent"></div>
                <p className="mt-2">Checking active mentorships...</p>
              </div>
            ) : acceptedMentorships.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm text-slate-500">You currently have no active mentorship cycles.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isAlumni
                    ? "Accept incoming student requests in the Candidate Requests portal to activate a direct mentorship channel."
                    : "Once an alumni mentor accepts your connection request, your connected mentor and interactive chatbot will appear here."}
                </p>
                <div className="pt-2">
                  <Link href={isAlumni ? "/connections" : "/discovery"}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>{isAlumni ? "Check Requests" : "Explore Alumni"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* ACTIVE MENTORSHIP CARDS WITH ALUMNI NAME AND CHATBOT BUTTON */
              <div className="space-y-3">
                {acceptedMentorships.map((mentorship) => {
                  const counterpartName = isAlumni
                    ? mentorship.requesterName || "Candidate Student"
                    : mentorship.receiverName || "Alumni Mentor";

                  const counterpartCompany = isAlumni
                    ? mentorship.requesterDepartment || "Computer Science Candidate"
                    : `${mentorship.receiverTitle || "Senior Engineer"} • ${mentorship.receiverCompany || "Google"}`;

                  return (
                    <div
                      key={mentorship.id}
                      className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {counterpartName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900">{counterpartName}</h4>
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 font-medium flex items-center gap-1">
                              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{counterpartCompany}</span>
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-semibold shrink-0"
                        >
                          Connected ✓
                        </Badge>
                      </div>

                      {/* Mentorship Status Line */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>1-on-1 Mentorship Active</span>
                        </span>
                        <span className="text-slate-400">Direct Channel Open</span>
                      </div>

                      {/* Action to launch Chatbot */}
                      <Button
                        size="sm"
                        onClick={() => setActiveChatRequest(mentorship)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs gap-1.5 font-semibold h-8 shadow-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <Bot className="h-3.5 w-3.5" />
                        <span>Chat with {isAlumni ? counterpartName : `${counterpartName} (Mentor)`}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 text-xs text-slate-400">
            {acceptedMentorships.length > 0 && (
              <p>Click the chat button above to message your mentor directly or use AI prompts.</p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MENTORSHIP CHATBOT / DIRECT MESSAGING MODAL                               */}
      {/* ========================================================================= */}
      {activeChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {isAlumni
                      ? activeChatRequest.requesterName?.charAt(0) || "S"
                      : activeChatRequest.receiverName?.charAt(0) || "M"}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {isAlumni
                        ? activeChatRequest.requesterName || "Candidate Mentee"
                        : `${activeChatRequest.receiverName || "Alumni Mentor"} (${activeChatRequest.receiverCompany || "Mentor"})`}
                    </h3>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 text-[10px] py-0 px-1 shrink-0">
                      Active
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <Sparkles className="h-3 w-3 text-brand-orange shrink-0" />
                    <span>Mentorship Workspace • AI Assisted</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveChatRequest(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Suggestion Prompt Chips */}
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 no-scrollbar">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Bot className="h-3 w-3 text-purple-600" /> AI Prompts:
              </span>
              <button
                type="button"
                onClick={() => handleSendMessage("Can you suggest a 30-min meeting agenda for our mentorship sync?")}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 rounded-full border border-slate-200 font-medium shrink-0 transition-colors"
              >
                📅 Suggest meeting agenda
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Could you review my GitHub portfolio and give feedback on repo architecture?")}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 rounded-full border border-slate-200 font-medium shrink-0 transition-colors"
              >
                📝 Code review checklist
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("What are the key system design and DSA topics to focus on for high-tier referrals?")}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 rounded-full border border-slate-200 font-medium shrink-0 transition-colors"
              >
                💡 System design & referral tips
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
              {chatLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="mt-2 text-xs text-slate-400">Loading conversation history...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Bot className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p>Mentorship channel initiated. Say hello or pick an AI prompt above!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isBot = msg.senderRole === "AI_BOT" || msg.senderId === "ai-assistant";
                  const isMe = msg.senderId === currentUser?.id;

                  if (isBot) {
                    return (
                      <div key={msg.id} className="flex gap-2.5 max-w-[88%] mx-auto my-2">
                        <div className="h-7 w-7 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-700 shadow-2xs">
                          <div className="flex items-center gap-1.5 font-bold text-purple-800 text-[11px] mb-1">
                            <span>{msg.senderName}</span>
                            <Badge className="bg-purple-600 text-white text-[9px] py-0 px-1 font-semibold">AI Assistant</Badge>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                          <span className="text-[9px] text-purple-400 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  }

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
                placeholder="Type a message or question to your mentor / mentee..."
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
          </div>
        </div>
      )}
    </div>
  );
}
