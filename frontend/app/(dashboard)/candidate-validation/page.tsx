"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Code2, Github, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  assessCandidate,
  deleteCandidateValidationProfile,
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
  const [codingPlatform, setCodingPlatform] = useState<CodingPlatform>("CODEFORCES");
  const [codingHandle, setCodingHandle] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCandidateValidationProfile()
      .then((savedProfile) => {
        if (!active || !savedProfile) return;
        setProfile(savedProfile);
        setGithubUsername(savedProfile.githubUsername);
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
        codingPlatform,
        codingHandle,
        consent: true,
      });
      setProfile(saved);
      setAssessment(null);
      setConsent(false);
      setMessage("Profiles saved. You can now request an assessment.");
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
      const result = await assessCandidate();
      setAssessment(result);
      setProfile((current) =>
        current ? { ...current, assessments: [result] } : current,
      );
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

  if (loading) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-slate-600">Loading your profiles...</p>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Candidate evidence assessment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review public GitHub and coding-profile evidence. This preliminary signal is not a
          judgment of you or an automatic rejection decision.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Public profiles
          </CardTitle>
          <CardDescription>
            Enter handles only. We fetch data from supported public APIs; we do not ask for platform
            passwords or tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="github-username" className="flex items-center gap-2 text-sm font-medium">
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
                placeholder="your-github-handle"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="coding-platform" className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4" />
                  Coding platform
                </label>
                <select
                  id="coding-platform"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={codingPlatform}
                  onChange={(event) => setCodingPlatform(event.target.value as CodingPlatform)}
                >
                  <option value="CODEFORCES">Codeforces</option>
                  <option value="LEETCODE">LeetCode</option>
                  <option value="HACKERRANK">HackerRank</option>
                  <option value="CODECHEF">CodeChef</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="coding-handle" className="text-sm font-medium">
                  Coding profile handle
                </label>
                <Input
                  id="coding-handle"
                  required
                  maxLength={50}
                  pattern="[A-Za-z0-9_-]+"
                  value={codingHandle}
                  onChange={(event) => setCodingHandle(event.target.value)}
                  placeholder="your-platform-handle"
                />
              </div>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1"
              />
              <span>
                I consent to AlumniConnect fetching and assessing public data from these profiles.
                I understand that profile ownership is not verified by this assessment.
              </span>
            </label>
            <Button type="submit" disabled={!consent || saving}>
              {saving ? "Saving..." : profile ? "Update profiles" : "Save profiles"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
            <CardDescription>
              Automated evidence collection is available for GitHub and Codeforces. Other coding
              platforms are saved for human review; no unsupported score is inferred.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleAssess} disabled={assessing}>
              {assessing ? "Fetching public evidence..." : "Assess my profiles"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="ml-2"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Withdraw consent and delete data"}
            </Button>
            {assessment && (
              <section aria-live="polite" className="space-y-3 rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">
                    {statusLabels[assessment.status]}
                  </h2>
                  <span className="text-sm text-slate-600">
                    {assessment.score === null ? "No overall score" : `${assessment.score}/100`}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-slate-500">GitHub</dt>
                    <dd className="font-medium">{assessment.githubScore ?? "Unknown"}/45</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Coding profile</dt>
                    <dd className="font-medium">{assessment.codingScore ?? "Unknown"}/45</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Evidence quality</dt>
                    <dd className="font-medium">
                      {assessment.evidenceQualityScore ?? "Unknown"}/10
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Ownership</dt>
                    <dd className="font-medium">
                      {assessment.ownershipVerified ? "Verified" : "Not verified"}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-slate-600">
                  Assessment date: {new Date(assessment.assessedAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">
                  A score is a preliminary readiness signal only. Decisions should include human
                  review and additional evidence.
                </p>
              </section>
            )}
          </CardContent>
        </Card>
      )}

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
