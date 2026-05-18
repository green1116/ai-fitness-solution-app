import type {
  EvidenceDocument,
  EvidenceRegistry,
  RequirementEvidenceLink,
} from "./types";

/**
 * 空证据注册表
 */
export function createEvidenceRegistry(): EvidenceRegistry {
  return { documents: [], links: [] };
}

function cloneRegistry(registry: EvidenceRegistry): EvidenceRegistry {
  return {
    documents: [...registry.documents],
    links: [...registry.links],
  };
}

/**
 * 注册证据文档（返回新注册表，保持不可变更新风格）
 */
export function addEvidenceDocument(
  registry: EvidenceRegistry,
  document: EvidenceDocument,
): EvidenceRegistry {
  const next = cloneRegistry(registry);
  const exists = next.documents.some((d) => d.id === document.id);
  if (exists) {
    next.documents = next.documents.map((d) =>
      d.id === document.id ? { ...d, ...document } : d,
    );
  } else {
    next.documents.push({ ...document });
  }
  return next;
}

/**
 * 批量注册
 */
export function addEvidenceDocuments(
  registry: EvidenceRegistry,
  documents: EvidenceDocument[],
): EvidenceRegistry {
  return documents.reduce(addEvidenceDocument, registry);
}

/**
 * 建立 requirement ↔ evidence 关联
 */
export function linkRequirementEvidence(
  registry: EvidenceRegistry,
  link: RequirementEvidenceLink,
): EvidenceRegistry {
  const next = cloneRegistry(registry);
  const doc = next.documents.find((d) => d.id === link.evidenceId);
  if (!doc) {
    throw new Error(`Evidence document not found: ${link.evidenceId}`);
  }

  next.links = next.links.filter(
    (l) =>
      !(
        l.requirementId === link.requirementId &&
        l.evidenceId === link.evidenceId
      ),
  );
  next.links.push({ ...link });

  const docIdx = next.documents.findIndex((d) => d.id === link.evidenceId);
  const reqIds = new Set(doc.linkedRequirements || []);
  reqIds.add(link.requirementId);
  next.documents[docIdx] = {
    ...doc,
    linkedRequirements: [...reqIds],
  };

  return next;
}

export function getEvidenceById(
  registry: EvidenceRegistry,
  evidenceId: string,
): EvidenceDocument | undefined {
  return registry.documents.find((d) => d.id === evidenceId);
}

/**
 * 按 requirement 查询已关联证据
 */
export function getEvidenceByRequirement(
  registry: EvidenceRegistry,
  requirementId: string,
): EvidenceDocument[] {
  const evidenceIds = new Set(
    registry.links
      .filter((l) => l.requirementId === requirementId)
      .map((l) => l.evidenceId),
  );

  const fromLinks = registry.documents.filter((d) => evidenceIds.has(d.id));
  const fromDocRefs = registry.documents.filter((d) =>
    d.linkedRequirements?.includes(requirementId),
  );

  const merged = new Map<string, EvidenceDocument>();
  for (const d of [...fromLinks, ...fromDocRefs]) merged.set(d.id, d);
  return [...merged.values()];
}

export function getLinksForRequirement(
  registry: EvidenceRegistry,
  requirementId: string,
): RequirementEvidenceLink[] {
  return registry.links.filter((l) => l.requirementId === requirementId);
}

export function listEvidenceDocuments(
  registry: EvidenceRegistry,
): EvidenceDocument[] {
  return [...registry.documents];
}
