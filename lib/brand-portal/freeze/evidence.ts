import type { BrandPortalFreezeEvidence } from "../shared/types";
import {
  BRAND_PORTAL_TAG,
  BRAND_PORTAL_VERSION,
  CANONICAL_BRAND_ONBOARDING_QUERY,
} from "../shared/types";
import { buildBrandPortalCoverageStats } from "./coverage";
import { BRAND_PORTAL_FROZEN_DOMAINS } from "./constants";
import { buildBrandPortalFreezeReport } from "./report/builders";
import { validateBrandPortalFreeze } from "./validators";

export function buildBrandPortalFreezeEvidence(): BrandPortalFreezeEvidence {
  const validation = validateBrandPortalFreeze();
  const coverage = buildBrandPortalCoverageStats();
  const report = buildBrandPortalFreezeReport();

  if (!validation.valid) {
    throw new Error("Brand portal freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-brand-portal-freeze-${Date.now()}`,
    version: BRAND_PORTAL_VERSION,
    tag: BRAND_PORTAL_TAG,
    freezeManifest: {
      frozenDomains: [...BRAND_PORTAL_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_BRAND_ONBOARDING_QUERY,
      brandCount: report.readiness.brandCount,
      productCount: report.readiness.productCount,
      publishedCount: report.readiness.publishedCount,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `brand-portal-freeze-evidence tag=${BRAND_PORTAL_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}%`,
  };
}
