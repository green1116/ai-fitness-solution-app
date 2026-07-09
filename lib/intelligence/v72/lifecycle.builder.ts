/**
 * V72 P6 — Intelligence lifecycle builder (read-only)
 */
import {
  buildLifecycleStateManifest,
  buildTransitionManifest,
  buildSupportPolicyManifest,
  isIntelligenceLifecycleRefsAligned,
} from "./lifecycle.states";
import type {
  IntelligenceLifecycleReport,
  IntelligenceLifecycleSignals,
} from "./lifecycle.management";
import {
  V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  V72_INTELLIGENCE_LIFECYCLE_VERSION,
} from "./lifecycle.management";
import { buildIntelligenceGovernance } from "./governance.builder";
import { V72_INTELLIGENCE_GOVERNANCE_VERSION } from "./intelligence.governance";

const DEFAULT_SIGNALS: IntelligenceLifecycleSignals = {
  intelligenceGovernanceReady: true,
  statesComplete: true,
  transitionsComplete: true,
  supportPoliciesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildIntelligenceLifecycle(input?: {
  deploymentId?: string;
  signals?: IntelligenceLifecycleSignals;
}): IntelligenceLifecycleReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-lifecycle-default";

  const intelligenceGovernance = buildIntelligenceGovernance({ deploymentId });
  const states = buildLifecycleStateManifest();
  const transitions = buildTransitionManifest();
  const supportPolicies = buildSupportPolicyManifest();
  const refsAligned = isIntelligenceLifecycleRefsAligned();

  const signals: IntelligenceLifecycleSignals = {
    ...DEFAULT_SIGNALS,
    intelligenceGovernanceReady: intelligenceGovernance.governanceReady,
    statesComplete: states.catalogComplete,
    transitionsComplete: transitions.catalogComplete,
    supportPoliciesComplete: supportPolicies.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const lifecycleReady =
    intelligenceGovernance.governanceReady &&
    states.catalogComplete &&
    transitions.catalogComplete &&
    supportPolicies.catalogComplete &&
    refsAligned &&
    signals.intelligenceGovernanceReady !== false;

  return {
    version: V72_INTELLIGENCE_LIFECYCLE_VERSION,
    freezeVersion: V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
    reportId: `intelligence-lifecycle-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    intelligenceGovernanceVersion: V72_INTELLIGENCE_GOVERNANCE_VERSION,
    intelligenceGovernanceReady: intelligenceGovernance.governanceReady,
    states,
    transitions,
    supportPolicies,
    lifecycleReady,
    readinessScore: lifecycleReady ? 100 : 0,
    summary: [
      `intelligence-lifecycle ready=${lifecycleReady}`,
      `states=${states.stateCount}`,
      `transitions=${transitions.entryCount}`,
      `supportPolicies=${supportPolicies.entryCount}`,
      `refsAligned=${refsAligned}`,
      `governance=${intelligenceGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertIntelligenceLifecyclePass(
  report: IntelligenceLifecycleReport,
): asserts report is IntelligenceLifecycleReport & { lifecycleReady: true } {
  if (!report.lifecycleReady) {
    throw new Error(`V72 intelligence lifecycle not ready: ${report.summary}`);
  }
}
