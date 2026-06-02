import type {
  EvidenceLinkRecord,
  EvidenceProvenance,
  EvidenceRecord,
  EvidenceRegistryState,
  OcrExtraction,
  SemanticClassification,
} from "../types";

export function createEmptyRegistry(): EvidenceRegistryState {
  return { records: [], links: [] };
}

function evidenceIdFrom(attachmentId: string) {
  return `ev-${attachmentId}`;
}

export type IngestEvidenceInput = {
  extraction: OcrExtraction;
  classification: SemanticClassification;
  provenance: EvidenceProvenance;
};

/**
 * Registry Runtime — 写入证据记录
 */
export function ingestEvidenceRecord(
  registry: EvidenceRegistryState,
  input: IngestEvidenceInput,
): EvidenceRegistryState {
  const id = evidenceIdFrom(input.extraction.attachmentId);
  const record: EvidenceRecord = {
    id,
    attachmentId: input.extraction.attachmentId,
    title: input.extraction.fileName,
    kind: input.classification.kind,
    extractedText: input.extraction.rawText.slice(0, 12000),
    classification: input.classification,
    provenance: input.provenance,
  };

  const records = [
    ...registry.records.filter((r) => r.id !== id),
    record,
  ];

  return { ...registry, records };
}

export function addEvidenceLink(
  registry: EvidenceRegistryState,
  link: EvidenceLinkRecord,
): EvidenceRegistryState {
  const exists = registry.links.some(
    (l) =>
      l.requirementId === link.requirementId &&
      l.evidenceId === link.evidenceId,
  );
  if (exists) return registry;
  return {
    ...registry,
    links: [...registry.links, link],
  };
}

export function getEvidenceByRequirement(
  registry: EvidenceRegistryState,
  requirementId: string,
): EvidenceRecord[] {
  const evidenceIds = new Set(
    registry.links
      .filter((l) => l.requirementId === requirementId)
      .map((l) => l.evidenceId),
  );
  return registry.records.filter((r) => evidenceIds.has(r.id));
}

export function mergeRegistries(
  base: EvidenceRegistryState,
  incoming: EvidenceRegistryState,
): EvidenceRegistryState {
  const recordMap = new Map(base.records.map((r) => [r.id, r]));
  for (const r of incoming.records) {
    recordMap.set(r.id, r);
  }
  const linkKeys = new Set(
    base.links.map((l) => `${l.requirementId}:${l.evidenceId}`),
  );
  const links = [...base.links];
  for (const l of incoming.links) {
    const key = `${l.requirementId}:${l.evidenceId}`;
    if (!linkKeys.has(key)) {
      links.push(l);
      linkKeys.add(key);
    }
  }
  return {
    records: Array.from(recordMap.values()),
    links,
  };
}
