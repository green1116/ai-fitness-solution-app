import { getTenderBrandStubByTenderId } from "@/lib/brand-intelligence-network";
import { getProposalById } from "@/lib/tender-proposal";
import {
  buildBrandGraphNodeId,
  buildEvidenceGraphNodeId,
} from "../evidence-graph/graph-nodes";
import { findEvidenceByBrand, findEvidenceById, buildEvidenceRegistryRecords } from "../evidence-registry";
import type {
  EvidenceCoveragePath,
  EvidenceCoverageRecord,
  EvidenceCoverageValidation,
  EvidenceKind,
  RequirementStubValidation,
} from "../shared/types";
import {
  COVERAGE_MIN_STUB_PATHS,
  REQUIREMENT_EDGE_MIN_MATCH_SCORE,
  TENDER_COVERAGE_KIND_THRESHOLD,
} from "../shared/types";
import {
  buildCoverageRecordBase,
  computeTenderKindCoverageScore,
  resolveTenderCoverageLevel,
} from "./coverage-builder";
import {
  buildEnrichedRequirementStubRecords,
  buildRequirementEvidenceEdges,
  findEnrichedRequirementStubById,
  findRequirementEvidenceEdgesByRequirementId,
} from "../requirement-stub/requirement-evidence-edge";
import {
  buildRequirementStubGraphNodeId,
  findRequirementStubById,
} from "../requirement-stub/requirement-stub";

export function buildBrandEvidenceCoverage(brandId: string): EvidenceCoverageRecord {
  const evidence = findEvidenceByBrand(brandId);

  return buildCoverageRecordBase({
    coverageId: `coverage-brand-${brandId}`,
    targetType: "brand",
    targetId: brandId,
    brandId,
    evidence,
  });
}

export function buildTenderEvidenceCoverage(tenderId: string): EvidenceCoverageRecord {
  const tenderStubs = getTenderBrandStubByTenderId(tenderId);
  const brandIds = [...new Set(tenderStubs.map((stub) => stub.brandId))];
  const evidenceByBrand = new Map(
    brandIds.map((brandId) => [brandId, findEvidenceByBrand(brandId)]),
  );

  const { coverageScore, gapKinds, evidenceIds } = computeTenderKindCoverageScore(
    brandIds,
    evidenceByBrand,
  );
  const allEvidence = brandIds.flatMap((brandId) => evidenceByBrand.get(brandId) ?? []);
  const coverageLevel = resolveTenderCoverageLevel(coverageScore);

  return {
    coverageId: `coverage-tender-${tenderId}`,
    targetType: "tender",
    targetId: tenderId,
    tenderId,
    brandId: brandIds[0],
    evidenceIds,
    coverageLevel,
    coverageScore,
    kindBreakdown: allEvidence.reduce(
      (acc, record) => {
        acc[record.evidenceKind] = (acc[record.evidenceKind] ?? 0) + 1;
        return acc;
      },
      {} as EvidenceCoverageRecord["kindBreakdown"],
    ),
    gapKinds,
    expiredCount: allEvidence.filter((record) => record.evidenceStatus === "expired").length,
    coverageReady: coverageScore >= TENDER_COVERAGE_KIND_THRESHOLD,
    mode: "evidence-intelligence-network",
  };
}

export function buildRequirementEvidenceCoverage(
  requirementId: string,
): EvidenceCoverageRecord | undefined {
  const stub = findEnrichedRequirementStubById(requirementId);
  if (!stub) return undefined;

  const edges = findRequirementEvidenceEdgesByRequirementId(requirementId);
  const qualifyingEdges = edges.filter(
    (edge) => edge.matchScore >= REQUIREMENT_EDGE_MIN_MATCH_SCORE,
  );
  const evidence = qualifyingEdges
    .map((edge) => findEvidenceById(edge.evidenceId))
    .filter((record): record is NonNullable<typeof record> => Boolean(record));

  const base = buildCoverageRecordBase({
    coverageId: `coverage-requirement-${requirementId}`,
    targetType: "requirement",
    targetId: requirementId,
    requirementId,
    brandId: stub.brandId,
    tenderId: stub.tenderId,
    proposalId: stub.proposalId,
    evidence,
  });

  return {
    ...base,
    coverageReady: qualifyingEdges.length >= 1 && stub.stubReady,
    coverageLevel:
      qualifyingEdges.length >= 1
        ? base.coverageScore >= 70
          ? "partial"
          : "minimal"
        : "none",
  };
}

export function buildProposalEvidenceCoverage(proposalId: string): EvidenceCoverageRecord | undefined {
  const proposal = getProposalById(proposalId);
  if (!proposal) return undefined;

  const tenderCoverage = buildTenderEvidenceCoverage(proposal.tenderId);

  return {
    ...tenderCoverage,
    coverageId: `coverage-proposal-${proposalId}`,
    targetType: "proposal",
    targetId: proposalId,
    proposalId,
    tenderId: proposal.tenderId,
  };
}

export function buildEvidenceCoverageRecords(): EvidenceCoverageRecord[] {
  const records: EvidenceCoverageRecord[] = [];
  const stubs = buildEnrichedRequirementStubRecords();

  const brandIds = [...new Set(buildEvidenceRegistryRecords().map((record) => record.brandId))];
  for (const brandId of brandIds) {
    records.push(buildBrandEvidenceCoverage(brandId));
  }

  const tenderIds = [...new Set(stubs.map((stub) => stub.tenderId))];
  for (const tenderId of tenderIds) {
    records.push(buildTenderEvidenceCoverage(tenderId));
  }

  for (const stub of stubs) {
    const coverage = buildRequirementEvidenceCoverage(stub.requirementId);
    if (coverage) records.push(coverage);
  }

  const proposalIds = [
    ...new Set(stubs.map((stub) => stub.proposalId).filter((id): id is string => Boolean(id))),
  ];
  for (const proposalId of proposalIds) {
    const coverage = buildProposalEvidenceCoverage(proposalId);
    if (coverage) records.push(coverage);
  }

  return records;
}

export function findEvidenceCoverageGaps(brandId: string): EvidenceKind[] {
  return buildBrandEvidenceCoverage(brandId).gapKinds;
}

export function findEvidencePath(
  brandId: string,
  requirementId: string,
): EvidenceCoveragePath | undefined {
  const stub = findRequirementStubById(requirementId);
  if (!stub || stub.brandId !== brandId) return undefined;

  const edges = findRequirementEvidenceEdgesByRequirementId(requirementId).filter(
    (edge) => edge.matchScore >= REQUIREMENT_EDGE_MIN_MATCH_SCORE,
  );
  if (edges.length === 0) return undefined;

  const bestEdge = [...edges].sort((a, b) => b.matchScore - a.matchScore)[0]!;
  const evidence = findEvidenceById(bestEdge.evidenceId);
  if (!evidence) return undefined;

  const brandNodeId = buildBrandGraphNodeId(brandId);
  const evidenceNodeId = buildEvidenceGraphNodeId(evidence.evidenceId);
  const requirementNodeId = buildRequirementStubGraphNodeId(requirementId);

  return {
    brandId,
    requirementId,
    evidenceId: evidence.evidenceId,
    nodeIds: [brandNodeId, evidenceNodeId, requirementNodeId],
    edgeIds: [
      `edge-brand-evidence-${brandId}-${evidence.evidenceId}`,
      bestEdge.edgeId,
    ],
    pathKind: "brand-evidence-requirement",
    matchScore: bestEdge.matchScore,
    traceRefs: [evidence.evidenceRef, bestEdge.traceRef],
  };
}

export function findBrandRequirementEvidencePaths(limit = 5): EvidenceCoveragePath[] {
  const paths: EvidenceCoveragePath[] = [];

  for (const stub of buildEnrichedRequirementStubRecords()) {
    if (!stub.stubReady) continue;
    const path = findEvidencePath(stub.brandId, stub.requirementId);
    if (!path) continue;
    paths.push(path);
    if (paths.length >= limit) break;
  }

  return paths;
}

export function validateEvidenceCoverageRegistry(): EvidenceCoverageValidation {
  const records = buildEvidenceCoverageRecords();
  const brandRecords = records.filter((record) => record.targetType === "brand");
  const tenderRecords = records.filter((record) => record.targetType === "tender");
  const requirementRecords = records.filter((record) => record.targetType === "requirement");
  const paths = findBrandRequirementEvidencePaths();

  const valid =
    records.length >= 8 &&
    brandRecords.length >= 3 &&
    tenderRecords.length >= 3 &&
    requirementRecords.length >= 3 &&
    brandRecords.every((record) => record.evidenceIds.length >= 1) &&
    paths.length >= COVERAGE_MIN_STUB_PATHS;

  return {
    valid,
    count: records.length,
    summary: `evidence-coverage records=${records.length} brands=${brandRecords.length} tenders=${tenderRecords.length} requirements=${requirementRecords.length} paths=${paths.length} valid=${valid}`,
  };
}

export function validateRequirementStubRegistry(): RequirementStubValidation {
  const stubs = buildEnrichedRequirementStubRecords();
  const edges = buildRequirementEvidenceEdges();
  const ready = stubs.filter((stub) => stub.stubReady);
  const paths = findBrandRequirementEvidencePaths();

  const valid =
    stubs.length >= 3 &&
    ready.length >= 3 &&
    edges.length >= 3 &&
    edges.every((edge) => edge.matchScore >= REQUIREMENT_EDGE_MIN_MATCH_SCORE) &&
    paths.length >= COVERAGE_MIN_STUB_PATHS;

  return {
    valid,
    stubCount: stubs.length,
    edgeCount: edges.length,
    readyCount: ready.length,
    pathCount: paths.length,
    summary: `requirement-stub stubs=${stubs.length} ready=${ready.length} edges=${edges.length} paths=${paths.length} valid=${valid}`,
  };
}
