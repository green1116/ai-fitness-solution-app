import type { SupplierPortalFreezeEvidence } from "../shared/types";
import {
  CANONICAL_SUPPLIER_ONBOARDING_QUERY,
  SUPPLIER_PORTAL_TAG,
  SUPPLIER_PORTAL_VERSION,
} from "../shared/types";
import { buildSupplierPortalCoverageStats } from "./coverage";
import { SUPPLIER_PORTAL_FROZEN_DOMAINS } from "./constants";
import { buildSupplierPortalFreezeReport } from "./report/builders";
import { validateSupplierPortalFreeze } from "./validators";

export function buildSupplierPortalFreezeEvidence(): SupplierPortalFreezeEvidence {
  const validation = validateSupplierPortalFreeze();
  const coverage = buildSupplierPortalCoverageStats();
  const report = buildSupplierPortalFreezeReport();

  if (!validation.valid) {
    throw new Error("Supplier portal freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-supplier-portal-freeze-${Date.now()}`,
    version: SUPPLIER_PORTAL_VERSION,
    tag: SUPPLIER_PORTAL_TAG,
    freezeManifest: {
      frozenDomains: [...SUPPLIER_PORTAL_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_SUPPLIER_ONBOARDING_QUERY,
      supplierCount: report.readiness.supplierCount,
      inventoryCount: report.readiness.inventoryCount,
      publishedCount: report.readiness.publishedCount,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `supplier-portal-freeze-evidence tag=${SUPPLIER_PORTAL_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}%`,
  };
}
