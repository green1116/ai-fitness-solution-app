/**
 * V69 P3 — Code governance report builder (read-only)
 */
import { buildArchitectureDependencyReport } from "../architecture-dependency/dependency.builder";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "../architecture-dependency/dependency.types";

import { isCodeGovernanceRefsAligned } from "./alignment.catalog";
import { buildCodeGovernanceObjectManifest } from "./code.object.catalog";
import { buildCodePolicyManifest } from "./code.policy.catalog";
import { buildDirectoryBoundaryManifest } from "./directory.boundary.catalog";
import { buildFileOwnershipManifest } from "./file.ownership.catalog";
import {
  codeGovernanceFreezeLockMatchesExpected,
  isCodeGovernanceFreezeLockIntact,
} from "./freeze.lock";
import { buildCodeGovernanceRegistry } from "./governance.registry";
import type { CodeGovernanceReport, CodeGovernanceSignals } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";
import { buildImportAllowanceManifest } from "./import.allowance.catalog";

const DEFAULT_SIGNALS: CodeGovernanceSignals = {
  architectureDependencyReady: true,
  objectCatalogComplete: true,
  policyCatalogComplete: true,
  boundaryCatalogComplete: true,
  ownershipCatalogComplete: true,
  importAllowanceComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildCodeGovernanceReport(input?: {
  deploymentId?: string;
  signals?: CodeGovernanceSignals;
}): CodeGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v69-code-governance-default";

  const architectureDependency = buildArchitectureDependencyReport({ deploymentId });
  const objects = buildCodeGovernanceObjectManifest();
  const policies = buildCodePolicyManifest();
  const boundaries = buildDirectoryBoundaryManifest();
  const ownerships = buildFileOwnershipManifest();
  const importAllowances = buildImportAllowanceManifest();
  const registry = buildCodeGovernanceRegistry();
  const refsAligned = isCodeGovernanceRefsAligned();
  const freezeLockIntact =
    isCodeGovernanceFreezeLockIntact() && codeGovernanceFreezeLockMatchesExpected();

  const signals: CodeGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    architectureDependencyReady: architectureDependency.dependencyReady,
    objectCatalogComplete: objects.catalogComplete,
    policyCatalogComplete: policies.catalogComplete,
    boundaryCatalogComplete: boundaries.catalogComplete,
    ownershipCatalogComplete: ownerships.catalogComplete,
    importAllowanceComplete: importAllowances.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const governanceReady =
    architectureDependency.dependencyReady &&
    objects.catalogComplete &&
    policies.catalogComplete &&
    boundaries.catalogComplete &&
    ownerships.catalogComplete &&
    importAllowances.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.architectureDependencyReady !== false;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    reportId: `code-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    architectureDependencyVersion: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    architectureDependencyReady: architectureDependency.dependencyReady,
    objects,
    policies,
    boundaries,
    ownerships,
    importAllowances,
    registry,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `code-governance ready=${governanceReady}`,
      `objects=${objects.entryCount}`,
      `policies=${policies.policyCount}`,
      `boundaries=${boundaries.boundaryCount}`,
      `ownerships=${ownerships.ownershipCount}`,
      `importAllowances=${importAllowances.allowanceCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `dependency=${architectureDependency.dependencyReady}`,
    ].join(" "),
  };
}

export function assertCodeGovernancePass(
  report: CodeGovernanceReport,
): asserts report is CodeGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V69 code governance not ready: ${report.summary}`);
  }
}
