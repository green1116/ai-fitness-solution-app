/**
 * V71 P4 — Workflow compatibility matrix (declarative)
 */
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import type {
  CompatibilityConstraint,
  CompatibilityConstraintManifest,
  CompatibilityMatrix,
  WorkflowVersionPair,
  WorkflowVersionPairManifest,
} from "./workflow.compatibility";
import { V71_WORKFLOW_COMPATIBILITY_VERSION } from "./workflow.compatibility";

export const COMPATIBILITY_CONSTRAINT_CATALOG: CompatibilityConstraint[] = [
  {
    id: "ORC-CMP-CST-001",
    kind: "orchestration-version",
    minimum: "v71-orchestration-catalog-1",
    maximum: "v71-workflow-dependency-1",
    fallback: "v71-orchestration-catalog-1",
    required: true,
    description: "Orchestration catalog to dependency version range",
  },
  {
    id: "ORC-CMP-CST-002",
    kind: "policy-gate",
    minimum: "v71-workflow-dependency-1",
    maximum: "v71-workflow-policy-1",
    fallback: "v71-workflow-dependency-1",
    required: true,
    description: "Workflow dependency to policy version gate",
  },
  {
    id: "ORC-CMP-CST-003",
    kind: "dependency-order",
    minimum: "ORC-NOD-001",
    maximum: "ORC-NOD-008",
    fallback: "ORC-NOD-001",
    required: true,
    description: "Workflow node dependency order constraint",
  },
  {
    id: "ORC-CMP-CST-004",
    kind: "trigger-gate",
    minimum: "event",
    maximum: "gate-pass",
    fallback: "manual",
    required: true,
    description: "Trigger promotion gate constraint",
  },
  {
    id: "ORC-CMP-CST-005",
    kind: "timeout-range",
    minimum: "5m",
    maximum: "30m",
    fallback: "10m",
    required: true,
    description: "Workflow step timeout range constraint",
  },
  {
    id: "ORC-CMP-CST-006",
    kind: "retry-bound",
    minimum: "0",
    maximum: "3",
    fallback: "1",
    required: true,
    description: "Workflow retry attempt bound constraint",
  },
  {
    id: "ORC-CMP-CST-007",
    kind: "orchestration-version",
    minimum: "v70-delivery-freeze-1",
    maximum: "v71-orchestration-catalog-1",
    fallback: "v70-delivery-freeze-1",
    required: true,
    description: "V70 delivery freeze to V71 orchestration constraint",
  },
  {
    id: "ORC-CMP-CST-008",
    kind: "policy-gate",
    minimum: "v71-workflow-policy-1",
    maximum: "v71-workflow-compatibility-1",
    fallback: "v71-workflow-policy-1",
    required: true,
    description: "V71 workflow layer version constraint",
  },
];

export const WORKFLOW_VERSION_PAIR_CATALOG: WorkflowVersionPair[] = [
  {
    id: "ORC-WPX-001",
    sourceOrchestrationRef: "ORC-001",
    targetOrchestrationRef: "ORC-002",
    sourceVersion: "v71-orchestration-catalog-1",
    targetVersion: "v71-workflow-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v71-orchestration-catalog-1",
    maximum: "v71-workflow-dependency-1",
    constraint: "ORC-CMP-CST-001",
    fallback: "v71-orchestration-catalog-1",
    required: true,
    description: "Catalog init to dependency resolution compatibility",
  },
  {
    id: "ORC-WPX-002",
    sourceOrchestrationRef: "ORC-002",
    targetOrchestrationRef: "ORC-003",
    sourceVersion: "v71-workflow-dependency-1",
    targetVersion: "v71-workflow-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v71-workflow-dependency-1",
    maximum: "v71-workflow-policy-1",
    constraint: "ORC-CMP-CST-002",
    fallback: "v71-workflow-dependency-1",
    required: true,
    description: "Dependency graph to policy gate compatibility",
  },
  {
    id: "ORC-WPX-003",
    sourceOrchestrationRef: "ORC-003",
    targetOrchestrationRef: "ORC-004",
    sourceVersion: "v71-workflow-policy-1",
    targetVersion: "v71-workflow-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v71-workflow-policy-1",
    maximum: "v71-workflow-compatibility-1",
    constraint: "ORC-CMP-CST-008",
    fallback: "v71-workflow-policy-1",
    required: true,
    description: "Policy gate to compatibility scan compatibility",
  },
  {
    id: "ORC-WPX-004",
    sourceOrchestrationRef: "ORC-001",
    targetOrchestrationRef: "ORC-008",
    sourceVersion: "v70-delivery-freeze-1",
    targetVersion: "v71-orchestration-catalog-1",
    compatible: false,
    incompatible: true,
    deprecated: true,
    supported: false,
    minimum: "v70-delivery-freeze-1",
    maximum: "v71-orchestration-catalog-1",
    constraint: "ORC-CMP-CST-007",
    fallback: "ORC-001",
    required: true,
    description: "Deprecated direct skip from catalog to sign-off freeze",
  },
  {
    id: "ORC-WPX-005",
    sourceOrchestrationRef: "ORC-004",
    targetOrchestrationRef: "ORC-005",
    sourceVersion: "v71-workflow-compatibility-1",
    targetVersion: "v71-workflow-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "5m",
    maximum: "15m",
    constraint: "ORC-CMP-CST-005",
    fallback: "10m",
    required: true,
    description: "Compatibility scan to upgrade plan timeout compatibility",
  },
  {
    id: "ORC-WPX-006",
    sourceOrchestrationRef: "ORC-005",
    targetOrchestrationRef: "ORC-006",
    sourceVersion: "v71-workflow-policy-1",
    targetVersion: "v71-workflow-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "0",
    maximum: "3",
    constraint: "ORC-CMP-CST-006",
    fallback: "1",
    required: true,
    description: "Upgrade plan to lifecycle transition retry compatibility",
  },
  {
    id: "ORC-WPX-007",
    sourceOrchestrationRef: "ORC-006",
    targetOrchestrationRef: "ORC-007",
    sourceVersion: "v71-workflow-dependency-1",
    targetVersion: "v71-workflow-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "ORC-NOD-006",
    maximum: "ORC-NOD-007",
    constraint: "ORC-CMP-CST-003",
    fallback: "ORC-NOD-006",
    required: true,
    description: "Lifecycle transition to compliance audit order compatibility",
  },
  {
    id: "ORC-WPX-008",
    sourceOrchestrationRef: "ORC-007",
    targetOrchestrationRef: "ORC-008",
    sourceVersion: "v71-workflow-policy-1",
    targetVersion: "v71-workflow-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "webhook",
    maximum: "gate-pass",
    constraint: "ORC-CMP-CST-004",
    fallback: "event",
    required: true,
    description: "Compliance audit to sign-off freeze trigger gate compatibility",
  },
];

export function isWorkflowCompatibilityRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const constraintIds = new Set(COMPATIBILITY_CONSTRAINT_CATALOG.map((c) => c.id));

  const pairsAligned = WORKFLOW_VERSION_PAIR_CATALOG.every(
    (p) =>
      orchestrationIds.has(p.sourceOrchestrationRef) &&
      orchestrationIds.has(p.targetOrchestrationRef) &&
      constraintIds.has(p.constraint),
  );

  const coverageComplete =
    WORKFLOW_VERSION_PAIR_CATALOG.length >= 6 &&
    COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6 &&
    WORKFLOW_VERSION_PAIR_CATALOG.every((p) => p.fallback.length > 0);

  return pairsAligned && coverageComplete;
}

export function buildWorkflowVersionPairManifest(): WorkflowVersionPairManifest {
  const pairs = WORKFLOW_VERSION_PAIR_CATALOG;
  const catalogComplete = pairs.length >= 6;

  return {
    version: V71_WORKFLOW_COMPATIBILITY_VERSION,
    pairCount: pairs.length,
    catalogComplete,
    pairs,
    summary: [
      `workflow-version-pairs count=${pairs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCompatibilityConstraintManifest(): CompatibilityConstraintManifest {
  const constraints = COMPATIBILITY_CONSTRAINT_CATALOG;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete = constraints.length >= 6 && kinds.size >= 4;

  return {
    version: V71_WORKFLOW_COMPATIBILITY_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: [
      `compatibility-constraints count=${constraints.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCompatibilityMatrix(): CompatibilityMatrix {
  const pairs = WORKFLOW_VERSION_PAIR_CATALOG;
  const compatibleCount = pairs.filter((p) => p.compatible).length;
  const incompatibleCount = pairs.filter((p) => p.incompatible).length;
  const deprecatedCount = pairs.filter((p) => p.deprecated).length;
  const supportedCount = pairs.filter((p) => p.supported).length;
  const matrixComplete =
    pairs.length >= 6 &&
    compatibleCount >= 4 &&
    incompatibleCount >= 1 &&
    supportedCount >= 4;

  return {
    version: V71_WORKFLOW_COMPATIBILITY_VERSION,
    rowCount: pairs.length,
    compatibleCount,
    incompatibleCount,
    deprecatedCount,
    supportedCount,
    matrixComplete,
    pairs,
    summary: [
      `workflow-compatibility-matrix rows=${pairs.length}`,
      `compatible=${compatibleCount}`,
      `incompatible=${incompatibleCount}`,
      `deprecated=${deprecatedCount}`,
      `supported=${supportedCount}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getWorkflowVersionPairById(id: string): WorkflowVersionPair | undefined {
  return WORKFLOW_VERSION_PAIR_CATALOG.find((p) => p.id === id);
}

export function getWorkflowVersionPairsBySourceRef(
  sourceOrchestrationRef: string,
): WorkflowVersionPair[] {
  return WORKFLOW_VERSION_PAIR_CATALOG.filter(
    (p) => p.sourceOrchestrationRef === sourceOrchestrationRef,
  );
}

export function getCompatibilityConstraintById(
  id: string,
): CompatibilityConstraint | undefined {
  return COMPATIBILITY_CONSTRAINT_CATALOG.find((c) => c.id === id);
}

export function computeDeclarativeCompatibilityPass(input: {
  compatible: boolean;
  incompatible: boolean;
}): boolean {
  return input.compatible && !input.incompatible;
}
