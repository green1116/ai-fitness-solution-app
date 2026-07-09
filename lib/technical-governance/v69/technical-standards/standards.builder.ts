/**
 * V69 P4 — Technical standards report builder (read-only)
 */
import { buildCodeGovernanceReport } from "../code-governance/governance.builder";
import { V69_CODE_GOVERNANCE_VERSION } from "../code-governance/governance.types";

import { isTechnicalStandardsRefsAligned } from "./alignment.catalog";
import { buildChangeStandardManifest } from "./change.standard.catalog";
import { buildDirectoryStandardManifest } from "./directory.standard.catalog";
import { buildInterfaceStandardManifest } from "./interface.standard.catalog";
import { buildNamingStandardManifest } from "./naming.standard.catalog";
import { buildStandardPolicySetManifest } from "./policy.set.catalog";
import {
  isTechnicalStandardsFreezeLockIntact,
  technicalStandardsFreezeLockMatchesExpected,
} from "./freeze.lock";
import { buildTechnicalStandardsRegistry } from "./standards.registry";
import type { TechnicalStandardsReport, TechnicalStandardsSignals } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";
import { buildVersionStandardManifest } from "./version.standard.catalog";

const DEFAULT_SIGNALS: TechnicalStandardsSignals = {
  codeGovernanceReady: true,
  policySetComplete: true,
  namingStandardsComplete: true,
  versionStandardsComplete: true,
  interfaceStandardsComplete: true,
  directoryStandardsComplete: true,
  changeStandardsComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildTechnicalStandardsReport(input?: {
  deploymentId?: string;
  signals?: TechnicalStandardsSignals;
}): TechnicalStandardsReport {
  const deploymentId = input?.deploymentId ?? "v69-technical-standards-default";

  const codeGovernance = buildCodeGovernanceReport({ deploymentId });
  const policySet = buildStandardPolicySetManifest();
  const naming = buildNamingStandardManifest();
  const versioning = buildVersionStandardManifest();
  const interfaces = buildInterfaceStandardManifest();
  const directories = buildDirectoryStandardManifest();
  const changes = buildChangeStandardManifest();
  const registry = buildTechnicalStandardsRegistry();
  const refsAligned = isTechnicalStandardsRefsAligned();
  const freezeLockIntact =
    isTechnicalStandardsFreezeLockIntact() && technicalStandardsFreezeLockMatchesExpected();

  const signals: TechnicalStandardsSignals = {
    ...DEFAULT_SIGNALS,
    codeGovernanceReady: codeGovernance.governanceReady,
    policySetComplete: policySet.catalogComplete,
    namingStandardsComplete: naming.catalogComplete,
    versionStandardsComplete: versioning.catalogComplete,
    interfaceStandardsComplete: interfaces.catalogComplete,
    directoryStandardsComplete: directories.catalogComplete,
    changeStandardsComplete: changes.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const standardsReady =
    codeGovernance.governanceReady &&
    policySet.catalogComplete &&
    naming.catalogComplete &&
    versioning.catalogComplete &&
    interfaces.catalogComplete &&
    directories.catalogComplete &&
    changes.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.codeGovernanceReady !== false;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    reportId: `technical-standards-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    codeGovernanceVersion: V69_CODE_GOVERNANCE_VERSION,
    codeGovernanceReady: codeGovernance.governanceReady,
    policySet,
    naming,
    versioning,
    interfaces,
    directories,
    changes,
    registry,
    standardsReady,
    readinessScore: standardsReady ? 100 : 0,
    summary: [
      `technical-standards ready=${standardsReady}`,
      `policySet=${policySet.entryCount}`,
      `naming=${naming.entryCount}`,
      `versioning=${versioning.entryCount}`,
      `interfaces=${interfaces.entryCount}`,
      `directories=${directories.entryCount}`,
      `changes=${changes.entryCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `governance=${codeGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertTechnicalStandardsPass(
  report: TechnicalStandardsReport,
): asserts report is TechnicalStandardsReport & { standardsReady: true } {
  if (!report.standardsReady) {
    throw new Error(`V69 technical standards not ready: ${report.summary}`);
  }
}
