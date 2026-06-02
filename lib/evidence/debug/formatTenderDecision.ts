import type { TenderDecisionResult } from "../types";

export function summarizeTenderDecision(result: TenderDecisionResult): string {
  return [
    `Tender Decision ${result.version}`,
    `status=${result.status}`,
    `confidence=${result.confidence}`,
    result.title,
    `factors=${result.factors.length}`,
  ].join(" | ");
}

export function formatTenderDecisionTrace(result: TenderDecisionResult): string {
  const lines = [
    `[${result.version}] decision-run=${result.runId}`,
    `${result.status}: ${result.message}`,
    `confidence=${result.confidence}`,
    "---",
  ];
  for (const e of result.trace.events) {
    lines.push(`${e.at} [${e.kind}] ${e.message}`);
  }
  return lines.join("\n");
}
