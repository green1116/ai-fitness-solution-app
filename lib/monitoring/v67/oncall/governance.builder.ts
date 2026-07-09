/**
 * V67 P5 — On-call governance report builder (read-only)
 */
import { buildSloGovernanceReport } from "../slo/governance.builder";
import { V67_SLO_GOVERNANCE_VERSION } from "../slo/governance.types";

import { buildEscalationPolicyManifest } from "./escalation.policy.catalog";
import type { OncallGovernanceReport, OncallGovernanceSignals } from "./governance.types";
import { V67_ONCALL_GOVERNANCE_VERSION } from "./governance.types";
import { buildHandoffContractManifest } from "./handoff.contract";
import { buildResponseTargetManifest } from "./response.target.catalog";
import { buildOncallRosterManifest, isFoundationOncallAligned } from "./roster.catalog";

const DEFAULT_SIGNALS: OncallGovernanceSignals = {
  sloGovernanceReady: true,
  rosterCatalogComplete: true,
  escalationPolicyComplete: true,
  responseTargetComplete: true,
  handoffContractComplete: true,
  foundationOncallAligned: true,
};

export function buildOncallGovernanceReport(input?: {
  deploymentId?: string;
  signals?: OncallGovernanceSignals;
}): OncallGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v67-oncall-governance-default";

  const sloGovernance = buildSloGovernanceReport({ deploymentId });
  const roster = buildOncallRosterManifest();
  const escalationPolicy = buildEscalationPolicyManifest();
  const responseTargets = buildResponseTargetManifest();
  const handoffContract = buildHandoffContractManifest();
  const foundationAligned = isFoundationOncallAligned();

  const signals: OncallGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    sloGovernanceReady: sloGovernance.governanceReady,
    rosterCatalogComplete: roster.catalogComplete,
    escalationPolicyComplete: escalationPolicy.catalogComplete,
    responseTargetComplete: responseTargets.catalogComplete,
    handoffContractComplete: handoffContract.contractComplete,
    foundationOncallAligned: foundationAligned,
    ...input?.signals,
  };

  const governanceReady =
    sloGovernance.governanceReady &&
    roster.catalogComplete &&
    escalationPolicy.catalogComplete &&
    responseTargets.catalogComplete &&
    handoffContract.contractComplete &&
    foundationAligned &&
    signals.sloGovernanceReady !== false;

  return {
    version: V67_ONCALL_GOVERNANCE_VERSION,
    reportId: `oncall-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    sloGovernanceVersion: V67_SLO_GOVERNANCE_VERSION,
    sloGovernanceReady: sloGovernance.governanceReady,
    roster,
    escalationPolicy,
    responseTargets,
    handoffContract,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `oncall-governance ready=${governanceReady}`,
      `roster=${roster.entryCount}`,
      `policies=${escalationPolicy.policyCount}`,
      `targets=${responseTargets.targetCount}`,
      `handoffs=${handoffContract.ruleCount}`,
      `foundationAligned=${foundationAligned}`,
    ].join(" "),
  };
}

export function assertOncallGovernancePass(
  report: OncallGovernanceReport,
): asserts report is OncallGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V67 on-call governance not ready: ${report.summary}`);
  }
}
