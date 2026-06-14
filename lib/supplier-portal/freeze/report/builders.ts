import { getAllCoverageProfiles } from "../../coverage-profile";
import { getAllInventoryProfiles } from "../../inventory-profile";
import { buildSupplierOnboardingReport } from "../../onboarding/report/builders";
import { getAllPricingProfiles } from "../../pricing-profile";
import { getAllServiceProfiles } from "../../service-profile";
import { getAllSupplierProfiles } from "../../supplier-profile";
import type { SupplierPortalFreezeReport } from "../../shared/types";
import {
  CANONICAL_SUPPLIER_ONBOARDING_QUERY,
  SUPPLIER_ONBOARDING_WORKFLOW_STATES,
  SUPPLIER_PORTAL_TAG,
  SUPPLIER_PORTAL_VERSION,
} from "../../shared/types";
import { buildSupplierPortalCoverageStats } from "../coverage";
import {
  SUPPLIER_PORTAL_FROZEN_DOMAINS,
  SUPPLIER_PORTAL_VALIDATION_GATES,
  SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS,
} from "../constants";
import {
  validateSupplierOnboardingWorkflowPath,
  validateSupplierPortalFreeze,
} from "../validators";

export function buildSupplierPortalFreezeReport(): SupplierPortalFreezeReport {
  const coverage = buildSupplierPortalCoverageStats();
  const validation = validateSupplierPortalFreeze();
  const onboardingReport = validation.valid ? buildSupplierOnboardingReport() : null;
  const workflowPaths = SUPPLIER_PORTAL_WORKFLOW_SUPPLIERS.map(
    validateSupplierOnboardingWorkflowPath,
  );

  const readinessScore = Math.round((coverage.coverageScore + validation.validationScore) / 2);

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    supplierCount: getAllSupplierProfiles().length,
    inventoryCount: getAllInventoryProfiles().length,
    pricingCount: getAllPricingProfiles().length,
    serviceCount: getAllServiceProfiles().length,
    coverageCount: getAllCoverageProfiles().length,
    submissionCount: onboardingReport?.submissionCount ?? 0,
    approvalCount: onboardingReport?.approvedCount ?? 0,
    publishedCount: onboardingReport?.publishedCount ?? 0,
  };

  return {
    version: SUPPLIER_PORTAL_VERSION,
    tag: SUPPLIER_PORTAL_TAG,
    reportId: `supplier-portal-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    workflowPaths,
    exampleOnboardingReport: onboardingReport,
    moduleStatistics: {
      frozenDomains: SUPPLIER_PORTAL_FROZEN_DOMAINS.length,
      profileCatalogs: 5,
      workflowStates: SUPPLIER_ONBOARDING_WORKFLOW_STATES.length,
      validationGates: SUPPLIER_PORTAL_VALIDATION_GATES,
      reportBuilders: 3,
    },
    canonicalQuery: CANONICAL_SUPPLIER_ONBOARDING_QUERY,
    summary: [
      "supplier-portal-freeze-report",
      `tag=${SUPPLIER_PORTAL_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      `suppliers=${readiness.supplierCount}`,
      `inventory=${readiness.inventoryCount}`,
      `published=${readiness.publishedCount}`,
      `workflowPaths=${workflowPaths.filter((p) => p.pathValid).length}/${workflowPaths.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
