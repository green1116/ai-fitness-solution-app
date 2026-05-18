import type { BidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";

export function formatBidDecisionSummaryText(summary: BidDecisionSummary) {
  const lines: string[] = [];

  lines.push(`投标建议：${summary.decision.label}`);
  if (summary.decision.summaryText) {
    lines.push(summary.decision.summaryText);
  }

  if (summary.majorRisks.length > 0) {
    lines.push("");
    lines.push("主要风险：");
    for (const risk of summary.majorRisks.slice(0, 5)) {
      lines.push(`- ${risk}`);
    }
  }

  if (summary.focusItems.length > 0) {
    lines.push("");
    lines.push(`重点补强项：${summary.focusItems.join("、")}`);
  }

  if (summary.priorityActions.length > 0) {
    lines.push("");
    lines.push("建议动作：");
    for (const action of summary.priorityActions.slice(0, 5)) {
      lines.push(`- ${action}`);
    }
  }

  return lines.join("\n");
}
