/**
 * V76 P1 — Collaboration inventory entry (read-only)
 */
export {
  COLLABORATION_CONSTRAINT_CATALOG,
  COLLABORATION_CONTEXT_CATALOG,
  COLLABORATION_INPUT_CATALOG,
  COLLABORATION_OUTPUT_CATALOG,
  COLLABORATION_POLICY_CATALOG,
  COLLABORATION_SOURCE_CATALOG,
  assertCollaborationInventoryPass,
  buildCollaborationConstraintManifest,
  buildCollaborationContextManifest,
  buildCollaborationInputManifest,
  buildCollaborationInventory,
  buildCollaborationInventoryManifest,
  buildCollaborationOutputManifest,
  buildCollaborationPolicyManifest,
  buildCollaborationSourceManifest,
  getCollaborationInputById,
  getCollaborationOutputById,
  getCollaborationPolicyById,
  getCollaborationSourceById,
  isCollaborationInventoryRefsAligned,
} from "./collaboration.inventory";
export {
  COLLABORATION_UPSTREAM_DEPENDENCIES,
  getCollaborationDependenciesByAgentRef,
  getCollaborationDependencyById,
  isCollaborationUpstreamAligned,
} from "./collaboration.dependencies";
export {
  COLLABORATION_SCOPE_CATALOG,
  buildCollaborationScopeManifest,
  getCollaborationScopeById,
  getCollaborationScopesByKind,
  isCollaborationScopeCoverageComplete,
} from "./collaboration.scope";
export { V76_COLLABORATION_FREEZE_VERSION, V76_COLLABORATION_VERSION } from "./collaboration.types";
export type {
  CollaborationAssetStatus,
  CollaborationConstraint,
  CollaborationContext,
  CollaborationInput,
  CollaborationInventoryManifest,
  CollaborationInventoryReport,
  CollaborationInventorySignals,
  CollaborationOutput,
  CollaborationPolicy,
  CollaborationSource,
} from "./collaboration.types";
export type { CollaborationUpstreamDependency } from "./collaboration.dependencies";
export type { CollaborationScope, CollaborationScopeKind } from "./collaboration.scope";

import { buildCollaborationInventory } from "./collaboration.inventory";
import type {
  CollaborationInventoryReport,
  CollaborationInventorySignals,
} from "./collaboration.types";

export function runCollaborationInventory(input?: {
  deploymentId?: string;
  signals?: CollaborationInventorySignals;
}): CollaborationInventoryReport {
  return buildCollaborationInventory(input);
}

export function formatCollaborationInventorySummary(
  report: CollaborationInventoryReport,
): string {
  const lines = [
    "V76 Collaboration Inventory",
    `  ready: ${report.inventoryReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upstream-agent-freeze: ${report.upstreamAgentFreeze}`,
    `  inputs: ${report.manifest.inputs.entryCount}`,
    `  outputs: ${report.manifest.outputs.entryCount}`,
    `  contexts: ${report.manifest.contexts.entryCount}`,
    `  constraints: ${report.manifest.constraints.entryCount}`,
    `  policies: ${report.manifest.policies.entryCount}`,
    `  sources: ${report.manifest.sources.entryCount}`,
  ];
  return lines.join("\n");
}
