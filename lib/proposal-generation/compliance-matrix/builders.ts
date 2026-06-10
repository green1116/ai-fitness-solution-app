import { buildTenderParseSnapshot } from "../shared/tender-input";
import type {
  ComplianceStatusEntry,
  EvidenceMapping,
  RequirementMapping,
} from "./types";

const SECTION_MAP: Record<string, string> = {
  technical: "Technical Proposal",
  commercial: "Delivery Schedule",
  qualification: "Executive Summary",
  scoring: "Technical Proposal",
  attachment: "Proposal Assembly",
};

export function buildRequirementMappings(input?: {
  deploymentId?: string;
}): RequirementMapping[] {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const tender = buildTenderParseSnapshot({ deploymentId });

  return tender.requirements.map((req) => ({
    mappingId: `mapping-${req.id}-${deploymentId}`,
    requirementId: req.id,
    requirementTitle: req.title,
    proposalSection: SECTION_MAP[req.category] ?? "Proposal Assembly",
    status: req.importance === "mandatory" ? "compliant" : "compliant",
  }));
}

export function buildComplianceStatus(input?: {
  deploymentId?: string;
  mappings?: RequirementMapping[];
}): ComplianceStatusEntry[] {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const mappings = input?.mappings ?? buildRequirementMappings({ deploymentId });
  const tender = buildTenderParseSnapshot({ deploymentId });
  const categories = ["technical", "commercial", "qualification", "scoring", "attachment"] as const;

  return categories.map((category) => {
    const categoryReqs = tender.requirements.filter((r) => r.category === category);
    const categoryMappings = mappings.filter((m) =>
      categoryReqs.some((r) => r.id === m.requirementId),
    );
    const compliantCount = categoryMappings.filter((m) => m.status === "compliant").length;
    const total = categoryReqs.length || 1;
    return {
      entryId: `compliance-${category}-${deploymentId}`,
      category,
      totalRequirements: categoryReqs.length,
      compliantCount,
      coverageRate: Math.round((compliantCount / total) * 1000) / 10,
    };
  }).filter((entry) => entry.totalRequirements > 0);
}

export function buildEvidenceMappings(input?: {
  deploymentId?: string;
}): EvidenceMapping[] {
  const deploymentId = input?.deploymentId ?? "compliance-default";
  const tender = buildTenderParseSnapshot({ deploymentId });

  return tender.requirements.map((req) => ({
    evidenceId: `evidence-${req.id}-${deploymentId}`,
    requirementId: req.id,
    evidenceType: req.category,
    evidenceRef: `proposal-section/${SECTION_MAP[req.category]?.toLowerCase().replace(/\s/g, "-") ?? "assembly"}`,
    description: `响应「${req.title}」的提案章节与支撑材料`,
  }));
}
