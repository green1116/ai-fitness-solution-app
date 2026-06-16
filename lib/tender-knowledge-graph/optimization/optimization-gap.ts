import {
  buildRequirementComplianceRecords,
  findRequirementByTender,
} from "@/lib/requirement-intelligence";
import { buildTenderStrategyContext } from "./strategy-context";
import type { TenderOptimizationGap } from "./optimization-types";

function resolveSeverity(score: number): TenderOptimizationGap["severity"] {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function buildTenderOptimizationGaps(tenderId: string): TenderOptimizationGap[] {
  const context = buildTenderStrategyContext(tenderId);
  const gaps: TenderOptimizationGap[] = [];

  if (context.requirementCoverage < 80) {
    const gapScore = Math.round(100 - context.requirementCoverage);
    gaps.push({
      gapId: `tkg-gap-req-${tenderId}`,
      tenderId,
      gapKind: "requirement-coverage",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `requirement coverage ${context.requirementCoverage}% below target 80`,
      traceRef: `requirement-coverage:${context.requirementCoverage}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.evidenceReadiness < 70) {
    const gapScore = Math.round(100 - context.evidenceReadiness);
    gaps.push({
      gapId: `tkg-gap-evidence-${tenderId}`,
      tenderId,
      gapKind: "evidence-readiness",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `evidence readiness ${context.evidenceReadiness}% below target 70`,
      traceRef: `evidence-readiness:${context.evidenceReadiness}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.complianceScore < 75) {
    const gapScore = Math.round(100 - context.complianceScore);
    gaps.push({
      gapId: `tkg-gap-compliance-${tenderId}`,
      tenderId,
      gapKind: "compliance-score",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `compliance score ${context.complianceScore}% below target 75`,
      traceRef: `compliance-score:${context.complianceScore}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.competition.metrics.requirementCoverageGap < 0) {
    const gapScore = Math.abs(context.competition.metrics.requirementCoverageGap);
    gaps.push({
      gapId: `tkg-gap-req-vs-competitor-${tenderId}`,
      tenderId,
      gapKind: "requirement-vs-competitor",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `requirement coverage gap vs competitor ${context.competition.metrics.requirementCoverageGap}`,
      traceRef: `req-gap:${context.competition.metrics.requirementCoverageGap}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.competition.metrics.evidenceStrengthGap < 0) {
    const gapScore = Math.abs(context.competition.metrics.evidenceStrengthGap);
    gaps.push({
      gapId: `tkg-gap-evidence-vs-competitor-${tenderId}`,
      tenderId,
      gapKind: "evidence-vs-competitor",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `evidence strength gap vs competitor ${context.competition.metrics.evidenceStrengthGap}`,
      traceRef: `evidence-gap:${context.competition.metrics.evidenceStrengthGap}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.competition.metrics.complianceGap < 0) {
    const gapScore = Math.abs(context.competition.metrics.complianceGap);
    gaps.push({
      gapId: `tkg-gap-compliance-vs-competitor-${tenderId}`,
      tenderId,
      gapKind: "compliance-vs-competitor",
      severity: resolveSeverity(gapScore),
      gapScore,
      summary: `compliance gap vs competitor ${context.competition.metrics.complianceGap}`,
      traceRef: `compliance-gap:${context.competition.metrics.complianceGap}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.competitionPressure >= 65) {
    gaps.push({
      gapId: `tkg-gap-competition-pressure-${tenderId}`,
      tenderId,
      gapKind: "competition-pressure",
      severity: resolveSeverity(context.competitionPressure),
      gapScore: context.competitionPressure,
      summary: `competition pressure ${context.competitionPressure} above threshold 65`,
      traceRef: `competition-pressure:${context.competitionPressure}`,
      mode: "tender-knowledge-graph",
    });
  }

  if (context.competition.metrics.alternativeSolutionStrength >= 60) {
    gaps.push({
      gapId: `tkg-gap-alternative-risk-${tenderId}`,
      tenderId,
      gapKind: "alternative-solution-risk",
      severity: resolveSeverity(context.competition.metrics.alternativeSolutionStrength),
      gapScore: context.competition.metrics.alternativeSolutionStrength,
      summary: `alternative solution strength ${context.competition.metrics.alternativeSolutionStrength}`,
      traceRef: `alternative-strength:${context.competition.metrics.alternativeSolutionStrength}`,
      mode: "tender-knowledge-graph",
    });
  }

  const requirements = findRequirementByTender(tenderId);
  const complianceRecords = buildRequirementComplianceRecords().filter((record) =>
    requirements.some((req) => req.requirementId === record.requirementId),
  );
  const blockers = complianceRecords.flatMap((record) => record.gap.criticalBlockers);
  if (blockers.length > 0) {
    gaps.push({
      gapId: `tkg-gap-blockers-${tenderId}`,
      tenderId,
      gapKind: "compliance-blockers",
      severity: "critical",
      gapScore: Math.min(100, blockers.length * 25),
      summary: `critical blockers=${blockers.length}`,
      traceRef: blockers.join("|"),
      mode: "tender-knowledge-graph",
    });
  }

  if (gaps.length === 0) {
    gaps.push({
      gapId: `tkg-gap-maintain-${tenderId}`,
      tenderId,
      gapKind: "maintain-position",
      severity: "low",
      gapScore: 15,
      summary: "no-critical-gaps maintain competitive position",
      traceRef: "maintain-position",
      mode: "tender-knowledge-graph",
    });
  }

  return gaps;
}
