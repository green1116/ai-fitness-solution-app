/**
 * V69 P4 — Version standard catalog (declarative)
 */
import type { VersionStandardEntry, VersionStandardManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const VERSION_STANDARD_CATALOG: VersionStandardEntry[] = [
  {
    id: "TSTD-VER-001",
    artifactKind: "phase_module",
    versionPattern: "v69-{domain}-{N}",
    bumpRule: "increment-N-on-breaking-governance-change",
    enforceLevel: "required",
    required: true,
    description: "Per-phase governance module version",
  },
  {
    id: "TSTD-VER-002",
    artifactKind: "phase_freeze",
    versionPattern: "v69-{domain}-freeze-{N}",
    bumpRule: "increment-N-on-freeze-manifest-change",
    enforceLevel: "required",
    required: true,
    description: "Per-phase freeze version token",
  },
  {
    id: "TSTD-VER-003",
    artifactKind: "upstream_lock",
    versionPattern: "pinned-to-frozen-upstream",
    bumpRule: "never-mutate-frozen-upstream-version",
    enforceLevel: "required",
    required: true,
    description: "Upstream version lock must reference frozen layers",
  },
  {
    id: "TSTD-VER-004",
    artifactKind: "catalog_manifest",
    versionPattern: "matches-phase_module-version",
    bumpRule: "sync-with-phase_module",
    enforceLevel: "required",
    required: true,
    description: "Catalog manifest version matches phase module",
  },
  {
    id: "TSTD-VER-005",
    artifactKind: "registry_index",
    versionPattern: "matches-phase_module-version",
    bumpRule: "sync-with-phase_module",
    enforceLevel: "required",
    required: true,
    description: "Registry index version matches phase module",
  },
  {
    id: "TSTD-VER-006",
    artifactKind: "report_builder",
    versionPattern: "matches-phase_module-version",
    bumpRule: "sync-with-phase_module",
    enforceLevel: "required",
    required: true,
    description: "Governance report version field",
  },
  {
    id: "TSTD-VER-007",
    artifactKind: "rollback_index",
    versionPattern: "matches-phase_freeze-version",
    bumpRule: "sync-with-phase_freeze",
    enforceLevel: "required",
    required: true,
    description: "Rollback index version token",
  },
  {
    id: "TSTD-VER-008",
    artifactKind: "readiness_score",
    versionPattern: "0|100",
    bumpRule: "100-when-all-catalogs-complete",
    enforceLevel: "required",
    required: true,
    description: "Readiness score binary completion standard",
  },
];

export function buildVersionStandardManifest(): VersionStandardManifest {
  const standards = VERSION_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `version-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getVersionStandardById(id: string): VersionStandardEntry | undefined {
  return VERSION_STANDARD_CATALOG.find((s) => s.id === id);
}
