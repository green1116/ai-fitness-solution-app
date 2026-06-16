import { buildTenderRegistryRecords } from "@/lib/tender-hub";
import { findRequirementComplianceById } from "./requirement-compliance/compliance-registry";
import { findRequirementById } from "./requirement-registry";
import type {
  RequirementMatchResult,
  RequirementMatcherContext,
  RequirementQuerySnapshot,
  RequirementValidation,
} from "./shared/types";
import {
  CANONICAL_REQUIREMENT_MATCHER_BRAND_ID,
  REQUIREMENT_MATCHER_MIN_MATCH_SCORE,
} from "./shared/types";
import { buildRequirementQuerySnapshot } from "./requirement-query";

function buildRequirementMatchResult(
  input: Omit<RequirementMatchResult, "matchId" | "mode">,
): RequirementMatchResult {
  return {
    ...input,
    matchId: `req-match-${input.targetType}-${input.requirementId}-${input.targetId}`,
    mode: "requirement-intelligence",
  };
}

export function matchRequirementToEvidence(
  requirementId: string,
): RequirementMatchResult | undefined {
  const record = findRequirementById(requirementId);
  const compliance = findRequirementComplianceById(requirementId);
  if (!record || !compliance) return undefined;

  const matchedIds = compliance.linkedEvidenceIds;
  const matchScore =
    matchedIds.length === 0
      ? 0
      : Math.round(
          (compliance.complianceScore +
            compliance.factors.evidenceCoverage +
            compliance.factors.evidenceReadiness) /
            3,
        );

  return buildRequirementMatchResult({
    requirementId,
    targetType: "evidence",
    targetId: matchedIds[0] ?? requirementId,
    brandId: record.brandId,
    matchScore,
    matchReason: `requirement-evidence-links:${matchedIds.length}`,
    matchedIds,
    unmatchedGaps: compliance.gap.missingEvidenceKinds,
    matchReady: matchedIds.length >= 1 && matchScore >= REQUIREMENT_MATCHER_MIN_MATCH_SCORE,
  });
}

export function matchRequirementToBrand(
  requirementId: string,
): RequirementMatchResult | undefined {
  const record = findRequirementById(requirementId);
  const compliance = findRequirementComplianceById(requirementId);
  if (!record || !compliance) return undefined;

  const brandId = record.brandId ?? CANONICAL_REQUIREMENT_MATCHER_BRAND_ID;
  const matchedIds = brandId ? [brandId] : [];
  const matchScore = Math.round(compliance.factors.brandAlignment);

  return buildRequirementMatchResult({
    requirementId,
    targetType: "brand",
    targetId: brandId,
    brandId,
    matchScore,
    matchReason: record.brandId
      ? `requirement-brand-link:${brandId}`
      : "requirement-brand-fallback",
    matchedIds,
    unmatchedGaps: compliance.gap.missingBrandLinks,
    matchReady:
      matchedIds.length >= 1 &&
      compliance.gap.missingBrandLinks.length === 0 &&
      matchScore >= REQUIREMENT_MATCHER_MIN_MATCH_SCORE,
  });
}

export function matchRequirementToTender(
  requirementId: string,
): RequirementMatchResult | undefined {
  const record = findRequirementById(requirementId);
  const compliance = findRequirementComplianceById(requirementId);
  if (!record || !compliance) return undefined;

  const tenderExists = buildTenderRegistryRecords().some(
    (tender) => tender.tenderId === record.tenderId,
  );
  const matchScore = Math.round((compliance.complianceScore + record.matchScore) / 2);

  return buildRequirementMatchResult({
    requirementId,
    targetType: "tender",
    targetId: record.tenderId,
    brandId: record.brandId,
    matchScore,
    matchReason: tenderExists
      ? `tender-requirement-link:${record.tenderId}`
      : "tender-requirement-unregistered",
    matchedIds: [record.tenderId],
    unmatchedGaps: compliance.gap.missingEvidenceKinds,
    matchReady:
      tenderExists &&
      matchScore >= REQUIREMENT_MATCHER_MIN_MATCH_SCORE &&
      (compliance.complianceStatus === "pass" || compliance.complianceStatus === "partial"),
  });
}

export function matchRequirementToProposal(
  requirementId: string,
): RequirementMatchResult | undefined {
  const record = findRequirementById(requirementId);
  const compliance = findRequirementComplianceById(requirementId);
  if (!record || !compliance) return undefined;

  const proposalId = record.proposalId ?? `proposal-${record.tenderId}`;
  const matchScore = Math.round(
    (record.score.totalRequirementScore + compliance.complianceScore) / 2,
  );

  return buildRequirementMatchResult({
    requirementId,
    targetType: "proposal",
    targetId: proposalId,
    brandId: record.brandId,
    matchScore,
    matchReason: record.proposalId
      ? `requirement-proposal-link:${record.proposalId}`
      : record.anchorId
        ? `requirement-anchor-link:${record.anchorId}`
        : `requirement-proposal-derived:${proposalId}`,
    matchedIds: [proposalId],
    unmatchedGaps: [
      ...compliance.gap.missingEvidenceKinds,
      ...compliance.gap.missingBrandLinks,
    ],
    matchReady:
      matchScore >= REQUIREMENT_MATCHER_MIN_MATCH_SCORE &&
      (Boolean(record.proposalId) ||
        Boolean(record.anchorId) ||
        compliance.satisfied),
  });
}

export function buildRequirementMatcherContext(
  snapshot: RequirementQuerySnapshot,
): RequirementMatcherContext {
  const sample = snapshot.satisfied[0];
  const canonical = snapshot.canonical[0];
  const requirementId = sample?.requirementId;

  const evidenceMatch = requirementId
    ? matchRequirementToEvidence(requirementId)
    : undefined;
  const brandMatch = requirementId ? matchRequirementToBrand(requirementId) : undefined;
  const tenderMatch = requirementId ? matchRequirementToTender(requirementId) : undefined;
  const proposalMatch = requirementId ? matchRequirementToProposal(requirementId) : undefined;

  const contextReady =
    Boolean(sample) &&
    Boolean(canonical) &&
    Boolean(evidenceMatch?.matchReady) &&
    Boolean(brandMatch?.matchReady) &&
    Boolean(tenderMatch?.matchReady) &&
    Boolean(proposalMatch?.matchReady);

  return {
    contextId: "requirement-matcher-context-v40-p4",
    sampleRequirementId: sample?.requirementId,
    canonicalQueryRequirementId: canonical?.requirementId,
    evidenceMatch,
    brandMatch,
    tenderMatch,
    proposalMatch,
    contextReady,
    mode: "requirement-intelligence",
  };
}

export function validateRequirementMatcherFromContext(
  matcher: RequirementMatcherContext,
): RequirementValidation {
  const valid = matcher.contextReady;

  return {
    valid,
    count: [
      matcher.evidenceMatch,
      matcher.brandMatch,
      matcher.tenderMatch,
      matcher.proposalMatch,
    ].filter(Boolean).length,
    summary: `requirement-matcher sample=${matcher.sampleRequirementId ?? "none"} evidence=${matcher.evidenceMatch?.matchReady ?? false} brand=${matcher.brandMatch?.matchReady ?? false} tender=${matcher.tenderMatch?.matchReady ?? false} proposal=${matcher.proposalMatch?.matchReady ?? false} valid=${valid}`,
  };
}

export function validateRequirementMatcher(): RequirementValidation {
  return validateRequirementMatcherFromContext(
    buildRequirementMatcherContext(buildRequirementQuerySnapshot()),
  );
}
