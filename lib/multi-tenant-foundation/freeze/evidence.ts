import type { MultiTenantFreezeEvidence } from "../shared/types";
import {
  CANONICAL_MULTI_TENANT_QUERY,
  MULTI_TENANT_TAG,
  MULTI_TENANT_VERSION,
} from "../shared/types";
import { buildMultiTenantCoverageStats } from "./coverage";
import { MULTI_TENANT_FROZEN_DOMAINS } from "./constants";
import { buildMultiTenantFreezeReport } from "./report/builders";
import { validateMultiTenantFreeze } from "./validators";

export function buildMultiTenantFreezeEvidence(): MultiTenantFreezeEvidence {
  const validation = validateMultiTenantFreeze();
  const coverage = buildMultiTenantCoverageStats();
  const report = buildMultiTenantFreezeReport();

  if (!validation.valid) {
    throw new Error("Multi tenant freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-multi-tenant-freeze-${Date.now()}`,
    version: MULTI_TENANT_VERSION,
    tag: MULTI_TENANT_TAG,
    freezeManifest: {
      frozenDomains: [...MULTI_TENANT_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_MULTI_TENANT_QUERY,
      organizationCount: report.readiness.organizationCount,
      workspaceCount: report.readiness.workspaceCount,
      membershipCount: report.readiness.membershipCount,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `multi-tenant-freeze-evidence tag=${MULTI_TENANT_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}%`,
  };
}
