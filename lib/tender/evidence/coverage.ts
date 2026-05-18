import type {
  EvidenceCoverageStatus,
  EvidenceDocument,
  RequirementCoverageInput,
  RequirementCoverageResult,
} from "./types";
import type { RequirementEvidenceLink } from "./types";

const LOW_CONFIDENCE_THRESHOLD = 0.45;
const HIGH_CONFIDENCE_THRESHOLD = 0.72;

function avgConfidence(
  documents: EvidenceDocument[],
  links: RequirementEvidenceLink[],
): number {
  if (!documents.length) return 0;
  const byId = new Map(links.map((l) => [l.evidenceId, l.confidence]));
  const scores = documents.map(
    (d) => byId.get(d.id) ?? d.confidence ?? 0.5,
  );
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function hasPartialFieldMatch(links: RequirementEvidenceLink[]): boolean {
  return links.some(
    (l) =>
      l.matchedField &&
      !l.matchedField.startsWith("type:") &&
      l.matchedField !== "skuRef",
  );
}

function hasStrongMatch(
  documents: EvidenceDocument[],
  links: RequirementEvidenceLink[],
): boolean {
  const avg = avgConfidence(documents, links);
  if (avg >= HIGH_CONFIDENCE_THRESHOLD && documents.length >= 1) {
    return hasPartialFieldMatch(links) || documents.length >= 2;
  }
  return (
    documents.length >= 2 &&
    avg >= LOW_CONFIDENCE_THRESHOLD &&
    hasPartialFieldMatch(links)
  );
}

/**
 * requirement + linked evidence → 覆盖状态（确定性规则）
 */
export function evaluateRequirementCoverage(
  input: RequirementCoverageInput,
  linkedEvidence: EvidenceDocument[],
  links: RequirementEvidenceLink[] = [],
): RequirementCoverageResult {
  const notes: string[] = [];

  if (linkedEvidence.length === 0) {
    return {
      requirementId: input.requirementId,
      status: "unsupported",
      linkedEvidenceIds: [],
      notes: ["无关联证据文件"],
    };
  }

  const avg = avgConfidence(linkedEvidence, links);

  if (linkedEvidence.length === 1 && avg < LOW_CONFIDENCE_THRESHOLD) {
    notes.push("仅 1 份低置信度证据");
    return {
      requirementId: input.requirementId,
      status: "risky",
      linkedEvidenceIds: linkedEvidence.map((d) => d.id),
      notes,
    };
  }

  if (hasStrongMatch(linkedEvidence, links)) {
    return {
      requirementId: input.requirementId,
      status: "fully_evidenced",
      linkedEvidenceIds: linkedEvidence.map((d) => d.id),
      notes: avg < HIGH_CONFIDENCE_THRESHOLD ? ["多证据交叉印证"] : undefined,
    };
  }

  if (
    linkedEvidence.length >= 1 &&
    (hasPartialFieldMatch(links) || avg >= LOW_CONFIDENCE_THRESHOLD)
  ) {
    notes.push("证据与条款仅部分字段对齐");
    return {
      requirementId: input.requirementId,
      status: "partially_evidenced",
      linkedEvidenceIds: linkedEvidence.map((d) => d.id),
      notes,
    };
  }

  if (avg < LOW_CONFIDENCE_THRESHOLD) {
    return {
      requirementId: input.requirementId,
      status: "risky",
      linkedEvidenceIds: linkedEvidence.map((d) => d.id),
      notes: ["证据置信度偏低，建议补充材料"],
    };
  }

  return {
    requirementId: input.requirementId,
    status: "partially_evidenced",
    linkedEvidenceIds: linkedEvidence.map((d) => d.id),
    notes,
  };
}

export function evaluateRegistryCoverage(
  requirements: RequirementCoverageInput[],
  getLinked: (requirementId: string) => {
    documents: EvidenceDocument[];
    links: RequirementEvidenceLink[];
  },
): RequirementCoverageResult[] {
  return requirements.map((req) => {
    const { documents, links } = getLinked(req.requirementId);
    return evaluateRequirementCoverage(req, documents, links);
  });
}
