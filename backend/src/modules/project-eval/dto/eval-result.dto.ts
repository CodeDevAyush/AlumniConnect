export class GitHubPerformanceDto {
  originalRepoCount!: number;
  activeRepoCount!: number;
  programmingLanguageDiversity!: Record<string, number> | string[];
  commitActivity!: number; // time-normalized
  contributionConsistency!: number; // calculated metric (0-1.0)
  repositoryMaintenance!: number; // calculated metric (0-1.0)
  projectDocumentationQuality!: number; // score (0-100)
  testImplementation!: number; // score (0-100)
  projectComplexity!: number; // score (0-100)
  projectCompleteness!: number; // score (0-100)
}

export class CodeQualityMetricsDto {
  maintainabilityRating!: string | number; // Normalized score (A-E or 0-100)
  codeSmellsDensity!: number; // per KLOC
  bugDensity!: number; // per KLOC
  codeDuplication!: number; // percentage
  cognitiveComplexity!: number; // normalized metric
  testCoverage!: number; // percentage
  lintViolations!: number; // per KLOC
  securityFindings!: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    weightedScore: number;
    details: Array<{ checkId: string; severity: string; message: string; file?: string; line?: number }>;
  };
}

export class SecurityRiskDto {
  isVulnerable!: boolean;
  riskLevel!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  criticalVulnerabilitiesCount!: number;
  summary!: string;
}

export class ModelTrainingFeaturesDto {
  original_repo_count_norm!: number;
  active_repo_count_norm!: number;
  language_diversity_entropy!: number;
  commit_activity_norm!: number;
  contribution_consistency!: number;
  repository_maintenance!: number;
  documentation_quality_score!: number;
  test_implementation_score!: number;
  project_complexity_score!: number;
  project_completeness_score!: number;
  maintainability_norm!: number;
  code_smells_density_norm!: number;
  bug_density_norm!: number;
  code_duplication_ratio!: number;
  cognitive_complexity_norm!: number;
  test_coverage_ratio!: number;
  lint_violations_density_norm!: number;
  security_risk_weighted!: number;
}

export class EvalResultDto {
  repo!: string;
  owner!: string;
  repoName!: string;
  primaryLanguage!: string;
  stars!: number;
  forks!: number;
  openIssues!: number;
  overallQualityScore!: number;
  qualityGrade!: string;
  complexityTier!: string;
  gitHubPerformance!: GitHubPerformanceDto;
  codeQuality!: CodeQualityMetricsDto;
  securityRisk!: SecurityRiskDto;
  modelTrainingFeatures!: ModelTrainingFeaturesDto;
  aiSummary?: string;
}
