import type { BidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";

export function formatBidDecisionGateText(gate: BidDecisionGateResult) {
  const lines: string[] = [];

  lines.push(gate.title);
  lines.push(gate.message);

  if (gate.reasons.length > 0) {
    lines.push("");
    lines.push("触发原因：");
    for (const reason of gate.reasons.slice(0, 5)) {
      lines.push(`- ${reason}`);
    }
  }

  if (gate.suggestedNextSteps.length > 0) {
    lines.push("");
    lines.push("建议下一步：");
    for (const step of gate.suggestedNextSteps.slice(0, 5)) {
      lines.push(`- ${step}`);
    }
  }

  return lines.join("\n");
}
