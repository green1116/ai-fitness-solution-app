import type { BidDecisionGateResult as ScoreBidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";
import type { BidDecisionGateResult, BidRiskItem } from "@/lib/tender/gate/types";

function itemLevelForGate(
  action: ScoreBidDecisionGateResult["action"]
): BidRiskItem["level"] {
  if (action === "block") return "block";
  if (action === "warn") return "warn";
  return "info";
}

export function mapScoreGateToPanelGate(
  g: ScoreBidDecisionGateResult
): BidDecisionGateResult {
  const level = itemLevelForGate(g.action);
  const steps = g.suggestedNextSteps || [];
  const reasons = g.reasons || [];

  const risks: BidRiskItem[] = reasons.map((reason, i) => ({
    id: `R-${String(i + 1).padStart(2, "0")}`,
    level,
    title: reason.length > 72 ? `${reason.slice(0, 72)}…` : reason,
    reason,
    suggestion: steps[i] ?? steps[0],
  }));

  if (risks.length === 0) {
    risks.push({
      id: "R-01",
      level,
      title: g.title,
      reason: g.message,
      suggestion: steps[0],
    });
  }

  return {
    action: g.action,
    summary: [g.title, g.message].filter(Boolean).join("\n"),
    score:
      typeof g.meta?.scoreRatio === "number"
        ? Math.round(g.meta.scoreRatio * 100)
        : undefined,
    risks,
  };
}
