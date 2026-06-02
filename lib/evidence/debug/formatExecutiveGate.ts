import type { ExecutiveApprovalGateRuntimeResult } from "../types";

export function summarizeExecutiveGate(result: ExecutiveApprovalGateRuntimeResult): string {
  return [
    `Executive Gate ${result.version}`,
    `status=${result.status}`,
    `releasable=${result.releasable}`,
    `release=${result.tenderReleaseDecision}`,
    `recommendation=${result.recommendation}`,
    `score=${result.executiveScore}`,
    result.reasons.length ? `reasons=${result.reasons.join(",")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}
