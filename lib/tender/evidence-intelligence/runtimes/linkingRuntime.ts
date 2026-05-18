import { linkAttachmentsToRequirements } from "@/lib/tender/attachment-evidence/link/linkAttachmentsToRequirements";
import type { ExtractedAttachment } from "@/lib/tender/attachment-evidence/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { LinkingRuntimeResult } from "../types";

/**
 * V3.4 Linking Runtime — 附件 ↔ 招标需求关联
 */
export function runLinkingRuntime(
  extractions: ExtractedAttachment[],
  graph: TenderSemanticGraph | undefined,
  minLinkScore = 0.35,
): LinkingRuntimeResult {
  if (!graph?.requirements?.length) {
    return { extractions, links: [], linkedAttachmentCount: 0 };
  }

  const { extractions: linked, links } = linkAttachmentsToRequirements(
    extractions,
    graph,
    minLinkScore,
  );

  return {
    extractions: linked,
    links,
    linkedAttachmentCount: new Set(links.map((l) => l.attachmentId)).size,
  };
}
