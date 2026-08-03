/**
 * WP-67 — Execution Engine
 * Deterministic execution items from DecisionItems (read-only).
 */
import { getDecision, type DecisionItem } from "./decision";

export const FEAT_68_ID = "FEAT-68" as const;
export const EXECUTION_ENGINE_CAPABILITY = "ExecutionEngine" as const;

export const EXECUTION_ACTIONS = ["RUN", "SKIP", "DEFER"] as const;

export type ExecutionAction = (typeof EXECUTION_ACTIONS)[number];

export type ExecutionItem = Readonly<{
  id: string;
  decisionId: string;
  action: ExecutionAction;
  position: number;
}>;

export type BuildExecutionInput = Readonly<{
  decisions?: readonly DecisionItem[];
}>;

const ACTION_RANK: Record<ExecutionAction, number> = {
  RUN: 0,
  SKIP: 1,
  DEFER: 2,
};

let cachedExecution: ExecutionItem[] | null = null;

function cloneItem(row: ExecutionItem): ExecutionItem {
  return { ...row };
}

function outcomeToAction(
  outcome: DecisionItem["outcome"],
): ExecutionAction {
  if (outcome === "ACCEPT") return "RUN";
  if (outcome === "REJECT") return "SKIP";
  return "DEFER";
}

/**
 * Build deterministic execution items from DecisionItems.
 * Sorted RUN → SKIP → DEFER, then stable decisionId.
 */
export function buildExecution(
  input: BuildExecutionInput = {},
): ExecutionItem[] {
  const decisions = input.decisions ? [...input.decisions] : getDecision();

  const ranked = decisions.map((d) => ({
    decisionId: d.id,
    action: outcomeToAction(d.outcome),
  }));

  ranked.sort((a, b) => {
    const byAction = ACTION_RANK[a.action] - ACTION_RANK[b.action];
    if (byAction !== 0) return byAction;
    return a.decisionId.localeCompare(b.decisionId);
  });

  const out: ExecutionItem[] = ranked.map((row, index) => ({
    id: `execution-${row.decisionId}`,
    decisionId: row.decisionId,
    action: row.action,
    position: index + 1,
  }));

  cachedExecution = out.map(cloneItem);
  return cachedExecution.map(cloneItem);
}

/**
 * Get the last built executions, or build if none cached.
 */
export function getExecution(): ExecutionItem[] {
  if (!cachedExecution) {
    return buildExecution();
  }
  return cachedExecution.map(cloneItem);
}

/** Test helper — clears cached executions. */
export function clearExecution(): void {
  cachedExecution = null;
}
