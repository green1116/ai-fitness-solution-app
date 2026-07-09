/**
 * V72 P4 — Intelligence compatibility matrix (declarative)
 */
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import type {
  Constraint,
  ConstraintManifest,
  Matrix,
  VersionPair,
  VersionPairManifest,
} from "./intelligence.compatibility";
import { V72_INTELLIGENCE_COMPATIBILITY_VERSION } from "./intelligence.compatibility";

export const COMPATIBILITY_CONSTRAINT_CATALOG: Constraint[] = [
  {
    id: "INT-CMP-CST-001",
    kind: "intelligence-version",
    minimum: "v72-intelligence-catalog-1",
    maximum: "v72-signal-dependency-1",
    fallback: "v72-intelligence-catalog-1",
    required: true,
    description: "Intelligence catalog to signal dependency version range",
  },
  {
    id: "INT-CMP-CST-002",
    kind: "policy-gate",
    minimum: "v72-signal-dependency-1",
    maximum: "v72-intelligence-policy-1",
    fallback: "v72-signal-dependency-1",
    required: true,
    description: "Signal dependency to intelligence policy version gate",
  },
  {
    id: "INT-CMP-CST-003",
    kind: "dependency-order",
    minimum: "INT-NOD-001",
    maximum: "INT-NOD-008",
    fallback: "INT-NOD-001",
    required: true,
    description: "Signal node dependency order constraint",
  },
  {
    id: "INT-CMP-CST-004",
    kind: "confidence-threshold",
    minimum: "medium",
    maximum: "high",
    fallback: "medium",
    required: true,
    description: "Insight confidence threshold gate constraint",
  },
  {
    id: "INT-CMP-CST-005",
    kind: "severity-gate",
    minimum: "low",
    maximum: "critical",
    fallback: "medium",
    required: true,
    description: "Signal severity escalation gate constraint",
  },
  {
    id: "INT-CMP-CST-006",
    kind: "signal-order",
    minimum: "INT-001",
    maximum: "INT-008",
    fallback: "INT-001",
    required: true,
    description: "Intelligence insight signal order constraint",
  },
  {
    id: "INT-CMP-CST-007",
    kind: "intelligence-version",
    minimum: "v71-workflow-freeze-1",
    maximum: "v72-intelligence-catalog-1",
    fallback: "v71-workflow-freeze-1",
    required: true,
    description: "V71 workflow freeze to V72 intelligence catalog constraint",
  },
  {
    id: "INT-CMP-CST-008",
    kind: "policy-gate",
    minimum: "v72-intelligence-policy-1",
    maximum: "v72-intelligence-compatibility-1",
    fallback: "v72-intelligence-policy-1",
    required: true,
    description: "V72 intelligence layer version constraint",
  },
];

export const INTELLIGENCE_VERSION_PAIR_CATALOG: VersionPair[] = [
  {
    id: "INT-VPX-001",
    sourceIntelligenceRef: "INT-001",
    targetIntelligenceRef: "INT-002",
    sourceVersion: "v72-intelligence-catalog-1",
    targetVersion: "v72-signal-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v72-intelligence-catalog-1",
    maximum: "v72-signal-dependency-1",
    constraint: "INT-CMP-CST-001",
    fallback: "v72-intelligence-catalog-1",
    required: true,
    description: "Catalog baseline to dependency acyclic status compatibility",
  },
  {
    id: "INT-VPX-002",
    sourceIntelligenceRef: "INT-002",
    targetIntelligenceRef: "INT-003",
    sourceVersion: "v72-signal-dependency-1",
    targetVersion: "v72-intelligence-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v72-signal-dependency-1",
    maximum: "v72-intelligence-policy-1",
    constraint: "INT-CMP-CST-002",
    fallback: "v72-signal-dependency-1",
    required: true,
    description: "Dependency graph to policy gate compatibility",
  },
  {
    id: "INT-VPX-003",
    sourceIntelligenceRef: "INT-003",
    targetIntelligenceRef: "INT-004",
    sourceVersion: "v72-intelligence-policy-1",
    targetVersion: "v72-intelligence-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v72-intelligence-policy-1",
    maximum: "v72-intelligence-compatibility-1",
    constraint: "INT-CMP-CST-008",
    fallback: "v72-intelligence-policy-1",
    required: true,
    description: "Policy gate to compatibility scan compatibility",
  },
  {
    id: "INT-VPX-004",
    sourceIntelligenceRef: "INT-001",
    targetIntelligenceRef: "INT-008",
    sourceVersion: "v71-workflow-freeze-1",
    targetVersion: "v72-intelligence-catalog-1",
    compatible: false,
    incompatible: true,
    deprecated: true,
    supported: false,
    minimum: "v71-workflow-freeze-1",
    maximum: "v72-intelligence-catalog-1",
    constraint: "INT-CMP-CST-007",
    fallback: "INT-001",
    required: true,
    description: "Deprecated direct skip from catalog baseline to sign-off freeze",
  },
  {
    id: "INT-VPX-005",
    sourceIntelligenceRef: "INT-004",
    targetIntelligenceRef: "INT-005",
    sourceVersion: "v72-intelligence-compatibility-1",
    targetVersion: "v72-intelligence-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "medium",
    maximum: "high",
    constraint: "INT-CMP-CST-004",
    fallback: "medium",
    required: true,
    description: "Compatibility scan to governance risk confidence compatibility",
  },
  {
    id: "INT-VPX-006",
    sourceIntelligenceRef: "INT-005",
    targetIntelligenceRef: "INT-006",
    sourceVersion: "v72-intelligence-policy-1",
    targetVersion: "v72-signal-dependency-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "low",
    maximum: "critical",
    constraint: "INT-CMP-CST-005",
    fallback: "medium",
    required: true,
    description: "Governance risk to lifecycle transition severity compatibility",
  },
  {
    id: "INT-VPX-007",
    sourceIntelligenceRef: "INT-006",
    targetIntelligenceRef: "INT-007",
    sourceVersion: "v72-signal-dependency-1",
    targetVersion: "v72-intelligence-policy-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "INT-NOD-006",
    maximum: "INT-NOD-007",
    constraint: "INT-CMP-CST-003",
    fallback: "INT-NOD-006",
    required: true,
    description: "Lifecycle transition to compliance audit order compatibility",
  },
  {
    id: "INT-VPX-008",
    sourceIntelligenceRef: "INT-007",
    targetIntelligenceRef: "INT-008",
    sourceVersion: "v72-intelligence-policy-1",
    targetVersion: "v72-intelligence-compatibility-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "INT-001",
    maximum: "INT-008",
    constraint: "INT-CMP-CST-006",
    fallback: "INT-007",
    required: true,
    description: "Compliance audit to sign-off freeze signal order compatibility",
  },
];

export function isIntelligenceCompatibilityRefsAligned(): boolean {
  const intelligenceIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const constraintIds = new Set(COMPATIBILITY_CONSTRAINT_CATALOG.map((c) => c.id));

  const pairsAligned = INTELLIGENCE_VERSION_PAIR_CATALOG.every(
    (p) =>
      intelligenceIds.has(p.sourceIntelligenceRef) &&
      intelligenceIds.has(p.targetIntelligenceRef) &&
      constraintIds.has(p.constraint),
  );

  const coverageComplete =
    INTELLIGENCE_VERSION_PAIR_CATALOG.length >= 6 &&
    COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6 &&
    INTELLIGENCE_VERSION_PAIR_CATALOG.every((p) => p.fallback.length > 0);

  return pairsAligned && coverageComplete;
}

export function buildVersionPairManifest(): VersionPairManifest {
  const pairs = INTELLIGENCE_VERSION_PAIR_CATALOG;
  const catalogComplete = pairs.length >= 6;

  return {
    version: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
    pairCount: pairs.length,
    catalogComplete,
    pairs,
    summary: [
      `intelligence-version-pairs count=${pairs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCompatibilityConstraintManifest(): ConstraintManifest {
  const constraints = COMPATIBILITY_CONSTRAINT_CATALOG;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete = constraints.length >= 6 && kinds.size >= 4;

  return {
    version: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
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
  const pairs = INTELLIGENCE_VERSION_PAIR_CATALOG;
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
    version: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
    rowCount: pairs.length,
    compatibleCount,
    incompatibleCount,
    deprecatedCount,
    supportedCount,
    matrixComplete,
    pairs,
    summary: [
      `intelligence-compatibility-matrix rows=${pairs.length}`,
      `compatible=${compatibleCount}`,
      `incompatible=${incompatibleCount}`,
      `deprecated=${deprecatedCount}`,
      `supported=${supportedCount}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getVersionPairById(id: string): VersionPair | undefined {
  return INTELLIGENCE_VERSION_PAIR_CATALOG.find((p) => p.id === id);
}

export function getVersionPairsBySourceRef(
  sourceIntelligenceRef: string,
): VersionPair[] {
  return INTELLIGENCE_VERSION_PAIR_CATALOG.filter(
    (p) => p.sourceIntelligenceRef === sourceIntelligenceRef,
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
