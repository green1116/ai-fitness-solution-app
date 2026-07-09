/**
 * V78 P2 — Execution policy catalog entry (read-only)
 */
export {
  EXECUTION_POLICY_CATALOG_ENTRIES,
  EXECUTION_POLICY_GATE_CATALOG,
  buildExecutionPolicyCatalogManifest,
  buildExecutionPolicyGateManifest,
  computeExecutionDeclarativePolicyBlock,
  getExecutionPolicyCatalogEntriesByKind,
  getExecutionPolicyCatalogEntryById,
  getExecutionPolicyGateByPolicyRef,
  isExecutionPolicyCatalogRefsAligned,
} from "./execution.policy.catalog";
export {
  assertExecutionPolicyCatalogPass,
  buildExecutionPolicyCatalog,
} from "./execution.policy.builder";
export {
  V78_EXECUTION_POLICY_FREEZE_VERSION,
  V78_EXECUTION_POLICY_VERSION,
} from "./execution.policy";
export type {
  ExecutionPolicyCatalogEntry,
  ExecutionPolicyCatalogKind,
  ExecutionPolicyCatalogReport,
  ExecutionPolicyCatalogSignals,
  ExecutionPolicyEnforcement,
  ExecutionPolicyGate,
} from "./execution.policy";

import { buildExecutionPolicyCatalog } from "./execution.policy.builder";
import type { ExecutionPolicyCatalogReport, ExecutionPolicyCatalogSignals } from "./execution.policy";

export function runExecutionPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionPolicyCatalogSignals;
}): ExecutionPolicyCatalogReport {
  return buildExecutionPolicyCatalog(input);
}

export function formatExecutionPolicyCatalogSummary(report: ExecutionPolicyCatalogReport): string {
  const lines = [
    "V78 Execution Policy Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  execution-inventory: ${report.executionInventoryVersion} (ready=${report.executionInventoryReady})`,
    `  policies: ${report.catalog.entryCount}`,
    `  kinds: ${report.catalog.kindCount}`,
    `  gates: ${report.gates.gateCount}`,
  ];
  return lines.join("\n");
}
