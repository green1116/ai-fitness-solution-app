/**
 * V78 P2 — Execution policy catalog builder (read-only)
 */
import { buildExecutionInventory } from "./execution.inventory";
import { V78_EXECUTION_VERSION } from "./execution.types";
import {
  buildExecutionPolicyCatalogManifest,
  buildExecutionPolicyGateManifest,
  isExecutionPolicyCatalogRefsAligned,
} from "./execution.policy.catalog";
import type {
  ExecutionPolicyCatalogReport,
  ExecutionPolicyCatalogSignals,
} from "./execution.policy";
import {
  V78_EXECUTION_POLICY_FREEZE_VERSION,
  V78_EXECUTION_POLICY_VERSION,
} from "./execution.policy";

const DEFAULT_SIGNALS: ExecutionPolicyCatalogSignals = {
  executionInventoryReady: true,
  catalogComplete: true,
  gatesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildExecutionPolicyCatalog(input?: {
  deploymentId?: string;
  signals?: ExecutionPolicyCatalogSignals;
}): ExecutionPolicyCatalogReport {
  const deploymentId = input?.deploymentId ?? "v78-execution-policy-catalog-default";

  const executionInventory = buildExecutionInventory({ deploymentId });
  const catalog = buildExecutionPolicyCatalogManifest();
  const gates = buildExecutionPolicyGateManifest();
  const refsAligned = isExecutionPolicyCatalogRefsAligned();

  const signals: ExecutionPolicyCatalogSignals = {
    ...DEFAULT_SIGNALS,
    executionInventoryReady: executionInventory.inventoryReady,
    catalogComplete: catalog.catalogComplete,
    gatesComplete: gates.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V78_EXECUTION_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    executionInventory.inventoryReady &&
    catalog.catalogComplete &&
    gates.catalogComplete &&
    refsAligned &&
    signals.executionInventoryReady !== false;

  return {
    version: V78_EXECUTION_POLICY_VERSION,
    freezeVersion: V78_EXECUTION_POLICY_FREEZE_VERSION,
    reportId: `execution-policy-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionInventoryVersion: V78_EXECUTION_VERSION,
    executionInventoryReady: executionInventory.inventoryReady,
    catalog,
    gates,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `execution-policy-catalog ready=${catalogReady}`,
      `policies=${catalog.entryCount}`,
      `kinds=${catalog.kindCount}`,
      `gates=${gates.gateCount}`,
      `refsAligned=${refsAligned}`,
      `inventory=${executionInventory.inventoryReady}`,
    ].join(" "),
  };
}

export function assertExecutionPolicyCatalogPass(
  report: ExecutionPolicyCatalogReport,
): asserts report is ExecutionPolicyCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V78 execution policy catalog not ready: ${report.summary}`);
  }
}
