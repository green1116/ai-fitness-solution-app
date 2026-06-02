/**
 * V3.7-H18 Enterprise Rollout — static deployment readiness config (no runtime)
 */

import { buildEnterpriseLandingFoundation } from "../landing/index";
import { buildProductionCommandCenterFoundation } from "../command-center/index";
import { buildProductionHardeningFoundation } from "../hardening/index";
import { buildProductionObservabilityFoundation } from "../observability/index";

export const DEPLOYMENT_READINESS_VERSION = "3.7-h18-readiness-config-1" as const;

export type DeploymentReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  category: string;
  surface: string;
  href?: string;
};

export type DeploymentReadinessConfig = {
  version: typeof DEPLOYMENT_READINESS_VERSION;
  configId: string;
  deploymentChecks: DeploymentReadinessCheck[];
  rolloutChecks: DeploymentReadinessCheck[];
  onboardingChecks: DeploymentReadinessCheck[];
  governanceChecks: DeploymentReadinessCheck[];
  operationalChecks: DeploymentReadinessCheck[];
  releaseChecks: DeploymentReadinessCheck[];
  summary: string;
};

function check(
  id: string,
  label: string,
  passed: boolean,
  category: string,
  surface: string,
  href?: string,
): DeploymentReadinessCheck {
  return { id, label, passed, category, surface, href };
}

export function buildDeploymentReadinessConfig(input?: {
  deploymentId?: string;
}): DeploymentReadinessConfig {
  const deploymentId = input?.deploymentId ?? "deployment-readiness";
  const configId = `DRC-V37H18-${deploymentId.slice(0, 8)}`;

  const landing = buildEnterpriseLandingFoundation({ deploymentId });
  const center = buildProductionCommandCenterFoundation({ deploymentId });
  const hardening = buildProductionHardeningFoundation({ deploymentId });
  const observability = buildProductionObservabilityFoundation({ deploymentId });

  const r = landing.readiness;
  const cr = center.summary.readinessSummary;

  const deploymentChecks: DeploymentReadinessCheck[] = [
    check("dep-build-stable", "Build stable", hardening.health.buildStatus === "healthy", "deployment", "hardening"),
    check("dep-tsc-stable", "Type stable", observability.status.tscPassed, "deployment", "hardening"),
    check("dep-verify-stable", "Verification stable", hardening.health.verificationStatus === "verified", "deployment", "hardening"),
    check("dep-freeze-intact", "Freeze intact", hardening.health.freezeIntegrity === "intact", "deployment", "hardening"),
    check("dep-landing-ready", "Enterprise landing ready", landing.manifest.readyForDeployment, "deployment", "landing", "/dashboard/enterprise-landing"),
    check("dep-command-center", "Command center ready", center.manifest.readyForCommandCenter, "deployment", "command-center", "/dashboard/command-center"),
  ];

  const rolloutChecks: DeploymentReadinessCheck[] = [
    check("roll-ops-portal", "Ops portal rollout", cr.readyForOps, "rollout", "ops", "/dashboard/ops"),
    check("roll-dashboard", "Dashboard integration rollout", cr.readyForDashboard, "rollout", "dashboard", "/dashboard/enterprise"),
    check("roll-observability", "Observability rollout", r.observabilityReady, "rollout", "observability", "/commercial/v37/operations"),
    check("roll-access", "Access control rollout", cr.readyForAccess, "rollout", "access", "/dashboard/access-control"),
    check("roll-audit", "Audit review rollout", cr.readyForAudit, "rollout", "audit", "/dashboard/audit-review"),
    check("roll-hardening", "Hardening operational", hardening.operational.opsReady, "rollout", "hardening"),
  ];

  const onboardingChecks: DeploymentReadinessCheck[] = [
    check("onb-landing", "Enterprise landing onboarding", landing.manifest.readyForLanding, "onboarding", "landing", "/dashboard/enterprise-landing"),
    check("onb-shell", "Dashboard shell entry", landing.cards.cards.some((c) => c.id === "dashboard-shell"), "onboarding", "dashboard-shell", "/dashboard"),
    check("onb-quick-actions", "Quick actions available", landing.cards.quickActions.length >= 8, "onboarding", "landing"),
    check("onb-command-center", "Command center onboarding", center.manifest.readyForCommandCenter, "onboarding", "command-center", "/dashboard/command-center"),
    check("onb-readiness-cards", "Readiness cards configured", landing.cards.readinessCards.length >= 6, "onboarding", "landing"),
  ];

  const governanceChecks: DeploymentReadinessCheck[] = [
    check("gov-review", "Governance review ready", cr.readyForGovernance, "governance", "governance", "/dashboard/governance-review"),
    check("gov-access", "Access governance ready", cr.readyForAccess, "governance", "access", "/dashboard/access-control"),
    check("gov-lineage", "Permission lineage surface", landing.cards.governanceCards.some((c) => c.id === "permission-lineage"), "governance", "governance", "/dashboard/permission-lineage"),
    check("gov-policy", "Policy review surface", landing.cards.cards.some((c) => c.id === "policy-review"), "governance", "access", "/dashboard/policy-review"),
  ];

  const operationalChecks: DeploymentReadinessCheck[] = [
    check("ops-portal", "Ops portal ready", cr.readyForOps, "operational", "ops", "/dashboard/ops"),
    check("ops-observability", "Observability ops ready", observability.status.hardeningPassed, "operational", "observability"),
    check("ops-health", "Runtime health nominal", hardening.health.buildStatus === "healthy" && hardening.health.freezeIntegrity === "intact", "operational", "hardening"),
    check("ops-continuity", "Operational continuity", hardening.operational.commercialReady, "operational", "hardening"),
  ];

  const releaseChecks: DeploymentReadinessCheck[] = [
    check("rel-ledger", "Release ledger ready", cr.readyForRelease, "release", "release-ledger", "/dashboard/release-ledger"),
    check("rel-evidence", "Evidence export ready", landing.cards.releaseCards.some((c) => c.id === "evidence-export"), "release", "release", "/dashboard/evidence-export"),
    check("rel-gate", "Release gate view", observability.releaseGate.releasable, "release", "observability"),
    check("rel-confidence", "Deployment confidence", hardening.deployment.confidenceScore >= 80, "release", "hardening"),
  ];

  const allChecks = [
    ...deploymentChecks,
    ...rolloutChecks,
    ...onboardingChecks,
    ...governanceChecks,
    ...operationalChecks,
    ...releaseChecks,
  ];
  const passed = allChecks.filter((c) => c.passed).length;

  return {
    version: DEPLOYMENT_READINESS_VERSION,
    configId,
    deploymentChecks,
    rolloutChecks,
    onboardingChecks,
    governanceChecks,
    operationalChecks,
    releaseChecks,
    summary: `deployment-readiness id=${configId} checks=${allChecks.length} passed=${passed} deployment=${deploymentChecks.every((c) => c.passed)} rollout=${rolloutChecks.every((c) => c.passed)}`,
  };
}
