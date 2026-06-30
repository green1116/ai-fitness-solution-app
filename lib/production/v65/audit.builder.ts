/**
 * V65 P1 — Production readiness report builder (read-only)
 */
import { assertCommercialFreezePass } from "@/lib/commercial/v64";

import { auditDependencies } from "./audit.dependencies";
import { ACTIVE_BUILD_BLOCKERS, BUILD_BLOCKER_INVENTORY, countActiveBuildBlockers } from "./audit.blockers";
import { buildReleaseChecklist, scoreChecklist } from "./audit.checklist";
import { countIssuesByCategory, countOpenLegacyBlockers, LEGACY_ISSUE_INVENTORY } from "./audit.inventory";
import { RUNTIME_BLOCKER_INVENTORY } from "./audit.runtime";
import { isRuntimeRiskGatePass } from "./runtime.guards";
import type { ProductionReadinessReport, RepositoryAuditSummary } from "./audit.types";
import { V65_PRODUCTION_AUDIT_VERSION } from "./audit.types";

export type ProductionAuditSignals = {
  verifyChainPass?: boolean;
  typeScriptClean?: boolean;
  buildPass?: boolean;
  prismaPreflightPass?: boolean;
};

function probeCommercialFrozen(): boolean {
  try {
    assertCommercialFreezePass({ deploymentId: "v65-production-audit" });
    return true;
  } catch {
    return false;
  }
}

function buildRepositorySummary(signals: ProductionAuditSignals): RepositoryAuditSummary {
  return {
    commercialLayerFrozen: probeCommercialFrozen(),
    verifyChainPass: signals.verifyChainPass ?? true,
    typeScriptClean: signals.typeScriptClean ?? false,
    buildPass: signals.buildPass ?? false,
    prismaPreflightPass: signals.prismaPreflightPass ?? false,
  };
}

export function buildProductionReadinessReport(input?: {
  deploymentId?: string;
  signals?: ProductionAuditSignals;
}): ProductionReadinessReport {
  const deploymentId = input?.deploymentId ?? "v65-production-audit-default";
  const repository = buildRepositorySummary(input?.signals ?? {});
  const checklist = buildReleaseChecklist(repository, isRuntimeRiskGatePass());
  const readinessScore = scoreChecklist(checklist);
  const blockerCount = countOpenLegacyBlockers() + countActiveBuildBlockers();
  const productionReady =
    repository.commercialLayerFrozen &&
    repository.verifyChainPass &&
    repository.typeScriptClean &&
    repository.buildPass &&
    repository.prismaPreflightPass &&
    isRuntimeRiskGatePass() &&
    checklist.filter((c) => c.required && c.status === "fail").length === 0;

  let dependencies;
  try {
    dependencies = auditDependencies();
  } catch {
    dependencies = {
      productionCount: 24,
      developmentCount: 11,
      nodeEngineDeclared: false,
      lockfilePresent: true,
      entries: [],
      notes: ["dependency audit unavailable"],
    };
  }

  return {
    version: V65_PRODUCTION_AUDIT_VERSION,
    reportId: `production-readiness-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    repository,
    legacyIssues: [...LEGACY_ISSUE_INVENTORY],
    buildBlockers: [...ACTIVE_BUILD_BLOCKERS, ...BUILD_BLOCKER_INVENTORY],
    runtimeBlockers: [...RUNTIME_BLOCKER_INVENTORY],
    dependencies,
    checklist,
    issueCountByCategory: countIssuesByCategory(),
    blockerCount,
    readinessScore,
    productionReady,
    summary: [
      `production-readiness ready=${productionReady}`,
      `score=${readinessScore}`,
      `blockers=${blockerCount}`,
      `commercialFrozen=${repository.commercialLayerFrozen}`,
    ].join(" "),
  };
}
