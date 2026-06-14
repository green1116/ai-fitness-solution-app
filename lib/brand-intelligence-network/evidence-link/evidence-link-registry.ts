import {
  buildBrandEvidenceLinkRecords,
  buildBrandEvidenceLinksForBrand,
  getEvidenceCoverageStats,
  getEvidenceLinksByBrandId,
  validateEvidenceRefUniqueness,
} from "./evidence-link-builder";
import { buildBrandRegistryRecords } from "../brand-registry";
import { getSkuLinksByBrandId } from "../brand-mapping/sku-link-registry";
import { getCaseStudyProfilesByBrandId } from "@/lib/brand-portal/case-study-profile/data";
import type { BrandEvidenceKind, RegistryValidation } from "../shared/types";
import { BRAND_EVIDENCE_KINDS } from "../shared/types";

export { buildBrandEvidenceLinkRecords, getEvidenceLinksByBrandId, getEvidenceCoverageStats };

export function validateEvidenceLinkRegistry(): RegistryValidation {
  const links = buildBrandEvidenceLinkRecords();
  const stats = getEvidenceCoverageStats();
  const refCheck = validateEvidenceRefUniqueness();
  const activeBrands = buildBrandRegistryRecords().filter((b) =>
    ["active", "verified", "authorized", "matched"].includes(b.brandStatus),
  );

  const brandsWithEvidence = activeBrands.filter(
    (b) => getEvidenceLinksByBrandId(b.brandId).length >= 1,
  );

  const brandsWithSku = activeBrands.filter((b) => getSkuLinksByBrandId(b.brandId).length >= 1);
  const brandsWithDatasheet = brandsWithSku.filter((b) =>
    getEvidenceLinksByBrandId(b.brandId).some((l) => l.evidenceKind === "datasheet"),
  );

  const kindCoverage = BRAND_EVIDENCE_KINDS.filter((kind) =>
    links.some((l) => l.evidenceKind === kind),
  ).length;

  const valid =
    links.length >= 8 &&
    brandsWithEvidence.length >= activeBrands.length * 0.8 &&
    brandsWithDatasheet.length >= Math.min(4, brandsWithSku.length) &&
    kindCoverage >= 4 &&
    refCheck.valid;

  return {
    valid,
    count: links.length,
    summary: `evidence-link-registry count=${links.length} brandCoverage=${stats.brandCoverage} kinds=${kindCoverage}/6 refUnique=${refCheck.valid} valid=${valid}`,
  };
}

export function validateEvidenceKindStats(): RegistryValidation {
  const stats = getEvidenceCoverageStats();
  const valid = Object.keys(stats.kindBreakdown).length >= 4;

  return {
    valid,
    count: stats.totalLinks,
    summary: `evidence-kind-stats kinds=${Object.keys(stats.kindBreakdown).length} avgPerBrand=${stats.averagePerBrand} valid=${valid}`,
  };
}

export function validateCaseStudyEvidenceBoost(): RegistryValidation {
  const brands = buildBrandRegistryRecords();
  let boosted = 0;

  for (const brand of brands) {
    const caseStudies = getCaseStudyProfilesByBrandId(brand.brandId);
    const evidence = getEvidenceLinksByBrandId(brand.brandId);
    if (caseStudies.length > 0 && evidence.some((e) => e.evidenceKind === "case-study")) {
      boosted += 1;
    }
  }

  const valid = boosted >= 3;

  return {
    valid,
    count: boosted,
    summary: `case-study-evidence-boost count=${boosted} valid=${valid}`,
  };
}

export type { BrandEvidenceKind };
