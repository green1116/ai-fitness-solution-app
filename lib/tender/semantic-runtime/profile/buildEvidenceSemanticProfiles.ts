import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type { RequirementIntent, RequirementIntentType } from "../types";
import type { EvidenceSemanticProfile } from "../types";

const TYPE_TAGS: Record<string, string[]> = {
  datasheet: ["technical", "parameters", "specs"],
  certification: ["qualification", "compliance", "iso"],
  test_report: ["testing", "verification", "lab"],
  case_study: ["experience", "reference", "project"],
  warranty: ["service", "warranty"],
  sla: ["service", "sla", "response"],
  drawing: ["layout", "installation", "drawing"],
};

function tagFromText(text: string): string[] {
  const tags: string[] = [];
  if (/ISO|认证|资质/.test(text)) tags.push("qualification");
  if (/检测|报告/.test(text)) tags.push("testing");
  if (/参数|规格|功率|速度/.test(text)) tags.push("parameters");
  if (/案例|业绩/.test(text)) tags.push("experience");
  return tags;
}

function inferMatchedIntents(
  docTags: string[],
  docType: string,
  intents: RequirementIntent[],
  linkedIds: string[],
): RequirementIntentType[] {
  const matched = new Set<RequirementIntentType>();
  for (const intent of intents) {
    if (!linkedIds.includes(intent.requirementId)) {
      const overlap = intent.keywords.some((k) =>
        docTags.some((t) => t.includes(k) || k.includes(t)),
      );
      const typeOk = intent.expectedEvidenceTypes.includes(
        docType as import("@/lib/tender/evidence/types").EvidenceType,
      );
      if (overlap && typeOk) matched.add(intent.intentType);
      continue;
    }
    matched.add(intent.intentType);
  }
  return [...matched];
}

function strengthScore(
  confidence: number | undefined,
  linkCount: number,
  tagCount: number,
): number {
  let s = confidence ?? 0.5;
  s += Math.min(0.25, linkCount * 0.08);
  s += Math.min(0.15, tagCount * 0.03);
  return Math.min(1, Math.round(s * 100) / 100);
}

/**
 * V3.2 证据语义画像
 */
export function buildEvidenceSemanticProfiles(
  registry: EvidenceRegistry,
  intents: RequirementIntent[],
): EvidenceSemanticProfile[] {
  return registry.documents.map((doc) => {
    const corpus = [doc.title, doc.extractedText, doc.fileRef]
      .filter(Boolean)
      .join(" ");
    const semanticTags = [
      ...new Set([
        ...(TYPE_TAGS[doc.type] || []),
        ...tagFromText(corpus),
        ...(doc.provenance?.trace ? [doc.provenance.trace.split(".")[0]] : []),
      ]),
    ];
    const linkedIds = [
      ...(doc.linkedRequirements || []),
      ...registry.links
        .filter((l) => l.evidenceId === doc.id)
        .map((l) => l.requirementId),
    ];
    const uniqueLinked = [...new Set(linkedIds)];

    return {
      evidenceId: doc.id,
      title: doc.title,
      evidenceType: doc.type,
      semanticTags,
      strengthScore: strengthScore(doc.confidence, uniqueLinked.length, semanticTags.length),
      matchedIntentTypes: inferMatchedIntents(
        semanticTags,
        doc.type,
        intents,
        uniqueLinked,
      ),
      linkedRequirementIds: uniqueLinked,
    };
  });
}
