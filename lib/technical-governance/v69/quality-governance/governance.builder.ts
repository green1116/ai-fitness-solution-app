/**
 * V69 P6 — Quality governance report builder (read-only)
 */
import { buildSecurityGovernanceReport } from "../security-governance/governance.builder";
import { V69_SECURITY_GOVERNANCE_VERSION } from "../security-governance/governance.types";

import { isQualityGovernanceRefsAligned } from "./alignment.catalog";
import { buildAcceptanceRuleManifest } from "./acceptance.rule.catalog";
import { buildDefectControlManifest } from "./defect.control.catalog";
import {
  isQualityGovernanceFreezeLockIntact,
  qualityGovernanceFreezeLockMatchesExpected,
} from "./freeze.lock";
import { buildQualityGovernanceRegistry } from "./governance.registry";
import type { QualityGovernanceReport, QualityGovernanceSignals } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";
import { buildQualityGateManifest } from "./quality.gate.catalog";
import { buildQualityGovernanceObjectManifest } from "./quality.object.catalog";
import { buildQualityStandardManifest } from "./quality.standard.catalog";
import { buildReleaseQualityManifest } from "./release.quality.catalog";
import { buildTestStandardManifest } from "./test.standard.catalog";

const DEFAULT_SIGNALS: QualityGovernanceSignals = {
  securityGovernanceReady: true,
  objectCatalogComplete: true,
  standardCatalogComplete: true,
  gateCatalogComplete: true,
  testStandardsComplete: true,
  acceptanceRulesComplete: true,
  defectControlsComplete: true,
  releaseQualityComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildQualityGovernanceReport(input?: {
  deploymentId?: string;
  signals?: QualityGovernanceSignals;
}): QualityGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v69-quality-governance-default";

  const securityGovernance = buildSecurityGovernanceReport({ deploymentId });
  const objects = buildQualityGovernanceObjectManifest();
  const standards = buildQualityStandardManifest();
  const gates = buildQualityGateManifest();
  const testStandards = buildTestStandardManifest();
  const acceptanceRules = buildAcceptanceRuleManifest();
  const defectControls = buildDefectControlManifest();
  const releaseQuality = buildReleaseQualityManifest();
  const registry = buildQualityGovernanceRegistry();
  const refsAligned = isQualityGovernanceRefsAligned();
  const freezeLockIntact =
    isQualityGovernanceFreezeLockIntact() && qualityGovernanceFreezeLockMatchesExpected();

  const signals: QualityGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    securityGovernanceReady: securityGovernance.governanceReady,
    objectCatalogComplete: objects.catalogComplete,
    standardCatalogComplete: standards.catalogComplete,
    gateCatalogComplete: gates.catalogComplete,
    testStandardsComplete: testStandards.catalogComplete,
    acceptanceRulesComplete: acceptanceRules.catalogComplete,
    defectControlsComplete: defectControls.catalogComplete,
    releaseQualityComplete: releaseQuality.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const governanceReady =
    securityGovernance.governanceReady &&
    objects.catalogComplete &&
    standards.catalogComplete &&
    gates.catalogComplete &&
    testStandards.catalogComplete &&
    acceptanceRules.catalogComplete &&
    defectControls.catalogComplete &&
    releaseQuality.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.securityGovernanceReady !== false;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    reportId: `quality-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    securityGovernanceVersion: V69_SECURITY_GOVERNANCE_VERSION,
    securityGovernanceReady: securityGovernance.governanceReady,
    objects,
    standards,
    gates,
    testStandards,
    acceptanceRules,
    defectControls,
    releaseQuality,
    registry,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `quality-governance ready=${governanceReady}`,
      `objects=${objects.entryCount}`,
      `standards=${standards.entryCount}`,
      `gates=${gates.gateCount}`,
      `tests=${testStandards.entryCount}`,
      `acceptance=${acceptanceRules.entryCount}`,
      `defects=${defectControls.entryCount}`,
      `release=${releaseQuality.entryCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `security=${securityGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertQualityGovernancePass(
  report: QualityGovernanceReport,
): asserts report is QualityGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V69 quality governance not ready: ${report.summary}`);
  }
}
