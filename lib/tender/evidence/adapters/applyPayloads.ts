import {
  addEvidenceDocument,
  linkRequirementEvidence,
} from "../registry";
import type { EvidenceDocument, EvidenceRegistry } from "../types";
import { stableEvidenceDocumentId, stableLinkKey } from "./dedupe";
import type { ApplyPayloadsResult, NormalizedEvidencePayload } from "./types";

function payloadToDocument(payload: NormalizedEvidencePayload): EvidenceDocument {
  const id = stableEvidenceDocumentId(
    payload.sourceKind,
    payload.sourceId,
    payload.evidenceType,
  );
  return {
    id,
    title: payload.title,
    type: payload.evidenceType,
    brand: payload.brand,
    skuId: payload.skuId,
    fileRef: payload.fileRef,
    extractedText: payload.summary || payload.extractedText,
    linkedRequirements: payload.linkedRequirementIds
      ? [...payload.linkedRequirementIds]
      : undefined,
    linkedScoringItems: payload.linkedScoringItemIds,
    linkedRisks: payload.linkedRiskIds,
    confidence: payload.confidence,
    provenance: {
      trace: payload.trace,
      sourceKind: payload.sourceKind,
      sourceId: payload.sourceId,
      stageId: "ingest",
      ingestedAt: payload.createdAt ?? new Date().toISOString(),
    },
  };
}

/**
 * 将归一化 payloads 幂等写入 EvidenceRegistry
 */
export function applyPayloadsToRegistry(
  registry: EvidenceRegistry,
  payloads: NormalizedEvidencePayload[],
): ApplyPayloadsResult {
  let next = registry;
  const seenLinks = new Set(next.links.map((l) => stableLinkKey(l.requirementId, l.evidenceId)));
  let documentsAdded = 0;
  let linksAdded = 0;

  const docIdsBefore = new Set(next.documents.map((d) => d.id));

  for (const payload of payloads) {
    const doc = payloadToDocument(payload);
    const wasNew = !docIdsBefore.has(doc.id);
    next = addEvidenceDocument(next, doc);
    if (wasNew) {
      documentsAdded += 1;
      docIdsBefore.add(doc.id);
    }

    const reqIds = payload.linkedRequirementIds || [];
    for (const requirementId of reqIds) {
      const linkKey = stableLinkKey(requirementId, doc.id);
      if (seenLinks.has(linkKey)) continue;
      next = linkRequirementEvidence(next, {
        requirementId,
        evidenceId: doc.id,
        matchedField: payload.matchedField,
        confidence: payload.confidence,
      });
      seenLinks.add(linkKey);
      linksAdded += 1;
    }
  }

  return { registry: next, documentsAdded, linksAdded };
}
