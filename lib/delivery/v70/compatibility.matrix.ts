/**
 * V70 P4 — Version compatibility matrix (declarative)
 */
import { RELEASE_CATALOG } from "./release.catalog";
import type {
  CompatibilityConstraint,
  CompatibilityConstraintManifest,
  CompatibilityMatrix,
  VersionPair,
  VersionPairManifest,
} from "./version.compatibility";
import { V70_VERSION_COMPATIBILITY_VERSION } from "./version.compatibility";

export const COMPATIBILITY_CONSTRAINT_CATALOG: CompatibilityConstraint[] = [
  {
    id: "DLV-CMP-CST-001",
    kind: "governance-freeze",
    minimum: "v68-platform-freeze-1",
    maximum: "v69-technical-governance-freeze-1",
    fallback: "v68-platform-freeze-1",
    required: true,
    description: "Governance freeze version range constraint",
  },
  {
    id: "DLV-CMP-CST-002",
    kind: "semver-range",
    minimum: "0.1.0",
    maximum: "0.2.0",
    fallback: "0.1.0",
    required: true,
    description: "Application semver compatibility range",
  },
  {
    id: "DLV-CMP-CST-003",
    kind: "api-contract",
    minimum: "0.1.0",
    maximum: "0.1.x",
    fallback: "0.1.0",
    required: true,
    description: "API contract patch-line constraint",
  },
  {
    id: "DLV-CMP-CST-004",
    kind: "dependency-order",
    minimum: "DLV-NOD-002",
    maximum: "DLV-NOD-005",
    fallback: "DLV-NOD-001",
    required: true,
    description: "Release dependency order constraint",
  },
  {
    id: "DLV-CMP-CST-005",
    kind: "channel-gate",
    minimum: "internal",
    maximum: "stable",
    fallback: "beta",
    required: true,
    description: "Channel promotion gate constraint",
  },
  {
    id: "DLV-CMP-CST-006",
    kind: "semver-range",
    minimum: "0.1.0-rc.1",
    maximum: "0.1.0",
    fallback: "DLV-REL-003",
    required: true,
    description: "Staging candidate to production semver constraint",
  },
  {
    id: "DLV-CMP-CST-007",
    kind: "semver-range",
    minimum: "0.1.0-canary.1",
    maximum: "0.1.0-rc.1",
    fallback: "DLV-REL-006",
    required: true,
    description: "Canary to staging semver constraint",
  },
  {
    id: "DLV-CMP-CST-008",
    kind: "governance-freeze",
    minimum: "v70-release-catalog-1",
    maximum: "v70-release-policy-1",
    fallback: "v70-release-catalog-1",
    required: true,
    description: "V70 delivery layer version constraint",
  },
];

export const VERSION_PAIR_CATALOG: VersionPair[] = [
  {
    id: "DLV-VPX-001",
    sourceReleaseRef: "DLV-REL-002",
    targetReleaseRef: "DLV-REL-001",
    sourceVersion: "v68-platform-freeze-1",
    targetVersion: "v69-technical-governance-freeze-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v68-platform-freeze-1",
    maximum: "v69-technical-governance-freeze-1",
    constraint: "DLV-CMP-CST-001",
    fallback: "v68-platform-freeze-1",
    required: true,
    description: "Platform to technical governance compatibility",
  },
  {
    id: "DLV-VPX-002",
    sourceReleaseRef: "DLV-REL-001",
    targetReleaseRef: "DLV-REL-003",
    sourceVersion: "v69-technical-governance-freeze-1",
    targetVersion: "0.1.0",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "0.1.0",
    maximum: "0.2.0",
    constraint: "DLV-CMP-CST-002",
    fallback: "0.1.0",
    required: true,
    description: "Governance baseline to application runtime",
  },
  {
    id: "DLV-VPX-003",
    sourceReleaseRef: "DLV-REL-003",
    targetReleaseRef: "DLV-REL-004",
    sourceVersion: "0.1.0",
    targetVersion: "0.1.0",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "0.1.0",
    maximum: "0.1.x",
    constraint: "DLV-CMP-CST-003",
    fallback: "0.1.0",
    required: true,
    description: "Application to API surface compatibility",
  },
  {
    id: "DLV-VPX-004",
    sourceReleaseRef: "DLV-REL-003",
    targetReleaseRef: "DLV-REL-008",
    sourceVersion: "0.1.0",
    targetVersion: "0.0.9",
    compatible: false,
    incompatible: true,
    deprecated: true,
    supported: false,
    minimum: "0.0.9",
    maximum: "0.0.9",
    constraint: "DLV-CMP-CST-002",
    fallback: "DLV-REL-008",
    required: true,
    description: "Legacy portal deprecated incompatible pair",
  },
  {
    id: "DLV-VPX-005",
    sourceReleaseRef: "DLV-REL-003",
    targetReleaseRef: "DLV-REL-006",
    sourceVersion: "0.1.0",
    targetVersion: "0.1.0-rc.1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "0.1.0-rc.1",
    maximum: "0.1.0",
    constraint: "DLV-CMP-CST-006",
    fallback: "DLV-REL-003",
    required: true,
    description: "Staging candidate to production compatibility",
  },
  {
    id: "DLV-VPX-006",
    sourceReleaseRef: "DLV-REL-006",
    targetReleaseRef: "DLV-REL-007",
    sourceVersion: "0.1.0-rc.1",
    targetVersion: "0.1.0-canary.1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "0.1.0-canary.1",
    maximum: "0.1.0-rc.1",
    constraint: "DLV-CMP-CST-007",
    fallback: "DLV-REL-006",
    required: true,
    description: "Canary to staging compatibility",
  },
  {
    id: "DLV-VPX-007",
    sourceReleaseRef: "DLV-REL-001",
    targetReleaseRef: "DLV-REL-005",
    sourceVersion: "v69-technical-governance-freeze-1",
    targetVersion: "v70-release-catalog-1",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "v70-release-catalog-1",
    maximum: "v70-release-policy-1",
    constraint: "DLV-CMP-CST-008",
    fallback: "v70-release-catalog-1",
    required: true,
    description: "Governance to delivery lifecycle compatibility",
  },
  {
    id: "DLV-VPX-008",
    sourceReleaseRef: "DLV-REL-005",
    targetReleaseRef: "DLV-REL-003",
    sourceVersion: "v70-release-catalog-1",
    targetVersion: "0.1.0",
    compatible: true,
    incompatible: false,
    deprecated: false,
    supported: true,
    minimum: "internal",
    maximum: "stable",
    constraint: "DLV-CMP-CST-005",
    fallback: "beta",
    required: true,
    description: "Delivery foundation to application channel gate",
  },
];

export function isVersionCompatibilityRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const constraintIds = new Set(COMPATIBILITY_CONSTRAINT_CATALOG.map((c) => c.id));

  const pairsAligned = VERSION_PAIR_CATALOG.every(
    (p) =>
      releaseIds.has(p.sourceReleaseRef) &&
      releaseIds.has(p.targetReleaseRef) &&
      constraintIds.has(p.constraint),
  );

  const coverageComplete =
    VERSION_PAIR_CATALOG.length >= 6 &&
    COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6 &&
    VERSION_PAIR_CATALOG.every((p) => p.fallback.length > 0);

  return pairsAligned && coverageComplete;
}

export function buildVersionPairManifest(): VersionPairManifest {
  const pairs = VERSION_PAIR_CATALOG;
  const catalogComplete = pairs.length >= 6;

  return {
    version: V70_VERSION_COMPATIBILITY_VERSION,
    pairCount: pairs.length,
    catalogComplete,
    pairs,
    summary: [
      `version-pairs count=${pairs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCompatibilityConstraintManifest(): CompatibilityConstraintManifest {
  const constraints = COMPATIBILITY_CONSTRAINT_CATALOG;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete = constraints.length >= 6 && kinds.size >= 4;

  return {
    version: V70_VERSION_COMPATIBILITY_VERSION,
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
  const pairs = VERSION_PAIR_CATALOG;
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
    version: V70_VERSION_COMPATIBILITY_VERSION,
    rowCount: pairs.length,
    compatibleCount,
    incompatibleCount,
    deprecatedCount,
    supportedCount,
    matrixComplete,
    pairs,
    summary: [
      `compatibility-matrix rows=${pairs.length}`,
      `compatible=${compatibleCount}`,
      `incompatible=${incompatibleCount}`,
      `deprecated=${deprecatedCount}`,
      `supported=${supportedCount}`,
      `complete=${matrixComplete}`,
    ].join(" "),
  };
}

export function getVersionPairById(id: string): VersionPair | undefined {
  return VERSION_PAIR_CATALOG.find((p) => p.id === id);
}

export function getVersionPairsBySourceRef(sourceReleaseRef: string): VersionPair[] {
  return VERSION_PAIR_CATALOG.filter((p) => p.sourceReleaseRef === sourceReleaseRef);
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
