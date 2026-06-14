import { buildCatalogRegistryRecords } from "@/lib/product-catalog";
import { getProposalById } from "@/lib/tender-proposal";
import { getEvidenceLinksByBrandId } from "../evidence-link/evidence-link-builder";
import { getCaseStudyProfilesByBrandId } from "@/lib/brand-portal/case-study-profile/data";
import { applyEvidenceScoreBoost } from "../brand-scoring";
import {
  matchBrandToCatalog,
  matchBrandToProposal,
  matchBrandToTender,
} from "../brand-matcher";
import { buildBrandRegistryRecords, findBrandById } from "../brand-registry";
import { enrichBrandWithNetworkLinks } from "../brand-network-context";
import type { BrandDecisionContext, BrandMatchResult, BrandRecord, RegistryValidation } from "../shared/types";

export function buildBrandDecisionContext(input?: {
  tenderId?: string;
  proposalId?: string;
  catalogId?: string;
}): BrandDecisionContext {
  let candidateBrands = buildBrandRegistryRecords().map(enrichBrandWithNetworkLinks);
  const rankedMatches: BrandMatchResult[] = [];

  if (input?.proposalId) {
    rankedMatches.push(...matchBrandToProposal(input.proposalId));
    const proposal = getProposalById(input.proposalId);
    if (proposal) {
      candidateBrands = candidateBrands.filter((b) =>
        b.industrySectors.includes(proposal.industrySector),
      );
    }
  }

  if (input?.catalogId) {
    rankedMatches.push(...matchBrandToCatalog(input.catalogId));
  }

  if (input?.tenderId) {
    rankedMatches.push(...matchBrandToTender(input.tenderId));
  }

  if (rankedMatches.length === 0) {
    candidateBrands = candidateBrands.slice(0, 5);
  }

  const evidenceReadiness = Math.round(
    candidateBrands.reduce((sum, brand) => sum + evaluateBrandEvidenceReadiness(brand.brandId), 0) /
      Math.max(1, candidateBrands.length),
  );

  return {
    contextId: `brand-decision-context-${input?.tenderId ?? input?.proposalId ?? "default"}`,
    tenderId: input?.tenderId,
    proposalId: input?.proposalId,
    catalogId: input?.catalogId,
    candidateBrands,
    rankedMatches: rankedMatches.sort((a, b) => b.matchScore - a.matchScore),
    evidenceReadiness,
    decisionReady: candidateBrands.length >= 1 && evidenceReadiness >= 40,
    mode: "brand-intelligence-network",
  };
}

export function rankBrandsForProposal(proposalId: string): BrandRecord[] {
  const matches = matchBrandToProposal(proposalId);
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((match) => findBrandById(match.brandId)!)
    .filter(Boolean);
}

export function evaluateBrandEvidenceReadiness(brandId: string): number {
  const brand = findBrandById(brandId);
  if (!brand) return 0;

  const evidence = getEvidenceLinksByBrandId(brandId);
  const hasCaseStudy = getCaseStudyProfilesByBrandId(brandId).length > 0;
  const boosted = applyEvidenceScoreBoost(brand.score, evidence.length, hasCaseStudy);

  return Math.min(100, boosted.evidenceCoverageScore);
}

export function validateBrandDecisionRegistry(): RegistryValidation {
  const catalog = buildCatalogRegistryRecords()[0];
  const context = buildBrandDecisionContext({
    proposalId: catalog?.proposalId,
    catalogId: catalog?.catalogId,
    tenderId: catalog?.tenderId,
  });

  const ranked = rankBrandsForProposal(catalog?.proposalId ?? "");
  const readiness = evaluateBrandEvidenceReadiness("brand-life-fitness");

  const valid =
    context.decisionReady &&
    context.rankedMatches.length >= 0 &&
    ranked.length >= 1 &&
    readiness >= 40;

  return {
    valid,
    count: context.candidateBrands.length,
    summary: `brand-decision candidates=${context.candidateBrands.length} evidenceReadiness=${context.evidenceReadiness} ranked=${ranked.length} valid=${valid}`,
  };
}

export type { BrandDecisionContext };
