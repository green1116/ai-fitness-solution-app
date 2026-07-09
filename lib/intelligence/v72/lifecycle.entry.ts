/**
 * V72 P6 — Intelligence lifecycle entry (read-only)
 */
export {
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  SUPPORT_POLICY_CATALOG,
  buildLifecycleStateManifest,
  buildTransitionManifest,
  buildSupportPolicyManifest,
  computeDeclarativeLifecycleTerminal,
  getLifecycleStateById,
  getLifecycleStateByIntelligenceRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByIntelligenceRef,
  isIntelligenceLifecycleRefsAligned,
} from "./lifecycle.states";
export {
  assertIntelligenceLifecyclePass,
  buildIntelligenceLifecycle,
} from "./lifecycle.builder";
export {
  V72_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  V72_INTELLIGENCE_LIFECYCLE_VERSION,
} from "./lifecycle.management";
export type {
  LifecycleState,
  SupportPolicy,
  Transition,
  IntelligenceLifecycleReport,
  IntelligenceLifecycleSignals,
} from "./lifecycle.management";

import { buildIntelligenceLifecycle } from "./lifecycle.builder";
import type {
  IntelligenceLifecycleReport,
  IntelligenceLifecycleSignals,
} from "./lifecycle.management";

export function runIntelligenceLifecycle(input?: {
  deploymentId?: string;
  signals?: IntelligenceLifecycleSignals;
}): IntelligenceLifecycleReport {
  return buildIntelligenceLifecycle(input);
}

export function formatIntelligenceLifecycleSummary(
  report: IntelligenceLifecycleReport,
): string {
  const lines = [
    "V72 Intelligence Lifecycle",
    `  ready: ${report.lifecycleReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  intelligence-governance: ${report.intelligenceGovernanceVersion} (ready=${report.intelligenceGovernanceReady})`,
    `  states: ${report.states.stateCount}`,
    `  transitions: ${report.transitions.entryCount}`,
    `  support policies: ${report.supportPolicies.entryCount}`,
  ];
  return lines.join("\n");
}
