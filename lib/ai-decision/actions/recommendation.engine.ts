/**
 * V62 P1 — Recommendation engine (synthesizes insights + strategies)
 */

import type { BusinessContext, DecisionOutput } from "../core/decision.types";
import { analyzeBusinessState } from "../core/decision-engine";
import { generateStrategyPlan } from "../core/decision-engine";
import { generateActionPlan, buildDecisionOutput } from "./action.generator";

export function generateRecommendations(
  context: BusinessContext,
  organizationId: string,
): DecisionOutput {
  const analysis = analyzeBusinessState(context);
  const strategy = generateStrategyPlan(context, organizationId);
  const actions = generateActionPlan(context, organizationId, strategy, analysis);
  return buildDecisionOutput(context, analysis, strategy, actions);
}

export function rankRecommendations(output: DecisionOutput): string[] {
  return [...output.priorityActions, ...output.recommendations.filter((r) => !output.priorityActions.includes(r))];
}
