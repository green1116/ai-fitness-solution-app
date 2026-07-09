/**
 * V71 P1 — Orchestration catalog (declarative)
 */
import type { OrchestrationCatalogEntry, OrchestrationCatalogManifest } from "./orchestration.types";
import { V71_ORCHESTRATION_VERSION } from "./orchestration.types";

export const ORCHESTRATION_CATALOG: OrchestrationCatalogEntry[] = [
  {
    id: "ORC-001",
    orchestration: "delivery-lifecycle-orchestration",
    workflow: "v70-delivery-lifecycle",
    trigger: "gate-pass",
    action: "catalog-build",
    step: "release-catalog-init",
    owner: "release-engineering",
    status: "active",
    input: "v70-delivery-freeze-1",
    output: "release-catalog-manifest",
    retry: { maxAttempts: 2, backoff: "linear", interval: "30s" },
    timeout: "5m",
    required: true,
    description: "V70 delivery lifecycle release catalog orchestration entry",
  },
  {
    id: "ORC-002",
    orchestration: "dependency-resolution-orchestration",
    workflow: "v70-release-dependency",
    trigger: "event",
    action: "dependency-resolve",
    step: "dependency-graph-resolve",
    owner: "release-engineering",
    status: "active",
    input: "release-catalog-manifest",
    output: "dependency-graph-manifest",
    retry: { maxAttempts: 3, backoff: "exponential", interval: "15s" },
    timeout: "10m",
    required: true,
    description: "Release dependency graph resolution workflow",
  },
  {
    id: "ORC-003",
    orchestration: "policy-gate-orchestration",
    workflow: "v70-release-policy",
    trigger: "event",
    action: "policy-check",
    step: "policy-rules-evaluate",
    owner: "governance",
    status: "active",
    input: "dependency-graph-manifest",
    output: "policy-compliance-report",
    retry: { maxAttempts: 2, backoff: "linear", interval: "20s" },
    timeout: "8m",
    required: true,
    description: "Release policy gate evaluation orchestration",
  },
  {
    id: "ORC-004",
    orchestration: "compatibility-scan-orchestration",
    workflow: "v70-version-compatibility",
    trigger: "schedule",
    action: "compatibility-scan",
    step: "version-pair-scan",
    owner: "platform-engineering",
    status: "active",
    input: "policy-compliance-report",
    output: "compatibility-matrix-report",
    retry: { maxAttempts: 2, backoff: "exponential", interval: "30s" },
    timeout: "15m",
    required: true,
    description: "Version compatibility matrix scan workflow",
  },
  {
    id: "ORC-005",
    orchestration: "upgrade-plan-orchestration",
    workflow: "v70-upgrade-governance",
    trigger: "manual",
    action: "upgrade-plan",
    step: "upgrade-path-compose",
    owner: "release-engineering",
    status: "active",
    input: "compatibility-matrix-report",
    output: "upgrade-plan-manifest",
    retry: { maxAttempts: 1, backoff: "none", interval: "0s" },
    timeout: "12m",
    required: true,
    description: "Upgrade governance plan composition orchestration",
  },
  {
    id: "ORC-006",
    orchestration: "lifecycle-transition-orchestration",
    workflow: "v70-lifecycle-management",
    trigger: "event",
    action: "lifecycle-transition",
    step: "lifecycle-state-advance",
    owner: "product-engineering",
    status: "active",
    input: "upgrade-plan-manifest",
    output: "lifecycle-state-report",
    retry: { maxAttempts: 2, backoff: "linear", interval: "45s" },
    timeout: "10m",
    required: true,
    description: "Lifecycle state transition orchestration",
  },
  {
    id: "ORC-007",
    orchestration: "compliance-audit-orchestration",
    workflow: "v70-delivery-compliance",
    trigger: "webhook",
    action: "compliance-audit",
    step: "compliance-items-audit",
    owner: "governance",
    status: "active",
    input: "lifecycle-state-report",
    output: "compliance-audit-report",
    retry: { maxAttempts: 3, backoff: "exponential", interval: "60s" },
    timeout: "20m",
    required: true,
    description: "Delivery compliance audit orchestration",
  },
  {
    id: "ORC-008",
    orchestration: "signoff-freeze-orchestration",
    workflow: "v70-delivery-signoff",
    trigger: "gate-pass",
    action: "signoff-freeze",
    step: "delivery-signoff-freeze",
    owner: "release-engineering",
    status: "draft",
    input: "compliance-audit-report",
    output: "v71-orchestration-catalog-1",
    retry: { maxAttempts: 1, backoff: "none", interval: "0s" },
    timeout: "30m",
    required: true,
    description: "V71 P1 delivery orchestration foundation catalog entry",
  },
];

export function buildOrchestrationCatalogManifest(): OrchestrationCatalogManifest {
  const orchestrations = ORCHESTRATION_CATALOG;
  const triggers = new Set(orchestrations.map((o) => o.trigger));
  const actions = new Set(orchestrations.map((o) => o.action));
  const catalogComplete =
    orchestrations.length >= 6 && triggers.size >= 3 && actions.size >= 4;

  return {
    version: V71_ORCHESTRATION_VERSION,
    entryCount: orchestrations.length,
    triggerCount: triggers.size,
    actionCount: actions.size,
    catalogComplete,
    orchestrations,
    summary: [
      `orchestration-catalog count=${orchestrations.length}`,
      `triggers=${triggers.size}`,
      `actions=${actions.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getOrchestrationById(id: string): OrchestrationCatalogEntry | undefined {
  return ORCHESTRATION_CATALOG.find((o) => o.id === id);
}

export function getOrchestrationsByTrigger(
  trigger: OrchestrationCatalogEntry["trigger"],
): OrchestrationCatalogEntry[] {
  return ORCHESTRATION_CATALOG.filter((o) => o.trigger === trigger);
}

export function getOrchestrationsByAction(
  action: OrchestrationCatalogEntry["action"],
): OrchestrationCatalogEntry[] {
  return ORCHESTRATION_CATALOG.filter((o) => o.action === action);
}
