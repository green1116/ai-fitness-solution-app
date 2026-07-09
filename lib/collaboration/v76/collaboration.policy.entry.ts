/**
 * V76 P2 — Collaboration policy catalog entry (read-only)
 */
export {
  COLLABORATION_POLICY_CATALOG_ENTRIES,
  COLLABORATION_POLICY_GATE_CATALOG,
  buildCollaborationPolicyCatalogManifest,
  buildCollaborationPolicyGateManifest,
  computeCollaborationDeclarativePolicyBlock,
  getCollaborationPolicyCatalogEntriesByKind,
  getCollaborationPolicyCatalogEntryById,
  getCollaborationPolicyGateByPolicyRef,
  isCollaborationPolicyCatalogRefsAligned,
} from "./collaboration.policy.catalog";
export {
  assertCollaborationPolicyCatalogPass,
  buildCollaborationPolicyCatalog,
} from "./collaboration.policy.builder";
export {
  V76_COLLABORATION_POLICY_FREEZE_VERSION,
  V76_COLLABORATION_POLICY_VERSION,
} from "./collaboration.policy";
export type {
  CollaborationPolicyCatalogEntry,
  CollaborationPolicyCatalogKind,
  CollaborationPolicyCatalogReport,
  CollaborationPolicyCatalogSignals,
  CollaborationPolicyEnforcement,
  CollaborationPolicyGate,
} from "./collaboration.policy";

import { buildCollaborationPolicyCatalog } from "./collaboration.policy.builder";
import type {
  CollaborationPolicyCatalogReport,
  CollaborationPolicyCatalogSignals,
} from "./collaboration.policy";

export function runCollaborationPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: CollaborationPolicyCatalogSignals;
}): CollaborationPolicyCatalogReport {
  return buildCollaborationPolicyCatalog(input);
}

export function formatCollaborationPolicyCatalogSummary(
  report: CollaborationPolicyCatalogReport,
): string {
  const lines = [
    "V76 Collaboration Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  collaboration-inventory: ${report.collaborationInventoryVersion} (ready=${report.collaborationInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
