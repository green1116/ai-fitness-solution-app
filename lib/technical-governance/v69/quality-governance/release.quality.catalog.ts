/**
 * V69 P6 — Release quality requirement catalog (declarative)
 */
import type { ReleaseQualityEntry, ReleaseQualityManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const RELEASE_QUALITY_CATALOG: ReleaseQualityEntry[] = [
  {
    id: "QGOV-REL-001",
    qualityGateRef: "QGOV-GATE-001",
    releaseStage: "architecture-catalog-freeze",
    readinessScore: 100,
    required: true,
    description: "P1 release requires catalog ready",
  },
  {
    id: "QGOV-REL-002",
    qualityGateRef: "QGOV-GATE-002",
    releaseStage: "dependency-graph-freeze",
    readinessScore: 100,
    required: true,
    description: "P2 release requires graph ready",
  },
  {
    id: "QGOV-REL-003",
    qualityGateRef: "QGOV-GATE-003",
    releaseStage: "code-governance-freeze",
    readinessScore: 100,
    required: true,
    description: "P3 release requires governance ready",
  },
  {
    id: "QGOV-REL-004",
    qualityGateRef: "QGOV-GATE-004",
    releaseStage: "technical-standards-freeze",
    readinessScore: 100,
    required: true,
    description: "P4 release requires standards ready",
  },
  {
    id: "QGOV-REL-005",
    qualityGateRef: "QGOV-GATE-005",
    releaseStage: "security-governance-freeze",
    readinessScore: 100,
    required: true,
    description: "P5 release requires security ready",
  },
  {
    id: "QGOV-REL-006",
    qualityGateRef: "QGOV-GATE-006",
    releaseStage: "compile-gate",
    readinessScore: 100,
    required: true,
    description: "Compile gate before any release",
  },
  {
    id: "QGOV-REL-007",
    qualityGateRef: "QGOV-GATE-007",
    releaseStage: "alignment-gate",
    readinessScore: 100,
    required: true,
    description: "Alignment gate before freeze",
  },
  {
    id: "QGOV-REL-008",
    qualityGateRef: "QGOV-GATE-008",
    releaseStage: "quality-governance-freeze",
    readinessScore: 100,
    required: true,
    description: "P6 release requires quality governance ready",
  },
];

export function buildReleaseQualityManifest(): ReleaseQualityManifest {
  const requirements = RELEASE_QUALITY_CATALOG;
  const catalogComplete = requirements.length >= 6;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: requirements.length,
    catalogComplete,
    requirements,
    summary: [
      `release-quality count=${requirements.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getReleaseQualityByGateRef(
  qualityGateRef: string,
): ReleaseQualityEntry | undefined {
  return RELEASE_QUALITY_CATALOG.find((r) => r.qualityGateRef === qualityGateRef);
}
