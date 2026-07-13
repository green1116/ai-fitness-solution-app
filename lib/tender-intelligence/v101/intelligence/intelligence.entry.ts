/**
 * E01-P3 — Tender Intelligence entry
 */

export {
  assertIntelligenceKernelPass,
  buildIntelligenceKernel,
  buildIntelligenceLifecycle,
  buildOpportunityProfile,
  buildTenderAnalysis,
} from "./intelligence.builder";

export {
  assertValidRequirementIndex,
  FIT_SCORE_BANDS,
  fitBandFromScore,
  INTELLIGENCE_LIFECYCLE_STAGES,
  INTELLIGENCE_STATUSES,
  OPPORTUNITY_TIERS,
  RISK_SEVERITIES,
  tierFromFit,
  validateOpportunityProfile,
  validateRequirementIndexInput,
  validateTenderAnalysis,
} from "./intelligence.schema";

export type { SchemaIssue, SchemaResult } from "./intelligence.schema";

export {
  V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
  V101_TENDER_INTELLIGENCE_VERSION,
} from "./intelligence.types";

export type {
  AnalysisSignal,
  FitScoreBand,
  IntelligenceKernelInput,
  IntelligenceKernelResult,
  IntelligenceLifecycle,
  IntelligenceLifecycleStage,
  IntelligenceLifecycleTransition,
  IntelligenceStatus,
  OpportunityCapabilityGap,
  OpportunityProfile,
  OpportunityTier,
  RiskSeverity,
  RiskSignal,
  TenderAnalysis,
} from "./intelligence.types";

import {
  assertIntelligenceKernelPass,
  buildIntelligenceKernel,
} from "./intelligence.builder";
import type {
  IntelligenceKernelInput,
  IntelligenceKernelResult,
} from "./intelligence.types";

export function runIntelligenceKernel(
  input: IntelligenceKernelInput,
): IntelligenceKernelResult {
  return buildIntelligenceKernel(input);
}

export function runIntelligenceKernelOrThrow(
  input: IntelligenceKernelInput,
): IntelligenceKernelResult & {
  ready: true;
  analysis: NonNullable<IntelligenceKernelResult["analysis"]>;
  opportunity: NonNullable<IntelligenceKernelResult["opportunity"]>;
} {
  const result = buildIntelligenceKernel(input);
  assertIntelligenceKernelPass(result);
  return result;
}

export function formatIntelligenceKernelSummary(
  result: IntelligenceKernelResult,
): string {
  const lines = [
    "V101 Tender Intelligence",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  requirements: ${result.requirementIndex.entryCount}`,
    `  analysis: ${
      result.analysis
        ? `signals=${result.analysis.signalCount} risks=${result.analysis.riskCount} complexity=${result.analysis.complexityScore}`
        : "none"
    }`,
    `  opportunity: ${
      result.opportunity
        ? `tier=${result.opportunity.tier} fit=${result.opportunity.fitScore} win=${result.opportunity.winProbability}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
