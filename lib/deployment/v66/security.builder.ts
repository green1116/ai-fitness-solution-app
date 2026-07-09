/**
 * V66 P5 — Deployment security report builder (read-only)
 */
import { buildArtifactIntegrityManifest } from "./artifact.integrity.inventory";
import { buildComplianceChecklistManifest } from "./compliance.checklist";
import { buildReleaseOrchestrationReport } from "./release.builder";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";
import { buildSecurityPolicyManifest } from "./security.policy.catalog";
import { buildSecurityGateManifest } from "./security.gates";
import type { DeploymentSecurityReport, DeploymentSecuritySignals } from "./security.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";

const DEFAULT_SIGNALS: DeploymentSecuritySignals = {
  orchestrationReady: true,
  policyCatalogComplete: true,
  complianceChecklistPass: true,
  securityGatesPass: true,
  artifactIntegrityComplete: true,
};

export function buildDeploymentSecurityReport(input?: {
  deploymentId?: string;
  signals?: DeploymentSecuritySignals;
}): DeploymentSecurityReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-security-default";

  const orchestration = buildReleaseOrchestrationReport({ deploymentId });
  const securityPolicies = buildSecurityPolicyManifest();
  const artifactIntegrity = buildArtifactIntegrityManifest();

  const signals: DeploymentSecuritySignals = {
    ...DEFAULT_SIGNALS,
    orchestrationReady: orchestration.orchestrationReady,
    policyCatalogComplete: securityPolicies.catalogComplete,
    artifactIntegrityComplete: artifactIntegrity.integrityComplete,
    ...input?.signals,
  };

  const complianceChecklist = buildComplianceChecklistManifest(signals);
  const securityGates = buildSecurityGateManifest({
    ...signals,
    complianceChecklistPass: complianceChecklist.checklistPass,
    securityGatesPass:
      signals.securityGatesPass !== false && complianceChecklist.checklistPass,
  });

  const securityReady =
    orchestration.orchestrationReady &&
    securityPolicies.catalogComplete &&
    complianceChecklist.checklistPass &&
    securityGates.gatesPass &&
    artifactIntegrity.integrityComplete;

  return {
    version: V66_DEPLOYMENT_SECURITY_VERSION,
    reportId: `deployment-security-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    orchestrationVersion: V66_RELEASE_ORCHESTRATION_VERSION,
    orchestrationReady: orchestration.orchestrationReady,
    securityPolicies,
    complianceChecklist,
    securityGates,
    artifactIntegrity,
    securityReady,
    readinessScore: securityReady ? 100 : 0,
    summary: [
      `deployment-security ready=${securityReady}`,
      `policies=${securityPolicies.policyCount}`,
      `compliance=${complianceChecklist.passCount}/${complianceChecklist.itemCount}`,
      `gates=${securityGates.closedCount}/${securityGates.gateCount}`,
      `artifacts=${artifactIntegrity.entryCount}`,
    ].join(" "),
  };
}

export function assertDeploymentSecurityPass(
  report: DeploymentSecurityReport,
): asserts report is DeploymentSecurityReport & { securityReady: true } {
  if (!report.securityReady) {
    throw new Error(`V66 deployment security not ready: ${report.summary}`);
  }
}
