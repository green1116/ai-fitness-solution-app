/**
 * V69 P4 — Naming standard catalog (declarative)
 */
import type { NamingStandardEntry, NamingStandardManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const NAMING_STANDARD_CATALOG: NamingStandardEntry[] = [
  {
    id: "TSTD-NAM-001",
    target: "governance_artifact_id",
    pattern: "{PREFIX}-{KIND}-{NNN}",
    example: "ARC-DEF-001",
    enforceLevel: "required",
    required: true,
    description: "Architecture and governance artifact IDs",
  },
  {
    id: "TSTD-NAM-002",
    target: "governance_version_token",
    pattern: "v{NN}-{-domain-}-{N}",
    example: "v69-architecture-catalog-1",
    enforceLevel: "required",
    required: true,
    description: "Phase version constant naming",
  },
  {
    id: "TSTD-NAM-003",
    target: "catalog_file",
    pattern: "{domain}.{facet}.catalog.ts",
    example: "dependency.edge.catalog.ts",
    enforceLevel: "required",
    required: true,
    description: "Catalog file dotted segment naming",
  },
  {
    id: "TSTD-NAM-004",
    target: "verify_script",
    pattern: "verify-v{NN}-p{N}-{slug}.ts",
    example: "verify-v69-p1-architecture-catalog.ts",
    enforceLevel: "required",
    required: true,
    description: "Verify script file naming",
  },
  {
    id: "TSTD-NAM-005",
    target: "npm_verify_script",
    pattern: "verify:v{NN}-p{N}-{slug}",
    example: "verify:v69-p4-technical-standards",
    enforceLevel: "required",
    required: true,
    description: "package.json verify script naming",
  },
  {
    id: "TSTD-NAM-006",
    target: "freeze_lock_constant",
    pattern: "V{NN}_{DOMAIN}_FREEZE_LOCK",
    example: "V69_CODE_GOVERNANCE_FREEZE_LOCK",
    enforceLevel: "required",
    required: true,
    description: "Freeze lock export naming",
  },
  {
    id: "TSTD-NAM-007",
    target: "rollback_index_entry",
    pattern: "{PREFIX}-{LAYER}",
    example: "CGR-P3",
    enforceLevel: "required",
    required: true,
    description: "Rollback index entry ID naming",
  },
  {
    id: "TSTD-NAM-008",
    target: "documentation_file",
    pattern: "V{NN}-{DOMAIN-SLUG}.md",
    example: "V69-TECHNICAL-STANDARDS.md",
    enforceLevel: "required",
    required: true,
    description: "Phase documentation file naming",
  },
];

export function buildNamingStandardManifest(): NamingStandardManifest {
  const standards = NAMING_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `naming-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getNamingStandardById(id: string): NamingStandardEntry | undefined {
  return NAMING_STANDARD_CATALOG.find((s) => s.id === id);
}
