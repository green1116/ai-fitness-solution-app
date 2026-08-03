/**
 * WP-66 — Decision Engine
 * Deterministic decision items from ApprovalItems (read-only).
 */
import { getApproval, type ApprovalItem } from "./approval";

export const FEAT_67_ID = "FEAT-67" as const;
export const DECISION_ENGINE_CAPABILITY = "DecisionEngine" as const;

export const DECISION_OUTCOMES = ["ACCEPT", "HOLD", "REJECT"] as const;

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export type DecisionItem = Readonly<{
  id: string;
  approvalId: string;
  outcome: DecisionOutcome;
  position: number;
}>;

export type BuildDecisionInput = Readonly<{
  approvals?: readonly ApprovalItem[];
}>;

const OUTCOME_RANK: Record<DecisionOutcome, number> = {
  ACCEPT: 0,
  HOLD: 1,
  REJECT: 2,
};

let cachedDecision: DecisionItem[] | null = null;

function cloneItem(row: DecisionItem): DecisionItem {
  return { ...row };
}

function approvalToOutcome(
  status: ApprovalItem["status"],
): DecisionOutcome {
  if (status === "APPROVED") return "ACCEPT";
  if (status === "PENDING") return "HOLD";
  return "REJECT";
}

/**
 * Build deterministic decision items from ApprovalItems.
 * Sorted ACCEPT → HOLD → REJECT, then stable approvalId.
 */
export function buildDecision(
  input: BuildDecisionInput = {},
): DecisionItem[] {
  const approvals = input.approvals ? [...input.approvals] : getApproval();

  const ranked = approvals.map((a) => ({
    approvalId: a.id,
    outcome: approvalToOutcome(a.status),
  }));

  ranked.sort((a, b) => {
    const byOutcome = OUTCOME_RANK[a.outcome] - OUTCOME_RANK[b.outcome];
    if (byOutcome !== 0) return byOutcome;
    return a.approvalId.localeCompare(b.approvalId);
  });

  const out: DecisionItem[] = ranked.map((row, index) => ({
    id: `decision-${row.approvalId}`,
    approvalId: row.approvalId,
    outcome: row.outcome,
    position: index + 1,
  }));

  cachedDecision = out.map(cloneItem);
  return cachedDecision.map(cloneItem);
}

/**
 * Get the last built decisions, or build if none cached.
 */
export function getDecision(): DecisionItem[] {
  if (!cachedDecision) {
    return buildDecision();
  }
  return cachedDecision.map(cloneItem);
}

/** Test helper — clears cached decisions. */
export function clearDecision(): void {
  cachedDecision = null;
}
