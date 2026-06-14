import { getAllBrandProfiles } from "../../brand-profile";
import { getAllProductProfiles } from "../../product-profile";
import { buildBrandOnboardingReport } from "../../onboarding/report/builders";
import type { BrandPortalFreezeReport } from "../../shared/types";
import {
  BRAND_ONBOARDING_WORKFLOW_STATES,
  BRAND_PORTAL_TAG,
  BRAND_PORTAL_VERSION,
  CANONICAL_BRAND_ONBOARDING_QUERY,
} from "../../shared/types";
import { buildBrandPortalCoverageStats } from "../coverage";
import {
  BRAND_PORTAL_FROZEN_DOMAINS,
  BRAND_PORTAL_VALIDATION_GATES,
} from "../constants";
import {
  validateBrandOnboardingWorkflowPath,
  validateBrandPortalFreeze,
} from "../validators";
import { BRAND_PORTAL_WORKFLOW_BRANDS } from "../constants";

export function buildBrandPortalFreezeReport(): BrandPortalFreezeReport {
  const coverage = buildBrandPortalCoverageStats();
  const validation = validateBrandPortalFreeze();
  const onboardingReport = validation.valid ? buildBrandOnboardingReport() : null;
  const workflowPaths = BRAND_PORTAL_WORKFLOW_BRANDS.map(validateBrandOnboardingWorkflowPath);

  const readinessScore = Math.round((coverage.coverageScore + validation.validationScore) / 2);

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    brandCount: getAllBrandProfiles().length,
    productCount: getAllProductProfiles().length,
    submissionCount: onboardingReport?.submissionCount ?? 0,
    publishedCount: onboardingReport?.publishedCount ?? 0,
  };

  return {
    version: BRAND_PORTAL_VERSION,
    tag: BRAND_PORTAL_TAG,
    reportId: `brand-portal-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    workflowPaths,
    exampleOnboardingReport: onboardingReport,
    moduleStatistics: {
      frozenDomains: BRAND_PORTAL_FROZEN_DOMAINS.length,
      profileCatalogs: 4,
      workflowStates: BRAND_ONBOARDING_WORKFLOW_STATES.length,
      validationGates: BRAND_PORTAL_VALIDATION_GATES,
      reportBuilders: 3,
    },
    canonicalQuery: CANONICAL_BRAND_ONBOARDING_QUERY,
    summary: [
      "brand-portal-freeze-report",
      `tag=${BRAND_PORTAL_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      `brands=${readiness.brandCount}`,
      `products=${readiness.productCount}`,
      `published=${readiness.publishedCount}`,
      `workflowPaths=${workflowPaths.filter((p) => p.pathValid).length}/${workflowPaths.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
