import type { BrandEvidenceLink } from "@/lib/brand-intelligence-network";
import type { EvidenceRecord, EvidenceScore } from "./shared/types";

const SOURCE_AUTHENTICITY: Record<EvidenceRecord["sourceLayer"], number> = {
  "v20-real-catalog": 88,
  "v26-brand-portal": 90,
  "v38-brand-intelligence-network": 82,
  "v39-evidence-intelligence-network": 80,
};

function freshnessFromValidUntil(validUntil?: string): number {
  if (!validUntil) return 72;
  const expiry = new Date(validUntil).getTime();
  if (Number.isNaN(expiry)) return 72;
  const now = Date.now();
  if (expiry < now) return 45;
  const yearsLeft = (expiry - now) / (365 * 24 * 60 * 60 * 1000);
  return Math.min(100, Math.round(70 + yearsLeft * 8));
}

function completenessForRecord(input: {
  title: string;
  documentRef?: string;
  validUntil?: string;
  sku?: string;
  manufacturerId?: string;
  brandLinkId: string;
}): number {
  let score = 55;
  if (input.title.length > 0) score += 10;
  if (input.documentRef) score += 10;
  if (input.validUntil) score += 8;
  if (input.sku) score += 8;
  if (input.manufacturerId) score += 9;
  if (input.brandLinkId) score += 10;
  return Math.min(100, score);
}

function linkageForRecord(input: {
  brandId: string;
  brandLinkId: string;
  manufacturerId?: string;
  sku?: string;
}): number {
  let score = 60;
  if (input.brandId) score += 15;
  if (input.brandLinkId) score += 15;
  if (input.manufacturerId) score += 5;
  if (input.sku) score += 5;
  return Math.min(100, score);
}

export function buildEvidenceScore(
  evidenceId: string,
  input: {
    sourceLayer: EvidenceRecord["sourceLayer"];
    title: string;
    documentRef?: string;
    validUntil?: string;
    brandId: string;
    brandLinkId: string;
    manufacturerId?: string;
    sku?: string;
  },
): EvidenceScore {
  const authenticityScore = SOURCE_AUTHENTICITY[input.sourceLayer] ?? 75;
  const completenessScore = completenessForRecord(input);
  const freshnessScore = freshnessFromValidUntil(input.validUntil);
  const linkageScore = linkageForRecord(input);

  const totalEvidenceScore = Math.round(
    authenticityScore * 0.25 +
      completenessScore * 0.25 +
      freshnessScore * 0.2 +
      linkageScore * 0.3,
  );

  return {
    scoreId: `evidence-score-${evidenceId}`,
    evidenceId,
    authenticityScore,
    completenessScore,
    freshnessScore,
    linkageScore,
    totalEvidenceScore,
    mode: "evidence-intelligence-network",
  };
}

export function deriveEvidenceScoreFromBrandLink(
  evidenceId: string,
  link: BrandEvidenceLink,
  title: string,
): EvidenceScore {
  return buildEvidenceScore(evidenceId, {
    sourceLayer: link.sourceLayer as EvidenceRecord["sourceLayer"],
    title,
    documentRef: link.documentRef,
    validUntil: link.validUntil,
    brandId: link.brandId,
    brandLinkId: link.linkId,
    manufacturerId: link.manufacturerId,
    sku: link.sku,
  });
}
