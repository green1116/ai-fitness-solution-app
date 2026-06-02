import { applyPayloadsToRegistry } from "@/lib/tender/evidence/adapters/applyPayloads";
import { buildEvidenceFromPipeline } from "@/lib/tender/evidence/bridge/buildEvidenceFromPipeline";
import type { EvidencePipelineSnapshot } from "@/lib/tender/evidence/bridge/pipelineTypes";
import { createEvidenceRegistry } from "@/lib/tender/evidence/registry";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import { adaptAttachmentEvidence } from "@/lib/tender/attachment-evidence/adapters/adaptAttachmentEvidence";
import type { ExtractedAttachment } from "@/lib/tender/attachment-evidence/types";
import type { RegistryRuntimeResult } from "../types";

export type RegistryRuntimeInput = {
  extractions: ExtractedAttachment[];
  baseRegistry?: EvidenceRegistry;
  snapshot?: EvidencePipelineSnapshot;
  mergeInternalEvidence?: boolean;
};

/**
 * V3.4 Registry Runtime — 内部 pipeline 证据 + 外部附件证据合并写入 Registry
 */
export function runRegistryRuntime(input: RegistryRuntimeInput): RegistryRuntimeResult {
  let registry: EvidenceRegistry;
  let mergedInternal = false;

  if (input.mergeInternalEvidence !== false && input.snapshot) {
    const internal = buildEvidenceFromPipeline(input.snapshot);
    registry = internal.registry;
    mergedInternal = true;
  } else if (input.baseRegistry) {
    registry = {
      documents: [...input.baseRegistry.documents],
      links: [...input.baseRegistry.links],
    };
  } else {
    registry = createEvidenceRegistry();
  }

  const payloads = adaptAttachmentEvidence(input.extractions);
  const { registry: next, documentsAdded, linksAdded } = applyPayloadsToRegistry(
    registry,
    payloads,
  );

  return {
    registry: next,
    payloads,
    documentsAdded,
    linksAdded,
    mergedInternal,
  };
}
