/**
 * V69 P5 — Security governance report builder (read-only)
 */
import { buildTechnicalStandardsReport } from "../technical-standards/standards.builder";
import { V69_TECHNICAL_STANDARDS_VERSION } from "../technical-standards/standards.types";

import { isSecurityGovernanceRefsAligned } from "./alignment.catalog";
import { buildAccessStandardManifest } from "./access.standard.catalog";
import { buildAuditStandardManifest } from "./audit.standard.catalog";
import {
  isSecurityGovernanceFreezeLockIntact,
  securityGovernanceFreezeLockMatchesExpected,
} from "./freeze.lock";
import { buildSecurityGovernanceRegistry } from "./governance.registry";
import type { SecurityGovernanceReport, SecurityGovernanceSignals } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";
import { buildPermissionStandardManifest } from "./permission.standard.catalog";
import { buildRiskControlManifest } from "./risk.standard.catalog";
import { buildSecurityBoundaryManifest } from "./security.boundary.catalog";
import { buildSecurityGovernanceObjectManifest } from "./security.object.catalog";
import { buildSecurityPolicyManifest } from "./security.policy.catalog";
import { buildSensitiveSurfaceManifest } from "./sensitive.surface.catalog";

const DEFAULT_SIGNALS: SecurityGovernanceSignals = {
  technicalStandardsReady: true,
  objectCatalogComplete: true,
  policyCatalogComplete: true,
  boundaryCatalogComplete: true,
  sensitiveSurfaceComplete: true,
  accessStandardsComplete: true,
  permissionStandardsComplete: true,
  auditStandardsComplete: true,
  riskStandardsComplete: true,
  refsAligned: true,
  freezeLockIntact: true,
};

export function buildSecurityGovernanceReport(input?: {
  deploymentId?: string;
  signals?: SecurityGovernanceSignals;
}): SecurityGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v69-security-governance-default";

  const technicalStandards = buildTechnicalStandardsReport({ deploymentId });
  const objects = buildSecurityGovernanceObjectManifest();
  const policies = buildSecurityPolicyManifest();
  const boundaries = buildSecurityBoundaryManifest();
  const sensitiveSurfaces = buildSensitiveSurfaceManifest();
  const accessStandards = buildAccessStandardManifest();
  const permissionStandards = buildPermissionStandardManifest();
  const auditStandards = buildAuditStandardManifest();
  const riskControls = buildRiskControlManifest();
  const registry = buildSecurityGovernanceRegistry();
  const refsAligned = isSecurityGovernanceRefsAligned();
  const freezeLockIntact =
    isSecurityGovernanceFreezeLockIntact() && securityGovernanceFreezeLockMatchesExpected();

  const signals: SecurityGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    technicalStandardsReady: technicalStandards.standardsReady,
    objectCatalogComplete: objects.catalogComplete,
    policyCatalogComplete: policies.catalogComplete,
    boundaryCatalogComplete: boundaries.catalogComplete,
    sensitiveSurfaceComplete: sensitiveSurfaces.catalogComplete,
    accessStandardsComplete: accessStandards.catalogComplete,
    permissionStandardsComplete: permissionStandards.catalogComplete,
    auditStandardsComplete: auditStandards.catalogComplete,
    riskStandardsComplete: riskControls.catalogComplete,
    refsAligned,
    freezeLockIntact,
    ...input?.signals,
  };

  const governanceReady =
    technicalStandards.standardsReady &&
    objects.catalogComplete &&
    policies.catalogComplete &&
    boundaries.catalogComplete &&
    sensitiveSurfaces.catalogComplete &&
    accessStandards.catalogComplete &&
    permissionStandards.catalogComplete &&
    auditStandards.catalogComplete &&
    riskControls.catalogComplete &&
    registry.registryComplete &&
    refsAligned &&
    freezeLockIntact &&
    signals.technicalStandardsReady !== false;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    reportId: `security-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    technicalStandardsVersion: V69_TECHNICAL_STANDARDS_VERSION,
    technicalStandardsReady: technicalStandards.standardsReady,
    objects,
    policies,
    boundaries,
    sensitiveSurfaces,
    accessStandards,
    permissionStandards,
    auditStandards,
    riskControls,
    registry,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `security-governance ready=${governanceReady}`,
      `objects=${objects.entryCount}`,
      `policies=${policies.policyCount}`,
      `boundaries=${boundaries.boundaryCount}`,
      `surfaces=${sensitiveSurfaces.surfaceCount}`,
      `access=${accessStandards.entryCount}`,
      `permissions=${permissionStandards.entryCount}`,
      `audit=${auditStandards.entryCount}`,
      `risk=${riskControls.entryCount}`,
      `registry=${registry.totalEntries}`,
      `refsAligned=${refsAligned}`,
      `standards=${technicalStandards.standardsReady}`,
    ].join(" "),
  };
}

export function assertSecurityGovernancePass(
  report: SecurityGovernanceReport,
): asserts report is SecurityGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V69 security governance not ready: ${report.summary}`);
  }
}
