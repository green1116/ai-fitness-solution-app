/**
 * V73 P6 — Knowledge lifecycle entry (read-only)
 */
export {
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  SUPPORT_POLICY_CATALOG,
  buildLifecycleStateManifest,
  buildSupportPolicyManifest,
  buildTransitionManifest,
  computeDeclarativeLifecycleTerminal,
  getLifecycleStateById,
  getLifecycleStateByKnowledgeRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByKnowledgeRef,
  isKnowledgeLifecycleRefsAligned,
} from "./lifecycle.states";
export {
  assertKnowledgeLifecyclePass,
  buildKnowledgeLifecycle,
} from "./lifecycle.builder";
export {
  V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  V73_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle.management";
export type {
  Active,
  Archived,
  Deprecated,
  EndOfLife,
  KnowledgeLifecycleReport,
  KnowledgeLifecycleSignals,
  LifecycleState,
  Maintenance,
  Retention,
  SupportPolicy,
  Transition,
  Trigger,
} from "./lifecycle.management";

import { buildKnowledgeLifecycle } from "./lifecycle.builder";
import type {
  KnowledgeLifecycleReport,
  KnowledgeLifecycleSignals,
} from "./lifecycle.management";

export function runKnowledgeLifecycle(input?: {
  deploymentId?: string;
  signals?: KnowledgeLifecycleSignals;
}): KnowledgeLifecycleReport {
  return buildKnowledgeLifecycle(input);
}

export function formatKnowledgeLifecycleSummary(
  report: KnowledgeLifecycleReport,
): string {
  const lines = [
    "V73 Knowledge Lifecycle",
    `  ready: ${report.lifecycleReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  knowledge-governance: ${report.knowledgeGovernanceVersion} (ready=${report.knowledgeGovernanceReady})`,
    `  states: ${report.states.stateCount}`,
    `  transitions: ${report.transitions.entryCount}`,
    `  support policies: ${report.supportPolicies.entryCount}`,
  ];
  return lines.join("\n");
}
