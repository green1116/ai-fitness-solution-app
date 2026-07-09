/**
 * V74 P1 — Decision engine inventory entry (read-only)
 */
export {
  DECISION_CONSTRAINT_CATALOG,
  DECISION_CONTEXT_CATALOG,
  DECISION_INPUT_CATALOG,
  DECISION_OUTPUT_CATALOG,
  DECISION_POLICY_CATALOG,
  DECISION_SOURCE_CATALOG,
  assertDecisionInventoryPass,
  buildDecisionConstraintManifest,
  buildDecisionContextManifest,
  buildDecisionInputManifest,
  buildDecisionInventory,
  buildDecisionInventoryManifest,
  buildDecisionOutputManifest,
  buildDecisionPolicyManifest,
  buildDecisionSourceManifest,
  getDecisionInputById,
  getDecisionOutputById,
  getDecisionPolicyById,
  getDecisionSourceById,
  isDecisionInventoryRefsAligned,
} from "./decision.inventory";
export {
  DECISION_UPSTREAM_DEPENDENCIES,
  getDecisionDependenciesByKnowledgeRef,
  getDecisionDependencyById,
  isDecisionUpstreamAligned,
} from "./decision.dependencies";
export {
  DECISION_SCOPE_CATALOG,
  buildDecisionScopeManifest,
  getDecisionScopeById,
  getDecisionScopesByKind,
  isDecisionScopeCoverageComplete,
} from "./decision.scope";
export { V74_DECISION_FREEZE_VERSION, V74_DECISION_VERSION } from "./decision.types";
export type {
  DecisionConstraint,
  DecisionContext,
  DecisionInput,
  DecisionInventoryManifest,
  DecisionInventoryReport,
  DecisionInventorySignals,
  DecisionOutput,
  DecisionPolicy,
  DecisionSource,
} from "./decision.types";
export type { DecisionUpstreamDependency } from "./decision.dependencies";
export type { DecisionScope, DecisionScopeKind } from "./decision.scope";

import { buildDecisionInventory } from "./decision.inventory";
import type { DecisionInventoryReport, DecisionInventorySignals } from "./decision.types";

export function runDecisionInventory(input?: {
  deploymentId?: string;
  signals?: DecisionInventorySignals;
}): DecisionInventoryReport {
  return buildDecisionInventory(input);
}

export function formatDecisionInventorySummary(report: DecisionInventoryReport): string {
  const lines = [
    "V74 Decision Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-knowledge-freeze: ${report.upstreamKnowledgeFreeze}`,
    `  inputs: ${report.manifest.inputs.entryCount}`,
    `  outputs: ${report.manifest.outputs.entryCount}`,
    `  contexts: ${report.manifest.contexts.entryCount}`,
    `  constraints: ${report.manifest.constraints.entryCount}`,
    `  policies: ${report.manifest.policies.entryCount}`,
    `  sources: ${report.manifest.sources.entryCount}`,
  ];
  return lines.join("\n");
}
