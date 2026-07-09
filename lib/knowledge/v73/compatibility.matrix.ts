/**
 * V73 P4 — Knowledge compatibility matrix (declarative)
 */
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
import type {
  Constraint,
  ConstraintManifest,
  Matrix,
  VersionPair,
  VersionPairManifest,
} from "./knowledge.compatibility";
import { V73_KNOWLEDGE_COMPATIBILITY_VERSION } from "./knowledge.compatibility";

export const COMPATIBILITY_CONSTRAINT_CATALOG: Constraint[] = [
  {
    id: "KNW-CMP-CST-001",
    kind: "knowledge-version",
    minimum: "v73-knowledge-catalog-1",
    maximum: "v73-knowledge-dependency-1",
    fallback: "v73-knowledge-catalog-1",
    required: true,
    description: "Knowledge catalog to dependency version range",
  },
  {
    id: "KNW-CMP-CST-002",
    kind: "policy-gate",
    minimum: "v73-knowledge-dependency-1",
    maximum: "v73-knowledge-policy-1",
    fallback: "v73-knowledge-dependency-1",
    required: true,
    description: "Knowledge dependency to policy version gate",
  },
  {
    id: "KNW-CMP-CST-003",
    kind: "dependency-order",
    minimum: "KNW-NOD-001",
    maximum: "KNW-NOD-008",
    fallback: "KNW-NOD-001",
    required: true,
    description: "Knowledge node dependency order constraint",
  },
  {
    id: "KNW-CMP-CST-004",
    kind: "confidence-threshold",
    minimum: "medium",
    maximum: "high",
    fallback: "medium",
    required: true,
    description: "Document confidence threshold gate constraint",
  },
  {
    id: "KNW-CMP-CST-005",
    kind: "access-gate",
    minimum: "internal",
    maximum: "confidential",
    fallback: "internal",
    required: true,
    description: "Knowledge access escalation gate constraint",
  },
  {
    id: "KNW-CMP-CST-006",
    kind: "document-order",
    minimum: "KNW-001",
    maximum: "KNW-008",
    fallback: "KNW-001",
    required: true,
    description: "Knowledge document retrieval order constraint",
  },
  {
    id: "KNW-CMP-CST-007",
    kind: "knowledge-version",
    minimum: "v72-intelligence-freeze-1",
    maximum: "v73-knowledge-catalog-1",
    fallback: "v72-intelligence-freeze-1",
    required: true,
    description: "V72 intelligence freeze to V73 knowledge catalog constraint",
  },
  {
    id: "KNW-CMP-CST-008",
    kind: "policy-gate",
    minimum: "v73-knowledge-policy-1",
    maximum: "v73-knowledge-compatibility-1",
    fallback: "v73-knowledge-policy-1",
    required: true,
    description: "V73 knowledge layer version constraint",
  },
];

export const KNOWLEDGE_VERSION_PAIR_CATALOG: VersionPair[] = [
  {
    id: "KNW-VPX-001",
    sourceKnowledgeRef: "KNW-001",
    targetKnowledgeRef: "KNW-002",
    sourceVersion: "v73-knowledge-catalog-1",
    targetVersion: "v73-knowledge-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v73-knowledge-catalog-1",
    maximum: "v73-knowledge-dependency-1",
    constraint: "KNW-CMP-CST-001",
    fallback: "v73-knowledge-catalog-1",
    required: true,
    description: "Catalog baseline to dependency graph compatibility",
  },
  {
    id: "KNW-VPX-002",
    sourceKnowledgeRef: "KNW-002",
    targetKnowledgeRef: "KNW-003",
    sourceVersion: "v73-knowledge-dependency-1",
    targetVersion: "v73-knowledge-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v73-knowledge-dependency-1",
    maximum: "v73-knowledge-policy-1",
    constraint: "KNW-CMP-CST-002",
    fallback: "v73-knowledge-dependency-1",
    required: true,
    description: "Dependency graph to policy gate compatibility",
  },
  {
    id: "KNW-VPX-003",
    sourceKnowledgeRef: "KNW-003",
    targetKnowledgeRef: "KNW-004",
    sourceVersion: "v73-knowledge-policy-1",
    targetVersion: "v73-knowledge-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v73-knowledge-policy-1",
    maximum: "v73-knowledge-compatibility-1",
    constraint: "KNW-CMP-CST-008",
    fallback: "v73-knowledge-policy-1",
    required: true,
    description: "Policy gate to compatibility scan compatibility",
  },
  {
    id: "KNW-VPX-004",
    sourceKnowledgeRef: "KNW-001",
    targetKnowledgeRef: "KNW-008",
    sourceVersion: "v72-intelligence-freeze-1",
    targetVersion: "v73-knowledge-catalog-1",
    compatible: false,
    incompatible: true,
    deprecated: true,
    supported: false,
    minimum: "v72-intelligence-freeze-1",
    maximum: "v73-knowledge-catalog-1",
    constraint: "KNW-CMP-CST-007",
    fallback: "KNW-001",
    required: true,
    description: "Deprecated direct skip from catalog baseline to foundation catalog",
  },
  {
    id: "KNW-VPX-005",
    sourceKnowledgeRef: "KNW-004",
    targetKnowledgeRef: "KNW-005",
    sourceVersion: "v73-knowledge-compatibility-1",
    targetVersion: "v73-knowledge-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "medium",
    maximum: "high",
    constraint: "KNW-CMP-CST-004",
    fallback: "medium",
    required: true,
    description: "Compatibility scan to governance risk confidence compatibility",
  },
  {
    id: "KNW-VPX-006",
    sourceKnowledgeRef: "KNW-005",
    targetKnowledgeRef: "KNW-006",
    sourceVersion: "v73-knowledge-policy-1",
    targetVersion: "v73-knowledge-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "internal",
    maximum: "confidential",
    constraint: "KNW-CMP-CST-005",
    fallback: "internal",
    required: true,
    description: "Governance risk to lifecycle reference access compatibility",
  },
  {
    id: "KNW-VPX-007",
    sourceKnowledgeRef: "KNW-006",
    targetKnowledgeRef: "KNW-007",
    sourceVersion: "v73-knowledge-dependency-1",
    targetVersion: "v73-knowledge-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "KNW-NOD-006",
    maximum: "KNW-NOD-007",
    constraint: "KNW-CMP-CST-003",
    fallback: "KNW-NOD-006",
    required: true,
    description: "Lifecycle reference to compliance checklist order compatibility",
  },
  {
    id: "KNW-VPX-008",
    sourceKnowledgeRef: "KNW-007",
    targetKnowledgeRef: "KNW-008",
    sourceVersion: "v73-knowledge-policy-1",
    targetVersion: "v73-knowledge-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "KNW-001",
    maximum: "KNW-008",
    constraint: "KNW-CMP-CST-006",
    fallback: "KNW-007",
    required: true,
    description: "Compliance checklist to foundation catalog document order compatibility",
  },
];

export function isKnowledgeCompatibilityRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const constraintIds = new Set(COMPATIBILITY_CONSTRAINT_CATALOG.map((c) => c.id));

  const pairsAligned = KNOWLEDGE_VERSION_PAIR_CATALOG.every(
    (p) =>
      knowledgeIds.has(p.sourceKnowledgeRef) &&
      knowledgeIds.has(p.targetKnowledgeRef) &&
      constraintIds.has(p.constraint),
  );

  const coverageComplete =
    KNOWLEDGE_VERSION_PAIR_CATALOG.length >= 6 &&
    COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6 &&
    KNOWLEDGE_VERSION_PAIR_CATALOG.every((p) => p.fallback.length > 0);

  return pairsAligned && coverageComplete;
}

export function buildVersionPairManifest(): VersionPairManifest {
  const pairs = KNOWLEDGE_VERSION_PAIR_CATALOG;
  const catalogComplete = pairs.length >= 6;

  return {
    version: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
    pairCount: pairs.length,
    catalogComplete,
    pairs,
    summary: [
      `knowledge-version-pairs count=${pairs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCompatibilityConstraintManifest(): ConstraintManifest {
  const constraints = COMPATIBILITY_CONSTRAINT_CATALOG;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete = constraints.length >= 6 && kinds.size >= 4;

  return {
    version: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
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

export function buildCompatibilityMatrix(): Matrix {
  const pairs = KNOWLEDGE_VERSION_PAIR_CATALOG;
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
    version: V73_KNOWLEDGE_COMPATIBILITY_VERSION,
    rowCount: pairs.length,
    compatibleCount,
    incompatibleCount,
    deprecatedCount,
    supportedCount,
    matrixComplete,
    pairs,
    summary: [
      `knowledge-compatibility-matrix rows=${pairs.length}`,
      `compatible=${compatibleCount}`,
      `incompatible=${incompatibleCount}`,
      `deprecated=${deprecatedCount}`,
      `supported=${supportedCount}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getVersionPairById(id: string): VersionPair | undefined {
  return KNOWLEDGE_VERSION_PAIR_CATALOG.find((p) => p.id === id);
}

export function getVersionPairsBySourceRef(
  sourceKnowledgeRef: string,
): VersionPair[] {
  return KNOWLEDGE_VERSION_PAIR_CATALOG.filter(
    (p) => p.sourceKnowledgeRef === sourceKnowledgeRef,
  );
}

export function getCompatibilityConstraintById(id: string): Constraint | undefined {
  return COMPATIBILITY_CONSTRAINT_CATALOG.find((c) => c.id === id);
}

export function computeDeclarativeCompatibilityPass(input: {
  compatible: boolean;
  incompatible: boolean;
}): boolean {
  return input.compatible && !input.incompatible;
}
