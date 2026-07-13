/**
 * E01-P5 — AI Proposal Intelligence entry
 */

export {
  assertProposalKernelPass,
  buildProposalBlueprint,
  buildProposalKernel,
  buildProposalLifecycle,
} from "./proposal.builder";

export {
  assertValidStrategyAndRequirements,
  PROPOSAL_BLUEPRINT_STATUSES,
  PROPOSAL_CHAPTER_KINDS,
  PROPOSAL_LIFECYCLE_STAGES,
  REQUIREMENT_COVERAGE_STATUSES,
  validateBidStrategyInput,
  validateProposalBlueprint,
  validateRequirementIndexInput,
} from "./proposal.schema";

export type { SchemaIssue, SchemaResult } from "./proposal.schema";

export {
  V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
  V101_PROPOSAL_INTELLIGENCE_VERSION,
} from "./proposal.types";

export type {
  ProposalBlueprint,
  ProposalBlueprintStatus,
  ProposalChapter,
  ProposalChapterKind,
  ProposalEvidenceNeed,
  ProposalKernelInput,
  ProposalKernelResult,
  ProposalLifecycle,
  ProposalLifecycleStage,
  ProposalLifecycleTransition,
  RequirementCoverageItem,
  RequirementCoverageStatus,
} from "./proposal.types";

import {
  assertProposalKernelPass,
  buildProposalKernel,
} from "./proposal.builder";
import type {
  ProposalKernelInput,
  ProposalKernelResult,
} from "./proposal.types";

export function runProposalKernel(input: ProposalKernelInput): ProposalKernelResult {
  return buildProposalKernel(input);
}

export function runProposalKernelOrThrow(
  input: ProposalKernelInput,
): ProposalKernelResult & {
  ready: true;
  blueprint: NonNullable<ProposalKernelResult["blueprint"]>;
} {
  const result = buildProposalKernel(input);
  assertProposalKernelPass(result);
  return result;
}

export function formatProposalKernelSummary(result: ProposalKernelResult): string {
  const lines = [
    "V101 AI Proposal Intelligence",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  strategy: posture=${result.strategy.posture} pricing=${result.strategy.pricingStance}`,
    `  requirements: ${result.requirementIndex.entryCount}`,
    `  blueprint: ${
      result.blueprint
        ? `chapters=${result.blueprint.chapterCount} coverage=${result.blueprint.coverageRatio} must=${result.blueprint.coveredMustCount}`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
