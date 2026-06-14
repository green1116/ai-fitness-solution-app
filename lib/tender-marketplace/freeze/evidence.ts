import type { TenderMarketplaceFreezeEvidence } from "../shared/types";
import {
  CANONICAL_TENDER_PUBLISHING_QUERY,
  TENDER_MARKETPLACE_TAG,
  TENDER_MARKETPLACE_VERSION,
} from "../shared/types";
import { buildTenderMarketplaceCoverageStats } from "./coverage";
import { TENDER_MARKETPLACE_FROZEN_DOMAINS } from "./constants";
import { buildTenderMarketplaceFreezeReport } from "./report/builders";
import { validateTenderMarketplaceFreeze } from "./validators";

export function buildTenderMarketplaceFreezeEvidence(): TenderMarketplaceFreezeEvidence {
  const validation = validateTenderMarketplaceFreeze();
  const coverage = buildTenderMarketplaceCoverageStats();
  const report = buildTenderMarketplaceFreezeReport();

  if (!validation.valid) {
    throw new Error("Tender marketplace freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-tender-marketplace-freeze-${Date.now()}`,
    version: TENDER_MARKETPLACE_VERSION,
    tag: TENDER_MARKETPLACE_TAG,
    freezeManifest: {
      frozenDomains: [...TENDER_MARKETPLACE_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_TENDER_PUBLISHING_QUERY,
      tenderCount: report.readiness.tenderCount,
      requirementCount: report.readiness.requirementCount,
      publishedCount: report.readiness.publishedCount,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `tender-marketplace-freeze-evidence tag=${TENDER_MARKETPLACE_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}%`,
  };
}
