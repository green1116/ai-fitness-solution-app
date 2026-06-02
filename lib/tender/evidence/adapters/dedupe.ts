import type { EvidenceSourceKind } from "./types";
import type { EvidenceType } from "../types";

/**
 * 稳定 evidence 文档 ID（幂等：同 source + type 不重复创建）
 */
export function stableEvidenceDocumentId(
  sourceKind: EvidenceSourceKind,
  sourceId: string,
  evidenceType: EvidenceType,
): string {
  const safe = `${sourceKind}:${sourceId}:${evidenceType}`
    .replace(/[^a-zA-Z0-9:_-]/g, "_")
    .slice(0, 96);
  return `EVD-${safe}`;
}

export function stableLinkKey(
  requirementId: string,
  evidenceId: string,
): string {
  return `${requirementId}::${evidenceId}`;
}

/** technical requirement id → semantic requirement id */
export function resolveSemanticRequirementId(requirementId: string): string {
  const idx = requirementId.indexOf("-P");
  if (idx > 0) return requirementId.slice(0, idx);
  return requirementId;
}
