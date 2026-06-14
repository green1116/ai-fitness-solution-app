import { getSkuLinksBySku } from "@/lib/brand-intelligence-network";
import {
  buildBrandEvidenceCoverage,
  buildTenderEvidenceCoverage,
  findBrandRequirementEvidencePaths,
  findEvidencePath,
} from "./evidence-coverage/coverage-registry";
import { KINDS_BY_REQUIREMENT_TYPE } from "./requirement-stub/requirement-evidence-edge";
import {
  buildEnrichedRequirementStubRecords,
  findRequirementEvidenceEdgesByRequirementId,
} from "./requirement-stub/requirement-evidence-edge";
import { findRequirementStubById } from "./requirement-stub/requirement-stub";
import { findEvidenceByBrand, findEvidenceById } from "./evidence-registry";
import type { EvidenceKind, EvidenceMatchResult, RegistryValidation } from "./shared/types";
import { REQUIREMENT_EDGE_MIN_MATCH_SCORE } from "./shared/types";

function buildMatchResult(input: Omit<EvidenceMatchResult, "matchId" | "mode">): EvidenceMatchResult {
  return {
    ...input,
    matchId: `evidence-match-${input.targetType}-${input.targetId}-${input.brandId}`,
    mode: "evidence-intelligence-network",
  };
}

export function matchEvidenceToBrand(brandId: string): EvidenceMatchResult {
  const evidence = findEvidenceByBrand(brandId);
  const coverage = buildBrandEvidenceCoverage(brandId);
  const matchScore = Math.round((coverage.coverageScore + (evidence[0]?.score.totalEvidenceScore ?? 0)) / 2);

  return buildMatchResult({
    brandId,
    targetType: "brand",
    targetId: brandId,
    evidenceId: evidence[0]?.evidenceId,
    matchScore,
    matchReason: `brand-evidence-coverage:${coverage.coverageLevel}`,
    matchedEvidenceIds: evidence.map((record) => record.evidenceId),
    unmatchedGaps: coverage.gapKinds,
    matchReady: evidence.length >= 1 && matchScore >= 50,
  });
}

export function matchEvidenceToRequirement(requirementId: string): EvidenceMatchResult | undefined {
  const stub = findRequirementStubById(requirementId);
  if (!stub) return undefined;

  const edges = findRequirementEvidenceEdgesByRequirementId(requirementId).filter(
    (edge) => edge.matchScore >= REQUIREMENT_EDGE_MIN_MATCH_SCORE,
  );
  const matchedEvidenceIds = edges.map((edge) => edge.evidenceId);
  const preferredKinds = KINDS_BY_REQUIREMENT_TYPE[stub.requirementType];
  const brandEvidence = findEvidenceByBrand(stub.brandId);
  const unmatchedGaps = preferredKinds.filter(
    (kind) => !brandEvidence.some((record) => record.evidenceKind === kind),
  );

  const matchScore =
    edges.length === 0
      ? 0
      : Math.round(edges.reduce((sum, edge) => sum + edge.matchScore, 0) / edges.length);

  const path = findEvidencePath(stub.brandId, requirementId);

  return buildMatchResult({
    brandId: stub.brandId,
    targetType: "requirement",
    targetId: requirementId,
    evidenceId: matchedEvidenceIds[0],
    matchScore,
    matchReason: path
      ? `brand-evidence-requirement-path:${path.pathKind}`
      : `requirement-stub:${stub.requirementType}`,
    matchedEvidenceIds,
    unmatchedGaps,
    matchReady: edges.length >= 1 && matchScore >= REQUIREMENT_EDGE_MIN_MATCH_SCORE && stub.stubReady,
  });
}

export function matchEvidenceToTender(tenderId: string): EvidenceMatchResult | undefined {
  const stubs = buildEnrichedRequirementStubRecords().filter((stub) => stub.tenderId === tenderId);
  if (stubs.length === 0) return undefined;

  const brandId = stubs[0]!.brandId;
  const coverage = buildTenderEvidenceCoverage(tenderId);
  const evidence = coverage.evidenceIds
    .map((id) => findEvidenceById(id))
    .filter((record): record is NonNullable<typeof record> => Boolean(record));

  const matchScore = coverage.coverageScore;

  return buildMatchResult({
    brandId,
    targetType: "tender",
    targetId: tenderId,
    evidenceId: evidence[0]?.evidenceId,
    matchScore,
    matchReason: `tender-coverage:${coverage.coverageLevel}`,
    matchedEvidenceIds: coverage.evidenceIds,
    unmatchedGaps: coverage.gapKinds,
    matchReady: matchScore >= 60 && evidence.length >= 1,
  });
}

export function matchEvidenceToSku(sku: string): EvidenceMatchResult[] {
  const links = getSkuLinksBySku(sku);
  if (links.length === 0) return [];

  return links.map((link) => {
    const evidence = findEvidenceByBrand(link.brandId).filter((record) => record.sku === sku);
    const matchedEvidenceIds = evidence.map((record) => record.evidenceId);
    const matchScore =
      evidence.length === 0
        ? 40
        : Math.round(
            evidence.reduce((sum, record) => sum + record.score.totalEvidenceScore, 0) /
              evidence.length,
          );

    return buildMatchResult({
      brandId: link.brandId,
      targetType: "sku",
      targetId: sku,
      evidenceId: evidence[0]?.evidenceId,
      matchScore,
      matchReason: evidence.length > 0 ? "sku-datasheet-evidence" : "sku-link-without-evidence",
      matchedEvidenceIds,
      unmatchedGaps: evidence.length > 0 ? [] : (["datasheet"] as EvidenceKind[]),
      matchReady: evidence.length >= 1 && matchScore >= 50,
    });
  });
}

export function validateEvidenceMatcherRegistry(): RegistryValidation {
  const brandMatch = matchEvidenceToBrand("brand-life-fitness");
  const paths = findBrandRequirementEvidencePaths(1);
  const requirementMatch = paths[0]
    ? matchEvidenceToRequirement(paths[0].requirementId)
    : undefined;
  const tenderStub = buildEnrichedRequirementStubRecords().find((stub) => stub.stubReady);
  const tenderMatch = tenderStub ? matchEvidenceToTender(tenderStub.tenderId) : undefined;
  const skuMatches = matchEvidenceToSku("LF-T5-001");

  const valid =
    brandMatch.matchReady &&
    Boolean(requirementMatch?.matchReady) &&
    Boolean(tenderMatch?.matchReady) &&
    skuMatches.some((match) => match.matchReady);

  return {
    valid,
    count: skuMatches.length,
    summary: `evidence-matcher brand=${brandMatch.matchReady} requirement=${requirementMatch?.matchReady ?? false} tender=${tenderMatch?.matchReady ?? false} sku=${skuMatches.filter((m) => m.matchReady).length} valid=${valid}`,
  };
}
