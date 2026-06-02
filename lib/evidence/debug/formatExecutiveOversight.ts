import type { ExecutiveTenderResult } from "../types";

export function summarizeExecutiveOversight(result: ExecutiveTenderResult): string {
  return [
    `Executive Oversight ${result.version}`,
    `score=${result.executiveScore}`,
    `risk=${result.riskLevel}`,
    `recommendation=${result.recommendation}`,
    `verdict=${result.verdict}`,
    result.title,
    result.supervision.requiresBoardReview ? "board-review" : "",
    result.supervision.requiresComplianceSignoff ? "compliance-signoff" : "",
  ]
    .filter(Boolean)
    .join(" | ");
}
