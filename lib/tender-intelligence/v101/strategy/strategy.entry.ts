/**
 * E01-P4 — AI Bid Strategy entry
 */

export {
  assertStrategyKernelPass,
  buildBidStrategy,
  buildStrategyKernel,
  buildStrategyLifecycle,
} from "./strategy.builder";

export {
  assertValidOpportunityProfile,
  BID_POSTURES,
  postureFromOpportunity,
  PRICING_STANCES,
  pricingStanceFromPosture,
  PROPOSAL_EMPHASES,
  STRATEGY_LIFECYCLE_STAGES,
  STRATEGY_STATUSES,
  validateBidStrategy,
  validateOpportunityProfileInput,
} from "./strategy.schema";

export type { SchemaIssue, SchemaResult } from "./strategy.schema";

export {
  V101_BID_STRATEGY_FREEZE_VERSION,
  V101_BID_STRATEGY_VERSION,
} from "./strategy.types";

export type {
  BidPosture,
  BidStrategy,
  PricingStance,
  ProposalEmphasis,
  StrategyKernelInput,
  StrategyKernelResult,
  StrategyLifecycle,
  StrategyLifecycleStage,
  StrategyLifecycleTransition,
  StrategyRiskBuffer,
  StrategyStatus,
  StrategyWorkstream,
} from "./strategy.types";

import {
  assertStrategyKernelPass,
  buildStrategyKernel,
} from "./strategy.builder";
import type {
  StrategyKernelInput,
  StrategyKernelResult,
} from "./strategy.types";

export function runStrategyKernel(input: StrategyKernelInput): StrategyKernelResult {
  return buildStrategyKernel(input);
}

export function runStrategyKernelOrThrow(
  input: StrategyKernelInput,
): StrategyKernelResult & {
  ready: true;
  strategy: NonNullable<StrategyKernelResult["strategy"]>;
} {
  const result = buildStrategyKernel(input);
  assertStrategyKernelPass(result);
  return result;
}

export function formatStrategyKernelSummary(result: StrategyKernelResult): string {
  const lines = [
    "V101 AI Bid Strategy",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  opportunity: tier=${result.opportunity.tier} fit=${result.opportunity.fitScore}`,
    `  strategy: ${
      result.strategy
        ? `posture=${result.strategy.posture} pricing=${result.strategy.pricingStance} goNoGo=${result.strategy.goNoGoScore}`
        : "none"
    }`,
    `  workstreams: ${result.strategy?.workstreams.length ?? 0}`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
