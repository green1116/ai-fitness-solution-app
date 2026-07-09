/**
 * V73 P6 — Knowledge lifecycle builder (read-only)
 */
import { buildKnowledgeGovernance } from "./governance.builder";
import { V73_KNOWLEDGE_GOVERNANCE_VERSION } from "./knowledge.governance";
import {
  buildLifecycleStateManifest,
  buildSupportPolicyManifest,
  buildTransitionManifest,
  isKnowledgeLifecycleRefsAligned,
} from "./lifecycle.states";
import type {
  KnowledgeLifecycleReport,
  KnowledgeLifecycleSignals,
} from "./lifecycle.management";
import {
  V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  V73_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle.management";

const DEFAULT_SIGNALS: KnowledgeLifecycleSignals = {
  knowledgeGovernanceReady: true,
  statesComplete: true,
  transitionsComplete: true,
  supportPoliciesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeLifecycle(input?: {
  deploymentId?: string;
  signals?: KnowledgeLifecycleSignals;
}): KnowledgeLifecycleReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-lifecycle-default";

  const knowledgeGovernance = buildKnowledgeGovernance({ deploymentId });
  const states = buildLifecycleStateManifest();
  const transitions = buildTransitionManifest();
  const supportPolicies = buildSupportPolicyManifest();
  const refsAligned = isKnowledgeLifecycleRefsAligned();

  const signals: KnowledgeLifecycleSignals = {
    ...DEFAULT_SIGNALS,
    knowledgeGovernanceReady: knowledgeGovernance.governanceReady,
    statesComplete: states.catalogComplete,
    transitionsComplete: transitions.catalogComplete,
    supportPoliciesComplete: supportPolicies.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const lifecycleReady =
    knowledgeGovernance.governanceReady &&
    states.catalogComplete &&
    transitions.catalogComplete &&
    supportPolicies.catalogComplete &&
    refsAligned &&
    signals.knowledgeGovernanceReady !== false;

  return {
    version: V73_KNOWLEDGE_LIFECYCLE_VERSION,
    freezeVersion: V73_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
    reportId: `knowledge-lifecycle-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    knowledgeGovernanceVersion: V73_KNOWLEDGE_GOVERNANCE_VERSION,
    knowledgeGovernanceReady: knowledgeGovernance.governanceReady,
    states,
    transitions,
    supportPolicies,
    lifecycleReady,
    readinessScore: lifecycleReady ? 100 : 0,
    summary: [
      `knowledge-lifecycle ready=${lifecycleReady}`,
      `states=${states.stateCount}`,
      `transitions=${transitions.entryCount}`,
      `supportPolicies=${supportPolicies.entryCount}`,
      `refsAligned=${refsAligned}`,
      `governance=${knowledgeGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertKnowledgeLifecyclePass(
  report: KnowledgeLifecycleReport,
): asserts report is KnowledgeLifecycleReport & { lifecycleReady: true } {
  if (!report.lifecycleReady) {
    throw new Error(`V73 knowledge lifecycle not ready: ${report.summary}`);
  }
}
