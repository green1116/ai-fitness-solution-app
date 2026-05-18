import { runExternalEvidenceIntelligence } from "@/lib/tender/evidence-intelligence";
import type {
  AttachmentEvidenceIngestInput,
  AttachmentEvidenceIngestResult,
  AttachmentEvidenceIntelligence,
  AttachmentIngestPhaseResult,
} from "../types";

function newIngestId() {
  return `ing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapPhases(
  phases: import("@/lib/tender/evidence-intelligence/types").EvidenceIntelligencePhaseResult[],
): AttachmentIngestPhaseResult[] {
  const phaseMap: Record<string, AttachmentIngestPhaseResult["phaseId"]> = {
    attachment: "extract",
    ocr: "extract",
    classification: "classify",
    linking: "link",
    registry: "ingest",
    coverage: "ingest",
  };

  return phases.map((p) => ({
    phaseId: phaseMap[p.phaseId] || "extract",
    status: p.status === "failed" ? "failed" : p.status === "skipped" ? "skipped" : "completed",
    message: p.message,
    durationMs: p.durationMs,
    metrics: p.metrics,
  }));
}

function buildIntelligence(
  result: Extract<import("@/lib/tender/evidence-intelligence/types").ExternalEvidenceIntelligenceResult, { ok: true }>,
): AttachmentEvidenceIntelligence {
  return {
    version: "3.3",
    attachmentCount: result.attachment.count,
    extractedCount: result.ocr.extractions.filter((e) => e.charCount > 0).length,
    linkedCount: result.linking.links.length,
    payloadsCount: result.registry.payloads.length,
    documentsAdded: result.registry.documentsAdded,
    linksAdded: result.registry.linksAdded,
    byType: result.classification.byType as AttachmentEvidenceIntelligence["byType"],
    warnings: result.warnings,
  };
}

/**
 * V3.3 附件证据摄入 — 委托 V3.4 External Evidence Intelligence Runtime
 */
export async function runAttachmentEvidenceIngest(
  input: AttachmentEvidenceIngestInput,
): Promise<AttachmentEvidenceIngestResult> {
  if (!input.attachments?.length) {
    throw new Error("请提供至少一个附件");
  }

  const eir = await runExternalEvidenceIntelligence({
    attachments: input.attachments,
    graph: input.graph,
    registry: input.registry,
    minLinkScore: input.minLinkScore,
    mergeInternalEvidence: false,
  });

  if (!eir.ok) {
    throw new Error(eir.message);
  }

  return {
    ok: true,
    ingestId: newIngestId(),
    ranAt: eir.ranAt,
    phases: mapPhases(eir.phases),
    extractions: eir.linking.extractions,
    links: eir.linking.links,
    payloads: eir.registry.payloads,
    registry: eir.registry.registry,
    intelligence: buildIntelligence(eir),
  };
}
