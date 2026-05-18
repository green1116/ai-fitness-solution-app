import { classifyAttachment } from "@/lib/tender/attachment-evidence/classify/classifyAttachment";
import type { ExtractedAttachment } from "@/lib/tender/attachment-evidence/types";
import type { ClassificationRuntimeResult } from "../types";

/**
 * V3.4 Classification Runtime — 确定性语义分类（非 LLM）
 */
export function runClassificationRuntime(
  extractions: ExtractedAttachment[],
): ClassificationRuntimeResult {
  const classified = extractions.map((ext) => classifyAttachment(ext));
  const byType: ClassificationRuntimeResult["byType"] = {};

  for (const ext of classified) {
    byType[ext.evidenceType] = (byType[ext.evidenceType] || 0) + 1;
  }

  return { classified, byType };
}
