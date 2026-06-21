/**
 * V62 P2 — Action planner (V62 P1 decisions → ExecutionActions)
 */

import type { DecisionAction } from "@/lib/ai-decision/core/decision.types";
import type { ExecutionAction, ExecutionActionType, ExecutionTargetSystem } from "../core/execution.types";

let plannerCounter = 0;

function nextId(): string {
  plannerCounter += 1;
  return `plan-${Date.now()}-${plannerCounter}`;
}

export function resetPlannerCounterForTests(): void {
  plannerCounter = 0;
}

const DECISION_TO_EXECUTION: Record<
  DecisionAction["type"],
  { type: ExecutionActionType; target: ExecutionTargetSystem; operation: string }
> = {
  retention_campaign: { type: "GROWTH", target: "V60", operation: "retention" },
  funnel_optimization: { type: "GROWTH", target: "V60", operation: "funnel" },
  pricing_review: { type: "PRICING", target: "V60", operation: "adjust" },
  sales_automation: { type: "SALES", target: "V60", operation: "automate" },
  lead_scoring_adjustment: { type: "SALES", target: "V60", operation: "reminder" },
  growth_experiment: { type: "GROWTH", target: "V60", operation: "funnel" },
};

function mapPriority(p: DecisionAction["priority"]): ExecutionAction["priority"] {
  if (p === "high") return "HIGH";
  if (p === "medium") return "MEDIUM";
  return "LOW";
}

export function planExecutionFromDecision(decision: DecisionAction): ExecutionAction {
  const mapping = DECISION_TO_EXECUTION[decision.type];
  return {
    id: nextId(),
    type: mapping.type,
    priority: mapPriority(decision.priority),
    payload: { operation: mapping.operation, ...decision.payload, sourceDecisionId: decision.id },
    targetSystem: mapping.target,
    organizationId: decision.organizationId,
    label: decision.label,
    reversible: mapping.type !== "SALES" || mapping.operation === "reminder",
    sourceRule: "decision_engine",
  };
}

export function planExecutionsFromDecisions(decisions: DecisionAction[]): ExecutionAction[] {
  return decisions.map(planExecutionFromDecision);
}
