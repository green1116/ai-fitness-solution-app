/**
 * V69 P7 — Architecture compliance report builder (read-only)
 */
import { buildQualityGovernanceReport } from "../quality-governance/governance.builder";
import { V69_QUALITY_GOVERNANCE_VERSION } from "../quality-governance/governance.types";

import { isArchitectureComplianceRefsAligned } from "./alignment.catalog";
import { buildAlignmentCheckManifest } from "./alignment.check.catalog";
import { buildComplianceCheckManifest } from "./compliance.check.catalog";
import { buildComplianceGateManifest } from "./compliance.gate.catalog";
import { buildComplianceObjectManifest } from "./compliance.object.catalog";
import { buildComplianceRuleManifest } from "./compliance.rule.catalog";
import type {
  ArchitectureComplianceReport,
  ArchitectureComplianceSignals,
} from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";
import { buildArchitectureComplianceRegistry } from "./compliance.registry";
import { buildDeviationManifest } from "./deviation.catalog";
import { buildExceptionManifest } from "./exception.catalog";
import {
  architectureComplianceFreezeLockMatchesExpected,
  isArchitectureComplianceFreezeLockIntact,
} from "./freeze.lock";

const DEFAULT_SIGNALS: ArchitectureComplianceSignals = {
  qualityGovernanceReady: true,
  objectCatalogComplete: true,
  ruleCatalogComplete: true,
  checkCatalogComplete: true,
  gateCatalogComplete: true,
  alignmentChecksComplete: true,
  deviationCatalogComplete: true,
  exceptionCatalogComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildArchitectureComplianceReport(input?: {
  deploymentId?: string;
  signals?: ArchitectureComplianceSignals;
}): ArchitectureComplianceReport {
  const deploymentId = input?.deploymentId ?? "v69-architecture-compliance-default";

  const qualityGovernance = buildQualityGovernanceReport({ deploymentId });
  const objects = buildComplianceObjectManifest();
  const rules = buildComplianceRuleManifest();
  const checks = buildComplianceCheckManifest();
  const gates = buildComplianceGateManifest();
  const alignmentChecks = buildAlignmentCheckManifest();
  const deviations = buildDeviationManifest();
  const exceptions = buildExceptionManifest();
  const registry = buildArchitectureComplianceRegistry();
  const refsAligned = isArchitectureComplianceRefsAligned();
  const freezeLockIntact =
    isArchitectureComplianceFreezeLockIntact() &&
    architectureComplianceFreezeLockMatchesExpected();

  const signals: ArchitectureComplianceSignals = {
    ...DEFAULT_SIGNALS,
    qualityGovernanceReady: qualityGovernance.governanceReady,
    objectCatalogComplete: objects.catalogComplete,
    ruleCatalogComplete: rules.catalogComplete,
    checkCatalogComplete: checks.catalogComplete,
    gateCatalogComplete: gates.catalogComplete,
    alignmentChecksComplete: alignmentChecks.catalogComplete,
    deviationCatalogComplete: deviations.catalogComplete,
    exceptionCatalogComplete: exceptions.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const complianceReady =
    qualityGovernance.governanceReady &&
    objects.catalogComplete &&
    rules.catalogComplete &&
    checks.catalogComplete &&
    gates.catalogComplete &&
    alignmentChecks.catalogComplete &&
    deviations.catalogComplete &&
    exceptions.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.qualityGovernanceReady !== false;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    reportId: `architecture-compliance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    qualityGovernanceVersion: V69_QUALITY_GOVERNANCE_VERSION,
    qualityGovernanceReady: qualityGovernance.governanceReady,
    objects,
    rules,
    checks,
    gates,
    alignmentChecks,
    deviations,
    exceptions,
    registry,
    complianceReady,
    readinessScore: complianceReady ? 100 : 0,
    summary: [
      `architecture-compliance ready=${complianceReady}`,
      `objects=${objects.entryCount}`,
      `rules=${rules.entryCount}`,
      `checks=${checks.entryCount}`,
      `gates=${gates.gateCount}`,
      `alignment=${alignmentChecks.entryCount}`,
      `deviations=${deviations.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `quality=${qualityGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertArchitectureCompliancePass(
  report: ArchitectureComplianceReport,
): asserts report is ArchitectureComplianceReport & { complianceReady: true } {
  if (!report.complianceReady) {
    throw new Error(`V69 architecture compliance not ready: ${report.summary}`);
  }
}
