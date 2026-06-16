import {
  buildRequirementComplianceRecords,
  buildRequirementRegistryRecords,
  findRequirementByTender,
} from "@/lib/requirement-intelligence";
import { buildBrandEvidenceCoverage } from "@/lib/evidence-intelligence-network";
import type {
  TenderRiskAnalysis,
  TenderWinLevel,
  TenderWinProbabilityResult,
} from "./shared/types";
import {
  TKG_WIN_HIGH_THRESHOLD,
  TKG_WIN_MEDIUM_THRESHOLD,
} from "./shared/types";
import { findTenderGraphRecordById, buildTenderRegistryRecords } from "./tender-registry";
import { buildTenderBrandEdges } from "./tender-graph/tender-brand-edge";

let cachedWinResults: Map<string, TenderWinProbabilityResult> | undefined;

function resolveWinLevel(winProbability: number, blocked: boolean): TenderWinLevel {
  if (blocked) return "blocked";
  if (winProbability >= TKG_WIN_HIGH_THRESHOLD) return "high";
  if (winProbability >= TKG_WIN_MEDIUM_THRESHOLD) return "medium";
  return "low";
}

export function calculateWinProbability(tenderId: string): TenderWinProbabilityResult {
  if (!cachedWinResults) cachedWinResults = new Map();
  const cached = cachedWinResults.get(tenderId);
  if (cached) return cached;

  const tender = findTenderGraphRecordById(tenderId);
  const requirements = findRequirementByTender(tenderId);
  const complianceRecords = buildRequirementComplianceRecords().filter((record) =>
    requirements.some((req) => req.requirementId === record.requirementId),
  );

  const requirementCoverage =
    requirements.length === 0
      ? 0
      : Math.round(
          (complianceRecords.filter(
            (record) => record.complianceStatus === "pass" || record.complianceStatus === "partial",
          ).length /
            requirements.length) *
            100,
        );

  const evidenceReadiness =
    complianceRecords.length === 0
      ? 0
      : Math.round(
          complianceRecords.reduce((sum, record) => sum + record.factors.evidenceReadiness, 0) /
            complianceRecords.length,
        );

  const brandAlignment =
    complianceRecords.length === 0
      ? 0
      : Math.round(
          complianceRecords.reduce((sum, record) => sum + record.factors.brandAlignment, 0) /
            complianceRecords.length,
        );

  const complianceScore =
    complianceRecords.length === 0
      ? 0
      : Math.round(
          complianceRecords.reduce((sum, record) => sum + record.complianceScore, 0) /
            complianceRecords.length,
        );

  const competingBrands = new Set(
    buildTenderBrandEdges()
      .filter((edge) => edge.sourceId === tenderId)
      .map((edge) => edge.targetId),
  );
  const competitionDensity = Math.min(100, competingBrands.size * 18);

  const blocked =
    requirements.length === 0 ||
    complianceRecords.some((record) => record.complianceStatus === "blocked") ||
    complianceRecords.some((record) => record.gap.criticalBlockers.length > 0);

  const winProbability = blocked
    ? 0
    : Math.min(
        100,
        Math.round(
          requirementCoverage * 0.25 +
            evidenceReadiness * 0.25 +
            brandAlignment * 0.2 +
            complianceScore * 0.2 +
            Math.max(0, 100 - competitionDensity) * 0.1,
        ),
      );

  const winLevel = resolveWinLevel(winProbability, blocked);

  const result: TenderWinProbabilityResult = {
    resultId: `tkg-win-${tenderId}`,
    tenderId,
    winProbability,
    winLevel,
    requirementCoverage,
    evidenceReadiness,
    brandAlignment,
    complianceScore,
    competitionDensity,
    riskSummary:
      winLevel === "blocked"
        ? "blocked by compliance gaps or missing requirements"
        : `winProbability=${winProbability} coverage=${requirementCoverage} readiness=${evidenceReadiness}`,
    mode: "tender-knowledge-graph",
  };

  cachedWinResults.set(tenderId, result);
  return result;
}

export function calculateAllWinProbabilities(): TenderWinProbabilityResult[] {
  return buildTenderRegistryRecords().map((record) => calculateWinProbability(record.tenderId));
}

export function analyzeTenderRisk(tenderId: string): TenderRiskAnalysis {
  const win = calculateWinProbability(tenderId);
  const requirements = findRequirementByTender(tenderId);
  const blockers: string[] = [];

  if (requirements.length === 0) blockers.push("no-requirements");
  if (win.requirementCoverage < 50) blockers.push("low-requirement-coverage");
  if (win.evidenceReadiness < 55) blockers.push("low-evidence-readiness");
  if (win.competitionDensity >= 70) blockers.push("high-competition-density");

  const brandIds = new Set(requirements.map((record) => record.brandId).filter(Boolean));
  for (const brandId of brandIds) {
    const coverage = buildBrandEvidenceCoverage(brandId!);
    if (coverage.coverageLevel === "none") {
      blockers.push(`brand-coverage-none:${brandId}`);
    }
  }

  let riskLevel: TenderRiskAnalysis["riskLevel"] = "low";
  let riskScore = Math.max(0, 100 - win.winProbability);
  if (win.winLevel === "blocked" || blockers.length >= 3) {
    riskLevel = "critical";
    riskScore = Math.max(riskScore, 85);
  } else if (win.winLevel === "low") {
    riskLevel = "high";
    riskScore = Math.max(riskScore, 70);
  } else if (win.winLevel === "medium") {
    riskLevel = "medium";
    riskScore = Math.max(riskScore, 45);
  }

  return {
    analysisId: `tkg-risk-${tenderId}`,
    tenderId,
    riskLevel,
    riskScore,
    gapSummary: blockers.join("|") || "no-critical-gaps",
    blockers,
    mode: "tender-knowledge-graph",
  };
}
