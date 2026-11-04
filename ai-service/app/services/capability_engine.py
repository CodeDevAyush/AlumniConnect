import logging
from typing import Dict, List, Any
from app.data.taxonomies import TECHNICAL_TRACKS
from app.integrations.coding_platforms_client import coding_client
from app.integrations.github_client import github_client
from app.schemas.capability import (
    CapabilityAssessmentResult,
    DimensionScore,
    StudentEvidencePayload,
)

logger = logging.getLogger("capability_engine")


class CapabilityAssessmentEngine:
    """
    Production 5-Dimensional Student Capability Assessment Engine.
    Evaluates evidence across:
      1. Coding Performance
      2. Development Capability
      3. Technical Fundamentals
      4. Practical Application
      5. Consistency & Growth
    """

    async def evaluate(self, payload: StudentEvidencePayload) -> CapabilityAssessmentResult:
        track_key = payload.selectedTrack.upper()
        track_config = TECHNICAL_TRACKS.get(track_key, TECHNICAL_TRACKS["SDE"])
        track_weights = track_config["weights"]

        missing_notices: List[str] = []
        dimensions: Dict[str, DimensionScore] = {}

        # ----------------------------------------------------------------------
        # Dimension 1: Coding Performance
        # ----------------------------------------------------------------------
        coding_evidence_sources = []
        coding_scores = []

        if payload.codeforcesHandle:
            cf = await coding_client.fetch_codeforces_data(payload.codeforcesHandle)
            if cf:
                coding_scores.append(cf["normalizedScore"])
                coding_evidence_sources.append(f"Codeforces ({cf.get('rank')}, Rating {cf.get('rating')})")

        if payload.leetcodeUsername:
            lc = await coding_client.fetch_leetcode_data(payload.leetcodeUsername)
            if lc:
                coding_scores.append(lc["normalizedScore"])
                coding_evidence_sources.append(f"LeetCode ({lc.get('totalSolved')} Solved, Contest {lc.get('contestRating')})")

        if coding_scores:
            avg_coding = round(sum(coding_scores) / len(coding_scores), 1)
            dimensions["coding_performance"] = DimensionScore(
                category="Coding Performance",
                score=avg_coding,
                confidence="VERIFIED" if len(coding_scores) > 1 else "HIGH",
                hasEvidence=True,
                evidenceSources=coding_evidence_sources,
                insights=f"Demonstrated across {len(coding_evidence_sources)} platform(s): {', '.join(coding_evidence_sources)}.",
            )
        else:
            missing_notices.append("Coding platforms (LeetCode/Codeforces) not linked. Algorithmic dimension has insufficient evidence.")
            dimensions["coding_performance"] = DimensionScore(
                category="Coding Performance",
                score=50.0,  # Neutral baseline
                confidence="INSUFFICIENT",
                hasEvidence=False,
                evidenceSources=[],
                insights="No verified coding platform handles connected yet. Missing evidence is not penalized.",
            )

        # ----------------------------------------------------------------------
        # Dimension 2: Development Capability
        # ----------------------------------------------------------------------
        dev_evidence_sources = []
        dev_score = 50.0
        has_dev_evidence = False

        if payload.githubUsername:
            gh = await github_client.aggregate_student_github_evidence(payload.githubUsername)
            if gh.get("verified"):
                has_dev_evidence = True
                dev_evidence_sources.append(f"GitHub (@{payload.githubUsername})")
                # Engineering hygiene + original repos
                hygiene = gh.get("averageEngineeringHygieneScore", 40.0)
                repos_count = gh.get("originalReposAnalyzed", 0)
                dev_score = round(min(hygiene * 0.7 + min(repos_count * 8.0, 30.0), 100.0), 1)
                dev_insights = f"Verified {repos_count} repositories. Engineering hygiene score: {hygiene}/100."
            else:
                missing_notices.append(f"GitHub handle '{payload.githubUsername}' was unreachable or private.")
                dev_insights = "GitHub handle provided but profile was private or unreachable."
        else:
            missing_notices.append("GitHub account not linked. Version control & development capability has insufficient evidence.")
            dev_insights = "Connect your GitHub profile to unlock development hygiene analysis."

        dimensions["development_capability"] = DimensionScore(
            category="Development Capability",
            score=dev_score,
            confidence="HIGH" if has_dev_evidence else "INSUFFICIENT",
            hasEvidence=has_dev_evidence,
            evidenceSources=dev_evidence_sources,
            insights=dev_insights,
        )

        # ----------------------------------------------------------------------
        # Dimension 3: Technical Fundamentals
        # ----------------------------------------------------------------------
        # Evaluated via track required skills overlap and internal assessments
        required_track_skills = [s.lower() for s in track_config["required_skills"]]
        student_skills = [s.lower() for s in payload.selfReportedSkills]
        overlap = set(student_skills).intersection(set(required_track_skills))

        fundamentals_score = 50.0
        fund_confidence = "MODERATE"
        has_fund_evidence = bool(payload.selfReportedSkills or payload.internalAssessments)

        if has_fund_evidence:
            overlap_ratio = len(overlap) / max(len(required_track_skills), 1)
            assessment_boost = 0.0
            if payload.internalAssessments:
                assessment_scores = [a.get("score", 70) for a in payload.internalAssessments]
                assessment_boost = (sum(assessment_scores) / len(assessment_scores)) * 0.4
                fundamentals_score = round(min(overlap_ratio * 60.0 + assessment_boost, 100.0), 1)
                fund_confidence = "VERIFIED"
            else:
                fundamentals_score = round(min(45.0 + overlap_ratio * 50.0, 100.0), 1)

            fund_insights = f"Matched {len(overlap)} of {len(required_track_skills)} core {track_config['title']} competencies."
        else:
            missing_notices.append("No technical skills or internal assessment scores recorded.")
            fund_insights = "Complete an institutional assessment or declare technical skills to demonstrate fundamentals."
            fund_confidence = "INSUFFICIENT"

        dimensions["technical_fundamentals"] = DimensionScore(
            category="Technical Fundamentals",
            score=fundamentals_score,
            confidence=fund_confidence,
            hasEvidence=has_fund_evidence,
            evidenceSources=["Skill Profile", "Track Curriculum"] if has_fund_evidence else [],
            insights=fund_insights,
        )

        # ----------------------------------------------------------------------
        # Dimension 4: Practical Application
        # ----------------------------------------------------------------------
        projects_count = len(payload.manualProjects or [])
        if has_dev_evidence and payload.githubUsername:
            projects_count += 2  # GitHub projects contribute

        if projects_count > 0:
            app_score = min(round(projects_count * 28.0 + 20.0, 1), 100.0)
            app_confidence = "HIGH"
            app_insights = f"Evaluated {projects_count} fullstack or domain-specific project artifact(s)."
        else:
            app_score = 50.0
            app_confidence = "INSUFFICIENT"
            app_insights = "No deployed or repository-backed projects submitted."
            missing_notices.append("Project portfolio empty. Submit project repositories or capstone links.")

        dimensions["practical_application"] = DimensionScore(
            category="Practical Application",
            score=app_score,
            confidence=app_confidence,
            hasEvidence=projects_count > 0,
            evidenceSources=["Submitted Projects"] if projects_count > 0 else [],
            insights=app_insights,
        )

        # ----------------------------------------------------------------------
        # Dimension 5: Consistency & Growth
        # ----------------------------------------------------------------------
        active_signals = sum([
            1 if dimensions["coding_performance"].hasEvidence else 0,
            1 if dimensions["development_capability"].hasEvidence else 0,
            1 if dimensions["technical_fundamentals"].hasEvidence else 0,
            1 if dimensions["practical_application"].hasEvidence else 0,
        ])
        growth_score = min(round(active_signals * 22.5 + 10.0, 1), 100.0)
        dimensions["consistency_growth"] = DimensionScore(
            category="Consistency and Growth",
            score=growth_score,
            confidence="HIGH" if active_signals >= 3 else "MODERATE",
            hasEvidence=active_signals > 0,
            evidenceSources=["Platform Cadence & Commit Velocity"],
            insights=f"Activity verified across {active_signals} independent technical evidence stream(s).",
        )

        # ----------------------------------------------------------------------
        # Compute Weighted Score Across Verified Dimensions
        # (Missing evidence is never zeroed; weighted only by available evidence)
        # ----------------------------------------------------------------------
        available_weight = 0.0
        weighted_sum = 0.0

        for dim_key, dim_obj in dimensions.items():
            w = track_weights.get(dim_key, 0.20)
            if dim_obj.hasEvidence:
                available_weight += w
                weighted_sum += dim_obj.score * w
            else:
                # Include neutral baseline at reduced factor so unverified dimensions
                # don't bias heavily negatively
                available_weight += w * 0.4
                weighted_sum += 50.0 * (w * 0.4)

        overall_score = round(weighted_sum / max(available_weight, 0.1), 1)
        overall_score = min(max(overall_score, 10.0), 99.0)

        # Overall Confidence
        evidence_count = sum(1 for d in dimensions.values() if d.hasEvidence)
        if evidence_count >= 4:
            overall_conf = "COMPREHENSIVE"
        elif evidence_count == 3:
            overall_conf = "HIGH"
        elif evidence_count == 2:
            overall_conf = "MODERATE"
        elif evidence_count == 1:
            overall_conf = "LOW"
        else:
            overall_conf = "INSUFFICIENT"

        # Readiness Tier
        if overall_score >= 82 and evidence_count >= 3:
            tier = "Industry Ready"
        elif overall_score >= 70:
            tier = "Competent"
        elif overall_score >= 55:
            tier = "Developing"
        else:
            tier = "Novice / Emerging"

        strengths = []
        improvements = []
        for dim in dimensions.values():
            if dim.hasEvidence and dim.score >= 70:
                strengths.append(f"Strong {dim.category.lower()} ({dim.score}/100)")
            elif not dim.hasEvidence or dim.score < 65:
                improvements.append(f"Strengthen {dim.category.lower()}: {dim.insights}")

        return CapabilityAssessmentResult(
            studentId=payload.studentId,
            track=track_key,
            trackTitle=track_config["title"],
            overallCapabilityScore=overall_score,
            readinessTier=tier,
            overallConfidence=overall_conf,
            dimensionScores=dimensions,
            missingEvidenceNotices=missing_notices,
            strengths=strengths or ["Proactive engagement with technical tracks"],
            improvementAreas=improvements or ["Continue building end-to-end distributed applications"],
        )


capability_engine = CapabilityAssessmentEngine()

