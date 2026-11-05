"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Github,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  FileCode,
  Sparkles,
  GitBranch,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { evaluateProject } from "@/services/api-client";

export default function ProjectEvaluationPage() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/CodeDevAyush/AlumniConnect");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"github" | "code_quality" | "model_features">("github");
  const [copied, setCopied] = useState(false);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await evaluateProject(repoUrl.trim());
      setResult(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to evaluate repository.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const copyFeaturesJson = () => {
    if (!result?.modelTrainingFeatures) return;
    navigator.clipboard.writeText(JSON.stringify(result.modelTrainingFeatures, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/candidate-validation" className="hover:text-blue-600 transition-colors">
          Candidate Assessment
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Top Project Code Quality Evaluation</span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileCode className="h-7 w-7 text-blue-600" />
              GitHub Repository Quality &amp; AI Evaluation
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl">
              Inspect your top GitHub project using the <strong>GitHub REST API</strong>, <strong>SonarQube</strong> quality metrics, and <strong>Semgrep</strong> SAST security rules. All parameters are compiled for machine learning model training.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/candidate-validation">
              <Button variant="outline" size="sm">
                View Profile Evidence
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Input Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Github className="h-5 w-5 text-slate-700" />
            Enter Public GitHub Repository URL
          </CardTitle>
          <CardDescription>
            Provide your top portfolio repository to check maintainability, test implementation, code duplication, and security findings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[170px]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Run Evaluation
                  </span>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Quick tests:</span>
              <button
                type="button"
                onClick={() => setRepoUrl("https://github.com/CodeDevAyush/AlumniConnect")}
                className="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
              >
                CodeDevAyush/AlumniConnect
              </button>
              <button
                type="button"
                onClick={() => setRepoUrl("https://github.com/facebook/react")}
                className="text-blue-600 hover:underline bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
              >
                facebook/react
              </button>
              <button
                type="button"
                onClick={() => setRepoUrl("https://github.com/expressjs/express")}
                className="text-blue-600 hover:underline bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
              >
                expressjs/express
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Evaluation Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Presentation */}
      {result && (
        <div className="space-y-6">
          {/* Executive Overview Hero Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{result.repo}</h2>
                  <a
                    href={`https://github.com/${result.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {result.primaryLanguage}
                  </span>
                  <span>•</span>
                  <span>⭐ {result.stars} stars</span>
                  <span>•</span>
                  <span>🍴 {result.forks} forks</span>
                  <span>•</span>
                  <span>{result.openIssues} open issues</span>
                  <span>•</span>
                  <span className="text-slate-500 font-medium">{result.complexityTier}</span>
                </div>
              </div>

              {/* Overall Score & Grade Badge */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Score</div>
                  <div className="text-2xl font-black text-slate-900">
                    {result.overallQualityScore}<span className="text-sm font-normal text-slate-500">/100</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex flex-col items-center">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Grade</div>
                  <div className="text-2xl font-black text-blue-600">{result.qualityGrade}</div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {result.aiSummary && (
              <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-4 text-sm text-slate-800 leading-relaxed">
                <p className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Engineering Readiness Assessment
                </p>
                <p>{result.aiSummary}</p>
              </div>
            )}
          </div>

          {/* CRITICAL: SEPARATE SECURITY RISK VISIBILITY BANNER */}
          <div
            className={`rounded-xl border p-5 ${
              result.securityRisk?.isVulnerable
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.securityRisk?.isVulnerable ? (
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-base">
                    Security Risk Analysis: {result.securityRisk?.riskLevel} RISK
                  </h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/70 border border-black/10">
                    Semgrep SAST Verified
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{result.securityRisk?.summary}</p>
                <p className="text-xs opacity-75 mt-1 font-medium">
                  Note: A high quality score never hides a serious vulnerability. Security risks are audited separately.
                </p>

                {result.codeQuality?.securityFindings?.details?.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-red-200/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                      Detected Security Findings ({result.codeQuality.securityFindings.details.length}):
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {result.codeQuality.securityFindings.details.map((finding: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white/90 p-2 rounded text-xs border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                        >
                          <span className="font-mono text-red-700 font-semibold">{finding.checkId}</span>
                          <span className="text-slate-700">{finding.message}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {finding.file} : L{finding.line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metric Category Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab("github")}
              className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "github"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Github className="h-4 w-4" />
              B. GitHub Development Performance
            </button>
            <button
              onClick={() => setActiveTab("code_quality")}
              className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "code_quality"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code2 className="h-4 w-4" />
              C. Code Quality (SonarQube + Semgrep)
            </button>
            <button
              onClick={() => setActiveTab("model_features")}
              className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "model_features"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Cpu className="h-4 w-4" />
              Model Training Features (JSON)
            </button>
          </div>

          {/* TAB 1: B. GitHub Development Performance */}
          {activeTab === "github" && result.gitHubPerformance && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  GitHub Development Performance Metrics
                </CardTitle>
                <CardDescription>
                  Normalized indicators assessing engineering habits, contribution continuity, and repository health.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Original repository count</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.gitHubPerformance.originalRepoCount}</p>
                    <span className="text-xs text-slate-500">Excludes forks</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Active repository count</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.gitHubPerformance.activeRepoCount}</p>
                    <span className="text-xs text-slate-500">Updated within past 180 days</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Commit activity (Normalized)</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.gitHubPerformance.commitActivity} / mo</p>
                    <span className="text-xs text-slate-500">Time-normalized cadence</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Contribution consistency</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {(result.gitHubPerformance.contributionConsistency * 100).toFixed(0)}%
                    </p>
                    <span className="text-xs text-slate-500">Regularity of commit intervals</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Repository maintenance</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {(result.gitHubPerformance.repositoryMaintenance * 100).toFixed(0)}%
                    </p>
                    <span className="text-xs text-slate-500">Recency and active upkeep</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Documentation quality</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {result.gitHubPerformance.projectDocumentationQuality} / 100
                    </p>
                    <span className="text-xs text-slate-500">README, architecture &amp; licenses</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Test implementation</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {result.gitHubPerformance.testImplementation} / 100
                    </p>
                    <span className="text-xs text-slate-500">Automated test suites &amp; specs</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Project complexity</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {result.gitHubPerformance.projectComplexity} / 100
                    </p>
                    <span className="text-xs text-slate-500">LOC volume &amp; dependency stack</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Project completeness</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {result.gitHubPerformance.projectCompleteness} / 100
                    </p>
                    <span className="text-xs text-slate-500">CI/CD, Docker &amp; configuration</span>
                  </div>
                </div>

                {/* Language Diversity breakdown */}
                {result.gitHubPerformance.programmingLanguageDiversity && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Programming Language Diversity
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(result.gitHubPerformance.programmingLanguageDiversity).map(([lang, pct]: any) => (
                        <div key={lang} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded border border-slate-200 text-xs">
                          <span className="font-semibold text-slate-800">{lang}:</span>
                          <span className="text-blue-600 font-mono">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: C. Code Quality */}
          {activeTab === "code_quality" && result.codeQuality && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  SonarQube &amp; Semgrep Code Quality Analysis
                </CardTitle>
                <CardDescription>
                  Deep static analysis metrics detailing maintainability, bug density, code duplication, and cognitive complexity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Maintainability rating</span>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{result.codeQuality.maintainabilityRating}</p>
                    <span className="text-xs text-slate-500">SQALE index normalized</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Code smells density</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.codeSmellsDensity} / KLOC</p>
                    <span className="text-xs text-slate-500">Per 1,000 lines of code</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Bug density</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.bugDensity} / KLOC</p>
                    <span className="text-xs text-slate-500">Reliability defect rate</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Code duplication</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.codeDuplication}%</p>
                    <span className="text-xs text-slate-500">SonarCloud duplicated blocks</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Cognitive complexity</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.cognitiveComplexity}</p>
                    <span className="text-xs text-slate-500">Readability and control flow</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Test coverage</span>
                    <p className="text-xl font-bold text-blue-600 mt-1">{result.codeQuality.testCoverage}%</p>
                    <span className="text-xs text-slate-500">Executed statements ratio</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Lint violations</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.lintViolations} / KLOC</p>
                    <span className="text-xs text-slate-500">Syntax and style compliance</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Security findings weight</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{result.codeQuality.securityFindings?.weightedScore}</p>
                    <span className="text-xs text-slate-500">Severity-weighted metric</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Model Training Features (JSON) */}
          {activeTab === "model_features" && result.modelTrainingFeatures && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    Machine Learning Training Feature Vector
                  </CardTitle>
                  <CardDescription>
                    All GitHub performance and SonarQube/Semgrep code quality features normalized (0.0 - 1.0) for model ingestion.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copyFeaturesJson} className="gap-1.5">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96">
                  {JSON.stringify(result.modelTrainingFeatures, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}

