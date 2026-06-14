import { findEvidenceByBrand, findEvidenceById } from "../evidence-registry";
import type {
  EvidenceKind,
  RequirementEvidenceEdge,
  RequirementStub,
  RequirementType,
} from "../shared/types";
import { REQUIREMENT_EDGE_MIN_MATCH_SCORE } from "../shared/types";
import {
  buildRequirementStubRecords,
  findRequirementStubById,
} from "./requirement-stub";

const KINDS_BY_REQUIREMENT_TYPE: Record<RequirementType, EvidenceKind[]> = {
  "technical-compliance": ["certificate", "test-report", "datasheet"],
  "commercial-qualification": ["authorization", "certificate"],
  "brand-authorization": ["authorization"],
  "case-reference": ["case-study", "project-reference"],
  "equipment-spec": ["datasheet", "test-report"],
};

function isEvidenceExpired(record: { evidenceStatus: string; validUntil?: string }): boolean {
  if (record.evidenceStatus === "expired") return true;
  if (!record.validUntil) return false;
  const expiry = new Date(record.validUntil).getTime();
  return !Number.isNaN(expiry) && expiry < Date.now();
}

function computeMatchScore(
  stub: RequirementStub,
  evidence: NonNullable<ReturnType<typeof findEvidenceById>>,
): number {
  const preferredKinds = KINDS_BY_REQUIREMENT_TYPE[stub.requirementType];
  const kindBonus = preferredKinds.includes(evidence.evidenceKind) ? 15 : 0;
  const expiredPenalty = isEvidenceExpired(evidence) ? 25 : 0;
  const brandBonus = evidence.brandId === stub.brandId ? 10 : 0;

  return Math.max(
    0,
    Math.min(100, Math.round(evidence.score.totalEvidenceScore * 0.7 + kindBonus + brandBonus - expiredPenalty)),
  );
}

export function buildRequirementEvidenceEdgeId(
  requirementId: string,
  evidenceId: string,
): string {
  return `req-ev-edge-${requirementId}-${evidenceId}`;
}

export function buildRequirementEvidenceEdge(
  stub: RequirementStub,
  evidenceId: string,
): RequirementEvidenceEdge | undefined {
  const evidence = findEvidenceById(evidenceId);
  if (!evidence || evidence.brandId !== stub.brandId) return undefined;

  const matchScore = computeMatchScore(stub, evidence);
  if (matchScore < REQUIREMENT_EDGE_MIN_MATCH_SCORE) return undefined;

  return {
    edgeId: buildRequirementEvidenceEdgeId(stub.requirementId, evidenceId),
    requirementId: stub.requirementId,
    evidenceId,
    brandId: stub.brandId,
    matchScore,
    traceRef: evidence.evidenceRef,
    sourceRecordId: evidence.evidenceId,
    mode: "evidence-intelligence-network",
  };
}

export function buildRequirementEvidenceEdges(): RequirementEvidenceEdge[] {
  const edges: RequirementEvidenceEdge[] = [];
  const seen = new Set<string>();

  for (const stub of buildRequirementStubRecords()) {
    if (!stub.stubReady) continue;

    const preferredKinds = KINDS_BY_REQUIREMENT_TYPE[stub.requirementType];
    const brandEvidence = findEvidenceByBrand(stub.brandId);

    for (const evidence of brandEvidence) {
      if (!preferredKinds.includes(evidence.evidenceKind)) continue;
      const edge = buildRequirementEvidenceEdge(stub, evidence.evidenceId);
      if (!edge || seen.has(edge.edgeId)) continue;
      seen.add(edge.edgeId);
      edges.push(edge);
    }
  }

  return edges;
}

export function findRequirementEvidenceEdgesByRequirementId(
  requirementId: string,
): RequirementEvidenceEdge[] {
  return buildRequirementEvidenceEdges().filter((edge) => edge.requirementId === requirementId);
}

export function findRequirementEvidenceEdgesByEvidenceId(
  evidenceId: string,
): RequirementEvidenceEdge[] {
  return buildRequirementEvidenceEdges().filter((edge) => edge.evidenceId === evidenceId);
}

export function enrichRequirementStubWithEdges(stub: RequirementStub): RequirementStub {
  const evidenceLinkIds = findRequirementEvidenceEdgesByRequirementId(stub.requirementId).map(
    (edge) => edge.edgeId,
  );

  return {
    ...stub,
    evidenceLinkIds,
    stubReady: stub.stubReady && evidenceLinkIds.length >= 1,
  };
}

export function buildEnrichedRequirementStubRecords(): RequirementStub[] {
  return buildRequirementStubRecords().map(enrichRequirementStubWithEdges);
}

export function findEnrichedRequirementStubById(requirementId: string): RequirementStub | undefined {
  const stub = findRequirementStubById(requirementId);
  return stub ? enrichRequirementStubWithEdges(stub) : undefined;
}

export { KINDS_BY_REQUIREMENT_TYPE };
