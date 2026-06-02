import type { SemanticEvidenceLifecycleState } from "../types";

/**
 * V3.1 语义证据节点生命周期解析（确定性）
 */
export function resolveLifecycleState(
  linkedEvidenceCount: number,
  needCount: number,
  evidenceRequired: boolean,
): SemanticEvidenceLifecycleState {
  if (linkedEvidenceCount === 0) {
    return evidenceRequired || needCount > 0 ? "needed" : "discovered";
  }
  if (needCount === 0) {
    return linkedEvidenceCount >= 2 ? "verified" : "linked";
  }
  if (linkedEvidenceCount < needCount) {
    return "partially_linked";
  }
  return linkedEvidenceCount >= 2 ? "verified" : "linked";
}

export function lifecycleToCoverageStatus(
  state: SemanticEvidenceLifecycleState,
): import("@/lib/tender/evidence/types").EvidenceCoverageStatus {
  switch (state) {
    case "verified":
    case "linked":
      return "fully_evidenced";
    case "partially_linked":
      return "partially_evidenced";
    case "needed":
    case "gap":
      return "unsupported";
    case "discovered":
    default:
      return "risky";
  }
}
