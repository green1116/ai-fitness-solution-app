import {
  buildRequirementGraph,
  buildRequirementGraphNodeId,
  type RequirementGraph,
} from "../requirement-graph/requirement-graph-context";
import { buildRequirementComplianceRecords } from "../requirement-compliance/compliance-registry";
import { findRequirementById } from "../requirement-registry";
import type {
  RequirementComplianceRecord,
  RequirementReadinessResult,
  RequirementReadinessScore,
  RequirementReadinessStatus,
  RequirementRecord,
} from "../shared/types";
import { REQUIREMENT_READINESS_MIN_SCORE } from "../shared/types";

function findComplianceRecord(requirementId: string): RequirementComplianceRecord | undefined {
  return buildRequirementComplianceRecords().find(
    (record) => record.requirementId === requirementId,
  );
}

export function computeRequirementRegistryScore(record: RequirementRecord): number {
  return Math.min(100, Math.round(record.score.totalRequirementScore));
}

export function computeRequirementGraphScore(
  record: RequirementRecord,
  graph: RequirementGraph = buildRequirementGraph(),
): number {
  const nodeId = buildRequirementGraphNodeId(record.requirementId);
  const connectedEdges = graph.edges.filter(
    (edge) => edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId,
  );

  let score = Math.min(45, connectedEdges.length * 9);
  if (connectedEdges.some((edge) => edge.edgeType === "tender-requirement")) score += 25;
  if (connectedEdges.some((edge) => edge.edgeType === "requirement-evidence")) score += 20;
  if (connectedEdges.some((edge) => edge.edgeType === "requirement-brand")) score += 10;

  return Math.min(100, score);
}

export function buildRequirementReadinessScore(
  record: RequirementRecord,
  compliance: RequirementComplianceRecord,
  graph: RequirementGraph = buildRequirementGraph(),
): RequirementReadinessScore {
  const registryScore = computeRequirementRegistryScore(record);
  const graphScore = computeRequirementGraphScore(record, graph);
  const complianceScore = compliance.complianceScore;
  const evidenceCoverageScore = compliance.factors.evidenceCoverage;
  const evidenceReadinessScore = compliance.factors.evidenceReadiness;
  const freshnessScore = compliance.factors.freshness;
  const confidenceScore = Math.round(record.confidenceScore);
  const priorityAlignmentScore = record.score.priorityAlignmentScore;

  const totalRequirementReadiness = Math.min(
    100,
    Math.round(
      registryScore * 0.15 +
        graphScore * 0.15 +
        complianceScore * 0.2 +
        evidenceCoverageScore * 0.15 +
        evidenceReadinessScore * 0.15 +
        freshnessScore * 0.05 +
        confidenceScore * 0.05 +
        priorityAlignmentScore * 0.1,
    ),
  );

  return {
    readinessId: `req-readiness-${record.requirementId}`,
    requirementId: record.requirementId,
    registryScore,
    graphScore,
    complianceScore,
    evidenceCoverageScore,
    evidenceReadinessScore,
    freshnessScore,
    confidenceScore,
    priorityAlignmentScore,
    totalRequirementReadiness,
    mode: "requirement-intelligence",
  };
}

export function deriveRequirementReadinessBlockers(
  compliance: RequirementComplianceRecord,
  score: RequirementReadinessScore,
): { criticalBlockers: string[]; warningItems: string[] } {
  const criticalBlockers = [...compliance.gap.criticalBlockers];
  const warningItems: string[] = [];

  if (compliance.linkedEvidenceIds.length === 0) {
    warningItems.push("no-linked-evidence");
  }
  if (compliance.gap.missingEvidenceKinds.length > 0) {
    warningItems.push(`missing-kinds:${compliance.gap.missingEvidenceKinds.join("|")}`);
  }
  if (compliance.gap.missingBrandLinks.length > 0) {
    warningItems.push("missing-brand-link");
  }
  if (compliance.gap.expiredEvidence.length > 0) {
    warningItems.push(`expired-evidence:${compliance.gap.expiredEvidence.length}`);
  }
  if (score.totalRequirementReadiness < REQUIREMENT_READINESS_MIN_SCORE) {
    warningItems.push("readiness-score-below-threshold");
  }

  return { criticalBlockers, warningItems };
}

export function resolveRequirementReadinessStatus(
  score: RequirementReadinessScore,
  criticalBlockers: string[],
  compliance: RequirementComplianceRecord,
): RequirementReadinessStatus {
  if (criticalBlockers.length > 0 || compliance.complianceStatus === "blocked") {
    return "blocked";
  }

  if (
    score.totalRequirementReadiness >= REQUIREMENT_READINESS_MIN_SCORE &&
    criticalBlockers.length === 0
  ) {
    return "ready";
  }

  if (
    compliance.complianceStatus === "partial" ||
    score.totalRequirementReadiness >= 40
  ) {
    return "partial";
  }

  return "not-ready";
}

export function buildRequirementReadinessResult(
  record: RequirementRecord,
  graph: RequirementGraph = buildRequirementGraph(),
): RequirementReadinessResult {
  const compliance =
    findComplianceRecord(record.requirementId) ??
    buildRequirementComplianceRecords().find((item) => item.requirementId === record.requirementId)!;
  const score = buildRequirementReadinessScore(record, compliance, graph);
  const { criticalBlockers, warningItems } = deriveRequirementReadinessBlockers(compliance, score);
  const readinessStatus = resolveRequirementReadinessStatus(score, criticalBlockers, compliance);

  return {
    resultId: `req-readiness-result-${record.requirementId}`,
    requirementId: record.requirementId,
    requirementRef: record.requirementRef,
    tenderId: record.tenderId,
    brandId: record.brandId,
    score,
    readinessStatus,
    criticalBlockers,
    warningItems,
    readinessReady:
      readinessStatus === "ready" &&
      criticalBlockers.length === 0 &&
      score.totalRequirementReadiness >= REQUIREMENT_READINESS_MIN_SCORE,
    mode: "requirement-intelligence",
  };
}

export function buildRequirementReadinessResultById(
  requirementId: string,
): RequirementReadinessResult | undefined {
  const record = findRequirementById(requirementId);
  return record ? buildRequirementReadinessResult(record) : undefined;
}
