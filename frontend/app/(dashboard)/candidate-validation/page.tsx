"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Github,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Sparkles,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  assessCandidate,
  deleteCandidateValidationProfile,
  downloadLatestEvaluationJson,
  getCandidateValidationProfile,
  saveCandidateValidationProfile,
} from "@/services/api-client";
import {
  CandidateAssessment,
  CandidateValidationProfile,
  CodingPlatform,
} from "@/types";

const statusLabels = {
  READY_FOR_REVIEW: "Ready for review",
  DEVELOPING: "Developing",
  NEEDS_MORE_EVIDENCE: "Needs more evidence",
  MANUAL_REVIEW: "Manual review required",
} as const;

export default function CandidateValidationPage() {
  const [profile, setProfile] = useState<CandidateValidationProfile | null>(null);
  const [assessment, setAssessment] = useState<CandidateAssessment | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [topRepoUrl, setTopRepoUrl] = useState("https://github.com/CodeDevAyush/AlumniConnect");
  const [codingPlatform, setCodingPlatform] = useState<CodingPlatform>("LEETCODE");
  const [codingHandle, setCodingHandle] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"performance" | "code_quality" | "model_features">("performance");

  const leetCodeStats =
    assessment?.evidence.codingProfile?.platform === "LEETCODE"
      ? (assessment.evidence.codingProfile as any).difficultyStats
      : undefined;

  const topProject = assessment?.topProjectEvaluation;

  useEffect(() => {
    let active = true;
    getCandidateValidationProfile()
      .then((savedProfile) => {
        if (!active || !savedProfile) return;
        setProfile(savedProfile);
        setGithubUsername(savedProfile.githubUsername);
        if (savedProfile.topRepoUrl) setTopRepoUrl(savedProfile.topRepoUrl);
        setCodingPlatform(savedProfile.codingPlatform);
        setCodingHandle(savedProfile.codingHandle);
        setAssessment(savedProfile.assessments?.[0] ?? null);
      })
      .catch(() => {
        if (active) setError("Sign in to save profiles and request an assessment.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const saved = await saveCandidateValidationProfile({
        githubUsername,
        topRepoUrl: topRepoUrl.trim(),
        codingPlatform,
        codingHandle,
        consent: true,
      });
      setProfile(saved);
      setAssessment(null);
      setConsent(false);
      setMessage("Profiles and Top Project saved. You can now run the comprehensive evaluation.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save profiles.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssess() {
    setError("");
    setMessage("");
    setAssessing(true);
    try {
      const result = await assessCandidate({ topRepoUrl: topRepoUrl.trim() });
      setAssessment(result);
      setProfile((current) =>
        current ? { ...current, assessments: [result] } : current,
      );
      setMessage("Comprehensive evaluation complete! Evaluation data has been stored in a JSON file on the server.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not assess public profiles.",
      );
    } finally {
      setAssessing(false);
    }
  }

  async function handleDelete() {
    setError("");
    setMessage("");
    setDeleting(true);
    try {
      await deleteCandidateValidationProfile();
      setProfile(null);
      setAssessment(null);
      setGithubUsername("");
      setTopRepoUrl("");
      setCodingHandle("");
      setConsent(false);
      setMessage("Saved profiles and assessment history were deleted.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not delete saved profiles.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownloadJson() {
    setDownloading(true);
    try {
      const blob = await downloadLatestEvaluationJson();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = assessment?.storedJsonFilename || `evaluation_${profile?.githubUsername || "candidate"}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError("Failed to download JSON file: " + (err.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  }

  const copyJsonPayload = () => {
    if (!assessment) return;
    navigator.clipboard.writeText(JSON.stringify(assessment, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-600">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
        <p>Loading your candidate validation profiles...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
          Unified Candidate Assessment &amp; Top Project Code Quality
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          One unified portal to input your public GitHub profile, <strong>Top Portfolio Project</strong>, and competitive coding platform (LeetCode/Codeforces). Evaluates code quality via <strong>SonarQube</strong>, scans security with <strong>Semgrep</strong>, and exports normalized metrics stored into a server JSON file.
        </p>
      </header>

      {/* Input Form Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Github className="h-5 w-5 text-blue-600" />
            1. Candidate Profile &amp; Top Project Information
          </CardTitle>
          <CardDescription>
            Enter your handles and repository URL. We assess public evidence using official APIs and never ask for passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* GitHub Username */}
              <div className="space-y-2">
                <label htmlFor="github-username" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Github className="h-4 w-4" />
                  GitHub username
                </label>
                <Input
                  id="github-username"
                  required
                  maxLength={39}
                  pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                  value={githubUsername}
                  onChange={(event) => setGithubUsername(event.target.value)}
                  placeholder="e.g. CodeDevAyush"
                />
              </div>

              {/* Top Project Repository URL */}
              <div className="space-y-2">
                <label htmlFor="top-repo-url" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <FileCode className="h-4 w-4 text-blue-600" />
                  Top Project Repository (URL or owner/repo)
                </label>
                <Input
                  id="top-repo-url"
                  required
                  value={topRepoUrl}
                  onChange={(event) => setTopRepoUrl(event.target.value)}
                  placeholder="https://github.com/owner/repo"
                />
              </div>
            </div>

            {/* Quick Test Links */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 -mt-2">
              <span className="font-medium text-slate-600">Quick repo fill:</span>
              <button
                type="button"
                onClick={() => setTopRepoUrl("https://github.com/CodeDevAyush/AlumniConnect")}
                className="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
              >
                CodeDevAyush/AlumniConnect
              </button>
              <button
                type="button"
                onClick={() => setTopRepoUrl("https://github.com/facebook/react")}
                className="text-blue-600 hover:underline bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
              >
                facebook/react
              </button>
            </div>

            {/* Coding Platform */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="coding-platform" className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Code2 className="h-4 w-4" />
                  Coding platform
                </label>
                <select
                  id="coding-platform"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={codingPlatform}
                  onChange={(event) => setCodingPlatform(event.target.value as CodingPlatform)}
                >
                  <option value="LEETCODE">LeetCode (Full Breakdown)</option>
                  <option value="CODEFORCES">Codeforces</option>
                  <option value="HACKERRANK">HackerRank</option>
                  <option value="CODECHEF">CodeChef</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="coding-handle" className="text-sm font-medium text-slate-700">
                  Coding profile handle
                </label>
                <Input
                  id="coding-handle"
                  required
                  maxLength={50}
                  pattern="[A-Za-z0-9_-]+"
                  value={codingHandle}
                  onChange={(event) => setCodingHandle(event.target.value)}
                  placeholder="e.g. your_handle"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 h-4 w-4"
              />
              <span>
                I consent to AlumniConnect fetching and assessing public data from these profiles and running code quality/security checks on my top project.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={!consent || saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? "Saving..." : profile ? "Update Profile & Top Project" : "Save Profile & Top Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Unified Assessment Run Section */}
      {profile && (
        <Card className="border-slate-200 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>2. Evaluation Engine &amp; JSON Generation</span>
              {assessment && (
                <span className="text-xs font-normal text-slate-500">
                  Last evaluated: {new Date(assessment.assessedAt).toLocaleString()}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Triggers end-to-end evidence collection across GitHub, competitive programming, and deep SonarQube/Semgrep code quality inspection for your top project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleAssess} disabled={assessing} className="bg-blue-600 hover:bg-blue-700">
                {assessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Running Comprehensive Assessment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Run Unified Assessment &amp; Generate JSON
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-slate-600 border-slate-300 hover:bg-slate-100"
              >
                {deleting ? "Deleting..." : "Withdraw consent & delete"}
              </Button>
            </div>

            {/* Assessment Results Overview */}
            {assessment && (
              <div className="space-y-6 pt-2">
                {/* Executive Score Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Candidate Readiness Status
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {statusLabels[assessment.status]}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Preliminary signal calculated from verified repository and algorithmic problem solving evidence.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl">
                      <div className="text-right">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate Score</div>
                        <div className="text-2xl font-black text-slate-900">
                          {assessment.score === null ? "N/A" : `${assessment.score}`}
                          <span className="text-sm font-normal text-slate-500">/100</span>
                        </div>
                      </div>
                      {topProject?.qualityGrade && (
                        <>
                          <div className="h-10 w-px bg-slate-200" />
                          <div className="flex flex-col items-center">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Project Grade</div>
                            <div className="text-2xl font-black text-blue-600">{topProject.qualityGrade}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Evidence Scores Grid */}
                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-xs text-slate-500 font-medium">GitHub Profile</dt>
                      <dd className="text-base font-bold text-slate-900">{assessment.githubScore ?? "Unknown"}/45</dd>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-xs text-slate-500 font-medium">Coding Profile</dt>
                      <dd className="text-base font-bold text-slate-900">{assessment.codingScore ?? "Unknown"}/45</dd>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-xs text-slate-500 font-medium">Evidence Quality</dt>
                      <dd className="text-base font-bold text-slate-900">
                        {assessment.evidenceQualityScore ?? "Unknown"}/10
                      </dd>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <dt className="text-xs text-slate-500 font-medium">Top Project Quality</dt>
                      <dd className="text-base font-bold text-blue-600">
                        {topProject?.overallQualityScore ? `${topProject.overallQualityScore}/100` : "Assessed"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Stored JSON File Confirmation & Download Card */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-bold text-blue-950">Evaluation Data Stored to Server JSON</p>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      File: {assessment.storedJsonFilename || `evaluation_${profile.userId}.json`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleDownloadJson}
                      disabled={downloading}
                      className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading ? "Downloading..." : "Download Evaluation JSON"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyJsonPayload}
                      className="text-xs gap-1.5 whitespace-nowrap border-blue-200 bg-white"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy Payload"}
                    </Button>
                  </div>
                </div>

                {/* LeetCode Breakdown (Preserved 100% from Pull) */}
                {leetCodeStats && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-blue-600" />
                      LeetCode Breakdown by Difficulty
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[28rem] text-left text-xs">
                        <thead className="text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="pb-2 pr-3 font-semibold">Difficulty</th>
                            <th className="pb-2 pr-3 font-semibold">Solved</th>
                            <th className="pb-2 pr-3 font-semibold">Accepted / Attempts</th>
                            <th className="pb-2 font-semibold">Acceptance Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                            const stats = leetCodeStats[difficulty];
                            return (
                              <tr key={difficulty} className="border-t border-slate-100">
                                <th className="py-2.5 pr-3 font-medium text-slate-800">{difficulty}</th>
                                <td className="py-2.5 pr-3 font-semibold text-slate-900">{stats?.solved ?? "Unknown"}</td>
                                <td className="py-2.5 pr-3 text-slate-600">
                                  {stats ? `${stats.acceptedSubmissions} / ${stats.totalSubmissions}` : "Unknown"}
                                </td>
                                <td className="py-2.5 text-slate-600">
                                  {stats?.acceptanceRate === null || !stats ? "No attempts" : `${stats.acceptanceRate.toFixed(1)}%`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Project Code Quality Evaluation */}
                {topProject && (
                  <div className="space-y-4">
                    {/* Security Risk Separate Banner */}
                    <div
                      className={`rounded-xl border p-4 ${
                        topProject.securityRisk?.isVulnerable
                          ? "bg-red-50 border-red-200 text-red-900"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {topProject.securityRisk?.isVulnerable ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">
                            Security Risk Analysis: {topProject.securityRisk?.riskLevel} RISK (Semgrep SAST)
                          </h4>
                          <p className="text-xs leading-relaxed">{topProject.securityRisk?.summary}</p>
                          <p className="text-[11px] opacity-75 font-medium">
                            Note: Security risk is audited independently; a good overall score never hides a vulnerability.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sub-tabs for Deep Evaluation */}
                    <div className="flex border-b border-slate-200 gap-2">
                      <button
                        onClick={() => setActiveTab("performance")}
                        className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                          activeTab === "performance"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Github className="h-3.5 w-3.5" />
                        B. GitHub Performance
                      </button>
                      <button
                        onClick={() => setActiveTab("code_quality")}
                        className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                          activeTab === "code_quality"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        C. Code Quality (SonarQube)
                      </button>
                      <button
                        onClick={() => setActiveTab("model_features")}
                        className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 ${
                          activeTab === "model_features"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Cpu className="h-3.5 w-3.5" />
                        Model Training Features (JSON)
                      </button>
                    </div>

                    {/* Section B: GitHub Development Performance */}
                    {activeTab === "performance" && topProject.gitHubPerformance && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Original Repos</span>
                          <p className="text-base font-bold text-slate-900">{topProject.gitHubPerformance.originalRepoCount}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Repos</span>
                          <p className="text-base font-bold text-slate-900">{topProject.gitHubPerformance.activeRepoCount}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Commit Cadence</span>
                          <p className="text-base font-bold text-slate-900">{topProject.gitHubPerformance.commitActivity} / mo</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Consistency</span>
                          <p className="text-base font-bold text-slate-900">
                            {(topProject.gitHubPerformance.contributionConsistency * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Maintenance</span>
                          <p className="text-base font-bold text-slate-900">
                            {(topProject.gitHubPerformance.repositoryMaintenance * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Documentation</span>
                          <p className="text-base font-bold text-slate-900">
                            {topProject.gitHubPerformance.projectDocumentationQuality} / 100
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Tests Score</span>
                          <p className="text-base font-bold text-slate-900">
                            {topProject.gitHubPerformance.testImplementation} / 100
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Complexity</span>
                          <p className="text-base font-bold text-slate-900">
                            {topProject.gitHubPerformance.projectComplexity} / 100
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Completeness</span>
                          <p className="text-base font-bold text-slate-900">
                            {topProject.gitHubPerformance.projectCompleteness} / 100
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Section C: Code Quality */}
                    {activeTab === "code_quality" && topProject.codeQuality && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Maintainability</span>
                          <p className="text-base font-bold text-emerald-600">{topProject.codeQuality.maintainabilityRating}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Code Smells</span>
                          <p className="text-base font-bold text-slate-900">{topProject.codeQuality.codeSmellsDensity} / KLOC</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Bug Density</span>
                          <p className="text-base font-bold text-slate-900">{topProject.codeQuality.bugDensity} / KLOC</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Duplication</span>
                          <p className="text-base font-bold text-slate-900">{topProject.codeQuality.codeDuplication}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Cognitive Complexity</span>
                          <p className="text-base font-bold text-slate-900">{topProject.codeQuality.cognitiveComplexity}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Test Coverage</span>
                          <p className="text-base font-bold text-blue-600">{topProject.codeQuality.testCoverage}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Lint Violations</span>
                          <p className="text-base font-bold text-slate-900">{topProject.codeQuality.lintViolations} / KLOC</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Security Weight</span>
                          <p className="text-base font-bold text-slate-900">
                            {topProject.codeQuality.securityFindings?.weightedScore}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Section: Model Features JSON */}
                    {activeTab === "model_features" && topProject.modelTrainingFeatures && (
                      <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-72">
                        <pre>{JSON.stringify(topProject.modelTrainingFeatures, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {(error || message) && (
        <p role={error ? "alert" : "status"} className={`text-sm ${error ? "text-red-600" : "text-emerald-700"}`}>
          {error ? (
            <>
              {error}{" "}
              <Link href="/login" className="font-semibold underline">
                Sign in
              </Link>
            </>
          ) : message}
        </p>
      )}
    </main>
  );
}
