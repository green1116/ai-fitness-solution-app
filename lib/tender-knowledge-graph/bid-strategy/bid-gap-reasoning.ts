import { buildTenderOptimizationGaps } from "../optimization/optimization-gap";
import type { BidGapReasoning } from "./bid-strategy-types";

const GAP_BID_IMPACT: Record<string, string> = {
  "requirement-coverage": "prefer-balanced-or-aggressive-after-coverage-uplift",
  "evidence-readiness": "defer-or-risk-mitigation-until-evidence-ready",
  "compliance-score": "risk-mitigation-bid-until-compliance-closed",
  "requirement-vs-competitor": "aggressive-bid-only-after-gap-closure",
  "evidence-vs-competitor": "high-confidence-bid-after-evidence-parity",
  "compliance-vs-competitor": "balanced-bid-with-compliance-plan",
  "competition-pressure": "conservative-or-risk-mitigation-bid",
  "alternative-solution-risk": "cost-optimized-or-balanced-bid",
  "compliance-blockers": "no-bid-or-risk-mitigation-bid",
  "maintain-position": "balanced-or-high-confidence-bid",
};

export function buildBidGapReasoning(tenderId: string): BidGapReasoning[] {
  return buildTenderOptimizationGaps(tenderId).map((gap) => ({
    reasoningId: `tkg-bid-reasoning-${gap.gapId}`,
    tenderId,
    gapKind: gap.gapKind,
    severity: gap.severity,
    reasoning: `gap=${gap.gapKind} score=${gap.gapScore} summary=${gap.summary}`,
    bidImpact: GAP_BID_IMPACT[gap.gapKind] ?? "balanced-bid",
    traceRef: gap.traceRef,
    mode: "tender-knowledge-graph",
  }));
}
